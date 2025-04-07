import * as THREE from 'three';
import MainCanvas from '../setup/MainCanvas.js';
import DecorationMesh from './DecorationMesh.js';

export default class Foliage {
  public position: THREE.Vector3;

  private mesh: THREE.Group | THREE.Mesh;

  public constructor(type: string, position: THREE.Vector3, bushAmount=0) {
    this.position = position
    console.log(type)
    switch (type) {
      case 'tree':
        this.mesh = DecorationMesh.tree.clone();
        this.mesh.position.set(this.position.x, position.y + 1.5, position.z)
        break;
        case 'bush':
          this.mesh = DecorationMesh.bush;
          this.mesh.position.set(this.position.x, position.y + 0.5, position.z)
        break;
        case 'bushgroup':
          this.mesh = DecorationMesh.createBushGroup(3)
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