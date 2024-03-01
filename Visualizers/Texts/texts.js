import * as THREE from 'three';

import {
	OrbitControls
} from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js'

import {
	TextGeometry
} from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/geometries/TextGeometry.js'

import {FontLoader} from "https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/loaders/FontLoader.js"


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0,2,0)
scene.add(directionalLight);
const light = new THREE.AmbientLight( 0x555555 ); // soft white light
scene.add( light );



camera.position.z = 10;
controls.update();

function animate() {
	requestAnimationFrame(animate);


	controls.update();
	renderer.render(scene, camera);
}

animate();

function init() {
	const loader = new FontLoader();

	loader.load( './helvetiker.json', function ( font ) {
		const geometry = new TextGeometry( 'Hello three.js!', {
			font: font,
			size: 1,
			height: .01,
			// curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: .05,
			bevelSize: .05,
			bevelOffset: 0,
			bevelSegments: 5
		} );
	
		const mesh = new THREE.MeshPhysicalMaterial({
			color: "#00ff00",
			roughness: 0,
			flatShading: false
		})
		const text = new THREE.Mesh(geometry, mesh)
		scene.add(text)
	} );
}

window.onload = init;

window.addEventListener("click", ()=>{
	// addCube()
})