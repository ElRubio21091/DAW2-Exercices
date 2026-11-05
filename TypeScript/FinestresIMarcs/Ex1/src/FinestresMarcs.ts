"use strict";

/******************************************************
* EN AQUEST APARTAT PODEU AFEGIR O MODIFICAR FUNCIONS *
******************************************************/

/**
 * Retorna informació sobre el sistema.
 *
 * @return {string}				Descripció en l'enunciat
 */
function informacio(): string {
    const width = window.innerWidth
    const height = window.innerHeight
    const availWidth = window.screen.availWidth
    const availHeight = window.screen.availHeight

    const userAgent = navigator.userAgent
    const mobileDevice = /Android|iPhone|iPad|iPod|Mobi/i.test(userAgent)
    const os = navigator.platform
    const language = navigator.language

    const loc = window.location
    const hash = loc.hash
    const host = loc.host
    const hostname = loc.hostname
    const href = loc.href
    const origin = loc.origin
    const pathname = loc.pathname
    const port = loc.port
    const protocol = loc.protocol
    const search = loc.search

    return `
        <h3>Informació sobre la pantalla:</h3>
        <ul>
            <li>Amplada: ${width}</li>
            <li>Alçada: ${height}</li>
            <li>Amplada disponible: ${availWidth}</li>
            <li>Alçada disponible: ${availHeight}</li>
        </ul>
        <h3>Informació sobre el navegador:</h3>
        <ul>
            <li>User agent: ${userAgent}</li>
            <li>Mobile device: ${mobileDevice}</li>
            <li>Operating system: ${os}</li>
            <li>Browser language: ${language}</li>
        </ul>
        <h3>Informació sobre la URL actual:</h3>
        <ul>
            <li>Hash: ${hash}</li>
            <li>Host: ${host}</li>
            <li>Hostname: ${hostname}</li>
            <li>Href: ${href}</li>
            <li>Origin: ${origin}</li>
            <li>Pathname: ${pathname}</li>
            <li>Port: ${port}</li>
            <li>Protocol: ${protocol}</li>
            <li>Search: ${search}</li>
        </ul>
    `
}

/**
 * Mostra informació o la web d'una URL en un frame.
 *
 * @param {string} url				URL que es vol mostrar o en blanc per mostrar informació
 * @param {HTMLIFrameElement} f		Element iframe on mostrar la URL o la informació
 *
 * Més detalls en l'enunciat
 */
function setFrame(url, f) {
    try {
        if (url === "") {
            // Mostrar la información del sistema dentro del iframe
            f.contentWindow.document.body.innerHTML = informacio();
        } else {
            // Mostrar la web de la URL dentro del iframe
            f.contentWindow.document.location.href = url;
        }
    } catch (e) {
        alert(e.message);
    }
}
/**
 * Mostra informació o la web d'una URL en un frame o finestra.
 *
 * @param {string} url				URL que es vol mostrar o en blanc per mostrar informació
 * @param {string} name				nom de la nova pestanya: frame, window, diferent dels anteriors o en blanc
 * @param {HTMLIFrameElement} f		Element iframe on mostrar la URL o la informació si name = frame
 *
 * Més detalls en l'enunciat
 */
function newWindow(url: string, name: string, f: HTMLIFrameElement): void {
	try {
		if (name === "frame") {
			const fw: Window | null = f.contentWindow;
			if (fw === null) throw new Error("El frame no té contentWindow.");

			if (url === "") {
				fw.document.body.innerHTML = informacio();
			} else {
				fw.document.location.href = url;
			}
		} else {
			const w: Window | null = window.open(url, name === "" ? "_blank" : name);
			if (w === null) throw new Error("No s'ha pogut obrir la finestra.");

			if (url === "") {
				w.document.body.innerHTML = informacio();
			}
		}
	} catch (e: unknown) {
		alert(e instanceof Error ? e.message : String(e));
	}
}

/************************************************
* FINAL DE L'APARTAT ON PODEU FER MODIFICACIONS *
************************************************/

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
