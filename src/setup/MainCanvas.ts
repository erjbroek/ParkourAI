import * as THREE from "three";
import * as CANNON from "cannon-es";
import Scene from "../scenes/Scene.js";
import Game from "../scenes/Game.js";
import GUI from "../utilities/GUI.js";
import MouseListener from "../utilities/MouseListener.js";
import UICollision from "../utilities/UICollision.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import KeyListener from '../utilities/KeyListener.js';
import Player from '../objects/Player.js';
import Parkour from '../objects/Parkour.js';
import CreateBackground from './CreateBackground.js';
import Edit from '../scenes/Edit.js';

export default class MainCanvas {
  public static scene: THREE.Scene = new THREE.Scene();

  public static camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);

  public static renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });

  public static gravityConstant = -25;

  public activeScene: Game;

  public clock: THREE.Clock = new THREE.Clock(true);

  public static world = new CANNON.World({ gravity: new CANNON.Vec3(0, MainCanvas.gravityConstant, 0) });

  public static canvas: HTMLCanvasElement;

  public static flyControls: FlyControls = new FlyControls(MainCanvas.camera, MainCanvas.renderer.domElement);

  public static directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight(0xeeeeff, Math.PI);

  private yaw: number = 0;

  private pitch: number = -0.1;

  private isMouseButtonDown: boolean = false;

  private network: any;

  private pauzed: boolean = false;

  public constructor() {
    MainCanvas.scene.background = new THREE.Color(0xaaddff);
    MainCanvas.camera.position.set(5, 18, 45);
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

    MainCanvas.flyControls.movementSpeed = 0;
    MainCanvas.flyControls.rollSpeed = 0;
    MainCanvas.flyControls.dragToLook = false;
    window.addEventListener("mousedown", () => this.onMouseDown(), false);
    window.addEventListener("mouseup", () => this.onMouseUp(), false);

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

  // sets up initial lights
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



  /*
   * Starts game loop
   * - processes input of active scene
   * - updates active scene
   * - renders active scene
   */
  public startRendering() {
    MainCanvas.renderer.setAnimationLoop(() => {
        if (KeyListener.keyPressed('KeyP')) {
            this.pauzed = !this.pauzed;
        }

        const deltaTime = this.clock.getDelta();

        // Only step the physics and update the scene when not paused
        if (!this.pauzed) {
            if (deltaTime > 0) {
                MainCanvas.world.step(deltaTime);
            }

            // Process input and update the active scene
            this.activeScene.processInput();
            this.activeScene.update(deltaTime);
        }

        if (!Edit.editActive) {
            this.rotateCamera(deltaTime);
        }
        this.moveCamera(deltaTime);

        // Always update controls, even when paused
        MainCanvas.flyControls.update(deltaTime);

        // Render the GUI and the active scene
        const ctx: CanvasRenderingContext2D = GUI.getCanvasContext(
            GUI.getCanvas()
        );
        ctx.clearRect(0, 0, GUI.canvas.width, GUI.canvas.height);
        this.activeScene.render(deltaTime);
    });
}
  
  private onMouseDown() {
    this.isMouseButtonDown = true;
  }

  private onMouseUp() {
      this.isMouseButtonDown = false;
  }

  private rotateCamera(deltaTime: number) {
    const mouseSensitivity = 0.002;
    if (this.isMouseButtonDown) {
        const mouseMovementX = MouseListener.mouseDelta.x;
        const mouseMovementY = MouseListener.mouseDelta.y;
        console.log(mouseMovementX, mouseMovementY)
  
        this.yaw -= mouseMovementX * mouseSensitivity;
        this.pitch -= mouseMovementY * mouseSensitivity;

        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        MainCanvas.camera.quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
        MouseListener.mouseDelta.x = 0;
        MouseListener.mouseDelta.y = 0;
    }
  }

  private moveCamera(deltaTime: number) {

    // Handle vertical camera movement
    if (KeyListener.isKeyDown('Space')) {
        MainCanvas.camera.position.y += 0.5;
    }
    if (KeyListener.isKeyDown('ShiftLeft') || KeyListener.isKeyDown('ShiftRight')) {
        MainCanvas.camera.position.y -= 0.5;
    }

    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    forward.set(
        Math.sin(this.yaw),
        0,
        Math.cos(this.yaw)
    ).normalize();

    right.copy(forward).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);


    const moveSpeed = 50 * deltaTime;
    if (KeyListener.isKeyDown('KeyW')) {
        MainCanvas.camera.position.sub(forward.clone().multiplyScalar(moveSpeed));
    }
    if (KeyListener.isKeyDown('KeyS')) {
        MainCanvas.camera.position.sub(forward.clone().multiplyScalar(-moveSpeed));
    }
    if (KeyListener.isKeyDown('KeyA')) {
        MainCanvas.camera.position.add(right.clone().multiplyScalar(-moveSpeed));
    }
    if (KeyListener.isKeyDown('KeyD')) {
        MainCanvas.camera.position.add(right.clone().multiplyScalar(moveSpeed));
    }

    MainCanvas.flyControls.update(deltaTime);
  }
}
