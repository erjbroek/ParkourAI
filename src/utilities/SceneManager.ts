import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Scene from '../scenes/Scene.js';

export default class SceneManager {
  public static scene: THREE.Scene = new THREE.Scene();

  public static camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  public static renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });
  
  public static orbitControls: OrbitControls;

  public constructor() {
    SceneManager.scene.background = new THREE.Color(0xaaddff);
    SceneManager.camera.position.set(11, 17, 25);
    SceneManager.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(SceneManager.renderer.domElement);
    SceneManager.orbitControls = new OrbitControls(SceneManager.camera, SceneManager.renderer.domElement);
    SceneManager.orbitControls.minPolarAngle = 0;
		SceneManager.orbitControls.maxPolarAngle =  Math.PI * 0.5;
  }
}