import MainCanvas from '../setup/MainCanvas.js';
import GUI from '../utilities/GUI.js';

export default class Statistics {
  public static highscores: number[] = [];

  public static averageScores: number[] = [];

  public renderPerformance(): void {
    const startPosition: { x: number, y: number } = { x: window.innerWidth * 0.015, y: window.innerHeight * 0.35 };
    const dimensions: { width: number, height: number } = { width: window.innerWidth * 0.23, height: window.innerHeight * 0.4 };
    const min = 0;
    const max: number = Math.ceil(Math.max(...Statistics.highscores) / 250) * 250;
    GUI.fillRectangle(MainCanvas.canvas, startPosition.x, startPosition.y, dimensions.width, dimensions.height, 0, 0, 0, 0.2, 10);

    Statistics.highscores.forEach((score: number, index: number) => {
      if (index > 0) {
        GUI.drawLine(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1 + (index - 1) * dimensions.width * 0.8 / Statistics.highscores.length, startPosition.y + dimensions.height - (Statistics.highscores[index - 1] - min) / (max - min) * dimensions.height, startPosition.x + dimensions.width * 0.1 + index * dimensions.width * 0.8 / Statistics.highscores.length, startPosition.y + dimensions.height - (score - min) / (max - min) * dimensions.height, 255, 100, 100, 3);
      }
      GUI.fillCircle(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1 + index * dimensions.width * 0.8 / Statistics.highscores.length, startPosition.y + dimensions.height - (score - min) / (max - min) * dimensions.height, 4, 255, 100, 100, 1);
    });
    Statistics.averageScores.forEach((score: number, index: number) => {
      if (index > 0) {
        GUI.drawLine(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1 + (index - 1) * dimensions.width * 0.8 / Statistics.averageScores.length, startPosition.y + dimensions.height - (Statistics.averageScores[index - 1] - min) / (max - min) * dimensions.height, startPosition.x + dimensions.width * 0.1 + index * dimensions.width * 0.8 / Statistics.averageScores.length, startPosition.y + dimensions.height - (score - min) / (max - min) * dimensions.height, 100, 255, 100, 3);
      }
      GUI.fillCircle(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1 + index * dimensions.width * 0.8 / Statistics.averageScores.length, startPosition.y + dimensions.height - (score - min) / (max - min) * dimensions.height, 4, 100, 255, 100, 1);
    })
  }
}