export const diccionario = [
    "FETIDEZ", "ESCORCHAPIN", "MORTERA", "GRAVAR", "ANTICRISTIANO",
    "ANTERO", "LUXACION", "EROTOMANIA", "TRASVERSAL", "SOPAPEAR",
    "CASTILLO", "VENTANA", "PLATANO", "MONTAÑA", "RELOJ",
    "CAMINO", "BUFANDA", "TORMENTA", "ESPEJO", "CARACOL",
];
export function palabrasAleatorias(n) {
    if (!Number.isInteger(n) || n <= 0)
        throw new RangeError("n debe ser un entero positivo");
    return Array.from({ length: n }, () => diccionario[Math.floor(Math.random() * diccionario.length)]);
}
export function mostrarConSeparador(palabras) {
    return palabras.join("\n----------\n");
}
export function eliminarPrimeraRepetida(lista) {
    for (let i = 0; i < lista.length; i++) {
        const j = lista.indexOf(lista[i], i + 1);
        if (j !== -1) {
            console.log(`Repetida: "${lista[i]}" en la posición ${j}`);
            lista.splice(j, 1);
            return true;
        }
    }
    return false;
}
export function quitarRepetidas(lista) {
    while (eliminarPrimeraRepetida(lista)) { }
}
export function quitarRepetidasOrdenado(lista) {
    const ordenada = [...lista].sort((a, b) => a.localeCompare(b));
    const unicas = [];
    for (let i = 0; i < ordenada.length; i++) {
        if (i > 0 && ordenada[i] === ordenada[i - 1]) {
            console.log(`Repetida: "${ordenada[i]}" en la posición ${i}`);
        }
        else {
            unicas.push(ordenada[i]);
        }
    }
    return unicas;
}
export function buscarPalabra(lista, palabra) {
    const i = lista.indexOf(palabra);
    return i === -1 ? undefined : i;
}
export function medir(accion) {
    const t0 = performance.now();
    accion();
    return performance.now() - t0;
}
//# sourceMappingURL=palabras.js.map