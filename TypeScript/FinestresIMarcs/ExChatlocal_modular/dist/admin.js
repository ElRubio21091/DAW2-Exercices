import { adminControls, clearAllBtn, closeP1Btn, closeP2Btn } from "./dom.js";
import { clearMessages } from "./storage.js";
import { render } from "./ui.js";
export function initAdmin() {
    const w = Math.floor(screen.availWidth / 2);
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
        clearMessages();
        render();
        Object.keys(users).forEach((name) => {
            const win = users[name];
            if (win === null || win.closed)
                users[name] = openUser(name);
        });
    }
    adminControls.style.display = "flex";
    clearMessages();
    render();
    users.p1 = openUser("p1");
    users.p2 = openUser("p2");
    if (users.p1 === null || users.p2 === null) {
        alert("El navegador ha bloqueado las ventanas emergentes. Permítelas y recarga.");
    }
    closeP1Btn.addEventListener("click", () => closeUser("p1"));
    closeP2Btn.addEventListener("click", () => closeUser("p2"));
    clearAllBtn.addEventListener("click", clearAll);
}
//# sourceMappingURL=admin.js.map