import * as THREE from "three";
import * as CANNON from "cannon-es";
import Game from "../scenes/Game.js";
import GUI from "../utilities/GUI.js";
import MouseListener from "../utilities/MouseListener.js";
import UICollision from "../utilities/UICollision.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import KeyListener from '../utilities/KeyListener.js';
import CreateBackground from './CreateBackground.js';
class MainCanvas {
    ;
    constructor() {
        this.clock = new THREE.Clock(true);
        MainCanvas.scene.background = new THREE.Color(0xaaddff);
        MainCanvas.camera.position.set(5, 11, 36);
        MainCanvas.renderer.setSize(window.innerWidth, window.innerHeight);
        MainCanvas.renderer.shadowMap.enabled = true;
        MainCanvas.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(MainCanvas.renderer.domElement);
        new MouseListener();
        new KeyListener();
        new UICollision();
        window.addEventListener("resize", () => this.onWindowResize(), false);
        const canvas = document.getElementById("uiCanvas");
        GUI.setCanvas(canvas);
        MainCanvas.canvas = GUI.getCanvas();
        MainCanvas.orbitControls = new OrbitControls(MainCanvas.camera, MainCanvas.renderer.domElement);
        this.setupLight();
        CreateBackground.addBackgroundSphere();
        this.startRendering();
        this.activeScene = new Game();
    }
    onWindowResize() {
        MainCanvas.camera.aspect = window.innerWidth / window.innerHeight;
        MainCanvas.camera.updateProjectionMatrix();
        MainCanvas.renderer.setSize(window.innerWidth, window.innerHeight);
        MainCanvas.canvas.width = window.innerWidth;
        MainCanvas.canvas.height = window.innerHeight;
    }
    setupLight() {
        const ambientLightTop = new THREE.AmbientLight(0x12a3ff, 0.5);
        MainCanvas.scene.add(ambientLightTop);
        const ambientLightBottom = new THREE.AmbientLight(0xffd700, 0.5);
        MainCanvas.scene.add(ambientLightBottom);
        MainCanvas.directionalLight = new THREE.DirectionalLight(0xeeeeff, Math.PI);
        MainCanvas.directionalLight.position.set(70, 140, -140);
        MainCanvas.directionalLight.castShadow = true;
        MainCanvas.scene.add(MainCanvas.directionalLight);
    }
    startRendering() {
        MainCanvas.renderer.setAnimationLoop(() => {
            const deltaTime = this.clock.getDelta();
            if (deltaTime > 0) {
                MainCanvas.world.step(deltaTime);
            }
            this.activeScene.players.forEach((player) => {
                player.mesh.position.copy(player.playerBody.position);
                player.mesh.quaternion.copy(player.playerBody.quaternion);
                this.activeScene.parkour.checkCollision(player);
            });
            MainCanvas.orbitControls.update();
            this.activeScene.processInput();
            this.activeScene.update(deltaTime);
            const ctx = GUI.getCanvasContext(GUI.getCanvas());
            ctx.clearRect(0, 0, GUI.canvas.width, GUI.canvas.height);
            this.activeScene.render();
        });
    }
}
MainCanvas.scene = new THREE.Scene();
MainCanvas.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
MainCanvas.renderer = new THREE.WebGLRenderer({ antialias: true });
MainCanvas.gravityConstant = -25;
MainCanvas.world = new CANNON.World({ gravity: new CANNON.Vec3(0, MainCanvas.gravityConstant, 0) });
MainCanvas.directionalLight = new THREE.DirectionalLight(0xeeeeff, Math.PI);
export default MainCanvas;
