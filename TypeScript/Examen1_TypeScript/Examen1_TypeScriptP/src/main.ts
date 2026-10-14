import { DADES_PROVA } from './dades.js';
import { Contacte, TDadesContacte } from './contacte.js';
import { Agenda } from './agenda.js';

// Inputs i resultats
const inNom = <HTMLInputElement>document.getElementById("nom");
const inTelefon = <HTMLInputElement>document.getElementById("telefon");
const inEmail = <HTMLInputElement>document.getElementById("email");
const selCategoria = <HTMLSelectElement>document.getElementById("categoria");
const divResultat = <HTMLDivElement>document.getElementById("resultat");

// Botons
const btnAfegir = document.getElementById("btnAfegir")!;
const btnCercar = document.getElementById("btnCercar")!;
const btnModificar = document.getElementById("btnModificar")!;
const btnEliminar = document.getElementById("btnEliminar")!;
const btnLlistar = document.getElementById("btnLlistar")!;
const btnOrdenar = document.getElementById("btnOrdenar")!;
const btnFiltrar = document.getElementById("btnFiltrar")!;


// TODO: escriu aquí les funcions per gestionar les accions de l'usuari (clics en els botons)
btnAfegir.addEventListener("click", afegirContacte);
btnCercar.addEventListener("click", cercarContacte);
btnModificar.addEventListener("click", modificarContacte);
btnEliminar.addEventListener("click", eliminarContacte);
btnLlistar.addEventListener("click", llistarContactes);
btnOrdenar.addEventListener("click", ordenarContactes);
btnFiltrar.addEventListener("click", filtrarContactes);


// TODO: aquesta funció ha de ser anònima i autoexecutable per carregar dades de dades.ts al encendre l'aplicacio. 
(function (dades: TDadesContacte[]): void {
    // TODO: escriu aquí el codi per carregar les dades de prova
    let afegits = 0;
    let rebutjats = 0;

    for (const dada of dades) {
        try {
            const contacte = new Contacte(dada);
            Agenda.afegir(contacte);
            afegits++;
        } catch (error) {
            rebutjats++;
        }
    }

    alert(`S'han afegit ${afegits} contactes i s'han rebutjat ${rebutjats}.`);
})(DADES_PROVA as TDadesContacte[]);


function afegirContacte() {
    const dades: TDadesContacte = {
        nom: inNom.value,
        telefon: inTelefon.value,
        email: inEmail.value,
        categoria: selCategoria.value as "familia" | "amics" | "feina"
    };

    try {
        const contacte = new Contacte(dades);
        Agenda.afegir(contacte);
        divResultat.textContent = `Contacte afegit: ${contacte.ToString()}`;
    } catch (error) {
        divResultat.textContent = `Error: ${(error as Error).message}`;
        alert(`Error: ${(error as Error).message}`);
    }
}

function cercarContacte() {
    const telefon = inTelefon.value;
    const contacte = Agenda.cercar(telefon);
    if (contacte) {
        divResultat.textContent = `Contacte trobat: ${contacte.ToString()}`;
    } else {
        divResultat.textContent = `No s'ha trobat cap contacte amb el telèfon ${telefon}.`;
    }   
}

function modificarContacte() {
    const telefon = inTelefon.value;
    const dades: TDadesContacte = {
        nom: inNom.value,
        telefon: inTelefon.value,
        email: inEmail.value,
        categoria: selCategoria.value as "familia" | "amics" | "feina"
    };

    try {
        Agenda.modificar(telefon, dades);
        divResultat.textContent = `Contacte modificat: ${dades.nom} · ${dades.telefon} · ${dades.email} · (${dades.categoria})`;
    } catch (error) {
        divResultat.textContent = `Error: ${(error as Error).message}`;
        alert(`Error: ${(error as Error).message}`);
    }
}

function eliminarContacte() {
    const telefon = inTelefon.value;
    try {
        Agenda.eliminar(telefon);
        divResultat.textContent = `Contacte amb telèfon ${telefon} eliminat.`;
    } catch (error) {
        divResultat.textContent = `Error: ${(error as Error).message}`;
        alert(`Error: ${(error as Error).message}`);
    }
}

function llistarContactes() {
    const contactes = Agenda.llistar();
    if (contactes.length > 0) {
        divResultat.textContent = "Contactes:\n" + contactes.map(c => c.ToString()).join("\n");
    } else {
        divResultat.textContent = "No hi ha contactes a l'agenda.";
    }
}

function ordenarContactes() {
    const contactesOrdenats = Agenda.ordenats();
    if (contactesOrdenats.length > 0) {
        divResultat.textContent = "Contactes ordenats:\n" + contactesOrdenats.map(c => c.ToString()).join("\n");
    } else {
        divResultat.textContent = "No hi ha contactes a l'agenda.";
    }
}

function filtrarContactes() {
    const categoria = selCategoria.value as "familia" | "amics" | "feina";
    const contactesFiltrats = Agenda.filtrarPerCategoria(categoria);
    if (contactesFiltrats.length > 0) {
        divResultat.textContent = `Contactes amb categoria ${categoria}:\n` + contactesFiltrats.map(c => c.ToString()).join("\n");
    } else {
        divResultat.textContent = `No hi ha contactes amb categoria ${categoria}.`;
        alert(`No hi ha contactes amb categoria ${categoria}.`);
    }
}