import * as THREE from 'three';
export default class GUI {
    /**
    * @param canvas the canvas on which will be drawn
    * @returns the 2D rendering context of the canvas
    */
    static getCanvasContext(canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx === null)
            throw new Error("Canvas Rendering Context is null");
        return ctx;
    }
    static setCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        if (this.ctx === null)
            throw new Error("Canvas Rendering Context is null");
    }
    static getCanvas() {
        if (!this.canvas)
            throw new Error("Canvas is not set");
        return this.canvas;
    }
    /**
   * Loads a new image into an HTMLImageElement
   * WARNING: This happens async. Therefor the result might not immediately be visible
   *
   * @param source the path of the image to be loaded
   * @returns the image
   */
    static loadNewImage(source) {
        const img = new Image();
        img.src = source;
        return img;
    }
    static drawImage(canvas, image, dx, dy, width = 0, height = 0, rotation = 0, opacity) {
        const ctx = GUI.getCanvasContext(canvas);
        if (width === 0)
            width = image.width;
        if (height === 0)
            height = image.height;
        ctx.save();
        // Check if opacity is explicitly provided
        if (opacity !== undefined) {
            ctx.globalAlpha = opacity;
        }
        ctx.translate(dx + width / 2, dy + height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(image, -width / 2, -height / 2, width, height);
        ctx.restore();
    }
    /**
    * Write text to the canvas, with line breaks for each occurrence of "<br>", and optional rotation.
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
    * @param rotation rotation in degrees (default 0)
    */
    static writeText(canvas, text, xCoordinate, yCoordinate, alignment = "center", fontFamily = "sans-serif", fontSize = 20, color = "red", fontWeight = 10, rotation = 0) {
        const ctx = GUI.getCanvasContext(canvas);
        ctx.save();
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = alignment;
        ctx.translate(xCoordinate, yCoordinate);
        ctx.rotate((rotation * Math.PI) / 180);
        // each time <br> is found in the text, a line break is made
        const lines = text.split("<br>");
        let currentY = 0;
        for (const line of lines) {
            ctx.fillText(line, 0, currentY);
            currentY += fontSize;
        }
        ctx.restore();
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
    static fillRectangle(canvas, dx, dy, width, height, red = 255, green = 255, blue = 255, opacity = 1, borderRadius = 0, rotation = 0) {
        const ctx = GUI.getCanvasContext(canvas);
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
    /**
   * Draw a rectangle outline with optional border radius to the canvas
   *
   * @param canvas the canvas to draw to
   * @param dx the x-coordinate of the rectangle's top-left corner
   * @param dy the y-coordinate of the rectangle's top-left corner
   * @param width the width of the rectangle
   * @param height the height of the rectangle
   * @param red is the red color value of the rectangle
   * @param green is the green color value of the rectangle
   * @param blue is the blue color value of the rectangle
   * @param opacity is the opacity of the rectangle
   * @param lineWidth is the width of the border
   * @param borderRadius is the border radius of the rectangle
   */
    static drawRectangle(canvas, dx, dy, width, height, red = 255, green = 255, blue = 255, opacity = 1, lineWidth = 1, borderRadius = 0) {
        const ctx = GUI.getCanvasContext(canvas);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
        ctx.lineWidth = lineWidth;
        ctx.moveTo(dx + borderRadius, dy);
        ctx.arcTo(dx + width, dy, dx + width, dy + height, borderRadius);
        ctx.arcTo(dx + width, dy + height, dx, dy + height, borderRadius);
        ctx.arcTo(dx, dy + height, dx, dy, borderRadius);
        ctx.arcTo(dx, dy, dx + borderRadius, dy, borderRadius);
        ctx.closePath();
        ctx.stroke();
    }
    /**
   * Draw a filled circle on the canvas
   *
   * @param canvas the canvas to draw to
   * @param centerX the x-coordinate of the center of the circle
   * @param centerY the y-coordinate of the center of the circle
   * @param radius the radius of the circle
   * @param red the red color value
   * @param green the green color value
   * @param blue the blue color value
   * @param opacity the opacity
   */
    static fillCircle(canvas, centerX, centerY, radius, red = 255, green = 255, blue = 255, opacity = 1) {
        const ctx = GUI.getCanvasContext(canvas);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
    }
    /**
     * Draw line to the canvas
     *
     * @param canvas selected canvas
     * @param x1 x position of the starting point of drawn line
     * @param y1 y position of the starting point of drawn line
     * @param x2 x position of the ending point of drawn line
     * @param y2 y position of the ennding point of drawn line
     * @param red the red color value of the line
     * @param green the green color value of the line
     * @param blue the blue color value of the line
     * @param opacity the opacity of the line
     * @param lineWidth the width of the line
     */
    static drawLine(canvas, x1, y1, x2, y2, red = 255, green = 255, blue = 255, opacity = 1, lineWidth = 1) {
        const ctx = GUI.getCanvasContext(canvas);
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    static createGradientTexture() {
        const size = 512; // Texture size
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        if (context) {
            const gradient = context.createLinearGradient(400, 0, size, size);
            gradient.addColorStop(0, '#0044ff'); // End color
            gradient.addColorStop(1, '#add8e6'); // Start color (light blue)
            context.fillStyle = gradient;
            context.fillRect(0, 0, size, size);
        }
        return new THREE.CanvasTexture(canvas);
    }
}
