import * as THREE from '../../../../../node_modules/three/build/three.module.js';
import { OrbitControls } from '../../../../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {GUI} from "../../../../../node_modules/three/examples/jsm/libs/dat.gui.module.js";

import {vertexShader, fragmentShader} from "./shaders.js";

function IVimageProcessing(height, width, imageProcessingMaterial) {
  
  this.height = height;
  this.width = width;

  //3 rtt setup
  this.scene = new THREE.Scene();
  this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);

  //4 create a target texture
  var options = {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    //            type:THREE.FloatType
    type: THREE.UnsignedByteType
  };
  this.rtt = new THREE.WebGLRenderTarget(width, height, options);

  var geom = new THREE.BufferGeometry();
  geom.addAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0]), 3));
  geom.addAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]), 2));
  this.scene.add(new THREE.Mesh(geom, imageProcessingMaterial));
}

function IVprocess(imageProcessing, renderer) {
  renderer.setRenderTarget(imageProcessing.rtt);
  renderer.render(imageProcessing.scene, imageProcessing.orthoCamera);
  renderer.setRenderTarget(null);
};

var camera, controls, scene, renderer, container;
var plan;

// VIDEO AND THE ASSOCIATED TEXTURE
var video, videoTexture;

// IMAGE AND THE ASSOCIATED TEXTURE
var imageTexture;

var imageProcessing, imageProcessingMaterial;

// GUI
var gui;

init();
animate();

function init() {

  container = document.createElement('div');
  document.body.appendChild(container);

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.autoClear = false;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;

  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 10);
  camera.position.z = 2;
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 0.005;
  controls.maxDistance = 1.0;
  controls.enableRotate = true;
  controls.addEventListener('change', render);
  controls.update();

  var sourceimage = new URLSearchParams(location.search).get('sourceimage');

  video = document.createElement('video');

  const imageElProcessing = function () {
    
    imageTexture.minFilter = THREE.NearestFilter;
    imageTexture.magFilter = THREE.NearestFilter;
    imageTexture.generateMipmaps = false;
    imageTexture.format = THREE.RGBFormat;

    imageProcessingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        sizeDiv2: { type: 'i', value: 5 },
        colorScaleR: { type: 'f', value: 1.0 },
        colorScaleG: { type: 'f', value: 1.0 },
        colorScaleB: { type: 'f', value: 1.0 },
        invert: { type: 'b', value: false },
        image: { type: 't', value: imageTexture },
        resolution: { type: '2f', value: new THREE.Vector2(imageTexture.image.width, imageTexture.image.height,) }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });

    imageProcessing = new IVimageProcessing(imageTexture.image.width, imageTexture.image.height, imageProcessingMaterial);

    var geometry = new THREE.PlaneGeometry(1, imageTexture.image.height / imageTexture.image.width);
    var material = new THREE.MeshBasicMaterial({ map: imageProcessing.rtt.texture, side: THREE.DoubleSide });
    plan = new THREE.Mesh(geometry, material);
    plan.position.x = 0.6;
    plan.receiveShadow = false;
    plan.castShadow = false;
    scene.add(plan);

    var geometry2 = new THREE.PlaneGeometry(1, imageTexture.image.height / imageTexture.image.width);
    var material2 = new THREE.MeshBasicMaterial({ map: imageTexture, side: THREE.DoubleSide });
    plan = new THREE.Mesh(geometry2, material2);
    plan.position.x = -0.6;
    plan.receiveShadow = false;
    plan.castShadow = false;
    scene.add(plan);

    gui = new GUI();
    gui.add(imageProcessingMaterial.uniforms.colorScaleR, 'value', 0, 1).name('Red');
    gui.add(imageProcessingMaterial.uniforms.colorScaleG, 'value', 0, 1).name('Green');
    gui.add(imageProcessingMaterial.uniforms.colorScaleB, 'value', 0, 1).name('Blue');
    gui.add(imageProcessingMaterial.uniforms.invert, 'value').name('Invert');

  };

  const videoProcessing = function () {
    videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.NearestFilter;
    videoTexture.magFilter = THREE.NearestFilter;
    videoTexture.generateMipmaps = false;
    videoTexture.format = THREE.RGBFormat;

    imageProcessingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        sizeDiv2: { type: 'i', value: 5 },
        colorScaleR: { type: 'f', value: 1.0 },
        colorScaleG: { type: 'f', value: 1.0 },
        colorScaleB: { type: 'f', value: 1.0 },
        invert: { type: 'b', value: false },
        image: { type: 't', value: videoTexture },
        resolution: { type: '2f', value: new THREE.Vector2(video.videoWidth, video.videoHeight) }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });

    imageProcessing = new IVimageProcessing(video.videoHeight, video.videoWidth, imageProcessingMaterial);

    var geometry = new THREE.PlaneGeometry(1, video.videoHeight / video.videoWidth);
    var material = new THREE.MeshBasicMaterial({ map: imageProcessing.rtt.texture, side: THREE.DoubleSide });
    plan = new THREE.Mesh(geometry, material);
    plan.position.x = 0.6;
    plan.receiveShadow = false;
    plan.castShadow = false;
    scene.add(plan);

    var geometry2 = new THREE.PlaneGeometry(1, video.videoHeight / video.videoWidth);
    var material2 = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide });
    plan = new THREE.Mesh(geometry2, material2);
    plan.position.x = -0.6;
    plan.receiveShadow = false;
    plan.castShadow = false;
    scene.add(plan);

    var pausePlayObj =
    {
      pausePlay: function () {
        if (!video.paused) {
          console.log("pause");
          video.pause();
        }
        else {
          console.log("play");
          video.play();
        }
      },
      add10sec: function () {
        video.currentTime = video.currentTime + 10;
        console.log(video.currentTime);
      }
    };

    gui = new GUI();
    gui.add(imageProcessingMaterial.uniforms.colorScaleR, 'value', 0, 1).name('Red');
    gui.add(imageProcessingMaterial.uniforms.colorScaleG, 'value', 0, 1).name('Green');
    gui.add(imageProcessingMaterial.uniforms.colorScaleB, 'value', 0, 1).name('Blue');
    gui.add(imageProcessingMaterial.uniforms.invert, 'value').name('Invert');
    gui.add(pausePlayObj, 'pausePlay').name('Pause/play video');
    gui.add(pausePlayObj, 'add10sec').name('Add 10 seconds');

    video.play();

  };

  switch (sourceimage) {
    case 'image':
      imageTexture = new THREE.TextureLoader().load("./assets/img/grenouille.jpg", imageElProcessing);
      break;
    case 'video':
      video.src = './assets/video/video.mp4';
      video.load();
      video.onloadeddata = videoProcessing;
      video.muted = true;
      video.loop = true;
      break;
    case 'webcam':

      const constraints = { video: { width: 1280, height: 720, facingMode: 'user' } };
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
          video.srcObject = stream;
          video.play();
          video.onloadeddata = videoProcessing;
        });
      }
      break;
    default:
      imageTexture = new THREE.TextureLoader().load("./assets/img/grenouille.jpg", imageElProcessing);
  }


  window.addEventListener('resize', onWindowResize, false);
}

function render() {
  renderer.clear();

  if (typeof imageProcessing !== "undefined")
    IVprocess(imageProcessing, renderer);
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  render();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}
