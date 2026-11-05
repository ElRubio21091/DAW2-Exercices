// Todo lo que toca localStorage vive aquí
import { STORAGE_KEY } from "./config.js";
import type { Message } from "./types.js";

export function getMessages(): Message[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Message[]) : [];
}

export function saveMessages(messages: Message[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function addMessage(msg: Message): void {
  const messages = getMessages();
  messages.unshift(msg); // al principio
  saveMessages(messages);
}

export function clearMessages(): void {
  saveMessages([]);
}
