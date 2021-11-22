import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Stats from 'three/examples/jsm/libs/stats.module';
const michelineBusteUrl = new URL('/image/michelineBusteRigged.glb', import.meta.url);
THREE.Cache.enabled = true;

export function createScene(container){

  let mixer;
  let eyeBlinking;
  let neck;
  let neck1;
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
  camera.position.set( 0, 1, 5);
  camera.lookAt( 0, 0, 0 );
  scene.add( camera );
  camera.updateProjectionMatrix();

  // Control
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 2;
  controls.maxDistance = 6;
  controls.maxPolarAngle = Math.PI/1.8;
  controls.minPolarAngle = Math.PI/6;
  // controls.autoRotate = true;
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
      gltf.scene.position.set(0, -0.3, 0 );
      gltf.scene.traverse( (child) => {
        if (child.isMesh) {
          const m = child
          m.receiveShadow = true
          m.castShadow = true;
        }
        if (child.isBone && child.name === 'DEF-neck') {
          neck = child;
        }
        if (child.isBone && child.name === 'ORG-neck') {
          neck1 = child;
        }
      })
      mixer = new THREE.AnimationMixer(gltf.scene);

      const eyeBlinkingAnim = THREE.AnimationClip.findByName(gltf.animations, 'eyeBlinking');
      eyeBlinking = mixer.clipAction(eyeBlinkingAnim);
      eyeBlinking.setLoop(THREE.LoopOnce);
      eyeBlinking.clampWhenFinished = true;
      eyeBlinking.enable = true;
      eyeBlinking.play().reset();

      // const testAnim = THREE.AnimationClip.findByName(gltf.animations, 'test');
      // const test = mixer.clipAction(testAnim);
      // test.clampWhenFinished = true;
      // test.enable = true;
      // test.play();
      scene.add(gltf.scene);
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
  const clock = new THREE.Clock()

  // Render loop
  function animate() {

    if (mixer) {
      mixer.update(clock.getDelta());
    }
    controls.update();
    renderer.render( scene, camera );
    stats.update();
    requestAnimationFrame(animate);
  }

  function followMouse(gltf){
    // gltf.scene.children[3].children[1].children[5].rotateX(-Math.PI / 6);
    // const rotation = new THREE.Euler( 0, 0, 0, 'XYZ' );
    // const rotation = new THREE.Matrix4().makeRotationY(Math.PI/8);
    // gltf.scene.children[3].children[1].children[5].applyMatrix(rotation);

    // gltf.scene.children[3].children[1].children[5].lookAt(camera.position);
    function onMouseMove(x, y){

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
      const offsetY = y / window.innerHeight;
      const offsetX = x / window.innerWidth;
      if(!offsetX || !offsetY){
        return
      }
      // console.log('offsetY', offsetY)
      console.log(gltf.scene)
      // gltf.scene.children[3].children[1].children[5].rotateX(Math.PI / (12 * offsetY - 6));
      // gltf.scene.children[3].children[1].children[5].rotateX(0, 0, 0);
      // gltf.scene.children[3].children[1].children[5].rotation.setFromVector3(new THREE.Vector3((Math.PI / 20) * (offsetY * 8 - 4), (Math.PI / 20) * (offsetX * 8 - 4), -(Math.PI / 20) * (offsetX * 8 - 4)) );
     // debugger
      gltf.scene.children[4].children[0].children[0].lookAt(new THREE.Vector3(20 * (offsetX - 0.5) - 1, -6 * (offsetY - 0.5) - 5, 10))
      gltf.scene.children[4].children[0].children[1].lookAt(new THREE.Vector3(20 * (offsetX - 0.5) - 1, -6 * (offsetY - 0.5) - 3, 10))
      gltf.scene.children[4].children[0].children[2].children[0].lookAt(new THREE.Vector3(20 * (offsetX - 0.5) - 1, -6 * (offsetY - 0.5) - 3, 10))
      gltf.scene.children[4].children[0].children[3].lookAt(new THREE.Vector3(20 * (offsetX - 0.5) - 1, -6 * (offsetY - 0.5) - 3, 10))
      // gltf.scene.children[4].children[0].children[3].children[0].lookAt(new THREE.Vector3(20 * (offsetX - 0.5) - 1, -6 * (offsetY - 0.5) - 3, 10))

      // const rotation = new THREE.Euler( 60 * offsetY - 45, 0, 0, 'XYZ' );
      //
      // // rotationMatrix.lookAt( target.position, mesh.position, mesh.up );
      // // targetRotation.setFromRotationMatrix( rotationMatrix );
      // gltf.scene.children[3].children[1].children[5].rotation.set(rotation);
      // const mousecoords = getMousePos(event);
      // if (neck) {
      //
      //   // moveJoint(mousecoords, neck, 10);
      //   moveJoint(mousecoords, neck1, 10);
      // }
    }
    function getMousePos(e) {
      return { x: e.clientX, y: e.clientY };
    }
    function moveJoint(mouse, joint, degreeLimit) {
      let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
      joint.rotation.y = THREE.Math.degToRad(degrees.x);
      // joint.rotation.x = THREE.Math.degToRad(degrees.y);
    }
    function getMouseDegrees(x, y, degreeLimit) {
      let dx = 0,
        dy = 0,
        xdiff,
        xPercentage,
        ydiff,
        yPercentage;

      let w = { x: window.innerWidth, y: window.innerHeight };

      // Left (Rotates neck left between 0 and -degreeLimit)
      // 1. If cursor is in the left half of screen
      if (x <= w.x / 2) {
        // 2. Get the difference between middle of screen and cursor position
        xdiff = w.x / 2 - x;
        // 3. Find the percentage of that difference (percentage toward edge of screen)
        xPercentage = (xdiff / (w.x / 2)) * 100;
        // 4. Convert that to a percentage of the maximum rotation we allow for the neck
        dx = ((degreeLimit * xPercentage) / 100) * -1;
      }

      // Right (Rotates neck right between 0 and degreeLimit)
      if (x >= w.x / 2) {
        xdiff = x - w.x / 2;
        xPercentage = (xdiff / (w.x / 2)) * 100;
        dx = (degreeLimit * xPercentage) / 100;
      }
      // Up (Rotates neck up between 0 and -degreeLimit)
      if (y <= w.y / 2) {
        ydiff = w.y / 2 - y;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        // Note that I cut degreeLimit in half when she looks up
        dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
      }
      // Down (Rotates neck down between 0 and degreeLimit)
      if (y >= w.y / 2) {
        ydiff = y - w.y / 2;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        dy = (degreeLimit * yPercentage) / 100;
      }
      return { x: dx, y: dy };
    }

    document.body.addEventListener('mousemove',  (event) => onMouseMove(event.clientX, event.clientY) );
    document.body.addEventListener('touchmove',  (event) => onMouseMove(event.touches[0].clientX, event.touches[0].clientY));
  }
  document.addEventListener('click',  () => {
    if(eyeBlinking){
      console.log('click')
      // eyeBlinking.setLoop(THREE.LoopOnce);
      // eyeBlinking.clampWhenFinished = true;
      // eyeBlinking.enable = true;
      eyeBlinking.play().reset();
    }
  });
}
