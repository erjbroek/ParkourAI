import Player from '../objects/Player.js';
import MainCanvas from '../setup/MainCanvas.js';
import GUI from '../utilities/GUI.js';
import MouseListener from '../utilities/MouseListener.js';
import NeatManager from '../utilities/NeatManager.js';
import UICollision from '../utilities/UICollision.js';
import Game from './Game.js';

export default class Statistics {
  public static highscores: number[] = [];

  public static averageScores: number[] = [];

  public static checkpointsReached: number[] = []

  public static previousCheckpointsReached: number[] = []

  private visualisation: number = 0;

  public procesInput(): void {

  }

  public chooseVisualisation(): void {
    const width = window.innerWidth * 0.1 / 4;


    for (let i = 0; i < 2; i++) {
      if (UICollision.checkCollision(window.innerWidth * 0.02 + i * width * 1.1, window.innerHeight * 0.04, width, window.innerHeight * 0.035)) {
        GUI.fillRectangle(MainCanvas.canvas, window.innerWidth * 0.02 + i * width * 1.1, window.innerHeight * 0.04, width, window.innerHeight * 0.035, 0, 0, 0, 0.2, 3);
        if (MouseListener.isButtonDown(0)) {
          GUI.fillRectangle(MainCanvas.canvas, window.innerWidth * 0.02 + i * width * 1.1, window.innerHeight * 0.04, width, window.innerHeight * 0.035, 255, 255, 255, 0.4, 3);
          this.visualisation = i;
        }
      }
      GUI.fillRectangle(MainCanvas.canvas, window.innerWidth * 0.02 + i * width * 1.1, window.innerHeight * 0.04, width, window.innerHeight * 0.035, 0, 0, 0, 0.2, 3);
      GUI.writeText(MainCanvas.canvas, `${i + 1}`, i * width * 1.1 + window.innerWidth * 0.032, window.innerHeight * 0.04 + window.innerHeight * 0.023, 'center', 'system-ui', 15, 'black');
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
    GUI.drawLine(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1, startPosition.y * 1.1, startPosition.x + dimensions.width * 0.1, startPosition.y + dimensions.height, 255, 255, 255, 1);
    GUI.drawLine(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1, startPosition.y + dimensions.height, startPosition.x + dimensions.width * 0.9, startPosition.y + dimensions.height, 255, 255, 255, 1);

    // render gridlines and axis
    const numGridLines: number = 5;
    for (let i = 0; i <= numGridLines; i++) {
      GUI.drawLine(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1, startPosition.y + dimensions.height - i * dimensions.height / numGridLines / 1.1, startPosition.x + dimensions.width * 0.9, startPosition.y + dimensions.height - i * dimensions.height / numGridLines / 1.1, 255, 255, 255, 0.2);
      GUI.drawLine(MainCanvas.canvas, startPosition.x + dimensions.width * 0.1 + i * dimensions.width * 0.8 / numGridLines, startPosition.y * 1.1, startPosition.x + dimensions.width * 0.1 + i * dimensions.width * 0.8 / numGridLines, startPosition.y + dimensions.height, 255, 255, 255, 0.2);
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
    

    for (let i = 0; i < Statistics.previousCheckpointsReached.length ; i++) {
      GUI.fillRectangle(MainCanvas.canvas, window.innerWidth * 0.05 + (window.innerWidth * 0.02 * i), startPosition.y + (dimensions.height * 1.1) - Statistics.previousCheckpointsReached[i] / Game.neat.neat.popsize * max, 30, Statistics.previousCheckpointsReached[i] / Game.neat.neat.popsize * max, 255, 255, 255, 0.2)
      GUI.writeText(MainCanvas.canvas, `${i + 1}`, window.innerWidth * 0.05 + (10 + window.innerWidth * 0.02 * i), startPosition.y + dimensions.height * 1.1 + 30, 'left', 'system-ui', 12, 'white')
    }

    for (let i = 0; i < Statistics.checkpointsReached.length ; i++) {
      GUI.fillRectangle(MainCanvas.canvas, window.innerWidth * 0.05 + (window.innerWidth * 0.02 * i), startPosition.y + (dimensions.height * 1.1) - Statistics.checkpointsReached[i] / Game.neat.neat.popsize * max, 30, Statistics.checkpointsReached[i] / Game.neat.neat.popsize * max, 255, 255, 255, 0.2)
      GUI.writeText(MainCanvas.canvas, `${i + 1}`, window.innerWidth * 0.05 + (10 + window.innerWidth * 0.02 * i), startPosition.y + dimensions.height * 1.1 + 30, 'left', 'system-ui', 12, 'white')
    }
    GUI.writeText(MainCanvas.canvas, 'Checkpoint numbers', startPosition.x + dimensions.width / 2, startPosition.y + dimensions.height * 1.1 + 50, 'center', 'system-ui', 22, 'white')

  }
}