import * as THREE from 'three';
import { RenderObject } from './RenderObject.js';
import DecorationMesh from './DecorationMesh.js';
import MainCanvas from '../setup/MainCanvas.js';


export default class Water extends RenderObject {
  public position: THREE.Vector3;

  public mesh: THREE.Mesh;

  private dimensions: THREE.Vector3;

  public constructor(position: THREE.Vector3, dimensions: THREE.Vector3) {
    super()
    this.position = position;
    this.dimensions = dimensions;
    this.mesh = DecorationMesh.water(this.position, this.dimensions)
  }

  render(position: THREE.Vector3): void {
    this.mesh.position.add(position);
    MainCanvas.scene.add(this.mesh);
  }
}