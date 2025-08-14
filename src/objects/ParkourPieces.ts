import * as THREE from 'three';

export default class ParkourPieces {
  public static material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(216, 216, 216)'});

  public static wallMaterial: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, transparent: true, opacity: 0.7})

  public static activeMaterial1: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({ color: 0xaaffaa});

  public static activeMaterial2: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaff});

  public static checkPointInactive: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true, opacity: 0.2 });

  public static checkPointActive: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, transparent: true, opacity: 0.15 });

  public static normal1: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 4), this.material);

  public static normal2: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(8, 1, 8), this.material)

  public static long1: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 12), this.material);

  public static long2: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 20), this.material);

  public static long3: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 20), this.material);

  public static platform: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(28, 1, 20), this.material);

  public static startingPlatform: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(28, 1, 20), this.material);

  public static checkPoint: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(28, 12, 1), this.checkPointInactive);

  public static levelBorder: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(150, 100, 2), this.wallMaterial)

  public static meshes: THREE.Mesh[] = [this.normal1, this.long1, this.long2, this.platform, this.checkPoint];
}