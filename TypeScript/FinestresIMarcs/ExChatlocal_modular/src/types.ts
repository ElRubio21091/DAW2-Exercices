// Tipos compartidos por todos los ficheros

export interface Message {
  user: string; // quién escribe (ADMIN, P1 o P2)
  text: string; // contenido del mensaje
}

export type UserName = "p1" | "p2";
