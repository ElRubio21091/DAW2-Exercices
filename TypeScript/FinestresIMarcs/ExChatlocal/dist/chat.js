const STORAGE_KEY = "chat";
const role = new URLSearchParams(window.location.search).get("role") ?? "admin";
const title = document.getElementById("title");
const textarea = document.getElementById("messages");
const input = document.getElementById("text");
const sendBtn = document.getElementById("sendBtn");
const adminControls = document.getElementById("adminControls");
const closeP1Btn = document.getElementById("closeP1");
const closeP2Btn = document.getElementById("closeP2");
const clearAllBtn = document.getElementById("clearAll");
title.textContent = role.toUpperCase();
document.title = role.toUpperCase();
function getMessages() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}
function saveMessages(messages) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}
function render() {
    textarea.value = getMessages()
        .map((m) => `${m.user}: ${m.text}`)
        .join("\n");
}
function sendMessage() {
    const text = input.value.trim();
    if (text === "")
        return;
    const messages = getMessages();
    messages.unshift({ user: role.toUpperCase(), text });
    saveMessages(messages);
    input.value = "";
    render();
}
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter")
        sendMessage();
});
window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY)
        render();
});
if (role === "admin") {
    const w = Math.floor(screen.availWidth / 2);
    const h = Math.floor(screen.availHeight / 2);
    const userH = Math.floor(screen.availHeight / 2);
    const users = { p1: null, p2: null };
    function openUser(name) {
        const top = name === "p1" ? 0 : screen.availHeight - userH;
        const win = window.open(`${window.location.pathname}?role=${name}`, name, `left=${w},top=${top},width=${w},height=${userH}`);
        if (win !== null) {
            win.resizeTo(w, userH);
            win.moveTo(w, top);
        }
        return win;
    }
    function closeUser(name) {
        users[name]?.close();
    }
    function clearAll() {
        saveMessages([]);
        render();
        Object.keys(users).forEach((name) => {
            const win = users[name];
            if (win === null || win.closed) {
                users[name] = openUser(name);
            }
        });
    }
    adminControls.style.display = "flex";
    saveMessages([]);
    users.p1 = openUser("p1");
    users.p2 = openUser("p2");
    if (users.p1 === null || users.p2 === null) {
        alert("El navegador ha bloqueado las ventanas emergentes. " +
            "Permítelas para este sitio y recarga la página " +
            "(o pulsa «Borrar todo» para intentar abrirlas).");
    }
    closeP1Btn.addEventListener("click", () => closeUser("p1"));
    closeP2Btn.addEventListener("click", () => closeUser("p2"));
    clearAllBtn.addEventListener("click", clearAll);
}
render();
export {};
//# sourceMappingURL=chat.js.map