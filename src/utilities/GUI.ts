export default class GUI {
  public static canvas: HTMLCanvasElement;

  private static ctx: CanvasRenderingContext2D;

  /**
  * @param canvas the canvas on which will be drawn
  * @returns the 2D rendering context of the canvas
  */
  public static getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (ctx === null) throw new Error("Canvas Rendering Context is null");
    return ctx;
  }

  
  public static setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    if (this.ctx === null) throw new Error("Canvas Rendering Context is null");
  }

  public static getCanvas(): HTMLCanvasElement {
    if (!this.canvas) throw new Error("Canvas is not set");
    return this.canvas;
  }

  /**
  * Write text to the canvas, with line breaks for each occurrence of "<br>"
  *
  * @param canvas Canvas to write to
  * @param text Text to write
  * @param xCoordinate x-coordinate of the text
  * @param yCoordinate y-coordinate of the text
  * @param alignment align of the text
  * @param fontFamily font family to use when writing text
  * @param fontSize font size in pixels
  * @param color colour of text to write
  * @param fontWeight
  */
  public static writeText(canvas: HTMLCanvasElement, text: string, xCoordinate: number, yCoordinate: number, alignment: CanvasTextAlign = "center", fontFamily: string = "sans-serif", fontSize: number = 20, color: string = "red", fontWeight: number = 10): void {
    const ctx: CanvasRenderingContext2D = GUI.getCanvasContext(canvas);
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = alignment;

    // each time <br> is found in the text, a line break is made
    const lines = text.split("<br>");
    let currentY = yCoordinate;

    for (const line of lines) {
      ctx.fillText(line, xCoordinate, currentY);
      currentY += fontSize;
    }
  }

  /**
 * Draw a filled rectangle to the canvas
 *
 * @param canvas the canvas to draw to
 * @param dx the x-coordinate of the rectangle's left left corner
 * @param dy the y-coordinate of the rectangle's left left corner
 * @param width the width of the rectangle from x to the right
 * @param height the height of the rectrangle from y downwards
 * @param red is the red color value of the rectangle
 * @param green is the green color value of the rectangle
 * @param blue is the blue color value of the rectangle
 * @param opacity is the opacity of the rectangle
 * @param borderRadius is the border radius of the rectangle
 */
  public static fillRectangle(canvas: HTMLCanvasElement, dx: number, dy: number, width: number, height: number, red: number = 255, green: number = 255, blue: number = 255, opacity: number = 1, borderRadius: number = 0, rotation: number = 0): void {
    const ctx: CanvasRenderingContext2D = GUI.getCanvasContext(canvas);

    ctx.save();
    const centerX = dx + width / 2;
    const centerY = dy + height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation * (Math.PI / 180));
    ctx.translate(-centerX, -centerY);

    ctx.beginPath();
    ctx.moveTo(dx + borderRadius, dy);
    ctx.lineTo(dx + width - borderRadius, dy);
    ctx.arcTo(dx + width, dy, dx + width, dy + borderRadius, borderRadius);
    ctx.lineTo(dx + width, dy + height - borderRadius);
    ctx.arcTo(dx + width, dy + height, dx + width - borderRadius, dy + height, borderRadius);
    ctx.lineTo(dx + borderRadius, dy + height);
    ctx.arcTo(dx, dy + height, dx, dy + height - borderRadius, borderRadius);
    ctx.lineTo(dx, dy + borderRadius);
    ctx.arcTo(dx, dy, dx + borderRadius, dy, borderRadius);
    ctx.closePath();
    ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
    ctx.fill();

    ctx.restore();
  }
}