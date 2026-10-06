/* ===================== Tipos ===================== */
interface IClient {
  id: number;
  nif: string;
  nom: string;
  cognoms: string;
}
interface IClientConstructor {
  new (nif: string, nom: string, cognoms: string): IClient;
}

interface IFactura {
  id: number;
  idClient: number;
  data: string; // yyyy-mm-dd
  total: number;
  pagada: boolean;
}
interface IFacturaConstructor {
  new (idClient: number, data: string, total: number, pagada: boolean): IFactura;
}

/* ===================== Utilitats ===================== */
const LLETRES_NIF = "TRWAGMYFPDXBNJZSQVHLCKE";

function validarNif(nif: string): boolean {
  const m = /^(\d{8})([A-Z])$/.exec(nif);
  if (!m) return false;
  return LLETRES_NIF[Number(m[1]) % 23] === m[2];
}

function formatEuros(n: number): string {
  return n.toFixed(2).replace(".", ",") + " €";
}

function formatData(iso: string): string {
  const [any, mes, dia] = iso.split("-");
  return `${dia}-${mes}-${any}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function missatgeError(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/* ===================== Comptadors d'identificadors ===================== */
let comptadorClients = 10;
const MAX_CLIENTS = 99;
let comptadorFactures = 100;
const MAX_FACTURES = 999;

/* ===================== Funcions constructores ===================== */
const Client = function (
  this: IClient,
  nif: string,
  nom: string,
  cognoms: string
): void {
  nif = nif.trim().toUpperCase();
  nom = nom.trim();
  cognoms = cognoms.trim();

  if (!validarNif(nif)) throw new Error(`El NIF ${nif} no és correcte.`);
  if (!nom || !cognoms) throw new Error("El nom i els cognoms són obligatoris.");
  if (comptadorClients > MAX_CLIENTS) {
    throw new Error("S'ha arribat al nombre màxim de clients.");
  }

  this.id = comptadorClients++;
  this.nif = nif;
  this.nom = nom;
  this.cognoms = cognoms;
} as unknown as IClientConstructor;

const Factura = function (
  this: IFactura,
  idClient: number,
  data: string,
  total: number,
  pagada: boolean
): void {
  if (!GestioClients.cercar(idClient)) {
    throw new Error(`No existeix cap client amb l'identificador ${idClient}.`);
  }
  if (!data) throw new Error("La data és obligatòria.");
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
} as unknown as IFacturaConstructor;

/* ===================== Gestió de factures (mètodes estàtics) ===================== */
function GestioFactures() {}
GestioFactures.factures = [] as IFactura[];

GestioFactures.afegir = function (factura: IFactura): void {
  GestioFactures.factures.push(factura);
};

GestioFactures.delClient = function (idClient: number): IFactura[] {
  return GestioFactures.factures.filter((f) => f.idClient === idClient);
};

GestioFactures.totalClient = function (idClient: number): number {
  return GestioFactures.delClient(idClient).reduce((s, f) => s + f.total, 0);
};

GestioFactures.pendentClient = function (idClient: number): number {
  return GestioFactures.delClient(idClient)
    .filter((f) => !f.pagada)
    .reduce((s, f) => s + f.total, 0);
};

GestioFactures.generarTaula = function (idClient: number): string {
  const files = GestioFactures.delClient(idClient)
    .map(
      (f) => `<tr>
        <td>${f.id}</td>
        <td>${formatData(f.data)}</td>
        <td>${formatEuros(f.total)}</td>
        <td>${f.pagada ? "Sí" : "No"}</td>
      </tr>`
    )
    .join("");
  return `<table border="1">
    <tr><th>Id</th><th>Data</th><th>Total</th><th>Pagada</th></tr>
    ${files}
  </table>`;
};

/* ===================== Gestió de clients (mètodes estàtics) ===================== */
function GestioClients() {}
GestioClients.clients = [] as IClient[];

GestioClients.afegir = function (client: IClient): void {
  if (GestioClients.clients.some((c) => c.nif === client.nif)) {
    throw new Error(`Ja existeix un client amb el NIF ${client.nif}.`);
  }
  GestioClients.clients.push(client);
};

GestioClients.cercar = function (id: number): IClient | undefined {
  return GestioClients.clients.find((c) => c.id === id);
};

GestioClients.generarTaula = function (): string {
  const files = GestioClients.clients
    .map(
      (c) => `<tr>
        <td>${c.id}</td>
        <td>${escapeHtml(c.nif)}</td>
        <td>${escapeHtml(c.cognoms)}, ${escapeHtml(c.nom)}</td>
        <td>${formatEuros(GestioFactures.totalClient(c.id))}</td>
        <td>${formatEuros(GestioFactures.pendentClient(c.id))}</td>
      </tr>`
    )
    .join("");
  return `<table border="1">
    <tr><th>Id</th><th>NIF</th><th>Cognoms, Nom</th><th>Total</th><th>Pendent</th></tr>
    ${files}
  </table>`;
};

/* ===================== Aplicació ===================== */
const Aplicacio = {
  clientSeleccionat: undefined as number | undefined,

  $<T extends HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) throw new Error(`No existeix l'element #${id}`);
    return el as T;
  },

  init(): void {
    this.$("btnClient").addEventListener("click", () => this.afegirClient());
    this.$("btnSeleccionar").addEventListener("click", () => this.seleccionarClient());
    this.$("btnFactura").addEventListener("click", () => this.afegirFactura());
    this.pintarClients();
  },

  pintarClients(): void {
    this.$("taulaClients").innerHTML = GestioClients.generarTaula();
  },

  pintarFactures(): void {
    this.$("taulaFactures").innerHTML =
      this.clientSeleccionat === undefined
        ? ""
        : GestioFactures.generarTaula(this.clientSeleccionat);
  },

  afegirClient(): void {
    const nif = this.$<HTMLInputElement>("nif");
    const nom = this.$<HTMLInputElement>("nom");
    const cognoms = this.$<HTMLInputElement>("cognoms");
    try {
      GestioClients.afegir(new Client(nif.value, nom.value, cognoms.value));
      nif.value = nom.value = cognoms.value = "";
      this.pintarClients();
    } catch (e) {
      alert(missatgeError(e));
    }
  },

  seleccionarClient(): void {
    const id = Number(this.$<HTMLInputElement>("clientId").value);
    if (!GestioClients.cercar(id)) {
      this.clientSeleccionat = undefined;
      this.pintarFactures();
      alert(`No existeix cap client amb l'identificador ${id}.`);
      return;
    }
    this.clientSeleccionat = id;
    this.pintarFactures();
  },

  afegirFactura(): void {
    if (this.clientSeleccionat === undefined) {
      alert("Primer has de seleccionar un client.");
      return;
    }
    const data = this.$<HTMLInputElement>("data");
    const total = this.$<HTMLInputElement>("total");
    const pagada = this.$<HTMLInputElement>("pagada");
    try {
      GestioFactures.afegir(
        new Factura(
          this.clientSeleccionat,
          data.value,
          parseFloat(total.value.replace(",", ".")),
          pagada.checked
        )
      );
      data.value = total.value = "";
      pagada.checked = false;
      this.pintarFactures();
      this.pintarClients(); // actualitza Total i Pendent
    } catch (e) {
      alert(missatgeError(e));
    }
  },
};

Aplicacio.init();