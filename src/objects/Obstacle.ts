import * as THREE from 'three';

export default class Obstacle {
  public posX: number;

  public posY: number;

  public posZ: number;

  public rotationX: number;

  public rotationY: number;

  public rotationZ: number;

  public moving: boolean;

  public movingSpeed: number;  

  public movingLength: number;

  public movingDirection: number;

  public mesh: THREE.Mesh;

  public constructor(mesh: THREE.Mesh, posX = 0, posY = 0, posZ = 0, rotationX = 0, rotationY = 0, rotationZ = 0, moving = false, movingSpeed = 1, movingLength = 1, movingDirection = 1) {
    this.mesh = mesh;
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.rotationX = rotationX;
    this.rotationY = rotationY;
    this.rotationZ = rotationZ;
    this.moving = moving;
    this.movingSpeed = movingSpeed;
    this.movingLength = movingLength;
    this.movingDirection = movingDirection;
  }

  public moveObstacle(deltaTime: number): void {

  }
}