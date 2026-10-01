// global.d.ts
type Plataforma = "PC" | "PS5" | "Switch";
type Estado = "disponible" | "prestado";

// Tipos auxiliares genéricos
type Predicado<T> = (item: T) => boolean;
type Diccionario<T> = Record<string, T>;
type Resultado = number | string | undefined;

// Interfaces que se repiten en varios archivos
interface Socio {
  readonly dni: string;
  nombre: string;
  email?: string;
  tarjeta: string;
}

interface Videojuego {
  codigo: string;
  titulo: string;
  precio: number;
  plataforma: Plataforma;
  pegi?: number;
  descuento?: number;
}