import * as THREE from 'three';
import {
  TextGeometry
} from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/geometries/TextGeometry.js'
import {
  OrbitControls
} from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';
import {
  FontLoader
} from "https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/loaders/FontLoader.js"

const DEFAULT_MASS = 10;


class RigidBody {
  constructor() {}

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
    if (mass > 0) {
      this.shape_.calculateLocalInertia(mass, this.inertia_);
    }

    this.info_ = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState_, this.shape_, this.inertia_);
    this.body_ = new Ammo.btRigidBody(this.info_);
  }
}

class BasicWorldDemo {
  constructor() {}

  initialize() {
    this.collisionConfiguration_ = new Ammo.btDefaultCollisionConfiguration();
    this.dispatcher_ = new Ammo.btCollisionDispatcher(this.collisionConfiguration_);
    this.broadphase_ = new Ammo.btDbvtBroadphase();
    this.solver_ = new Ammo.btSequentialImpulseConstraintSolver();
    this.physicsWorld_ = new Ammo.btDiscreteDynamicsWorld(
      this.dispatcher_, this.broadphase_, this.solver_, this.collisionConfiguration_);
    this.physicsWorld_.setGravity(new Ammo.btVector3(0, -200, 0));

    this.threejs_ = new THREE.WebGLRenderer({
      antialias: true,
      canvas: document.querySelector("#scene")
    });
    this.threejs_.shadowMap.enabled = true;
    this.threejs_.shadowMap.type = THREE.PCFSoftShadowMap;
    this.threejs_.setPixelRatio(window.devicePixelRatio);
    this.threejs_.setSize(window.innerWidth, window.innerHeight);


    this.BLUE = new THREE.Color("rgb(84,139,192)")
    this.YELLOW = new THREE.Color("rgb(246,230,77)")
    this.LAMB = new THREE.Color("rgb(238,215,185)")
    // this.GREEN = new THREE.cColor("rgb(73,156,118)")
    this.CORAL = new THREE.Color("rgb(234,122,93)")

    // this.BBLUE = new THREE.Color("rgb(134,189,242)")
    // this.BYELLOW = new THREE.Color("rgb(255,255,127)")
    // this.BLAMB = new THREE.Color("rgb(255,255,205)")
    // this.BGREEN = new THREE.Color("rgb(123,206,168)")
    // this.BCORAL = new THREE.Color("rgb(255,172,143)")
    
    this.BBLUE = 0x0000ff
    this.BYELLOW = 0xffff00
    this.BLAMB = 0xf0f0f0
    // this.BGREEN = 0x00ff00
    this.BCORAL = 0xff0000

    this.colors = [this.BLUE, this.YELLOW, this.LAMB, this.GREEN, this.CORAL]
    this.brightcolors = [this.BBLUE, this.BYELLOW, this.BLAMB, this.BGREEN, this.BCORAL]

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
    
    let spotlight = new THREE.SpotLight(0xFFFFFF, 1.0)
    spotlight.position.set(0, 10, 5)
    this.scene_.add(spotlight);
    
    light = new THREE.AmbientLight(0x202020);
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
    // this.scene_.background = texture;
    const video = document.querySelector("#playVid")
    var texturebg = new THREE.VideoTexture( video );
      // texturebg.minFilter = THREE.LinearFilter;
      // texturebg.magFilter = THREE.LinearFilter;
      // texturebg.format = THREE.RGBFormat;
            
      this.scene_.background = new THREE.Color(0x00ff00);

      const groundTexture = new THREE.TextureLoader().load("./rcBanner.png");
      groundTexture.wrapS = THREE.RepeatWrapping;
      groundTexture.wrapT = THREE.RepeatWrapping;
      groundTexture.repeat.set(1, 1);

    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(100, 1, 100),
      new THREE.MeshStandardMaterial({
        // color: 0x404040,
        map: groundTexture
        // roughness: 0
      }));
    ground.castShadow = false;
    ground.receiveShadow = true;
    ground.rotation.z = -0.09
    this.scene_.add(ground);

    const rbGround = new RigidBody();
    rbGround.createBox(0, ground.position, ground.quaternion, new THREE.Vector3(100, 1, 100));
    rbGround.setRestitution(0.09);
    this.physicsWorld_.addRigidBody(rbGround.body_);

    this.rigidBodies_ = [];


    const fontloader = new FontLoader();
    fontloader.load('./helvetiker.json', function (font) {
      addText(font)
      window.loadedFont = font
    })


    let isSphere = true;

    this.tmpTransform_ = new Ammo.btTransform();

    this.countdown_ = 1.0;
    this.count_ = 10;
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

  spawn_() {
    const scale = Math.random() * 4 + 4;
    const color = Math.floor(Math.random() * this.colors.length)
    const box = new THREE.Mesh(
      new THREE.SphereGeometry(scale, scale, 20),
      new THREE.MeshPhysicalMaterial({
        color: this.colors[color],
        roughness: 0,
        clearcoat: 1
      }));
    box.position.set(Math.random() * 2 - 1, 200.0, Math.random() * 2 - 1);
    box.quaternion.set(0, 0, 0, 1);
    box.castShadow = true;
    box.receiveShadow = true;

    const rb = new RigidBody();
    rb.createBox(DEFAULT_MASS, box.position, box.quaternion, new THREE.Vector3(scale, scale, scale), null);
    rb.setRestitution(0.125);
    rb.setFriction(1);
    rb.setRollingFriction(5);

    this.physicsWorld_.addRigidBody(rb.body_);

    this.rigidBodies_.push({
      mesh: box,
      rigidBody: rb
    });

    this.scene_.add(box);
  }

  removeFriction() {
    for (let i = 0; i < this.rigidBodies_.length; i++) {
      this.rigidBodies_[i].rigidBody.setFriction(0)
      this.rigidBodies_[i].rigidBody.setRollingFriction(0)
      
    }
  }

  addFont_(font, words) {
    this.font = font

    const textGeo = new TextGeometry(words, {
      font: this.font,
      size: 5,
      height: 5,
      curveSegments: 12,
      bevelEnabled: false,
      bevelThickness: .05,
      bevelSize: .05,
      bevelOffset: 0,
      bevelSegments: 5
    });

    const color = Math.floor(Math.random() * this.colors.length)

    const mesh = new THREE.MeshPhysicalMaterial({
      color: this.brightcolors[color],
      lightMapIntensity:1,
      reflectivity: 1,
      roughness: 0,
      flatShading: false
    })
    const text = new THREE.Mesh(textGeo, mesh)
    text.rotation.y = Math.PI * .5
    textGeo.computeBoundingBox();
    const centerOffset = 0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
    text.position.z = centerOffset
    text.position.y = 50
    this.scene_.add(text)


    const rbText = new RigidBody();
    rbText.createBox(1, text.position, text.quaternion, new THREE.Vector3(4, 4, 4));
    rbText.setRestitution(0.5);
    rbText.setFriction(1);
    rbText.setRollingFriction(1);
    this.physicsWorld_.addRigidBody(rbText.body_);

    this.rigidBodies_.push({
      mesh: text,
      rigidBody: rbText
    });
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
      this.rigidBodies_[i].rigidBody.motionState_.getWorldTransform(this.tmpTransform_);
      const pos = this.tmpTransform_.getOrigin();
      const quat = this.tmpTransform_.getRotation();
      const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());
      const quat3 = new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());

      this.rigidBodies_[i].mesh.position.copy(pos3);
      this.rigidBodies_[i].mesh.quaternion.copy(quat3);
    }
  }

  resetCount() {
    for (let i = 0; i < 10; i++) {
      this.spawn_()
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

window.addEventListener("keydown", (e)=> {
  
  if(e.key == "9"){
    window.world.removeFriction()
  } else {
    window.world.resetCount()
  }


}) 
function addText(loadedFont) {
  // APP_.addFont_(loadedFont, "Test")
}

// let scriptWords = `Your old geometry tutor, a sprightly yogic septuagenarian who lives on the far edge of town, is relocating to Jefferson City, Missouri to be closer to his niece, and he’s offered you sixty dollars to clean out his attic. Most of the accumulation is plain old crap. A scuffed-up Emmett Kelly clown painting, a tunic, a pair of mildewy bowling shoes, some Better Home & Gardens magazines from the 1990s. Ick!


// There’s one item that piques your curiosity—a pristine reel-to-reel box with the words “Tupping Time Plus” scrawled in orange felt marker. You open the thing and are confronted by a noxious smell, a well-worn tape, and a moth-eaten lyrics sheet credited to a man named Calvin Grad, a suite of five song-poems written in tightly-wound cursive. 


// You wonder how Calvin Grad must have felt when he wrote all this, and what kind of person he must have been. Music’s interesting because it's so intimate, but a lot of the time you encounter the best stuff by chance. You’re glad that Mr. Grad will never stop believing in love, because things have been kind of hard recently. You wonder how it ended up in that attic, but you guess that’s just the beauty of these sorts of things.
// `

// const scriptWords = ["Your", "old", "geometry", "tutor,", "a", "sprightly", "yogic", "septuagenarian", "who", "lives", "on", "the", "far", "edge", "of", "town,", "is", "relocating", "to", "Jefferson", "City,", "Missouri", "to", "be", "closer", "to", "his", "niece,", "and", "he’s", "offered", "you", "sixty", "dollars", "to", "clean", "out", "his", "attic.", "Most", "of", "the", "accumulation", "is", "plain", "old", "crap.", "A", "scuffed-up", "Emmett", "Kelly", "clown", "painting,", "a", "tunic,", "a", "pair", "of", "mildewy", "bowling", "shoes,", "some", "Better", "Home", "&", "Gardens", "magazines", "from", "the", "1990s.", "Ick!",


//   "There’s", "one", "item", "that", "piques", "your", "curiosity—a", "pristine", "reel-to-reel", "box", "with", "the", "words", "Tupping Time Plus", "scrawled", "in", "orange", "felt", "marker.", "You", "open", "the", "thing", "and", "are", "confronted", "by", "a", "noxious", "smell,", "a", "well-worn", "tape,", "and", "a", "moth-eaten", "lyrics", "sheet", "credited", "to", "a", "man", "named", "Calvin", "Grad,", "a", "suite", "of", "five", "song-poems", "written", "in", "tightly-wound", "cursive.", "You", "wonder", "how", "Calvin", "Grad", "must", "have", "felt", "when", "he", "wrote", "all", "this,", "and", "what", "kind", "of", "person", "he", "must", "have", "been.", "Music’s", "interesting", "because", "it's", "so", "intimate,", "but", "a", "lot", "of", "the", "time", "you", "encounter", "the", "best", "stuff", "by", "chance.", "You’re", "glad", "that", "Mr.", "Grad", "will", "never", "stop", "believing", "in", "love,", "because", "things", "have", "been", "kind", "of", "hard", "recently.", "You", "wonder", "how", "it", "ended", "up", "in", "that", "attic,", "but", "you", "guess", "that’s", "just", "the", "beauty", "of", "these", "sorts", "of", "things."
// ]

let scriptWords = ["","","","","Your", "old", "geometry", "tutor,", "a", "sprightly", "yogic", "septuagenarian", "who", "lives", "on", "the", "far", "edge", "of", "town,", "is", "relocating", "to", "Jefferson,", "Missouri", "to", "be", "closer", "to", "his", "niece,", "and", "he's", "offered", "you", "60", "to", "clean", "out", "his", "attic.", "You've", "barely", "been", "in", "touch", "since", "you", "graduated,", "but", "you've", "always", "liked", "the", "guy.", "You", "know", "he's", "a", "pack", "rat,", "and", "you", "bet", "he's", "got", "some", "interesting", "stuff", "up", "there.",
"Much", "of", "the", "accumulation", "is", "plain", "old", "crap.", "A", "scuffed", "up", "Emmett Kelly clown painting,", "a", "tunic,", "a", "pair", "of", "Mildewey bowling shoes,", "some", "Better Homes & Gardens magazines from the 1990s.","Ick!", "You're", "cramming", "this", "stuff", "willy-nilly", "into", "a", "60", "gallon,", "unscented", "trash", "bag", "to", "take", "to", "the", "Salvation Army Donation Center", "later.",
"Barely", "paying", "heed", "to", "what", "you're", "tossing", "as", "you", "hold", "your", "nose.", "But", "there's", "one", "item", "that", "piques", "your", "curiosity.", "A", "pristine", "reel", "to", "reel", "box", "with", "the", "words", "Tupping Time Plus", "scrawled", "in", "orange", "felt", "marker.", "You", "open", "the", "thing", "and", "are", "confronted", "by", "a", "noxious", "smell,", "a", "well", "worn", "tape,", "and", "a", "moth", "eaten", "lyric", "sheet", "credited", "to", "a", "man", "named", "Calvin Grad.", "A", "suite", "of", "five", "song", "poems", "written", "in", "tightly", "wound", "cursive.", "You", "pour", "them", "over.", "The", "handwriting", "is", "a", "bit", "hard", "to", "make", "out.", "But", "what", "you", "can", "read", "perplexes", "you.", "Martin's", "valet.", "Puffin", "away.", "They", "say", "nobody", "after", "all", "is", "not", "agreed.", "What", "could", "this", "all", "mean?", "When", "you", "finish", "up", "for", "the", "day,", "you", "show", "your", "ex", "tutor", "your", "find", "and", "he", "suggests", "that", "you", "take", "it", "to", "the", "AV", "lab", "in", "the", "strip", "mall", "downtown", "and", "that", "his", "buddy", "Alan", "would", "help", "you", "take", "a", "listen.",
"And", "so", "you", "head", "over", "there", "the", "next", "morning", "after", "spending", "the", "whole", "night", "turning", "it", "over.", "The", "real", "play", "is", "no", "problem,", "and", "you're", "immediately", "confronted", "by", "a", "rustling", "countdown", "and", "a", "gentle,", "arpeggiated", "C", "sharp,", "then", "a", "warm", "voice.", "When", "I", "look", "the", "my", "people", "in", "the", "eye,", "just", "like", "that", "you're", "sucked", "in,", "and", "the", "next", "eight", "minutes", "seem", "to", "go", "by", "in", "a", "flash.", "Written", "in", "good", "old", "Beatlesian", "plainsong,", "this", "five", "point", "musical", "cycle", "is", "a", "rock", "opera", "in", "miniature", "in", "the", "mode", "of", "a", "quick", "one", "while", "he's", "away,", "brown", "shoes", "don't", "make", "it,", "or", "how", "things", "sound", "when", "you're", "about", "to", "fall", "asleep", "on", "a", "bus", "ride.", "The", "tracks", "are", "approached", "in", "a", "range", "of", "style", "and", "sensibility.",
"Bad", "time", "jam,", "nice", "time", "grooves,", "lover's", "lament,", "noodling", "then", "tightness,", "a", "surprise", "key", "change,", "and", "can't", "you", "hear", "a", "little", "bit", "of", "Neil", "Diamond's", "I", "am,", "I", "said.", "You", "wonder", "how", "Calvin Grad", "must", "have", "felt", "when", "he", "wrote", "all", "this,", "and", "what", "kind", "of", "person", "he", "must", "have", "been.", "Music's", "interesting", "because", "it's", "so", "intimate,", "but", "a", "lot", "of", "the", "time", "you", "encounter", "the", "best", "stuff", "by", "chance.",
"You're", "glad", "that", "Mr. Grad", "will", "never", "stop", "believing", "in", "love,", "because", "things", "have", "been", "kind", "of", "hard", "recently.", "You", "wonder", "how", "it", "ended", "up", "in", "that", "attic,", "but", "you", "guess", "that's", "just", "the", "beauty", "of", "these", "sorts", "of", "things." ]
// scriptWords = scriptWords.split(" ")
let strOut = "["
for (let i = 0; i < scriptWords.length; i++) {
  strOut += `"${scriptWords[i]}", `
}
strOut += "]"
console.log(strOut);
let wordPlace = 0
window.addEventListener("click", () => {

  window.world.addFont_(window.loadedFont, scriptWords[wordPlace])
  wordPlace++
})