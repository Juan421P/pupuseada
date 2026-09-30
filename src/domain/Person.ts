import type { Menu } from "./Menu.js";
import { Order } from "./Order.js";
import { Payment } from "./Payment.js";
import { cents } from "./util.js";

/** none = no order & no payment; paid = green; pending = red (same rule as the worksheet). */
export type Status = "none" | "paid" | "pending";

export interface PersonData {
  id: string; firstName: string; lastName: string; arnb: boolean; photo: string;
  order: Record<string, number>; cash: number; transfer: number;
}

export class Person {
  private static seq = 0;
  readonly order = new Order();
  readonly payment = new Payment();
  constructor(
    public firstName = "", public lastName = "", public arnb = false, public photo = "",
    readonly id: string = `p${Date.now().toString(36)}${Person.seq++}`,
  ) {}

  get fullName(): string { return `${this.firstName} ${this.lastName}`.trim() || "(sin nombre)"; }
  get initials(): string { return ((this.firstName[0] ?? "") + (this.lastName[0] ?? "")).toUpperCase() || "?"; }
  amountDue(menu: Menu): number { return this.order.total(menu); }

  status(menu: Menu): Status {
    const due = cents(this.amountDue(menu));
    if (cents(this.payment.received) !== due) return "pending";
    return due > 0 ? "paid" : "none";
  }

  toJSON(): PersonData {
    return {
      id: this.id, firstName: this.firstName, lastName: this.lastName, arnb: this.arnb, photo: this.photo,
      order: this.order.toJSON(), cash: this.payment.cash, transfer: this.payment.transfer,
    };
  }
  /** Overwrites this person's data (id is kept). Used to commit an edited draft. */
  apply(d: PersonData): void {
    this.firstName = d.firstName; this.lastName = d.lastName; this.arnb = d.arnb; this.photo = d.photo ?? "";
    this.order.load(d.order);
    this.payment.cash = d.cash || 0;
    this.payment.transfer = d.transfer || 0;
  }
  static fromJSON(d: PersonData): Person {
    const p = new Person(d.firstName, d.lastName, d.arnb, d.photo ?? "", d.id);
    for (const k in d.order) p.order.set(k, d.order[k]);
    p.payment.cash = d.cash || 0;
    p.payment.transfer = d.transfer || 0;
    return p;
  }
}
