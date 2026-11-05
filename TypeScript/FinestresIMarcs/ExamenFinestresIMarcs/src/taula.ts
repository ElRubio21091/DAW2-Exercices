// Tipus de missatges que s'envien entre finestres
type MissatgeVot = { tipus: "vot"; id: number; dni: string; opcio: string };
type MissatgeResposta = { tipus: "resposta"; id: number; registrat: boolean };

// BroadcastChannel per comunicar les finestres
const canal = new BroadcastChannel("votacions");
const id = Number(new URLSearchParams(window.location.search).get("id"));

const inputDni = document.getElementById("dni") as HTMLInputElement;
const botons = document.querySelectorAll<HTMLButtonElement>("button");

// Envía el vot quan es prem un botó
botons.forEach((boto) => {
	boto.addEventListener("click", () => {
        //Verificar que el DNI és vàlid
		const dni = inputDni.value.trim().toUpperCase();
		if (dni === "") {
			alert("Has d'introduir el DNI");
			return;
		}

        if (!/^\d{8}[A-Z]$/.test(dni)) {
            alert("El DNI ha de tenir 8 dígits seguits d'una lletra majúscula");
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

// Rep la resposta del servidor i mostra un alert
canal.addEventListener("message", (event: MessageEvent<MissatgeResposta>) => {
	const missatge = event.data;
	if (missatge.tipus !== "resposta" || missatge.id !== id) return;

	alert(missatge.registrat ? "Vot registrat" : "Aquest DNI ja ha votat");
});
