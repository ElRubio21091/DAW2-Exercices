import { STORAGE_KEY } from "./config.js";
export function getMessages() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}
export function saveMessages(messages) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}
export function addMessage(msg) {
    const messages = getMessages();
    messages.unshift(msg);
    saveMessages(messages);
}
export function clearMessages() {
    saveMessages([]);
}
//# sourceMappingURL=storage.js.map