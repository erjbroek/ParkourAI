import * as THREE from 'three';
import Scene from './Scene.js';
import Game from './Game.js';

export default class GameSetup {
  public static scene: THREE.Scene;

  public static camera: THREE.PerspectiveCamera;

  public static renderer: THREE.WebGLRenderer;

  public activeScene: Scene;

  public clock: THREE.Clock = new THREE.Clock(true);
  
    public constructor() {
        GameSetup.scene = new THREE.Scene();
        GameSetup.scene.background = new THREE.Color(0xb2b2f3);

        GameSetup.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        GameSetup.camera.position.z = 5;

        GameSetup.renderer = new THREE.WebGLRenderer({ antialias: true });
        GameSetup.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(GameSetup.renderer.domElement);

        window.addEventListener('resize', () => this.onWindowResize(), false);

        this.setupLight();
        this.activeScene = new Game();
        this.startRendering();
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
        directionalLight.position.set(-100, 100, 100).normalize();
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
            this.activeScene.processInput();;
            this.activeScene.update(this.clock.getDelta());
            this.activeScene.render();
        });
    }
}
