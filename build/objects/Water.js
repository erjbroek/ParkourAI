import { RenderObject } from './RenderObject.js';
import DecorationMesh from './DecorationMesh.js';
import MainCanvas from '../setup/MainCanvas.js';
export default class Water extends RenderObject {
    constructor(position, dimensions) {
        super();
        this.position = position;
        this.dimensions = dimensions;
        this.mesh = DecorationMesh.water(this.position, this.dimensions);
    }
    render(position) {
        this.mesh.position.add(position);
        MainCanvas.scene.add(this.mesh);
    }
}
