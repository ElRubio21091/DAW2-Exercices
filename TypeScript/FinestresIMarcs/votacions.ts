// Constants de la graella de finestres
const FILES = 2;
const COLUMNES = 3;

type MissatgeVot = { tipus: "vot"; id: number; dni: string; opcio: string };
type MissatgeResposta = { tipus: "resposta"; id: number; registrat: boolean };

const canal = new BroadcastChannel("votacions");

const botoVotacions = document.getElementById("votacions") as HTMLButtonElement;
const divResultats = document.getElementById("resultats") as HTMLDivElement;

let finestres: Window[] = [];
let votants = new Set<string>();
let resultats = new Map<string, number>();

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

function obrirFinestres(): void {
	const amplada = Math.floor(screen.availWidth / COLUMNES);
	const alcada = Math.floor(screen.availHeight / FILES);

	finestres = Array.from({ length: FILES * COLUMNES }, (_, i) => {
		const esquerra = (i % COLUMNES) * amplada;
		const dalt = Math.floor(i / COLUMNES) * alcada;
		return window.open(
			`taula.html?id=${i}`,
			`taula-${i}`,
			`left=${esquerra},top=${dalt},width=${amplada},height=${alcada}`
		);
	}).filter((f): f is Window => f !== null);
}

botoVotacions.addEventListener("click", () => {
	// Tancar les finestres secundàries que estiguin obertes
	finestres.forEach((f) => f.close());
	finestres = [];

	// Reiniciar votants i resultats
	votants = new Set<string>();
	resultats = new Map<string, number>();
	mostrarResultats();

	obrirFinestres();
});

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
