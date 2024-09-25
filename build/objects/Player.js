import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import neataptic from 'neataptic';
import Obstacle from './Obstacle.js';
import Parkour from './Parkour.js';
import KeyListener from '../utilities/KeyListener.js';
import MainCanvas from '../setup/MainCanvas.js';
const PLAYER_GROUP = 1 << 0;
const OBSTACLE_GROUP = 1 << 1;

const Neat = neataptic.Neat;
const Methods = neataptic.methods;
const Config = neataptic.config;
const Architect = neataptic.architect;

export default class Player {
    constructor(index) {
        this.rotation = new THREE.Vector3(0, Math.PI * 1.5, 0);
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
        this.index = 0;
        this.index = index;
        this.playerBody = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
            position: new CANNON.Vec3(0 + index * 3, 5 + index * 3, 20),
            material: this.physicsMaterial,
            collisionFilterGroup: PLAYER_GROUP,
            collisionFilterMask: OBSTACLE_GROUP,
        });
        const platformPlaterContactMaterial = new CANNON.ContactMaterial(this.physicsMaterial, Obstacle.material, { friction: 0, restitution: 0 });
        this.playerBody.angularDamping;
        this.mesh.castShadow = true;
        MainCanvas.world.addBody(this.playerBody);
        MainCanvas.world.addContactMaterial(platformPlaterContactMaterial);
        MainCanvas.scene.add(this.mesh);
        this.rotation.y = Math.PI;
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    }

    update(deltaTime) {
        this.boundingBox.setFromObject(this.mesh);
        this.updateMovement(deltaTime);
    }

    updateMovement(deltaTime) {
        const rotationSpeed = 2.5;
        if (KeyListener.isKeyDown('ArrowLeft')) {
            this.rotation.y += rotationSpeed * deltaTime;
        }
        if (KeyListener.isKeyDown('ArrowRight')) {
            this.rotation.y -= rotationSpeed * deltaTime;
        }
        this.forward.set(Math.sin(this.rotation.y), 0, Math.cos(this.rotation.y)).normalize();
        this.right.set(Math.sin(this.rotation.y + Math.PI / 2), 0, Math.cos(this.rotation.y + Math.PI / 2)).normalize();
        const speed = 0.8;
        this.moving = false;
        if (KeyListener.isKeyDown('KeyS')) {
            this.moveForwardBackward(-1);
            this.moving = true;
        }
        if (KeyListener.isKeyDown('KeyW')) {
            this.moveForwardBackward(1);
            this.moving = true;
        }
        if (KeyListener.isKeyDown('KeyA')) {
            this.moveLeftRight(-1);
            this.moving = true;
        }
        if (KeyListener.isKeyDown('KeyD')) {
            this.moveLeftRight(1);
            this.moving = true;
        }
        if (KeyListener.isKeyDown('ArrowLeft')) {
            this.rotate(1);
        }
        if (KeyListener.isKeyDown('ArrowRight')) {
            this.rotate(-1);
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
        if (this.playerBody.position.y < -10) {
            this.playerBody.position.set(this.spawnPoint.x, this.spawnPoint.y + 8, this.spawnPoint.z);
            this.playerBody.velocity.set(0, 0, 0);
            this.playerBody.angularVelocity.set(0, 0, 0);
            this.playerBody.quaternion.set(0, 0, 0, 1);
        }
        if (!this.moving && this.onGround) {
            this.playerBody.velocity.x *= 0.87;
            this.playerBody.velocity.z *= 0.87;
            this.playerBody.angularVelocity.y *= 0.95;
        }
        this.playerBody.velocity.x *= 0.95;
        this.playerBody.velocity.z *= 0.95;
        this.playerBody.quaternion.setFromEuler(0, this.rotation.y, 0);
        if (this.index == 0) {
            this.calculateDistance();
            this.calculateFitness();
        }
    }

    calculateDistance() {
        const checkpoint = Parkour.levels[this.currentLevel][Parkour.levels[this.currentLevel].length - 1];
        const spawnPoint = this.spawnPoint;
        const maxDistance = Math.sqrt(Math.pow((spawnPoint.x - checkpoint.mesh.position.x), 2) +
            Math.pow((spawnPoint.y - checkpoint.mesh.position.y), 2) +
            Math.pow((spawnPoint.z - checkpoint.mesh.position.z), 2));
        const currentDistance = Math.sqrt(Math.pow((this.playerBody.position.x - checkpoint.mesh.position.x), 2) +
            Math.pow((this.playerBody.position.y - checkpoint.mesh.position.y), 2) +
            Math.pow((this.playerBody.position.z - checkpoint.mesh.position.z), 2));
        const distanceFitness = currentDistance / maxDistance;
        return (1 - distanceFitness) * 100;
    }

    calculateFitness() {
        let fitness = 0;
        fitness += this.calculateDistance();
        fitness += this.currentLevel * 100;
        return fitness;
    }

    jump() {
        const jumpForce = 14;
        this.playerBody.velocity.y = jumpForce;
    }

    moveLeftRight(amount) {
        const speed = 0.8;
        this.playerBody.velocity.x += amount * -speed * this.right.x;
        this.playerBody.velocity.z += amount * -speed * this.right.z;
        this.normalizeVelocity();
    }

    moveForwardBackward(amount) {
        const speed = 0.8;
        this.playerBody.velocity.x += amount * speed * this.forward.x;
        this.playerBody.velocity.z += amount * speed * this.forward.z;
        this.normalizeVelocity();
    }

    normalizeVelocity() {
        const maxSpeed = 16;
        const speed = Math.sqrt(this.playerBody.velocity.x * this.playerBody.velocity.x +
            this.playerBody.velocity.z * this.playerBody.velocity.z);
        if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            this.playerBody.velocity.x *= scale;
            this.playerBody.velocity.z *= scale;
        }
    }

    rotate(amount) {
        const speed = 0.07;
        this.rotation.y += amount * speed;
    }

    updateMeshes(obstacles) {
        obstacles.forEach((obstacle) => {
            obstacle.mesh.position.copy(obstacle.platformBody.position);
            obstacle.mesh.quaternion.copy(obstacle.platformBody.quaternion);
        });
    }
}
