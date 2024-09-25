var _a;
import * as THREE from 'three';
class ParkourPieces {
}
_a = ParkourPieces;
ParkourPieces.material = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true });
ParkourPieces.checkPointInactive = new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true, opacity: 0.2 });
ParkourPieces.checkPointActive = new THREE.MeshPhongMaterial({ color: 0x00ff00, transparent: true, opacity: 0.15 });
ParkourPieces.normal = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 4), _a.material);
ParkourPieces.long1 = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 12), _a.material);
ParkourPieces.long2 = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 20), _a.material);
ParkourPieces.platform = new THREE.Mesh(new THREE.BoxGeometry(28, 1, 20), _a.material);
ParkourPieces.checkPoint = new THREE.Mesh(new THREE.BoxGeometry(28, 12, 1), _a.checkPointInactive);
ParkourPieces.meshes = [_a.normal, _a.long1, _a.long2, _a.platform, _a.checkPoint];
export default ParkourPieces;
