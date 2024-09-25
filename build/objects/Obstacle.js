import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import MainCanvas from '../setup/MainCanvas.js';
import ParkourPieces from './ParkourPieces.js';
const PLAYER_GROUP = 1 << 0;
const OBSTACLE_GROUP = 1 << 1;
class Obstacle {
    constructor(mesh, options = {}) {
        this.isCheckpoint = false;
        const { posX = 0, posY = 0, posZ = 0, rotationX = 0, rotationY = 0, rotationZ = 0, moving = false, movingSpeed = 0, movingLength = 0, movingDirection = 0 } = options;
        this.mesh = mesh;
        this.mesh.position.set(posX, posY, posZ);
        this.mesh.rotation.set(rotationX, rotationY, rotationZ);
        this.mesh.receiveShadow = true;
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
        const size = this.boundingBox.getSize(new THREE.Vector3());
        this.platformBody = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)),
            position: new CANNON.Vec3(posX, posY, posZ),
            material: Obstacle.material,
            collisionFilterGroup: OBSTACLE_GROUP,
            collisionFilterMask: PLAYER_GROUP,
        });
        this.mesh.addEventListener('change', () => {
            this.platformBody.position.copy(new CANNON.Vec3(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z));
            this.platformBody.quaternion.copy(new CANNON.Quaternion(this.mesh.quaternion.x, this.mesh.quaternion.y, this.mesh.quaternion.z, this.mesh.quaternion.w));
        });
        if (mesh.geometry !== ParkourPieces.checkPoint.geometry) {
            MainCanvas.world.addBody(this.platformBody);
        }
        else {
            this.isCheckpoint = true;
        }
    }
    moveObstacle(deltaTime) {
    }
}
Obstacle.material = new CANNON.Material();
export default Obstacle;
