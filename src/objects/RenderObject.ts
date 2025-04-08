import * as THREE from 'three';

export abstract class RenderObject {
  abstract position: THREE.Vector3;
  abstract mesh: THREE.Mesh | THREE.Group;
  abstract render(position: THREE.Vector3): void
}