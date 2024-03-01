import * as THREE from 'three';

// import {
//   RoomEnvironment
// } from 'three/addons/environments/RoomEnvironment.js';

// Get window dimension
var ww = document.documentElement.clientWidth || document.body.clientWidth;
var wh = window.innerHeight;

// Save half window dimension
var ww2 = ww * 0.5,
  wh2 = wh * 0.5;

// Constructor function
function Tunnel() {
  // Init the scene and the
  this.init();
  // Create the shape of the tunnel
  this.createMesh();

  // Mouse events & window resize
  this.handleEvents();

  // Start loop animation
  window.requestAnimationFrame(this.render.bind(this));
}

Tunnel.prototype.init = function () {
  // Define the speed of the tunnel
  this.speed = 0.02;

  // Store the position of the mouse
  // Default is center of the screen
  this.mouse = {
    position: new THREE.Vector2(0, 0),
    target: new THREE.Vector2(0, 0)
  };

  // Create a WebGL renderer
  this.renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector("#scene")
  });
  // Set size of the renderer and its background color
  this.renderer.setSize(ww, wh);
  this.renderer.setClearColor(0x222222);


  // Create a camera and move it along Z axis
  this.camera = new THREE.PerspectiveCamera(15, ww / wh, 0.01, 1000);
  this.camera.position.z = 0.35;

  // Create an empty scene and define a fog for it
  this.scene = new THREE.Scene();
  this.scene.fog = new THREE.Fog(0x222222, 0.6, 2.8);

  // const video = document.querySelector("#playVid")
  // var texturebg = new THREE.VideoTexture( video );
		// texturebg.minFilter = THREE.LinearFilter;
		// texturebg.magFilter = THREE.LinearFilter;
		// texturebg.format = THREE.RGBFormat;
					
		// this.scene.background = texturebg;
  this.shapes = []

};

Tunnel.prototype.createMesh = function () {
  // Empty array to store the points along the path
  var points = [];

  // Define points along Z axis to create a curve
  for (var i = 0; i < 5; i += 1) {
    points.push(new THREE.Vector3(0, 0, 2.5 * (i / 4)));
  }
  // Set custom Y position for the last point
  points[4].y = -0.06;

  // Create a curve based on the points
  this.curve = new THREE.CatmullRomCurve3(points);
  // Define the curve type

  // Create vertices based on the curve
  var geometry = new THREE.BufferGeometry().setFromPoints(this.curve.getPoints(70));

  // Create a line from the points with a basic line material
  this.splineMesh = new THREE.Line(geometry, new THREE.LineBasicMaterial());

  // Create a material for the tunnel with a custom texture
  // Set side to BackSide since the camera is inside the tunnel
  this.tubeMaterial = new THREE.MeshStandardMaterial({
    side: THREE.BackSide,
    map: textures.orange.texture,
    bumpMap: textures.paper.texture,
    bumpScale: 0.0003
  });

  // Add two lights in the scene
  // An hemisphere light, to add different light from sky and ground
  var light = new THREE.HemisphereLight(0xffffbb, 0x887979, 0.9);
  this.scene.add(light);
  // Add a directional light for the bump
  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  this.scene.add(directionalLight);

  const spotLight = new THREE.SpotLight( 0xffffff, 2, 10 );
  // spotLight.position.set( 0,0,0 );
  spotLight.position.x -= 2
  spotLight.position.z += 2
  spotLight.position.y += 2
  spotLight.rotation.x = Math.PI / -3
  this.scene.add( spotLight );
  // Repeat the pattern
  this.tubeMaterial.map.wrapS = THREE.RepeatWrapping;
  this.tubeMaterial.map.wrapT = THREE.RepeatWrapping;
  this.tubeMaterial.map.repeat.set(30, 6);
  this.tubeMaterial.bumpMap.wrapS = THREE.RepeatWrapping;
  this.tubeMaterial.bumpMap.wrapT = THREE.RepeatWrapping;
  this.tubeMaterial.bumpMap.repeat.set(30, 6);

  // Create a tube geometry based on the curve
  this.tubeGeometry = new THREE.TubeGeometry(this.curve, 70, 0.02, 50, false);
  // Create a mesh based on the tube geometry and its material
  this.tubeMesh = new THREE.Mesh(this.tubeGeometry, this.tubeMaterial);
  // Push the tube into the scene
  this.scene.add(this.tubeMesh);

  // Clone the original tube geometry
  // Because we will modify the visible one but we need to keep track of the original position of the vertices
  this.tubeGeometry_o = this.tubeGeometry.clone();
};

const mapNumRange = (num, inMin, inMax, outMin, outMax) =>
  ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

Tunnel.prototype.addShape = function () {
  // const sphereGeometry = new THREE.SphereGeometry(.005, 32, 16);
  const sphereGeometry = new THREE.SphereGeometry(mapNumRange(Math.random(), 0, 1, .0008, .005), 6, 6);
  // const sphereMaterial = new THREE.MeshBasicMaterial({
  //   color: 0xff0000,
  //   vertexColors: true,
  //   wireframe: true
  // });
  const sphereMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xff0000,
    roughness: 0.0,
    ior: 2,
    reflectivity: 1.0,
    // flatShading: true
  });

  // const sphereGeometry = new THREE.TorusKnotGeometry(.003, .001, 100, 16);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  // const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.z = 0.55
  // sphere.position.z =  Math.random() * 0.1 + 0.5
  sphere.position.y = (Math.random() - .5) * 0.025
  sphere.position.x = (Math.random() - .5) * 0.025

  this.shapes.push(sphere)
  this.scene.add(sphere);
}

Tunnel.prototype.addCone = function () {
  const size = Math.abs(Math.random() - .5) * .02
  const coneGeometry = new THREE.ConeGeometry( size, size*2, 16 ); 
  // const coneGeometry = new THREE.TorusKnotGeometry(.003, .001, 100, 16);
  const coolMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x00ff00,
    roughness: 0.0,
    ior: 2,
    reflectivity: 1.0
    // flatShading: true,
    // metalness: 0.5
  });

  const cone = new THREE.Mesh(coneGeometry, coolMaterial);

  // const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  cone.position.z = 0.55
  // cone.rotateX = Math.random()
  cone.rotation.x = (Math.random() - 0.5) * 2
  cone.rotation.y = (Math.random() - 0.5) * 2
  cone.rotation.z = (Math.random() - 0.5) * 2
  // cone.rotation.y = Math.random()
  // cone.rotation.z = Math.random()
  // cone.rotateZ = Math.random()
  // cone.position.z =  Math.random() * 0.1 + 0.5
  cone.position.y = (Math.random() - .5) * 0.04
  cone.position.x = (Math.random() - .5) * 0.04 +.02

  this.shapes.push(cone)
  this.scene.add(cone);
}


Tunnel.prototype.addTorus = function () {
  const size = Math.abs(Math.random() - .5) * .008
  const coneGeometry = new THREE.TorusGeometry( size, size, 10 ); 
  // const coneGeometry = new THREE.TorusKnotGeometry(.003, .001, 100, 16);
  const coolMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x00ffff,
    roughness: 0.0,
    ior: 2,
    reflectivity: 1.0
    // flatShading: true,
    // metalness: 0.5
  });

  const cone = new THREE.Mesh(coneGeometry, coolMaterial);

  // const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  cone.position.z = 0.55
  // cone.rotateX = Math.random()
  cone.rotation.x = (Math.random() - 0.5) * 2
  cone.rotation.y = (Math.random() - 0.5) * 2
  cone.rotation.z = (Math.random() - 0.5) * 2
  // cone.rotation.y = Math.random()
  // cone.rotation.z = Math.random()
  // cone.rotateZ = Math.random()
  // cone.position.z =  Math.random() * 0.1 + 0.5
  cone.position.y = (Math.random() - .5) * 0.04
  cone.position.x = (Math.random() - .5) * 0.04 +.02

  this.shapes.push(cone)
  this.scene.add(cone);
}

Tunnel.prototype.addRing = function () {
  const size = Math.abs(Math.random() - .5) * .008
  const coneGeometry = new THREE.TorusGeometry( size, size, 10 ); 
  // const coneGeometry = new THREE.RingGeometry( 1, 5, 32 ); 
  // const coneGeometry = new THREE.TorusKnotGeometry(.003, .001, 100, 16);
  const coolMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xff00ff,
    roughness: 0.0,
    ior: 2,
    reflectivity: 1.0
    // flatShading: true,
    // metalness: 0.5
  });

  const cone = new THREE.Mesh(coneGeometry, coolMaterial);

  // const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  cone.position.z = 0.55
  // cone.rotateX = Math.random()
  cone.rotation.x = (Math.random() - 0.5) * 2
  cone.rotation.y = (Math.random() - 0.5) * 2
  cone.rotation.z = (Math.random() - 0.5) * 2
  // cone.rotation.y = Math.random()
  // cone.rotation.z = Math.random()
  // cone.rotateZ = Math.random()
  // cone.position.z =  Math.random() * 0.1 + 0.5
  cone.position.y = (Math.random() - .5) * 0.04
  cone.position.x = (Math.random() - .5) * 0.04 +.02

  this.shapes.push(cone)
  this.scene.add(cone);
}

Tunnel.prototype.handleEvents = function () {
  // When user resize window
  window.addEventListener("resize", this.onResize.bind(this), false);
  // When user move the mouse
  document.body.addEventListener(
    "mousemove",
    this.onMouseMove.bind(this),
    false
  );
};

Tunnel.prototype.onResize = function () {
  // On resize, get new width & height of window
  ww = document.documentElement.clientWidth || document.body.clientWidth;
  wh = window.innerHeight;
  ww2 = ww * 0.5;
  wh2 = wh * 0.5;

  // Update camera aspect
  this.camera.aspect = ww / wh;
  // Reset aspect of the camera
  this.camera.updateProjectionMatrix();
  // Update size of the canvas
  this.renderer.setSize(ww, wh);
};

Tunnel.prototype.onMouseMove = function (e) {
  // Save mouse X & Y position
  this.mouse.target.x = (e.clientX - ww2) / ww2;
  this.mouse.target.y = (wh2 - e.clientY) / wh2;
};

Tunnel.prototype.updateCameraPosition = function () {
  // Update the mouse position with some lerp
  this.mouse.position.x += (this.mouse.target.x - this.mouse.position.x) / 30;
  this.mouse.position.y += (this.mouse.target.y - this.mouse.position.y) / 30;

  // Rotate Z & Y axis
  this.camera.rotation.z = this.mouse.position.x * 0.2;
  this.camera.rotation.y = Math.PI - this.mouse.position.x * 0.06;
  // Move a bit the camera horizontally & vertically
  this.camera.position.x = this.mouse.position.x * 0.015;
  this.camera.position.y = -this.mouse.position.y * 0.015;
};

Tunnel.prototype.updateMaterialOffset = function () {
  // Update the offset of the material
  this.tubeMaterial.map.offset.x += this.speed;
};

Tunnel.prototype.updateShapes = function () {
  // Update the offset of the material
  if (this.shapes.length > 100) {
    this.shapes = this.shapes.slice(1)
  }


  for (let i = 0; i < this.shapes.length; i++) {
    this.shapes[i].position.z += this.speed * 0.5;
  }
};

Tunnel.prototype.updateCurve = function () {
  var index = 0,
    vertice_o = null,
    vertice = null;

    const positions = this.tubeGeometry.attributes.position.array
    const positions_o = this.tubeGeometry_o.attributes.position.array
    const positions_spline = this.splineMesh.geometry.attributes.position.array
    
  // For each vertice of the tube, move it a bit based on the spline
  for (var i = 0, j = positions.length; i < j; i += 3) {
    // Get the original tube vertice
    vertice_o = new THREE.Vector3(
      positions_o[i],
      positions_o[i + 1],
      positions_o[i + 2]
  );
    // Get the visible tube vertice
    vertice = new THREE.Vector3(
      positions[i],
      positions[i + 1],
      positions[i + 2]
  );

    // Calculate index of the vertice based on the Z axis
    // The tube is made of 50 rings of vertices
    index = Math.floor(i / 50);
    
    // Update tube vertice
    positions[i] +=
      (vertice_o.x + positions_spline[index] - vertice.x) /
      10;
    positions[i+1] +=
      (vertice_o.y + positions_spline[index+1] - vertice.y) /
      5;
  }
  // Warn ThreeJs that the points have changed
  this.tubeGeometry.verticesNeedUpdate = true;

  // Update the points along the curve base on mouse position
  this.curve.points[2].x = -this.mouse.position.x * 0.1;
  this.curve.points[4].x = -this.mouse.position.x * 0.1;
  this.curve.points[2].y = this.mouse.position.y * 0.1;

  // Warn ThreeJs that the spline has changed
  this.splineMesh.geometry.verticesNeedUpdate = true;
  this.splineMesh.geometry.vertices = this.curve.getPoints(70);
};

Tunnel.prototype.render = function () {
  // Update material offset
  this.updateMaterialOffset();

  // Update material offset
  this.updateShapes();

  // Update camera position & rotation
  this.updateCameraPosition();

  // Update the tunnel
  this.updateCurve();

  // render the scene
  this.renderer.render(this.scene, this.camera);

  // Animation loop
  window.requestAnimationFrame(this.render.bind(this));
};

// All needed textures
var textures = {
  "orange": {
    url: "../assets/textures/orange.jpg"
  },
  "red": {
    url: "../assets/textures/red.gif"
  },
  "paper": {
    url: "../assets/textures/paper.gif"
  }
};
// Create a new loader
var loader = new THREE.TextureLoader();
// Prevent crossorigin issue
loader.crossOrigin = "Anonymous";
// Load all textures
for (var name in textures) {
  (function (name) {
    loader.load(textures[name].url, function (texture) {
      textures[name].texture = texture;
      checkTextures();
    });
  })(name)
}
var texturesLoaded = 0;

function checkTextures() {
  texturesLoaded++;
  if (texturesLoaded === Object.keys(textures).length) {
    document.body.classList.remove("loading");
    // When all textures are loaded, init the scene
    window.tunnel = new Tunnel();
  }
}

// window.addEventListener("click", ()=> {
//   window.tunnel.addRing()
// })

// video.play()