import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Obstacle from './Obstacle.js';
import Parkour from './Parkour.js';
import KeyListener from '../utilities/KeyListener.js';
import MainCanvas from '../setup/MainCanvas.js';
// this class is not used yet
// since the normal player class uses a movement system based on the output of the neural network, 
// this class has a movement system thats more user friendly
// might be used in the future for when the user wants to race one of the 
export default class TestPlayer {
    constructor(index) {
        this.x = 0;
        this.y = 5;
        this.z = 20;
        this.velocity = { x: 0, y: 0, z: 0 };
        this.rotation = new THREE.Vector3(0, Math.PI * 1.5, 0);
        this.height = 2.3;
        this.radius = 1;
        this.mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshLambertMaterial({ color: 0x00aaff }));
        this.physicsMaterial = new CANNON.Material();
        this.spawnPoint = new THREE.Vector3(0, 5, 20);
        this.onGround = false;
        this.moving = false;
        this.forward = new THREE.Vector3();
        this.right = new THREE.Vector3();
        this.jumpStatus = false;
        this.jumpBuffer = 0.1;
        this.currentLevel = 0;
        this.playerBody = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
            position: new CANNON.Vec3(this.x, this.y * (index + 1), this.z), // Offset positions based on index
            material: this.physicsMaterial
        });
        const platformPlaterContactMaterial = new CANNON.ContactMaterial(this.physicsMaterial, Obstacle.material, { friction: 0, restitution: 0 });
        // Player.playerBody.linearDamping = 1;
        this.playerBody.angularDamping;
        this.mesh.castShadow = true;
        MainCanvas.world.addBody(this.playerBody);
        MainCanvas.world.addContactMaterial(platformPlaterContactMaterial);
        MainCanvas.scene.add(this.mesh);
        // testing values
        // Player.playerBody.position.set(338, 60, -68);
        // this.spawnPoint.set(116, 15, -296);
        // MainCanvas.camera.position.set(326, 68, -88);
        // Parkour.activeLevel = 9
        this.spawnPoint = Parkour.levels[Parkour.activeLevel].spawnPoint;
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    }
    update(deltaTime) {
        this.boundingBox.setFromObject(this.mesh);
        this.updateMovement(deltaTime);
    }
    updateMovement(deltaTime) {
        // calculatesplayer direction based on camera azimuth
        this.forward = new THREE.Vector3();
        MainCanvas.camera.getWorldDirection(this.forward);
        this.forward.y = 0;
        this.forward.normalize();
        this.right = new THREE.Vector3();
        this.right.crossVectors(this.forward, this.rotation).normalize();
        // Ensure player rotation matches the camera rotation
        const cameraDirection = new THREE.Vector3();
        MainCanvas.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();
        this.rotation.y = Math.atan2(cameraDirection.x, cameraDirection.z) + Math.PI;
        // player movement based on inputs
        const speed = 0.8;
        this.moving = false;
        if (KeyListener.isKeyDown('KeyS')) {
            this.playerBody.velocity.x += -speed * this.forward.x;
            this.playerBody.velocity.z += -speed * this.forward.z;
            this.moving = true;
        }
        if (KeyListener.isKeyDown('KeyW')) {
            this.playerBody.velocity.x += speed * this.forward.x;
            this.playerBody.velocity.z += speed * this.forward.z;
            this.moving = true;
        }
        if (KeyListener.isKeyDown('KeyA')) {
            this.playerBody.velocity.x += -speed * this.right.x;
            this.playerBody.velocity.z += -speed * this.right.z;
            this.moving = true;
        }
        if (KeyListener.isKeyDown('KeyD')) {
            this.playerBody.velocity.x += speed * this.right.x;
            this.playerBody.velocity.z += speed * this.right.z;
            this.moving = true;
        }
        if (KeyListener.isKeyDown('Space')) {
            this.jumpBuffer = 0.1;
            this.jumpStatus = true;
        }
        this.jumpBuffer -= deltaTime;
        if (this.jumpStatus && this.jumpBuffer > 0 && this.onGround) {
            this.jump();
            this.jumpStatus = false;
        }
        // if player falls, reset position to last reached checkpoint
        if (this.playerBody.position.y < -10) {
            this.playerBody.position.set(this.spawnPoint.x, this.spawnPoint.y + 8, this.spawnPoint.z);
            this.playerBody.velocity.set(0, 0, 0);
            this.playerBody.angularVelocity.set(0, 0, 0);
            this.playerBody.quaternion.set(0, 0, 0, 1);
        }
        // apply friction when player is not moving
        if (!this.moving && this.onGround) {
            this.playerBody.velocity.x *= 0.87;
            this.playerBody.velocity.z *= 0.87;
            this.playerBody.angularVelocity.y *= 0.95;
        }
        this.playerBody.velocity.x *= 0.95;
        this.playerBody.velocity.z *= 0.95;
        this.playerBody.quaternion.setFromEuler(0, this.rotation.y, 0);
    }
    jump() {
        const jumpForce = 14;
        this.playerBody.velocity.y = jumpForce;
    }
    /**
     * Updates the position of the physics body to match position of mesh
     */
    updateMeshes(obstacles) {
        obstacles.forEach((obstacle) => {
            obstacle.mesh.position.copy(obstacle.platformBody.position);
            obstacle.mesh.quaternion.copy(obstacle.platformBody.quaternion);
        });
    }
}
