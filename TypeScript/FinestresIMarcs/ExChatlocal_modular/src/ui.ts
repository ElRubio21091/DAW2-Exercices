// Lógica de chat común a TODAS las ventanas (admin y usuarios)
import { STORAGE_KEY, role } from "./config.js";
import { input, sendBtn, textarea, title } from "./dom.js";
import { addMessage, getMessages } from "./storage.js";

export function render(): void {
  textarea.value = getMessages()
    .map((m) => `${m.user}: ${m.text}`)
    .join("\n");
}

function sendMessage(): void {
  const text = input.value.trim();
  if (text === "") return;

  addMessage({ user: role.toUpperCase(), text });
  input.value = "";
  render(); // en esta ventana NO salta el evento "storage"
}

export function initChat(): void {
  title.textContent = role.toUpperCase();
  document.title = role.toUpperCase();

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Salta cuando OTRA ventana modifica el localStorage
  window.addEventListener("storage", (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) render();
  });

  render();
}
