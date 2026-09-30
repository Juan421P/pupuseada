import type { Ledger } from "../domain/Ledger.js";
import { Person } from "../domain/Person.js";
import { fold } from "../domain/util.js";
import type { Api } from "./Api.js";
import { PersonEditor } from "./PersonEditor.js";
import { PersonList } from "./PersonList.js";
import { SummaryPanel } from "./SummaryPanel.js";

export class App {
  private list: PersonList;
  private summary: SummaryPanel;
  private editor: PersonEditor;
  private query = "";
  private filter = "all";

  constructor(private ledger: Ledger, private api: Api) {
    const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
    this.list = new PersonList($("people"), ledger, (p) => this.editor.open(p));
    this.summary = new SummaryPanel($("summary"), ledger);
    this.editor = new PersonEditor(
      $<HTMLDialogElement>("editor"), ledger, api,
      (p, isNew) => { if (isNew) ledger.add(p); this.changed(); },
      (p) => { ledger.remove(p.id); this.changed(); },
      () => this.changed(),
    );

    $("q").addEventListener("input", (e) => { this.query = fold((e.target as HTMLInputElement).value); this.render(); });
    $("f").addEventListener("change", (e) => { this.filter = (e.target as HTMLSelectElement).value; this.render(); });
    $("add").addEventListener("click", () => this.editor.open(new Person(), true));
    this.render();
  }

  private changed(): void { this.api.scheduleSave(this.ledger); this.render(); }

  private render(): void {
    const l = this.ledger;
    document.getElementById("stats")!.innerHTML =
      `<span class="pill paid">Pagados ${l.countByStatus("paid")}</span>` +
      `<span class="pill pending">Pendientes ${l.countByStatus("pending")}</span>` +
      `<span class="pill">Sin pedido ${l.countByStatus("none")}</span>`;
    this.list.render(this.query, this.filter);
    this.summary.render();
  }
}
