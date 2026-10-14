import type { Socio } from "./modelos.js";
import { DniDuplicadoError, SocioNoEncontradoError } from "./errores.js";

export class Gimnasio {
  static totalGimnasios = 0;

  private socios = new Map<string, Socio>();
  private clases = new Map<string, Set<string>>();   // dni -> clases apuntadas

  constructor(private nombre: string) {
    Gimnasio.totalGimnasios++;
  }

  get totalSocios(): number {
    return this.socios.size;
  }

  resumen(): string {
    return `${this.nombre}: ${this.totalSocios} socios`;
  }

  agregarSocio(socio: Socio): void {
    if (this.socios.has(socio.dni)) throw new DniDuplicadoError(socio.dni);
    this.socios.set(socio.dni, { ...socio });
    this.clases.set(socio.dni, new Set());
  }

  obtenerSocio(dni: string): Socio {
    const socio = this.socios.get(dni);
    if (!socio) throw new SocioNoEncontradoError(dni);
    return socio;
  }

  borrarSocio(dni: string): void {
    this.obtenerSocio(dni);          // lanza la excepción si no existe
    this.socios.delete(dni);
    this.clases.delete(dni);
  }

  mostrarSocio(dni: string): string {
    const s = this.obtenerSocio(dni);
    return `${s.dni} - ${s.nombre} - ${s.email ?? "sin email"} - tarjeta: ${s.tarjeta}`;
  }

  modificarSocio(dni: string, datos: Partial<Socio>): void {
    const socio = this.obtenerSocio(dni);
    const { dni: _ignorado, ...cambios } = datos;   // el DNI no se puede modificar
    Object.assign(socio, cambios);
  }

  // ---- Opcional (f) ----
  apuntarClase(dni: string, clase: string): void {
    this.obtenerSocio(dni);
    this.clases.get(dni)?.add(clase);
  }

  recomendarClases(dni: string): Set<string> {
    this.obtenerSocio(dni);
    const mias = this.clases.get(dni) ?? new Set<string>();
    const recomendadas = new Set<string>();

    for (const [otroDni, suyas] of this.clases) {
      if (otroDni === dni) continue;
      const comunes = [...mias].filter(c => suyas.has(c));
      if (comunes.length >= 2) {
        for (const clase of suyas) {
          if (!mias.has(clase)) recomendadas.add(clase);
        }
      }
    }
    return recomendadas;
  }
}

export abstract class Empleado {
  constructor(protected nombre: string) {}
  abstract describir(): string;
}

export class Entrenador extends Empleado {
  constructor(nombre: string, protected especialidad: string) {
    super(nombre);
  }

  describir(): string {
    return `Entrenador ${this.nombre}, especialista en ${this.especialidad}`;
  }
}
