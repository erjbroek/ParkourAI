import MainCanvas from '../setup/MainCanvas.js';
import DecorationMesh from './DecorationMesh.js';
import { RenderObject } from './RenderObject.js';
export default class Foliage extends RenderObject {
    constructor(type, position, bushAmount = 0, xSpread = 6, zSpread = 6) {
        super();
        this.position = position;
        switch (type) {
            case 'tree':
                this.mesh = DecorationMesh.tree.clone();
                this.mesh.position.set(this.position.x, position.y + 3.5, position.z);
                break;
            case 'bush':
                this.mesh = DecorationMesh.bush;
                this.mesh.position.set(this.position.x, position.y + 2.5, position.z);
                break;
            case 'bushgroup':
                this.mesh = DecorationMesh.createBushGroup(bushAmount, xSpread, zSpread);
                this.mesh.position.set(this.position.x, position.y - 1.5, position.z);
                break;
            default:
                throw new Error(`Unknown type: ${type}`);
        }
    }
    render(position) {
        this.mesh.position.add(position);
        MainCanvas.scene.add(this.mesh);
    }
}
