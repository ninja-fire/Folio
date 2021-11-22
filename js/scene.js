import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
const michelineBusteUrl = new URL('/image/michelineBuste.glb', import.meta.url);

export function createScene(container){

  // Scene
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({
    precision: "highp",
    alpha: true,
    antialias: true,
  });
  renderer.setSize( 256, 256 );
  renderer.domElement.style.border = '1px solid black';
  renderer.domElement.style['border-radius'] = '50%';
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const generator = new THREE.PMREMGenerator( renderer );
  const rt = generator.fromScene( scene );
  scene.environment = rt.texture;
  container.appendChild( renderer.domElement );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;//THREE.BasicShadowMap;
  // Camera
  const camera = new THREE.PerspectiveCamera( 15, 1, 0.1, 1000 );
  camera.position.set( 0, 0.3, 1.5 );
  camera.lookAt( 0, 0, 0 );
  // Control
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 0.7;
  controls.maxDistance = 2;
  controls.maxPolarAngle = Math.PI/1.8;
  controls.minPolarAngle = Math.PI/6;
  controls.autoRotate = true;

  // Light
  // const light = new THREE.HemisphereLight( 0x3D4143, 0x3D4143, 3 );
  // scene.add( light );
  // const ambientLight = new THREE.HemisphereLight(
  //   'white', // bright sky color
  //   'darkslategrey', // dim ground color
  //   2, // intensity
  // );
  // scene.add(ambientLight);
  // const light = new THREE.AmbientLight( 0xd3d3d3, 5 );
  // scene.add(light);

  // Box
  // const geometry = new THREE.BoxGeometry();
  // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  // const cube = new THREE.Mesh( geometry, material );
  // cube.position.set( 0, 0, -1 );
  // scene.add( cube );

  // Debug box
  // const sphere = new THREE.SphereGeometry();
  // const object = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( 0xff0000 ) );
  // const box = new THREE.BoxHelper( object, 0xffff00 );
  // scene.add( box );

  const directionalLightFront = new THREE.DirectionalLight( 0xd1d1d1, 2.5 );
  directionalLightFront.position.set(-5, 1, 50)
  scene.add(directionalLightFront);

  const directionalLightBack = new THREE.DirectionalLight( 0xd3d3d3, 1.5 );
  directionalLightBack.position.set(5, 1, -50)
  scene.add(directionalLightBack);

  const directionalLightLeft = new THREE.DirectionalLight( 0xd3d3d3, 1 );
  directionalLightLeft.position.set(30, 10, 10)
  scene.add(directionalLightLeft);

  const directionalLightRight = new THREE.DirectionalLight( 0xd3d3d3, 1 );
  directionalLightRight.position.set(-30, 10, 0)
  scene.add(directionalLightRight);

  // Load gltf
  const loader = new GLTFLoader();
  loader.load(
    michelineBusteUrl.pathname,
    function ( gltf ) {
      gltf.scene.position.set(0, -0.07, 0 );
      scene.add( gltf.scene );
      renderer.render( scene, camera );
    },
    function ( xhr ) {
      // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function ( error ) {

      console.log( 'An error happened', error);

    }
  );

  // Render
  renderer.render( scene, camera );
  controls.update();

  function animate() {

    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );

  }
  animate();
}
