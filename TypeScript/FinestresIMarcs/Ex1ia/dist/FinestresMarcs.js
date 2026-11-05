"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CLAU_INFO = "infoSistema";
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function missatgeError(e) {
    return e instanceof Error ? `${e.name}: ${e.message}` : String(e);
}
function esMobil(ua) {
    return /Android|iPhone|iPad|iPod|Mobi|Windows Phone/i.test(ua);
}
function detectarSO(ua) {
    if (/Windows/i.test(ua))
        return "Windows";
    if (/Android/i.test(ua))
        return "Android";
    if (/iPhone|iPad|iPod/i.test(ua))
        return "iOS";
    if (/Mac OS X|Macintosh/i.test(ua))
        return "macOS";
    if (/CrOS/i.test(ua))
        return "Chrome OS";
    if (/Linux|X11/i.test(ua))
        return "Linux";
    return "Desconegut";
}
function informacio() {
    const ua = navigator.userAgent;
    const l = window.location;
    const seccions = [
        {
            titol: "Informació sobre la pantalla:",
            dades: [
                ["Amplada", String(screen.width)],
                ["Alçada", String(screen.height)],
                ["Amplada disponible", String(screen.availWidth)],
                ["Alçada disponible", String(screen.availHeight)]
            ]
        },
        {
            titol: "Informació sobre el navegador:",
            dades: [
                ["User agent", ua],
                ["Mobile device", esMobil(ua) ? "Sí" : "No"],
                ["Operating system", detectarSO(ua)],
                ["Browser language", navigator.language]
            ]
        },
        {
            titol: "Informació sobre la URL actual:",
            dades: [
                ["Hash", l.hash],
                ["Host", l.host],
                ["Hostname", l.hostname],
                ["Href", l.href],
                ["Origin", l.origin],
                ["Pathname", l.pathname],
                ["Port", l.port],
                ["Protocol", l.protocol],
                ["Search", l.search]
            ]
        }
    ];
    try {
        localStorage.setItem(CLAU_INFO, JSON.stringify(seccions));
    }
    catch (e) {
        console.error("No s'ha pogut desar a localStorage: " + missatgeError(e));
    }
    let html = "";
    for (const s of seccions) {
        html += `<p><b>${escapeHtml(s.titol)}</b></p><ul>`;
        for (const [etiqueta, valor] of s.dades) {
            html += `<li>${escapeHtml(etiqueta)}: ${escapeHtml(valor)}</li>`;
        }
        html += "</ul>";
    }
    return html;
}
function setFrame(url, f) {
    try {
        const html = informacio();
        const w = f.contentWindow;
        if (w === null) {
            throw new Error("El frame no té contentWindow.");
        }
        if (url.trim() === "") {
            w.document.body.innerHTML = html;
        }
        else {
            w.document.location.href = url;
        }
    }
    catch (e) {
        alert(missatgeError(e));
    }
}
function newWindow(url, name, f) {
    if (name.includes("frame")) {
        setFrame(url, f);
        return;
    }
    try {
        const html = informacio();
        const enBlanc = url.trim() === "";
        let w;
        if (name.includes("window")) {
            w = window.open(url, "window", "left=100,top=100,width=500,height=500");
        }
        else {
            w = window.open(url, name);
        }
        if (w === null) {
            throw new Error("No s'ha pogut obrir la finestra (bloqueig de finestres emergents?).");
        }
        if (enBlanc) {
            w.document.body.innerHTML = html;
        }
    }
    catch (e) {
        alert(missatgeError(e));
    }
}
function sF() {
    let url = document.getElementById('winURL').value;
    let f = document.getElementById('fr0');
    setFrame(url, f);
}
function nW() {
    let url = document.getElementById('winURL').value;
    let name = document.getElementById('winName').value;
    let f = document.getElementById('fr0');
    newWindow(url, name, f);
}
//# sourceMappingURL=FinestresMarcs.js.map