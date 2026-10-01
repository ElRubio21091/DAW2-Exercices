const m = new Map();
const afegirButton = document.getElementById("afegir");
afegirButton.addEventListener("click", () => {
    const dniInput = document.getElementById("dni");
    const nomInput = document.getElementById("nom");
    const emailInput = document.getElementById("email");
    const targetaInput = document.getElementById("targeta");
    afegirUsuari(dniInput.value, nomInput.value, emailInput.value, targetaInput.value);
});
const esborrarButton = document.getElementById("esborrar");
esborrarButton.addEventListener("click", () => {
    const dniInput = document.getElementById("dni");
    esborrarUsuari(dniInput.value);
});
const obtenerButton = document.getElementById("obtenir");
obtenerButton.addEventListener("click", () => {
    const dniInput = document.getElementById("dni");
    mostrarUsuari(dniInput.value);
});
const modificarButton = document.getElementById("modificar");
modificarButton.addEventListener("click", () => {
    const dniInput = document.getElementById("dni");
    const nomInput = document.getElementById("nom");
    const emailInput = document.getElementById("email");
    const targetaInput = document.getElementById("targeta");
    modificarUsuari(dniInput.value, nomInput.value, emailInput.value, targetaInput.value);
});
const mostrarButton = document.getElementById("mostrar");
mostrarButton.addEventListener("click", () => {
    const dniInput = document.getElementById("dni");
    mostrarUsuari(dniInput.value);
});
const provarButton = document.getElementById("provar");
provarButton.addEventListener("click", () => {
    provar();
});
function afegirUsuari(dni, nom, email, targeta) {
    if (m.has(dni)) {
        console.log(`L'usuari amb DNI ${dni} ja existeix.`);
        return;
    }
    m.set(dni, { nom, email, targeta });
    console.log(`L'usuari amb DNI ${dni} ha estat afegit.`);
    updateList();
}
function esborrarUsuari(dni) {
    if (!m.has(dni)) {
        console.log(`L'usuari amb DNI ${dni} no existeix.`);
        return;
    }
    m.delete(dni);
    console.log(`L'usuari amb DNI ${dni} ha estat esborrat.`);
    updateList();
}
function obtenirUsuari(dni) {
    if (!m.has(dni)) {
        console.log(`L'usuari amb DNI ${dni} no existeix.`);
        return;
    }
    return m.get(dni);
}
function mostrarUsuari(dni) {
    const usuari = obtenirUsuari(dni);
    if (usuari) {
        console.log(`DNI: ${dni}, Nom: ${usuari.nom}, E-mail: ${usuari.email}, Targeta: ${usuari.targeta}`);
    }
}
function modificarUsuari(dni, nom, email, targeta) {
    if (!m.has(dni)) {
        console.log(`L'usuari amb DNI ${dni} no existeix.`);
        return;
    }
    const usuari = m.get(dni);
    if (nom !== undefined)
        usuari.nom = nom;
    if (email !== undefined)
        usuari.email = email;
    if (targeta !== undefined)
        usuari.targeta = targeta;
    m.set(dni, usuari);
    console.log(`L'usuari amb DNI ${dni} ha estat modificat.`);
}
function provar() {
    afegirUsuari('12345678A', 'Joan Garcia', 'joan.garcia@exemple.com', '1234567890123456');
    afegirUsuari('87654321B', 'Maria Rodriguez', 'maria.rodriguez@exemple.com', '6543210987654321');
    mostrarUsuari('12345678A');
    mostrarUsuari('87654321B');
    modificarUsuari('12345678A', undefined, 'joan.garcia.actualitzat@exemple.com');
    mostrarUsuari('12345678A');
    esborrarUsuari('87654321B');
    mostrarUsuari('87654321B');
}
function updateList() {
    const textarea = document.getElementById("resultat");
    textarea.value = Array.from(m.keys()).join("\n");
}
export {};
//# sourceMappingURL=main.js.map