export function precioEntrada(base, descuento, tasas, numerico) {
    const valido = (n) => typeof n === "number" && Number.isFinite(n);
    if (![base, descuento, tasas].every(valido))
        return undefined;
    const total = base * (1 - descuento / 100) * (1 + tasas / 100);
    return numerico
        ? Math.round(total * 100) / 100
        : total.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}
export const ejecutarConRetardo = (fn, segundos) => {
    setTimeout(fn, segundos * 1000);
};
export function maximo(...numeros) {
    return numeros.length === 0 ? undefined : Math.max(...numeros);
}
export function getObjectByValue(array, atributo, valor) {
    return array.find(o => o[atributo] === valor);
}
export function getObjectsByValue(array, atributo, valor) {
    return array.filter(o => o[atributo] === valor);
}
function patronARegex(patron) {
    const escapado = patron.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    return new RegExp("^" + escapado.replace(/\?/g, ".").replace(/\*/g, ".*") + "$", "i");
}
export function getObjectsByPattern(array, atributo, patron) {
    const regex = patronARegex(patron);
    return array.filter(o => regex.test(String(o[atributo])));
}
export function getObjectsInRange(array, atributo, min, max) {
    return array.filter(o => {
        const v = o[atributo];
        return typeof v === "number" && v >= min && v <= max;
    });
}
const euros = (n) => n.toFixed(2).replace(".", ",") + " €";
export function mostrarTabla(videojuegos, contenedor) {
    contenedor.innerHTML = "";
    const tabla = document.createElement("table");
    tabla.border = "1";
    const cabecera = tabla.createTHead().insertRow();
    for (const titulo of ["Código", "Título", "Plataforma", "PEGI", "Precio", "Precio final"]) {
        const th = document.createElement("th");
        th.textContent = titulo;
        cabecera.appendChild(th);
    }
    const cuerpo = tabla.createTBody();
    for (const v of videojuegos) {
        const fila = cuerpo.insertRow();
        const final = v.descuento !== undefined ? euros(v.precio * (1 - v.descuento / 100)) : "";
        const celdas = [
            v.codigo,
            v.titulo,
            v.plataforma,
            v.pegi !== undefined ? `PEGI ${v.pegi}` : "",
            euros(v.precio),
            final,
        ];
        for (const texto of celdas)
            fila.insertCell().textContent = texto;
    }
    contenedor.appendChild(tabla);
}
//# sourceMappingURL=utils.js.map