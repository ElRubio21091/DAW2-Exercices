export const diccionario: string[] = [
  "FETIDEZ", "ESCORCHAPIN", "MORTERA", "GRAVAR", "ANTICRISTIANO",
  "ANTERO", "LUXACION", "EROTOMANIA", "TRASVERSAL", "SOPAPEAR",
  "CASTILLO", "VENTANA", "PLATANO", "MONTAÑA", "RELOJ",
  "CAMINO", "BUFANDA", "TORMENTA", "ESPEJO", "CARACOL",
];

export function palabrasAleatorias(n: number): string[] {
  if (!Number.isInteger(n) || n <= 0) throw new RangeError("n debe ser un entero positivo");
  return Array.from({ length: n }, () => diccionario[Math.floor(Math.random() * diccionario.length)]);
}

export function mostrarConSeparador(palabras: string[]): string {
  return palabras.join("\n----------\n");
}

// ---------- b) Array sin ordenar, con indexOf ----------
// Busca la primera palabra que tenga una copia más adelante, la muestra y elimina la copia.
export function eliminarPrimeraRepetida(lista: string[]): boolean {
  for (let i = 0; i < lista.length; i++) {
    const j = lista.indexOf(lista[i], i + 1);   // busca a partir de i+1
    if (j !== -1) {
      console.log(`Repetida: "${lista[i]}" en la posición ${j}`);
      lista.splice(j, 1);
      return true;
    }
  }
  return false;
}

export function quitarRepetidas(lista: string[]): void {
  while (eliminarPrimeraRepetida(lista)) { /* repetir hasta que no quede ninguna */ }
}

// ---------- c) Array ordenado: una sola pasada ----------
// Al estar ordenado, las repetidas están juntas: basta comparar con la anterior.
export function quitarRepetidasOrdenado(lista: string[]): string[] {
  const ordenada = [...lista].sort((a, b) => a.localeCompare(b));
  const unicas: string[] = [];
  for (let i = 0; i < ordenada.length; i++) {
    if (i > 0 && ordenada[i] === ordenada[i - 1]) {
      console.log(`Repetida: "${ordenada[i]}" en la posición ${i}`);
    } else {
      unicas.push(ordenada[i]);
    }
  }
  return unicas;
}

// ---------- d) Búsqueda ----------
export function buscarPalabra(lista: string[], palabra: string): number | undefined {
  const i = lista.indexOf(palabra);
  return i === -1 ? undefined : i;
}

export function medir(accion: () => void): number {
  const t0 = performance.now();
  accion();
  return performance.now() - t0;
}
