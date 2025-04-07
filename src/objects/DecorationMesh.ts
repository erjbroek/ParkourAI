import * as THREE from 'three';


export default class DecorationMesh {
  public static material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial()

  private static leavesMesh = new THREE.Mesh(new THREE.BoxGeometry(4, 8, 4),new THREE.MeshPhongMaterial({ color: 0x228B22 }))
  private static woodMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 6, 1), new THREE.MeshPhongMaterial({ color: 0x8B4513 }))
  public static tree: THREE.Group = (() => {
    const group = new THREE.Group();

    const leaves = this.leavesMesh.clone();
    const wood = this.woodMesh.clone();
    leaves.position.y = 7;

    group.add(leaves);
    group.add(wood);

    return group;
  })();

  public static bush = new THREE.Mesh(
    new THREE.BoxGeometry(6, 4, 6),
    Object.assign(DecorationMesh.material.clone(), { color: new THREE.Color(Math.random() * 0.1, Math.random() * 0.1 + 0.4, Math.random() * 0.05) })
  );

  public static bushGroup: THREE.Group = (() => {
    const group = new THREE.Group();

    return group;
  })();

  public static createBushGroup(amount: number): THREE.Group {
    const group = new THREE.Group();
    for (let i = 0; i < amount; i++) {
      const width = Math.random() * 5 + 4;
      const height = Math.random() * 4 + 4;
      const depth = Math.random() * 5 + 4;
  
      const bushGeometry = new THREE.BoxGeometry(width, height, depth);
      const bushMaterial = DecorationMesh.material.clone();
      bushMaterial.color = new THREE.Color(
        Math.random() * 0.1,
        Math.random() * 0.1 + 0.4,
        Math.random() * 0.05
      );
  
      const bush = new THREE.Mesh(bushGeometry, bushMaterial);
  
      bush.position.set(
        Math.random() * 6 - 3,
        height / 2,
        Math.random() * 6 - 3 
      );
  
      group.add(bush);
    }
    return group;
  }
}