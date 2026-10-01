/**
 * utils.ts
 * ---------------------------------------------------------------------------
 * Librería de funciones de utilidad reutilizables para cualquier proyecto TS.
 *
 * Compatible con "strict" y "noUncheckedIndexedAccess".
 * No tiene dependencias externas.
 *
 * Índice:
 *   1. Type guards y comprobaciones de tipos
 *   2. Arrays
 *   3. Objetos
 *   4. Números
 *   5. Textos y fechas
 *   6. Funciones y asincronía
 * ---------------------------------------------------------------------------
 */

/* ========================================================================== */
/* 1. TYPE GUARDS Y COMPROBACIONES DE TIPOS                                   */
/* ========================================================================== */

/**
 * Comprueba que un valor no es `null` ni `undefined`, y así TypeScript
 * elimina esos dos tipos del resultado.
 *
 * Cuándo usarla: al filtrar arrays que pueden contener huecos, o después de
 * un `find` / `map` que devuelve `T | undefined`.
 *
 * @example
 * const nombres = [users[0]?.name, users[1]?.name].filter(isDefined);
 * // nombres: string[]  (sin `| undefined`)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Comprueba que un valor es un `string`.
 *
 * Cuándo usarla: al validar datos de origen desconocido (`unknown`), como
 * respuestas de una API, `JSON.parse` o entradas de formularios.
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Comprueba que un valor es un número válido (excluye `NaN`).
 *
 * Cuándo usarla: al validar datos de origen desconocido antes de operar con
 * ellos. Ojo: `typeof NaN === "number"`, por eso esta función lo descarta.
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

/**
 * Comprueba que un valor es un objeto "normal" (`{}` o `Object.create(null)`),
 * y no un array, `null`, `Date`, `Map`, clase, etc.
 *
 * Cuándo usarla: al recorrer datos JSON o antes de acceder a propiedades de
 * algo que llega como `unknown`.
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Sirve para comprobar en tiempo de compilación que un `switch` o cadena de
 * `if` cubre todos los casos de una unión. Si añades un valor nuevo a la unión
 * y olvidas tratarlo, TypeScript marca error justo donde llamas a esta función.
 * En ejecución lanza un error, por si llega un valor inesperado.
 *
 * Cuándo usarla: en el `default` de un `switch` sobre uniones de literales,
 * enums o uniones discriminadas.
 *
 * @example
 * type Forma = "circulo" | "cuadrado";
 * function area(f: Forma): number {
 *   switch (f) {
 *     case "circulo": return 1;
 *     case "cuadrado": return 2;
 *     default: return assertNever(f);
 *   }
 * }
 */ 
export function assertNever(value: never): never {
  throw new Error(`Valor inesperado: ${JSON.stringify(value)}`);
}

/* ========================================================================== */
/* 2. ARRAYS                                                                  */
/* ========================================================================== */

/**
 * Elimina los elementos duplicados de un array conservando el orden de la
 * primera aparición. Compara con `Set`, es decir, por valor en primitivos y por
 * referencia en objetos.
 *
 * Cuándo usarla: para limpiar listas de ids, etiquetas, categorías...
 * Para objetos distintos con el mismo contenido usa `uniqueBy`.
 *
 * @example
 * unique([1, 2, 2, 3, 1]); // [1, 2, 3]
 */
export function unique<T>(array: readonly T[]): T[] {
  return [...new Set(array)];
}

/**
 * Elimina duplicados usando una clave calculada para cada elemento. Se queda
 * con el primer elemento de cada clave.
 *
 * Cuándo usarla: para quitar objetos repetidos por id, email, etc.
 *
 * @example
 * uniqueBy(usuarios, (u) => u.email);
 */
export function uniqueBy<T, K>(array: readonly T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  const result: T[] = [];
  for (const item of array) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

/**
 * Agrupa los elementos de un array según una clave calculada. Devuelve un
 * objeto donde cada clave apunta al array de elementos que la comparten.
 *
 * Cuándo usarla: informes, listados por categoría, contar o repartir elementos
 * por tipo, estado, fecha, etc. Es la alternativa portable a `Object.groupBy`
 * (que necesita Node 21+).
 *
 * @example
 * groupBy(pedidos, (p) => p.estado);
 * // { pendiente: [...], enviado: [...] }
 */
export function groupBy<T, K extends PropertyKey>(
  array: readonly T[],
  keyFn: (item: T) => K,
): Partial<Record<K, T[]>> {
  const groups = new Map<K, T[]>();
  for (const item of array) {
    const key = keyFn(item);
    const group = groups.get(key);
    if (group === undefined) {
      groups.set(key, [item]);
    } else {
      group.push(item);
    }
  }
  return Object.fromEntries(groups) as Partial<Record<K, T[]>>;
}

/**
 * Divide un array en trozos del tamaño indicado. El último trozo puede ser más
 * pequeño.
 *
 * Cuándo usarla: paginación, envío de datos por lotes (APIs con límite de
 * elementos por petición), repartir trabajo entre procesos.
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(array: readonly T[], size: number): T[][] {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError("El tamaño del trozo debe ser un entero mayor que 0");
  }
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Separa un array en dos: los elementos que cumplen la condición y los que no,
 * recorriéndolo una sola vez.
 *
 * Cuándo usarla: cuando necesitas ambos grupos (activos / inactivos, válidos /
 * inválidos). Es más eficiente que llamar a `filter` dos veces.
 *
 * @example
 * const [pares, impares] = partition([1, 2, 3, 4], (n) => n % 2 === 0);
 */
export function partition<T>(
  array: readonly T[],
  predicate: (item: T) => boolean,
): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  for (const item of array) {
    (predicate(item) ? pass : fail).push(item);
  }
  return [pass, fail];
}

/**
 * Devuelve una copia ordenada del array según una clave calculada. NO modifica
 * el array original. Los textos se comparan con `localeCompare` (respeta
 * acentos e idioma); los números y las fechas, por valor.
 *
 * Cuándo usarla: ordenar listados por una propiedad sin repetir el comparador.
 * Todas las claves deben ser del mismo tipo (todas texto, todas números...).
 *
 * @example
 * sortBy(usuarios, (u) => u.nombre);
 * sortBy(productos, (p) => p.precio, "desc");
 */
export function sortBy<T>(
  array: readonly T[],
  keyFn: (item: T) => string | number | Date,
  direction: "asc" | "desc" = "asc",
): T[] {
  const factor = direction === "asc" ? 1 : -1;
  return [...array].sort((a, b) => {
    const keyA = keyFn(a);
    const keyB = keyFn(b);
    if (typeof keyA === "string" && typeof keyB === "string") {
      return keyA.localeCompare(keyB) * factor;
    }
    const numA = keyA instanceof Date ? keyA.getTime() : Number(keyA);
    const numB = keyB instanceof Date ? keyB.getTime() : Number(keyB);
    return (numA - numB) * factor;
  });
}

/**
 * Genera una secuencia de números desde `start` (incluido) hasta `end`
 * (excluido), avanzando de `step` en `step`. El paso puede ser negativo.
 *
 * Cuándo usarla: bucles numéricos, generar índices, datos de prueba, páginas.
 *
 * @example
 * range(0, 5);      // [0, 1, 2, 3, 4]
 * range(10, 0, -3); // [10, 7, 4, 1]
 */
export function range(start: number, end: number, step = 1): number[] {
  if (step === 0) throw new RangeError("El paso no puede ser 0");
  const result: number[] = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) result.push(i);
  } else {
    for (let i = start; i > end; i += step) result.push(i);
  }
  return result;
}

/* ========================================================================== */
/* 3. OBJETOS                                                                 */
/* ========================================================================== */

/**
 * Crea un objeto nuevo con SOLO las propiedades indicadas. El resultado está
 * bien tipado (`Pick<T, K>`).
 *
 * Cuándo usarla: quedarte con los campos que quieres enviar a una API o
 * mostrar en pantalla.
 *
 * @example
 * pick(usuario, ["id", "nombre"]); // { id: 1, nombre: "Ana" }
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

/**
 * Crea un objeto nuevo SIN las propiedades indicadas. El resultado está bien
 * tipado (`Omit<T, K>`). Solo considera claves de tipo texto.
 *
 * Cuándo usarla: quitar campos sensibles (contraseñas, tokens) antes de
 * devolver o registrar un objeto.
 *
 * @example
 * omit(usuario, ["password"]);
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Omit<T, K> {
  const excluded = new Set<PropertyKey>(keys);
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !excluded.has(key)),
  ) as Omit<T, K>;
}

/* ========================================================================== */
/* 4. NÚMEROS                                                                 */
/* ========================================================================== */

/**
 * Limita un número al rango [min, max].
 *
 * Cuándo usarla: barras de progreso, volumen, paginación (que la página no se
 * salga de rango), valores que vienen del usuario.
 *
 * @example
 * clamp(15, 0, 10); // 10
 * clamp(-3, 0, 10); // 0
 */
export function clamp(value: number, min: number, max: number): number {
  if (min > max) throw new RangeError("min no puede ser mayor que max");
  return Math.min(Math.max(value, min), max);
}

/* ========================================================================== */
/* 5. TEXTOS Y FECHAS                                                         */
/* ========================================================================== */

/**
 * Pone en mayúscula la primera letra y deja el resto igual.
 *
 * Cuándo usarla: mostrar nombres o etiquetas en la interfaz.
 *
 * @example
 * capitalize("barcelona"); // "Barcelona"
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convierte un texto en un "slug": minúsculas, sin acentos ni símbolos y con
 * guiones en lugar de espacios.
 *
 * Cuándo usarla: URLs amigables, nombres de archivo, identificadores.
 *
 * @example
 * slugify("Ñandú, ¡Cafè amb llet!"); // "nandu-cafe-amb-llet"
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Escapa los caracteres especiales de una expresión regular para poder usar un
 * texto cualquiera como literal dentro de un `RegExp`.
 *
 * Cuándo usarla: al construir una regex a partir de texto del usuario o de un
 * patrón propio (por ejemplo, un patrón con `?` y `*` que conviertes a regex).
 *
 * @example
 * new RegExp(escapeRegExp("precio (€)"));
 */
export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Formatea una fecha según el idioma indicado usando `Intl.DateTimeFormat`
 * (sin librerías externas). Por defecto: dd/mm/aaaa en castellano.
 *
 * Cuándo usarla: mostrar fechas al usuario. Usa "ca-ES" para catalán.
 *
 * @example
 * formatDate(new Date());                          // "23/09/2026"
 * formatDate(new Date(), "ca-ES", { dateStyle: "long" });
 */
export function formatDate(
  date: Date | string | number,
  locale = "es-ES",
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  },
): string {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) {
    throw new RangeError("Fecha no válida");
  }
  return new Intl.DateTimeFormat(locale, options).format(value);
}

/* ========================================================================== */
/* 6. FUNCIONES Y ASINCRONÍA                                                  */
/* ========================================================================== */

/**
 * Pausa la ejecución durante los milisegundos indicados (con `await`).
 *
 * Cuándo usarla: esperas entre reintentos, simular latencia en pruebas,
 * limitar el ritmo de peticiones.
 *
 * @example
 * await sleep(1000);
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ejecuta una función asíncrona y, si falla, la reintenta con espera creciente
 * (backoff exponencial). Si se agotan los intentos, lanza el último error.
 *
 * Cuándo usarla: llamadas a APIs o servicios que pueden fallar de forma
 * temporal (red, límites de uso). No la uses para errores que nunca se van a
 * arreglar solos (datos inválidos, 404...).
 *
 * @param fn Función a ejecutar; recibe el número de intento (empieza en 1).
 * @param options.attempts Intentos totales (por defecto 3).
 * @param options.delayMs Espera inicial en ms (por defecto 500).
 * @param options.backoff Multiplicador de la espera (por defecto 2).
 *
 * @example
 * const datos = await retry(() => fetchDatos(), { attempts: 5 });
 */
export async function retry<T>(
  fn: (attempt: number) => Promise<T>,
  options: { attempts?: number; delayMs?: number; backoff?: number } = {},
): Promise<T> {
  const { attempts = 3, delayMs = 500, backoff = 2 } = options;
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new RangeError("attempts debe ser un entero mayor que 0");
  }
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(delayMs * backoff ** (attempt - 1));
      }
    }
  }
  throw lastError;
}

/**
 * Devuelve una versión de la función que espera a que pasen `waitMs` sin
 * nuevas llamadas antes de ejecutarse. Cada llamada reinicia la espera.
 * Incluye `.cancel()` para descartar una ejecución pendiente.
 *
 * Cuándo usarla: buscadores que consultan mientras el usuario escribe,
 * autoguardado, validaciones de formulario, evento `resize`.
 *
 * @example
 * const buscar = debounce((texto: string) => llamarApi(texto), 300);
 * input.addEventListener("input", (e) => buscar(e.target.value));
 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  waitMs: number,
): ((...args: A) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: A): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, waitMs);
  };

  debounced.cancel = (): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };

  return debounced;
}

/**
 * Devuelve una versión de la función que se ejecuta como máximo una vez cada
 * `waitMs`. Se ejecuta al momento la primera vez y, si hubo más llamadas
 * durante la espera, ejecuta una última con los argumentos más recientes.
 *
 * Cuándo usarla: eventos que se disparan muchas veces seguidas y quieres
 * respuesta periódica: `scroll`, `mousemove`, arrastrar elementos.
 * (Diferencia con `debounce`: throttle ejecuta durante la ráfaga, debounce
 * solo al terminar.)
 *
 * @example
 * window.addEventListener("scroll", throttle(actualizarBarra, 100));
 */
export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  waitMs: number,
): (...args: A) => void {
  let lastCall = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pendingArgs: A | undefined;

  return (...args: A): void => {
    const remaining = waitMs - (Date.now() - lastCall);

    if (remaining <= 0) {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
      pendingArgs = undefined;
      lastCall = Date.now();
      fn(...args);
      return;
    }

    pendingArgs = args;
    if (timer === undefined) {
      timer = setTimeout(() => {
        timer = undefined;
        lastCall = Date.now();
        if (pendingArgs !== undefined) {
          const latest = pendingArgs;
          pendingArgs = undefined;
          fn(...latest);
        }
      }, remaining);
    }
  };
}

/**
 * Devuelve una versión de la función que guarda en caché sus resultados: si se
 * llama otra vez con los mismos argumentos, devuelve el valor guardado sin
 * volver a calcularlo. Por defecto la clave de caché es `JSON.stringify` de
 * los argumentos; pasa `keyFn` si los argumentos no son serializables.
 *
 * Cuándo usarla: funciones puras y costosas (cálculos pesados, recursión como
 * Fibonacci). NO la uses con funciones con efectos secundarios ni cuyos
 * resultados cambien con el tiempo, y ten en cuenta que la caché crece sin
 * límite.
 *
 * @example
 * const fib = memoize((n: number): number => (n < 2 ? n : fib(n - 1) + fib(n - 2)));
 */
export function memoize<A extends unknown[], R>(
  fn: (...args: A) => R,
  keyFn: (...args: A) => unknown = (...args) => JSON.stringify(args),
): (...args: A) => R {
  const cache = new Map<unknown, R>();
  return (...args: A): R => {
    const key = keyFn(...args);
    if (cache.has(key)) return cache.get(key) as R;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
