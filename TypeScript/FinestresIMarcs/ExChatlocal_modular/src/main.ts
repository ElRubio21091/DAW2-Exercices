// Punto de entrada: es el único script que carga el HTML
import { role } from "./config.js";
import { initAdmin } from "./admin.js";
import { initChat } from "./ui.js";

initChat();
if (role === "admin") initAdmin();
