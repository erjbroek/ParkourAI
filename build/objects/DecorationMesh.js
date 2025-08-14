var _a;
import * as THREE from 'three';
class DecorationMesh {
    static createBushGroup(amount, xSpread, ySpread) {
        const group = new THREE.Group();
        for (let i = 0; i < amount; i++) {
            const width = Math.random() * 6 + 2;
            const height = Math.random() * 2 + 3;
            const depth = Math.random() * 6 + 2;
            const bushGeometry = new THREE.BoxGeometry(width, height, depth);
            const bushMaterial = _a.material.clone();
            bushMaterial.color = new THREE.Color(Math.random() * 0.1, Math.random() * 0.1 + 0.4, Math.random() * 0.05);
            const bush = new THREE.Mesh(bushGeometry, bushMaterial);
            bush.position.set(Math.random() * xSpread - 3, height / 2, Math.random() * ySpread - 3);
            group.add(bush);
        }
        return group;
    }
    static water(position, dimensions) {
        const waterMaterial = _a.material.clone();
        const waterGeometry = new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z);
        waterMaterial.color = new THREE.Color(0, 0.4, 3);
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.set(position.x, position.y, position.z);
        return water;
    }
}
_a = DecorationMesh;
DecorationMesh.material = new THREE.MeshPhongMaterial();
DecorationMesh.leavesMesh = new THREE.Mesh(new THREE.BoxGeometry(4, 8, 4), new THREE.MeshPhongMaterial({ color: 0x228B22 }));
DecorationMesh.woodMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 6, 1), new THREE.MeshPhongMaterial({ color: 0x8B4513 }));
DecorationMesh.tree = (() => {
    const group = new THREE.Group();
    const leaves = _a.leavesMesh.clone();
    const wood = _a.woodMesh.clone();
    leaves.position.y = 7;
    group.add(leaves);
    group.add(wood);
    return group;
})();
DecorationMesh.bush = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 6), Object.assign(_a.material.clone(), { color: new THREE.Color(Math.random() * 0.1, Math.random() * 0.1 + 0.4, Math.random() * 0.05) }));
DecorationMesh.bushGroup = (() => {
    const group = new THREE.Group();
    return group;
})();
export default DecorationMesh;
