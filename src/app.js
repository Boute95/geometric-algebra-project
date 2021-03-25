import './style.scss'

import * as Algebra from 'ganja.js';
import * as Stats   from 'stats.js';
import * as THREE   from 'three';


let camera, scene, renderer;
let geometry, material, mesh;
const mouse     = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let stats       = [ new Stats(), new Stats() ];

window.addEventListener('mousemove', throttle(onMouseMove, 10), false);
init();


////////////////////////////////////////////////////////////////////////////////
function init() {

  // ThreeJS
  camera = new THREE.PerspectiveCamera(
      70, window.innerWidth / window.innerHeight, 0.01, 10);
  camera.position.z = 1;
  scene             = new THREE.Scene();
  geometry          = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  material          = new THREE.MeshNormalMaterial();
  mesh              = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  renderer = new THREE.WebGLRenderer({antialias : true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(render);
  document.body.appendChild(renderer.domElement);

  // Stats
  stats[0].showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  stats[1].showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
  stats.forEach(e => { document.body.appendChild(e.dom); });
  stats[1].domElement.style.left = '80px';
}


////////////////////////////////////////////////////////////////////////////////
function render(time) {
  stats.forEach(s => { s.begin(); });

  // Cube rotation
  mesh.rotation.x = time / 2000;
  mesh.rotation.y = time / 1000;
  renderer.render(scene, camera);

  // Ray casting
  raycaster.setFromCamera(mouse, camera);

  stats.forEach(s => { s.end(); });
}


////////////////////////////////////////////////////////////////////////////////
function onMouseMove(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  checkRaycasting();
}


////////////////////////////////////////////////////////////////////////////////
function checkRaycasting() {
  let vertexPositionArray = mesh.geometry.attributes.position.array;
  for (let i = 8; i < mesh.geometry.attributes.position.count; i += 3) {
    let point1    = new THREE.Vector3(vertexPositionArray[i - 8],
                                   vertexPositionArray[i - 7],
                                   vertexPositionArray[i - 6]);
    let point2    = new THREE.Vector3(vertexPositionArray[i - 5],
                                   vertexPositionArray[i - 4],
                                   vertexPositionArray[i - 3]);
    let point3    = new THREE.Vector3(vertexPositionArray[i - 2],
                                   vertexPositionArray[i - 1],
                                   vertexPositionArray[i - 0]);
    var rayPoint1 = raycaster.ray.origin;
    var rayPoint2 = new THREE.Vector3().addVectors(raycaster.ray.origin,
                                                   raycaster.ray.direction);

    let A = Algebra(3, 0, 1).inline(
        (point1, point2, point3, rayPoint1, rayPoint2) => {
          let point = (x, y, z) => !(1e0 + x * 1e1 + y * 1e2 + z * 1e3);
          let vertex1           = point(point1.x, point1.y, point1.z);
          let vertex2           = point(point2.x, point2.y, point2.z);
          let vertex3           = point(point3.x, point3.y, point3.z);
          let p1                = point(rayPoint1.x, rayPoint1.y, rayPoint1.z);
          let p2                = point(rayPoint2.x, rayPoint2.y, rayPoint2.z);
          let line = () => rayPoint1 & rayPoint2;
          let intersect = line ^ (vertex1 & vertex2 & vertex3);
          console.log(intersect)
        });
    A(point1, point2, point3, rayPoint1, rayPoint2);
  }
}


////////////////////////////////////////////////////////////////////////////////
function throttle(callback, wait, immediate = false) {
  let timeout     = null
  let initialCall = true

  return function() {
    const callNow = immediate && initialCall
    const next =
        () => {
          callback.apply(this, arguments)
          timeout = null
        }

    if (callNow) {
      initialCall = false
      next()
    }

    if (!timeout) {
      timeout = setTimeout(next, wait)
    }
  }
}
