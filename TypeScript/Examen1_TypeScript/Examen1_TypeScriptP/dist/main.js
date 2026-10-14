import { DADES_PROVA } from './dades.js';
import { Contacte } from './contacte.js';
import { Agenda } from './agenda.js';
const inNom = document.getElementById("nom");
const inTelefon = document.getElementById("telefon");
const inEmail = document.getElementById("email");
const selCategoria = document.getElementById("categoria");
const divResultat = document.getElementById("resultat");
const btnAfegir = document.getElementById("btnAfegir");
const btnCercar = document.getElementById("btnCercar");
const btnModificar = document.getElementById("btnModificar");
const btnEliminar = document.getElementById("btnEliminar");
const btnLlistar = document.getElementById("btnLlistar");
const btnOrdenar = document.getElementById("btnOrdenar");
const btnFiltrar = document.getElementById("btnFiltrar");
btnAfegir.addEventListener("click", afegirContacte);
btnCercar.addEventListener("click", cercarContacte);
btnModificar.addEventListener("click", modificarContacte);
btnEliminar.addEventListener("click", eliminarContacte);
btnLlistar.addEventListener("click", llistarContactes);
btnOrdenar.addEventListener("click", ordenarContactes);
btnFiltrar.addEventListener("click", filtrarContactes);
function carregarDadesProva(dades) {
    let afegits = 0;
    let rebutjats = 0;
    for (const dada of dades) {
        try {
            const contacte = new Contacte(dada);
            Agenda.afegir(contacte);
            afegits++;
        }
        catch (error) {
            rebutjats++;
        }
    }
    alert(`S'han afegit ${afegits} contactes i s'han rebutjat ${rebutjats}.`);
}
carregarDadesProva(DADES_PROVA);
function afegirContacte() {
    const dades = {
        nom: inNom.value,
        telefon: inTelefon.value,
        email: inEmail.value,
        categoria: selCategoria.value
    };
    try {
        const contacte = new Contacte(dades);
        Agenda.afegir(contacte);
        divResultat.textContent = `Contacte afegit: ${contacte.ToString()}`;
    }
    catch (error) {
        divResultat.textContent = `Error: ${error.message}`;
        alert(`Error: ${error.message}`);
    }
}
function cercarContacte() {
    const telefon = inTelefon.value;
    const contacte = Agenda.cercar(telefon);
    if (contacte) {
        divResultat.textContent = `Contacte trobat: ${contacte.ToString()}`;
    }
    else {
        divResultat.textContent = `No s'ha trobat cap contacte amb el telèfon ${telefon}.`;
    }
}
function modificarContacte() {
    const telefon = inTelefon.value;
    const dades = {
        nom: inNom.value,
        telefon: inTelefon.value,
        email: inEmail.value,
        categoria: selCategoria.value
    };
    try {
        Agenda.modificar(telefon, dades);
        divResultat.textContent = `Contacte modificat: ${dades.nom} · ${dades.telefon} · ${dades.email} · (${dades.categoria})`;
    }
    catch (error) {
        divResultat.textContent = `Error: ${error.message}`;
        alert(`Error: ${error.message}`);
    }
}
function eliminarContacte() {
    const telefon = inTelefon.value;
    try {
        Agenda.eliminar(telefon);
        divResultat.textContent = `Contacte amb telèfon ${telefon} eliminat.`;
    }
    catch (error) {
        divResultat.textContent = `Error: ${error.message}`;
        alert(`Error: ${error.message}`);
    }
}
function llistarContactes() {
    const contactes = Agenda.llistar();
    if (contactes.length > 0) {
        divResultat.textContent = "Contactes:\n" + contactes.map(c => c.ToString()).join("\n");
    }
    else {
        divResultat.textContent = "No hi ha contactes a l'agenda.";
    }
}
function ordenarContactes() {
    const contactesOrdenats = Agenda.ordenats();
    if (contactesOrdenats.length > 0) {
        divResultat.textContent = "Contactes ordenats:\n" + contactesOrdenats.map(c => c.ToString()).join("\n");
    }
    else {
        divResultat.textContent = "No hi ha contactes a l'agenda.";
    }
}
function filtrarContactes() {
    const categoria = selCategoria.value;
    const contactesFiltrats = Agenda.filtrarPerCategoria(categoria);
    if (contactesFiltrats.length > 0) {
        divResultat.textContent = `Contactes amb categoria ${categoria}:\n` + contactesFiltrats.map(c => c.ToString()).join("\n");
    }
    else {
        divResultat.textContent = `No hi ha contactes amb categoria ${categoria}.`;
        alert(`No hi ha contactes amb categoria ${categoria}.`);
    }
}
//# sourceMappingURL=main.js.map