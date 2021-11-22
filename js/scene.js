import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Stats from 'three/examples/jsm/libs/stats.module';
const michelineBusteUrl = new URL('/image/michelineBuste.glb', import.meta.url);
THREE.Cache.enabled = true;

export function createScene(container){

  // Scene
  const scene = new THREE.Scene();
  // Render
  const renderer = new THREE.WebGLRenderer({
    // precision: "highp",
    // gammaOutput: true,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize( 256, 256 );
  renderer.domElement.style.border = '1px solid black';
  renderer.domElement.style['border-radius'] = '50%';
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // const generator = new THREE.PMREMGenerator( renderer );
  // const rt = generator.fromScene( scene );
  // scene.environment = rt.texture;
  // renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.PCFShadowMap;
  container.appendChild(renderer.domElement);
  // Camera
  const camera = new THREE.PerspectiveCamera( 15, 1, 0.1, 500 );
  camera.position.set( 0, 0.3, 1.5 );
  camera.lookAt( 0, 0, 0 );
  scene.add( camera );
  camera.updateProjectionMatrix();

  // Control
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 0.7;
  controls.maxDistance = 2;
  controls.maxPolarAngle = Math.PI/1.8;
  controls.minPolarAngle = Math.PI/6;
  controls.autoRotate = true;
  controls.enablePan = false;

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

  // Lights
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
  const loadingManager = new THREE.LoadingManager( () => {
    const loadingScreen = document.getElementById( 'loading-screen' );
    loadingScreen.classList.add( 'fade-out' );
    loadingScreen.addEventListener( 'transitionend', (event) => {
      const element = event.target;
      element.remove();
    });
  });
  const loader = new GLTFLoader(loadingManager);
  loader.load(
    michelineBusteUrl.pathname,
    function ( gltf ) {
      gltf.scene.position.set(0, -0.07, 0 );
      gltf.scene.traverse( (child) => {
        if ((child).isMesh) {
          const m = child
          m.receiveShadow = true
          m.castShadow = true;
        }
      })
      scene.add( gltf.scene );
      followMouse(gltf);
      animate();
    },
    function ( xhr ) {
      // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function ( error ) {

      console.log( 'An error happened', error);

    }
  );

  // Stats
  const stats = Stats()
  document.body.appendChild(stats.dom)

  controls.update();
  stats.update();
  renderer.render( scene, camera );

  // Render loop
  function animate() {

    requestAnimationFrame( animate );
    controls.update();
    stats.update();
    renderer.render( scene, camera );

  }

  function followMouse(gltf){
    // gltf.scene.children[3].children[1].children[5].rotateX(-Math.PI / 6);
    // const rotation = new THREE.Euler( 0, 0, 0, 'XYZ' );
    // const rotation = new THREE.Matrix4().makeRotationY(Math.PI/8);
    // gltf.scene.children[3].children[1].children[5].applyMatrix(rotation);

    // gltf.scene.children[3].children[1].children[5].lookAt(camera.position);
    function onMouseMove(event){

      // var mousePos = new THREE.Vector3();
      // mousePos.set(
      //   (event.clientX/window.innerWidth)*2 - 1,
      //   -(event.clientY/window.innerHeight)*2 + 1,
      //   0);
      // console.log(event.clientX, event.clientY)
      // console.log(document.body.clientHeight, event.clientY)
      // console.log(gltf.scene.children[3].children[1])
      // // console.log(document.body.clientHeight / event.clientY);
      // if(event.clientY > 0){
      // }
      const offsetY = event.clientY / window.innerHeight || 0;
      // const offsetX = event.clientX / window.innerWidth;
      // console.log('offsetY', offsetY)
      // console.log(gltf.scene.children[3].children[1].children[5])
      // gltf.scene.children[3].children[1].children[5].rotateX(Math.PI / (12 * offsetY - 6));
      // gltf.scene.children[3].children[1].children[5].rotateX(0, 0, 0);
      // gltf.scene.children[3].children[1].children[5].rotation.setFromVector3(new THREE.Vector3((Math.PI / 20) * (offsetY * 8 - 4), (Math.PI / 20) * (offsetX * 8 - 4), -(Math.PI / 20) * (offsetX * 8 - 4)) );
      gltf.scene.children[3].children[1].children[5].lookAt(new THREE.Vector3(0, -8 * (offsetY - 0.5), 10))

      // const rotation = new THREE.Euler( 60 * offsetY - 45, 0, 0, 'XYZ' );
      //
      // // rotationMatrix.lookAt( target.position, mesh.position, mesh.up );
      // // targetRotation.setFromRotationMatrix( rotationMatrix );
      // gltf.scene.children[3].children[1].children[5].rotation.set(rotation);
    }
    document.body.addEventListener('mousemove',  onMouseMove );
    // document.body.addEventListener('touchmove',  onMouseMove );
  }
}
