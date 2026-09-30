import type { Ledger } from "../domain/Ledger.js";
import { Person } from "../domain/Person.js";
import { fold } from "../domain/util.js";
import type { Api } from "./Api.js";
import { PersonEditor } from "./PersonEditor.js";
import { PersonFilter, PersonList, PersonSort } from "./PersonList.js";
import { SummaryPanel } from "./SummaryPanel.js";

export class App {
  private list: PersonList;
  private summary: SummaryPanel;
  private editor: PersonEditor;
  private query = "";
  private filter: PersonFilter = "all";
  private sort: PersonSort = "name";

  constructor(private ledger: Ledger, private api: Api) {
    const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

    this.list = new PersonList($("people"), ledger, (p) => this.editor.open(p));

    this.summary = new SummaryPanel($("summary"), ledger);

    this.editor = new PersonEditor(
      $("editor"),
      ledger,
      api,
      async (original, draft, isNew, password, photo) => {
        return this.changed(original, draft, isNew, password, photo);
      },
      (p, password) => {
        const deleted = Person.fromJSON(p.toJSON());
        ledger.remove(p.id);
        void this.changedDelete(password, deleted);
      },
      () => this.render(),
    );

    $("q").addEventListener("input", (e) => {
      this.query = fold((e.target as HTMLInputElement).value);
      this.render();
    });

    $("f").addEventListener("change", (e) => {
      this.filter = (e.target as HTMLSelectElement).value as PersonFilter;
      this.render();
    });

    $("sort").addEventListener("change", (e) => {
      this.sort = (e.target as HTMLSelectElement).value as PersonSort;
      this.render();
    });

    $("add").addEventListener("click", () => this.editor.open(new Person(), true));

    this.render();
  }

  private async changed(
    original: Person,
    draft: Person,
    isNew: boolean,
    password: string,
    photo: File | null,
  ): Promise<boolean> {
    try {
      if (photo) {
        draft.photo = await this.api.uploadPhoto(
          `${draft.id}-${Date.now().toString(36)}`,
          photo,
          password,
        );
      }

      if (isNew) {
        this.ledger.add(draft);
      } else {
        original.apply(draft.toJSON());
      }

      const response = await this.api.save(this.ledger, password);

      if (!response.ok) {
        throw new Error(await response.text());
      }

      this.render();
      return true;
    } catch {
      alert("No se pudo guardar. Verifica la contraseña.");
      return false;
    }
  }

  private async changedDelete(
    password: string,
    deleted: Person,
  ): Promise<void> {
    try {
      const response = await this.api.save(this.ledger, password);

      if (!response.ok) {
        throw new Error(await response.text());
      }

      this.render();
    } catch {
      this.ledger.add(deleted);
      this.render();
      alert("No se pudo eliminar. Verifica la contraseña.");
    }
  }

  private render(): void {
    const l = this.ledger;

    document.getElementById("stats")!.innerHTML =
      `<span class="pill paid">Pagados ${l.countByStatus("paid")}</span>` +
      `<span class="pill pending">Pendientes ${l.countByStatus("pending")}</span>` +
      `<span class="pill">Sin pedido ${l.countByStatus("none")}</span>`;

    this.list.render(this.query, this.filter, this.sort);
    this.summary.render();
  }
}