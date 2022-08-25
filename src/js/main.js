import './modules/polyfill'

import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'

import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';
import * as dat from 'lil-gui'

// const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

let sceneReady = false

const loadingManager = new THREE.LoadingManager(
  () => {
    window.setTimeout(() => {
      sceneReady = true
    }, 500)
  }
)

const gltfLoader = new GLTFLoader(loadingManager)
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/assets/libs/draco/')
gltfLoader.setDRACOLoader(dracoLoader)

const textureLoader = new THREE.TextureLoader();
const displacementMap = textureLoader.load('/assets/models/displace_map.png');
const roughnessMap = textureLoader.load('/assets/models/arabica/roughness_map.png');

const image = new Image()
const texture = new THREE.Texture(image)

image.addEventListener('load', () => {
  texture.needsUpdate = true
})

// image.src = '/assets/models/Pack_light_textyres.png'
// image.minFilter = THREE.LinearFilter

const loader = new RGBELoader()
loader
  .load('/assets/models/brown_photostudio_02_1k.hdr', function (texture) {

    texture.mapping = THREE.EquirectangularReflectionMapping;

    // scene.background = texture;
    scene.environment = texture;
  });


gltfLoader.load(
  '../assets/models/arabica/arabica.glb',
  (gltf) => {

    scene.add(gltf.scene)
    gltf.scene.scale.set(0.05, 0.05, 0.05)
    gltf.scene.position.y = -0.5

    // gltf.scene.children[0].children[1].material.map = texture
    gltf.scene.children[0].children[1].material.map.needsUpdate = true
    gltf.scene.children[0].children[1].material.side = THREE.FrontSide

    gltf.scene.children[0].children[1].material.displacementMap = displacementMap
    gltf.scene.children[0].children[1].material.roughnessMap = roughnessMap

    console.log(gltf.scene.children[0].children[1].material.map)
  }
)


const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
// scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1000, 1000)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = -4
directionalLight.shadow.camera.top = 0
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7
directionalLight.position.set(5, 5, 5)
// scene.add(directionalLight)

// const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3)
// scene.add(hemisphereLight)

// gui.add(ambientLight, 'intensity').min(0).max(1.5).step(0.001)
// gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 0.5
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
// controls.enableZoom = false

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
  premultipliedAlpha: false,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()

