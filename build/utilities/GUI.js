import * as THREE from 'three';
export default class GUI {
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
        if (opacity !== undefined) {
            ctx.globalAlpha = opacity;
        }
        ctx.translate(dx + width / 2, dy + height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(image, -width / 2, -height / 2, width, height);
        ctx.restore();
    }
    static writeText(canvas, text, xCoordinate, yCoordinate, alignment = "center", fontFamily = "sans-serif", fontSize = 20, color = "red", fontWeight = 10) {
        const ctx = GUI.getCanvasContext(canvas);
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = alignment;
        const lines = text.split("<br>");
        let currentY = yCoordinate;
        for (const line of lines) {
            ctx.fillText(line, xCoordinate, currentY);
            currentY += fontSize;
        }
    }
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
    static createGradientTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        if (context) {
            const gradient = context.createLinearGradient(400, 0, size, size);
            gradient.addColorStop(0, '#0044ff');
            gradient.addColorStop(1, '#add8e6');
            context.fillStyle = gradient;
            context.fillRect(0, 0, size, size);
        }
        return new THREE.CanvasTexture(canvas);
    }
}
