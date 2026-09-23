"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Diccionari_js_1 = require("./Diccionari.js");
function paraulesAleatories(n) {
    const resultat = [];
    for (let i = 0; i < n; i++) {
        const index = Math.floor(Math.random() * Diccionari_js_1.diccionari.length);
        resultat.push(Diccionari_js_1.diccionari[index]);
    }
    return resultat;
}
function mostrarParaulesAleatories() {
    const paraules = paraulesAleatories(10);
    const text = paraules.join('\n----------\n');
    console.log(text);
    const output = document.getElementById('output');
    if (output) {
        output.textContent = text;
    }
}
mostrarParaulesAleatories();
//# sourceMappingURL=Ex1Llistes.js.map