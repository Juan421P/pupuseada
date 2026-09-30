export abstract class MenuItem {
  constructor(readonly id: string, readonly label: string, readonly price: number) { }
  abstract get group(): string;
}

export type Dough = "arroz" | "maiz";

export class Pupusa extends MenuItem {
  constructor(readonly dough: Dough, readonly flavor: string, price: number) {
    super(`${dough === "arroz" ? "A" : "M"}-${flavor}`, flavor, price);
  }
  get group(): string { return this.dough === "arroz" ? "Arroz" : "Maíz"; }
}

export abstract class Beverage extends MenuItem {
  get group(): string { return "Bebidas"; }
}

export class Coffee extends Beverage {
  static readonly PRICE = 0.50;
  constructor() { super("coffee", "Café", Coffee.PRICE); }
}

export class Chocolate extends Beverage {
  static readonly PRICE = 0.75;
  constructor() { super("chocolate", "Chocolate", Chocolate.PRICE); }
}

export class Soda extends Beverage {
  static readonly PRICE = 0.85;
  constructor(id: string, readonly flavor: string) { super(id, flavor, Soda.PRICE); }
}

export class Tea extends Beverage {
  static readonly PRICE = 1.50;
  constructor(id: string, readonly flavor: string) { super(id, flavor, Tea.PRICE) };
}

export class DelValle extends Beverage {
  static readonly PRICE = 0.85;
  constructor(id: string, readonly flavor: string) { super(id, flavor, DelValle.PRICE) };
}