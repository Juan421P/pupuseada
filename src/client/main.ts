import { Ledger } from "../domain/Ledger.js";
import { Menu } from "../domain/Menu.js";
import { Api } from "./Api.js";
import { App } from "./App.js";

const api = new Api();
new App(Ledger.fromJSON(Menu.default(), await api.load()), api);
