export class DniDuplicadoError extends Error {
  constructor(dni: string) {
    super(`Ya existe un socio con el DNI ${dni}`);
    this.name = "DniDuplicadoError";
  }
}

export class SocioNoEncontradoError extends Error {
  constructor(dni: string) {
    super(`No existe ningún socio con el DNI ${dni}`);
    this.name = "SocioNoEncontradoError";
  }
}
