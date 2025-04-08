import Scene from './Scene.js';
import Player from '../objects/Player.js';
import Parkour from '../objects/Parkour.js';
import GUI from '../utilities/GUI.js';
import UICollision from '../utilities/UICollision.js';
import Edit from './Edit.js';
import MouseListener from '../utilities/MouseListener.js';
import MainCanvas from '../setup/MainCanvas.js';
import NeatManager from '../utilities/NeatManager.js';
import KeyListener from '../utilities/KeyListener.js';
import * as THREE from 'three'
import { Water } from 'three/examples/jsm/objects/Water.js'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import Statistics from './Statistics.js';
import Settings from './Settings.js';

export default class Game extends Scene {
  private editor: Edit = new Edit()
  
  private openEditor: boolean = false;
  
  private hoverEditor: boolean = false;
  
  private clickEditor: boolean = false;
  
  private readyClickEditor: boolean = true;

  public parkour: Parkour = new Parkour();

  public static alivePlayers: Player[] = []

  public static extinct: boolean = false;
  
  public static neat: any;

  public static colorMode: number = 1;

  private settings: Settings;

  public readyNextLevel: boolean = false;

  public autoProgress: boolean = false;

  public updateCamera: boolean = true;

  public userPlayer: Player;

  public statistics: Statistics = new Statistics();

  private water: Water;

  private sky: Sky;

  private sun: THREE.Vector3;

  private sceneEnv = new THREE.Scene()

  private pmremGenerator = new THREE.PMREMGenerator(MainCanvas.renderer);

  public constructor() {
    super();
    const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

    this.water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load( './assets/Water_1_M_Normal.jpg', function ( texture ) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        } ),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
      }
    );

    this.water.rotation.x = - Math.PI / 2;
    this.water.position.set(0, -8, 0);
    MainCanvas.scene.add(this.water);

    this.sun = new THREE.Vector3();
    this.sky = new Sky()
    this.sky.scale.setScalar(10000)
    MainCanvas.scene.add(this.sky)

    const skyUniforms = this.sky.material.uniforms;
    skyUniforms[ 'turbidity' ].value = 10;
    skyUniforms[ 'rayleigh' ].value = 2;
    skyUniforms[ 'mieCoefficient' ].value = 0.005;
    skyUniforms[ 'mieDirectionalG' ].value = 0.8;
    this.updateSun();

    Game.neat = new NeatManager()
    // this.userPlayer = new Player(0, false);
    Game.alivePlayers = Game.neat.players;

    this.settings = new Settings()

    // update camera position to first level
    const position = Parkour.levels[Parkour.activeLevel].location
    MainCanvas.camera.position.set(position.x - 60, position.y + 50, position.z);
    MainCanvas.camera.rotation.set(-0.643536637648491, -0.5225529300689504, -0.3581991118441852 );
    const euler = new THREE.Euler().setFromQuaternion(MainCanvas.camera.quaternion, 'YXZ');
    MainCanvas.yaw = euler.y;
    MainCanvas.pitch = euler.x;
  }

  public updateSun() {
    const parameters = {
      elevation: 0.2,
      azimuth: 130
    };
    let renderTarget;
    const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
    const theta = THREE.MathUtils.degToRad( parameters.azimuth );

    this.sun.setFromSphericalCoords( 1, phi, theta );
    this.sky.material.uniforms[ 'sunPosition' ].value.copy( this.sun );
    this.water.material.uniforms[ 'sunDirection' ].value.copy( this.sun ).normalize();

    if ( renderTarget !== undefined ) renderTarget.dispose();

    this.sceneEnv.add( this.sky );
    renderTarget = this.pmremGenerator.fromScene( this.sceneEnv );
    MainCanvas.scene.add( this.sky );

    MainCanvas.scene.environment = renderTarget.texture;
  }


  /**
   * processes player input
   */
  public override processInput(): void {
    console.log(MainCanvas.camera.rotation)
    this.statistics.procesInput()
    if (this.userPlayer) {

      if (KeyListener.isKeyDown('ArrowUp')) {
        this.userPlayer.moveForwardBackward(-1)
      }
      if (KeyListener.isKeyDown('ArrowDown')) {
        this.userPlayer.moveForwardBackward(1)
      }
      if (KeyListener.isKeyDown('ArrowLeft')) {
        this.userPlayer.moveLeft(1)
      }
      if (KeyListener.isKeyDown('ArrowRight')) {
        this.userPlayer.moveRight(1)
      } 
      if (KeyListener.isKeyDown('KeyQ') && this.userPlayer.onGround) {
        this.userPlayer.jump()
      }
    }
    if (KeyListener.keyPressed('Delete')) {
      Game.neat.players.forEach((player) => {
        player.calculateFitness()
      })
      Game.neat.neat.sort()
      const populationJson = Game.neat.neat.export(); // Export the current population
      const blob = new Blob([JSON.stringify(populationJson)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gen${Game.neat.neat.generation}_${Math.round(Math.max(...Statistics.highscores))}.json`; 
      a.click();
      URL.revokeObjectURL(url);

    }

    // option to end generation if player gets stuck
    if (!this.openEditor) {
      // ending generation
      if (KeyListener.keyPressed('KeyE')) {
        Parkour.levels[Parkour.activeLevel].time = Parkour.levels[Parkour.activeLevel].maxTime
        Game.neat.endGeneration();
        this.settings.update()
      }
      if ((MouseListener.isButtonDown(0) && UICollision.checkSquareCollisionMult(((0.26 * window.innerWidth) - this.statistics.visualisationPosition) / window.innerWidth, 0.929, 0.1, 0.05)) || this.autoProgress) {
        if (Parkour.levels[Parkour.activeLevel].finished) {
          if (!this.autoProgress) {
            Game.alivePlayers.forEach(player => player.alive = false);
          }
          this.readyNextLevel = true;
        }
      }

      // the three small buttons from hide-ui, auto-update camera position and auto progress
      if (MouseListener.buttonPressed(0)) {
        if (UICollision.checkSquareCollisionMult(((0.26 * window.innerWidth) - this.statistics.visualisationPosition) / window.innerWidth, 0.85, 0.012, 0.025)) {
          this.updateCamera = !this.updateCamera;
        }
        if (UICollision.checkSquareCollisionMult(((0.26 * window.innerWidth) - this.statistics.visualisationPosition) / window.innerWidth, 0.89, 0.012, 0.025)) {
          this.autoProgress = !this.autoProgress;
        }
        if (UICollision.checkSquareCollisionMult(((0.26 * window.innerWidth) - this.statistics.visualisationPosition) / window.innerWidth, 0.81, 0.012, 0.025)) {
          this.statistics.startHidingGraphs = !this.statistics.startHidingGraphs
        }
      }
    } 
    if (!this.settings.visible) {
      // edit button (with hover animation)
      if (UICollision.checkSquareCollisionMult(0.9, 0.04, 0.08, 0.05)) {
        this.hoverEditor = true;
        if (MouseListener.isButtonDown(0)) {
          this.clickEditor = true;
          if (this.readyClickEditor) {
            this.readyClickEditor = false;
            this.openEditor = !this.openEditor;
            Edit.gridHelper.visible = this.openEditor;
        
            // makes sure obstacle gets removed if it didn't get saved
            if (!this.editor.confirmedAdded) {
              this.editor.removeObstacle()
            }
          }
        } else {
          this.clickEditor = false;
          this.readyClickEditor = true;
        }
      } else {
        this.hoverEditor = false;
        this.clickEditor = false;
      } 
    }

    if (KeyListener.keyPressed('Digit2')) {
      if (Game.colorMode < 10) {
        Game.colorMode++
        console.log(Game.colorMode)
      }
    }
    if (KeyListener.keyPressed('Digit1')) {
      if (Game.colorMode > 0) {
        Game.colorMode--
        console.log(Game.colorMode)
      }
    }

    if (this.openEditor) {
      this.editor.processInput();    
    } else {
      this.settings.processInput()
    }
  }

  public override update(deltaTime: number): Scene {
    this.statistics.hideUI(deltaTime)
    this.water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
    if (!Game.extinct) {
      this.updateLight();
    }

    Parkour.levels[Parkour.activeLevel].time -= deltaTime
    if (Parkour.levels[Parkour.activeLevel].time <= 0) {
      Game.neat.players.forEach((player) => {
        player.killPlayer()
      })
    }

    Game.alivePlayers = Game.neat.players.filter(player => player.alive);
    Game.extinct = Game.alivePlayers.length === 0;

    if (this.userPlayer) {
      this.userPlayer.mesh.position.copy(this.userPlayer.playerBody.position);
      this.userPlayer.mesh.quaternion.copy(this.userPlayer.playerBody.quaternion);
      this.parkour.checkCollision(this.userPlayer, Game.neat.players);
      this.userPlayer.update(deltaTime);
      this.userPlayer.calculateFitness()
    }
    Game.neat.players[0].calculateObstacleDistance(true)
    if (!Game.extinct) {  
      if (Game.neat.players.filter(player => player.finished).length > Game.neat.neat.popsize * 0.75 && !Parkour.levels[Parkour.activeLevel].finished) {
        Parkour.levels[Parkour.activeLevel].finished = true
      }
      Game.alivePlayers.forEach((player) => {
        player.mesh.position.copy(player.playerBody.position);
        player.mesh.quaternion.copy(player.playerBody.quaternion);
        
        this.parkour.checkCollision(player, Game.neat.players);
        player.update(deltaTime);
      });
      
    } else {
      if (Parkour.levels[Parkour.activeLevel].finished && this.readyNextLevel) {
        Parkour.activeLevel++
        this.readyNextLevel = false
        Statistics.averageScores = []
        Statistics.highscores = []
        Game.neat.resetGeneration()   
        if (this.updateCamera) {
          const position = Parkour.levels[Parkour.activeLevel].location;
          MainCanvas.camera.position.set(position.x - 60, position.y + 50, position.z);
          MainCanvas.camera.rotation.set(-0.643536637648491, -0.5225529300689504, -0.3581991118441852);
      
          // Synchronize yaw and pitch
          const euler = new THREE.Euler().setFromQuaternion(MainCanvas.camera.quaternion, 'YXZ');
          MainCanvas.yaw = euler.y;
          MainCanvas.pitch = euler.x;
        }
      }
      Parkour.levels[Parkour.activeLevel].time = Parkour.levels[Parkour.activeLevel].maxTime
      this.settings.update()

      Game.neat.endGeneration();      
    }
    if (this.openEditor) {
      this.editor.update(deltaTime);    
    }
    return this;
  }

  public updateLight() {
    const bestPlayer = Game.alivePlayers.reduce((prev, current) => 
      (prev.brain.score > current.brain.score) ? prev : current
    );

    MainCanvas.directionalLight.position.set(
      bestPlayer.mesh.position.x + 70,
      bestPlayer.mesh.position.y + 140,
      bestPlayer.mesh.position.z - 140
    );

    MainCanvas.directionalLight.target.position.set(
      bestPlayer.mesh.position.x,
      bestPlayer.mesh.position.y,
      bestPlayer.mesh.position.z
    );

    MainCanvas.directionalLight.target.updateMatrixWorld();
  }

  public override render(): void {
    MainCanvas.renderer.render(MainCanvas.scene, MainCanvas.camera);
    const canvas = GUI.getCanvas();
    if (!this.settings.visible) {
      if (this.clickEditor) {
        GUI.fillRectangle(canvas, canvas.width * 0.9, canvas.height * 0.04, canvas.width * 0.08, canvas.height * 0.05, 255, 255, 255, 0.2, 10);
      } else if (this.hoverEditor) {
        GUI.fillRectangle(canvas, canvas.width * 0.9, canvas.height * 0.04, canvas.width * 0.08, canvas.height * 0.05, 255, 255, 255, 0.4, 10);
      } else {
        GUI.fillRectangle(canvas, canvas.width * 0.9, canvas.height * 0.04, canvas.width * 0.08, canvas.height * 0.05, 255, 255, 255, 0.7, 10);
      }
      GUI.writeText(canvas, 'Edit level', canvas.width * 0.9 + canvas.width * 0.04, canvas.height * 0.05 + canvas.height * 0.022, 'center', 'system-ui', 20, 'black')
    }
    
    // make sure to only render the ui if all other menu's are closed
    if (!this.settings.visible && !this.openEditor) {
      GUI.writeText(canvas, `Generation: ${Game.neat.neat.generation}`, canvas.width * 0.05 - this.statistics.visualisationPosition, canvas.height * 0.065, 'center', 'system-ui', 20, 'white');
      GUI.writeText(canvas, `Level: ${Parkour.activeLevel + 1}`, canvas.width * 0.133 - this.statistics.visualisationPosition, canvas.height * 0.065, 'center', 'system-ui', 20, 'white');
      GUI.writeText(canvas, `Alive: ${Math.round(Game.alivePlayers.length / Game.neat.players.length * 1000) / 10}%`, canvas.width * 0.21 - this.statistics.visualisationPosition, canvas.height * 0.065, 'center', 'system-ui', 20, 'white');
      GUI.fillRectangle(canvas, canvas.width * 0.26 - this.statistics.visualisationPosition, canvas.height * 0.929, canvas.width * 0.1, canvas.height * 0.05, 0, 0, 0, 0.2, 10)
      
      if (Parkour.levels[Parkour.activeLevel].finished) {
        GUI.fillRectangle(canvas, canvas.width * 0.26 - this.statistics.visualisationPosition, canvas.height * 0.929, canvas.width * 0.1, canvas.height * 0.05, 200, 252, 200, 0.5, 10)
        GUI.writeText(canvas, 'Next level', canvas.width * 0.31 - this.statistics.visualisationPosition, canvas.height * 0.96, 'center', 'system-ui', 20, 'black')
      } else {
        GUI.fillRectangle(canvas, canvas.width * 0.26 - this.statistics.visualisationPosition, canvas.height * 0.929, (canvas.width * 0.1) * (Math.min(Game.neat.players.filter(player => player.finished).length / (Game.neat.neat.popsize * 0.75), 1)), canvas.height * 0.05, 0, 0, 0, 0.2, 10 * Math.min(Game.neat.players.filter(player => player.finished).length / (Game.neat.neat.popsize * 0.75), 1))
        GUI.writeText(canvas, `${Game.neat.players.filter(player => player.finished).length} / ${Math.floor(Game.neat.neat.popsize * 0.75)} players`, canvas.width * 0.31 - this.statistics.visualisationPosition, canvas.height * 0.96, 'center', 'system-ui', 20, 'white')
      }
      GUI.writeText(canvas, `${Math.round(Parkour.levels[Parkour.activeLevel].time * 100) / 100}`, canvas.width * 0.365 - this.statistics.visualisationPosition, canvas.height * 0.965, 'left', 'system-ui', 30, 'black', 500)
      
      // the three buttons hide-ui, auto-progress and auto updating camera position
      GUI.fillRectangle(MainCanvas.canvas, MainCanvas.canvas.width * 0.26 - this.statistics.visualisationPosition, MainCanvas.canvas.height * 0.81, MainCanvas.canvas.width * 0.012, MainCanvas.canvas.height * 0.025, 100, 100, 100, 0.4, 8)
      GUI.drawRectangle(MainCanvas.canvas, MainCanvas.canvas.width * 0.26 - this.statistics.visualisationPosition, MainCanvas.canvas.height * 0.81, MainCanvas.canvas.width * 0.012, MainCanvas.canvas.height * 0.025, 100, 100, 100, 0.55, 3, 8)
      GUI.writeText(MainCanvas.canvas, 'Hide ui', MainCanvas.canvas.width * 0.28 - this.statistics.visualisationPosition, MainCanvas.canvas.height * 0.828, 'left', 'system-ui', 15, 'black')
      if (!this.statistics.visualisationHidden) {
        GUI.fillCircle(MainCanvas.canvas, MainCanvas.canvas.width * 0.2661 - this.statistics.visualisationPosition, MainCanvas.canvas.height * 0.823, MainCanvas.canvas.height * 0.008, 0, 0, 0, 0.8)
      }
      
      GUI.fillRectangle(canvas, canvas.width * 0.26 - this.statistics.visualisationPosition, canvas.height * 0.89, canvas.width * 0.012, canvas.height * 0.025, 100, 100, 100, 0.4, 8)
      GUI.drawRectangle(canvas, canvas.width * 0.26 - this.statistics.visualisationPosition, canvas.height * 0.89, canvas.width * 0.012, canvas.height * 0.025, 100, 100, 100, 0.55, 3, 8)
      GUI.writeText(canvas, 'Auto-progress', canvas.width * 0.28 - this.statistics.visualisationPosition, canvas.height * 0.909, 'left', 'system-ui', 15, 'black')
      if (this.autoProgress) {
        GUI.fillCircle(canvas, canvas.width * 0.2661 - this.statistics.visualisationPosition, canvas.height * 0.9025, canvas.height * 0.008, 0, 0, 0, 0.8)
      }
      
      GUI.fillRectangle(canvas, canvas.width * 0.26 - this.statistics.visualisationPosition, canvas.height * 0.85, canvas.width * 0.012, canvas.height * 0.025, 100, 100, 100, 0.4, 8)
      GUI.drawRectangle(canvas, canvas.width * 0.26 - this.statistics.visualisationPosition, canvas.height * 0.85, canvas.width * 0.012, canvas.height * 0.025, 100, 100, 100, 0.55, 3, 8)
      GUI.writeText(canvas, 'Auto-update camera pos', canvas.width * 0.28 - this.statistics.visualisationPosition, canvas.height * 0.868, 'left', 'system-ui', 15, 'black')
      if (this.updateCamera) {
        GUI.fillCircle(canvas, canvas.width * 0.2661 - this.statistics.visualisationPosition, canvas.height * 0.863, canvas.height * 0.008, 0, 0, 0, 0.8)
      }

      // the graphs and button for the graphs
      this.statistics.chooseVisualisation()
      if (!Game.extinct) {
        const bestPlayer = Game.neat.players[0]
        this.statistics.renderOutput(bestPlayer);
      }
    }

      
    // GUI.writeText(canvas, `Color mode ${Game.colorMode.toString()}`, canvas.width * 0.5, canvas.height * 0.07, 'center', 'system-ui', 14, 'black');
    if (this.openEditor) { 
      this.editor.render(canvas)
    } else {
      this.settings.render(canvas, this.statistics)
    }

  }
}
