import * as THREE from 'three';

export default class ParkourPieces {
  public static material: THREE.MeshLambertMaterial = new THREE.MeshLambertMaterial({ color: 0xccffcc, transparent: true});

  public static normal: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 4), this.material);

  public static long1: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 12), this.material);

  public static long2: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 20), this.material);

  public static platform: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(28, 1, 20), this.material);

  public static checkPoint: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(32, 1, 8), this.material);

  public static meshes: THREE.Mesh[] = [this.normal, this.long1, this.long2, this.platform, this.checkPoint];
}