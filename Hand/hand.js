import * as THREE from 'three';
import {
	GLTFLoader
} from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/loaders/GLTFLoader.js'
import {
	OrbitControls
} from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js'



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1, 1);
const texture = new THREE.TextureLoader().load("../assets/textures/hand.jpg");
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(1, 1);
const material = new THREE.MeshStandardMaterial({
	map: texture
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
scene.add(directionalLight);

camera.position.z = 10;
controls.update();

function animate() {
	requestAnimationFrame(animate);

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	if (scene.children[2]) {
		scene.children[2].rotation.y += .01
	}
	controls.update();
	renderer.render(scene, camera);

}

animate();

function init() {

	// Instantiate a loader
	const loader = new GLTFLoader();

	// Load a glTF resource
	loader.load(
		// resource URL
		'../assets/models/hand.glb',
		// called when the resource is loaded
		function (gltf) {

			scene.add(gltf.scene);

			// gltf.animations; // Array<THREE.AnimationClip>
			// gltf.scene; // THREE.Group
			// gltf.scenes; // Array<THREE.Group>
			// gltf.cameras; // Array<THREE.Camera>
			// gltf.asset; // Object
			// camera.lookAt(gltf.scenes[0].children[0])
			//         var model = gltf.scene;


			var model = gltf.scene;

			const texture = new THREE.TextureLoader().load("../assets/textures/hand.jpg");
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set(4, 4);
			texture.flipY = false;
			texture.encoding = THREE.sRGBEncoding; // define color space

			var newMaterial = new THREE.MeshPhysicalMaterial({
				color: 0xffff00,
				roughness: 0,
				map: texture
			});
			model.traverse((o) => {
				if (o.isMesh) {
					o.material = newMaterial;
				}
				console.log(o);
			});

		},
		// called while loading is progressing
		function (xhr) {

			console.log((xhr.loaded / xhr.total * 100) + '% loaded');

		},
		// called when loading has errors
		function (error) {
			console.log('An error happened');

		}
	);
}

window.onload = init;

function addCube() {
	const geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1, 1);
	const texture = new THREE.TextureLoader().load("../assets/textures/hand.jpg");
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(1, 1);
	const material = new THREE.MeshStandardMaterial({
		map: texture
	});
	const cube = new THREE.Mesh(geometry, material);
	cube.position.set(0,0,1)
	cube.rotation.set(1,2,4)
	scene.add(cube);

}

window.addEventListener("click", ()=>{
	addCube()

})