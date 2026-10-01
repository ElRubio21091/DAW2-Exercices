/*
2 - Usuaris de Popflix (versió amb millores)

Millores respecte a la versió original:
1. interface Usuari (amb el DNI dins l'objecte) i Map<string, Usuari> tipat.
2. Menys repetició: helpers per llegir inputs i enganxar botons.
3. Les funcions retornen boolean en lloc de només fer console.log,
   així provar() pot comprovar els resultats de veritat.
4. Validació: DNI buit, i trim() + majúscules al DNI (12345678a == 12345678A).
5. modificarUsuari ignora els camps buits (ja no esborra dades sense voler).
6. "Mostrar tots" mostra tots els usuaris complets; "Obtenir" omple el formulari.
*/

interface Usuari {
    dni: string;
    nom: string;
    email: string;
    targeta: string;
}

// Abans: const m = new Map();  (Map<any, any>, sense control de tipus)
const usuaris = new Map<string, Usuari>();

// ---------- Helpers del DOM ----------

// Abans: const dniInput = document.getElementById("dni") as HTMLInputElement;
function getInput(id: string): HTMLInputElement {
    return document.getElementById(id) as HTMLInputElement;
}

// Abans: getElementById + addEventListener en dos passos per cada botó
function on(id: string, handler: () => void): void {
    document.getElementById(id)!.addEventListener("click", handler);
}

// Llegeix els 4 inputs de cop i retorna un Usuari net
function llegirFormulari(): Usuari {
    return {
        dni: getInput("dni").value.trim().toUpperCase(),
        nom: getInput("nom").value.trim(),
        email: getInput("email").value.trim(),
        targeta: getInput("targeta").value.trim(),
    };
}

// Escriu un text al <textarea id="resultat">
function escriure(text: string): void {
    (document.getElementById("resultat") as HTMLTextAreaElement).value = text;
}

function mostrarDnis(): void {
    escriure(Array.from(usuaris.keys()).join("\n"));
}

function formatUsuari(u: Usuari): string {
    return `${u.dni} - ${u.nom} - ${u.email} - ${u.targeta}`;
}

// ---------- Lògica (Map) ----------

function afegirUsuari(usuari: Usuari): boolean {
    if (!usuari.dni || usuaris.has(usuari.dni)) return false;
    usuaris.set(usuari.dni, usuari);
    return true;
}

function esborrarUsuari(dni: string): boolean {
    return usuaris.delete(dni); // delete ja retorna true/false
}

function obtenirUsuari(dni: string): Usuari | undefined {
    return usuaris.get(dni);
}

function mostrarUsuari(dni: string): string {
    const usuari = obtenirUsuari(dni);
    return usuari ? formatUsuari(usuari) : `L'usuari amb DNI ${dni} no existeix.`;
}

// Partial<Omit<Usuari, "dni">>: es pot passar qualsevol subconjunt de nom/email/targeta
function modificarUsuari(dni: string, canvis: Partial<Omit<Usuari, "dni">>): boolean {
    const usuari = usuaris.get(dni);
    if (!usuari) return false;
    // if (canvis.nom) és fals tant per undefined com per "" -> no s'esborra res
    if (canvis.nom) usuari.nom = canvis.nom;
    if (canvis.email) usuari.email = canvis.email;
    if (canvis.targeta) usuari.targeta = canvis.targeta;
    return true;
}

// ---------- Botons ----------

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

on("provar", provar); // funciona encara que provar es declari més avall (hoisting)

// ---------- Proves ----------

function provar(): void {
    usuaris.clear(); // les proves sempre parteixen de zero
    const resultats: string[] = [];
    const comprova = (descripcio: string, condicio: boolean) =>
        resultats.push(`${condicio ? "OK   " : "ERROR"} - ${descripcio}`);

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
