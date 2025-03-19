import Player from '../objects/Player.js';
import MainCanvas from '../setup/MainCanvas.js';
import GUI from '../utilities/GUI.js';
import MouseListener from '../utilities/MouseListener.js';
import NeatManager from '../utilities/NeatManager.js';
import UICollision from '../utilities/UICollision.js';
import Game from './Game.js';

export default class Statistics {
  public static highscores: number[] = [];

  public static highscore: number = -Infinity;

  public static averageScores: number[] = [];

  public static checkpointsReached: number[] = []

  public static previousCheckpointsReached: number[] = []

  private visualisation: number = 0;

  private hideVisualisations: boolean = false;

  public procesInput(): void {
    if (MouseListener.buttonPressed(0)) {
      if (UICollision.checkSquareCollision(0.26, 0.81, 0.012, 0.025)) {
        this.hideVisualisations = !this.hideVisualisations
      }
    }
  }

  public chooseVisualisation(): void {
    GUI.fillRectangle(MainCanvas.canvas, MainCanvas.canvas.width * 0.26, MainCanvas.canvas.height * 0.81, MainCanvas.canvas.width * 0.012, MainCanvas.canvas.height * 0.025, 100, 100, 100, 0.4, 8)
    GUI.drawRectangle(MainCanvas.canvas, MainCanvas.canvas.width * 0.26, MainCanvas.canvas.height * 0.81, MainCanvas.canvas.width * 0.012, MainCanvas.canvas.height * 0.025, 100, 100, 100, 0.55, 3, 8)
    
    // GUI.fillRectangle(canvas, canvas.width * 0.26, canvas.height * 0.85, canvas.width * 0.012, canvas.height * 0.025, 100, 100, 100, 0.4, 8)
    // GUI.drawRectangle(canvas, canvas.width * 0.26, canvas.height * 0.85, canvas.width * 0.012, canvas.height * 0.025, 100, 100, 100, 0.55, 3, 8)
    GUI.writeText(MainCanvas.canvas, 'Hide ui', MainCanvas.canvas.width * 0.28, MainCanvas.canvas.height * 0.828, 'left', 'system-ui', 15, 'black')
    if (this.hideVisualisations) {
      GUI.fillCircle(MainCanvas.canvas, MainCanvas.canvas.width * 0.2661, MainCanvas.canvas.height * 0.823, MainCanvas.canvas.height * 0.008, 0, 0, 0, 0.8)
    }
    const width = window.innerWidth * 0.1 / 4;

    for (let i = 0; i < 2; i++) {
      if (UICollision.checkCollision(window.innerWidth * 0.25 + i * width * 1.1, window.innerHeight * 0.04, width, window.innerHeight * 0.035)) {
        GUI.fillRectangle(MainCanvas.canvas, window.innerWidth * 0.25 + i * width * 1.1, window.innerHeight * 0.04, width, window.innerHeight * 0.035, 0, 0, 0, 0.2, 3);
        if (MouseListener.isButtonDown(0)) {
          GUI.fillRectangle(MainCanvas.canvas, window.innerWidth * 0.25 + i * width * 1.1, window.innerHeight * 0.04, width, window.innerHeight * 0.035, 255, 255, 255, 0.4, 3);
          this.visualisation = i;
        }
      }
      GUI.fillRectangle(MainCanvas.canvas, window.innerWidth * 0.25 + i * width * 1.1, window.innerHeight * 0.04, width, window.innerHeight * 0.035, 0, 0, 0, 0.2, 3);
      GUI.writeText(MainCanvas.canvas, `${i + 1}`, i * width * 1.1 + window.innerWidth * 0.262, window.innerHeight * 0.04 + window.innerHeight * 0.023, 'center', 'system-ui', 15, 'black');
    }


    if (this.visualisation == 0) {
      this.renderPerformance();
    } else if (this.visualisation == 1) {
      this.renderProgression();
    }
  }

  public renderPerformance(): void {
    const startPosition: { x: number, y: number } = { x: window.innerWidth * 0.015, y: window.innerHeight * 0.04 };
    const dimensions: { width: number, height: number } = { width: window.innerWidth * 0.23, height: window.innerHeight * 0.4 };
    const max: number = Math.ceil(Math.max(...Statistics.highscores) / 250) * 250;

    let min = 0;
    if (!NeatManager.usePretrainedNetwork) {
      min = Math.min(...Statistics.highscores, ...Statistics.averageScores);
    }
    const maxHighscore: number = Math.ceil(Math.max(...Statistics.highscores));
    const maxAverage: number = Math.ceil(Math.max(...Statistics.averageScores));
    
    // first rendering graph itself
    GUI.fillRectangle(MainCanvas.canvas, startPosition.x, startPosition.y * 0.8, dimensions.width, dimensions.height * 1.3, 0, 0, 0, 0.2, 10);
    GUI.drawLine(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1, startPosition.y * 2, startPosition.x + dimensions.width * 0.1, startPosition.y + dimensions.height, 255, 255, 255, 1);
    GUI.drawLine(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1, startPosition.y + dimensions.height, startPosition.x + dimensions.width * 0.9, startPosition.y + dimensions.height, 255, 255, 255, 1);

    // render gridlines and axis
    const numGridLines: number = 5;
    for (let i = 0; i <= numGridLines; i++) {
      GUI.drawLine(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1, startPosition.y + dimensions.height - i * dimensions.height / numGridLines / 1.115, startPosition.x + dimensions.width * 0.9, startPosition.y + dimensions.height - i * dimensions.height / numGridLines / 1.115, 255, 255, 255, 0.2);
      GUI.drawLine(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1 + i * dimensions.width * 0.8 / numGridLines, startPosition.y * 2, startPosition.x + dimensions.width * 0.1 + i * dimensions.width * 0.8 / numGridLines, startPosition.y + dimensions.height, 255, 255, 255, 0.2);
      if (Statistics.highscores.length > 0) {
        GUI.writeText(MainCanvas.canvas, `${Math.round(min + i * (max - min) / numGridLines)}`, startPosition.x + dimensions.width * 0.05, startPosition.y + dimensions.height - i * dimensions.height / numGridLines / 1.1, 'center', 'system-ui', 15, 'black');
      }
    }
    GUI.writeText(MainCanvas.canvas, 'Score', startPosition.x + dimensions.width * 0.05, startPosition.y + dimensions.height / 1.8, 'center', 'system-ui', 15, 'black');
    GUI.writeText(MainCanvas.canvas, 'Generation', startPosition.x + dimensions.width / 2, startPosition.y + dimensions.height + 20, 'center', 'system-ui', 15, 'black');
    
    // next rendering average scores and highscores
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
    });
    GUI.drawLine(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1, startPosition.y + dimensions.height - (maxHighscore - min) / (max - min) * dimensions.height, startPosition.x + dimensions.width * 0.9, startPosition.y + dimensions.height - (maxHighscore - min) / (max - min) * dimensions.height, 255, 100, 100, 0.4, 2);
    GUI.drawLine(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1, startPosition.y + dimensions.height - (maxAverage - min) / (max - min) * dimensions.height, startPosition.x + dimensions.width * 0.9, startPosition.y + dimensions.height - (maxAverage - min) / (max - min) * dimensions.height, 100, 255, 100, 0.4, 2);

    // legenda
    GUI.fillRectangle(MainCanvas.canvas, startPosition.x + dimensions.width * 0.05, startPosition.y + dimensions.height * 1.1 + 10, window.innerWidth * 0.02, 15, 255, 100, 100, 1);
    GUI.fillRectangle(MainCanvas.canvas, startPosition.x + dimensions.width * 0.05, startPosition.y + dimensions.height * 1.1 + 40, window.innerWidth * 0.02, 15, 100, 255, 100, 1);
    GUI.writeText(MainCanvas.canvas, 'Highscore', startPosition.x + window.innerWidth * 0.04, startPosition.y + dimensions.height * 1.1 + 20, 'left', 'system-ui', 15, 'black');
    GUI.writeText(MainCanvas.canvas, 'Average', startPosition.x + window.innerWidth * 0.04, startPosition.y + dimensions.height * 1.1 + 50, 'left', 'system-ui', 15, 'black');
  }

  public static renderOutput(best_player: Player): void {
    const startPosition: { x: number, y: number } = { x: window.innerWidth * 0.015, y: window.innerHeight * 0.58 };
    const dimensions: { width: number, height: number } = { width: window.innerWidth * 0.23, height: window.innerHeight * 0.4 };
    const bottom = startPosition.y + dimensions.height * 0.8
    const max_height = dimensions.height / 2
    const width = dimensions.width * 0.15
    GUI.fillRectangle(MainCanvas.canvas, startPosition.x, startPosition.y, dimensions.width, dimensions.height, 0, 0, 0, 0.2, 10);
    GUI.drawLine(MainCanvas.canvas, startPosition.x + dimensions.width * 0.05, bottom, startPosition.x + dimensions.width * 0.05 + width * 1.2 * 5, bottom, 0, 0, 0, 0.5, 2)
    GUI.fillRectangle(MainCanvas.canvas, startPosition.x + dimensions.width * 0.05, bottom - max_height, dimensions.width * 0.05 + width * 1.2 * 4.72, max_height, 0, 0, 0, 0.15, 10)
    GUI.writeText(MainCanvas.canvas, 'Neural network outputs', startPosition.x + dimensions.width * 0.5, startPosition.y + dimensions.height * 0.1, 'center', 'system-ui', 22, 'white', 300)
    
    let output = best_player.brain.activate(best_player.inputValues);
    const max = Math.max(...output);
    const min = Math.min(...output);
    output = output.map(value => (value - min) / (max - min));
    const output_classes = ['Forward', 'Back', 'Left', 'Right', 'Jump']
    const highest_output = Math.max(output[0], output[1], output[2], output[3], output[4])
    for (let i = 0; i < 5; i++){
      if (output[i] == highest_output) {
        GUI.fillRectangle(MainCanvas.canvas, startPosition.x + dimensions.width * 0.065 + width * 1.2 * i, bottom - max_height * output[i], width, max_height * output[i], 255 - 255 * output[i], 255 * output[i], 0, 1, 0, 0)
        GUI.fillRectangle(MainCanvas.canvas, startPosition.x + dimensions.width * 0.065 + width * 1.2 * i, bottom - max_height * output[i], width, max_height * output[i], 255, 255, 255, 0.4)
      } else {
        GUI.fillRectangle(MainCanvas.canvas, startPosition.x + dimensions.width * 0.065 + width * 1.2 * i, bottom - max_height * output[i], width, max_height * output[i], 255 - 255 * output[i], 255 * output[i], 0, 1, 0, 0)
      }
      GUI.writeText(MainCanvas.canvas, output_classes[i], startPosition.x + dimensions.width * 0.05 + width * 1.2 * i, startPosition.y + dimensions.height * 0.9, 'left', 'system-ui', 20, 'white')
      GUI.writeText(MainCanvas.canvas, `${Math.round(output[i] * 1000) / 10}%`, startPosition.x + dimensions.width * 0.07 + width * 1.2 * i, startPosition.y + dimensions.height * 0.25, 'left', 'system-ui', 20, 'white')
    }
  }

  public renderProgression() {
    const startPosition: { x: number, y: number } = { x: window.innerWidth * 0.015, y: window.innerHeight * 0.04 };
    const dimensions: { width: number, height: number } = { width: window.innerWidth * 0.23, height: window.innerHeight * 0.4 };
    const max = window.innerHeight * 0.4;

    GUI.fillRectangle(MainCanvas.canvas, startPosition.x, startPosition.y * 0.8, dimensions.width, dimensions.height * 1.3, 0, 0, 0, 0.2, 10);
    GUI.drawLine(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1, startPosition.y + dimensions.height * 1.1, startPosition.x + dimensions.width * 0.9, startPosition.y + dimensions.height * 1.1, 255, 255, 255, 1);
    GUI.fillRectangle(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1, startPosition.y + dimensions.height * 1.1 - max, window.innerWidth * 0.184, max, 0, 0, 0, 0.2)

    GUI.drawLine(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1, startPosition.y + dimensions.height * 1.1 - max / 2, startPosition.x + dimensions.width * 0.9, startPosition.y + dimensions.height * 1.1 - max / 2, 255, 255, 255, 0.2)
    GUI.writeText(MainCanvas.canvas, '50%', startPosition.x + dimensions.width * 0.05, startPosition.y + dimensions.height * 1.1 - max / 2, 'center', 'system-ui', 15, 'black')
    GUI.drawLine(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1, startPosition.y + dimensions.height * 1.1 - max / 4, startPosition.x + dimensions.width * 0.9, startPosition.y + dimensions.height * 1.1 - max / 4, 255, 255, 255, 0.2)
    GUI.writeText(MainCanvas.canvas, '25%', startPosition.x + dimensions.width * 0.05, startPosition.y + dimensions.height * 1.1 - max / 4, 'center', 'system-ui', 15, 'black')
    GUI.drawLine(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1, startPosition.y + dimensions.height * 1.1 - max / 1.333, startPosition.x + dimensions.width * 0.9, startPosition.y + dimensions.height * 1.1 - max / 1.333, 255, 255, 255, 0.2)
    GUI.writeText(MainCanvas.canvas, '75%', startPosition.x + dimensions.width * 0.05, startPosition.y + dimensions.height * 1.1 - max / 1.333, 'center', 'system-ui', 15, 'black')

    for (let i = 0; i < Statistics.previousCheckpointsReached.length ; i++) {
      GUI.fillRectangle(MainCanvas.canvas, window.innerWidth * 0.05 + (window.innerWidth * 0.02 * i), startPosition.y + (dimensions.height * 1.1) - Statistics.previousCheckpointsReached[i] / NeatManager.popSize * max, 30, Statistics.previousCheckpointsReached[i] / NeatManager.popSize * max, 255, 255, 255, 0.2)
      GUI.writeText(MainCanvas.canvas, `${i + 1}`, window.innerWidth * 0.05 + (10 + window.innerWidth * 0.02 * i), startPosition.y + dimensions.height * 1.1 + 30, 'left', 'system-ui', 12, 'white')
    }
    for (let i = 0; i < Statistics.checkpointsReached.length ; i++) {
      GUI.fillRectangle(MainCanvas.canvas, window.innerWidth * 0.05 + (window.innerWidth * 0.02 * i), startPosition.y + (dimensions.height * 1.1) - Statistics.checkpointsReached[i] / NeatManager.popSize * max, 30, Statistics.checkpointsReached[i] / NeatManager.popSize * max, 255, 255, 255, 0.2)
      GUI.writeText(MainCanvas.canvas, `${i + 1}`, window.innerWidth * 0.05 + (10 + window.innerWidth * 0.02 * i), startPosition.y + dimensions.height * 1.1 + 30, 'left', 'system-ui', 12, 'white')
      GUI.writeText(MainCanvas.canvas, `${Math.round(Statistics.checkpointsReached[i] / NeatManager.popSize * 100)}%`, window.innerWidth * 0.05 + (10 + window.innerWidth * 0.02 * i), startPosition.y + dimensions.height * 1.1 - Statistics.checkpointsReached[i] / NeatManager.popSize * max - 10, 'left', 'system-ui', 12, 'white')
    }
    GUI.writeText(MainCanvas.canvas, '% checkpoint completed', startPosition.x + dimensions.width / 2, startPosition.y + dimensions.height * 1.1 + 50, 'center', 'system-ui', 22, 'white')

  }
}