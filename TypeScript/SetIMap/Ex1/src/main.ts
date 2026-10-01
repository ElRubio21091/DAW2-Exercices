/*
L'aplicació ha de contenir un <textarea> on es mostrarà la llista i un <input>
 per posar el nom d'una cançò (o videojoc o objecte d'una col·lecció...).
També ha de tenir un botó per afegir la cançò a la llista i un altre per esborrar-la.

Les dades s'han de guardar en un Set i s'han de mostrar en el <textarea> cada cop que s'afegeixi o s'eborri un element.
Verifica que, encara que afegeixis algun element duplicat, a la llista només apareix un cop.
*/

const s = new Set();

function addSong() {
    const input = document.getElementById("nom") as HTMLInputElement;
    const song = input.value.trim();
    s.add(song);
    updateList();
}

function removeSong() {
    const input = document.getElementById("nom") as HTMLInputElement;
    const song = input.value.trim();
    s.delete(song);
    updateList();
}

function updateList() {
    const textarea = document.getElementById("llista") as HTMLTextAreaElement;
    textarea.value = Array.from(s).join("\n");
}

const addButton = document.getElementById("afegir") as HTMLButtonElement;
addButton.addEventListener("click", addSong);

const removeButton = document.getElementById("esborrar") as HTMLButtonElement;
removeButton.addEventListener("click", removeSong);

const textarea = document.getElementById("llista") as HTMLTextAreaElement;
updateList();

