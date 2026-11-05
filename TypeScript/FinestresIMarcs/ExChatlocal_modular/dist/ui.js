import { STORAGE_KEY, role } from "./config.js";
import { input, sendBtn, textarea, title } from "./dom.js";
import { addMessage, getMessages } from "./storage.js";
export function render() {
    textarea.value = getMessages()
        .map((m) => `${m.user}: ${m.text}`)
        .join("\n");
}
function sendMessage() {
    const text = input.value.trim();
    if (text === "")
        return;
    addMessage({ user: role.toUpperCase(), text });
    input.value = "";
    render();
}
export function initChat() {
    title.textContent = role.toUpperCase();
    document.title = role.toUpperCase();
    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter")
            sendMessage();
    });
    window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEY)
            render();
    });
    render();
}
//# sourceMappingURL=ui.js.map