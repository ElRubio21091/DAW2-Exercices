const usuaris = new Map();
function getInput(id) {
    return document.getElementById(id);
}
function on(id, handler) {
    document.getElementById(id).addEventListener("click", handler);
}
function llegirFormulari() {
    return {
        dni: getInput("dni").value.trim().toUpperCase(),
        nom: getInput("nom").value.trim(),
        email: getInput("email").value.trim(),
        targeta: getInput("targeta").value.trim(),
    };
}
function escriure(text) {
    document.getElementById("resultat").value = text;
}
function mostrarDnis() {
    escriure(Array.from(usuaris.keys()).join("\n"));
}
function formatUsuari(u) {
    return `${u.dni} - ${u.nom} - ${u.email} - ${u.targeta}`;
}
function afegirUsuari(usuari) {
    if (!usuari.dni || usuaris.has(usuari.dni))
        return false;
    usuaris.set(usuari.dni, usuari);
    return true;
}
function esborrarUsuari(dni) {
    return usuaris.delete(dni);
}
function obtenirUsuari(dni) {
    return usuaris.get(dni);
}
function mostrarUsuari(dni) {
    const usuari = obtenirUsuari(dni);
    return usuari ? formatUsuari(usuari) : `L'usuari amb DNI ${dni} no existeix.`;
}
function modificarUsuari(dni, canvis) {
    const usuari = usuaris.get(dni);
    if (!usuari)
        return false;
    if (canvis.nom)
        usuari.nom = canvis.nom;
    if (canvis.email)
        usuari.email = canvis.email;
    if (canvis.targeta)
        usuari.targeta = canvis.targeta;
    return true;
}
on("afegir", () => {
    const ok = afegirUsuari(llegirFormulari());
    console.log(ok ? "Usuari afegit." : "DNI buit o usuari ja existent.");
    mostrarDnis();
});
on("esborrar", () => {
    const ok = esborrarUsuari(llegirFormulari().dni);
    console.log(ok ? "Usuari esborrat." : "L'usuari no existeix.");
    mostrarDnis();
});
on("obtenir", () => {
    const usuari = obtenirUsuari(llegirFormulari().dni);
    if (!usuari) {
        escriure("L'usuari no existeix.");
        return;
    }
    getInput("nom").value = usuari.nom;
    getInput("email").value = usuari.email;
    getInput("targeta").value = usuari.targeta;
    escriure(formatUsuari(usuari));
});
on("modificar", () => {
    const { dni, nom, email, targeta } = llegirFormulari();
    const ok = modificarUsuari(dni, { nom, email, targeta });
    escriure(ok ? `Usuari modificat:\n${mostrarUsuari(dni)}` : "L'usuari no existeix.");
});
on("mostrar", () => {
    escriure(Array.from(usuaris.values()).map(formatUsuari).join("\n"));
});
on("provar", provar);
function provar() {
    usuaris.clear();
    const resultats = [];
    const comprova = (descripcio, condicio) => resultats.push(`${condicio ? "OK   " : "ERROR"} - ${descripcio}`);
    comprova("afegir usuari 1", afegirUsuari({ dni: "12345678A", nom: "Joan Garcia", email: "joan@exemple.com", targeta: "1234567890123456" }));
    comprova("afegir usuari 2", afegirUsuari({ dni: "87654321B", nom: "Maria Rodriguez", email: "maria@exemple.com", targeta: "6543210987654321" }));
    comprova("no permet DNI duplicat", !afegirUsuari({ dni: "12345678A", nom: "Altre", email: "", targeta: "" }));
    comprova("obtenir usuari existent", obtenirUsuari("12345678A")?.nom === "Joan Garcia");
    comprova("modificar e-mail", modificarUsuari("12345678A", { email: "nou@exemple.com" }));
    comprova("el nom no s'ha perdut", obtenirUsuari("12345678A")?.nom === "Joan Garcia");
    comprova("l'e-mail s'ha canviat", obtenirUsuari("12345678A")?.email === "nou@exemple.com");
    comprova("esborrar usuari 2", esborrarUsuari("87654321B"));
    comprova("usuari 2 ja no existeix", obtenirUsuari("87654321B") === undefined);
    comprova("modificar inexistent falla", !modificarUsuari("00000000Z", { nom: "X" }));
    escriure(resultats.join("\n"));
}
export {};
//# sourceMappingURL=main.js.map