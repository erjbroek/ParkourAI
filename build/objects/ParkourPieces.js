var _a;
import * as THREE from 'three';
class ParkourPieces {
}
_a = ParkourPieces;
ParkourPieces.material = new THREE.MeshPhongMaterial({ color: 'rgb(216, 216, 216)' });
ParkourPieces.wallMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
ParkourPieces.activeMaterial1 = new THREE.MeshPhongMaterial({ color: 0xaaffaa });
ParkourPieces.activeMaterial2 = new THREE.MeshPhongMaterial({ color: 0xaaaaff });
ParkourPieces.checkPointInactive = new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true, opacity: 0.2 });
ParkourPieces.checkPointActive = new THREE.MeshPhongMaterial({ color: 0x00ff00, transparent: true, opacity: 0.15 });
ParkourPieces.normal1 = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 4), _a.material);
ParkourPieces.normal2 = new THREE.Mesh(new THREE.BoxGeometry(8, 1, 8), _a.material);
ParkourPieces.long1 = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 12), _a.material);
ParkourPieces.long2 = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 20), _a.material);
ParkourPieces.long3 = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 20), _a.material);
ParkourPieces.platform = new THREE.Mesh(new THREE.BoxGeometry(28, 1, 20), _a.material);
ParkourPieces.startingPlatform = new THREE.Mesh(new THREE.BoxGeometry(28, 1, 20), _a.material);
ParkourPieces.checkPoint = new THREE.Mesh(new THREE.BoxGeometry(28, 12, 1), _a.checkPointInactive);
ParkourPieces.levelBorder = new THREE.Mesh(new THREE.BoxGeometry(150, 100, 2), _a.wallMaterial);
ParkourPieces.meshes = [_a.normal1, _a.long1, _a.long2, _a.platform, _a.checkPoint];
export default ParkourPieces;
