import { MediaControls } from "./media-controls.js";
const videoBar = new MediaControls("video");
new MediaControls("audio", {
    controls: [
        "progress", "restart", "rewind", "play", "stop", "forward", "time",
        "mute", "volumeSlider", "slower", "speed", "faster", "loop",
    ],
    seekStep: 10,
    rateStep: 0.5,
});
void videoBar;
//# sourceMappingURL=main.js.map