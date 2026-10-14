import type { Videojuego } from "./modelos.js";

// ---------- Ejercicio 1 ----------

// Sobrecargas: según el último parámetro, TS sabe qué tipo devuelve
export function precioEntrada(base: number, descuento: number, tasas: number, numerico: true): number | undefined;
export function precioEntrada(base: number, descuento: number, tasas: number, numerico: false): string | undefined;
export function precioEntrada(base: number, descuento: number, tasas: number, numerico: boolean): number | string | undefined;
export function precioEntrada(base: number, descuento: number, tasas: number, numerico: boolean): number | string | undefined {
  const valido = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
  if (![base, descuento, tasas].every(valido)) return undefined;

  const total = base * (1 - descuento / 100) * (1 + tasas / 100);
  return numerico
    ? Math.round(total * 100) / 100
    : total.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

export const ejecutarConRetardo = (fn: () => void, segundos: number): void => {
  setTimeout(fn, segundos * 1000);
};

// Rest: recoge todos los argumentos en un array
export function maximo(...numeros: number[]): number | undefined {
  return numeros.length === 0 ? undefined : Math.max(...numeros);
}

// ---------- Ejercicio 2: genéricos ----------

export function getObjectByValue<T, K extends keyof T>(array: T[], atributo: K, valor: T[K]): T | undefined {
  return array.find(o => o[atributo] === valor);
}

export function getObjectsByValue<T, K extends keyof T>(array: T[], atributo: K, valor: T[K]): T[] {
  return array.filter(o => o[atributo] === valor);
}

// Convierte el patrón (? y *) en una expresión regular
function patronARegex(patron: string): RegExp {
  const escapado = patron.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  return new RegExp("^" + escapado.replace(/\?/g, ".").replace(/\*/g, ".*") + "$", "i");
}

export function getObjectsByPattern<T, K extends keyof T>(array: T[], atributo: K, patron: string): T[] {
  const regex = patronARegex(patron);
  return array.filter(o => regex.test(String(o[atributo])));
}

export function getObjectsInRange<T, K extends keyof T>(array: T[], atributo: K, min: number, max: number): T[] {
  return array.filter(o => {
    const v = o[atributo];
    return typeof v === "number" && v >= min && v <= max;
  });
}

const euros = (n: number): string => n.toFixed(2).replace(".", ",") + " €";

export function mostrarTabla(videojuegos: Videojuego[], contenedor: HTMLElement): void {
  contenedor.innerHTML = "";
  const tabla = document.createElement("table");
  tabla.border = "1";

  const cabecera = tabla.createTHead().insertRow();
  for (const titulo of ["Código", "Título", "Plataforma", "PEGI", "Precio", "Precio final"]) {
    const th = document.createElement("th");
    th.textContent = titulo;
    cabecera.appendChild(th);
  }

  const cuerpo = tabla.createTBody();
  for (const v of videojuegos) {
    const fila = cuerpo.insertRow();
    const final = v.descuento !== undefined ? euros(v.precio * (1 - v.descuento / 100)) : "";
    const celdas = [
      v.codigo,
      v.titulo,
      v.plataforma,
      v.pegi !== undefined ? `PEGI ${v.pegi}` : "",   // opcional: vacío si no existe
      euros(v.precio),
      final,
    ];
    for (const texto of celdas) fila.insertCell().textContent = texto;
  }
  contenedor.appendChild(tabla);
}
