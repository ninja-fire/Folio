import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as TWEEN from 'three/examples/jsm/libs/tween.module.min'
import Stats from 'three/examples/jsm/libs/stats.module';
const michelineBusteUrl = new URL('/image/michelineBusteRigged.glb', import.meta.url);
THREE.Cache.enabled = true;
export class Scene{

  constructor(container){
    this.container = container;
    this.initScene();
    this.initRender();
    this.initCamera();
    this.initControl();
    this.initLights();

    // this.initStats();

    this.controls.update();
    this.clock = new THREE.Clock();
    this.renderer.render(this.scene, this.camera);
    this.loadGltf();
  }

  initStats(){
    this.stats = Stats();
    this.stats.update();
    document.body.appendChild(this.stats.dom);
  }

  initScene(){
    this.scene = new THREE.Scene();
  }

  initRender(){
    this.renderer = new THREE.WebGLRenderer({
      // precision: "highp",
      // gammaOutput: true,
      alpha: true,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize( 256, 256 );
    this.renderer.domElement.style.border = '1px solid black';
    this.renderer.domElement.style['border-radius'] = '50%';
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // const generator = new THREE.PMREMGenerator( renderer );
    // const rt = generator.fromScene( scene );
    // scene.environment = rt.texture;
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFShadowMap;
    this.container.appendChild(this.renderer.domElement);
  }

  initCamera(){
    this.camera = new THREE.PerspectiveCamera( 15, 1, 0.1, 500 );
    this.camera.position.set( 5, 1, 0);
    this.camera.lookAt( 0, 0, 0 );
    this.scene.add(this.camera);
    this.camera.updateProjectionMatrix();
  }

  initControl(){
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 2;
    this.controls.maxDistance = 6;
    this.controls.maxPolarAngle = Math.PI/1.8;
    this.controls.minPolarAngle = Math.PI/6;
    this.controls.autoRotate = true;
    this.controls.enablePan = false;
  }

  initLights(){

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
    // const object = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( 0x000000 ) );
    // const box = new THREE.BoxHelper( object, 0x000000 );
    // this.scene.add( box );

    // Lights
    const directionalLightFront = new THREE.DirectionalLight( 0xd1d1d1, 2.5 );
    directionalLightFront.position.set(-5, 1, 50)
    this.scene.add(directionalLightFront);

    const directionalLightBack = new THREE.DirectionalLight( 0xd3d3d3, 1.5 );
    directionalLightBack.position.set(5, 1, -50)
    this.scene.add(directionalLightBack);

    const directionalLightLeft = new THREE.DirectionalLight( 0xd3d3d3, 1 );
    directionalLightLeft.position.set(30, 10, 10)
    this.scene.add(directionalLightLeft);

    const directionalLightRight = new THREE.DirectionalLight( 0xd3d3d3, 1 );
    directionalLightRight.position.set(-30, 10, 0)
    this.scene.add(directionalLightRight);
  }

  loadGltf(){
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
      michelineBusteUrl.pathname, ( gltf ) => {
        gltf.scene.position.set(0, -0.3, 0 );
        gltf.scene.traverse( (child) => {
          if (child.isMesh) {
            child.receiveShadow = true
            child.castShadow = true;
          }
        })
        this.mixer = new THREE.AnimationMixer(gltf.scene);

        // const testAnim = THREE.AnimationClip.findByName(gltf.animations, 'test');
        // this.test = this.mixer.clipAction(testAnim);
        // this.test.clampWhenFinished = true;
        // // this.test.enable = true;
        // this.test.play();

        const eyeBlinkingAnim = THREE.AnimationClip.findByName(gltf.animations, 'eyeBlinking');
        this.eyeBlinking = this.mixer.clipAction(eyeBlinkingAnim);
        this.eyeBlinking.setLoop(THREE.LoopOnce);
        this.eyeBlinking.clampWhenFinished = true;

        this.scene.add(gltf.scene);
        this.followMouse(gltf);
        this.initEyesBlinking();
        this.update();
      },
      function ( xhr ) {
        // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      function ( error ) {

        console.log( 'An error happened', error);

      }
    );
  }

  update(){
    requestAnimationFrame(this.update.bind(this));
    this.renderer.render(this.scene, this.camera);
    if (this.mixer) {
      this.mixer.update(this.clock.getDelta());
    }
    this.controls.update();
    TWEEN.update();
    if(this.stats){
      this.stats.update();
    }
  }

  followMouse(gltf){

    const onMouseMove = (x, y) => {
      const offsetY = y / window.innerHeight;
      const offsetX = x / window.innerWidth;
      if(!offsetX || !offsetY){
        return
      }
      console.log(gltf.scene.children[3].children[0].children[0].children[0].children[0])
      const bones = [
        gltf.scene.children[3].children[0].children[0].children[0].children[0].children[0],
        // gltf.scene.children[3].children[0].children[1],
        gltf.scene.children[3].children[0].children[2].children[0],
        // gltf.scene.children[3].children[0].children[3],
      ]

      bones.forEach(bone => {
        const startRotation = bone.quaternion.clone();
        bone.lookAt(new THREE.Vector3(20 * (offsetX - 0.5) - 1, -8 * (offsetY - 0.5), 10));
        const endRotation = bone.quaternion.clone();
        bone.quaternion.copy(startRotation);
        // bone.quaternion.set(endRotation.x, endRotation.y, endRotation.z, endRotation.w);
        const tweenRotation = new TWEEN.Tween(bone.quaternion).to(endRotation, 200).start().onComplete( () => {
          bone.quaternion.copy(endRotation); // to be exact
        } );
        //          .easing(TWEEN.Easing.Elastic.Out)
        // if(this.tt){
        //   this.tt.chain(tweenRotation);
        // } else {
        //   this.tt = tweenRotation;
        // }

        // bone.lookAt(new THREE.Vector3(20 * (offsetX - 0.5) - 1, -6 * (offsetY - 0.5) - 5, 10))
      })
    }

    document.body.addEventListener('mousemove',  (event) => onMouseMove(event.clientX, event.clientY) );
    document.body.addEventListener('touchmove',  (event) => onMouseMove(event.touches[0].clientX, event.touches[0].clientY));

  }

  initEyesBlinking(){
    document.addEventListener('click',  () => {
      if(this.eyeBlinking){
        this.eyeBlinking.play().reset();
      }
    });
  }
}
