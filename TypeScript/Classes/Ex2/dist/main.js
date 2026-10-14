const LLETRES_NIF = "TRWAGMYFPDXBNJZSQVHLCKE";
function validarNif(nif) {
    const m = /^(\d{8})([A-Z])$/.exec(nif);
    if (!m)
        return false;
    return LLETRES_NIF[Number(m[1]) % 23] === m[2];
}
function formatEuros(n) {
    return n.toFixed(2).replace(".", ",") + " €";
}
function formatData(iso) {
    const [any, mes, dia] = iso.split("-");
    return `${dia}-${mes}-${any}`;
}
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
function missatgeError(e) {
    return e instanceof Error ? e.message : String(e);
}
let comptadorClients = 10;
const MAX_CLIENTS = 99;
let comptadorFactures = 100;
const MAX_FACTURES = 999;
const Client = function (nif, nom, cognoms) {
    nif = nif.trim().toUpperCase();
    nom = nom.trim();
    cognoms = cognoms.trim();
    if (!validarNif(nif))
        throw new Error(`El NIF ${nif} no és correcte.`);
    if (!nom || !cognoms)
        throw new Error("El nom i els cognoms són obligatoris.");
    if (comptadorClients > MAX_CLIENTS) {
        throw new Error("S'ha arribat al nombre màxim de clients.");
    }
    this.id = comptadorClients++;
    this.nif = nif;
    this.nom = nom;
    this.cognoms = cognoms;
};
const Factura = function (idClient, data, total, pagada) {
    if (!GestioClients.cercar(idClient)) {
        throw new Error(`No existeix cap client amb l'identificador ${idClient}.`);
    }
    if (!data)
        throw new Error("La data és obligatòria.");
    if (!Number.isFinite(total) || total <= 0) {
        throw new Error("L'import ha de ser un número major que 0.");
    }
    if (comptadorFactures > MAX_FACTURES) {
        throw new Error("S'ha arribat al nombre màxim de factures.");
    }
    this.id = comptadorFactures++;
    this.idClient = idClient;
    this.data = data;
    this.total = total;
    this.pagada = pagada;
};
function GestioFactures() { }
GestioFactures.factures = [];
GestioFactures.afegir = function (factura) {
    GestioFactures.factures.push(factura);
};
GestioFactures.delClient = function (idClient) {
    return GestioFactures.factures.filter((f) => f.idClient === idClient);
};
GestioFactures.totalClient = function (idClient) {
    return GestioFactures.delClient(idClient).reduce((s, f) => s + f.total, 0);
};
GestioFactures.pendentClient = function (idClient) {
    return GestioFactures.delClient(idClient)
        .filter((f) => !f.pagada)
        .reduce((s, f) => s + f.total, 0);
};
GestioFactures.generarTaula = function (idClient) {
    const files = GestioFactures.delClient(idClient)
        .map((f) => `<tr>
        <td>${f.id}</td>
        <td>${formatData(f.data)}</td>
        <td>${formatEuros(f.total)}</td>
        <td>${f.pagada ? "Sí" : "No"}</td>
      </tr>`)
        .join("");
    return `<table border="1">
    <tr><th>Id</th><th>Data</th><th>Total</th><th>Pagada</th></tr>
    ${files}
  </table>`;
};
function GestioClients() { }
GestioClients.clients = [];
GestioClients.afegir = function (client) {
    if (GestioClients.clients.some((c) => c.nif === client.nif)) {
        throw new Error(`Ja existeix un client amb el NIF ${client.nif}.`);
    }
    GestioClients.clients.push(client);
};
GestioClients.cercar = function (id) {
    return GestioClients.clients.find((c) => c.id === id);
};
GestioClients.generarTaula = function () {
    const files = GestioClients.clients
        .map((c) => `<tr>
        <td>${c.id}</td>
        <td>${escapeHtml(c.nif)}</td>
        <td>${escapeHtml(c.cognoms)}, ${escapeHtml(c.nom)}</td>
        <td>${formatEuros(GestioFactures.totalClient(c.id))}</td>
        <td>${formatEuros(GestioFactures.pendentClient(c.id))}</td>
      </tr>`)
        .join("");
    return `<table border="1">
    <tr><th>Id</th><th>NIF</th><th>Cognoms, Nom</th><th>Total</th><th>Pendent</th></tr>
    ${files}
  </table>`;
};
const Aplicacio = {
    clientSeleccionat: undefined,
    $(id) {
        const el = document.getElementById(id);
        if (!el)
            throw new Error(`No existeix l'element #${id}`);
        return el;
    },
    init() {
        this.$("btnClient").addEventListener("click", () => this.afegirClient());
        this.$("btnSeleccionar").addEventListener("click", () => this.seleccionarClient());
        this.$("btnFactura").addEventListener("click", () => this.afegirFactura());
        this.pintarClients();
    },
    pintarClients() {
        this.$("taulaClients").innerHTML = GestioClients.generarTaula();
    },
    pintarFactures() {
        this.$("taulaFactures").innerHTML =
            this.clientSeleccionat === undefined
                ? ""
                : GestioFactures.generarTaula(this.clientSeleccionat);
    },
    afegirClient() {
        const nif = this.$("nif");
        const nom = this.$("nom");
        const cognoms = this.$("cognoms");
        try {
            GestioClients.afegir(new Client(nif.value, nom.value, cognoms.value));
            nif.value = nom.value = cognoms.value = "";
            this.pintarClients();
        }
        catch (e) {
            alert(missatgeError(e));
        }
    },
    seleccionarClient() {
        const id = Number(this.$("clientId").value);
        if (!GestioClients.cercar(id)) {
            this.clientSeleccionat = undefined;
            this.pintarFactures();
            alert(`No existeix cap client amb l'identificador ${id}.`);
            return;
        }
        this.clientSeleccionat = id;
        this.pintarFactures();
    },
    afegirFactura() {
        if (this.clientSeleccionat === undefined) {
            alert("Primer has de seleccionar un client.");
            return;
        }
        const data = this.$("data");
        const total = this.$("total");
        const pagada = this.$("pagada");
        try {
            GestioFactures.afegir(new Factura(this.clientSeleccionat, data.value, parseFloat(total.value.replace(",", ".")), pagada.checked));
            data.value = total.value = "";
            pagada.checked = false;
            this.pintarFactures();
            this.pintarClients();
        }
        catch (e) {
            alert(missatgeError(e));
        }
    },
};
Aplicacio.init();
export {};
//# sourceMappingURL=main.js.map