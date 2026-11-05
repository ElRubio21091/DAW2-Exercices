import { crearElement, modificarAtributs } from "./elements.js";
export function crearTaula(files, columnes, atributs, dades) {
    validarEnter(files, "files", 1);
    validarEnter(columnes, "columnes", 1);
    const taula = crearElement("table");
    if (atributs)
        modificarAtributs(taula, atributs);
    for (let f = 0; f < files; f++) {
        const fila = taula.insertRow();
        for (let c = 0; c < columnes; c++)
            fila.insertCell();
    }
    if (dades)
        omplirCelles(taula, dades);
    return taula;
}
export function omplirCelles(taula, dades) {
    validarTaula(taula);
    if (!Array.isArray(dades))
        throw new Error("omplirCelles: dades ha de ser una matriu");
    dades.forEach((filaDades, f) => {
        if (f >= taula.rows.length)
            return;
        filaDades.forEach((valor, c) => {
            if (c < taula.rows[f].cells.length)
                taula.rows[f].cells[c].textContent = valor;
        });
    });
}
export function omplirCasella(taula, fila, columna, valor) {
    validarTaula(taula);
    validarEnter(fila, "fila", 0, taula.rows.length - 1);
    validarEnter(columna, "columna", 0, taula.rows[fila].cells.length - 1);
    taula.rows[fila].cells[columna].textContent = valor;
}
export function moureColumnaAbans(taula, col, ref) {
    validarColumnes(taula, col, ref);
    if (col === ref)
        return;
    for (const fila of Array.from(taula.rows)) {
        const cel = fila.cells[col];
        fila.insertBefore(cel, fila.cells[ref]);
    }
}
export function moureColumnaDespres(taula, col, ref) {
    validarColumnes(taula, col, ref);
    if (col === ref)
        return;
    for (const fila of Array.from(taula.rows)) {
        const cel = fila.cells[col];
        fila.cells[ref].after(cel);
    }
}
export function moureColumnaAlPrincipi(taula, col) {
    validarColumnes(taula, col, 0);
    for (const fila of Array.from(taula.rows)) {
        fila.insertBefore(fila.cells[col], fila.cells[0]);
    }
}
export function moureColumnaAlFinal(taula, col) {
    validarColumnes(taula, col, 0);
    for (const fila of Array.from(taula.rows)) {
        fila.append(fila.cells[col]);
    }
}
export function afegirFila(taula, pos = -1) {
    validarTaula(taula);
    validarEnter(pos, "pos", -1, taula.rows.length);
    const columnes = taula.rows[0]?.cells.length ?? 1;
    const fila = taula.insertRow(pos);
    for (let c = 0; c < columnes; c++)
        fila.insertCell();
    return fila;
}
export function afegirColumna(taula, pos = -1) {
    validarTaula(taula);
    const max = taula.rows[0]?.cells.length ?? 0;
    validarEnter(pos, "pos", -1, max);
    for (const fila of Array.from(taula.rows))
        fila.insertCell(pos);
}
export function esborrarFila(taula, pos) {
    validarTaula(taula);
    validarEnter(pos, "pos", 0, taula.rows.length - 1);
    taula.deleteRow(pos);
}
export function esborrarColumna(taula, pos) {
    validarTaula(taula);
    validarEnter(pos, "pos", 0, (taula.rows[0]?.cells.length ?? 0) - 1);
    for (const fila of Array.from(taula.rows))
        fila.deleteCell(pos);
}
function validarTaula(taula) {
    if (!(taula instanceof HTMLTableElement))
        throw new Error("Cal passar una taula (HTMLTableElement)");
}
function validarEnter(valor, nom, min, max = Infinity) {
    if (!Number.isInteger(valor) || valor < min || valor > max)
        throw new Error(`"${nom}" ha de ser un enter entre ${min} i ${max}`);
}
function validarColumnes(taula, a, b) {
    validarTaula(taula);
    const max = (taula.rows[0]?.cells.length ?? 0) - 1;
    validarEnter(a, "columna", 0, max);
    validarEnter(b, "columna de referència", 0, max);
}
//# sourceMappingURL=taules.js.map