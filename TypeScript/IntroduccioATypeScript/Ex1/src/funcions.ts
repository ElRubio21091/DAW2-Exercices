export function convertir (v: string): string {
    let valor = parseFloat(v);
    return valor.toPrecision(4);
}