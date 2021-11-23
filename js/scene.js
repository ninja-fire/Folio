import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { LuminosityShader } from 'three/examples/jsm/shaders/LuminosityShader.js';
import * as TWEEN from 'three/examples/jsm/libs/tween.module.min';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import {Vector2} from "three";
const michelineBusteUrl = new URL('/image/michelineBusteRigged.glb', import.meta.url);

export class Scene{

  constructor(container){
    this.size = 256;
    this.isDebug = process.env.NODE_ENV !== 'production';
    THREE.Cache.enabled = this.isDebug;
    this.container = container;
    this.initGui();
    this.initScene();
    this.initRender();
    this.initCamera();
    this.initControl();
    this.initLights();
    this.initStats();

    this.clock = new THREE.Clock();
    this.initPostProcessing();
    this.loadGltf();
  }

  initStats(){
    if(!this.isDebug){
      return false;
    }
    this.stats = Stats();
    this.stats.update();
    document.body.appendChild(this.stats.dom);
  }

  initGui(){
    if(!this.isDebug){
      return false;
    }
    this.gui = new GUI({ autoPlace: false });
    const guiContainer = document.getElementById('gui-container');
    guiContainer.appendChild(this.gui.domElement);
    const guiTest = this.gui.addFolder('test');
    guiTest.open();
  }

  initScene(){
    this.scene = new THREE.Scene();
    const conf = { color: 0xffffff };
    this.scene.background = new THREE.Color( conf.color );
    if(this.isDebug) {
      const guiScene = this.gui.addFolder('Scene');
      guiScene.addColor(conf, 'color').onChange( (colorValue) => {
        console.log(colorValue);
        this.scene.background = new THREE.Color(colorValue);
      });
      guiScene.open();
    }
  }

  initPostProcessing(){
    this.composer = new EffectComposer( this.renderer );
    const renderPass = new RenderPass( this.scene, this.camera );
    this.composer.addPass(renderPass);

    const unrealBloomPass = new UnrealBloomPass(new Vector2( this.size, this.size ), 0.28);
    const params = {
      bloomThreshold: 0,
      bloomRadius: 0
    };
    unrealBloomPass.threshold = params.bloomThreshold;
    unrealBloomPass.radius = params.bloomRadius;
    // unrealBloomPass.renderToScreen = true;
    this.composer.addPass(unrealBloomPass);
    if(this.isDebug) {
      const guiUnrealBloomPassFolder = this.gui.addFolder('UnrealBloomPass');
      guiUnrealBloomPassFolder.add(unrealBloomPass, 'strength').min(0).max(3);
      guiUnrealBloomPassFolder.add(params, 'bloomThreshold').min(0).max(3.00).onChange( (value) => unrealBloomPass.threshold = Number( value ));
      guiUnrealBloomPassFolder.add(params, 'bloomRadius').min(0).max(3).onChange( (value) => unrealBloomPass.radius = Number( value ));
      guiUnrealBloomPassFolder.open();
    }

    // const bloomPass = new BloomPass(
    //   1,
    //   25,
    //   1 ,
    //   this.size
    // );
    // this.composer.addPass(bloomPass);
    // if(this.isDebug) {
    //   const guiBloomPassFolder = this.gui.addFolder('BloomPassFolder');
    //   guiBloomPassFolder.add(bloomPass.copyUniforms[ 'opacity' ], 'value').min(0).max(5);
    //   guiBloomPassFolder.open();
    // }

    const filmPass = new FilmPass(
      0.15,   // noise intensity
      0.025,  // scanline intensity
      648,    // scanline count
      false,  // grayscale
    );
    filmPass.renderToScreen = true;
    this.composer.addPass(filmPass);
    if(this.isDebug) {
      const guiFilmPassFolder = this.gui.addFolder('FilmPass');
      guiFilmPassFolder.add(filmPass.uniforms.nIntensity, 'value').min(0).max(2);
      guiFilmPassFolder.add(filmPass.uniforms.sIntensity, 'value').min(0).max(2);
      guiFilmPassFolder.add(filmPass.uniforms.sCount, 'value').min(0).max(5000);
      guiFilmPassFolder.open();
    }

    this.composer.render();
  }

  initRender(){
    this.renderer = new THREE.WebGLRenderer({
      precision: "highp",
      // gammaOutput: true,
      alpha: true,
      antialias: true,
    });
    // this.renderer.setClearColor(0x262626, 1);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.size, this.size);
    this.renderer.domElement.style.border = '1px solid black';
    this.renderer.domElement.style['border-radius'] = '50%';
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const conf = { exposure: 1.15};
    this.renderer.toneMappingExposure = Math.pow(conf.exposure, 4.0);
    // this.renderer.toneMapping = THREE.ReinhardToneMapping;
    // const generator = new THREE.PMREMGenerator( renderer );
    // const rt = generator.fromScene( scene );
    // scene.environment = rt.texture;
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFShadowMap;
    this.container.appendChild(this.renderer.domElement);
    if(this.isDebug){
      const guiRender = this.gui.addFolder('Render');
      guiRender.add(conf, 'exposure').min(0.1).max(2).onChange( (value) => {
        this.renderer.toneMappingExposure = Math.pow( value, 4.0 );
      } );
      guiRender.open();
    }
  }

  initCamera(){
    this.camera = new THREE.PerspectiveCamera( 15, 1, 0.1, 500 );
    this.camera.position.set( 0, 1, 5);
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
    this.controls.update();
  }

  initLights(){
    const confLight = { color: 0xd1d1d1 };

    // const light = new THREE.HemisphereLight( 0x3D4143, 0x3D4143, 3 );
    // scene.add( light );
    // const ambientLight = new THREE.HemisphereLight(
    //   'white', // bright sky color
    //   'darkslategrey', // dim ground color
    //   2, // intensity
    // );
    // scene.add(ambientLight);
    const ambientLight = new THREE.AmbientLight( confLight.color, 0.15 );
    this.scene.add(ambientLight);

    // Box
    // const geometry = new THREE.BoxGeometry();
    // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    // const cube = new THREE.Mesh( geometry, material );
    // cube.position.set( 0, 0, -1 );
    // scene.add( cube );

    if(this.isDebug) {
      // Debug box
      const sphere = new THREE.SphereGeometry();
      const object = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( 0x000000 ) );
      const box = new THREE.BoxHelper( object, 0x000000 );
      this.scene.add( box );
    }

    // Lights
    const directionalLightFront = new THREE.DirectionalLight(confLight.color, 2.5 );
    directionalLightFront.position.set(-5, 1, 50)
    this.scene.add(directionalLightFront);

    const directionalLightBack = new THREE.DirectionalLight( confLight.color, 2.4 );
    directionalLightBack.position.set(5, 1, -50)
    this.scene.add(directionalLightBack);

    const directionalLightLeft = new THREE.DirectionalLight( confLight.color, 1.9 );
    directionalLightLeft.position.set(30, 10, 10)
    this.scene.add(directionalLightLeft);

    const directionalLightRight = new THREE.DirectionalLight(confLight.color, 1.3 );
    directionalLightRight.position.set(-30, 10, 0)
    this.scene.add(directionalLightRight);
    if(this.isDebug) {
      const guiLightsFolder = this.gui.addFolder('Lights');
      guiLightsFolder.open();
      guiLightsFolder.add(directionalLightFront, 'intensity').min(0).max(3);
      guiLightsFolder.add(directionalLightBack, 'intensity').min(0).max(3);
      guiLightsFolder.add(directionalLightLeft, 'intensity').min(0).max(3);
      guiLightsFolder.add(directionalLightRight, 'intensity').min(0).max(3);
      guiLightsFolder.add(ambientLight, 'intensity').min(0).max(3);
      guiLightsFolder.addColor(confLight, 'color').onChange((colorValue) => {
        directionalLightFront.color = new THREE.Color(colorValue);
      });
    }
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
        // testAnim.tracks.splice(6, 7);
        // this.test = this.mixer.clipAction(testAnim);
        // this.test.clampWhenFinished = true;
        // this.test.enable = true;
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
    const delta = this.clock.getDelta();
    if (this.mixer) {
      this.mixer.update(delta);
    }
    this.controls.update();
    TWEEN.update();
    if(this.stats){
      this.stats.update();
    }
    this.composer.render(delta);

  }

  followMouse(gltf){

    const onMouseMove = (x, y) => {
      const offsetY = y / window.innerHeight;
      const offsetX = x / window.innerWidth;
      if(!offsetX || !offsetY){
        return
      }
      const bones = [
        gltf.scene.children[4].children[0].children[0].children[0],
        // gltf.scene.children[4].children[0].children[1],
        gltf.scene.children[4].children[0].children[2].children[0],
        // gltf.scene.children[4].children[0].children[3],
      ]

      bones.forEach(bone => {
        const startRotation = bone.quaternion.clone();
        bone.lookAt(new THREE.Vector3(20 * (offsetX - 0.5) - 1, -8 * (offsetY - 0.5), 10));
        const endRotation = bone.quaternion.clone();
        bone.quaternion.copy(startRotation);
        const tweenRotation = new TWEEN.Tween(bone.quaternion).to(endRotation, 200).start().onComplete( () => {
          bone.quaternion.copy(endRotation); // to be exact
        } );

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
