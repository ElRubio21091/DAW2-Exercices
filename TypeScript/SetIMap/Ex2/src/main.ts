/*
La nova plataforma de streaming Popflix ens ha encarregat una aplicació web per gestionar els seus usuaris.
De moment només cal implementar la gestió de les dades en memòria utilitzant un Map.
Com a clau, s'utilitzarà el DNI de l'usuari.
Les dades de cada usuari es guardaran en un objecte amb els següents atributs:

DNI
Nom i cognoms
E-mail
Targeta
Implementa els mètodes per afegir i esborrar usuaris, obtenir, mostrar i modificar les dades d'un usuari.
Implementa també mètodes per provar les funcions anteriors.
*/

const m = new Map();


const afegirButton = document.getElementById("afegir") as HTMLButtonElement;
afegirButton.addEventListener("click", () => {
    const dniInput = document.getElementById("dni") as HTMLInputElement;
    const nomInput = document.getElementById("nom") as HTMLInputElement;
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const targetaInput = document.getElementById("targeta") as HTMLInputElement;

    afegirUsuari(dniInput.value, nomInput.value, emailInput.value, targetaInput.value);
});

const esborrarButton = document.getElementById("esborrar") as HTMLButtonElement;
esborrarButton.addEventListener("click", () => {
    const dniInput = document.getElementById("dni") as HTMLInputElement;
    esborrarUsuari(dniInput.value);
});

const obtenerButton = document.getElementById("obtenir") as HTMLButtonElement;
obtenerButton.addEventListener("click", () => {
    const dniInput = document.getElementById("dni") as HTMLInputElement;
    mostrarUsuari(dniInput.value);
});

const modificarButton = document.getElementById("modificar") as HTMLButtonElement;
modificarButton.addEventListener("click", () => {
    const dniInput = document.getElementById("dni") as HTMLInputElement;
    const nomInput = document.getElementById("nom") as HTMLInputElement;
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const targetaInput = document.getElementById("targeta") as HTMLInputElement;

    modificarUsuari(dniInput.value, nomInput.value, emailInput.value, targetaInput.value);
});

const mostrarButton = document.getElementById("mostrar") as HTMLButtonElement;
mostrarButton.addEventListener("click", () => {
    const dniInput = document.getElementById("dni") as HTMLInputElement;
    mostrarUsuari(dniInput.value);
});

const provarButton = document.getElementById("provar") as HTMLButtonElement;
provarButton.addEventListener("click", () => {
    provar();
});


function afegirUsuari(dni: string, nom: string, email: string, targeta: string) {
    if (m.has(dni)) {
        console.log(`L'usuari amb DNI ${dni} ja existeix.`);
        return;
    }
    m.set(dni, { nom, email, targeta });
    console.log(`L'usuari amb DNI ${dni} ha estat afegit.`);
    updateList();   
}

function esborrarUsuari(dni: string) {
    if (!m.has(dni)) {
        console.log(`L'usuari amb DNI ${dni} no existeix.`);
        return;
    }
    m.delete(dni);
    console.log(`L'usuari amb DNI ${dni} ha estat esborrat.`);
    updateList();   
}

function obtenirUsuari(dni: string) {
    if (!m.has(dni)) {
        console.log(`L'usuari amb DNI ${dni} no existeix.`);
        return;
    }
    return m.get(dni);
}

function mostrarUsuari(dni: string) {
    const usuari = obtenirUsuari(dni);
    if (usuari) {
        console.log(`DNI: ${dni}, Nom: ${usuari.nom}, E-mail: ${usuari.email}, Targeta: ${usuari.targeta}`);
    }
}

function modificarUsuari(dni: string, nom?: string, email?: string, targeta?: string) {
    if (!m.has(dni)) {
        console.log(`L'usuari amb DNI ${dni} no existeix.`);
        return;
    }
    const usuari = m.get(dni);
    if (nom !== undefined) usuari.nom = nom;
    if (email !== undefined) usuari.email = email;
    if (targeta !== undefined) usuari.targeta = targeta;
    m.set(dni, usuari);
    console.log(`L'usuari amb DNI ${dni} ha estat modificat.`);
}

// Funcions de prova
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
    const textarea = document.getElementById("resultat") as HTMLTextAreaElement;
    textarea.value = Array.from(m.keys()).join("\n");
}

