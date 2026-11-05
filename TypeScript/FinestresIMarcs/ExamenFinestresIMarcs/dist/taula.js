const canal = new BroadcastChannel("votacions");
const id = Number(new URLSearchParams(window.location.search).get("id"));
const inputDni = document.getElementById("dni");
const botons = document.querySelectorAll("button");
botons.forEach((boto) => {
    boto.addEventListener("click", () => {
        const dni = inputDni.value.trim().toUpperCase();
        if (dni === "") {
            alert("Has d'introduir el DNI");
            return;
        }
        if (!/^\d{8}[A-Z]$/.test(dni)) {
            alert("El DNI ha de tenir 8 dígits seguits d'una lletra majúscula");
            return;
        }
        const vot = {
            tipus: "vot",
            id,
            dni,
            opcio: boto.textContent ?? boto.id,
        };
        canal.postMessage(vot);
    });
});
canal.addEventListener("message", (event) => {
    const missatge = event.data;
    if (missatge.tipus !== "resposta" || missatge.id !== id)
        return;
    alert(missatge.registrat ? "Vot registrat" : "Aquest DNI ja ha votat");
});
export {};
//# sourceMappingURL=taula.js.map