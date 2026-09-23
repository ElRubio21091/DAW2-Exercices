import { diccionari } from './Diccionari.js';

function paraulesAleatories(n: number): string[] {
  const resultat: string[] = [];
  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * diccionari.length);
    resultat.push(diccionari[index]);
  }
  return resultat;
}

function mostrarParaulesAleatories(): void {
  const paraules = paraulesAleatories(10);
  const text = paraules.join('\n----------\n');
  console.log(text);

  const output = document.getElementById('output');
  if (output) {
    output.textContent = text;
  }
}

mostrarParaulesAleatories();