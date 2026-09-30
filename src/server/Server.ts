import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import type { LedgerData } from "../domain/Ledger.js";
import { Menu } from "../domain/Menu.js";
import { Seed } from "../domain/Seed.js";
import type { Repository } from "./Repository.js";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export class Server {
  constructor(
    private repo: Repository,
    private publicDir: string,
    private distDir: string,
    private port: number,
  ) { }

  start(): void {
    createServer((req, res) => {
      this.route(req, res).catch((e) => {
        console.error(e);
        this.send(res, 500, "Error interno");
      });
    }).listen(this.port, () => console.log(`La última pupuseada → http://localhost:${this.port}`));
  }

  private async route(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const path = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
    const method = req.method ?? "GET";

    if (path === "/api/ledger" && method === "GET") {
      let data = await this.repo.loadLedger();
      if (!data) {
        data = Seed.build(Menu.default()).toJSON();
        await this.repo.saveLedger(data);
      }
      return this.send(res, 200, JSON.stringify(data), "application/json");
    }

    if (path === "/api/ledger" && method === "PUT") {
      if (!this.authorized(req)) return this.send(res, 401, "No autorizado");

      const data = JSON.parse((await this.body(req, 5_000_000)).toString()) as LedgerData;
      if (!Array.isArray(data.people)) return this.send(res, 400, "Datos inválidos");

      await this.repo.saveLedger(data);
      return this.send(res, 204, "");
    }

    const photo = path.match(/^\/api\/photo\/([\w-]+)$/);

    if (photo && method === "POST") {
      if (!this.authorized(req)) return this.send(res, 401, "No autorizado");

      const contentType = (req.headers["content-type"] ?? "").split(";")[0];
      const ext = IMAGE_EXT[contentType];

      if (!ext) return this.send(res, 415, "Formato de imagen no soportado");

      const url = await this.repo.savePhoto(
        photo[1],
        ext,
        contentType,
        await this.body(req, 10_000_000),
      );

      return this.send(res, 200, JSON.stringify({ url }), "application/json");
    }

    if (path === "/") return this.file(res, this.publicDir, "index.html");

    if (path.startsWith("/js/")) return this.file(res, this.distDir, path.slice(4));

    const photoFile = path.match(/^\/photos\/([\w\.-]+)$/);

    if (photoFile && method === "GET") {
      const photo = await this.repo.getPhoto(photoFile[1]);
      if (!photo) return this.send(res, 404, "No encontrado");

      return this.send(res, 200, photo.data, photo.contentType);
    }

    return this.file(res, this.publicDir, path.slice(1));
  }

  private authorized(req: IncomingMessage): boolean {
    const password = req.headers["x-admin-password"];
    return typeof password === "string" && password === process.env.ADMIN_PASSWORD;
  }

  private async file(res: ServerResponse, base: string, rel: string): Promise<void> {
    const full = resolve(join(base, rel));

    if (!full.startsWith(resolve(base) + sep)) {
      return this.send(res, 403, "Prohibido");
    }

    try {
      this.send(
        res,
        200,
        await readFile(full),
        MIME[extname(full)] ?? "application/octet-stream",
      );
    } catch {
      this.send(res, 404, "No encontrado");
    }
  }

  private send(
    res: ServerResponse,
    status: number,
    body: string | Buffer,
    type = "text/plain; charset=utf-8",
  ): void {
    res.writeHead(status, {
      "Content-Type": type,
      "Cache-Control": "no-cache",
    });
    res.end(body);
  }

  private body(req: IncomingMessage, limit: number): Promise<Buffer> {
    return new Promise((ok, fail) => {
      const chunks: Buffer[] = [];
      let size = 0;

      req.on("data", (c: Buffer) => {
        size += c.length;

        if (size > limit) {
          fail(new Error("Cuerpo demasiado grande"));
          req.destroy();
        } else {
          chunks.push(c);
        }
      });

      req.on("end", () => ok(Buffer.concat(chunks)));
      req.on("error", fail);
    });
  }
}