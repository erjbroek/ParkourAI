import * as THREE from 'three';
import MainCanvas from './MainCanvas.js';
export default class CreateBackground {
    /**
   * Create a gradient material for the sphere background.
   *
   * @param {THREE.Color} topColor Color for the top of the sphere.
   * @param {THREE.Color} bottomColor Color for the bottom of the sphere.
   * @returns {THREE.ShaderMaterial} A shader material with the gradient applied.
   */
    static createGradientMaterial(topColor, bottomColor) {
        const vertexShader = `
    varying vec3 vWorldPosition;

    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
        const fragmentShader = `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    varying vec3 vWorldPosition;

    void main() {
      float factor = (vWorldPosition.y + 0.5) * 0.00075 + 0.6;
      vec3 color = mix(topColor, bottomColor, factor);

      gl_FragColor = vec4(color, 1.0); // Output the final color
    }
  `;
        return new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                topColor: { value: new THREE.Color(topColor) },
                bottomColor: { value: new THREE.Color(bottomColor) },
            },
            side: THREE.BackSide,
            precision: 'highp',
        });
    }
    /**
     * Add a large background sphere with the gradient material.
     */
    static addBackgroundSphere() {
        const radius = 2000;
        const geometry = new THREE.SphereGeometry(radius, 64, 64);
        const gradientMaterial = this.createGradientMaterial("#f1fff1", "#12d3ff");
        const backgroundSphere = new THREE.Mesh(geometry, gradientMaterial);
        MainCanvas.scene.add(backgroundSphere);
    }
}
