export class Payment {
  constructor(public cash = 0, public transfer = 0) {}
  get received(): number { return this.cash + this.transfer; }
}
