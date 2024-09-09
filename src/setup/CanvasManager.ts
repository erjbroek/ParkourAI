import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Scene from '../scenes/Scene.js';

export default class CanvasManager {
  public static scene: THREE.Scene = new THREE.Scene();

  public static camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  public static renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });
  
  public static orbitControls: OrbitControls;

  public constructor() {
    // CanvasManager.scene.background = new THREE.Color(0xffffff);
    CanvasManager.scene.background = new THREE.Color(0xaaddff);
    CanvasManager.camera.position.set(11, 17, 25);
    CanvasManager.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(CanvasManager.renderer.domElement);
    CanvasManager.orbitControls = new OrbitControls(CanvasManager.camera, CanvasManager.renderer.domElement);
    CanvasManager.orbitControls.minPolarAngle = 0;
		CanvasManager.orbitControls.maxPolarAngle =  Math.PI * 0.5;
  }
}