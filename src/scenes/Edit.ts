import MainCanvas from "../setup/MainCanvas.js";
import Parkour from "../objects/Parkour.js";
import GUI from "../utilities/GUI.js";
import MouseListener from "../utilities/MouseListener.js";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import Obstacle from "../objects/Obstacle.js";
import ParkourPieces from "../objects/ParkourPieces.js";
import Player from "../objects/Player.js";

export default class Edit {
  private objectImages: HTMLImageElement[] = [];

  public transformControls: TransformControls;

  public selectedObject: Obstacle | null = null;

  public mesh: THREE.Mesh = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1, 4),
    new THREE.MeshLambertMaterial({ color: 0xccffcc })
  );

  public obstacleBody: CANNON.Body;
  public obstacleMaterial: CANNON.Material;

  public constructor() {
    this.objectImages.push(GUI.loadNewImage("./assets/normalBlock.png"));
    this.objectImages.push(GUI.loadNewImage("./assets/longBlock.png"));
    this.objectImages.push(GUI.loadNewImage("./assets/bridgeBlock.png"));
    this.objectImages.push(GUI.loadNewImage("./assets/platformBlock.png"));

    this.transformControls = new TransformControls(
      MainCanvas.camera,
      MainCanvas.renderer.domElement
    );

    this.transformControls.setMode("translate");
    MainCanvas.scene.add(this.transformControls);

    this.transformControls.addEventListener("mouseDown", () => {
      MainCanvas.orbitControls.enabled = false;
    });
    this.transformControls.addEventListener("mouseUp", () => {
      MainCanvas.orbitControls.enabled = true;
    });
    this.transformControls.addEventListener("objectChange", () => {
      this.updateSelectedMesh();
    });
  }

  /**
   * processes player input
   * 
   * In the case of the editor, this is choosing what mesh/obstacle to add
   */
  public processInput() {
    if (MouseListener.mouseDown) {
      for (let i = 0; i < 4; i++) {
        // if mouse collides with selected object
        if (MouseListener.x2 >= window.innerWidth * 0.02 + window.innerWidth * 0.1 * i && MouseListener.x2 <= window.innerWidth * 0.02 + window.innerWidth * 0.1 * i + window.innerWidth * 0.09 && MouseListener.y2 >= window.innerHeight * 0.8 && MouseListener.y2 <= window.innerHeight * 0.8 + window.innerHeight * 0.16
        ) {
          this.createObstacle(ParkourPieces.meshes[i]);
        }
      }
    }
  }


  /**
   * Creates mesh and belonging physics body to edit
   * next, the transform controls are attached to the mesh so it can be moved
   * 
   * @param mesh - the mesh of the obstacle
   */
  public createObstacle(mesh: THREE.Mesh): void {
    const { x: width, y: height, z: depth } = new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3());

    this.mesh = mesh;

    if (!MainCanvas.scene.children.includes(this.mesh)) {
      MainCanvas.scene.add(this.mesh);
    }

    this.obstacleMaterial = new CANNON.Material("obstacleMaterial");
    this.obstacleBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2)),
      position: new CANNON.Vec3(
        this.mesh.position.x,
        this.mesh.position.y,
        this.mesh.position.z
      ),
      material: this.obstacleMaterial,
    });
    MainCanvas.world.addBody(this.obstacleBody);

    this.transformControls.attach(this.mesh);

    const contactMaterial = new CANNON.ContactMaterial(
      Player.physicsMaterial,
      this.obstacleMaterial,
      {
        friction: 0.0,
        restitution: 0.0,
      }
    );

    MainCanvas.world.addContactMaterial(contactMaterial);
  }

  /**
   * Updates the position of the physics body to match position of mesh
   * this way, the obstacle actually moves when the mesh is moved
   * otherwise, the player would fall through
   */
  public updateSelectedMesh() {
    if (this.obstacleBody) {
      this.obstacleBody.position.set(
        this.mesh.position.x,
        this.mesh.position.y,
        this.mesh.position.z
      );

      this.obstacleBody.quaternion.set(
        this.mesh.quaternion.x,
        this.mesh.quaternion.y,
        this.mesh.quaternion.z,
        this.mesh.quaternion.w
      );
    }
  }

  public update(deltaTime: number) { 
  
  }

  /**
   * Renders the editor ui
   */
  public render(canvas: HTMLCanvasElement) {
    GUI.fillRectangle(canvas, canvas.width * 0.85, canvas.height * 0.72, canvas.width * 0.15, canvas.height * 0.06, 255, 255, 255, 0.5);
    GUI.fillRectangle(canvas, 0, canvas.height * 0.78, canvas.width, canvas.height * 0.24, 255, 255, 255, 0.5, 5);
    GUI.fillRectangle(canvas, 0, canvas.height * 0.98, canvas.width, canvas.height * 0.02, 255, 255, 255, 0.8);

    for (let i = 0; i < 4; i++) {
      GUI.fillRectangle(canvas, canvas.width * 0.02 + canvas.width * 0.1 * i, canvas.height * 0.8, canvas.width * 0.09, canvas.height * 0.16, 255, 255, 255, 1, 15);
      GUI.drawImage(canvas, this.objectImages[i], canvas.width * 0.04 + canvas.width * 0.1 * i, canvas.height * 0.81, canvas.width * 0.05, canvas.height * 0.15);
    }
  }
}
