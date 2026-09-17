"use strict";

/*
	CATEGORIES SEGONS L'IMC
		IMC < 16		Infrapès sever
16   <= IMC < 17		Infrapès
17   <= IMC < 18.5		Infrapès lleu
18.5 <= IMC < 25		Pes normal
25   <= IMC < 30		Sobrepès
30   <= IMC < 35		Obesitat lleu
35   <= IMC < 40		Obesitat
		IMC >= 40		Obesitat severa
*/

/**
 * Calcular l'IMC (Índex de Massa Corporal) a partir del pes i l'altura.
 * 
 * @param pes		Pes en Kg
 * @param altura	Altura en cm
 * @return 			IMC-Categoria: "24,3-Pes normal"
 *					L'IMC s'ha de mostrar amb un decimal i format local
 * 
 *					Exemples:
 *					80 Kg i 180 cm --> "24,7-Pes normal"
 *					81 Kg i 180 cm --> "25,0-Sobrepès"
 *					90 Kg i 173 cm --> "30,1-Obesitat lleu"
 */
export function imc(pes: string, altura: string): string {
	let valorImc: number = parseFloat(pes) / Math.pow(parseFloat(altura) / 100, 2);
	let categoria: string;

	if (isNaN(valorImc)) {
		categoria = "";
		return "" + "-" + categoria;
	}
	if (valorImc < 16) {
		categoria = "Infrapès sever";
	} else if (valorImc < 17) {
		categoria = "Infrapès";
	} else if (valorImc < 18.5) {
		categoria = "Infrapès lleu";
	} else if (valorImc < 25) {
		categoria = "Pes normal";
	} else if (valorImc < 30) {
		categoria = "Sobrepès";
	} else if (valorImc < 35) {
		categoria = "Obesitat lleu";
	} else if (valorImc < 40) {
		categoria = "Obesitat";
	} else {
		categoria = "Obesitat severa";
	}

	return valorImc.toFixed(1) + "-" + categoria;
}



/**
 * Convertir unitats de longitud.
 * 
 * @param valor	Longitud a convertir
 * @param uni1	Unitats de la longitud (mm, cm, dm, m, Dm, Hm, Km)
 * @param uni2	A quines unitats s'ha de convertir (mm, cm, dm, m, Dm, Hm, Km)
 * @return 		Longitud convertida amb 4 dígits significatius
 * 
 * 						Exemples:
 * 						12.4 Dm --> 124.0 m
 * 						12.4 Km --> 1.240e+4 m
 */
export function convertidor(valor: string, uni1: string, uni2: string): string {
	let factor: number = 1;
	if (uni1 === uni2) {
		return parseFloat(valor).toPrecision(4);
	}
	if (valor === "") {
		return "";
	}
	if (uni1 === "" || uni2 === "") {
		return "";
	}
	switch (uni1) {
		case "mm": factor = 0.001; break;
		case "cm": factor = 0.01; break;
		case "dm": factor = 0.1; break;
		case "m": factor = 1; break;
		case "Dm": factor = 10; break;
		case "Hm": factor = 100; break;
		case "Km": factor = 1000; break;
		default: return "";
	}

	let valorEnMetres: number = parseFloat(valor) * factor;
	if (isNaN(valorEnMetres)) {
		return "";
	}
	switch (uni2) {
		case "mm": return (valorEnMetres / 0.001).toPrecision(4);
		case "cm": return (valorEnMetres / 0.01).toPrecision(4);
		case "dm": return (valorEnMetres / 0.1).toPrecision(4);
		case "m": return valorEnMetres.toPrecision(4);
		case "Dm": return (valorEnMetres / 10).toPrecision(4);
		case "Hm": return (valorEnMetres / 100).toPrecision(4);
		case "Km": return (valorEnMetres / 1000).toPrecision(4);
	}
	return "";
}