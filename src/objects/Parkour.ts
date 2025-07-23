import Level from './Level.js';
import { platform } from 'os';
import Obstacle from './Obstacle.js';
import * as THREE from 'three';
import MainCanvas from '../setup/MainCanvas.js';
import ParkourPieces from './ParkourPieces.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Edit from '../scenes/Edit.js';
import Player from './Player.js';
import Statistics from '../scenes/Statistics.js';
import NeatManager from '../utilities/NeatManager.js';
import Island from './Island.js';
import Foliage from './Foliage.js';
import Water from './Water.js';
import * as CANNON from 'cannon-es';

export default class Parkour {
  public static levels: Level[] = []

  public static activeLevel: number = 0;

  public static addedParkour: Obstacle[][] = [[]];

  // used to display all different objects in the parkour
  public objectArray: Obstacle[] = [];

  public constructor() {
    this.generateParkour();
  }


  /**
   * once i enable level creation, make sure that the levels are seperate from these levels
   * meaning, these levels would not be pushed and instead just the players levels would be pushed
   * otherwize, it wont work with collision code
   * 
   * Generates the levels in the parkour
   */
  public generateParkour(): void {
    let obstacles = []
    let islands = []
    let foliage = []

    // level 0
    obstacles = [
      [ParkourPieces.startingPlatform, 0, -2, -30],
      [ParkourPieces.startingPlatform, 0, -2, -50],
      [ParkourPieces.startingPlatform, 0, -2, -70],
      [ParkourPieces.platform, 0, -2, -90],
      [ParkourPieces.checkPoint, 0, 5.01, -80]
    ]
    islands = [
      new Island(new THREE.Vector3(0, -2.99, -60), new THREE.Vector3(25, 10, 80))
    ]
    foliage = [
      new Foliage('tree', new THREE.Vector3(-10, -2, -35)),
      new Foliage('tree', new THREE.Vector3(10, -2, -65)),
    ]
    Parkour.levels.push(new Level(0, obstacles, islands, foliage, new THREE.Vector3(0, 1.2, -30), 7))


    // level 1, with first time a jump gets introduced
    obstacles = [
      [ParkourPieces.startingPlatform, 0, -2, -30],
      [ParkourPieces.startingPlatform, 0, -2, -50],
      [ParkourPieces.startingPlatform, 0, -2, -76],
      [ParkourPieces.platform, 0, -2, -96],
      [ParkourPieces.checkPoint, 0, 5.01, -86]  
    ]
    islands = [
      new Island(new THREE.Vector3(0, -2.99, -40), new THREE.Vector3(24.1, 10, 36.1)),
      new Island(new THREE.Vector3(0, -2.99, -86), new THREE.Vector3(24.1, 10, 36.1)),
    ]
    foliage = [
      new Foliage('bushgroup', new THREE.Vector3(10, -2, -100), 2),
      new Foliage('tree', new THREE.Vector3(10, -3, -100))
    ]
    Parkour.levels.push(new Level(1, obstacles, islands, foliage, new THREE.Vector3(0, 1.2, -30), 10))

    obstacles = [
      [ParkourPieces.startingPlatform, 0, -2, -30],
      [ParkourPieces.long2, 0, -3.5, -50, 0, 0, Math.PI / 2],
      [ParkourPieces.long2, 0, -3.5, -70, 0, 0, Math.PI / 2],
      [ParkourPieces.long2, 0, -3.5, -90, 0, 0, Math.PI / 2],
      [ParkourPieces.long2, 0, -3.5, -110, 0, 0, Math.PI / 2],
      [ParkourPieces.platform, 0, -2, -130],
      [ParkourPieces.checkPoint, 0, 3.51, -120],
    ]
    islands = [
      new Island(new THREE.Vector3(0, -2.99, -30), new THREE.Vector3(24.1, 10, 16.1)),
      new Island(new THREE.Vector3(0, -2.99, -130), new THREE.Vector3(24.1, 10, 16.1)),
    ]
    Parkour.levels.push(new Level(2, obstacles, islands, [], new THREE.Vector3(0, 0, -30), 9))

    // level 2, now also moving right instead of just straight
    obstacles = [
      [ParkourPieces.startingPlatform, -52, -2, -46, 0, Math.PI / 2],
      [ParkourPieces.long2, -32, -2, -44, 0, Math.PI / 2],
      [ParkourPieces.long2, -12, -2, -44, 0, Math.PI / 2],
      [ParkourPieces.long2, 0, -2, -52],
      [ParkourPieces.long2, 0, -2, -72],
      [ParkourPieces.long2, 8, -2, -84, 0, Math.PI / 2],
      [ParkourPieces.long2, 28, -2, -84, 0, Math.PI / 2],
      [ParkourPieces.platform, 48, -2, -88, 0, Math.PI / 2],
      [ParkourPieces.checkPoint, 38, 4.51, -88, 0, Math.PI / 2],
    ]
    islands = [
      new Island(new THREE.Vector3(-52, -2.99, -46), new THREE.Vector3(16.1, 10, 24.1)),
      new Island(new THREE.Vector3(48, -2.99, -88), new THREE.Vector3(16.1, 10, 24.1)),
    ]
    foliage = [
      new Foliage('tree', new THREE.Vector3(54, -2, -98))
    ]
    Parkour.levels.push(new Level(3, obstacles, islands, foliage, new THREE.Vector3(-52, 1, -46), 17))
    
    
    // level 4, two different directioons
    obstacles = [
      [ParkourPieces.startingPlatform, -30, -2, -46, 0, Math.PI / 2],
      [ParkourPieces.normal2, -30, -2, -70],
      [ParkourPieces.normal2, -30, -2, -84],
      [ParkourPieces.normal2, -30, -2, -98],
      [ParkourPieces.normal2, -16, -2, -98],
      [ParkourPieces.normal2, -2, -2, -98],
      [ParkourPieces.normal2, 12, -2, -98],
      [ParkourPieces.platform, 32, -2, -98, 0, Math.PI / 2],
      [ParkourPieces.checkPoint, 22, 4.51, -98, 0, Math.PI / 2]
    ]
    islands = [
      new Island(new THREE.Vector3(-30, -2.99, -46), new THREE.Vector3(16.1, 10, 24.1)),
      new Island(new THREE.Vector3(32, -2.99, -98), new THREE.Vector3(16.1, 10, 24.1)),
      
      new Island(new THREE.Vector3(25, -4, -55), new THREE.Vector3(32.1, 10, 6.1)),
      new Island(new THREE.Vector3(25, -4, -25), new THREE.Vector3(32.1, 10, 1.1)),
      new Island(new THREE.Vector3(40.5, -4, -40), new THREE.Vector3(1.1, 10, 31.1)),
      new Island(new THREE.Vector3(15.5, -4, -40), new THREE.Vector3(13.1, 10, 31.1)),
    ]
    foliage = [
      new Water(new THREE.Vector3(31, -8, -38), new THREE.Vector3(15, 10, 23.1)),
      new Foliage('bushgroup', new THREE.Vector3(13, -2, -52), 8, 8, 22),
      new Foliage('tree', new THREE.Vector3(36, 0, -53)),
    ]
    Parkour.levels.push(new Level(4, obstacles, islands, foliage, new THREE.Vector3(-30, 1.2, -46), 14))
    
    // level 5, the big jump
    obstacles = [
      [ParkourPieces.startingPlatform, 0, 30, -30],
      [ParkourPieces.normal2, 0, 30, -50],
      [ParkourPieces.normal2, 0, 30, -64],
      [ParkourPieces.normal2, 0, -2, -100],
      [ParkourPieces.platform, 0, -2, -120],
      [ParkourPieces.checkPoint, 0, 4.51, -110],
    ]
    islands = [
      new Island(new THREE.Vector3(0, 29,  -30), new THREE.Vector3(24.1, 10, 16.1)),
      new Island(new THREE.Vector3(-8, 14,  -28), new THREE.Vector3(20.1, 10, 22.1)),
      new Island(new THREE.Vector3( 0, -2.99, -120), new THREE.Vector3(24.1, 10, 16.1)),
    ]
    foliage = [
      new Foliage('tree', new THREE.Vector3(-18, 14, -38))
    ]
    Parkour.levels.push(new Level(5, obstacles, islands, foliage, new THREE.Vector3(0, 34, -30), 8, new THREE.Vector3(6, 3, -38), new THREE.Vector3(-1.1536448230224159, -0.7713877922208295, -1.0045455146402973)))

    // level 6, big climb
    obstacles = [
      [ParkourPieces.startingPlatform, 0, -2, -10],
      [ParkourPieces.normal2, 0, -2, -30],
      [ParkourPieces.normal2, 0, -2, -44],
      [ParkourPieces.long1, 0, 2, -55, 0, Math.PI / 2],
      [ParkourPieces.long1, 0, 6, -46, 0, Math.PI / 2],
      [ParkourPieces.long1, 0, 10, -55, 0, Math.PI / 2],
      [ParkourPieces.long1, 0, 14, -46, 0, Math.PI / 2],
      [ParkourPieces.long1, 0, 18, -55, 0, Math.PI / 2],
      [ParkourPieces.long1, 0, 22, -46, 0, Math.PI / 2],
      [ParkourPieces.long1, 0, 26, -55, 0, Math.PI / 2],
      [ParkourPieces.long1, 0, 30, -46, 0, Math.PI / 2],
      [ParkourPieces.long1, 0, 34, -55, 0, Math.PI / 2],
      [ParkourPieces.long2, 0, 34, -72],
      [ParkourPieces.platform, 0, 34, -98],
      [ParkourPieces.checkPoint, 0, 39.51, -88],
    ]
    islands = [
      new Island(new THREE.Vector3(0, -2.99, -10), new THREE.Vector3(24.1, 10, 16.1)),
      new Island(new THREE.Vector3(0, 32.99, -98), new THREE.Vector3(24.1, 10, 16.1)),
      new Island(new THREE.Vector3(-8, 24, -104), new THREE.Vector3(24.1, 10, 16.1)),
      new Island(new THREE.Vector3(-60, -2, -74), new THREE.Vector3(18.1, 10, 12.1)),
      new Island(new THREE.Vector3(-64, 8, -78), new THREE.Vector3(18.1, 10, 12.1)),
    ]
    foliage = [
      new Foliage('bushgroup', new THREE.Vector3(-68, 8, -78), 6, 8, 8),
      new Foliage('tree', new THREE.Vector3(-56, 8, -78)),
      new Foliage('tree', new THREE.Vector3(-20, 24, -104)),
    ]
    Parkour.levels.push(new Level(6, obstacles, islands, foliage, new THREE.Vector3(0, 0, -10), 16))
    
    // level 7, jump downwards in other direction
    obstacles = [
      [ParkourPieces.startingPlatform, 0, 24, -30],
      [ParkourPieces.normal2, 0,24, -50],
      [ParkourPieces.normal2, 0, 24, -64],
      [ParkourPieces.normal2, 0, 24, -78],
      [ParkourPieces.normal2, 0, 24, -92],
      [ParkourPieces.normal2, 0, -2, -92],
      [ParkourPieces.normal2, 14, -2, -92],
      [ParkourPieces.normal2, 28, -2, -92],
      [ParkourPieces.platform, 50, -2, -92, 0, Math.PI / 2],
      [ParkourPieces.checkPoint, 40, 3.51, -92, 0, Math.PI / 2],
    ]
    islands = [
      new Island(new THREE.Vector3(0, 23, -30), new THREE.Vector3(24.1, 10, 16.1)),
      new Island(new THREE.Vector3(50, -2.99, -92), new THREE.Vector3(16.1, 10, 24.1)),
      new Island(new THREE.Vector3(25, 35, -115), new THREE.Vector3(70.1, 10, 24.1)),
    ]
    foliage = [
      new Water(new THREE.Vector3(20, 12, -101), new THREE.Vector3(24, 50, 1)),
      new Water(new THREE.Vector3(20, 37, -108.5), new THREE.Vector3(24, 1, 16)),
      new Foliage('bushgroup', new THREE.Vector3(12, 37, -111), 10, 28, 1),
      new Foliage('tree', new THREE.Vector3(-4, 37, -121)),
      new Foliage('tree', new THREE.Vector3(44, 35, -103)),
    ]
    Parkour.levels.push(new Level(7, obstacles, islands, foliage, new THREE.Vector3(0, 26, -30), 16, new THREE.Vector3(110, 0, -20), new THREE.Vector3(-0.5656623449922129, 0.5555232820501848, 0.3230884531027441)))

    obstacles = [
      [ParkourPieces.startingPlatform, 10, -2, -30],
      [ParkourPieces.normal1, 10, 0, -50],
      [ParkourPieces.normal1, 10, 2, -60],
      [ParkourPieces.normal1, 0, 4, -60],
      [ParkourPieces.normal1, 0, 6, -70],
      [ParkourPieces.normal1, 0, 8, -80],
      [ParkourPieces.normal1, 10, 10, -80],
      [ParkourPieces.normal1, 20, 12, -80],
      [ParkourPieces.normal1, 20, 14, -90],
      [ParkourPieces.normal1, 20, 16, -100],
      [ParkourPieces.normal1, 20, 18, -110],
      [ParkourPieces.normal1, 10, 20, -110],
      [ParkourPieces.normal1, 0, 22, -110],
      [ParkourPieces.normal1, -10, 22, -110],
      [ParkourPieces.platform, -28, 22, -110, 0, Math.PI / 2],
      [ParkourPieces.checkPoint, -18, 27.51, -110, 0, Math.PI / 2],
    ]
    islands = [
      new Island(new THREE.Vector3(10, -2.99, -30), new THREE.Vector3(24.1, 10, 16.1)),
      new Island(new THREE.Vector3(-28, 21, -110), new THREE.Vector3(16.1, 10, 24.1)),

      new Island(new THREE.Vector3(-45, -4, -55), new THREE.Vector3(32.1, 10, 6.1)),
      new Island(new THREE.Vector3(-45, -4, -25), new THREE.Vector3(32.1, 10, 1.1)),
      new Island(new THREE.Vector3(-29.5, -4, -40), new THREE.Vector3(1.1, 10, 31.1)),
      new Island(new THREE.Vector3(-54.5, -4, -40), new THREE.Vector3(13.1, 10, 31.1)),
    ]
    foliage = [
      new Water(new THREE.Vector3(-38.5, -8, -39), new THREE.Vector3(15, 10, 23.1)),
      new Foliage('bushgroup', new THREE.Vector3(-58.5, -2, -50), 6, 12, 24),
      new Foliage('tree', new THREE.Vector3(-58.5, -2, -50)),
      new Foliage('tree', new THREE.Vector3(-34, 18, -100)),
    ]
    Parkour.levels.push(new Level(8, obstacles, islands, foliage, new THREE.Vector3(10, 0, -30), 18, new THREE.Vector3(90, -25, -20), new THREE.Vector3(-0.5199236215038258, 0.6119346976845759, 0.31771115460866395)))
    
    obstacles = [
      [ParkourPieces.startingPlatform, 58, -2, -40],
      [ParkourPieces.long3, 34, -2, -40, Math.PI / 2, Math.PI / 2],
      [ParkourPieces.long3, 14, -2, -40, Math.PI / 2, Math.PI / 2],
      [ParkourPieces.normal2, 0, -2, -40],
      [ParkourPieces.normal2, 0, -2, -56],
      [ParkourPieces.normal2, 0, -2, -72],
      [ParkourPieces.normal2, 0, -2, -88],
      [ParkourPieces.long1, 0, 2, -99, 0, Math.PI / 2],
      [ParkourPieces.long1, 0, 6, -90, 0, Math.PI / 2],
      [ParkourPieces.long1, 0, 10, -99, 0, Math.PI / 2],
      [ParkourPieces.long1, 0, 14, -90, 0, Math.PI / 2],
      [ParkourPieces.long1, 0, 18, -99, 0, Math.PI / 2],
      [ParkourPieces.long1, 0, 22, -90, 0, Math.PI / 2],
      [ParkourPieces.long1, 0, 26, -99, 0, Math.PI / 2],
      [ParkourPieces.long1, 0, 30, -90, 0, Math.PI / 2],
      [ParkourPieces.long3, 0, 30, -78, 0, 0, Math.PI / 2],
      [ParkourPieces.long3, 0, 30, -58, 0, 0, Math.PI / 2],
      [ParkourPieces.long3, 0, 30, -38, 0, 0, Math.PI / 2],
      [ParkourPieces.normal2, 0, 30, -24],
      [ParkourPieces.long3, 14, 30, -24, 0, Math.PI / 2, Math.PI / 2],
      [ParkourPieces.normal2, 28, 30, -24],
      [ParkourPieces.normal2, 28, 33.5, -34],
      [ParkourPieces.normal2, 28, 37, -44],
      [ParkourPieces.normal2, 28, 40.5, -54],
      [ParkourPieces.normal2, 28, 44, -64],
      [ParkourPieces.long3, 16, 44, -64, 0, Math.PI / 2, Math.PI / 2],
      [ParkourPieces.long3, -4, 44, -64, 0, Math.PI / 2, Math.PI / 2],
      [ParkourPieces.normal2, -30, 12, -64],
      [ParkourPieces.normal2, -38, 12, -64],
      [ParkourPieces.platform, -52, 12, -64, 0, Math.PI / 2],
      [ParkourPieces.checkPoint, -42, 17.51, -64, 0, Math.PI / 2],
    ]
    islands = [
      new Island(new THREE.Vector3(58, -2.99, -40), new THREE.Vector3(24.1, 10, 16.1)),

      new Island(new THREE.Vector3(-52, 10.99, -64), new THREE.Vector3(16.1, 10, 24.1)),
      new Island(new THREE.Vector3(-42, 3.99, -14), new THREE.Vector3(16.1, 10, 16.1)),

      new Island(new THREE.Vector3(-22, 30.99, -104), new THREE.Vector3(16.1, 10, 24.1)),
      new Island(new THREE.Vector3(0, 30.99, -124), new THREE.Vector3(60.1, 10, 24.1)),
      new Island(new THREE.Vector3(22, 30.99, -104), new THREE.Vector3(16.1, 10, 24.1)),
    ]
    foliage = [
      new Water(new THREE.Vector3(-32, 7.55, -114), new THREE.Vector3(1, 50, 24.1)),
      new Water(new THREE.Vector3(-24, 32.05, -114), new THREE.Vector3(16, 1, 24.1)),
      new Water(new THREE.Vector3(-22, 32.05, -110), new THREE.Vector3(12, 1, 24.1)),
      new Foliage('tree', new THREE.Vector3(-26, 32, -130)),
      new Foliage('tree', new THREE.Vector3(26, 32, -120)),
      new Foliage('bushgroup', new THREE.Vector3(-14, 33, -120), 10, 5, 24),
    ]
    Parkour.levels.push(new Level(9, obstacles, islands, foliage, new THREE.Vector3(58, 0, -40), 40))

    // Distance between jumps changed from 15 to 12
    obstacles = [
      [ParkourPieces.startingPlatform, 58, -2, -40],
      // [ParkourPieces.normal2, 46, -2, -40],
      [ParkourPieces.normal2, 34, -2, -40],
      [ParkourPieces.normal2, 34, -2, -52],
      [ParkourPieces.normal2, 34, -2, -64],
      [ParkourPieces.normal2, 46, 1.5, -64],
      [ParkourPieces.normal2, 58, 5, -64],
      [ParkourPieces.normal2, 58, 8.5, -52],
      [ParkourPieces.normal2, 58, 12, -40],
      [ParkourPieces.normal2, 46, 15.5, -40],
      [ParkourPieces.normal2, 34, 19, -40],
      [ParkourPieces.normal2, 34, 22.5, -52],
      [ParkourPieces.normal2, 34, 26, -64],
      [ParkourPieces.normal2, 46, 29.5, -64],
      [ParkourPieces.normal2, 58, 33, -64],
      [ParkourPieces.normal2, 58, 36.5, -52],
      [ParkourPieces.normal2, 58, 40, -40],
      [ParkourPieces.normal2, 46, 43.5, -40],
      [ParkourPieces.normal2, 34, 47, -40],
      [ParkourPieces.normal2, 34, 50.5, -52],
      [ParkourPieces.normal2, 34, 54, -64],
      [ParkourPieces.normal2, 46, 57.5, -64],
      [ParkourPieces.normal2, 58, 61, -64],
      [ParkourPieces.normal2, 58, 64.5, -52],
      [ParkourPieces.normal2, 58, 68, -40],
      [ParkourPieces.normal2, 46, 71.5, -40],
      [ParkourPieces.normal2, 34, 75, -40],
      [ParkourPieces.normal2, 34, 78.5, -52],
      [ParkourPieces.normal2, 34, 82, -64],
      [ParkourPieces.normal2, 34, 82, -78],
      [ParkourPieces.normal2, 34, 82, -92],
      [ParkourPieces.long2, 34, 82, -106],
      [ParkourPieces.long2, 34, 82, -126],
      [ParkourPieces.long2, 34, 82, -146],
      [ParkourPieces.normal2, 34, 82, -160],
      [ParkourPieces.long2, 20, 82, -160, 0, Math.PI / 2],
      [ParkourPieces.long2, 0, 82, -160, 0, Math.PI / 2],
      [ParkourPieces.normal2, -14, 82, -160],
      [ParkourPieces.long1, -26, 82, -160],
      [ParkourPieces.long1, -34, 86, -160],
      [ParkourPieces.long1, -26, 90, -160],
      [ParkourPieces.long1, -34, 94, -160],
      [ParkourPieces.long1, -26, 98, -160],
      [ParkourPieces.long1, -34, 102, -160],
      [ParkourPieces.long1, -26, 106, -160],
      [ParkourPieces.long1, -34, 110, -160],
      [ParkourPieces.long1, -26, 114, -160],
      [ParkourPieces.normal2, -14, 114, -160],
      [ParkourPieces.long2, 0, 114, -160, 0, Math.PI / 2],
      [ParkourPieces.normal2, 14, 114, -160, 0, Math.PI / 2],
      [ParkourPieces.normal2, 14, 114, -144, 0, Math.PI / 2],
      [ParkourPieces.normal1, 14, 117, -132],
      [ParkourPieces.normal1, 14, 119.5, -122],
      [ParkourPieces.normal1, 14, 122, -112],
      [ParkourPieces.normal1, 14, 124.5, -102],
      [ParkourPieces.normal1, 14, 127, -92],
      [ParkourPieces.normal1, 14, 129.5, -82],
      [ParkourPieces.normal1, 14, 132, -72],
      [ParkourPieces.normal1, 14, 134.5, -62],
      [ParkourPieces.normal2, 14, 137.5, -50],
      [ParkourPieces.normal2, 26, 139, -50],
      [ParkourPieces.normal2, 26, 141, -38],
      [ParkourPieces.normal2, 14, 143, -38],
      [ParkourPieces.normal2, 2, 146.5, -38],
      [ParkourPieces.normal2, -10, 150, -38],
      [ParkourPieces.normal2, -10, 153.5, -48],
      [ParkourPieces.normal2, -10, 157, -60],
      [ParkourPieces.normal2, 2, 160.5, -60],
      [ParkourPieces.normal2, 14, 164, -60],
      [ParkourPieces.normal2, 14, 167.5, -48],
      [ParkourPieces.normal2, 14, 171, -38],
      [ParkourPieces.normal2, 2, 174.5, -38],
      [ParkourPieces.normal2, -10, 178, -38],
      [ParkourPieces.normal2, -22, 178, -38],
      [ParkourPieces.normal2, -34, 178, -38],
      [ParkourPieces.normal2, -46, 178, -38],
      [ParkourPieces.normal2, -58, 178, -38],
      [ParkourPieces.normal2, -70, 178, -38],
      [ParkourPieces.long1, -80, 182, -38],
      [ParkourPieces.long1, -72, 186, -38],
      [ParkourPieces.long1, -80, 190, -38],
      [ParkourPieces.long1, -72, 194, -38],
      [ParkourPieces.long1, -80, 198, -38],
      [ParkourPieces.long1, -72, 202, -38],
      [ParkourPieces.long1, -80, 206, -38],
      [ParkourPieces.long1, -72, 210, -38],
      [ParkourPieces.long1, -80, 214, -38],
      [ParkourPieces.long1, -72, 218, -38],
      [ParkourPieces.long1, -80, 222, -38],
      [ParkourPieces.long1, -72, 226, -38],
      [ParkourPieces.long1, -80, 230, -38],
      [ParkourPieces.long1, -72, 234, -38],
      [ParkourPieces.long1, -64, 238, -38],
      [ParkourPieces.long1, -56, 238, -38],
      [ParkourPieces.long2, -40, 238, -38, 0, Math.PI / 2],
      [ParkourPieces.long1, -22, 241, -38, 0, Math.PI / 2],
      [ParkourPieces.long1, -8, 244, -38, 0, Math.PI / 2],
      [ParkourPieces.long1, 6, 247, -38, 0, Math.PI / 2],
      [ParkourPieces.long3, 22, 246.5, -38, 0, Math.PI / 2],
      [ParkourPieces.platform, 42, 247, -38, 0, Math.PI / 2],
      [ParkourPieces.checkPoint, 32, 253.5, -38, 0, Math.PI / 2],
    ];
    islands = [
      new Island(new THREE.Vector3(58, -3, -40), new THREE.Vector3(24.1, 10, 16.1)),
    ];
    foliage = [];

    Parkour.levels.push(new Level(10, obstacles, islands, foliage, new THREE.Vector3(50, 0, -40), 130, new THREE.Vector3(-60, 140, 100), new THREE.Vector3(-0.2326268335272262, -0.5865329289962137, -0.13038356028309644)))

    for(let i = 0; i < Parkour.levels.length; i++) {
      Parkour.levels[i].renderParkour()
    }
  }

/**
  * checks collision between the player and all jumps in the current and previous level
  * if the object is a checkpoint, the player will move to the next level
  * if its a normal jump, it sets the active platform the player is on to the platform that is being collided with
  * if the player is colliding with multiple platforms, it will get the one furthest into the parkour
  * also checks collision if the player is jumping over a platform by just checking for x and z axis
  * 
  * @param player is the player object that is being checked for collision
  */
  public checkCollision(player: Player, players: Player[] = []): void {
    player.onGround = false;
    let foundObject: { index: number; object: Obstacle } | null = { index: null, object: null };
    let current: Obstacle = null;
    let next: Obstacle = null;
    
    const activeLevel: Level = Parkour.levels[Parkour.activeLevel]
    const activeIndex: number = Parkour.levels.indexOf(activeLevel)
    const collidingFinishline = activeLevel.finishLine.boundingBox.intersectsBox(player.boundingBox)
  
    // if the player finishes:
    // - the player finished flag gets sets to true (used to track the percentage of finished players)
    // - the mesh gets updated and becomes green to indicate player has reached it
    // - stats get updated for bar graph
    if (collidingFinishline && !player.finished) {
      player.finished = true
      activeLevel.finishLine.mesh.material = ParkourPieces.checkPointActive;
      if (Statistics.checkpointsReached[activeIndex]) {
        Statistics.checkpointsReached[activeIndex] = players.filter(p => p.finished).length;
      } else {
        Statistics.checkpointsReached[activeIndex] = 1
      }
    }

    activeLevel.pieces.forEach((piece, pieceIndex) => {
      const pieceTopY = piece.boundingBox.max.y;
      const playerMinY = player.boundingBox.min.y;

      if (piece.boundingBox.intersectsBox(player.boundingBox) && playerMinY >= pieceTopY - 0.1) {
        player.playerBody.angularVelocity.x *= 0.5;
        player.playerBody.angularVelocity.y *= 0.5;
        player.playerBody.angularVelocity.z *= 0.5;

        player.playerBody.velocity.y = 0;
        player.playerBody.position.y = pieceTopY + player.boundingBox.getSize(new THREE.Vector3()).y / 2;
        player.playerBody.quaternion.y = 0
        player.onGround = true;

        foundObject = { index: pieceIndex, object: piece };
      } else if (player.boundingBox.max.x >= piece.boundingBox.min.x && player.boundingBox.min.x <= piece.boundingBox.max.x &&
        player.boundingBox.max.z >= piece.boundingBox.min.z && player.boundingBox.min.z <= piece.boundingBox.max.z &&
        player.boundingBox.min.y >= piece.boundingBox.max.y && player.boundingBox.max.y <= piece.boundingBox.max.y + 2) {
        foundObject = { index: pieceIndex, object: piece };
      }
    })
    if (foundObject.index != null) {
      if (activeLevel.pieces.length - 1 > foundObject.index) {
        next = activeLevel.pieces[foundObject.index + 1]
      } else {
        return ;
      }
      
      player.highestObstacleIndex = activeLevel.pieces.indexOf(foundObject.object)
      player.inputLevels.current = foundObject.object;
      player.inputLevels.next = next
    }

    player.inputLevels.current.mesh.material = ParkourPieces.activeMaterial1;
    player.inputLevels.next.mesh.material = ParkourPieces.activeMaterial2;
  }
}