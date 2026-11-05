import { crearElement, modificarAtributs, Atributs } from "./elements.js";

/**
 * Crea una taula amb `files` x `columnes` cel·les.
 * @param atributs (opcional) Atributs de la taula.
 * @param dades (opcional) Matriu de text per inicialitzar les cel·les.
 */
export function crearTaula(
  files: number,
  columnes: number,
  atributs?: Atributs,
  dades?: string[][]
): HTMLTableElement {
  validarEnter(files, "files", 1);
  validarEnter(columnes, "columnes", 1);

  const taula = crearElement("table") as HTMLTableElement;
  if (atributs) modificarAtributs(taula, atributs);

  for (let f = 0; f < files; f++) {
    const fila = taula.insertRow(); // crea el <tbody> automàticament
    for (let c = 0; c < columnes; c++) fila.insertCell();
  }
  if (dades) omplirCelles(taula, dades);
  return taula;
}

/** Omple les cel·les amb una matriu de text (dades[fila][columna]). */
export function omplirCelles(taula: HTMLTableElement, dades: string[][]): void {
  validarTaula(taula);
  if (!Array.isArray(dades)) throw new Error("omplirCelles: dades ha de ser una matriu");
  dades.forEach((filaDades, f) => {
    if (f >= taula.rows.length) return;
    filaDades.forEach((valor, c) => {
      if (c < taula.rows[f].cells.length) taula.rows[f].cells[c].textContent = valor;
    });
  });
}

/** Omple una sola casella. */
export function omplirCasella(taula: HTMLTableElement, fila: number, columna: number, valor: string): void {
  validarTaula(taula);
  validarEnter(fila, "fila", 0, taula.rows.length - 1);
  validarEnter(columna, "columna", 0, taula.rows[fila].cells.length - 1);
  taula.rows[fila].cells[columna].textContent = valor;
}

/** Mou la columna `col` abans de la columna `ref`. */
export function moureColumnaAbans(taula: HTMLTableElement, col: number, ref: number): void {
  validarColumnes(taula, col, ref);
  if (col === ref) return;
  for (const fila of Array.from(taula.rows)) {
    const cel = fila.cells[col];
    fila.insertBefore(cel, fila.cells[ref]);
  }
}

/** Mou la columna `col` després de la columna `ref`. */
export function moureColumnaDespres(taula: HTMLTableElement, col: number, ref: number): void {
  validarColumnes(taula, col, ref);
  if (col === ref) return;
  for (const fila of Array.from(taula.rows)) {
    const cel = fila.cells[col];
    fila.cells[ref].after(cel);
  }
}

/** Mou la columna `col` a la primera posició. */
export function moureColumnaAlPrincipi(taula: HTMLTableElement, col: number): void {
  validarColumnes(taula, col, 0);
  for (const fila of Array.from(taula.rows)) {
    fila.insertBefore(fila.cells[col], fila.cells[0]);
  }
}

/** Mou la columna `col` a l'última posició. */
export function moureColumnaAlFinal(taula: HTMLTableElement, col: number): void {
  validarColumnes(taula, col, 0);
  for (const fila of Array.from(taula.rows)) {
    fila.append(fila.cells[col]);
  }
}

/** Afegeix una fila en la posició `pos` (-1 = al final). */
export function afegirFila(taula: HTMLTableElement, pos: number = -1): HTMLTableRowElement {
  validarTaula(taula);
  validarEnter(pos, "pos", -1, taula.rows.length);
  const columnes = taula.rows[0]?.cells.length ?? 1;
  const fila = taula.insertRow(pos);
  for (let c = 0; c < columnes; c++) fila.insertCell();
  return fila;
}

/** Afegeix una columna en la posició `pos` (-1 = al final). */
export function afegirColumna(taula: HTMLTableElement, pos: number = -1): void {
  validarTaula(taula);
  const max = taula.rows[0]?.cells.length ?? 0;
  validarEnter(pos, "pos", -1, max);
  for (const fila of Array.from(taula.rows)) fila.insertCell(pos);
}

/** Esborra la fila de la posició `pos`. */
export function esborrarFila(taula: HTMLTableElement, pos: number): void {
  validarTaula(taula);
  validarEnter(pos, "pos", 0, taula.rows.length - 1);
  taula.deleteRow(pos);
}

/** Esborra la columna de la posició `pos`. */
export function esborrarColumna(taula: HTMLTableElement, pos: number): void {
  validarTaula(taula);
  validarEnter(pos, "pos", 0, (taula.rows[0]?.cells.length ?? 0) - 1);
  for (const fila of Array.from(taula.rows)) fila.deleteCell(pos);
}

// ---------- validacions ----------
function validarTaula(taula: HTMLTableElement): void {
  if (!(taula instanceof HTMLTableElement))
    throw new Error("Cal passar una taula (HTMLTableElement)");
}

function validarEnter(valor: number, nom: string, min: number, max: number = Infinity): void {
  if (!Number.isInteger(valor) || valor < min || valor > max)
    throw new Error(`"${nom}" ha de ser un enter entre ${min} i ${max}`);
}

function validarColumnes(taula: HTMLTableElement, a: number, b: number): void {
  validarTaula(taula);
  const max = (taula.rows[0]?.cells.length ?? 0) - 1;
  validarEnter(a, "columna", 0, max);
  validarEnter(b, "columna de referència", 0, max);
}