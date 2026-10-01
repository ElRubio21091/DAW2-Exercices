/**
 * busqueda-simple.ts
 * ---------------------------------------------------------------------------
 * VERSIÓN SIMPLE de las 4 funciones de búsqueda en arrays de objetos.
 *
 * Idea: bucles normales y tipos `any`. Es lo más fácil de leer, pero TypeScript
 * no comprueba nada: si escribes mal el nombre del atributo, no te avisa.
 * (La versión avanzada, en busqueda-avanzada.ts, arregla justo eso.)
 *
 * Usa UNO de los dos archivos, no los dos a la vez: exportan los mismos nombres.
 * ---------------------------------------------------------------------------
 */

/**
 * Devuelve el PRIMER objeto cuyo `atribut` vale exactamente `valor`.
 * Si no hay ninguno, devuelve `undefined`.
 *
 * @example
 * getObjectByValue(persones, "nom", "Anna"); // { nom: "Anna", ... } o undefined
 */
export function getObjectByValue(array: any[], atribut: string, valor: any): any {
  for (const objecte of array) {
    if (objecte[atribut] === valor) {
      return objecte; // en cuanto lo encuentra, sale de la función
    }
  }
  return undefined; // recorrió todo el array y no lo encontró
}

/**
 * Devuelve TODOS los objetos cuyo `atribut` vale exactamente `valor`.
 * Si no hay ninguno, devuelve un array vacío.
 *
 * @example
 * getObjectsByValue(persones, "ciutat", "Girona");
 */
export function getObjectsByValue(array: any[], atribut: string, valor: any): any[] {
  const resultat: any[] = [];
  for (const objecte of array) {
    if (objecte[atribut] === valor) {
      resultat.push(objecte);
    }
  }
  return resultat;
}

/**
 * Convierte un patrón con `?` y `*` en una expresión regular.
 *   ?  ->  cualquier carácter (exactamente uno)   ->  .
 *   *  ->  cualquier conjunto de caracteres (0+)  ->  .*
 * El resto de caracteres se "escapan" para que se comparen tal cual.
 * Por ejemplo, un punto en el patrón debe ser un punto de verdad y no
 * "cualquier carácter", que es lo que significa en una regex.
 */
function patroAExpressioRegular(patro: string): RegExp {
  let regex = "";
  for (const caracter of patro) {
    if (caracter === "?") {
      regex += ".";
    } else if (caracter === "*") {
      regex += ".*";
    } else {
      regex += caracter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  }
  // ^ y $ obligan a que coincida el texto COMPLETO, no solo un trozo.
  // La bandera "s" hace que "." también acepte saltos de línea.
  return new RegExp("^" + regex + "$", "s");
}

/**
 * Devuelve todos los objetos cuyo `atribut` (de tipo texto) encaja con el patrón.
 *   ?  sustituye exactamente UNA letra
 *   *  sustituye un conjunto de letras (también ninguna)
 * Distingue mayúsculas de minúsculas.
 *
 * @example
 * getObjectsByPattern(persones, "nom", "A???");  // Anna, Alex...
 * getObjectsByPattern(persones, "nom", "*a");    // los que acaban en "a"
 */
export function getObjectsByPattern(array: any[], atribut: string, patro: string): any[] {
  const regex = patroAExpressioRegular(patro);
  const resultat: any[] = [];
  for (const objecte of array) {
    const valor = objecte[atribut];
    // Solo comparamos si el valor es un texto; así no falla con números o undefined.
    if (typeof valor === "string" && regex.test(valor)) {
      resultat.push(objecte);
    }
  }
  return resultat;
}

/**
 * Devuelve todos los objetos cuyo `atribut` (de tipo número) está dentro del
 * rango [valorMin, valorMax], ambos extremos incluidos.
 *
 * @example
 * getObjectsInRange(persones, "edat", 18, 30);
 */
export function getObjectsInRange(
  array: any[],
  atribut: string,
  valorMin: number,
  valorMax: number,
): any[] {
  const resultat: any[] = [];
  for (const objecte of array) {
    const valor = objecte[atribut];
    // typeof evita que un texto como "25" se cuele por conversión automática.
    if (typeof valor === "number" && valor >= valorMin && valor <= valorMax) {
      resultat.push(objecte);
    }
  }
  return resultat;
}
