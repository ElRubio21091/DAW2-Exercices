// Constantes y datos de configuración

export const STORAGE_KEY = "chat";

// Qué ventana soy, según la URL (?role=p1). Sin parámetro => admin
export const role: string =
  new URLSearchParams(window.location.search).get("role") ?? "admin";
