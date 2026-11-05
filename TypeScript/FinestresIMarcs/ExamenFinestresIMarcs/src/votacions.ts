// Constants de la graella de finestres
const FILES = 2;
const COLUMNES = 2;
const VOTANTS = FILES * COLUMNES;

// Tipus de missatges que s'envien entre finestres
type MissatgeVot = { tipus: "vot"; id: number; dni: string; opcio: string };
type MissatgeResposta = { tipus: "resposta"; id: number; registrat: boolean };

// BroadcastChannel per comunicar les finestres
const canal = new BroadcastChannel("votacions");

const botoVotacions = document.getElementById("votacions") as HTMLButtonElement;
const divResultats = document.getElementById("resultats") as HTMLDivElement;

// Guardem les finestres obertes, els votants i els resultats
let finestres: Window[] = [];
let votants = new Set<string>();
let resultats = new Map<string, number>();

// Obté els resultats i els mostra al divResultats
function mostrarResultats(): void {
	if (resultats.size === 0) {
		divResultats.textContent = "Encara no hi ha cap resultat";
		return;
	}
	divResultats.innerHTML = [...resultats.entries()]
		.sort((a, b) => b[1] - a[1])
		.map(([opcio, vots]) => `<p>${opcio}: ${vots}</p>`)
		.join("");
}

// Obre les finestres de votació i les guarda a l'array finestres
function obrirFinestres(): void {
	const amplada = Math.floor(screen.availWidth / COLUMNES);
	const alcada = Math.floor(screen.availHeight / FILES);
	finestres = Array.from({ length: VOTANTS }, (_, i) => {
		const esquerra = (i % COLUMNES) * amplada;
		const dalt = Math.floor(i / COLUMNES) * alcada;
		return window.open(
			`taula.html?id=${i}`,
			`finestra${i}`,
			`left=${esquerra},top=${dalt},width=${amplada},height=${alcada}`
		);
	}).filter((f): f is Window => f !== null);
}

// Tanca totes les finestres obertes i buida l'array finestres
function tancarFinestres(): void {
    finestres.forEach((f) => f.close());
    finestres = [];
}

// Al prémer el botó de reiniciar, tanquem les finestres, reiniciem els resultats i tornem a obrir les finestres
botoVotacions.addEventListener("click", () => {
	tancarFinestres();

	// Reiniciar votants i resultats
	votants = new Set<string>();
	resultats = new Map<string, number>();
	mostrarResultats();

	obrirFinestres();
});

// Rep els missatges de vot i actualitza els resultats
canal.addEventListener("message", (event: MessageEvent<MissatgeVot>) => {
	const missatge = event.data;
	if (missatge.tipus !== "vot") return;

	const { id, dni, opcio } = missatge;
	const nou = !votants.has(dni);

	if (nou) {
		votants.add(dni);
		resultats.set(opcio, (resultats.get(opcio) ?? 0) + 1);
		mostrarResultats();
	}

	const resposta: MissatgeResposta = { tipus: "resposta", id, registrat: nou };
	canal.postMessage(resposta);
});

mostrarResultats();
