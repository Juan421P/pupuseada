import type { Ledger } from "../domain/Ledger.js";
import type { Person } from "../domain/Person.js";
import { cents, fold } from "../domain/util.js";
import { Avatar } from "./Avatar.js";
import { esc, money } from "./format.js";

export type PersonSort =
  | "name"
  | "lastName"
  | "due"
  | "remaining";

export type PersonFilter =
  | "all"
  | "paid"
  | "pending"
  | "none";

export class PersonList {
  constructor(private root: HTMLElement, private ledger: Ledger, onSelect: (p: Person) => void) {
    root.addEventListener("click", (e) => {
      const id = (e.target as HTMLElement).closest<HTMLElement>("[data-id]")?.dataset.id;
      const p = id ? ledger.find(id) : undefined;
      if (p) onSelect(p);
    });
  }
  private compare(a: Person, b: Person, sort: PersonSort): number {
    const { menu } = this.ledger;
    if (sort === "name") {
      return fold(a.fullName).localeCompare(fold(b.fullName));
    }
    if (sort === "lastName") {
      return fold(a.lastName).localeCompare(fold(b.lastName));
    }
    if (sort === "due") {
      return b.amountDue(menu) - a.amountDue(menu);
    }
    const remainingA =
      cents(a.amountDue(menu)) - cents(a.payment.received);
    const remainingB =
      cents(b.amountDue(menu)) - cents(b.payment.received);
    return remainingB - remainingA;
  }

  render(query: string, filter: PersonFilter, sort: PersonSort): void {
    const { menu } = this.ledger;
    const q = fold(query);

    const rows = this.ledger.people
      .filter((p) => {
        if (filter !== "all" && p.status(menu) !== filter) return false;

        return fold(p.firstName).includes(q)
          || fold(p.lastName).includes(q)
          || fold(p.fullName).includes(q);
      })
      .sort((a, b) => this.compare(a, b, sort));

    this.root.innerHTML =
      rows.map((p) => this.card(p)).join("") ||
      `<p class="muted">Nadie coincide.</p>`;
  }

  private card(p: Person): string {
    const { menu } = this.ledger;
    const due = p.amountDue(menu), got = p.payment.received, diff = cents(due) - cents(got);
    const lines = p.order.lines(menu);
    const order = lines.length
      ? menu.groups().map((g) => {
        const ls = lines.filter((l) => l.item.group === g);
        return ls.length
          ? `<div class="grp"><span class="gname">${g}</span>${ls.map((l) => `<span class="chip">${l.qty}× ${esc(l.item.label)}</span>`).join("")}</div>`
          : "";
      }).join("")
      : `<p class="muted">Sin pedido</p>`;
    const pay = due > 0 || got > 0
      ? `Pagó <b>${money(got)}</b> <span class="muted">(efectivo ${money(p.payment.cash)} · transf. ${money(p.payment.transfer)})</span>` +
      (diff > 0 ? ` · <b>Falta ${money(diff / 100)}</b>` : diff < 0 ? ` · <b>Sobra ${money(-diff / 100)}</b>` : "")
      : "";
    return `<article class="person ${p.status(menu)}" data-id="${p.id}">
      ${Avatar.html(p)}
      <div class="body">
        <header><strong>${esc(p.fullName)}</strong>${p.arnb ? `<span class="tag">ARNB</span>` : ""}<span class="due">${money(due)}</span></header>
        ${order}<div class="pay">${pay}</div>
      </div></article>`;
  }
}
