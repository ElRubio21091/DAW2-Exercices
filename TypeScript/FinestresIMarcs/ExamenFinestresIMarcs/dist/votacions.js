const FILES = 2;
const COLUMNES = 2;
const VOTANTS = FILES * COLUMNES;
const canal = new BroadcastChannel("votacions");
const botoVotacions = document.getElementById("votacions");
const divResultats = document.getElementById("resultats");
let finestres = [];
let votants = new Set();
let resultats = new Map();
function mostrarResultats() {
    if (resultats.size === 0) {
        divResultats.textContent = "Encara no hi ha cap resultat";
        return;
    }
    divResultats.innerHTML = [...resultats.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([opcio, vots]) => `<p>${opcio}: ${vots}</p>`)
        .join("");
}
function obrirFinestres() {
    const amplada = Math.floor(screen.availWidth / COLUMNES);
    const alcada = Math.floor(screen.availHeight / FILES);
    finestres = Array.from({ length: VOTANTS }, (_, i) => {
        const esquerra = (i % COLUMNES) * amplada;
        const dalt = Math.floor(i / COLUMNES) * alcada;
        return window.open(`taula.html?id=${i}`, `finestra${i}`, `left=${esquerra},top=${dalt},width=${amplada},height=${alcada}`);
    }).filter((f) => f !== null);
}
function tancarFinestres() {
    finestres.forEach((f) => f.close());
    finestres = [];
}
botoVotacions.addEventListener("click", () => {
    tancarFinestres();
    votants = new Set();
    resultats = new Map();
    mostrarResultats();
    obrirFinestres();
});
canal.addEventListener("message", (event) => {
    const missatge = event.data;
    if (missatge.tipus !== "vot")
        return;
    const { id, dni, opcio } = missatge;
    const nou = !votants.has(dni);
    if (nou) {
        votants.add(dni);
        resultats.set(opcio, (resultats.get(opcio) ?? 0) + 1);
        mostrarResultats();
    }
    const resposta = { tipus: "resposta", id, registrat: nou };
    canal.postMessage(resposta);
});
mostrarResultats();
export {};
//# sourceMappingURL=votacions.js.map