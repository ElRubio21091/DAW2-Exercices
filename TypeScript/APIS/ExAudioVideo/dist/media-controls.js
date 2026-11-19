export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
export function round(value, decimals = 2) {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
}
export function resolveMedia(target) {
    const element = typeof target === "string" ? document.getElementById(target) : target;
    if (!(element instanceof HTMLMediaElement)) {
        throw new Error(`No se ha encontrado ningún <video> o <audio> para: ${String(target)}`);
    }
    return element;
}
export function formatTime(seconds) {
    if (!Number.isFinite(seconds))
        return "0:00";
    const total = Math.floor(seconds);
    const minutes = Math.floor(total / 60);
    const rest = String(total % 60).padStart(2, "0");
    return `${minutes}:${rest}`;
}
export function createButton(text, label, onClick, signal) {
    const button = document.createElement("button");
    button.type = "button";
    setButton(button, text, label);
    button.addEventListener("click", onClick, { signal });
    return button;
}
export function setButton(button, text, label) {
    button.textContent = text;
    button.title = label;
    button.setAttribute("aria-label", label);
}
export function setPressed(button, pressed) {
    button.setAttribute("aria-pressed", String(pressed));
}
export function createSlider(label, min, max, step, onInput, signal) {
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
function logError(error) {
    console.error(error);
}
export const DEFAULT_CONTROLS = [
    "progress", "restart", "rewind", "play", "stop", "forward", "time",
    "mute", "volumeDown", "volume", "volumeUp",
    "slower", "speed", "faster",
    "loop", "pip", "fullscreen",
];
export class MediaControls {
    media;
    element;
    #seekStep;
    #volumeStep;
    #rateStep;
    #minRate;
    #maxRate;
    #abort = new AbortController();
    #syncers = [];
    #wrapper = null;
    #fullscreenTarget = null;
    constructor(target, options = {}) {
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
        const names = (options.controls ?? DEFAULT_CONTROLS).filter((name) => this.#isSupported(name));
        for (const name of names) {
            this.element.append(this.#buildControl(name));
        }
        this.#placeBar(options.container, names.includes("fullscreen"));
        this.#listen();
        this.#syncAll();
    }
    destroy() {
        this.#abort.abort();
        this.element.remove();
        if (this.#wrapper) {
            this.#wrapper.replaceWith(this.media);
            this.#wrapper = null;
        }
    }
    play() {
        this.media.play().catch(logError);
    }
    pause() {
        this.media.pause();
    }
    toggle() {
        if (this.media.paused || this.media.ended) {
            this.play();
        }
        else {
            this.pause();
        }
    }
    stop() {
        this.pause();
        this.seekTo(0);
    }
    seekTo(seconds) {
        const max = Number.isFinite(this.media.duration) ? this.media.duration : Infinity;
        this.media.currentTime = clamp(seconds, 0, max);
    }
    seek(deltaSeconds) {
        this.seekTo(this.media.currentTime + deltaSeconds);
    }
    seekToPercent(percent) {
        if (Number.isFinite(this.media.duration)) {
            this.seekTo((this.media.duration * clamp(percent, 0, 100)) / 100);
        }
    }
    setVolume(volume) {
        this.media.volume = clamp(round(volume), 0, 1);
        if (this.media.muted && this.media.volume > 0)
            this.media.muted = false;
    }
    changeVolume(delta) {
        this.setVolume(this.media.volume + delta);
    }
    toggleMute() {
        this.media.muted = !this.media.muted;
    }
    setPlaybackRate(rate) {
        this.media.playbackRate = clamp(round(rate), this.#minRate, this.#maxRate);
    }
    changePlaybackRate(delta) {
        this.setPlaybackRate(this.media.playbackRate + delta);
    }
    toggleLoop() {
        this.media.loop = !this.media.loop;
        this.#syncAll();
    }
    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(logError);
        }
        else {
            (this.#fullscreenTarget ?? this.media).requestFullscreen().catch(logError);
        }
    }
    togglePictureInPicture() {
        if (!(this.media instanceof HTMLVideoElement))
            return;
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture().catch(logError);
        }
        else {
            this.media.requestPictureInPicture().catch(logError);
        }
    }
    #isSupported(name) {
        if (name === "fullscreen")
            return this.media instanceof HTMLVideoElement && document.fullscreenEnabled;
        if (name === "pip")
            return this.media instanceof HTMLVideoElement && document.pictureInPictureEnabled;
        return true;
    }
    #addSync(fn) {
        this.#syncers.push(fn);
    }
    #syncAll() {
        for (const fn of this.#syncers)
            fn();
    }
    #buildControl(name) {
        const signal = this.#abort.signal;
        const media = this.media;
        const step = this.#seekStep;
        const volumePercent = Math.round(this.#volumeStep * 100);
        let element;
        switch (name) {
            case "progress": {
                const slider = createSlider("Posició", 0, 0, 0.1, (value) => this.seekTo(value), signal);
                this.#addSync(() => {
                    const known = Number.isFinite(media.duration);
                    slider.disabled = !known;
                    slider.max = String(known ? media.duration : 0);
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
        element.classList.add(`media-controls__${name}`);
        return element;
    }
    #placeBar(container, wantsFullscreen) {
        if (container) {
            container.append(this.element);
            this.#fullscreenTarget = container;
        }
        else if (wantsFullscreen) {
            const wrapper = document.createElement("div");
            wrapper.className = "media-player";
            this.media.replaceWith(wrapper);
            wrapper.append(this.media, this.element);
            this.#wrapper = wrapper;
            this.#fullscreenTarget = wrapper;
        }
        else {
            this.media.insertAdjacentElement("afterend", this.element);
        }
    }
    #listen() {
        const options = { signal: this.#abort.signal };
        const sync = () => this.#syncAll();
        const events = [
            "play", "pause", "ended",
            "volumechange", "ratechange",
            "timeupdate", "loadedmetadata", "durationchange",
        ];
        for (const event of events) {
            this.media.addEventListener(event, sync, options);
        }
        document.addEventListener("fullscreenchange", sync, options);
    }
}
//# sourceMappingURL=media-controls.js.map