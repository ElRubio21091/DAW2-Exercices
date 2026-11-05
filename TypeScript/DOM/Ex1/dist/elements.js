export function crearElement(tag, contingut = "", atributs) {
    if (typeof tag !== "string" || tag.trim() === "")
        throw new Error("crearElement: l'etiqueta ha de ser un text no buit");
    if (typeof contingut !== "string" && !(contingut instanceof Node))
        throw new Error("crearElement: el contingut ha de ser un text o un node");
    const el = document.createElement(tag);
    if (typeof contingut === "string")
        el.textContent = contingut;
    else
        el.appendChild(contingut);
    if (atributs !== undefined)
        modificarAtributs(el, atributs);
    return el;
}
export function modificarAtributs(el, atributs) {
    if (!(el instanceof HTMLElement))
        throw new Error("modificarAtributs: cal un element HTML");
    if (typeof atributs !== "object" || atributs === null)
        throw new Error("modificarAtributs: els atributs han de ser un objecte");
    for (const [nom, valor] of Object.entries(atributs)) {
        el.setAttribute(nom, String(valor));
    }
}
export function moureAbans(el, referencia) {
    validarMoviment(el, referencia);
    referencia.before(el);
}
export function moureDespres(el, referencia) {
    validarMoviment(el, referencia);
    referencia.after(el);
}
export function moureAlPrincipi(el, pare) {
    if (!(el instanceof HTMLElement) || !(pare instanceof HTMLElement))
        throw new Error("moureAlPrincipi: calen dos elements HTML");
    pare.prepend(el);
}
export function moureAlFinal(el, pare) {
    if (!(el instanceof HTMLElement) || !(pare instanceof HTMLElement))
        throw new Error("moureAlFinal: calen dos elements HTML");
    pare.append(el);
}
function validarMoviment(el, referencia) {
    if (!(el instanceof HTMLElement) || !(referencia instanceof HTMLElement))
        throw new Error("Cal passar dos elements HTML");
    if (el === referencia)
        throw new Error("Un element no es pot moure respecte a ell mateix");
    if (!referencia.parentNode)
        throw new Error("L'element de referència no té pare");
}
//# sourceMappingURL=elements.js.map