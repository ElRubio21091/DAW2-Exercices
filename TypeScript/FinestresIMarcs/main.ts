/* Has de crear una aplicació web amb TypeScript que permeti seguir unes votacions en temps real utilitzant múltiples 
finestres i comunicació via localStorage o BroadcastChannel.

L’aplicació té:

Una finestra principal (votacions.html) amb un botó "Començar votacions" i un espai per mostrar els resultats actuals.
Diverses finestres secundàries (taula.html) on s'ha d'introduir el DNI del votant i triar entre diverses opcions (un botó per cada opció).
El nombre de botons pot variar.
Quan es prem el botó "Començar votacions" s'han d'esborrar les finestres secundàries que estiguin obertes, crear un conjunt de finestres distribuïdes de forma uniforme en tantes files i columnes com indiquin unes constants i reiniciar els votants i els resultats.

La finestra principal ha de detectar les votacions i:

Comprovar si el DNI ja ha votat (s'han de guardar en un Set).
Actualitzar els resultats en temps real (s'han de guardar en un Map).
Enviar un missatge a la finestra corresponent indicant si el vot s’ha registrat o ja existia.
Els resultats s’han de mostrar ordenats pel nombre de vots de cada opció o el missatge
"Encara no hi ha cap resultat" si encara no hi ha cap vot.

Intenta evitar bucles quan es puguin utilitzar les funcions forEach, map... amb els arrays

*/

const STORAGE_KEY = "votacions";

const results = new Map<string, number>();
const votedDNI = new Set<string>();
const options = ["Pizza", "Hamburguesa", "Salmó", "Pollastre"]; // Pots afegir més opcions si cal
const numfinestres = 4; // Nombre de finestres secundàries a crear
const files = 2; // Nombre de files per distribuir les finestres
const columnes = 2; // Nombre de columnes per distribuir les finestres

// Elements del HTML
const votacions = document.getElementById("votacions") as HTMLDivElement;
const startBtn = document.getElementById("startBtn") as HTMLButtonElement;
const resultsDiv = document.getElementById("results") as HTMLDivElement;
const optionButtonsDiv = document.getElementById("optionButtons") as HTMLDivElement;    
const dniInput = document.getElementById("dni") as HTMLInputElement;
const voteBtn = document.getElementById("voteBtn") as HTMLButtonElement;

startBtn.addEventListener("click", startVoting);
voteBtn.addEventListener("click", registerVote); 

function renderResults(): void {
  if (results.size === 0) {
    resultsDiv.textContent = "Encara no hi ha cap resultat";
    return;
  }

  // Ordena els resultats per nombre de vots
  const sortedResults = Array.from(results.entries()).sort((a, b) => b[1] - a[1]);
  resultsDiv.innerHTML = sortedResults.map(([option, votes]) => `<p>${option}: ${votes} vots</p>`).join("");
}

function openWindows(): void {
  const windowWidth = 400;
  const windowHeight = 300;
  const spacing = 20;

  for (let i = 0; i < numfinestres; i++) {
    const row = Math.floor(i / columnes);
    const col = i % columnes;
    const left = col * (windowWidth + spacing);
    const top = row * (windowHeight + spacing);

    window.open("", `finestra_${i}`, `width=${windowWidth},height=${windowHeight},left=${left},top=${top}`);
  }
}

function closeWindows(): void {
  for (let i = 0; i < numfinestres; i++) {
    const win = window.open("", `finestra_${i}`);
    if (win) {
      win.close();
    }
  }
}

function registerVote(): void {
  const dni = dniInput.value.trim();
  const selectedOption = document.querySelector("input[name='option']:checked") as HTMLInputElement;

  if (!dni) {
    alert("Si us plau, introdueix el teu DNI.");
    return;
  }

  if (!selectedOption) {
    alert("Si us plau, selecciona una opció.");
    return;
  }

  if (votedDNI.has(dni)) {
    alert("Aquest DNI ja ha votat.");
    return;
  }

  votedDNI.add(dni);
  const option = selectedOption.value;
  results.set(option, (results.get(option) || 0) + 1);
  renderResults();
}

// Funció per iniciar les votacions
function startVoting(): void {
    // Reinicia els resultats i els votants
    results.clear();
    votedDNI.clear();
    renderResults();
    openWindows();
}
