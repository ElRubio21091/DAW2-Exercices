"use strict";


/** Una secció d'informació: títol + parelles etiqueta/valor. */
interface SeccioInfo {
	titol: string;
	dades: [string, string][];
}

/** Clau de localStorage on es guarden les dades de informacio(). */
const CLAU_INFO: string = "infoSistema";

/** Escapa caràcters HTML per evitar injecció (p. ex. des de location.search). */
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

/** Extreu un missatge llegible de qualsevol excepció. */
function missatgeError(e: unknown): string {
	return e instanceof Error ? `${e.name}: ${e.message}` : String(e);
}

/** Detecta si és un dispositiu mòbil a partir del user agent. */
function esMobil(ua: string): boolean {
	return /Android|iPhone|iPad|iPod|Mobi|Windows Phone/i.test(ua);
}

/** Detecta el sistema operatiu a partir del user agent. */
function detectarSO(ua: string): string {
	if (/Windows/i.test(ua)) return "Windows";
	if (/Android/i.test(ua)) return "Android";
	if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
	if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
	if (/CrOS/i.test(ua)) return "Chrome OS";
	if (/Linux|X11/i.test(ua)) return "Linux";
	return "Desconegut";
}

/**
 * Retorna informació sobre el sistema (en format HTML) i la desa a localStorage.
 *
 * @return {string}				Descripció en l'enunciat
 */
function informacio(): string {
	const ua: string = navigator.userAgent;
	const l: Location = window.location;

	const seccions: SeccioInfo[] = [
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

	// Apartat 4: guardem les dades a localStorage
	try {
		localStorage.setItem(CLAU_INFO, JSON.stringify(seccions));
	} catch (e: unknown) {
		console.error("No s'ha pogut desar a localStorage: " + missatgeError(e));
	}

	let html: string = "";
	for (const s of seccions) {
		html += `<p><b>${escapeHtml(s.titol)}</b></p><ul>`;
		for (const [etiqueta, valor] of s.dades) {
			html += `<li>${escapeHtml(etiqueta)}: ${escapeHtml(valor)}</li>`;
		}
		html += "</ul>";
	}
	return html;
}

/**
 * Mostra informació o la web d'una URL en un frame.
 *
 * @param {string} url				URL que es vol mostrar o en blanc per mostrar informació
 * @param {HTMLIFrameElement} f		Element iframe on mostrar la URL o la informació
 *
 * Més detalls en l'enunciat
 */
function setFrame(url: string, f: HTMLIFrameElement): void {
	try {
		// Sempre es crida informacio() perquè les dades quedin a localStorage
		// (així FinestraInfo.html les pot llegir encara que la URL no sigui en blanc).
		const html: string = informacio();

		const w: Window | null = f.contentWindow;
		if (w === null) {
			throw new Error("El frame no té contentWindow.");
		}

		// Si el frame mostra una web d'un altre origen, accedir a w.document
		// llança una SecurityError, que es captura més avall.
		if (url.trim() === "") {
			w.document.body.innerHTML = html;
		} else {
			w.document.location.href = url;
		}
	} catch (e: unknown) {
		alert(missatgeError(e));
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
	// name conté "frame": es comporta com setFrame()
	if (name.includes("frame")) {
		setFrame(url, f);
		return;
	}

	try {
		const html: string = informacio();
		const enBlanc: boolean = url.trim() === "";

		let w: Window | null;
		if (name.includes("window")) {
			// Finestra nova anomenada "window", a 100,100 i de 500x500
			w = window.open(url, "window", "left=100,top=100,width=500,height=500");
		} else {
			// Pestanya nova amb el nom indicat (si és buit, una pestanya nova anònima)
			w = window.open(url, name);
		}

		if (w === null) {
			throw new Error("No s'ha pogut obrir la finestra (bloqueig de finestres emergents?).");
		}

		// Si la finestra/pestanya ja mostra una web d'un altre origen,
		// accedir a w.document llança una SecurityError.
		if (enBlanc) {
			w.document.body.innerHTML = html;
		}
	} catch (e: unknown) {
		alert(missatgeError(e));
	}
}

/************************************************
* FINAL DE L'APARTAT ON PODEU FER MODIFICACIONS *
************************************************/

function sF(): void {
	let url: string = (document.getElementById('winURL') as HTMLInputElement).value;
	let f: HTMLIFrameElement = document.getElementById('fr0') as HTMLIFrameElement;
	setFrame(url, f);
}

function nW(): void {
	let url: string = (document.getElementById('winURL') as HTMLInputElement).value;
	let name: string = (document.getElementById('winName') as HTMLInputElement).value;
	let f: HTMLIFrameElement = document.getElementById('fr0') as HTMLIFrameElement;
	newWindow(url, name, f);
}
