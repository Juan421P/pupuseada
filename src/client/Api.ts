import type { Ledger, LedgerData } from "../domain/Ledger.js";

/** Talks to the Node server. Ledger saves are debounced. */
export class Api {
  private timer: number | undefined;

  async load(): Promise<LedgerData> {
    const r = await fetch("/api/ledger");
    if (!r.ok) throw new Error("No se pudo cargar");
    return r.json();
  }
  scheduleSave(ledger: Ledger): void {
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => void this.save(ledger), 300);
  }
  private save(ledger: Ledger): Promise<Response> {
    return fetch("/api/ledger", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ledger.toJSON()) });
  }
  async uploadPhoto(personId: string, file: File): Promise<string> {
    const r = await fetch(`/api/photo/${personId}`, { method: "POST", headers: { "Content-Type": file.type }, body: file });
    if (!r.ok) throw new Error(await r.text());
    return (await r.json()).url;
  }
}
