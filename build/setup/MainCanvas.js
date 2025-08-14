import * as THREE from "three";
import * as CANNON from "cannon-es";
import Game from "../scenes/Game.js";
import GUI from "../utilities/GUI.js";
import MouseListener from "../utilities/MouseListener.js";
import UICollision from "../utilities/UICollision.js";
import KeyListener from '../utilities/KeyListener.js';
import Edit from '../scenes/Edit.js';
import Stats from 'stats.js';
import Parkour from '../objects/Parkour.js';
const stats = new Stats();
stats.showPanel(0);
stats.dom.style.position = 'fixed';
stats.dom.style.bottom = '10px';
stats.dom.style.right = '10px';
stats.dom.style.left = 'auto';
stats.dom.style.top = 'auto';
stats.dom.style.width = '100px';
document.body.appendChild(stats.dom);
class MainCanvas {
    constructor() {
        this.clock = new THREE.Clock(true);
        this.cameraSpeed = new THREE.Vector3(0, 0, 0);
        this.isMouseButtonDown = false;
        this.pauzed = false;
        MainCanvas.scene.background = new THREE.Color(0xaaddff);
        // MainCanvas.camera.position.set(5, 18, 45);
        MainCanvas.renderer.setSize(window.innerWidth, window.innerHeight);
        MainCanvas.renderer.shadowMap.enabled = true;
        MainCanvas.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(MainCanvas.renderer.domElement);
        new MouseListener();
        new KeyListener();
        new UICollision();
        window.addEventListener("resize", () => this.onWindowResize(), false);
        // canvas used to render ui
        const canvas = document.getElementById("uiCanvas");
        GUI.setCanvas(canvas);
        MainCanvas.canvas = GUI.getCanvas();
        window.addEventListener("mousedown", () => this.onMouseDown(), false);
        window.addEventListener("mouseup", () => this.onMouseUp(), false);
        this.setupLight();
        this.startRendering();
        this.activeScene = new Game();
        this.startIntro();
    }
    startIntro() {
        MainCanvas.introActive = true;
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transmission: 1,
            roughness: 0.3,
            thickness: 1,
            transparent: true,
        });
        const introPlane = new THREE.Mesh(geometry, material);
        MainCanvas.camera.position.sub(new THREE.Vector3(0, 20, 0));
        MainCanvas.camera.add(introPlane);
        MainCanvas.camera.rotation.set(-0.4437, -0.6225, -0.25819);
        introPlane.position.set(0, 0, -0.6);
        MainCanvas.scene.add(MainCanvas.camera);
        MainCanvas._introPlane = introPlane;
        Game.neat.switchNetwork();
        Game.neat.usePretrainedNetwork = true;
        Game.neat.initializePopulation();
        console.log(MainCanvas.camera.rotation);
    }
    endIntro() {
        MainCanvas.introActive = false;
        MainCanvas.clickedStartGame = false;
        Game.neat.endGeneration();
        Game.alivePlayers.forEach((player) => {
            player.killPlayer();
        });
        const introPlane = MainCanvas._introPlane;
        if (introPlane) {
            MainCanvas.camera.remove(introPlane);
            MainCanvas._introPlane = undefined;
        }
        // Parkour.activeLevel = 10
        Game.neat.usePretrainedNetwork = false;
        Game.neat.setTrainedNetwork();
        if (!Game.neat.usePretrainedNetwork) {
            Game.neat.resetGeneration();
        }
        Game.neat.initializePopulation();
        if (this.updateCamera) {
            const activeLevel = Parkour.levels[Parkour.activeLevel];
            MainCanvas.camera.position.set(activeLevel.location.x - 60, activeLevel.location.y + 50, activeLevel.location.z);
            MainCanvas.camera.position.add(new THREE.Vector3(activeLevel.addedCameraPosition.x, activeLevel.addedCameraPosition.y, activeLevel.addedCameraPosition.z));
            MainCanvas.camera.rotation.set(activeLevel.cameraRotation.x, activeLevel.cameraRotation.y, activeLevel.cameraRotation.z);
            const euler = new THREE.Euler().setFromQuaternion(MainCanvas.camera.quaternion, 'YXZ');
            MainCanvas.yaw = euler.y;
            MainCanvas.pitch = euler.x;
        }
    }
    /*
     * Automatically adjusts scene size/aspect if window is resized
     */
    onWindowResize() {
        MainCanvas.camera.aspect = window.innerWidth / window.innerHeight;
        MainCanvas.camera.updateProjectionMatrix();
        MainCanvas.renderer.setSize(window.innerWidth, window.innerHeight);
        MainCanvas.canvas.width = window.innerWidth;
        MainCanvas.canvas.height = window.innerHeight;
    }
    // sets up initial lights
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
    /*
     * Starts game loop
     * - processes input of active scene
     * - updates active scene
     * - renders active scene
     */
    startRendering() {
        MainCanvas.renderer.setAnimationLoop(() => {
            // MainCanvas.composer.render();
            stats.begin();
            if (MainCanvas.clickedStartGame) {
                this.endIntro();
            }
            // console.log(`Position: ${MainCanvas.camera.position.x}, ${MainCanvas.camera.position.y}, ${MainCanvas.camera.position.z}`)
            // console.log(`Rotation: ${MainCanvas.camera.rotation.x}, ${MainCanvas.camera.rotation.y}, ${MainCanvas.camera.rotation.z}`)
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
                this.activeScene.processInput(deltaTime);
                this.activeScene.update(deltaTime);
            }
            if (!MainCanvas.introActive) {
                this.updateCamera(deltaTime);
            }
            // Render the GUI and the active scene
            const ctx = GUI.getCanvasContext(GUI.getCanvas());
            ctx.clearRect(0, 0, GUI.canvas.width, GUI.canvas.height);
            this.activeScene.render();
            stats.end();
        });
    }
    onMouseDown() {
        this.isMouseButtonDown = true;
    }
    onMouseUp() {
        this.isMouseButtonDown = false;
    }
    static switchCameraMode(FreecamOn, player = undefined, direction) {
        this.isFreeCam = FreecamOn;
        const correctionOffset = THREE.MathUtils.degToRad(30);
        if (!this.isFreeCam) {
            MainCanvas.targetCameraPlayer = player;
            if (direction === "left") {
                this.yaw = Math.PI / 2;
            }
            else if (direction === "right") {
                this.yaw = -Math.PI / 2;
            }
            else if (direction === "backward") {
                this.yaw = Math.PI;
            }
            else {
                this.yaw = 0;
            }
            this.yaw += 0.01;
        }
    }
    updateCamera(deltaTime) {
        this.rotateCamera(deltaTime);
        if (MainCanvas.isFreeCam) {
            if (!Edit.editActive) {
                this.rotateCamera(deltaTime);
            }
            this.moveCamera(deltaTime);
        }
        else {
            this.followPlayerCamera(deltaTime);
        }
    }
    followPlayerCamera(deltaTime) {
        if (!MainCanvas.targetCameraPlayer)
            return;
        const distance = 10;
        const heightOffset = 1.5;
        const playerPos = MainCanvas.targetCameraPlayer.playerBody.position;
        // Use spherical coordinates to position camera based on yaw and pitch
        const spherical = new THREE.Spherical(distance, Math.PI / 2 + MainCanvas.pitch, MainCanvas.yaw);
        const cameraOffset = new THREE.Vector3().setFromSpherical(spherical);
        MainCanvas.camera.position.set(playerPos.x + cameraOffset.x, playerPos.y + cameraOffset.y + heightOffset, playerPos.z + cameraOffset.z);
        MainCanvas.camera.lookAt(new THREE.Vector3(playerPos.x, playerPos.y + heightOffset, playerPos.z));
    }
    rotateCamera(deltaTime) {
        const mouseSensitivity = 0.004;
        if (this.isMouseButtonDown) {
            if (MainCanvas.rotate) {
                const mouseMovementX = MouseListener.mouseDelta.x;
                const mouseMovementY = MouseListener.mouseDelta.y;
                MainCanvas.yaw -= mouseMovementX * mouseSensitivity;
                MainCanvas.pitch -= mouseMovementY * mouseSensitivity;
                const pitchLimit = Math.PI / 2 - 0.1;
                MainCanvas.pitch = Math.max(-pitchLimit, Math.min(pitchLimit, MainCanvas.pitch));
                MainCanvas.camera.quaternion.setFromEuler(new THREE.Euler(MainCanvas.pitch, MainCanvas.yaw, 0, 'YXZ'));
                MouseListener.mouseDelta.x = 0;
                MouseListener.mouseDelta.y = 0;
            }
        }
        // also allows camera rotation with arrow keys
        MainCanvas.yaw += 0.009 * (KeyListener.isKeyDown('ArrowLeft') ? 1 : 0);
        MainCanvas.yaw -= 0.009 * (KeyListener.isKeyDown('ArrowRight') ? 1 : 0);
        MainCanvas.pitch += 0.009 * (KeyListener.isKeyDown('ArrowUp') ? 1 : 0);
        MainCanvas.pitch -= 0.009 * (KeyListener.isKeyDown('ArrowDown') ? 1 : 0);
        MainCanvas.camera.quaternion.setFromEuler(new THREE.Euler(MainCanvas.pitch, MainCanvas.yaw, 0, 'YXZ'));
    }
    moveCamera(deltaTime) {
        // Handle vertical camera movement
        if (KeyListener.isKeyDown('Space')) {
            MainCanvas.camera.position.y += 0.5;
        }
        if (KeyListener.isKeyDown('ShiftLeft') || KeyListener.isKeyDown('ShiftRight')) {
            MainCanvas.camera.position.y -= 0.5;
        }
        this.cameraSpeed.x *= (this.cameraSpeed.x > 0) ? 0.97 : 1;
        this.cameraSpeed.y *= (this.cameraSpeed.y > 0) ? 0.97 : 1;
        this.cameraSpeed.z *= (this.cameraSpeed.z > 0) ? 0.97 : 1;
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        forward.set(Math.sin(MainCanvas.yaw), 0, Math.cos(MainCanvas.yaw)).normalize();
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
    }
}
MainCanvas.scene = new THREE.Scene();
MainCanvas.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
MainCanvas.renderer = new THREE.WebGLRenderer({ antialias: true });
MainCanvas.gravityConstant = -25;
MainCanvas.world = new CANNON.World({ gravity: new CANNON.Vec3(0, MainCanvas.gravityConstant, 0) });
MainCanvas.directionalLight = new THREE.DirectionalLight(0xeeeeff, Math.PI);
MainCanvas.yaw = 0;
MainCanvas.pitch = -0.1;
MainCanvas.rotate = true;
MainCanvas.isFreeCam = true;
MainCanvas.introActive = false;
MainCanvas.clickedStartGame = false;
export default MainCanvas;
