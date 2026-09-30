import type { Person } from "../domain/Person.js";
import { esc } from "./format.js";

export class Avatar {
  static html(p: Person, size = ""): string {
    return p.photo
      ? `<img class="ava ${size}" src="${esc(p.photo)}" alt="">`
      : `<span class="ava ${size}">${esc(p.initials)}</span>`;
  }
}
