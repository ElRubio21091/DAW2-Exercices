/* =====================================================================
 *  DOM-UTILS-EXTRA: complement de dom-utils.ts basat en els apunts
 *  (nodes, arbre, atributs, estils, insertAdjacent*, mides i posició).
 *  Necessita: import { validarElement, validarText, validarEnter } from "./DOM_utils.js"
 *  (si copieu funcions soltes, copieu també les validacions que usen)
 * ===================================================================== */
import { validarElement, validarText, validarEnter } from "./DOM_utils.js";

/* ---------------------------------------------------------------------
 *  1. MODEL D'OBJECTES DEL DOCUMENT
 * ------------------------------------------------------------------- */

/** Accés ràpid a document.head / body / links / forms / images (com a arrays). */
export const doc = {
  cap: () => document.head,
  cos: () => document.body,
  enllacos: () => Array.from(document.links),
  formularis: () => Array.from(document.forms),
  imatges: () => Array.from(document.images),
};

/** Nom llegible del tipus de node (nodeType 1, 3, 8, 9...). */
export function tipusNode(node: Node): string {
  if (!(node instanceof Node)) throw new Error("Cal passar un node");
  switch (node.nodeType) {
    case Node.ELEMENT_NODE: return "ELEMENT_NODE";
    case Node.TEXT_NODE: return "TEXT_NODE";
    case Node.COMMENT_NODE: return "COMMENT_NODE";
    case Node.DOCUMENT_NODE: return "DOCUMENT_NODE";
    default: return `ALTRE (${node.nodeType})`;
  }
}

/** Retorna els fills (childNodes) d'un node, filtrats per nodeType si es vol. */
export function fillsNodes(pare: Node, tipus?: number): ChildNode[] {
  if (!(pare instanceof Node)) throw new Error("Cal passar un node");
  const llista = Array.from(pare.childNodes);
  return tipus === undefined ? llista : llista.filter(n => n.nodeType === tipus);
}

/** Esborra els nodes de text buits (espais i salts de línia) fills d'un element. */
export function netejarEspais(pare: HTMLElement, recursiu = true): void {
  validarElement(pare, "pare");
  for (const n of Array.from(pare.childNodes)) {
    if (n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim() === "") n.remove();
    else if (recursiu && n instanceof HTMLElement) netejarEspais(n, true);
  }
}

/** Recorre l'arbre en profunditat executant `accio(node, nivell)` a cada node. */
export function recorrerArbre(arrel: Node, accio: (node: Node, nivell: number) => void, nivell = 0): void {
  if (!(arrel instanceof Node)) throw new Error("Cal passar un node");
  accio(arrel, nivell);
  arrel.childNodes.forEach(f => recorrerArbre(f, accio, nivell + 1));
}

/** Retorna una cadena amb l'estructura de l'arbre (útil per depurar). */
export function arbreATexte(arrel: Node): string {
  const linies: string[] = [];
  recorrerArbre(arrel, (n, nivell) => {
    const text = n.nodeType === Node.TEXT_NODE ? ` "${(n.textContent ?? "").trim()}"` : "";
    linies.push("  ".repeat(nivell) + n.nodeName + text);
  });
  return linies.join("\n");
}

/** Tots els descendents element que compleixen un filtre. */
export function descendents(arrel: HTMLElement, filtre: (el: HTMLElement) => boolean = () => true): HTMLElement[] {
  validarElement(arrel, "arrel");
  return (Array.from(arrel.querySelectorAll("*")) as HTMLElement[]).filter(filtre);
}

/** Llista d'avantpassats d'un element (del pare més proper fins a <html>). */
export function avantpassats(el: HTMLElement): HTMLElement[] {
  validarElement(el);
  const res: HTMLElement[] = [];
  for (let p = el.parentElement; p; p = p.parentElement) res.push(p);
  return res;
}

/** Germans d'un element (sense incloure'l a ell). */
export function germans(el: HTMLElement): HTMLElement[] {
  validarElement(el);
  return Array.from(el.parentElement?.children ?? []).filter(e => e !== el) as HTMLElement[];
}

/** Navega des d'un element: "pare" | "primer" | "ultim" | "seguent" | "anterior". Retorna null si no n'hi ha. */
export function navegar(el: HTMLElement, cap: "pare" | "primer" | "ultim" | "seguent" | "anterior"): HTMLElement | null {
  validarElement(el);
  const r = {
    pare: el.parentElement,
    primer: el.firstElementChild,
    ultim: el.lastElementChild,
    seguent: el.nextElementSibling,
    anterior: el.previousElementSibling,
  }[cap];
  if (r === undefined) throw new Error(`Direcció no vàlida: ${cap}`);
  return r as HTMLElement | null;
}

/** Camí d'índexs de fills fins a un element: p. ex. el 3r fill del 2n fill del <body> -> navegarCami(body, [1, 2]). */
export function navegarCami(arrel: HTMLElement, cami: number[]): HTMLElement {
  validarElement(arrel, "arrel");
  let actual: HTMLElement = arrel;
  for (const i of cami) {
    validarEnter(i, "índex del camí", 0, actual.children.length - 1);
    actual = actual.children[i] as HTMLElement;
  }
  return actual;
}

/* ---------------------------------------------------------------------
 *  2. INSERIR AMB LES FUNCIONS CLÀSSIQUES DELS APUNTS
 * ------------------------------------------------------------------- */

/** Afegeix `nou` DESPRÉS de `ref` amb la fórmula dels apunts: parentNode.insertBefore(nou, ref.nextSibling). */
export function afegirDespres(nou: Node, ref: Node): void {
  if (!(nou instanceof Node) || !(ref instanceof Node)) throw new Error("Calen dos nodes");
  if (!ref.parentNode) throw new Error("El node de referència no té pare");
  ref.parentNode.insertBefore(nou, ref.nextSibling);
}

/** Afegeix `nou` ABANS de `ref` amb insertBefore. */
export function afegirAbans(nou: Node, ref: Node): void {
  if (!(nou instanceof Node) || !(ref instanceof Node)) throw new Error("Calen dos nodes");
  if (!ref.parentNode) throw new Error("El node de referència no té pare");
  ref.parentNode.insertBefore(nou, ref);
}

export type Posicio = "beforebegin" | "afterbegin" | "beforeend" | "afterend";
const POSICIONS: Posicio[] = ["beforebegin", "afterbegin", "beforeend", "afterend"];

function validarPosicio(pos: string): asserts pos is Posicio {
  if (!POSICIONS.includes(pos as Posicio))
    throw new Error(`Posició no vàlida. Cal una de: ${POSICIONS.join(", ")}`);
}

/**
 * Insereix (o mou) un element respecte de `ref`.
 * beforebegin = abans de ref · afterbegin = primer fill · beforeend = últim fill · afterend = després de ref.
 */
export function inserirElement(ref: HTMLElement, pos: Posicio, nou: HTMLElement): HTMLElement {
  validarElement(ref, "ref"); validarElement(nou, "nou"); validarPosicio(pos);
  return ref.insertAdjacentElement(pos, nou) as HTMLElement;
}

/** Insereix codi HTML respecte de `ref`. */
export function inserirHTML(ref: HTMLElement, pos: Posicio, html: string): void {
  validarElement(ref, "ref"); validarPosicio(pos); validarText(html, "html", false);
  ref.insertAdjacentHTML(pos, html);
}

/** Insereix text pla respecte de `ref`. */
export function inserirText(ref: HTMLElement, pos: Posicio, text: string): void {
  validarElement(ref, "ref"); validarPosicio(pos); validarText(text, "text", false);
  ref.insertAdjacentText(pos, text);
}

/* ---------------------------------------------------------------------
 *  3. CONTINGUT D'UN ELEMENT
 * ------------------------------------------------------------------- */

/** innerHTML: contingut HTML de l'element. */
export function obtenirHTML(el: HTMLElement): string { validarElement(el); return el.innerHTML; }
/** Substitueix el contingut HTML (compte amb codi no fiable!). */
export function establirHTML(el: HTMLElement, html: string): void { validarElement(el); validarText(html, "html", false); el.innerHTML = html; }
/** outerHTML: HTML de l'element incloent les seves etiquetes. */
export function htmlComplet(el: HTMLElement): string { validarElement(el); return el.outerHTML; }
/** innerText: text VISIBLE de l'element i descendents. */
export function textVisible(el: HTMLElement): string { validarElement(el); return el.innerText; }
/** textContent: tot el text, visible o no. */
export function textTotal(el: Node): string { if (!(el instanceof Node)) throw new Error("Cal un node"); return el.textContent ?? ""; }

/* ---------------------------------------------------------------------
 *  4. ATRIBUTS (id, name, className, classList, data-*, attributes)
 * ------------------------------------------------------------------- */

/** Retorna tots els atributs d'un element com a objecte { nom: valor }. */
export function llistarAtributs(el: HTMLElement): Record<string, string> {
  validarElement(el);
  const r: Record<string, string> = {};
  for (const a of Array.from(el.attributes)) r[a.name] = a.value;
  return r;
}

/** Retorna el valor d'un atribut o `perDefecte` si no existeix. */
export function obtenirAtribut(el: HTMLElement, nom: string, perDefecte = ""): string {
  validarElement(el); validarText(nom, "nom");
  return el.hasAttribute(nom) ? (el.getAttribute(nom) as string) : perDefecte;
}

/** Copia tots els atributs d'un element a un altre. */
export function copiarAtributs(origen: HTMLElement, desti: HTMLElement): void {
  validarElement(origen, "origen"); validarElement(desti, "desti");
  for (const a of Array.from(origen.attributes)) desti.setAttribute(a.name, a.value);
}

/** Estableix un atribut personalitzat data-*: establirDada(el, "index", 1) -> data-index="1". */
export function establirDada(el: HTMLElement, nom: string, valor: string | number): void {
  validarElement(el); validarText(nom, "nom");
  el.dataset[nom] = String(valor);
}

/** Llegeix un atribut data-*. Retorna undefined si no existeix. */
export function obtenirDada(el: HTMLElement, nom: string): string | undefined {
  validarElement(el); validarText(nom, "nom");
  return el.dataset[nom];
}

/** Comprova si l'element té una classe. */
export function teClasse(el: HTMLElement, classe: string): boolean {
  validarElement(el); validarText(classe, "classe");
  return el.classList.contains(classe);
}

/** Canvia una classe per una altra. */
export function canviarClasse(el: HTMLElement, antiga: string, nova: string): boolean {
  validarElement(el); validarText(antiga, "antiga"); validarText(nova, "nova");
  return el.classList.replace(antiga, nova);
}

/** Retorna les classes d'un element com a array. */
export function classesDe(el: HTMLElement): string[] { validarElement(el); return Array.from(el.classList); }

/* ---------------------------------------------------------------------
 *  5. ESTILS
 *  Recordatori: a JS els noms van en camelCase (backgroundColor),
 *  però setProperty/getPropertyValue usen el format CSS (background-color).
 * ------------------------------------------------------------------- */

/** "backgroundColor" -> "background-color" */
export function aKebab(nom: string): string { return nom.replace(/[A-Z]/g, m => "-" + m.toLowerCase()); }

/** Assigna UNA propietat d'estil en línia (accepta camelCase o kebab-case). */
export function establirEstil(el: HTMLElement, propietat: string, valor: string): void {
  validarElement(el); validarText(propietat, "propietat");
  el.style.setProperty(aKebab(propietat), valor);
}

/** Valor de l'estil EN LÍNIA (no inclou el que ve de CSS). "" si no està definit. */
export function estilEnLinia(el: HTMLElement, propietat: string): string {
  validarElement(el); validarText(propietat, "propietat");
  return el.style.getPropertyValue(aKebab(propietat));
}

/** Valor CALCULAT pel navegador (getComputedStyle): inclou CSS intern, extern i heretat. */
export function estilCalculat(el: HTMLElement, propietat: string): string {
  validarElement(el); validarText(propietat, "propietat");
  return getComputedStyle(el).getPropertyValue(aKebab(propietat));
}

/** Valor calculat convertit a número (treu "px"): estilCalculatNum(el, "width") -> 200. */
export function estilCalculatNum(el: HTMLElement, propietat: string): number {
  const n = parseFloat(estilCalculat(el, propietat));
  return Number.isNaN(n) ? 0 : n;
}

/** Elimina una propietat de l'estil en línia. */
export function eliminarEstil(el: HTMLElement, ...propietats: string[]): void {
  validarElement(el);
  propietats.forEach(p => el.style.removeProperty(aKebab(p)));
}

/** Llegeix o substitueix tot l'estil en línia amb style.cssText. */
export function cssText(el: HTMLElement, nou?: string): string {
  validarElement(el);
  if (nou !== undefined) el.style.cssText = nou;
  return el.style.cssText;
}

/** Copia els estils calculats de les propietats indicades d'un element a un altre. */
export function copiarEstils(origen: HTMLElement, desti: HTMLElement, propietats: string[]): void {
  validarElement(origen, "origen"); validarElement(desti, "desti");
  for (const p of propietats) establirEstil(desti, p, estilCalculat(origen, p));
}

/** Posa una vora (border): ocupa espai i canvia la mida de l'objecte. */
export function assignarVora(el: HTMLElement, gruix = "1px", tipus = "solid", color = "black"): void {
  validarElement(el);
  el.style.border = `${gruix} ${tipus} ${color}`;
}

/** Posa un contorn (outline): NO ocupa espai i pot superposar-se als veïns. */
export function assignarContorn(el: HTMLElement, gruix = "1px", tipus = "solid", color = "black"): void {
  validarElement(el);
  el.style.outline = `${gruix} ${tipus} ${color}`;
}

/** És visible? (comprova display, visibility i que ocupi espai). */
export function esVisible(el: HTMLElement): boolean {
  validarElement(el);
  const e = getComputedStyle(el);
  return e.display !== "none" && e.visibility !== "hidden" && el.getClientRects().length > 0;
}

/* ---------------------------------------------------------------------
 *  6. MIDES I POSICIÓ
 * ------------------------------------------------------------------- */

export interface Mides {
  clientWidth: number; clientHeight: number; clientLeft: number; clientTop: number;
  scrollWidth: number; scrollHeight: number; scrollLeft: number; scrollTop: number;
}

/** Totes les mides en píxels d'un element (client* = interior amb padding; scroll* = tot el contingut). */
export function mides(el: HTMLElement): Mides {
  validarElement(el);
  const { clientWidth, clientHeight, clientLeft, clientTop, scrollWidth, scrollHeight, scrollLeft, scrollTop } = el;
  return { clientWidth, clientHeight, clientLeft, clientTop, scrollWidth, scrollHeight, scrollLeft, scrollTop };
}

/** Rectangle de l'element respecte de la FINESTRA (viewport). */
export function rectFinestra(el: HTMLElement): DOMRect {
  validarElement(el);
  return el.getBoundingClientRect();
}

/** Posició (x, y) de l'element respecte del DOCUMENT (suma el desplaçament de la finestra). */
export function posicioDocument(el: HTMLElement): { x: number; y: number } {
  const r = rectFinestra(el);
  return { x: r.x + window.scrollX, y: r.y + window.scrollY };
}

/** Té barres de desplaçament (el contingut és més gran que l'àrea visible)? */
export function teScroll(el: HTMLElement): { horitzontal: boolean; vertical: boolean } {
  validarElement(el);
  return { horitzontal: el.scrollWidth > el.clientWidth, vertical: el.scrollHeight > el.clientHeight };
}

/** Desplaça el contingut fins al final (útil per xats i llistes). */
export function scrollAlFinal(el: HTMLElement): void {
  validarElement(el);
  el.scrollTop = el.scrollHeight;
}

/** Ha arribat al final del scroll vertical? */
export function alFinalDelScroll(el: HTMLElement, marge = 1): boolean {
  validarElement(el);
  return el.scrollTop + el.clientHeight >= el.scrollHeight - marge;
}

/** Mesures de les zones del model de caixes (valors calculats en px). */
export function modelDeCaixes(el: HTMLElement) {
  validarElement(el);
  const n = (p: string) => estilCalculatNum(el, p);
  const costats = ["top", "right", "bottom", "left"] as const;
  const zona = (prefix: string, sufix = "") =>
    Object.fromEntries(costats.map(c => [c, n(`${prefix}-${c}${sufix}`)])) as Record<typeof costats[number], number>;
  return {
    contingut: { amplada: n("width"), alcada: n("height") },
    padding: zona("padding"),
    border: zona("border", "-width"),
    margin: zona("margin"),
  };
}

/** Amplada total que ocupa l'element: contingut + padding + border (+ marges si es vol). */
export function ampladaTotal(el: HTMLElement, ambMarges = false): number {
  validarElement(el);
  const m = ambMarges ? estilCalculatNum(el, "margin-left") + estilCalculatNum(el, "margin-right") : 0;
  return el.offsetWidth + m;
}

/** Alçada total que ocupa l'element: contingut + padding + border (+ marges si es vol). */
export function alcadaTotal(el: HTMLElement, ambMarges = false): number {
  validarElement(el);
  const m = ambMarges ? estilCalculatNum(el, "margin-top") + estilCalculatNum(el, "margin-bottom") : 0;
  return el.offsetHeight + m;
}

/** Els rectangles de dos elements es toquen/superposen? (col·lisions) */
export function superposats(a: HTMLElement, b: HTMLElement): boolean {
  const r1 = rectFinestra(a), r2 = rectFinestra(b);
  return r1.left < r2.right && r1.right > r2.left && r1.top < r2.bottom && r1.bottom > r2.top;
}

/** Un punt (x, y) de la finestra està dins de l'element? (p. ex. amb clientX/clientY d'un esdeveniment) */
export function puntDins(el: HTMLElement, x: number, y: number): boolean {
  const r = rectFinestra(el);
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

/** Posiciona un element de forma absoluta a (x, y) píxels respecte del seu contenidor posicionat. */
export function posicionar(el: HTMLElement, x: number, y: number): void {
  validarElement(el);
  el.style.position = "absolute";
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}

/** Mou un element `dx`, `dy` píxels respecte de la seva posició actual (el posiciona si cal). */
export function desplacar(el: HTMLElement, dx: number, dy: number): void {
  validarElement(el);
  if (getComputedStyle(el).position === "static") el.style.position = "relative";
  el.style.left = `${estilCalculatNum(el, "left") + dx}px`;
  el.style.top = `${estilCalculatNum(el, "top") + dy}px`;
}

/** Centra un element absolut dins del seu pare posicionat. */
export function centrar(el: HTMLElement): void {
  validarElement(el);
  const p = el.offsetParent as HTMLElement | null;
  if (!p) throw new Error("L'element no té un pare posicionat");
  posicionar(el, (p.clientWidth - el.offsetWidth) / 2, (p.clientHeight - el.offsetHeight) / 2);
}