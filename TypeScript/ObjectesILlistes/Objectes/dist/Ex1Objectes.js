const cancons = new Set();
function obtenirElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        throw new Error(`No s'ha trobat l'element ${selector}.`);
    }
    return element;
}
const entrada = obtenirElement("#cancos");
const llista = obtenirElement("#llista");
const botoAfegir = obtenirElement("#afegir");
const botoEsborrar = obtenirElement("#esborrar");
function mostrarCancs() {
    llista.value = Array.from(cancons).join("\n");
}
function afegirCanco() {
    const canco = entrada.value.trim();
    if (!canco) {
        return;
    }
    cancons.add(canco);
    entrada.value = "";
    mostrarCancs();
}
function esborrarCanco() {
    const canco = entrada.value.trim();
    cancons.delete(canco);
    entrada.value = "";
    mostrarCancs();
}
botoAfegir.addEventListener("click", afegirCanco);
botoEsborrar.addEventListener("click", esborrarCanco);
mostrarCancs();
export {};
//# sourceMappingURL=Ex1Objectes.js.map