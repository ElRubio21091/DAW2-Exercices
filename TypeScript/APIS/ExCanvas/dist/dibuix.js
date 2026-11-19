export function cercle(ctx, x, y, radi, colorFarciment, ambborde = false, colorBorde = "black", grosorBorde = 2) {
    ctx.beginPath();
    ctx.arc(x, y, radi, 0, 2 * Math.PI);
    ctx.fillStyle = colorFarciment;
    ctx.fill();
    if (ambborde) {
        ctx.strokeStyle = colorBorde;
        ctx.lineWidth = grosorBorde;
        ctx.stroke();
    }
}
export function rectangle(ctx, x, y, amplada, alcada, colorFarciment) {
    ctx.fillStyle = colorFarciment;
    ctx.fillRect(x, y, amplada, alcada);
}
//# sourceMappingURL=dibuix.js.map