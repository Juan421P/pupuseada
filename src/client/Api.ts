import type { Ledger, LedgerData } from "../domain/Ledger.js";

export class Api {
  async load(): Promise<LedgerData> {
    const r = await fetch("/api/ledger");
    if (!r.ok) throw new Error("No se pudo cargar");
    return r.json();
  }

  async save(ledger: Ledger, password: string): Promise<Response> {
    return fetch("/api/ledger", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify(ledger.toJSON()),
    });
  }

  async uploadPhoto(
    personId: string,
    file: File,
    password: string,
  ): Promise<string> {
    const r = await fetch(`/api/photo/${personId}`, {
      method: "POST",
      headers: {
        "Content-Type": file.type,
        "x-admin-password": password,
      },
      body: file,
    });

    if (!r.ok) throw new Error(await r.text());
    return (await r.json()).url;
  }
}