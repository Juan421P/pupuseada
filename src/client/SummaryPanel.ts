import type { Ledger } from "../domain/Ledger.js";
import { esc, money } from "./format.js";

type Row = [string, string | number];

export class SummaryPanel {
  constructor(private root: HTMLElement, private ledger: Ledger) {}

  render(): void {
    const l = this.ledger;
    const groups = l.menu.groups().map((g) => {
      const rows: Row[] = l.menu.inGroup(g).map((i): Row => [esc(i.label), l.itemTotal(i.id)]);
      rows.push(["<b>Total</b>", `<b>${l.groupTotal(g)}</b>`]);
      return this.table(g, rows);
    });
    groups.push(this.table("Dinero", [
      ["Total en efectivo", money(l.cash)],
      ["Total por transferencia", money(l.transfer)],
      ["<b>Total de dinero recibido</b>", `<b>${money(l.received)}</b>`],
      ["Total a pagar (todos)", money(l.due)],
      ["Por cobrar", money(l.due - l.received)],
    ]));
    this.root.innerHTML = groups.join("");
  }

  private table(title: string, rows: Row[]): string {
    return `<table><caption>${title}</caption>${rows.map(([a, b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join("")}</table>`;
  }
}
