const s = new Set();
function addSong() {
    const input = document.getElementById("nom");
    const song = input.value.trim();
    s.add(song);
    updateList();
}
function removeSong() {
    const input = document.getElementById("nom");
    const song = input.value.trim();
    s.delete(song);
    updateList();
}
function updateList() {
    const textarea = document.getElementById("llista");
    textarea.value = Array.from(s).join("\n");
}
const addButton = document.getElementById("afegir");
addButton.addEventListener("click", addSong);
const removeButton = document.getElementById("esborrar");
removeButton.addEventListener("click", removeSong);
const textarea = document.getElementById("llista");
updateList();
export {};
//# sourceMappingURL=main.js.map