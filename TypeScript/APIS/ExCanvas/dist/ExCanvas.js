import { cercle, rectangle } from "./dibuix.js";
const canvas = document.createElement("canvas");
canvas.width = 640;
canvas.height = 400;
document.body.appendChild(canvas);
const context = canvas.getContext("2d");
if (!context)
    throw new Error("Failed to get 2d context");
context.beginPath();
context.moveTo(50, 50);
context.lineTo(200, 50);
context.stroke();
cercle(context, 320, 280, 70, "white", true, "black", 4);
cercle(context, 320, 180, 45, "white", true, "black", 4);
rectangle(context, 290, 110, 60, 30, "black");
//# sourceMappingURL=ExCanvas.js.map