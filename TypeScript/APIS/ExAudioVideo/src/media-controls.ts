/**
 * media-controls.ts
 * Barra de controles reutilizable para elementos <video> y <audio>.
 *
 * Uso básico:
 *   import { MediaControls } from "./media-controls.js";
 *   new MediaControls("mi-video");                       // todos los controles
 *   new MediaControls("mi-audio", {
 *     controls: ["play", "stop", "progress", "speed"],   // solo los que quieras, en el orden que quieras
 *     seekStep: 10,
 *   });
 *
 * Todas las acciones también son métodos públicos (play, seek, setPlaybackRate...),
 * así que puedes llamarlas desde tu propio código sin usar los botones.
 */

/* ------------------------------------------------------------------ */
/* Funciones auxiliares reutilizables                                  */
/* ------------------------------------------------------------------ */

/** Limita un número al rango [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Redondea a un número de decimales (evita 0.1 + 0.2 = 0.30000000000000004). */
export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Acepta un elemento multimedia o su id y devuelve siempre el elemento. */
export function resolveMedia(target: HTMLMediaElement | string): HTMLMediaElement {
  const element = typeof target === "string" ? document.getElementById(target) : target;
  if (!(element instanceof HTMLMediaElement)) {
    throw new Error(`No se ha encontrado ningún <video> o <audio> para: ${String(target)}`);
  }
  return element;
}

/** Formatea segundos como m:ss (p. ej. 75 -> "1:15"). */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const rest = String(total % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

/** Crea un botón accesible con un texto visible y una etiqueta descriptiva. */
export function createButton(
  text: string,
  label: string,
  onClick: () => void,
  signal?: AbortSignal
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  setButton(button, text, label);
  button.addEventListener("click", onClick, { signal });
  return button;
}

/** Cambia el texto visible y la etiqueta de un botón ya creado. */
export function setButton(button: HTMLButtonElement, text: string, label: string): void {
  button.textContent = text;
  button.title = label;
  button.setAttribute("aria-label", label);
}

/** Marca un botón como activado/desactivado (para botones tipo interruptor). */
export function setPressed(button: HTMLButtonElement, pressed: boolean): void {
  button.setAttribute("aria-pressed", String(pressed));
}

/** Crea un <input type="range"> accesible. */
export function createSlider(
  label: string,
  min: number,
  max: number,
  step: number,
  onInput: (value: number) => void,
  signal?: AbortSignal
): HTMLInputElement {
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = String(min);
  slider.max = String(max);
  slider.step = String(step);
  slider.value = String(min);
  slider.title = label;
  slider.setAttribute("aria-label", label);
  slider.addEventListener("input", () => onInput(slider.valueAsNumber), { signal });
  return slider;
}

function logError(error: unknown): void {
  console.error(error);
}

/* ------------------------------------------------------------------ */
/* Tipos y opciones                                                    */
/* ------------------------------------------------------------------ */

/** Controles disponibles. El orden del array `controls` es el orden en la barra. */
export type ControlName =
  | "progress"     // barra deslizante de posición
  | "restart"      // volver al inicio
  | "rewind"       // retroceder N segundos
  | "play"         // reproducir / pausar
  | "stop"         // parar y volver al inicio
  | "forward"      // avanzar N segundos
  | "time"         // tiempo actual / duración
  | "mute"         // silenciar / activar sonido
  | "volumeDown"   // bajar volumen
  | "volume"       // porcentaje de volumen
  | "volumeUp"     // subir volumen
  | "volumeSlider" // barra deslizante de volumen
  | "slower"       // reducir velocidad
  | "speed"        // velocidad actual (clic = velocidad normal)
  | "faster"       // aumentar velocidad
  | "loop"         // repetir en bucle
  | "pip"          // imagen en imagen (solo vídeo)
  | "fullscreen";  // pantalla completa (solo vídeo)

/** Controles que se muestran por defecto (volumeSlider es opcional: ya hay − / +). */
export const DEFAULT_CONTROLS: readonly ControlName[] = [
  "progress", "restart", "rewind", "play", "stop", "forward", "time",
  "mute", "volumeDown", "volume", "volumeUp",
  "slower", "speed", "faster",
  "loop", "pip", "fullscreen",
];

export interface MediaControlsOptions {
  /** Qué controles mostrar y en qué orden. Por defecto DEFAULT_CONTROLS. */
  controls?: readonly ControlName[];
  /** Segundos que avanza/retrocede cada pulsación. Por defecto 5. */
  seekStep?: number;
  /** Salto de volumen entre 0 y 1. Por defecto 0.1 (10 %). */
  volumeStep?: number;
  /** Salto de velocidad. Por defecto 0.25. */
  rateStep?: number;
  /** Velocidad mínima. Por defecto 0.25. */
  minRate?: number;
  /** Velocidad máxima. Por defecto 4. */
  maxRate?: number;
  /**
   * Dónde insertar la barra. Por defecto, justo después del elemento multimedia.
   * Si lo indicas y usas "fullscreen", ese contenedor es el que se pone a pantalla completa
   * (debería contener también el vídeo).
   */
  container?: HTMLElement;
  /** Clase CSS de la barra. Por defecto "media-controls". */
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Clase principal                                                     */
/* ------------------------------------------------------------------ */

export class MediaControls {
  readonly media: HTMLMediaElement;
  /** Contenedor de la barra, por si quieres moverlo o estilarlo desde fuera. */
  readonly element: HTMLDivElement;

  readonly #seekStep: number;
  readonly #volumeStep: number;
  readonly #rateStep: number;
  readonly #minRate: number;
  readonly #maxRate: number;
  readonly #abort = new AbortController();
  /** Funciones que actualizan cada control para reflejar el estado real del medio. */
  readonly #syncers: Array<() => void> = [];
  #wrapper: HTMLElement | null = null;
  #fullscreenTarget: HTMLElement | null = null;

  constructor(target: HTMLMediaElement | string, options: MediaControlsOptions = {}) {
    this.media = resolveMedia(target);
    this.#seekStep = options.seekStep ?? 5;
    this.#volumeStep = options.volumeStep ?? 0.1;
    this.#rateStep = options.rateStep ?? 0.25;
    this.#minRate = options.minRate ?? 0.25;
    this.#maxRate = options.maxRate ?? 4;

    this.element = document.createElement("div");
    this.element.className = options.className ?? "media-controls";
    this.element.setAttribute("role", "group");
    this.element.setAttribute("aria-label", "Controls multimèdia");

    // Ignoramos los controles que no tienen sentido (p. ej. pantalla completa en un <audio>)
    const names = (options.controls ?? DEFAULT_CONTROLS).filter((name) => this.#isSupported(name));
    for (const name of names) {
      this.element.append(this.#buildControl(name));
    }

    this.#placeBar(options.container, names.includes("fullscreen"));
    this.#listen();
    this.#syncAll();
  }

  /** Elimina la barra y todos sus listeners (y deshace el contenedor si lo creó). */
  destroy(): void {
    this.#abort.abort();
    this.element.remove();
    if (this.#wrapper) {
      this.#wrapper.replaceWith(this.media);
      this.#wrapper = null;
    }
  }

  /* ------------------------- Acciones públicas ------------------------- */

  play(): void {
    this.media.play().catch(logError); // la promesa puede rechazarse (políticas de autoplay)
  }

  pause(): void {
    this.media.pause();
  }

  toggle(): void {
    if (this.media.paused || this.media.ended) {
      this.play();
    } else {
      this.pause();
    }
  }

  /** Pausa y vuelve al inicio. */
  stop(): void {
    this.pause();
    this.seekTo(0);
  }

  /** Salta a un instante concreto (en segundos). */
  seekTo(seconds: number): void {
    const max = Number.isFinite(this.media.duration) ? this.media.duration : Infinity;
    this.media.currentTime = clamp(seconds, 0, max);
  }

  /** Avanza (positivo) o retrocede (negativo) respecto a la posición actual. */
  seek(deltaSeconds: number): void {
    this.seekTo(this.media.currentTime + deltaSeconds);
  }

  /** Salta a un porcentaje de la duración (0–100). */
  seekToPercent(percent: number): void {
    if (Number.isFinite(this.media.duration)) {
      this.seekTo((this.media.duration * clamp(percent, 0, 100)) / 100);
    }
  }

  /** Fija el volumen (0–1). Si estaba silenciado y subes el volumen, quita el silencio. */
  setVolume(volume: number): void {
    this.media.volume = clamp(round(volume), 0, 1);
    if (this.media.muted && this.media.volume > 0) this.media.muted = false;
  }

  changeVolume(delta: number): void {
    this.setVolume(this.media.volume + delta);
  }

  toggleMute(): void {
    this.media.muted = !this.media.muted;
  }

  setPlaybackRate(rate: number): void {
    this.media.playbackRate = clamp(round(rate), this.#minRate, this.#maxRate);
  }

  changePlaybackRate(delta: number): void {
    this.setPlaybackRate(this.media.playbackRate + delta);
  }

  /** Activa/desactiva la repetición. Con loop activo el evento "ended" no se dispara. */
  toggleLoop(): void {
    this.media.loop = !this.media.loop;
    this.#syncAll(); // no existe un evento "loopchange", actualizamos a mano
  }

  toggleFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(logError);
    } else {
      (this.#fullscreenTarget ?? this.media).requestFullscreen().catch(logError);
    }
  }

  togglePictureInPicture(): void {
    if (!(this.media instanceof HTMLVideoElement)) return;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(logError);
    } else {
      this.media.requestPictureInPicture().catch(logError);
    }
  }

  /* ---------------------------- Construcción ---------------------------- */

  #isSupported(name: ControlName): boolean {
    if (name === "fullscreen") return this.media instanceof HTMLVideoElement && document.fullscreenEnabled;
    if (name === "pip") return this.media instanceof HTMLVideoElement && document.pictureInPictureEnabled;
    return true;
  }

  /** Registra cómo se actualiza un control cuando cambia el estado del medio. */
  #addSync(fn: () => void): void {
    this.#syncers.push(fn);
  }

  #syncAll(): void {
    for (const fn of this.#syncers) fn();
  }

  #buildControl(name: ControlName): HTMLElement {
    const signal = this.#abort.signal;
    const media = this.media;
    const step = this.#seekStep;
    const volumePercent = Math.round(this.#volumeStep * 100);
    let element: HTMLElement;

    // Con lambdas no hace falta .bind(this)
    switch (name) {
      case "progress": {
        const slider = createSlider("Posició", 0, 0, 0.1, (value) => this.seekTo(value), signal);
        this.#addSync(() => {
          const known = Number.isFinite(media.duration);
          slider.disabled = !known;
          slider.max = String(known ? media.duration : 0); // el max va antes que el value
          slider.value = String(media.currentTime);
        });
        element = slider;
        break;
      }
      case "restart":
        element = createButton("⏮", "Torna a l'inici", () => this.seekTo(0), signal);
        break;
      case "rewind":
        element = createButton("⏪", `Retrocedeix ${step} segons`, () => this.seek(-step), signal);
        break;
      case "play": {
        const button = createButton("▶", "Reproduir", () => this.toggle(), signal);
        this.#addSync(() => {
          const playing = !media.paused && !media.ended;
          setButton(button, playing ? "⏸" : "▶", playing ? "Atura" : "Reproduir");
        });
        element = button;
        break;
      }
      case "stop":
        element = createButton("⏹", "Para i torna a l'inici", () => this.stop(), signal);
        break;
      case "forward":
        element = createButton("⏩", `Avança ${step} segons`, () => this.seek(step), signal);
        break;
      case "time": {
        const label = document.createElement("span");
        this.#addSync(() => {
          label.textContent = `${formatTime(media.currentTime)} / ${formatTime(media.duration)}`;
        });
        element = label;
        break;
      }
      case "mute": {
        const button = createButton("🔊", "Silencia", () => this.toggleMute(), signal);
        this.#addSync(() => {
          const silent = media.muted || media.volume === 0;
          setButton(button, silent ? "🔇" : "🔊", silent ? "Activa el so" : "Silencia");
          setPressed(button, silent);
        });
        element = button;
        break;
      }
      case "volumeDown":
        element = createButton("−", `Baixa el volum un ${volumePercent}%`, () => this.changeVolume(-this.#volumeStep), signal);
        break;
      case "volume": {
        const label = document.createElement("span");
        this.#addSync(() => {
          label.textContent = `${Math.round(media.volume * 100)}%`;
        });
        element = label;
        break;
      }
      case "volumeUp":
        element = createButton("+", `Puja el volum un ${volumePercent}%`, () => this.changeVolume(this.#volumeStep), signal);
        break;
      case "volumeSlider": {
        const slider = createSlider("Volum", 0, 1, 0.01, (value) => this.setVolume(value), signal);
        this.#addSync(() => {
          slider.value = String(media.muted ? 0 : media.volume);
        });
        element = slider;
        break;
      }
      case "slower":
        element = createButton("🐢", `Redueix la velocitat ${this.#rateStep}×`, () => this.changePlaybackRate(-this.#rateStep), signal);
        break;
      case "speed": {
        const button = createButton("1×", "Velocitat normal", () => this.setPlaybackRate(1), signal);
        this.#addSync(() => {
          setButton(button, `${media.playbackRate}×`, "Velocitat normal");
        });
        element = button;
        break;
      }
      case "faster":
        element = createButton("🐇", `Augmenta la velocitat ${this.#rateStep}×`, () => this.changePlaybackRate(this.#rateStep), signal);
        break;
      case "loop": {
        const button = createButton("🔁", "Repeteix en bucle", () => this.toggleLoop(), signal);
        this.#addSync(() => setPressed(button, media.loop));
        element = button;
        break;
      }
      case "pip":
        element = createButton("🖼", "Imatge en imatge", () => this.togglePictureInPicture(), signal);
        break;
      case "fullscreen": {
        const button = createButton("⛶", "Pantalla completa", () => this.toggleFullscreen(), signal);
        this.#addSync(() => {
          const active = document.fullscreenElement !== null && document.fullscreenElement === this.#fullscreenTarget;
          setButton(button, active ? "✕" : "⛶", active ? "Surt de la pantalla completa" : "Pantalla completa");
        });
        element = button;
        break;
      }
    }

    element.classList.add(`media-controls__${name}`); // para poder estilar cada control desde CSS
    return element;
  }

  /** Inserta la barra. Si hace falta pantalla completa, envuelve vídeo + barra en un contenedor. */
  #placeBar(container: HTMLElement | undefined, wantsFullscreen: boolean): void {
    if (container) {
      container.append(this.element);
      this.#fullscreenTarget = container;
    } else if (wantsFullscreen) {
      // Si pusiéramos solo el <video> a pantalla completa, la barra desaparecería
      const wrapper = document.createElement("div");
      wrapper.className = "media-player";
      this.media.replaceWith(wrapper);
      wrapper.append(this.media, this.element);
      this.#wrapper = wrapper;
      this.#fullscreenTarget = wrapper;
    } else {
      this.media.insertAdjacentElement("afterend", this.element);
    }
  }

  /** Escucha el medio para que la barra siempre refleje su estado real. */
  #listen(): void {
    const options = { signal: this.#abort.signal };
    const sync = () => this.#syncAll();
    const events = [
      "play", "pause", "ended", // "ended": fin de la reproducción
      "volumechange", "ratechange",
      "timeupdate", "loadedmetadata", "durationchange",
    ] as const;

    for (const event of events) {
      this.media.addEventListener(event, sync, options);
    }
    document.addEventListener("fullscreenchange", sync, options);
  }
}