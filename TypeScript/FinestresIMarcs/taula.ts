type MissatgeVot = { tipus: "vot"; id: number; dni: string; opcio: string };
type MissatgeResposta = { tipus: "resposta"; id: number; registrat: boolean };

const canal = new BroadcastChannel("votacions");
const id = Number(new URLSearchParams(window.location.search).get("id"));

const inputDni = document.getElementById("dni") as HTMLInputElement;
const botons = document.querySelectorAll<HTMLButtonElement>("button");

botons.forEach((boto) => {
	boto.addEventListener("click", () => {
		const dni = inputDni.value.trim().toUpperCase();
		if (dni === "") {
			alert("Has d'introduir el DNI");
			return;
		}
		const vot: MissatgeVot = {
			tipus: "vot",
			id,
			dni,
			opcio: boto.textContent ?? boto.id,
		};
		canal.postMessage(vot);
	});
});

canal.addEventListener("message", (event: MessageEvent<MissatgeResposta>) => {
	const missatge = event.data;
	if (missatge.tipus !== "resposta" || missatge.id !== id) return;

	alert(missatge.registrat ? "Vot registrat" : "Aquest DNI ja ha votat");
});
