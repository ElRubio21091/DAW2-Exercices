import { crearElement, modificarAtributs } from "./elements.js";
import { crearTaula, moureColumnaAlFinal, moureColumnaAlPrincipi } from "./taules.js";

// Posicions de les "<" per fila (columnes 0..6)
const dibuix: number[][] = [[5, 6], [3, 4], [0, 1], [3, 4], [5, 6]];
const FILES = 5, COLUMNES = 7;

const dades: string[][] = Array.from({ length: FILES }, (_, f) =>
  Array.from({ length: COLUMNES }, (_, c) => (dibuix[f].includes(c) ? "<" : ""))
);

const taula = crearTaula(FILES, COLUMNES, { border: "1" }, dades);

const botoEsquerra = crearElement("button", "Esquerra");
const botoDreta = crearElement("button", "Dreta");
modificarAtributs(botoEsquerra, { type: "button" });
modificarAtributs(botoDreta, { type: "button" });

botoEsquerra.addEventListener("click", () => moureColumnaAlFinal(taula, 0));
botoDreta.addEventListener("click", () => moureColumnaAlPrincipi(taula, COLUMNES - 1));

document.body.append(taula, botoEsquerra, botoDreta);