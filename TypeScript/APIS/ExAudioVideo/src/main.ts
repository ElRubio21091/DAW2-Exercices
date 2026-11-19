import { MediaControls } from "./media-controls.js";

// Vídeo: todos los controles por defecto
const videoBar = new MediaControls("video");

// Audio: solo los controles que queramos, en el orden que queramos
new MediaControls("audio", {
  controls: [
    "progress", "restart", "rewind", "play", "stop", "forward", "time",
    "mute", "volumeSlider", "slower", "speed", "faster", "loop",
  ],
  seekStep: 10,
  rateStep: 0.5,
});

// Todas las acciones también se pueden llamar desde código:
// videoBar.seekToPercent(50);
// videoBar.setPlaybackRate(2);
// videoBar.setVolume(0.3);
// videoBar.destroy();
void videoBar;