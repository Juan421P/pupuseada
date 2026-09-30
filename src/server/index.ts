import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { Repository } from "./Repository.js";
import { Server } from "./Server.js";

const root = join(fileURLToPath(import.meta.url), "../../..");
const repo = new Repository();
await repo.init();
new Server(repo, join(root, "public"), join(root, "dist"), Number(process.env.PORT) || 3000).start();
