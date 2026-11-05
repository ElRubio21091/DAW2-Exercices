export type Atributs = Record<string, string>;

/**
 * Crea un element HTML.
 * @param tag Nom de l'etiqueta (p, div, span, ul, li...).
 * @param contingut Text o node que anirà dins de l'element.
 * @param atributs (opcional) Atributs a assignar, p. ex. { class: "x" }.
 * @throws Error si algun argument no és vàlid.
 */
export function crearElement(
  tag: string,
  contingut: string | Node = "",
  atributs?: Atributs
): HTMLElement {
  if (typeof tag !== "string" || tag.trim() === "")
    throw new Error("crearElement: l'etiqueta ha de ser un text no buit");
  if (typeof contingut !== "string" && !(contingut instanceof Node))
    throw new Error("crearElement: el contingut ha de ser un text o un node");

  const el = document.createElement(tag);
  if (typeof contingut === "string") el.textContent = contingut;
  else el.appendChild(contingut);

  if (atributs !== undefined) modificarAtributs(el, atributs);
  return el;
}

/**
 * Modifica els atributs d'un element.
 * @param el Element a modificar.
 * @param atributs Objecte amb parells nom -> valor.
 * @throws Error si els arguments no són vàlids.
 */
export function modificarAtributs(el: HTMLElement, atributs: Atributs): void {
  if (!(el instanceof HTMLElement))
    throw new Error("modificarAtributs: cal un element HTML");
  if (typeof atributs !== "object" || atributs === null)
    throw new Error("modificarAtributs: els atributs han de ser un objecte");

  for (const [nom, valor] of Object.entries(atributs)) {
    el.setAttribute(nom, String(valor));
  }
}

/** Mou `el` just abans de `referencia` (dins del mateix pare que `referencia`). */
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
  if (!(el instanceof HTMLElement) || !(pare instanceof HTMLElement))
    throw new Error("moureAlPrincipi: calen dos elements HTML");
  pare.prepend(el);
}

/** Mou `el` perquè sigui l'últim fill de `pare`. */
export function moureAlFinal(el: HTMLElement, pare: HTMLElement): void {
  if (!(el instanceof HTMLElement) || !(pare instanceof HTMLElement))
    throw new Error("moureAlFinal: calen dos elements HTML");
  pare.append(el);
}

function validarMoviment(el: HTMLElement, referencia: HTMLElement): void {
  if (!(el instanceof HTMLElement) || !(referencia instanceof HTMLElement))
    throw new Error("Cal passar dos elements HTML");
  if (el === referencia)
    throw new Error("Un element no es pot moure respecte a ell mateix");
  if (!referencia.parentNode)
    throw new Error("L'element de referència no té pare");
}