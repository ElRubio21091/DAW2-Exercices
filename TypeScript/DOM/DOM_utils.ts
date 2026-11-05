/* =====================================================================
 *  DOM-UTILS: col·lecció de funcions genèriques per a DOM (TypeScript)
 *  Imports entre fitxers: from "./dom-utils.js"   (amb .js!)
 * ===================================================================== */

export type Atributs = Record<string, string | number | boolean>;
export type Estils = Partial<CSSStyleDeclaration>;
export type Contingut = string | Node | (string | Node)[];

/* ---------------------------------------------------------------------
 *  0. VALIDACIONS (reutilitzables a totes les funcions)
 * ------------------------------------------------------------------- */

/** Llança error si `el` no és un HTMLElement. */
export function validarElement(el: unknown, nom = "element"): asserts el is HTMLElement {
  if (!(el instanceof HTMLElement))
    throw new Error(`"${nom}" ha de ser un element HTML`);
}

/** Llança error si `valor` no és un enter dins de [min, max]. */
export function validarEnter(valor: unknown, nom: string, min = 0, max = Infinity): asserts valor is number {
  if (typeof valor !== "number" || !Number.isInteger(valor) || valor < min || valor > max)
    throw new Error(`"${nom}" ha de ser un enter entre ${min} i ${max}`);
}

/** Llança error si `valor` no és un text (opcionalment no buit). */
export function validarText(valor: unknown, nom: string, noBuit = true): asserts valor is string {
  if (typeof valor !== "string" || (noBuit && valor.trim() === ""))
    throw new Error(`"${nom}" ha de ser un text${noBuit ? " no buit" : ""}`);
}

/** Llança error si `el` no és una taula. */
export function validarTaula(el: unknown): asserts el is HTMLTableElement {
  if (!(el instanceof HTMLTableElement))
    throw new Error("Cal passar una taula (HTMLTableElement)");
}

/* ---------------------------------------------------------------------
 *  1. SELECCIÓ
 * ------------------------------------------------------------------- */

/** Selecciona el primer element que coincideix amb el selector CSS. Error si no existeix. */
export function $<T extends HTMLElement = HTMLElement>(selector: string, arrel: ParentNode = document): T {
  validarText(selector, "selector");
  const el = arrel.querySelector<T>(selector);
  if (!el) throw new Error(`No s'ha trobat cap element amb el selector "${selector}"`);
  return el;
}

/** Selecciona tots els elements que coincideixen amb el selector, com a array real. */
export function $$<T extends HTMLElement = HTMLElement>(selector: string, arrel: ParentNode = document): T[] {
  validarText(selector, "selector");
  return Array.from(arrel.querySelectorAll<T>(selector));
}

/** Retorna els fills element d'un pare com a array (filtre opcional per etiqueta). */
export function fills(pare: HTMLElement, etiqueta?: string): HTMLElement[] {
  validarElement(pare, "pare");
  const llista = Array.from(pare.children) as HTMLElement[];
  return etiqueta ? llista.filter(f => f.tagName.toLowerCase() === etiqueta.toLowerCase()) : llista;
}

/** Posició (índex) d'un element dins del seu pare. */
export function posicio(el: HTMLElement): number {
  validarElement(el);
  if (!el.parentElement) throw new Error("L'element no té pare");
  return Array.from(el.parentElement.children).indexOf(el);
}

/* ---------------------------------------------------------------------
 *  2. CREACIÓ D'ELEMENTS
 * ------------------------------------------------------------------- */

/**
 * Crea un element HTML qualsevol.
 * @param etiqueta Nom de l'etiqueta ("p", "div", "span", "ul"...).
 * @param contingut (opcional) Text, node o array de textos/nodes.
 * @param atributs (opcional) Atributs a assignar, p. ex. { class: "x", id: "a" }.
 */
export function crearElement<K extends keyof HTMLElementTagNameMap>(
  etiqueta: K, contingut?: Contingut, atributs?: Atributs
): HTMLElementTagNameMap[K];
export function crearElement(etiqueta: string, contingut?: Contingut, atributs?: Atributs): HTMLElement;
export function crearElement(etiqueta: string, contingut: Contingut = "", atributs?: Atributs): HTMLElement {
  validarText(etiqueta, "etiqueta");
  const el = document.createElement(etiqueta);
  afegirContingut(el, contingut);
  if (atributs !== undefined) modificarAtributs(el, atributs);
  return el;
}

/** Afegeix text/node(s) al final d'un element (sense esborrar el que ja té). */
export function afegirContingut(el: HTMLElement, contingut: Contingut): void {
  validarElement(el);
  const llista = Array.isArray(contingut) ? contingut : [contingut];
  for (const c of llista) {
    if (typeof c === "string") el.append(document.createTextNode(c));
    else if (c instanceof Node) el.append(c);
    else throw new Error("El contingut ha de ser text o node");
  }
}

/** Substitueix tot el contingut d'un element. */
export function establirContingut(el: HTMLElement, contingut: Contingut): void {
  buidar(el);
  afegirContingut(el, contingut);
}

/** Crea una llista <ul>/<ol> a partir d'un array de textos o nodes. */
export function crearLlista(elements: Contingut[], ordenada = false, atributs?: Atributs): HTMLUListElement | HTMLOListElement {
  if (!Array.isArray(elements)) throw new Error("elements ha de ser un array");
  const llista = crearElement(ordenada ? "ol" : "ul", "", atributs);
  for (const e of elements) llista.append(crearElement("li", e));
  return llista;
}

/** Crea un <select> a partir d'un array de textos o de parells {valor, text}. */
export function crearSelect(opcions: (string | { valor: string; text: string })[], atributs?: Atributs): HTMLSelectElement {
  if (!Array.isArray(opcions)) throw new Error("opcions ha de ser un array");
  const sel = crearElement("select", "", atributs);
  for (const o of opcions) {
    const op = crearElement("option");
    if (typeof o === "string") { op.value = o; op.textContent = o; }
    else { op.value = o.valor; op.textContent = o.text; }
    sel.append(op);
  }
  return sel;
}

/** Crea un <input> d'un tipus donat (text, number, checkbox, radio...). */
export function crearInput(tipus: string, atributs?: Atributs): HTMLInputElement {
  validarText(tipus, "tipus");
  return crearElement("input", "", { type: tipus, ...atributs });
}

/** Crea un <label> amb un input associat. Retorna ambdós. */
export function crearCampEtiquetat(text: string, tipus: string, id: string): { label: HTMLLabelElement; input: HTMLInputElement } {
  const input = crearInput(tipus, { id, name: id });
  const label = crearElement("label", text, { for: id });
  return { label, input };
}

/** Crea una imatge. */
export function crearImatge(src: string, alt = "", atributs?: Atributs): HTMLImageElement {
  validarText(src, "src");
  return crearElement("img", "", { src, alt, ...atributs });
}

/** Crea un botó amb un text i, opcionalment, una funció per al clic. */
export function crearBoto(text: string, alClicar?: (ev: MouseEvent) => void, atributs?: Atributs): HTMLButtonElement {
  const b = crearElement("button", text, { type: "button", ...atributs });
  if (alClicar) b.addEventListener("click", alClicar);
  return b;
}

/** Crea un enllaç. */
export function crearEnllac(text: string, href: string, atributs?: Atributs): HTMLAnchorElement {
  validarText(href, "href");
  return crearElement("a", text, { href, ...atributs });
}

/** Crea un element a partir d'una cadena HTML (retorna el primer element). */
export function crearDeHTML(html: string): HTMLElement {
  validarText(html, "html");
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  const el = t.content.firstElementChild;
  if (!(el instanceof HTMLElement)) throw new Error("L'HTML no conté cap element");
  return el;
}

/** Clona un element (per defecte amb tots els fills). */
export function clonar<T extends HTMLElement>(el: T, profund = true): T {
  validarElement(el);
  return el.cloneNode(profund) as T;
}

/* ---------------------------------------------------------------------
 *  3. ATRIBUTS, CLASSES I ESTILS
 * ------------------------------------------------------------------- */

/** Assigna atributs a un element: { nom: valor }. Un valor `false` elimina l'atribut. */
export function modificarAtributs(el: HTMLElement, atributs: Atributs): void {
  validarElement(el);
  if (typeof atributs !== "object" || atributs === null)
    throw new Error("atributs ha de ser un objecte");
  for (const [nom, valor] of Object.entries(atributs)) {
    if (valor === false) el.removeAttribute(nom);
    else if (valor === true) el.setAttribute(nom, "");
    else el.setAttribute(nom, String(valor));
  }
}

/** Elimina un o diversos atributs. */
export function eliminarAtributs(el: HTMLElement, ...noms: string[]): void {
  validarElement(el);
  noms.forEach(n => el.removeAttribute(n));
}

/** Afegeix classes CSS. */
export function afegirClasses(el: HTMLElement, ...classes: string[]): void {
  validarElement(el);
  el.classList.add(...classes);
}

/** Treu classes CSS. */
export function treureClasses(el: HTMLElement, ...classes: string[]): void {
  validarElement(el);
  el.classList.remove(...classes);
}

/** Afegeix la classe si no la té, la treu si la té. Retorna si l'ha deixada posada. */
export function alternarClasse(el: HTMLElement, classe: string): boolean {
  validarElement(el);
  validarText(classe, "classe");
  return el.classList.toggle(classe);
}

/** Assigna estils CSS en línia: { backgroundColor: "red", width: "50px" }. */
export function assignarEstils(el: HTMLElement, estils: Estils): void {
  validarElement(el);
  Object.assign(el.style, estils);
}

/** Mostra o amaga un element (display). */
export function mostrar(el: HTMLElement, visible = true, displayVisible = ""): void {
  validarElement(el);
  el.style.display = visible ? displayVisible : "none";
}

/** Alterna la visibilitat d'un element. */
export function alternarVisibilitat(el: HTMLElement): void {
  validarElement(el);
  mostrar(el, el.style.display === "none");
}

/* ---------------------------------------------------------------------
 *  4. MOURE / INSERIR / ESBORRAR ELEMENTS
 * ------------------------------------------------------------------- */

/** Mou `el` just abans de `referencia`. */
export function moureAbans(el: HTMLElement, referencia: HTMLElement): void {
  validarMoviment(el, referencia);
  referencia.before(el);
}

/** Mou `el` just després de `referencia`. */
export function moureDespres(el: HTMLElement, referencia: HTMLElement): void {
  validarMoviment(el, referencia);
  referencia.after(el);
}

/** Mou `el` perquè sigui el primer fill de `pare`. */
export function moureAlPrincipi(el: HTMLElement, pare: HTMLElement): void {
  validarElement(el); validarElement(pare, "pare");
  pare.prepend(el);
}

/** Mou `el` perquè sigui l'últim fill de `pare`. */
export function moureAlFinal(el: HTMLElement, pare: HTMLElement): void {
  validarElement(el); validarElement(pare, "pare");
  pare.append(el);
}

/** Mou `el` a la posició `pos` dels fills de `pare` (0 = primer). */
export function moureAPosicio(el: HTMLElement, pare: HTMLElement, pos: number): void {
  validarElement(el); validarElement(pare, "pare");
  validarEnter(pos, "pos", 0, pare.children.length);
  pare.insertBefore(el, pare.children[pos] ?? null);
}

/** Mou `el` una posició amunt (cap al principi) dins del seu pare. */
export function pujar(el: HTMLElement): void {
  validarElement(el);
  const ant = el.previousElementSibling;
  if (ant) ant.before(el);
}

/** Mou `el` una posició avall (cap al final) dins del seu pare. */
export function baixar(el: HTMLElement): void {
  validarElement(el);
  const seg = el.nextElementSibling;
  if (seg) seg.after(el);
}

/** Intercanvia la posició de dos elements (poden tenir pares diferents). */
export function intercanviar(a: HTMLElement, b: HTMLElement): void {
  validarElement(a, "a"); validarElement(b, "b");
  if (a === b) return;
  const marcador = document.createComment("");
  a.before(marcador);
  b.before(a);
  marcador.replaceWith(b);
}

/** Esborra un element del DOM. */
export function eliminar(el: HTMLElement): void {
  validarElement(el);
  el.remove();
}

/** Esborra tots els fills d'un element. */
export function buidar(el: HTMLElement): void {
  validarElement(el);
  el.replaceChildren();
}

/** Substitueix un element per un altre. */
export function substituir(antic: HTMLElement, nou: HTMLElement): void {
  validarElement(antic, "antic"); validarElement(nou, "nou");
  antic.replaceWith(nou);
}

/** Envolta un element dins d'un altre (p. ex. un <div>). */
export function envoltar(el: HTMLElement, contenidor: HTMLElement): HTMLElement {
  validarElement(el); validarElement(contenidor, "contenidor");
  el.replaceWith(contenidor);
  contenidor.append(el);
  return contenidor;
}

/** Ordena els fills d'un pare amb una funció de comparació sobre els elements. */
export function ordenarFills(pare: HTMLElement, comparar: (a: HTMLElement, b: HTMLElement) => number): void {
  validarElement(pare, "pare");
  const ordenats = (Array.from(pare.children) as HTMLElement[]).sort(comparar);
  pare.append(...ordenats);
}

/** Barreja aleatòriament els fills d'un pare. */
export function barrejarFills(pare: HTMLElement): void {
  ordenarFills(pare, () => Math.random() - 0.5);
}

/** Inverteix l'ordre dels fills d'un pare. */
export function invertirFills(pare: HTMLElement): void {
  validarElement(pare, "pare");
  pare.append(...Array.from(pare.children).reverse());
}

function validarMoviment(el: HTMLElement, referencia: HTMLElement): void {
  validarElement(el); validarElement(referencia, "referencia");
  if (el === referencia) throw new Error("Un element no es pot moure respecte a ell mateix");
  if (!referencia.parentNode) throw new Error("L'element de referència no té pare");
}

/* ---------------------------------------------------------------------
 *  5. TAULES
 * ------------------------------------------------------------------- */

/**
 * Crea una taula de `files` x `columnes`.
 * @param atributs (opcional) Atributs de la taula.
 * @param dades (opcional) Matriu per inicialitzar les cel·les.
 */
export function crearTaula(files: number, columnes: number, atributs?: Atributs, dades?: Contingut[][]): HTMLTableElement {
  validarEnter(files, "files", 1);
  validarEnter(columnes, "columnes", 1);
  const taula = crearElement("table", "", atributs);
  for (let f = 0; f < files; f++) {
    const fila = taula.insertRow();
    for (let c = 0; c < columnes; c++) fila.insertCell();
  }
  if (dades) omplirCelles(taula, dades);
  return taula;
}

/** Crea una taula a partir d'una matriu (files i columnes se'n dedueixen). Capçaleres opcionals amb <th>. */
export function taulaDeMatriu(dades: Contingut[][], capcaleres?: string[], atributs?: Atributs): HTMLTableElement {
  if (!Array.isArray(dades) || dades.length === 0) throw new Error("dades ha de ser una matriu no buida");
  const taula = crearElement("table", "", atributs);
  if (capcaleres) {
    const fila = taula.createTHead().insertRow();
    for (const h of capcaleres) fila.append(crearElement("th", h));
  }
  const cos = taula.createTBody();
  for (const filaDades of dades) {
    const fila = cos.insertRow();
    for (const valor of filaDades) fila.insertCell().append(...(Array.isArray(valor) ? valor : [valor]));
  }
  return taula;
}

/** Omple les cel·les amb una matriu dades[fila][columna]. */
export function omplirCelles(taula: HTMLTableElement, dades: Contingut[][]): void {
  validarTaula(taula);
  if (!Array.isArray(dades)) throw new Error("dades ha de ser una matriu");
  dades.forEach((filaDades, f) => {
    const fila = taula.rows[f];
    if (!fila) return;
    filaDades.forEach((valor, c) => {
      const cel = fila.cells[c];
      if (cel) establirContingut(cel, valor);
    });
  });
}

/** Omple una sola casella. */
export function omplirCasella(taula: HTMLTableElement, fila: number, columna: number, valor: Contingut): void {
  const cel = obtenirCasella(taula, fila, columna);
  establirContingut(cel, valor);
}

/** Retorna la casella (fila, columna). */
export function obtenirCasella(taula: HTMLTableElement, fila: number, columna: number): HTMLTableCellElement {
  validarTaula(taula);
  validarEnter(fila, "fila", 0, taula.rows.length - 1);
  validarEnter(columna, "columna", 0, taula.rows[fila].cells.length - 1);
  return taula.rows[fila].cells[columna];
}

/** Nombre de columnes (de la primera fila). */
export function nombreColumnes(taula: HTMLTableElement): number {
  validarTaula(taula);
  return taula.rows[0]?.cells.length ?? 0;
}

/** Retorna el contingut de la taula com a matriu de textos. */
export function taulaAMatriu(taula: HTMLTableElement): string[][] {
  validarTaula(taula);
  return Array.from(taula.rows).map(f => Array.from(f.cells).map(c => c.textContent ?? ""));
}

/** Retorna els textos d'una columna. */
export function obtenirColumna(taula: HTMLTableElement, col: number): string[] {
  validarColumna(taula, col);
  return Array.from(taula.rows).map(f => f.cells[col].textContent ?? "");
}

/** Afegeix una fila a la posició `pos` (-1 = al final). */
export function afegirFila(taula: HTMLTableElement, pos = -1, dades?: Contingut[]): HTMLTableRowElement {
  validarTaula(taula);
  validarEnter(pos, "pos", -1, taula.rows.length);
  const fila = taula.insertRow(pos);
  const n = nombreColumnes(taula) || dades?.length || 1;
  for (let c = 0; c < n; c++) {
    const cel = fila.insertCell();
    if (dades && dades[c] !== undefined) establirContingut(cel, dades[c]);
  }
  return fila;
}

/** Afegeix una columna a la posició `pos` (-1 = al final). */
export function afegirColumna(taula: HTMLTableElement, pos = -1, dades?: Contingut[]): void {
  validarTaula(taula);
  validarEnter(pos, "pos", -1, nombreColumnes(taula));
  Array.from(taula.rows).forEach((fila, f) => {
    const cel = fila.insertCell(pos);
    if (dades && dades[f] !== undefined) establirContingut(cel, dades[f]);
  });
}

/** Esborra la fila de la posició `pos`. */
export function esborrarFila(taula: HTMLTableElement, pos: number): void {
  validarTaula(taula);
  validarEnter(pos, "pos", 0, taula.rows.length - 1);
  taula.deleteRow(pos);
}

/** Esborra la columna de la posició `pos`. */
export function esborrarColumna(taula: HTMLTableElement, pos: number): void {
  validarColumna(taula, pos);
  for (const fila of Array.from(taula.rows)) fila.deleteCell(pos);
}

/** Mou la columna `col` abans de la columna `ref`. */
export function moureColumnaAbans(taula: HTMLTableElement, col: number, ref: number): void {
  validarColumna(taula, col); validarColumna(taula, ref, "ref");
  if (col === ref) return;
  for (const fila of Array.from(taula.rows)) fila.insertBefore(fila.cells[col], fila.cells[ref]);
}

/** Mou la columna `col` després de la columna `ref`. */
export function moureColumnaDespres(taula: HTMLTableElement, col: number, ref: number): void {
  validarColumna(taula, col); validarColumna(taula, ref, "ref");
  if (col === ref) return;
  for (const fila of Array.from(taula.rows)) fila.cells[ref].after(fila.cells[col]);
}

/** Mou la columna `col` a la primera posició. */
export function moureColumnaAlPrincipi(taula: HTMLTableElement, col: number): void {
  validarColumna(taula, col);
  for (const fila of Array.from(taula.rows)) fila.prepend(fila.cells[col]);
}

/** Mou la columna `col` a l'última posició. */
export function moureColumnaAlFinal(taula: HTMLTableElement, col: number): void {
  validarColumna(taula, col);
  for (const fila of Array.from(taula.rows)) fila.append(fila.cells[col]);
}

/** Intercanvia dues columnes. */
export function intercanviarColumnes(taula: HTMLTableElement, a: number, b: number): void {
  validarColumna(taula, a, "a"); validarColumna(taula, b, "b");
  if (a === b) return;
  for (const fila of Array.from(taula.rows)) intercanviar(fila.cells[a], fila.cells[b]);
}

/** Mou la fila `fila` a la posició `pos` (0 = primera). */
export function moureFila(taula: HTMLTableElement, fila: number, pos: number): void {
  validarTaula(taula);
  validarEnter(fila, "fila", 0, taula.rows.length - 1);
  validarEnter(pos, "pos", 0, taula.rows.length - 1);
  const f = taula.rows[fila];
  const ref = taula.rows[pos];
  if (f === ref) return;
  if (fila < pos) ref.after(f); else ref.before(f);
}

/** Intercanvia dues files. */
export function intercanviarFiles(taula: HTMLTableElement, a: number, b: number): void {
  validarTaula(taula);
  validarEnter(a, "a", 0, taula.rows.length - 1);
  validarEnter(b, "b", 0, taula.rows.length - 1);
  intercanviar(taula.rows[a], taula.rows[b]);
}

/** Ordena les files segons una columna (text o numèric). La fila 0 es manté si `capcalera` és true. */
export function ordenarPerColumna(taula: HTMLTableElement, col: number, ascendent = true, numeric = false, capcalera = false): void {
  validarColumna(taula, col);
  const files = Array.from(taula.rows);
  const cap = capcalera ? files.shift() : undefined;
  files.sort((x, y) => {
    const a = x.cells[col].textContent ?? "";
    const b = y.cells[col].textContent ?? "";
    const r = numeric ? parseFloat(a) - parseFloat(b) : a.localeCompare(b);
    return ascendent ? r : -r;
  });
  const cos = taula.tBodies[0] ?? taula;
  if (cap) cos.append(cap);
  cos.append(...files);
}

/** Transposa la taula (files <-> columnes) i retorna una taula nova. */
export function transposarTaula(taula: HTMLTableElement): HTMLTableElement {
  const m = taulaAMatriu(taula);
  const t = m[0].map((_, c) => m.map(f => f[c]));
  return taulaDeMatriu(t);
}

/** Aplica una funció a totes les cel·les (f, c, cel·la). */
export function recorrerCelles(taula: HTMLTableElement, accio: (cel: HTMLTableCellElement, fila: number, col: number) => void): void {
  validarTaula(taula);
  Array.from(taula.rows).forEach((fila, f) => Array.from(fila.cells).forEach((cel, c) => accio(cel, f, c)));
}

/** Ajunta cel·les: fa que una cel·la ocupi més files/columnes (i esborra les que sobren). */
export function combinarCelles(taula: HTMLTableElement, fila: number, col: number, files = 1, cols = 1): void {
  const cel = obtenirCasella(taula, fila, col);
  validarEnter(files, "files", 1); validarEnter(cols, "cols", 1);
  cel.rowSpan = files; cel.colSpan = cols;
  for (let f = fila + files - 1; f >= fila; f--)
    for (let c = col + cols - 1; c >= col; c--)
      if (f !== fila || c !== col) taula.rows[f]?.deleteCell(c);
}

/** Desplaça circularment les columnes: positiu = cap a la dreta, negatiu = cap a l'esquerra. */
export function rotarColumnes(taula: HTMLTableElement, passos: number): void {
  validarTaula(taula);
  validarEnter(passos, "passos", -Infinity);
  const n = nombreColumnes(taula);
  if (n === 0) return;
  const p = ((passos % n) + n) % n;
  for (let i = 0; i < p; i++) moureColumnaAlPrincipi(taula, n - 1);
}

function validarColumna(taula: HTMLTableElement, col: number, nom = "col"): void {
  validarTaula(taula);
  validarEnter(col, nom, 0, nombreColumnes(taula) - 1);
}

/* ---------------------------------------------------------------------
 *  6. ESDEVENIMENTS
 * ------------------------------------------------------------------- */

/** Afegeix un listener i retorna una funció per treure'l. */
export function escoltar<K extends keyof HTMLElementEventMap>(
  el: HTMLElement, tipus: K, funcio: (ev: HTMLElementEventMap[K]) => void
): () => void {
  validarElement(el);
  el.addEventListener(tipus, funcio);
  return () => el.removeEventListener(tipus, funcio);
}

/**
 * Delegació d'esdeveniments: escolta al `pare` però només s'executa
 * quan el clic (o altre) és sobre un fill que coincideix amb `selector`.
 */
export function delegar<K extends keyof HTMLElementEventMap>(
  pare: HTMLElement, tipus: K, selector: string,
  funcio: (ev: HTMLElementEventMap[K], objectiu: HTMLElement) => void
): () => void {
  validarElement(pare, "pare");
  validarText(selector, "selector");
  const gestor = (ev: HTMLElementEventMap[K]) => {
    const t = (ev.target as HTMLElement | null)?.closest<HTMLElement>(selector);
    if (t && pare.contains(t)) funcio(ev, t);
  };
  pare.addEventListener(tipus, gestor);
  return () => pare.removeEventListener(tipus, gestor);
}

/** Executa `funcio` cada `ms` mil·lisegons. Retorna una funció per aturar-ho. */
export function repetir(funcio: () => void, ms: number): () => void {
  validarEnter(ms, "ms", 1);
  const id = setInterval(funcio, ms);
  return () => clearInterval(id);
}

/** Retorna una funció que només s'executa després de `ms` sense ser cridada (debounce). */
export function retardar<A extends unknown[]>(funcio: (...args: A) => void, ms: number): (...args: A) => void {
  validarEnter(ms, "ms", 0);
  let id: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => { clearTimeout(id); id = setTimeout(() => funcio(...args), ms); };
}

/** Executa `funcio` quan el DOM ja està carregat. */
export function alCarregar(funcio: () => void): void {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", funcio);
  else funcio();
}

/* ---------------------------------------------------------------------
 *  7. FORMULARIS
 * ------------------------------------------------------------------- */

/** Llegeix un formulari i el retorna com a objecte { nom: valor }. */
export function llegirFormulari(form: HTMLFormElement): Record<string, string> {
  if (!(form instanceof HTMLFormElement)) throw new Error("Cal passar un <form>");
  const dades: Record<string, string> = {};
  new FormData(form).forEach((v, k) => { if (typeof v === "string") dades[k] = v; });
  return dades;
}

/** Omple els camps d'un formulari a partir d'un objecte { nom: valor }. */
export function omplirFormulari(form: HTMLFormElement, dades: Record<string, string>): void {
  if (!(form instanceof HTMLFormElement)) throw new Error("Cal passar un <form>");
  for (const [nom, valor] of Object.entries(dades)) {
    const camp = form.elements.namedItem(nom);
    if (camp instanceof HTMLInputElement || camp instanceof HTMLSelectElement || camp instanceof HTMLTextAreaElement)
      camp.value = valor;
  }
}

/** Valors dels checkboxes marcats d'un mateix `name`. */
export function valorsMarcats(form: HTMLFormElement, nom: string): string[] {
  if (!(form instanceof HTMLFormElement)) throw new Error("Cal passar un <form>");
  return Array.from(form.querySelectorAll<HTMLInputElement>(`input[name="${nom}"]:checked`)).map(i => i.value);
}

/** Habilita o deshabilita tots els camps d'un formulari/contenidor. */
export function habilitarCamps(contenidor: HTMLElement, habilitat: boolean): void {
  validarElement(contenidor);
  contenidor.querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement>(
    "input, button, select, textarea"
  ).forEach(c => { c.disabled = !habilitat; });
}

/* ---------------------------------------------------------------------
 *  8. UTILITATS GENERALS (útils per a jocs, panells, animacions...)
 * ------------------------------------------------------------------- */

/** Enter aleatori entre min i max (tots dos inclosos). */
export function aleatori(min: number, max: number): number {
  validarEnter(min, "min", -Infinity); validarEnter(max, "max", min);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Element aleatori d'un array. */
export function triar<T>(llista: T[]): T {
  if (!Array.isArray(llista) || llista.length === 0) throw new Error("Cal un array no buit");
  return llista[aleatori(0, llista.length - 1)];
}

/** Barreja un array (retorna una còpia, Fisher–Yates). */
export function barrejar<T>(llista: T[]): T[] {
  const c = [...llista];
  for (let i = c.length - 1; i > 0; i--) {
    const j = aleatori(0, i);
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

/** Color aleatori en format hexadecimal (#rrggbb). */
export function colorAleatori(): string {
  return "#" + aleatori(0, 0xffffff).toString(16).padStart(6, "0");
}

/** Crea una matriu `files` x `columnes` omplint-la amb el valor de `generador(f, c)`. */
export function crearMatriu<T>(files: number, columnes: number, generador: (f: number, c: number) => T): T[][] {
  validarEnter(files, "files", 1); validarEnter(columnes, "columnes", 1);
  return Array.from({ length: files }, (_, f) => Array.from({ length: columnes }, (_, c) => generador(f, c)));
}

/** Crea un rang [inici, inici+1, ... fi-1]. */
export function rang(inici: number, fi: number): number[] {
  validarEnter(inici, "inici", -Infinity); validarEnter(fi, "fi", inici);
  return Array.from({ length: fi - inici }, (_, i) => inici + i);
}

/** Fa girar circularment un array (positiu = dreta, negatiu = esquerra). Retorna una còpia. */
export function rotarArray<T>(llista: T[], passos: number): T[] {
  if (llista.length === 0) return [];
  const p = ((passos % llista.length) + llista.length) % llista.length;
  return [...llista.slice(llista.length - p), ...llista.slice(0, llista.length - p)];
}

/** Escriu un missatge en un element (p. ex. un <div id="missatge">) amb una classe opcional. */
export function mostrarMissatge(el: HTMLElement, text: string, classe?: string): void {
  validarElement(el);
  el.textContent = text;
  el.className = classe ?? "";
}

/** Marca temporalment un element amb una classe i la treu passats `ms` ms. */
export function ressaltar(el: HTMLElement, classe = "ressaltat", ms = 1000): void {
  validarElement(el);
  el.classList.add(classe);
  setTimeout(() => el.classList.remove(classe), ms);
}