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
import KeyListener from '../utilities/KeyListener.js';

export default class Edit {
  private objectImages: HTMLImageElement[] = [];

  public transformControls: TransformControls;

  public selectedObject: Obstacle | null = null;

  public confirmedAdded: boolean = false;

  public opacity: number = 0.5;

  public mesh: THREE.Mesh = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1, 4),
    new THREE.MeshLambertMaterial({ color: 0xccffcc, transparent: true }) 
  );

  public obstacleBody: CANNON.Body;
  public obstacleMaterial: CANNON.Material;

  public constructor() {
    this.objectImages.push(GUI.loadNewImage("./assets/normalBlock.png"));
    this.objectImages.push(GUI.loadNewImage("./assets/longBlock.png"));
    this.objectImages.push(GUI.loadNewImage("./assets/bridgeBlock.png"));
    this.objectImages.push(GUI.loadNewImage("./assets/platformBlock.png"));
    
    this.setupTransformControls()
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
          if (!this.confirmedAdded) {
            this.removeObstacle()
          }
          this.confirmedAdded = false;
          (this.mesh.material as THREE.Material).opacity = 0.5;
          this.createObstacle(ParkourPieces.meshes[i].clone());
        }
      }
    }

    // "adds" the mesh to the scene
    // technically, it doesnt add it, it just doesn't remove it
    this.confirmedAdded = false;
    if (KeyListener.keyPressed("KeyE")) {
      this.confirmedAdded = true;
      this.transformControls.detach();
      (this.mesh.material as THREE.Material).opacity = 1;
      this.createObstacle(this.mesh.clone());
    }
  }

  /**
   * Removes the obstacle from the scene and physics world
   */
  public removeObstacle() {
    this.transformControls.detach();

    if (this.mesh && MainCanvas.scene.children.includes(this.mesh)) {
      MainCanvas.scene.remove(this.mesh);
    }
    if (this.obstacleBody && MainCanvas.world.bodies.includes(this.obstacleBody)) {
      MainCanvas.world.removeBody(this.obstacleBody);
    }
  }

  /**
   * Creates mesh and belonging physics body to edit
   * next, the transform controls are attached to the mesh so it can be moved
   * 
   * @param mesh - the mesh of the obstacle
   */
  public createObstacle(mesh: THREE.Mesh): void {
    // updates mesh and updates material with 50% transparent alternative
    this.mesh = mesh;
    this.mesh.material = new THREE.MeshLambertMaterial({ color: 0xccffcc, transparent: true, opacity: 0.5 });
    if (!MainCanvas.scene.children.includes(this.mesh)) {
      MainCanvas.scene.add(this.mesh);
    }
    
    // creates physics body for obstacle (used for the physics engine)
    const { x: width, y: height, z: depth } = new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3());
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

    // connect the newly created mesh to the transform controls
    this.transformControls.attach(this.mesh);

    // define what the player should do when it interacts with this newly created mesh
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

  public setupTransformControls() {
    this.transformControls = new TransformControls(
      MainCanvas.camera,
      MainCanvas.renderer.domElement
    );
    this.transformControls.setMode("translate");
    this.transformControls.setRotationSnap(THREE.MathUtils.degToRad(90));

    // this.transformControls.setMode("translate");
    MainCanvas.scene.add(this.transformControls);

    this.transformControls.addEventListener("mouseDown", () => {
      MainCanvas.orbitControls.enabled = false;
    });
    this.transformControls.addEventListener("mouseUp", () => {
      MainCanvas.orbitControls.enabled = true;
    });

    // this changes snapping behaviour of translationControls, so that it's not the same for all axis
    this.transformControls.addEventListener("objectChange", () => {
      this.updateSelectedMesh();
      const position = this.mesh.position;
      
      const snapX = 4;
      const snapY = 0.01;
      const snapZ = 4;

      position.x = Math.round(position.x / snapX) * 4;
      position.y = Math.round(position.y / snapY) * 0.01;
      position.z = Math.round(position.z / snapZ) * 4;

      this.mesh.position.set(position.x, position.y, position.z);

    });
  }
}
