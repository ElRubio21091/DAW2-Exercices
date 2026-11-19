export function cercle(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, radi: number,
  colorFarciment: string,
  ambborde: boolean = false,
  colorBorde: string = "black",
  grosorBorde: number = 2
): void {
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

export function rectangle(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, amplada: number, alcada: number,
  colorFarciment: string
): void {
  ctx.fillStyle = colorFarciment;
  ctx.fillRect(x, y, amplada, alcada);
}