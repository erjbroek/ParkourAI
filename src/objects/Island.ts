import * as THREE from 'three';
import MainCanvas from '../setup/MainCanvas.js';


export default class Island {
  private position: {x: number; y: number; z: number};

  private islandDimensions: {x: number; y: number; z: number};

  private grassMaterial: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({ color: 0x32CD32 });

  public grassMesh: THREE.Mesh;

  private groundMaterial: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });

  public groundMesh: THREE.Mesh;

  public constructor(position: THREE.Vector3, dimensions: THREE.Vector3) {
    this.position = position;
    this.islandDimensions = dimensions;

    this.grassMesh = new THREE.Mesh(new THREE.BoxGeometry(dimensions.x + 4, 3, dimensions.z + 4), this.grassMaterial)
    this.grassMesh.position.set(position.x, position.y, position.z)

    this.groundMesh = new THREE.Mesh(new THREE.BoxGeometry(dimensions.x, position.y + 30, dimensions.z), this.groundMaterial)
    this.groundMesh.position.set(position.x, (position.y - 30) / 2, position.z)
  }

  public render(position: THREE.Vector3) {
    this.grassMesh.position.add(position);
    this.groundMesh.position.add(position);

    MainCanvas.scene.add(this.grassMesh);
    MainCanvas.scene.add(this.groundMesh);
  }
}