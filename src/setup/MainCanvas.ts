import * as THREE from 'three';
import Scene from '../scenes/Scene.js';
import Game from '../scenes/Game.js';
import CanvasManager from './CanvasManager.js';
import GUI from '../utilities/GUI.js';
import MouseHandler from '../utilities/MouseHandler.js';
import UICollision from '../utilities/UICollision.js';

export default class MainCanvas {
    public activeScene: Scene;

    public clock: THREE.Clock = new THREE.Clock(true);

    public gravityConstant = 9.81;

    public static canvas: HTMLCanvasElement;

    public constructor() {
        new CanvasManager()
        new MouseHandler();
        new UICollision();

        window.addEventListener('resize', () => this.onWindowResize(), false);

        // canvas used to render ui 
        const canvas = document.getElementById('uiCanvas') as HTMLCanvasElement;
        GUI.setCanvas(canvas);
        MainCanvas.canvas = GUI.getCanvas();

        this.setupLight();
        this.startRendering();
        this.activeScene = new Game();
    }


    /*
    * Automatically adjusts scene size/aspect if window is resized
    */
    public onWindowResize() {
        CanvasManager.camera.aspect = window.innerWidth / window.innerHeight;
        CanvasManager.camera.updateProjectionMatrix();
        CanvasManager.renderer.setSize(window.innerWidth, window.innerHeight);
        MainCanvas.canvas.width = window.innerWidth;
        MainCanvas.canvas.height = window.innerHeight;
    }

    public setupLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        CanvasManager.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, Math.PI);
        directionalLight.position.set(101, 50, -30).normalize();
        CanvasManager.scene.add(directionalLight);
    }

    /*
    * Starts game loop 
    * - proccesses input of active scene
    * - updates active scene
    * - renders active scene
    */
    public startRendering() {
        CanvasManager.renderer.setAnimationLoop(() => {
            this.activeScene.processInput();
            this.activeScene.update(this.clock.getDelta());

            const ctx: CanvasRenderingContext2D = GUI.getCanvasContext(GUI.getCanvas());
            ctx.clearRect(0, 0, GUI.canvas.width, GUI.canvas.height);
            this.activeScene.render();
        });
    }
}
