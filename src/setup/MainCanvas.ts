import * as THREE from "three";
import * as CANNON from "cannon-es";
import Scene from "../scenes/Scene.js";
import Game from "../scenes/Game.js";
import GUI from "../utilities/GUI.js";
import MouseListener from "../utilities/MouseListener.js";
import UICollision from "../utilities/UICollision.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import KeyListener from '../utilities/KeyListener.js';
import Player from '../objects/Player.js';
import Parkour from '../objects/Parkour.js';

export default class MainCanvas {
  public static scene: THREE.Scene = new THREE.Scene();

  public static camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  public static renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });

  public static gravityConstant = -11;
  
  public activeScene: Scene;
  
  public clock: THREE.Clock = new THREE.Clock(true);
  
  public static world = new CANNON.World({gravity: new CANNON.Vec3(0, MainCanvas.gravityConstant, 0)});

  public static canvas: HTMLCanvasElement;

  public static orbitControls: OrbitControls;

  public constructor() {
    MainCanvas.scene.background = new THREE.Color(0xaaddff);
    MainCanvas.camera.position.set(11, 17, 25);
    MainCanvas.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(MainCanvas.renderer.domElement);

    new MouseListener();
    new KeyListener()
    new UICollision();


    window.addEventListener("resize", () => this.onWindowResize(), false);

    // canvas used to render ui
    const canvas = document.getElementById("uiCanvas") as HTMLCanvasElement;
    GUI.setCanvas(canvas);
    MainCanvas.canvas = GUI.getCanvas();

    
    MainCanvas.orbitControls = new OrbitControls(MainCanvas.camera, MainCanvas.renderer.domElement);
    // MainCanvas.orbitControls.minPolarAngle = 0;
	  // MainCanvas.orbitControls.maxPolarAngle =  Math.PI * 0.5;
    // MainCanvas.orbitControls.enableDamping = true;
    // MainCanvas.orbitControls.dampingFactor = 0.1;
    // MainCanvas.orbitControls.enableZoom = false;
    // MainCanvas.orbitControls.maxDistance = 20;

    this.setupLight();
    this.startRendering();
    this.activeScene = new Game();
  }

  /*
   * Automatically adjusts scene size/aspect if window is resized
   */
  public onWindowResize() {
    MainCanvas.camera.aspect = window.innerWidth / window.innerHeight;
    MainCanvas.camera.updateProjectionMatrix();
    MainCanvas.renderer.setSize(window.innerWidth, window.innerHeight);
    MainCanvas.canvas.width = window.innerWidth;
    MainCanvas.canvas.height = window.innerHeight;
  }

  public setupLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    MainCanvas.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, Math.PI);
    directionalLight.position.set(101, 50, -30).normalize();
    MainCanvas.scene.add(directionalLight);
  }

  /*
   * Starts game loop
   * - proccesses input of active scene
   * - updates active scene
   * - renders active scene
   */
  public startRendering() {
    MainCanvas.renderer.setAnimationLoop(() => {
      const deltaTime = this.clock.getDelta();

      // physics
      MainCanvas.world.step(deltaTime)
      Player.mesh.position.copy(Player.playerBody.position);
      Player.mesh.quaternion.copy(Player.playerBody.quaternion);

      // updates position and rotation of player mesh
      
      // updates controls
      MainCanvas.orbitControls.update();
      
      // calls functions of active scene
      this.activeScene.processInput();
      this.activeScene.update(deltaTime);
      
      const ctx: CanvasRenderingContext2D = GUI.getCanvasContext(
        GUI.getCanvas()
      );
      ctx.clearRect(0, 0, GUI.canvas.width, GUI.canvas.height);
      this.activeScene.render();
    });
  }
}
