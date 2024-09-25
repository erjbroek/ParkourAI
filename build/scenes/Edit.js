import MainCanvas from "../setup/MainCanvas.js";
import Parkour from "../objects/Parkour.js";
import GUI from "../utilities/GUI.js";
import MouseListener from "../utilities/MouseListener.js";
import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import Obstacle from "../objects/Obstacle.js";
import ParkourPieces from "../objects/ParkourPieces.js";
import KeyListener from '../utilities/KeyListener.js';
import { InfiniteGridHelper } from "../InfiniteGridHelper.js";
class Edit {
    constructor() {
        this.objectImages = [];
        this.selectedObject = null;
        this.confirmedAdded = false;
        this.height = 0;
        this.activePosition = { x: 0, y: 0, z: 0 };
        this.mesh = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 4), new THREE.MeshLambertMaterial({ color: 0xccffcc, transparent: true }));
        this.objectImages.push(GUI.loadNewImage("./assets/normalBlock.png"));
        this.objectImages.push(GUI.loadNewImage("./assets/longBlock.png"));
        this.objectImages.push(GUI.loadNewImage("./assets/bridgeBlock.png"));
        this.objectImages.push(GUI.loadNewImage("./assets/platformBlock.png"));
        Edit.gridHelper.position.set(18, 0.6, 18);
        MainCanvas.scene.add(Edit.gridHelper);
        Edit.gridHelper.visible = false;
        this.setupTransformControls();
    }
    processInput() {
        if (MouseListener.mouseDown) {
            for (let i = 0; i < 4; i++) {
                if (MouseListener.x2 >= window.innerWidth * 0.02 + window.innerWidth * 0.1 * i && MouseListener.x2 <= window.innerWidth * 0.02 + window.innerWidth * 0.1 * i + window.innerWidth * 0.09 && MouseListener.y2 >= window.innerHeight * 0.8 && MouseListener.y2 <= window.innerHeight * 0.8 + window.innerHeight * 0.16) {
                    if (!this.confirmedAdded) {
                        this.removeObstacle();
                    }
                    this.confirmedAdded = false;
                    this.mesh.material.opacity = 0.5;
                    this.createObstacle(ParkourPieces.meshes[i].clone());
                }
            }
        }
        this.confirmedAdded = false;
        if (KeyListener.keyPressed("KeyE")) {
            this.confirmedAdded = true;
            this.mesh.material.opacity = 1;
            this.createObstacle(this.mesh.clone());
        }
        if (KeyListener.keyPressed("KeyQ")) {
            this.transformControls.setMode("translate");
        }
        if (KeyListener.keyPressed("KeyR")) {
            this.transformControls.setMode("rotate");
        }
    }
    removeObstacle() {
        this.transformControls.detach();
        if (this.mesh && MainCanvas.scene.children.includes(this.mesh)) {
            MainCanvas.scene.remove(this.mesh);
        }
    }
    createObstacle(mesh) {
        this.mesh = mesh;
        this.mesh.material = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
        if (!MainCanvas.scene.children.includes(this.mesh)) {
            MainCanvas.scene.add(this.mesh);
            this.transformControls.attach(mesh);
        }
        Parkour.addedParkour[0].push(new Obstacle(this.mesh, { posX: this.mesh.position.x, posY: this.mesh.position.y, posZ: this.mesh.position.z }));
    }
    update(deltaTime) {
    }
    render(canvas) {
        GUI.fillRectangle(canvas, canvas.width * 0.85, canvas.height * 0.72, canvas.width * 0.15, canvas.height * 0.06, 0, 0, 0, 0.5);
        GUI.fillRectangle(canvas, 0, canvas.height * 0.78, canvas.width, canvas.height * 0.24, 0, 0, 0, 0.5, 5);
        GUI.fillRectangle(canvas, 0, canvas.height * 0.98, canvas.width, canvas.height * 0.02, 0, 0, 0, 0.8);
        GUI.writeText(canvas, `height: ${this.height}`, canvas.width * 0.5, canvas.height * 0.05, "center", "system-ui", 30, "black", 100);
        GUI.writeText(canvas, `Position mesh: ${this.activePosition.x}, ${this.activePosition.y}, ${this.activePosition.z}`, canvas.width * 0.5, canvas.height * 0.08, "center", "system-ui", 30, "black", 100);
        for (let i = 0; i < 4; i++) {
            GUI.fillRectangle(canvas, canvas.width * 0.02 + canvas.width * 0.1 * i, canvas.height * 0.8, canvas.width * 0.09, canvas.height * 0.16, 255, 255, 255, 1, 15);
            GUI.drawImage(canvas, this.objectImages[i], canvas.width * 0.04 + canvas.width * 0.1 * i, canvas.height * 0.81, canvas.width * 0.05, canvas.height * 0.15);
        }
    }
    setupTransformControls() {
        this.transformControls = new TransformControls(MainCanvas.camera, MainCanvas.renderer.domElement);
        this.transformControls.setMode("translate");
        this.transformControls.setRotationSnap(THREE.MathUtils.degToRad(90));
        MainCanvas.scene.add(this.transformControls);
        this.transformControls.addEventListener("mouseDown", () => {
            MainCanvas.orbitControls.enabled = false;
        });
        this.transformControls.addEventListener("mouseUp", () => {
            MainCanvas.orbitControls.enabled = true;
        });
        this.transformControls.addEventListener("objectChange", () => {
            const position = this.mesh.position;
            const snapX = 4;
            const snapY = 1;
            const snapZ = 4;
            position.x = Math.round(position.x / snapX) * 4;
            position.y = Math.round(position.y / snapY) * 1;
            position.z = Math.round(position.z / snapZ) * 4;
            this.height = position.y;
            this.mesh.position.set(position.x, position.y, position.z);
            this.activePosition = { x: position.x, y: position.y, z: position.z };
        });
    }
}
Edit.gridHelper = new InfiniteGridHelper(4, 48, 'grey', 8000, 'xzy');
export default Edit;
