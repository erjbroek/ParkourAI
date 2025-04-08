import * as THREE from 'three';
import MainCanvas from '../setup/MainCanvas.js';
import DecorationMesh from './DecorationMesh.js';
import { RenderObject } from './RenderObject.js';

export default class Foliage extends RenderObject {
  public position: THREE.Vector3;

  public mesh: THREE.Group | THREE.Mesh;

  public constructor(type: string, position: THREE.Vector3, bushAmount=0, xSpread=6, zSpread=6) {
    super()
    this.position = position
    switch (type) {
      case 'tree':
        this.mesh = DecorationMesh.tree.clone();
        this.mesh.position.set(this.position.x, position.y + 3.5, position.z)
        break;
        case 'bush':
          this.mesh = DecorationMesh.bush;
          this.mesh.position.set(this.position.x, position.y + 2.5, position.z)
        break;
        case 'bushgroup':
          this.mesh = DecorationMesh.createBushGroup(bushAmount, xSpread, zSpread)
          this.mesh.position.set(this.position.x, position.y - 1.5, position.z)
        break;
        default:
          throw new Error(`Unknown type: ${type}`);
        }
  }

  public render(position: THREE.Vector3) {
    this.mesh.position.add(position);
    MainCanvas.scene.add(this.mesh);
  }
}