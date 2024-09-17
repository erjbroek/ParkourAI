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
import CreateBackground from './CreateBackground.js';

export default class MainCanvas {
  public static scene: THREE.Scene = new THREE.Scene();

  public static camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);

  public static renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });

  public static gravityConstant = -11;
  
  public activeScene: Scene;
  
  public clock: THREE.Clock = new THREE.Clock(true);
  
  public static world = new CANNON.World({gravity: new CANNON.Vec3(0, MainCanvas.gravityConstant, 0)});

  public static canvas: HTMLCanvasElement;

  public static orbitControls: OrbitControls;

  public static directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight(0xeeeeff, Math.PI);;

  public constructor() {
    MainCanvas.scene.background = new THREE.Color(0xaaddff);
    MainCanvas.camera.position.set(9, 9, 24);
    MainCanvas.renderer.setSize(window.innerWidth, window.innerHeight);
    MainCanvas.renderer.shadowMap.enabled = true;
    MainCanvas.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    document.body.appendChild(MainCanvas.renderer.domElement);

    new MouseListener();
    new KeyListener();
    new UICollision();

    window.addEventListener("resize", () => this.onWindowResize(), false);

    // canvas used to render ui
    const canvas = document.getElementById("uiCanvas") as HTMLCanvasElement;
    GUI.setCanvas(canvas);
    MainCanvas.canvas = GUI.getCanvas();

    MainCanvas.orbitControls = new OrbitControls(MainCanvas.camera, MainCanvas.renderer.domElement);

    this.setupLight();
    CreateBackground.addBackgroundSphere(); // Add background sphere
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
    const ambientLightTop = new THREE.AmbientLight(0x12a3ff, 0.5);
    MainCanvas.scene.add(ambientLightTop);

    const ambientLightBottom = new THREE.AmbientLight(0xffd700, 0.5);
    MainCanvas.scene.add(ambientLightBottom);

    MainCanvas.directionalLight = new THREE.DirectionalLight(0xeeeeff, Math.PI);
    MainCanvas.directionalLight.position.set(70, 140, -140)
    MainCanvas.directionalLight.castShadow = true;
    MainCanvas.scene.add(MainCanvas.directionalLight);
  }

  public static updateLightAndCameraPosition() {
    this.directionalLight.position.set(
      Player.mesh.position.x + 70,
      Player.mesh.position.y + 140,
      Player.mesh.position.z -140
    );

    this.directionalLight.target.position.set(
      Player.mesh.position.x,
      Player.mesh.position.y,
      Player.mesh.position.z
    );

    this.directionalLight.target.updateMatrixWorld();
  }

  public static updateCamera(deltaTime: number) {
    if (Player.mesh.position.y < -10) {
        const cameraOffset = new THREE.Vector3(9, 0, 24);
        this.camera.position.copy(Player.playerBody.position).add(cameraOffset);
    }
    const scaledVelocity = new THREE.Vector3(Player.playerBody.velocity.x, 0, Player.playerBody.velocity.z).multiplyScalar(deltaTime);
    this.orbitControls.target.copy(Player.mesh.position);

    // this makes sure the camera follows the position of the player
    this.camera.position.add(scaledVelocity);

    this.orbitControls.update();
  }


  /*
   * Starts game loop
   * - processes input of active scene
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

      // updates controls
      MainCanvas.orbitControls.update();
      
      // calls functions of active scene
      this.activeScene.processInput();
      this.activeScene.update(deltaTime);
      MainCanvas.updateCamera(deltaTime)
      
      const ctx: CanvasRenderingContext2D = GUI.getCanvasContext(
        GUI.getCanvas()
      );
      ctx.clearRect(0, 0, GUI.canvas.width, GUI.canvas.height);
      this.activeScene.render();
    });
  }
}
