import type { Menu } from "./Menu.js";
import { Person, type PersonData, type Status } from "./Person.js";

export interface LedgerData { people: PersonData[]; sodas: string[]; }

export class Ledger {
  readonly people: Person[] = [];
  constructor(readonly menu: Menu) { }

  add(p: Person): Person { this.people.push(p); return p; }
  remove(id: string): void {
    const i = this.people.findIndex((p) => p.id === id);
    if (i >= 0) this.people.splice(i, 1);
  }
  find(id: string): Person | undefined { return this.people.find((p) => p.id === id); }

  private sum(f: (p: Person) => number): number { return this.people.reduce((s, p) => s + f(p), 0); }
  itemTotal(id: string): number { return this.sum((p) => p.order.get(id)); }
  groupTotal(g: string): number { return this.menu.inGroup(g).reduce((s, i) => s + this.itemTotal(i.id), 0); }
  get cash(): number { return this.sum((p) => p.payment.cash); }
  get transfer(): number { return this.sum((p) => p.payment.transfer); }
  get received(): number { return this.cash + this.transfer; }
  get due(): number { return this.sum((p) => p.amountDue(this.menu)); }
  countByStatus(s: Status): number { return this.people.filter((p) => p.status(this.menu) === s).length; }

  toJSON(): LedgerData { return { people: this.people.map((p) => p.toJSON()), sodas: [] }; }
  static fromJSON(menu: Menu, d: LedgerData): Ledger {
    const l = new Ledger(menu);
    d.people.forEach((p) => l.add(Person.fromJSON(p)));
    return l;
  }
}
