import * as THREE from 'three';
import {
	TextGeometry
} from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/geometries/TextGeometry.js'
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';
import {FontLoader} from "https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/loaders/FontLoader.js"
import * as BufferGeometryUtils from "https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/utils/BufferGeometryUtils.js"

const DEFAULT_MASS = 10;
let body = 0
let scriptWords = `Your old geometry tutor, a sprightly yogic septuagenarian who lives on the far edge of town, is relocating to Jefferson City, Missouri to be closer to his niece, and he’s offered you sixty dollars to clean out his attic. Most of the accumulation is plain old crap. A scuffed-up Emmett Kelly clown painting, a tunic, a pair of mildewy bowling shoes, some Better Home & Gardens magazines from the 1990s. Ick!


There’s one item that piques your curiosity—a pristine reel-to-reel box with the words “TuppingTimePlus” scrawled in orange felt marker. You open the thing and are confronted by a noxious smell, a well-worn tape, and a moth-eaten lyrics sheet credited to a man named Calvin Grad, a suite of five song-poems written in tightly-wound cursive. 


You wonder how Calvin Grad must have felt when he wrote all this, and what kind of person he must have been. Music’s interesting because it's so intimate, but a lot of the time you encounter the best stuff by chance. You’re glad that Mr. Grad will never stop believing in love, because things have been kind of hard recently. You wonder how it ended up in that attic, but you guess that’s just the beauty of these sorts of things.
`

scriptWords = scriptWords.split(" ")


class RigidBody {
  constructor() {
  }

  setRestitution(val) {
    this.body_.setRestitution(val);
  }

  setFriction(val) {
    this.body_.setFriction(val);
  }

  setRollingFriction(val) {
    this.body_.setRollingFriction(val);
  }

  createBox(mass, pos, quat, size) {
    this.transform_ = new Ammo.btTransform();
    this.transform_.setIdentity();
    this.transform_.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    this.transform_.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);

    const btSize = new Ammo.btVector3(size.x * 0.5, size.y * 0.5, size.z * 0.5);
    this.shape_ = new Ammo.btBoxShape(btSize);
    this.shape_.setMargin(0.05);

    this.inertia_ = new Ammo.btVector3(0, 0, 0);
    if (mass > 0) {
      this.shape_.calculateLocalInertia(mass, this.inertia_);
    }

    this.info_ = new Ammo.btRigidBodyConstructionInfo(
        mass, this.motionState_, this.shape_, this.inertia_);
    this.body_ = new Ammo.btRigidBody(this.info_);

    Ammo.destroy(btSize);
  }

  createSphere(mass, pos, size) {
    this.transform_ = new Ammo.btTransform();
    this.transform_.setIdentity();
    this.transform_.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    this.transform_.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
    this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);

    this.shape_ = new Ammo.btSphereShape(size);
    this.shape_.setMargin(0.05);

    this.inertia_ = new Ammo.btVector3(0, 0, 0);
    if(mass > 0) {
      this.shape_.calculateLocalInertia(mass, this.inertia_);
    }

    this.info_ = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState_, this.shape_, this.inertia_);
    this.body_ = new Ammo.btRigidBody(this.info_);
  }
}

class BasicWorldDemo {
  constructor() {
  }

  initialize() {



    this.margin = 0.05



    this.collisionConfiguration_ = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
    this.dispatcher_ = new Ammo.btCollisionDispatcher( this.collisionConfiguration_ );
    this.broadphase_ = new Ammo.btDbvtBroadphase();
    this.solver_ = new Ammo.btSequentialImpulseConstraintSolver();
    this.softBodySolver_ = new Ammo.btDefaultSoftBodySolver();
    this.physicsWorld_ = new Ammo.btSoftRigidDynamicsWorld(
        this.dispatcher_, this.broadphase_, this.solver_, this.collisionConfiguration_, this.softBodySolver_);
    this.physicsWorld_.setGravity(new Ammo.btVector3(0, -500000000, 0));
    this.physicsWorld_.getWorldInfo().set_m_gravity(new Ammo.btVector3(0, -200, 0));
    this.transformAux1 = new Ammo.btTransform();
    this.softBodyHelpers = new Ammo.btSoftBodyHelpers();



    this.threejs_ = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.threejs_.shadowMap.enabled = true;
    this.threejs_.shadowMap.type = THREE.PCFSoftShadowMap;
    this.threejs_.setPixelRatio(window.devicePixelRatio);
    this.threejs_.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.threejs_.domElement);

    window.addEventListener('resize', () => {
      this.onWindowResize_();
    }, false);

    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this.camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera_.position.set(75, 20, 0);

    this.scene_ = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(20, 100, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this.scene_.add(light);

    light = new THREE.AmbientLight(0xa0a0a0);
    this.scene_.add(light);

    const controls = new OrbitControls(
      this.camera_, this.threejs_.domElement);
    controls.target.set(0, 20, 0);
    controls.update();

    const loader = new THREE.CubeTextureLoader();
    // const texture = loader.load([
    //     './resources/posx.jpg',
    //     './resources/negx.jpg',
    //     './resources/posy.jpg',
    //     './resources/negy.jpg',
    //     './resources/posz.jpg',
    //     './resources/negz.jpg',
    // ]);
    // this.scene_.background = new THREE.Color( 0xf1f1ff );;

    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(100, 1, 100),
      new THREE.MeshPhysicalMaterial({color: 0x404040,
        roughness: 0
    }));
    ground.castShadow = false;
    ground.receiveShadow = true;
    this.scene_.add(ground);

    const rbGround = new RigidBody();
    rbGround.createBox(0, ground.position, ground.quaternion, new THREE.Vector3(100, 1, 100));
    rbGround.setRestitution(0.99);
    this.physicsWorld_.addRigidBody(rbGround.body_);

    this.rigidBodies_ = [];
    this.softBodies_ = [];


    // Create soft volumes
    const volumeMass = 1;

    const sphereGeometry = new THREE.SphereGeometry( 1.5, 40, 25 );
    sphereGeometry.translate( 5, 5, 0 );
    // this.createSoftVolume( sphereGeometry, volumeMass, 250 );

    const fontloader = new FontLoader();
    fontloader.load( './helvetiker.json', function ( font ) {
        addText(font)
        window.loadedFont = font
    })


    let isSphere = true;
    // for (let x = -4; x < 4; ++x) {
    //   for (let y = -4; y < 4; ++y) {
    //     if (isSphere) {
    //       const box = new THREE.Mesh(
    //         new THREE.SphereGeometry(4),
    //         new THREE.MeshPhysicalMaterial({color: 0x808080, roughness: 0.2, wireframe: true}));
    //       box.position.set(x * 10, Math.random() * 20 + 40, y * 10);
    //       box.castShadow = true;
    //       box.receiveShadow = true;
    //       this.scene_.add(box);
      
    //       const rbBox = new RigidBody();
    //       rbBox.createSphere(1, box.position, 4);
    //       rbBox.setRestitution(0.5);
    //       rbBox.setFriction(1);
    //       rbBox.setRollingFriction(1);
    //       this.physicsWorld_.addRigidBody(rbBox.body_);
          
    //       this.rigidBodies_.push({mesh: box, rigidBody: rbBox});
    //     } 
        
        
        
        
    //     else {
    //       const box = new THREE.Mesh(
    //         new THREE.BoxGeometry(4, 4, 4),
    //         new THREE.MeshPhysicalMaterial({color: 0x808080, roughness: 0.2, wireframe: true}));
    //       box.position.set(x * 10, Math.random() * 5 + 40, y * 10);
    //       box.castShadow = true;
    //       box.receiveShadow = true;
    //       this.scene_.add(box);
      
    //       const rbBox = new RigidBody();
    //       rbBox.createBox(1, box.position, box.quaternion, new THREE.Vector3(4, 4, 4));
    //       rbBox.setRestitution(0.25);
    //       rbBox.setFriction(1);
    //       rbBox.setRollingFriction(5);
    //       this.physicsWorld_.addRigidBody(rbBox.body_);
          
    //       this.rigidBodies_.push({mesh: box, rigidBody: rbBox});
    //     }
    //     isSphere = !isSphere;
    //   }
    // }

    this.tmpTransform_ = new Ammo.btTransform();

    this.countdown_ = 1.0;
    this.count_ = 0;
    this.previousRAF_ = null;
    this.raf_();
  }

  onWindowResize_() {
    this.camera_.aspect = window.innerWidth / window.innerHeight;
    this.camera_.updateProjectionMatrix();
    this.threejs_.setSize(window.innerWidth, window.innerHeight);
  }

  raf_() {
    requestAnimationFrame((t) => {
      if (this.previousRAF_ === null) {
        this.previousRAF_ = t;
      }

      this.step_(t - this.previousRAF_);
      this.threejs_.render(this.scene_, this.camera_);
      this.raf_();
      this.previousRAF_ = t;
    });
  }

createSoftVolume( bufferGeom, mass, pressure ) {

    this.processGeometry( bufferGeom );

    const volume = new THREE.Mesh( bufferGeom, new THREE.MeshPhysicalMaterial( 
      { color: 0x00FF00, roughness: 0 } ) );
    volume.castShadow = true;
    volume.receiveShadow = true;
    volume.frustumCulled = false;

    bufferGeom.computeBoundingBox();
    // volume.rotation.y = Math.PI * .5
    // const centerOffset = 0.5 * ( bufferGeom.boundingBox.max.x - bufferGeom.boundingBox.min.x );
    // volume.position.z = centerOffset
    // volume.position.y = 10
    this.scene_.add( volume );

    // textureLoader.load( 'textures/colors.png', function ( texture ) {

    //     volume.material.map = texture;
    //     volume.material.needsUpdate = true;

    // } );

    // Volume physic object
    const volumeSoftBody = this.softBodyHelpers.CreateFromTriMesh(
        this.physicsWorld_.getWorldInfo(),
        bufferGeom.ammoVertices,
        bufferGeom.ammoIndices,
        bufferGeom.ammoIndices.length / 3,
        true );

    const sbConfig = volumeSoftBody.get_m_cfg();
    sbConfig.set_viterations( 40 );
    sbConfig.set_piterations( 40 );

    // Soft-soft and soft-rigid collisions
    sbConfig.set_collisions( 0x01 );

    // Friction
    sbConfig.set_kDF( 0.1 );
    // Damping
    sbConfig.set_kDP( 0.01 );
    // Pressure
    sbConfig.set_kPR( pressure );
    // Stiffness
    volumeSoftBody.get_m_materials().at( 0 ).set_m_kLST( 0.9 );
    volumeSoftBody.get_m_materials().at( 0 ).set_m_kAST( 0.9 );

    volumeSoftBody.setTotalMass( mass, false );
    Ammo.castObject( volumeSoftBody, Ammo.btCollisionObject ).getCollisionShape().setMargin( this.margin );
    this.physicsWorld_.addSoftBody( volumeSoftBody, 1, - 1 );
    volume.userData.physicsBody = volumeSoftBody;
    // Disable deactivation
    volumeSoftBody.setActivationState( 4 );


    this.softBodies_.push( volume );

}

processGeometry( bufGeometry ) {

  // Ony consider the position values when merging the vertices
  const posOnlyBufGeometry = new THREE.BufferGeometry();
  posOnlyBufGeometry.setAttribute( 'position', bufGeometry.getAttribute( 'position' ) );
  posOnlyBufGeometry.setIndex( bufGeometry.getIndex() );

  // Merge the vertices so the triangle soup is converted to indexed triangles
  const indexedBufferGeom = BufferGeometryUtils.mergeVertices( posOnlyBufGeometry );

  // Create index arrays mapping the indexed vertices to bufGeometry vertices
  this.mapIndices( bufGeometry, indexedBufferGeom );

}

mapIndices( bufGeometry, indexedBufferGeom ) {

  // Creates ammoVertices, ammoIndices and ammoIndexAssociation in bufGeometry

  const vertices = bufGeometry.attributes.position.array;
  const idxVertices = indexedBufferGeom.attributes.position.array;
  const indices = indexedBufferGeom.index.array;

  const numIdxVertices = idxVertices.length / 3;
  const numVertices = vertices.length / 3;

  bufGeometry.ammoVertices = idxVertices;
  bufGeometry.ammoIndices = indices;
  bufGeometry.ammoIndexAssociation = [];

  for ( let i = 0; i < numIdxVertices; i ++ ) {

      const association = [];
      bufGeometry.ammoIndexAssociation.push( association );

      const i3 = i * 3;

      for ( let j = 0; j < numVertices; j ++ ) {

          const j3 = j * 3;
          if ( this.isEqual( idxVertices[ i3 ], idxVertices[ i3 + 1 ], idxVertices[ i3 + 2 ],
              vertices[ j3 ], vertices[ j3 + 1 ], vertices[ j3 + 2 ] ) ) {
              association.push( j3 );
          }

      }

  }

}

isEqual( x1, y1, z1, x2, y2, z2 ) {

  const delta = 0.000001;
  return Math.abs( x2 - x1 ) < delta &&
          Math.abs( y2 - y1 ) < delta &&
          Math.abs( z2 - z1 ) < delta;

}

  spawn_() {
    // const scale = Math.random() * 4 + 4;
    // const box = new THREE.Mesh(
    //   new THREE.BoxGeometry(scale, scale, scale),
    //   new THREE.MeshStandardMaterial({
    //       color: 0x808080,
    //   }));
    // box.position.set(Math.random() * 2 - 1, 200.0, Math.random() * 2 - 1);
    // box.quaternion.set(0, 0, 0, 1);
    // box.castShadow = true;
    // box.receiveShadow = true;

    // const rb = new RigidBody();
    // rb.createBox(DEFAULT_MASS, box.position, box.quaternion, new THREE.Vector3(scale, scale, scale), null);
    // rb.setRestitution(0.125);
    // rb.setFriction(1);
    // rb.setRollingFriction(5);

    // this.physicsWorld_.addRigidBody(rb.body_);

    // this.rigidBodies_.push({mesh: box, rigidBody: rb});

    // this.scene_.add(box);
  }

  addFont_(font, words) {
    this.font = font 

    const textGeo = new TextGeometry( words, {
        font: this.font,
        size: 7,
        height: 7,
        curveSegments: 12,
        // bevelEnabled: true,
        bevelThickness: .05,
        bevelSize: .05,
        bevelOffset: 0,
        bevelSegments: 5
    } );

    // const mesh = new THREE.MeshPhysicalMaterial({
    //     color: "#00ff00",
    //     roughness: 0,
    //     flatShading: false
    // })
    // const text = new THREE.Mesh(textGeo, mesh)
    // text.rotation.y = Math.PI * .5
    // text.position.y = 0
    // this.scene_.add(text)
    
    // volume.rotation.y = Math.PI * .5
    // const centerOffset = 0.5 * ( bufferGeom.boundingBox.max.x - bufferGeom.boundingBox.min.x );
    // volume.position.z = centerOffset
    // volume.position.y = 10
    // text.position.z = centerOffset

    textGeo.computeBoundingBox();
    const centerOffset = 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
    console.log(centerOffset);
    textGeo.rotateY(Math.PI * .5)
    textGeo.translate(0, 50, centerOffset)

    this.createSoftVolume( textGeo, 50, 100 );

    // const rbText = new RigidBody();
    // rbText.createBox(1, text.position, text.quaternion, new THREE.Vector3(4, 4, 4));
    // rbText.setRestitution(0.5);
    // rbText.setFriction(1);
    // rbText.setRollingFriction(1);
    // this.physicsWorld_.addRigidBody(rbText.body_);
    
    // this.rigidBodies_.push({mesh: text, rigidBody: rbText});
  }

  
  fixBodies() {
    // this.softBodies_[0].userData.physicsBody = undefined
    if(this.softBodies_.length > 5){
      this.physicsWorld_.removeSoftBody(this.softBodies_[body].userData.physicsBody)
      body++
    }
    // console.log(this.physicsWorld_)
    // console.log(this.softBodies_[0]);
  }

  step_(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;

    this.countdown_ -= timeElapsedS;
    if (this.countdown_ < 0 && this.count_ < 10) {
      this.countdown_ = 0.25;
      this.count_ += 1;
      this.spawn_();
    }

    this.physicsWorld_.stepSimulation(timeElapsedS, 10);

    for (let i = 0; i < this.rigidBodies_.length; ++i) {
      // console.log(this.rigidBodies_[i]);
      this.rigidBodies_[i].rigidBody.motionState_.getWorldTransform(this.tmpTransform_);
      const pos = this.tmpTransform_.getOrigin();
      const quat = this.tmpTransform_.getRotation();
      const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());
      const quat3 = new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());

      this.rigidBodies_[i].mesh.position.copy(pos3);
      this.rigidBodies_[i].mesh.quaternion.copy(quat3);
    }

// Update soft volumes
for ( let i = 0, il = this.softBodies_.length; i < il; i ++ ) {

  const volume = this.softBodies_[ i ];
  const geometry = volume.geometry;
  const softBody = volume.userData.physicsBody;
  const volumePositions = geometry.attributes.position.array;
  const volumeNormals = geometry.attributes.normal.array;
  const association = geometry.ammoIndexAssociation;
  const numVerts = association.length;

  if(softBody) {
    // console.log("hello");
    // console.log(softBody);
    const nodes = softBody.get_m_nodes();
      for ( let j = 0; j < numVerts; j ++ ) {
  
        const node = nodes.at( j );
        const nodePos = node.get_m_x();
        const x = nodePos.x();
        const y = nodePos.y();
        const z = nodePos.z();
        const nodeNormal = node.get_m_n();
        const nx = nodeNormal.x();
        const ny = nodeNormal.y();
        const nz = nodeNormal.z();
  
        const assocVertex = association[ j ];
  
        for ( let k = 0, kl = assocVertex.length; k < kl; k ++ ) {
  
          let indexVertex = assocVertex[ k ];
          volumePositions[ indexVertex ] = x;
          volumeNormals[ indexVertex ] = nx;
          indexVertex ++;
          volumePositions[ indexVertex ] = y;
          volumeNormals[ indexVertex ] = ny;
          indexVertex ++;
          volumePositions[ indexVertex ] = z;
          volumeNormals[ indexVertex ] = nz;
  
        }
  
      }
  
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.normal.needsUpdate = true;
  } else {
    console.log("no body");
  }

  }
  
}
}


let APP_ = null;

window.addEventListener('DOMContentLoaded', async () => {
  Ammo().then((lib) => {
    Ammo = lib;
    APP_ = new BasicWorldDemo();
    APP_.initialize();
    window.world = APP_
  });
});

function addText(loadedFont) {
    APP_.addFont_(loadedFont, scriptWords[0])
}

let wordCount = 0;

window.addEventListener('click', () => {

  if (wordCount < scriptWords.length) {
    APP_.fixBodies()
    APP_.addFont_(loadedFont, scriptWords[wordCount])
    wordCount++
  }
}
  )