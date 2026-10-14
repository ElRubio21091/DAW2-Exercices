import { DniDuplicadoError, SocioNoEncontradoError } from "./errores.js";
export class Gimnasio {
    nombre;
    static totalGimnasios = 0;
    socios = new Map();
    clases = new Map();
    constructor(nombre) {
        this.nombre = nombre;
        Gimnasio.totalGimnasios++;
    }
    get totalSocios() {
        return this.socios.size;
    }
    resumen() {
        return `${this.nombre}: ${this.totalSocios} socios`;
    }
    agregarSocio(socio) {
        if (this.socios.has(socio.dni))
            throw new DniDuplicadoError(socio.dni);
        this.socios.set(socio.dni, { ...socio });
        this.clases.set(socio.dni, new Set());
    }
    obtenerSocio(dni) {
        const socio = this.socios.get(dni);
        if (!socio)
            throw new SocioNoEncontradoError(dni);
        return socio;
    }
    borrarSocio(dni) {
        this.obtenerSocio(dni);
        this.socios.delete(dni);
        this.clases.delete(dni);
    }
    mostrarSocio(dni) {
        const s = this.obtenerSocio(dni);
        return `${s.dni} - ${s.nombre} - ${s.email ?? "sin email"} - tarjeta: ${s.tarjeta}`;
    }
    modificarSocio(dni, datos) {
        const socio = this.obtenerSocio(dni);
        const { dni: _ignorado, ...cambios } = datos;
        Object.assign(socio, cambios);
    }
    apuntarClase(dni, clase) {
        this.obtenerSocio(dni);
        this.clases.get(dni)?.add(clase);
    }
    recomendarClases(dni) {
        this.obtenerSocio(dni);
        const mias = this.clases.get(dni) ?? new Set();
        const recomendadas = new Set();
        for (const [otroDni, suyas] of this.clases) {
            if (otroDni === dni)
                continue;
            const comunes = [...mias].filter(c => suyas.has(c));
            if (comunes.length >= 2) {
                for (const clase of suyas) {
                    if (!mias.has(clase))
                        recomendadas.add(clase);
                }
            }
        }
        return recomendadas;
    }
}
export class Empleado {
    nombre;
    constructor(nombre) {
        this.nombre = nombre;
    }
}
export class Entrenador extends Empleado {
    especialidad;
    constructor(nombre, especialidad) {
        super(nombre);
        this.especialidad = especialidad;
    }
    describir() {
        return `Entrenador ${this.nombre}, especialista en ${this.especialidad}`;
    }
}
//# sourceMappingURL=gimnasio.js.map