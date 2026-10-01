const cancons = new Set<string>();

function obtenirElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`No s'ha trobat l'element ${selector}.`);
  }

  return element;
}

const entrada = obtenirElement<HTMLInputElement>("#cancos");
const llista = obtenirElement<HTMLTextAreaElement>("#llista");
const botoAfegir = obtenirElement<HTMLButtonElement>("#afegir");
const botoEsborrar = obtenirElement<HTMLButtonElement>("#esborrar");

function mostrarCancs(): void {
  llista.value = Array.from(cancons).join("\n");
}

function afegirCanco(): void {
  const canco = entrada.value.trim();

  if (!canco) {
    return;
  }

  cancons.add(canco);
  entrada.value = "";
  mostrarCancs();
}

function esborrarCanco(): void {
  const canco = entrada.value.trim();

  cancons.delete(canco);
  entrada.value = "";
  mostrarCancs();
}

botoAfegir.addEventListener("click", afegirCanco);
botoEsborrar.addEventListener("click", esborrarCanco);
mostrarCancs();
