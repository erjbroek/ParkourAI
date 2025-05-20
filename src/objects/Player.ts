import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Obstacle from './Obstacle.js';
import Parkour from './Parkour.js';
import KeyListener from '../utilities/KeyListener.js';
import Edit from '../scenes/Edit.js';
import MainCanvas from '../setup/MainCanvas.js';
import ParkourPieces from './ParkourPieces.js';
import Game from '../scenes/Game.js';
import * as neat from 'neataptic';
import Statistics from '../scenes/Statistics.js';


const PLAYER_GROUP = 1 << 0; // 0001
const OBSTACLE_GROUP = 1 << 1; // 0010

const Neat = neat.Neat;
const Methods = neat.methods;

export default class Player {
  public rotation: THREE.Vector3 = new THREE.Vector3(0, Math.PI * 1.5, 0);

  public mesh: THREE.Mesh = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshLambertMaterial({ color: 0x00aaff })
  );

  public physicsMaterial: CANNON.Material = new CANNON.Material();

  public playerBody: CANNON.Body;

  public spawnPoint: THREE.Vector3 = new THREE.Vector3(0, 0.5, 20);

  public boundingBox: THREE.Box3;

  public onGround: boolean = false;

  public amountOfJumps: number = 0

  public index: number = 0;

  public brain: any;

  public inputLevels: { current: Obstacle; next: Obstacle } = {
    current: Parkour.levels[0].pieces[0],
    next: Parkour.levels[0].pieces[1],
  };

  public obstacleCoordinations: {
    current: THREE.Vector3;
    next: THREE.Vector3;
  } = { current: new THREE.Vector3(), next: new THREE.Vector3() };

  public finished: boolean = false;

  public inputValues: number[] = [];

  public alive: boolean = true;

  public deathTimer: number = 5;

  public highestObstacleIndex: number = 0;

  public ai: boolean;

  public userFitness: number = 0;

  private maxFitness: number = 0

  private loaded: boolean = false;

  public constructor(index: number, ai: boolean, brain: any = []) {
    this.index = index;
    this.ai = ai;
    this.brain = brain;

    // used to set player spawnpoint
    let level: number | null;
    level = 0;

    const spawnPoint = Parkour.levels[Parkour.activeLevel].spawnPoint;
    this.playerBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
      position: new CANNON.Vec3(spawnPoint.x, spawnPoint.y, spawnPoint.z),
      material: this.physicsMaterial,
      collisionFilterGroup: PLAYER_GROUP, // Player belongs to PLAYER_GROUP
      collisionFilterMask: OBSTACLE_GROUP, // Player can only collide with OBSTACLE_GROUP
    });

    // this.currentLevel = 3;
    // this.playerBody.position = new CANNON.Vec3(0, 1.5, -290);

    const platformPlaterContactMaterial = new CANNON.ContactMaterial(
      this.physicsMaterial,
      Obstacle.material,
      { friction: 0, restitution: 0 }
    );
    this.mesh.castShadow = true;
    MainCanvas.world.addBody(this.playerBody);
    MainCanvas.world.addContactMaterial(platformPlaterContactMaterial);
    MainCanvas.scene.add(this.mesh);

    this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
  }

  /**
   * updates the player movement and input values for nn
   *
   * @param deltaTime deltatime since last frame
   */
  public update(deltaTime: number) {
    if (this.brain.score >= this.maxFitness + 10) {
      this.deathTimer = 5
      this.maxFitness = this.brain.score
    } else {
      this.deathTimer -= deltaTime
    }
    if (this.deathTimer <= 0) {
      this.killPlayer()
    }

    if (this.ai) {
      this.calculateFitness();
    }
    const currentObstacle = this.inputLevels.current.boundingBox;
    const nextObstacle = this.inputLevels.next.boundingBox;

    this.obstacleCoordinations.current = new THREE.Vector3();
    currentObstacle.clampPoint(
      nextObstacle.getCenter(new THREE.Vector3()),
      this.obstacleCoordinations.current
    );
    this.obstacleCoordinations.next = new THREE.Vector3();
    nextObstacle.clampPoint(
      currentObstacle.getCenter(new THREE.Vector3()),
      this.obstacleCoordinations.next
    );

    const playerPosition = new THREE.Vector3(
      Math.round(this.playerBody.position.x * 1000) / 1000,
      Math.round((this.playerBody.position.y - 1.5) * 1000) / 1000,
      Math.round(this.playerBody.position.z * 1000) / 1000
    );
    this.obstacleCoordinations.next.subVectors(
      this.obstacleCoordinations.next,
      playerPosition
    );
    this.obstacleCoordinations.current.subVectors(
      this.obstacleCoordinations.current,
      playerPosition
    );
    const playerVelocity =
      Math.abs(this.playerBody.velocity.x) +
      Math.abs(this.playerBody.velocity.y) +
      Math.abs(this.playerBody.velocity.z);

    const decimals = 3;
    const inputValues = [
      Math.round(this.obstacleCoordinations.current.x * 10 ** decimals) /
        10 ** decimals,
      Math.round(this.obstacleCoordinations.current.y * 10 ** decimals) /
        10 ** decimals,
      Math.round(this.obstacleCoordinations.current.z * 10 ** decimals) /
        10 ** decimals,
      this.obstacleCoordinations.next.x,
      this.obstacleCoordinations.next.y,
      this.obstacleCoordinations.next.z,
      // Math.round(playerVelocity * 10 ** decimals) / 10 ** decimals / 10,
    ];
    const extremes: { max: number; min: number } = {
      max: Math.max(...inputValues),
      min: Math.min(...inputValues),
    };

    const normalizedValues = inputValues.map((value) => {
      if (extremes.max === extremes.min) {
        return 0;
      }
      return (2 * (value - extremes.min)) / (extremes.max - extremes.min) - 1;
    });
    
    this.inputValues = [...normalizedValues, this.onGround ? 1 : 0];
    this.boundingBox.setFromObject(this.mesh);
    this.updateMovement(deltaTime);
  }

  public updateMovement(deltaTime: number) {
    if (this.ai) {
      let output = this.brain.activate(this.inputValues);
      const max = Math.max(...output);
      const min = Math.min(...output);
      output = output.map((value) => (value - min) / (max - min));

      const outputForwards = output[0];
      const outputBackwards = output[1];
      const outputLeft = output[2];
      const outputRight = output[3];
      const outputJump = output[4];

      output.forEach((value, index) => {
        if (value > 1 || value < 0) {
          console.log(`Output ${index}: ${value}`);
        }
      });

      this.moveForward(outputForwards);
      this.moveBackward(outputBackwards);
      this.moveLeft(outputLeft);
      this.moveRight(outputRight);

      if (outputJump > 0.5) {
        if (this.onGround) {
          this.jump();
        }
      }
      if (this.ai) {
        // const inputNodes = this.brain.nodes.filter((node: any) => node.type === 'input');
        // const hiddenNodes = this.brain.nodes.filter((node: any) => node.type === 'hidden');
        // const outputNodes = this.brain.nodes.filter((node: any) => node.type === 'output');
        if (Game.colorMode == 0) {
          const material = this.mesh.material as THREE.MeshLambertMaterial;
          material.color.setRGB(0 / 255, 100 / 255, 255 / 255);
          material.emissive.setRGB(0, 0, 0);
        } else if (Game.colorMode == 1) {
          const material = this.mesh.material as THREE.MeshLambertMaterial;
          material.color.setRGB(0 / 255, 0 / 255, 0 / 255);

          const energy =
            outputForwards +
            outputBackwards +
            outputLeft +
            outputRight +
            outputJump;
          const normalizedEnergy = Math.min(energy / 5, 1);

          const meshMaterial = this.mesh.material as THREE.MeshStandardMaterial;
          meshMaterial.emissive.setRGB(
            normalizedEnergy,
            normalizedEnergy * 0.5,
            0
          );
          meshMaterial.emissiveIntensity = normalizedEnergy;
        } else if (Game.colorMode == 2) {
          const forwardBackward = outputForwards - outputBackwards;
          const colorValue = forwardBackward;
          const material = this.mesh.material as THREE.MeshLambertMaterial;
          material.color.setRGB(colorValue, 0, 0 - colorValue);
          material.emissive.setRGB(0, 0, 0);
        } else if (Game.colorMode == 3) {
          const leftRight = outputLeft - outputRight;
          const colorValue = leftRight;
          const material = this.mesh.material as THREE.MeshLambertMaterial;
          material.color.setRGB(0, colorValue, 0 - colorValue);
          material.emissive.setRGB(0, 0, 0);
          if (this.loaded) {
            this.loaded = false;
            const material = new THREE.MeshLambertMaterial({ color: 0x00aaff });
            this.mesh.material = material;
          }
        } else if (Game.colorMode == 5) {
          if (this.loaded) {
            this.loaded = false;
            const material = new THREE.MeshLambertMaterial({ color: 0x00aaff });
            this.mesh.material = material;
          }
          const X = 4;
          const connections = [];
          for (let i = 0; i < this.brain.connections.length; i += 1) {
            connections.push(...this.brain.connections.slice(i, i + 1));
            if (connections.length >= X) break;
          }
          let r = 0;
          let g = 0;
          let b = 0;
          connections.forEach((connection, index) => {
            const weight = connection.weight;
            if (index < 1) {
              r += weight * 0.4;
            }
            if (index >= 1 && index < 2) {
              g += weight * 0.4;
            }
            if (index >= 2 && index < 4) {
              b += weight * 0.4;
            }
          });
          r = Math.min(Math.max(r / X, 0), 1);
          g = Math.min(Math.max(g / X, 0), 1);
          b = Math.min(Math.max(b / X, 0), 1);
          (this.mesh.material as THREE.MeshLambertMaterial).color.setRGB(
            r,
            g,
            b
          );
        } else if (Game.colorMode == 6) {
          const forwardBackward = outputForwards - outputBackwards;
          const leftRight = outputRight - outputLeft;
          const jumpEffect = outputJump * 0.5;
          const meshMaterial = this.mesh.material as THREE.MeshStandardMaterial;

          (this.mesh.material as THREE.MeshLambertMaterial).color.setRGB(
            Math.abs(forwardBackward),
            Math.abs(leftRight),
            jumpEffect
          );
        } else if (Game.colorMode == 7) {
        } else if (Game.colorMode == 8) {
        } else if (Game.colorMode == 9) {
        } else if (Game.colorMode == 10) {
          const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
          });
          const wireframeMesh = new THREE.Mesh(
            this.mesh.geometry,
            wireframeMaterial
          );
          this.mesh.add(wireframeMesh);
        }

        const bestPlayer = Game.alivePlayers.reduce((prev, current) =>
          prev.brain.score > current.brain.score ? prev : current
        );
        if (this.brain == bestPlayer.brain) {
          const material = this.mesh.material as THREE.MeshLambertMaterial;
          material.color.setRGB(1, 0, 0);
        }
      }
    }

    // if player falls, reset position to last reached checkpoint
    if (this.playerBody.position.y < -10) {
      this.killPlayer();
    }

    // apply friction when player is not moving
    if (this.onGround) {
      this.playerBody.velocity.x *= 0.93;
      this.playerBody.velocity.z *= 0.93;
      // this.playerBody.angularVelocity.y *= 0.95;
    }
    this.playerBody.velocity.x *= 0.97;
    this.playerBody.velocity.z *= 0.97;

    // needs to be fixed someday, since it causes non-realistic physics/ collisions
    this.playerBody.quaternion.setFromEuler(0, this.rotation.y, 0);
  }

  public killPlayer() {
    this.alive = false;
    const material = this.mesh.material as THREE.MeshLambertMaterial;
    material.color.setRGB(1, 0, 0); // Set color to red
    material.emissive.setRGB(0, 0, 0);
    material.emissiveIntensity = 1;

    MainCanvas.world.removeBody(this.playerBody)
    MainCanvas.scene.remove(this.mesh)
  }

  /**
   * calculates the percentage of the distance the player is to the next obstacle
   *
   * @returns percentage that player has reached to the next jump from the current
   */
  public calculateObstacleDistance(): number {
    // will be used for the starting point, 0% distance
    const current = this.inputLevels.current.boundingBox;

    // will be used for the end point, 100% distance
    const next = this.inputLevels.next.boundingBox;

    // this first finds the nearest point on the next platform
    const currentCenter = current.getCenter(new THREE.Vector3());
    const nextPosition = new THREE.Vector3();
    next.clampPoint(currentCenter, nextPosition);

    // then it gets the point that is furthest away from the nextPosition on the current platform
    const directionVector = new THREE.Vector3();
    directionVector.subVectors(nextPosition, currentCenter);
    directionVector.multiplyScalar(-2);
    const currentPosition = new THREE.Vector3();
    currentPosition.addVectors(nextPosition, directionVector);

    // next, the distance is calculated between these 2 points
    const maxDistance = Math.sqrt(
      (currentPosition.x - nextPosition.x) ** 2 +
      (currentPosition.y - nextPosition.y) ** 2 +
      (currentPosition.z - nextPosition.z) ** 2
    );

    const currentDistance = Math.sqrt(
      (this.playerBody.position.x - nextPosition.x) ** 2 +
      (this.playerBody.position.y - nextPosition.y) ** 2 +
      (this.playerBody.position.z - nextPosition.z) ** 2
    );

    // when using both of these distances (the total distance, and the current players distance), we know how far the player is to the next jump
    // if the player is halfway, it would return 0.5 (which can then be used for the players fitness function)
    return 1 - currentDistance / maxDistance;
  }

  /**
   * the fitness of the player is based on progress in the course
   *
   * @returns the fitness of the player
   */
  public calculateFitness(printScore: boolean = false): void {

    if (this.ai) {
      this.brain.score = 0;

      // progress in level
      // this.brain.score += this.finished ? 10 : 0
      this.brain.score +=
        25 * this.calculateObstacleDistance() + this.highestObstacleIndex * 25;
      // this.brain.score -= (this.amountOfJumps * 3)
      if (this.finished) {
        this.brain.score *= 1.5;
      } else {
      }
      this.brain.score = Math.max(this.brain.score, this.maxFitness)
    } else {
      this.userFitness = 0;

      // progress in level
      this.userFitness +=
        25 * this.calculateObstacleDistance() + this.highestObstacleIndex * 25;
      if (this.finished) {
        this.brain.score *= 1.5;
      }
    }
  }

  public jump() {
    const jumpForce = 14;
    this.playerBody.position.y += 0.01;
    this.playerBody.velocity.y = jumpForce;
    this.onGround = false
    this.amountOfJumps++
  }

  /**
   * moves player left or right based on player rotation
   *
   * @param amount is the multiplier for the speed of the player between -1 and 1
   */
  public moveLeft(amount: number) {
    const speed = 4;

    this.playerBody.velocity.x += amount * -speed;
    // this.playerBody.velocity.z += amount * -speed;
    this.normalizeVelocity();
  }

  /**
   * moves player left or right based on player rotation
   *
   * @param amount is the multiplier for the speed of the player between -1 and 1
   */
  public moveRight(amount: number) {
    const speed = 4;

    this.playerBody.velocity.x -= amount * -speed;
    // this.playerBody.velocity.z += amount * -speed;
    this.normalizeVelocity();
  }

  public moveForward(amount: number) {
    const speed = 4;

    this.playerBody.velocity.z -= amount * speed;
    this.normalizeVelocity();
  }

  public moveBackward(amount: number) {
    const speed = 4;

    this.playerBody.velocity.z += amount * speed;
    this.normalizeVelocity();
  }

  /**
   * moves player forwards or backwards based on player rotation
   *
   * @param amount is the multiplier for the speed of the player between -1 and 1
   */
  public moveForwardBackward(amount: number) {
    const speed = 4;

    // this.playerBody.velocity.x += amount * speed;
    this.playerBody.velocity.z -= amount * -speed;
    this.normalizeVelocity();
  }

  /**
   * normalizes player velocity to prevent player from moving faster than max speed
   * this is the case when the player is moving diagonally relative to player rotation
   */
  private normalizeVelocity() {
    const maxSpeed = 16;
    const speed = Math.sqrt(
      this.playerBody.velocity.x * this.playerBody.velocity.x +
        this.playerBody.velocity.z * this.playerBody.velocity.z
    );

    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      this.playerBody.velocity.x *= scale;
      this.playerBody.velocity.z *= scale;
    }
  }

  /**
   * Updates the position of the physics body to match position of mesh
   */
  public updateMeshes(obstacles: Obstacle[]): void {
    obstacles.forEach((obstacle) => {
      obstacle.mesh.position.copy(obstacle.platformBody.position);
      obstacle.mesh.quaternion.copy(obstacle.platformBody.quaternion);
    });
  }
}