import type { Menu } from "./Menu.js";
import { MenuItem, Pupusa } from "./MenuItem.js";

export interface OrderLine { item: MenuItem; qty: number; subtotal: number; }

export class Order {
  private qty = new Map<string, number>();
  get(id: string): number { return this.qty.get(id) ?? 0; }
  set(id: string, n: number): void {
    const v = Math.max(0, Math.floor(n) || 0);
    if (v) this.qty.set(id, v); else this.qty.delete(id);
  }
  lines(menu: Menu): OrderLine[] {
    return menu.all().filter((i) => this.get(i.id) > 0)
      .map((item) => ({ item, qty: this.get(item.id), subtotal: item.price * this.get(item.id) }));
  }
  total(menu: Menu): number { return this.lines(menu).reduce((s, l) => s + l.subtotal, 0); }
  pupusaCount(menu: Menu): number {
    return this.lines(menu).filter((l) => l.item instanceof Pupusa).reduce((s, l) => s + l.qty, 0);
  }
  load(o: Record<string, number>): void {
    this.qty.clear();
    for (const k in o) this.set(k, o[k]);
  }
  toJSON(): Record<string, number> { return Object.fromEntries(this.qty); }
  static fromJSON(o: Record<string, number>): Order {
    const x = new Order();
    x.load(o);
    return x;
  }
}
