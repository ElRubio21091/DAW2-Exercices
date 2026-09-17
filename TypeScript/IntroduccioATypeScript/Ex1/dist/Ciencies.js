"use strict";
export function imc(pes, altura) {
    let valorImc = parseFloat(pes) / Math.pow(parseFloat(altura) / 100, 2);
    let categoria;
    if (isNaN(valorImc)) {
        categoria = "";
        return "" + "-" + categoria;
    }
    if (valorImc < 16) {
        categoria = "Infrapès sever";
    }
    else if (valorImc < 17) {
        categoria = "Infrapès";
    }
    else if (valorImc < 18.5) {
        categoria = "Infrapès lleu";
    }
    else if (valorImc < 25) {
        categoria = "Pes normal";
    }
    else if (valorImc < 30) {
        categoria = "Sobrepès";
    }
    else if (valorImc < 35) {
        categoria = "Obesitat lleu";
    }
    else if (valorImc < 40) {
        categoria = "Obesitat";
    }
    else {
        categoria = "Obesitat severa";
    }
    return valorImc.toFixed(1) + "-" + categoria;
}
export function convertidor(valor, uni1, uni2) {
    let factor = 1;
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
        case "mm":
            factor = 0.001;
            break;
        case "cm":
            factor = 0.01;
            break;
        case "dm":
            factor = 0.1;
            break;
        case "m":
            factor = 1;
            break;
        case "Dm":
            factor = 10;
            break;
        case "Hm":
            factor = 100;
            break;
        case "Km":
            factor = 1000;
            break;
        default: return "";
    }
    let valorEnMetres = parseFloat(valor) * factor;
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
//# sourceMappingURL=Ciencies.js.map