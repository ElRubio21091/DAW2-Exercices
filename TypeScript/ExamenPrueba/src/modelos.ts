export type Plataforma = "PC" | "PS5" | "Switch";

export interface Videojuego {
  codigo: string;
  titulo: string;
  precio: number;
  plataforma: Plataforma;
  pegi?: number;
  descuento?: number;
}

export interface Socio {
  readonly dni: string;
  nombre: string;
  email?: string;
  tarjeta: string;
}
