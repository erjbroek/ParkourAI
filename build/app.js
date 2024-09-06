import * as THREE from 'three';
export default class GameSetup {
    scene;
    camera;
    renderer;
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.initRenderer();
        this.initCamera();
        this.initScene();
        this.startRendering();
    }
    initRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }
    initCamera() {
        this.camera.position.z = 5;
    }
    initScene() {
    }
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    startRendering() {
        this.renderer.setAnimationLoop(() => {
            this.render();
        });
    }
    render() {
        this.renderer.render(this.scene, this.camera);
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);
    }
}
//# sourceMappingURL=app.js.map