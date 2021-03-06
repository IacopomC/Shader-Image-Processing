import * as THREE from '../../../../../../node_modules/three/build/three.module.js';
import { OrbitControls } from '../../../../../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GUI } from "../../../../../../node_modules/three/examples/jsm/libs/dat.gui.module.js";

import { vertexShader, fragmentShader } from "./shaders.js";

function IVimageProcessing(height, width, imageProcessingMaterial) {

  this.height = height;
  this.width = width;

  //3 rtt setup
  this.scene = new THREE.Scene();
  // prettier-ignore
  this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);

  //4 create a target texture
  var options = {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    //            type:THREE.FloatType
    type: THREE.UnsignedByteType,
  };
  this.rtt = new THREE.WebGLRenderTarget(width, height, options);

  var geom = new THREE.BufferGeometry();
  var geom = new THREE.BufferGeometry();
  geom.addAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0]), 3));
  geom.addAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]), 2));
  this.scene.add(new THREE.Mesh(geom, imageProcessingMaterial));
}

function IVprocess(imageProcessing, renderer) {
  renderer.setRenderTarget(imageProcessing.rtt);
  renderer.render(imageProcessing.scene, imageProcessing.orthoCamera);
  renderer.setRenderTarget(null);
}

function benchmark() {
  let t0 = performance.now();

  IVprocess(imageProcessing, renderer);

  let t1 = performance.now();
  window.alert("Execution time " + Math.round((t1 - t0)*1000) + " microseconds.");
}

let camera, controls, scene, renderer, container;
let plane;

// VIDEO AND THE ASSOCIATED TEXTURE
var video, videoTexture;

// IMAGE AND THE ASSOCIATED TEXTURE
var imageTexture;

let imageProcessing, imageProcessingMaterial;

// GUI
let gui;

init();
animate();

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.autoClear = false;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;

  container.appendChild(renderer.domElement);

  const fov = 45;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 1000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 1, 3);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableRotate = true;
  controls.addEventListener("change", render);
  controls.update();

  document.getElementById ("exbtn").addEventListener ("click", benchmark);

  var sourceimage = new URLSearchParams(location.search).get('sourceimage');

  video = document.createElement('video');

  const imageElProcessing = function () {

    imageTexture.minFilter = THREE.NearestFilter;
    imageTexture.magFilter = THREE.NearestFilter;
    imageTexture.generateMipmaps = false;
    imageTexture.format = THREE.RGBFormat;

    imageProcessingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        image: { type: "t", value: imageTexture },
        resolution: {
          type: "2f", value: new THREE.Vector2(imageTexture.image.width, imageTexture.image.height),
        },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    imageProcessing = new IVimageProcessing(imageTexture.image.width, imageTexture.image.height, imageProcessingMaterial);

    var geometry = new THREE.PlaneGeometry(1, imageTexture.image.height / imageTexture.image.width);
    var material = new THREE.MeshBasicMaterial({ map: imageProcessing.rtt.texture, side: THREE.DoubleSide });
    let planeR = new THREE.Mesh(geometry, material);
    planeR.position.x = 0.6;
    planeR.position.z = -0.02;
    planeR.receiveShadow = false;
    planeR.castShadow = false;
    scene.add(planeR);

    var geometry2 = new THREE.PlaneGeometry(1, imageTexture.image.height / imageTexture.image.width);
    var material2 = new THREE.MeshBasicMaterial({ map: imageTexture, side: THREE.DoubleSide });
    plane = new THREE.Mesh(geometry2, material2);
    plane.position.x = -0.6;
    plane.receiveShadow = false;
    plane.castShadow = false;
    scene.add(plane);

    var selectSrcObj =
    {
      image: function () {
        window.location = location.origin + location.pathname + '?sourceimage=image';
      },
      video: function () {
        window.location = location.origin + location.pathname + '?sourceimage=video';
      },
      webcam: function () {
        window.location = location.origin + location.pathname + '?sourceimage=webcam';
      }
    };

    gui = new GUI();
    gui.add(selectSrcObj, 'image').name('Image');
    gui.add(selectSrcObj, 'video').name('Video');
    gui.add(selectSrcObj, 'webcam').name('Webcam');

  };

  const videoProcessing = function () {
    videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.NearestFilter;
    videoTexture.magFilter = THREE.NearestFilter;
    videoTexture.generateMipmaps = false;
    videoTexture.format = THREE.RGBFormat;

    imageProcessingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        image: { type: "t", value: videoTexture },
        resolution: { type: '2f', value: new THREE.Vector2(video.videoWidth, video.videoHeight) }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    imageProcessing = new IVimageProcessing(video.videoHeight, video.videoWidth, imageProcessingMaterial);

    var geometry = new THREE.PlaneGeometry(1, video.videoHeight / video.videoWidth);
    var material = new THREE.MeshBasicMaterial({ map: imageProcessing.rtt.texture, side: THREE.DoubleSide });
    let planeR = new THREE.Mesh(geometry, material);
    planeR.position.x = 0.6;
    planeR.position.z = -0.02;
    planeR.receiveShadow = false;
    planeR.castShadow = false;
    scene.add(planeR);

    var geometry2 = new THREE.PlaneGeometry(1, video.videoHeight / video.videoWidth);
    var material2 = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide });
    plane = new THREE.Mesh(geometry2, material2);
    plane.position.x = -0.6;
    plane.receiveShadow = false;
    plane.castShadow = false;
    scene.add(plane);

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
      }
    };

    var selectSrcObj =
    {
      image: function () {
        window.location = location.origin + location.pathname + '?sourceimage=image';
      },
      video: function () {
        window.location = location.origin + location.pathname + '?sourceimage=video';
      },
      webcam: function () {
        window.location = location.origin + location.pathname + '?sourceimage=webcam';
      }
    };

    gui = new GUI();
    gui.add(pausePlayObj, 'pausePlay').name('Pause/play video');
    gui.add(pausePlayObj, 'add10sec').name('Add 10 seconds');
    gui.add(selectSrcObj, 'image').name('Image');
    gui.add(selectSrcObj, 'video').name('Video');
    gui.add(selectSrcObj, 'webcam').name('Webcam');

    video.play();
  }

  switch (sourceimage) {
    case 'image':
      imageTexture = new THREE.TextureLoader().load("../../../assets/img/grenouille.jpg", imageElProcessing);
      break;
    case 'video':
      video.src = '../../../assets/video/video.mp4';
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
      imageTexture = new THREE.TextureLoader().load("../../../assets/img/grenouille.jpg", imageElProcessing);
  }
  window.addEventListener("resize", onWindowResize, false);
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
