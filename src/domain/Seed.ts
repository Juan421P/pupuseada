import { Ledger } from "./Ledger.js";
import type { Menu } from "./Menu.js";
import { Person } from "./Person.js";

/** Initial data copied from the original worksheet. */
export class Seed {
  // [nombres, apellidos, ARNB, pedido, efectivo, transferencia]
  private static readonly ORDERS: [string, string, boolean, Record<string, number>, number?, number?][] = [
    ["Diego Vladimir", "Gómez Escamilla", false, { "M-FQ": 8, coca: 2 }],
    ["Óscar Abel", "Velásquez Joyar", true, { "A-FQ": 3, "A-C": 3 }],
    ["Edwin Geovanny", "Alfaro Alfaro", true, { "M-R": 3, "M-FQ": 3, tl: 1 }],
    ["Carlos Andrés", "Sánchez Pérez", false, { "M-FQ": 4 }, 4.8],
    ["David Alejandro", "Guardado Guevara", false, { "A-FQ": 2, "A-AQ": 1, coca: 1 }],
    ["Juan Adolfo", "Portillo Sánchez", true, { "A-FQ": 3, cremasoda: 1 }, 4.45],
    ["Ivanya", "Nolazco Cabrera", false, { "A-R": 2, tl: 1 }, 0, 3.9],
    ["Cristian Josué", "Guardado Martínez", false, { "A-FQ": 3 }, 3.6],
    ["Daniela Elizabeth", "Villalta Sorto", false, { "A-R": 1, "A-Q": 1, cremasoda: 1 }, 3.3],
    ["Natalie Abigail", "Navarro Góchez", false, { "A-R": 1, "A-Q": 1, cremasoda: 1 }, 3.3],
    ["Lisseth Del Carmen", "Erazo Martínez", true, { "A-FQ": 2, valle: 1 }, 3.25],
    ["Gerardo Andrés", "Jovel Franco", true, { "M-F": 2 }],
  ];
  // Sin pedido todavía; "*" al final del apellido = ARNB
  private static readonly IDLE =
    "Adriana Marié;Zelaya Molina|Adriana Paola;Martínez Vásquez|Alejandro Eugenio;Reyes Mejía|Alejandro José;Molina Mejía|" +
    "Andrea Yazmín;Montepeque Juárez|Andreé Alessandro;Orellana Sandoval|Ángel Francisco;Orellana Reyes|Anthony Tyler;Hui Guevara|" +
    "Antonio José;Orantes Cortez|Benjamín Eduardo;Alvarenga Cabrera|Camila Belén;Gómez Lazo|Camila Mariana;Quinteros Gómez|" +
    "Daira Camila;Melara Miranda|Daniel Alejandro;Alvarado Tobar*|Darío Andrés;García Domínguez|David Josué;Rivera Avelar*|" +
    "Diego Josué;Rodríguez Alvarado|Emerson Francisco;Orellana Barrera*|Fátima Angelina;Martínez Palacios|Fátima Rocío;Escobar Cartagena|" +
    "Fernando Miguel;Velásquez Pérez|Francisco Samuel;García Cruz|Freddy Ricardo;Pérez Alvarenga|Frida Sofía;Caravantes Navarro|" +
    "Gabriel Andrés;Flores Clará|Gabriela Isabel;Castillo Mena|Gerson Enrique;Domínguez Alemán|Iris Margarita;Sánchez Orellana|" +
    "Iván Eliseo;Hernández Mauricio|Joshua Alfredo;Flores De León|Joshua Daniel;González Pérez|Julio Josué;Pérez Rodríguez|" +
    "Justin Javier;Rivas Rosales|Karla María;Calderón Ramírez|Katheryne Arely;Cuéllar Palma|Katya María;Almendares Ruíz|" +
    "Keny Valeria;Arévalo Méndez|Lia Marianela;Rodríguez Alfaro|Marcela Abigail;Chávez Álvarez|Marcos Alejandro;Torres Rodríguez|" +
    "Mario Alberto;Arteaga Siguenza|Mario Iván;Vásquez Cruz|Max Alexander;Jiménez Salguero|Max Josué;Argueta Guerra|" +
    "Salma Rebecca;Chicas Martínez|Sara María;Rivas Hernández|Steven Daniel;Ramírez Campos";

  static build(menu: Menu): Ledger {
    const ledger = new Ledger(menu);
    for (const [f, l, arnb, order, cash, transfer] of Seed.ORDERS) {
      const p = ledger.add(new Person(f, l, arnb));
      for (const id in order) p.order.set(id, order[id]);
      p.payment.cash = cash ?? 0;
      p.payment.transfer = transfer ?? 0;
    }
    for (const chunk of Seed.IDLE.split("|")) {
      const [f, l] = chunk.split(";");
      ledger.add(new Person(f, l.replace("*", ""), l.endsWith("*")));
    }
    return ledger;
  }
}
