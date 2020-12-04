import { ExpoWebGLRenderingContext } from "expo-gl";
import { Renderer, THREE } from "expo-three";

export class Game {
  constructor(private gl: ExpoWebGLRenderingContext) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // var geometry = new THREE.BoxGeometry();
    // var cube = new THREE.Mesh(geometry, material);

    const object = new THREE.Mesh(
      new THREE.CircleBufferGeometry(0.5, 50, 0, Math.PI * 2),
      material
    );
    // scene.add(cube);
    scene.add(object);

    camera.position.z = 5;
    renderer.render(scene, camera);
    gl.endFrameEXP();
  }

  play() {}
}

const createCamera = (aspect: number) => {};
