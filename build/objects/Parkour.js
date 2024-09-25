import Obstacle from './Obstacle.js';
import * as THREE from 'three';
import MainCanvas from '../setup/MainCanvas.js';
import ParkourPieces from './ParkourPieces.js';
class Parkour {
    constructor() {
        this.activeLevel = 0;
        this.objectArray = [];
    }
    createObstacle(mesh, posX, posY, posZ, rotationX = 0, rotationY = 0, rotationZ = 0) {
        return new Obstacle(mesh.clone(), { posX, posY, posZ, rotationX, rotationY, rotationZ });
    }
    generateParkour() {
        Parkour.levels.push([
            this.createObstacle(ParkourPieces.platform, 0, 0, 16),
            this.createObstacle(ParkourPieces.platform, 0, 0, 0),
            this.createObstacle(ParkourPieces.long2, 0, 0, -16),
            this.createObstacle(ParkourPieces.long2, 0, 0, -34),
            this.createObstacle(ParkourPieces.checkPoint, 0, 6.51, -52),
            this.createObstacle(ParkourPieces.platform, 0, 0, -52),
        ]);
        Parkour.levels.push([
            this.createObstacle(ParkourPieces.long2, 0, 0, -68),
            this.createObstacle(ParkourPieces.long2, 8, 0, -80, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long2, 16, 0, -88, 0),
            this.createObstacle(ParkourPieces.long1, 16, 0, -100, 0),
            this.createObstacle(ParkourPieces.platform, 16, 0, -112),
            this.createObstacle(ParkourPieces.checkPoint, 16, 6.51, -112),
        ]);
        Parkour.levels.push([
            this.createObstacle(ParkourPieces.long2, 16, 0, -128),
            this.createObstacle(ParkourPieces.long2, 16, 0, -156),
            this.createObstacle(ParkourPieces.platform, 16, 0, -172),
            this.createObstacle(ParkourPieces.checkPoint, 16, 6.51, -172)
        ]);
        Parkour.levels.push([
            this.createObstacle(ParkourPieces.long1, 16, 0, -188),
            this.createObstacle(ParkourPieces.long1, 16, 0, -208),
            this.createObstacle(ParkourPieces.long1, 16, 0, -228),
            this.createObstacle(ParkourPieces.long1, 12, 0, -232, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 8, 0, -236, 0),
            this.createObstacle(ParkourPieces.long1, 8, 0, -256, 0),
            this.createObstacle(ParkourPieces.long1, 8, 0, -276, 0),
            this.createObstacle(ParkourPieces.platform, 8, 0, -292),
            this.createObstacle(ParkourPieces.checkPoint, 8, 6.51, -292)
        ]);
        Parkour.levels.push([
            this.createObstacle(ParkourPieces.long1, 8, 0, -308),
            this.createObstacle(ParkourPieces.normal, 8, 2, -324),
            this.createObstacle(ParkourPieces.normal, -4, 4, -324),
            this.createObstacle(ParkourPieces.normal, -16, 6, -324),
            this.createObstacle(ParkourPieces.normal, -28, 8, -324),
            this.createObstacle(ParkourPieces.long1, -28, 8, -340),
            this.createObstacle(ParkourPieces.platform, -28, 8, -364),
            this.createObstacle(ParkourPieces.checkPoint, -28, 14.51, -364)
        ]);
        Parkour.levels.push([
            this.createObstacle(ParkourPieces.normal, -28, 8, -388),
            this.createObstacle(ParkourPieces.normal, -24, 11, -400),
            this.createObstacle(ParkourPieces.normal, -16, 14, -408),
            this.createObstacle(ParkourPieces.normal, -4, 17, -412),
            this.createObstacle(ParkourPieces.normal, 8, 20, -412),
            this.createObstacle(ParkourPieces.normal, 20, 23, -408),
            this.createObstacle(ParkourPieces.normal, 28, 26, -400),
            this.createObstacle(ParkourPieces.normal, 32, 29, -388),
            this.createObstacle(ParkourPieces.long1, 32, 29, -368, 0),
            this.createObstacle(ParkourPieces.platform, 32, 29, -344),
            this.createObstacle(ParkourPieces.checkPoint, 32, 35.51, -344)
        ]);
        Parkour.levels.push([
            this.createObstacle(ParkourPieces.long1, 32, 29, -320),
            this.createObstacle(ParkourPieces.normal, 32, 24, -296),
            this.createObstacle(ParkourPieces.normal, 52, 20, -296),
            this.createObstacle(ParkourPieces.normal, 72, 16, -296),
            this.createObstacle(ParkourPieces.normal, 92, 12, -296),
            this.createObstacle(ParkourPieces.platform, 120, 8, -296, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.checkPoint, 120, 14.51, -296, 0, Math.PI / 2)
        ]);
        Parkour.levels.push([
            this.createObstacle(ParkourPieces.long1, 144, 8, -296, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 168, 5, -292, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 192, 8, -296, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 216, 5, -300, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 240, 8, -296, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 264, 5, -292, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 288, 8, -296, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.platform, 312, 8, -296, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.checkPoint, 312, 14.51, -296, 0, Math.PI / 2)
        ]);
        Parkour.levels.push([
            this.createObstacle(ParkourPieces.long1, 340, 8, -300, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 12, -292, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 16, -300, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 20, -292, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 24, -300, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 28, -292, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 32, -300, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 36, -292, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 40, -300, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 44, -292, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 48, -300, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 52, -292, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 52, -280, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 52, -268, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.platform, 340, 52, -248),
            this.createObstacle(ParkourPieces.checkPoint, 340, 58.51, -248),
        ]);
        Parkour.levels.push([
            this.createObstacle(ParkourPieces.long1, 340, 52, -228, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 52, -208, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 52, -188, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 52, -168, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 52, -148, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 52, -128, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 52, -108, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.long1, 340, 52, -88, 0, Math.PI / 2),
            this.createObstacle(ParkourPieces.platform, 340, 52, -68),
            this.createObstacle(ParkourPieces.checkPoint, 340, 58.51, -68),
        ]);
        Parkour.levels.push([
            this.createObstacle(ParkourPieces.normal, 340, 52, -44),
            this.createObstacle(ParkourPieces.normal, 340, 52, -28),
            this.createObstacle(ParkourPieces.long1, 340, 10, 12),
            this.createObstacle(ParkourPieces.platform, 340, 10, 36),
            this.createObstacle(ParkourPieces.checkPoint, 340, 16.51, 36)
        ]);
        this.renderParkour(Parkour.levels[0]);
        this.renderParkour(Parkour.levels[1]);
        this.renderParkour(Parkour.levels[2]);
        this.renderParkour(Parkour.levels[3]);
        this.renderParkour(Parkour.levels[4]);
        this.renderParkour(Parkour.levels[5]);
        this.renderParkour(Parkour.levels[6]);
        this.renderParkour(Parkour.levels[7]);
        this.renderParkour(Parkour.levels[8]);
        this.renderParkour(Parkour.levels[9]);
        this.renderParkour(Parkour.levels[10]);
    }
    checkCollision(player) {
        let levels = [Parkour.levels[player.currentLevel]];
        if (player.currentLevel > 0) {
            levels.push(Parkour.levels[player.currentLevel - 1]);
        }
        player.onGround = false;
        levels.forEach((level, index) => {
            level.forEach((object) => {
                if (object.isCheckpoint) {
                    if (object.boundingBox.intersectsBox(player.boundingBox) && index === 0) {
                        player.currentLevel += 1;
                        object.mesh.material = ParkourPieces.checkPointActive;
                        const objectHeight = object.boundingBox.max.y - object.boundingBox.min.y;
                        player.spawnPoint = new THREE.Vector3(object.mesh.position.x, object.mesh.position.y - objectHeight / 2, object.mesh.position.z);
                        levels[0] = Parkour.levels[player.currentLevel];
                        return;
                    }
                }
                else {
                    const obstacleTopY = object.boundingBox.max.y;
                    const playerMinY = player.boundingBox.min.y;
                    if (object.boundingBox.intersectsBox(player.boundingBox) && playerMinY >= obstacleTopY - 0.1) {
                        player.playerBody.angularVelocity.y *= 0.5;
                        player.playerBody.angularVelocity.x *= 0.5;
                        player.playerBody.angularVelocity.z *= 0.5;
                        player.onGround = true;
                    }
                }
            });
        });
    }
    renderParkour(level) {
        level.forEach((obstacle) => {
            MainCanvas.scene.add(obstacle.mesh);
        });
    }
}
Parkour.levels = [];
Parkour.addedParkour = [[]];
export default Parkour;
