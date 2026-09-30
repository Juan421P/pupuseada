import type { Ledger } from "../domain/Ledger.js";
import { Person } from "../domain/Person.js";
import { Avatar } from "./Avatar.js";
import type { Api } from "./Api.js";
import { esc, money } from "./format.js";

/**
 * Edits a draft copy of a person. Nothing touches the real data until "Guardar";
 * closing the dialog any other way (Cancelar, Esc, click outside) scratches the draft.
 */
export class PersonEditor {
  private original: Person | null = null;
  private draft: Person | null = null;
  private isNew = false;
  private downOutside = false;
  private pendingPhoto: File | null = null;

  constructor(
    private dlg: HTMLDialogElement, private ledger: Ledger, private api: Api,
    private onSave: (
      original: Person,
      draft: Person,
      isNew: boolean,
      password: string,
      photo: File | null,
    ) => Promise<boolean>,
    private onDelete: (p: Person, password: string) => void,
    private onMenuChange: () => void,
  ) {
    dlg.addEventListener("input", (e) => this.onInput(e.target as HTMLInputElement));
    dlg.addEventListener("change", (e) => {
      const t = e.target as HTMLInputElement;
      if (t.type === "file" && t.files?.[0]) void this.upload(t.files[0]);
    });
    dlg.addEventListener("mousedown", (e) => { this.downOutside = this.outside(e); });
    dlg.addEventListener("click", (e) => {
      if (this.downOutside && this.outside(e)) dlg.close(); // click on the backdrop → scratch
      else this.onClick(e.target as HTMLElement);
      this.downOutside = false;
    });
    dlg.addEventListener("close", () => { this.original = this.draft = null; });
  }

  open(p: Person, isNew = false): void {
    this.original = p;
    this.isNew = isNew;
    this.pendingPhoto = null;
    this.draft = Person.fromJSON(p.toJSON());
    this.draw(this.draft);
    this.dlg.showModal();
  }

  private outside(e: MouseEvent): boolean {
    const r = this.dlg.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  }

  private draw(p: Person): void {
    const { menu } = this.ledger;
    const sets = menu.groups().map((g) => {
      const inputs = menu.inGroup(g).map((i) =>
        `<label>${esc(i.label)} <small>${money(i.price)}</small>
          <input type="number" min="0" step="1" inputmode="numeric" data-k="q:${i.id}" value="${p.order.get(i.id) || ""}"></label>`).join("");
      return `<fieldset><legend>${g}</legend><div class="qgrid">${inputs}</div></fieldset>`;
    }).join("");
    this.dlg.innerHTML = `<div class="sheet">
      <div class="side">
        <div class="ehead">
          <div id="prev">${Avatar.html(p, "big")}</div>
          <label class="btn">Foto de ref<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden></label>
        </div>
        <label>Nombres<input data-k="first" value="${esc(p.firstName)}"></label>
        <label>Apellidos<input data-k="last" value="${esc(p.lastName)}"></label>
        <label class="chk"><input type="checkbox" data-k="arnb" ${p.arnb ? "checked" : ""}> ARNB</label>
        <fieldset><legend>Pagos</legend><div class="qgrid two">
          <label>Efectivo<input type="number" min="0" step="0.01" inputmode="decimal" data-k="cash" value="${p.payment.cash || ""}"></label>
          <label>Transferencia<input type="number" min="0" step="0.01" inputmode="decimal" data-k="transfer" value="${p.payment.transfer || ""}"></label>
        </div></fieldset>
        <div id="estat" class="estat"></div>
        <div class="actions">
          ${this.isNew ? "" : `<button type="button" data-act="del" class="danger">Eliminar</button>`}
          <span class="grow"></span>
          <button type="button" data-act="cancel">Cancelar</button>
          <button type="button" data-act="save" class="primary">Guardar</button>
        </div>
      </div>
      <div class="menu">${sets}</div>
    </div>`;
    this.refreshStatus();
  }

  private onInput(el: HTMLInputElement): void {
    const p = this.draft, k = el.dataset.k;
    if (!p || !k) return;
    const num = Math.max(0, parseFloat(el.value) || 0);
    if (k === "first") p.firstName = el.value;
    else if (k === "last") p.lastName = el.value;
    else if (k === "arnb") p.arnb = el.checked;
    else if (k === "cash") p.payment.cash = num;
    else if (k === "transfer") p.payment.transfer = num;
    else if (k.startsWith("q:")) p.order.set(k.slice(2), num);
    this.refreshStatus();
  }

  private async onClick(el: HTMLElement): Promise<void> {
    const act = el.closest<HTMLElement>("[data-act]")?.dataset.act;
    const orig = this.original, draft = this.draft;
    if (!orig || !draft) return;
    if (act === "cancel") this.dlg.close();
    else if (act === "save") {
      const password = window.prompt("Contraseña:");
      if (password === null) return;
      const success = await this.onSave(
        orig,
        draft,
        this.isNew,
        password,
        this.pendingPhoto,
      );
      if (success) this.dlg.close();
    } else if (act === "del") {
      const password = window.prompt("Contraseña:");
      if (password === null) return;
      this.onDelete(orig, password);
      this.dlg.close();
    }
  }

  private upload(file: File): void {
    this.pendingPhoto = file;
    const url = URL.createObjectURL(file);
    this.dlg.querySelector("#prev")!.innerHTML = `<img src="${url}" alt="">`;
  }

  private refreshStatus(): void {
    const p = this.draft, box = this.dlg.querySelector<HTMLElement>("#estat");
    if (!p || !box) return;
    const { menu } = this.ledger;
    box.className = `estat ${p.status(menu)}`;
    box.innerHTML = `Total a pagar <b>${money(p.amountDue(menu))}</b><br>Pagado <b>${money(p.payment.received)}</b> · ${p.order.pupusaCount(menu)} pupusas`;
  }
}
