import { fold } from "./util.js";
import { Chocolate, Coffee, DelValle, MenuItem, Pupusa, Soda, Tea } from "./MenuItem.js";

export class Menu {
  private items = new Map<string, MenuItem>();
  constructor(items: MenuItem[] = []) { items.forEach((i) => this.items.set(i.id, i)); }

  all(): MenuItem[] { return [...this.items.values()]; }
  groups(): string[] { return [...new Set(this.all().map((i) => i.group))]; }
  inGroup(g: string): MenuItem[] { return this.all().filter((i) => i.group === g); }

  static default(): Menu {
    const a = (f: string, p: number) => new Pupusa("arroz", f, p);
    const m = (f: string, p: number) => new Pupusa("maiz", f, p);
    return new Menu([
      a("R", 1.2), a("FQ", 1.2), a("Q", 1.25),
      m("R", 1.2), m("FQ", 1.2), m("Q", 1.25),
      a("CQ", 1.4), a("C", 1.4), a("AQ", 1.4),
      m("CQ", 1.4), m("C", 1.4), m("AQ", 1.4),
      a("CQ", 1.4), a("F", 1.0), a("QJ", 1.4),
      m("CQ", 1.4), m("F", 1.0), m("QJ", 1.4),
      a("QL", 1.4),
      m("QL", 1.4),
      a("Loca", 5),
      m("Loca", 5),
      new Coffee(),
      new Chocolate(),
      new Soda("cocacola", "Coca Cola"),
      new Soda("cremasoda", "Cremasoda"),
      new Soda("uva", "Uva"),
      new Soda("sprite", "Sprite"),
      new Tea("teliptondurazno", "TL Durazno"),
      new Tea("teliptonlimon", "TL Limón"),
      new Tea("teliptonframbuesa", "TL Frambuesa"),
      new DelValle("delvallemandarina", "DV Mandarina"),
      new DelValle("delvallenaranja", "DV Naranja"),
    ]);
  }
}
