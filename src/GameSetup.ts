import * as THREE from 'three';
import Scene from './Scene.js';
import Game from './Game.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class GameSetup {
    public static scene: THREE.Scene;

    public static camera: THREE.PerspectiveCamera;

    public static renderer: THREE.WebGLRenderer;

    public static orbitControls: OrbitControls;

    public activeScene: Scene;

    public clock: THREE.Clock = new THREE.Clock(true);

    public constructor() {
        // initializig scene
        GameSetup.scene = new THREE.Scene();
        GameSetup.scene.background = new THREE.Color(0xb2b2f3);

        // setting up camera
        GameSetup.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        GameSetup.camera.position.set(13, 2.5, -8)

        // creating renderer
        GameSetup.renderer = new THREE.WebGLRenderer({ antialias: true });
        GameSetup.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(GameSetup.renderer.domElement);

        GameSetup.orbitControls = new OrbitControls(GameSetup.camera, GameSetup.renderer.domElement);

        window.addEventListener('resize', () => this.onWindowResize(), false);

        const axisHelper = new THREE.AxesHelper(5);
        axisHelper.position.set(0, 1, 0);
        const gridHelper = new THREE.GridHelper(100, 100);
        GameSetup.scene.add(axisHelper);
        GameSetup.scene.add(gridHelper);
        this.setupLight();
        this.startRendering();
        this.activeScene = new Game();
    }


    /*
    * Automatically adjusts scene size/aspect if window is resized
    */
    public onWindowResize() {
        GameSetup.camera.aspect = window.innerWidth / window.innerHeight;
        GameSetup.camera.updateProjectionMatrix();
        GameSetup.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    public setupLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        GameSetup.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, Math.PI);
        directionalLight.position.set(10, 30, -100).normalize();
        GameSetup.scene.add(directionalLight);
    }

    /*
    * Starts game loop 
    * - proccesses input of active scene
    * - updates active scene
    * - renders active scene
    */
    public startRendering() {
        GameSetup.renderer.setAnimationLoop(() => {
            this.activeScene.processInput();
            this.activeScene.update(this.clock.getDelta());
            this.activeScene.render();
        });
    }
}
