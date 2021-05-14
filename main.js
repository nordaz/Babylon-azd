let canvas;
let engine;
let scene;
let inputStates = {};

window.onload = startGame;

function startGame() {
  canvas = document.getElementById("renderCanvas");
  engine = new BABYLON.Engine(canvas, true);
  scene = createScene();

  modifySettings();

  let player = scene.getMeshByName("heroPlayer");

  engine.runRenderLoop(() => {
    let deltaTime = engine.getDeltaTime();

    let heroDude = scene.getMeshByName("heroDude");
    if (heroDude) heroDude.Dude.move(scene);

    if (scene.dudes) {
      for (var i = 0; i < scene.dudes.length; i++) {
        scene.dudes[i].Dude.move(scene);
      }
    }

    if (player) player.move();
    if (scene.activeCamera) scene.render();
  });
}

var createScene = function () {
  var scene = new BABYLON.Scene(engine);
  let ground = createGround(scene);

  createLights(scene);

  createSky(scene);

  createTrees(scene);


  let player = createPlayer(scene, createFollowCamera);
  
  createHeroDude(scene)

  return scene;
};

function createGround(scene) {
  // Ground
  const ground = BABYLON.Mesh.CreateGroundFromHeightMap(
    "ground",
    "textures/heightMap.png",
    200,
    200,
    100,
    0,
    10,
    scene,
    false
  );
  var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
  groundMaterial.diffuseTexture = new BABYLON.Texture(
    "textures/ground.jpg",
    scene
  );
  groundMaterial.diffuseTexture.uScale = 6;
  groundMaterial.diffuseTexture.vScale = 6;
  groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  ground.position.y = -2.05;
  ground.material = groundMaterial;
  ground.checkCollisions = true;
}

function createLights(scene) {
  // Light
  var light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
}

function createTrees(scene) {
  var green = new BABYLON.StandardMaterial("green", scene);
  green.diffuseColor = new BABYLON.Color3(0, 1, 0);

  //trunk and branch material
  var bark = new BABYLON.StandardMaterial("bark", scene);
  bark.emissiveTexture = new BABYLON.Texture(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Bark_texture_wood.jpg/800px-Bark_texture_wood.jpg",
    scene
  );
  bark.diffuseTexture = new BABYLON.Texture(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Bark_texture_wood.jpg/800px-Bark_texture_wood.jpg",
    scene
  );
  bark.diffuseTexture.uScale = 2.0; //Repeat 5 times on the Vertical Axes
  bark.diffuseTexture.vScale = 2.0; //Repeat 5 times on the Horizontal Axes

  //Tree parameters
  var trunk_height = 15;
  var trunk_taper = 0.6;
  var trunk_slices = 5;
  var boughs = 2; // 1 or 2
  var forks = 4;
  var fork_angle = Math.PI / 4;
  var fork_ratio = 2 / (1 + Math.sqrt(5)); //PHI the golden ratio
  var branch_angle = Math.PI / 3;
  var bow_freq = 2;
  var bow_height = 3.5;
  var branches = 10;
  var leaves_on_branch = 5;
  var leaf_wh_ratio = 0.5;

  var tree = createTree(
    trunk_height,
    trunk_taper,
    trunk_slices,
    bark,
    boughs,
    forks,
    fork_angle,
    fork_ratio,
    branches,
    branch_angle,
    bow_freq,
    bow_height,
    leaves_on_branch,
    leaf_wh_ratio,
    green,
    scene
  );
  tree.position.y = 0;
}

function createSky(scene) {
  // Sky material
  var skyboxMaterial = new BABYLON.SkyMaterial("skyMaterial", scene);
  skyboxMaterial.backFaceCulling = false;
  //skyboxMaterial._cachedDefines.FOG = true;

  // Sky mesh (box)
  var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
  skybox.material = skyboxMaterial;

  var setSkyConfig = function (property, from, to) {
    var keys = [
      { frame: 0, value: from },
      { frame: 100, value: to },
    ];

    var animation = new BABYLON.Animation(
      "animation",
      property,
      100,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    animation.setKeys(keys);

    scene.stopAnimation(skybox);
    scene.beginDirectAnimation(skybox, [animation], 0, 100, false, 1);
  };

  // Set to Day
  setSkyConfig("material.inclination", skyboxMaterial.inclination, 0);
}

function createFollowCamera(scene, target) {
  let camera = new BABYLON.FollowCamera(
    "playerFollowCamera",
    target.position,
    scene,
    target
  );

  camera.radius = 40; // how far from the object to follow
  camera.heightOffset = 14; // how high above the object to place the camera
  camera.rotationOffset = 0; // the viewing angle
  camera.cameraAcceleration = 0.1; // how fast to move
  camera.maxCameraSpeed = 5; // speed limit

  return camera;
}

function createHeroDude(scene) {
  // load the Dude 3D animated model
  // name, folder, skeleton name
  BABYLON.SceneLoader.ImportMesh(
    "him",
    "models/Dude/",
    "Dude.babylon",
    scene,
    (newMeshes, particleSystems, skeletons) => {
      let heroDude = newMeshes[0];
      heroDude.position = new BABYLON.Vector3(0, 0, 5); // The original dude
      // make it smaller
      heroDude.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
      //heroDude.speed = 0.1;

      // give it a name so that we can query the scene to get it by name
      heroDude.name = "heroDude";

      // there might be more than one skeleton in an imported animated model. Try console.log(skeletons.length)
      // here we've got only 1.
      // animation parameters are skeleton, starting frame, ending frame,  a boolean that indicate if we're gonna
      // loop the animation, speed,
      let a = scene.beginAnimation(skeletons[0], 0, 120, true, 1);

      let hero = new Dude(heroDude, 0.1);

      // make clones
      scene.dudes = [];
      for (let i = 0; i < 10; i++) {
        scene.dudes[i] = doClone(heroDude, skeletons, i);
        scene.beginAnimation(scene.dudes[i].skeleton, 0, 120, true, 1);

        // Create instance with move method etc.
        var temp = new Dude(scene.dudes[i], 0.3);
        // remember that the instances are attached to the meshes
        // and the meshes have a property "Dude" that IS the instance
        // see render loop then....
      }
    }
  );
}




function doClone(originalMesh, skeletons, id) {
  let myClone;
  let xrand = Math.floor(Math.random() * 100 );
  let zrand = Math.floor(Math.random() * 100 );

  myClone = originalMesh.clone("clone_" + id);
  myClone.position = new BABYLON.Vector3(xrand, 0, zrand);

  if (!skeletons) return myClone;

  // The mesh has at least one skeleton
  if (!originalMesh.getChildren()) {
    myClone.skeleton = skeletons[0].clone("clone_" + id + "_skeleton");
    return myClone;
  } else {
    if (skeletons.length === 1) {
      // the skeleton controls/animates all children, like in the Dude model
      let clonedSkeleton = skeletons[0].clone("clone_" + id + "_skeleton");
      myClone.skeleton = clonedSkeleton;
      let nbChildren = myClone.getChildren().length;

      for (let i = 0; i < nbChildren; i++) {
        myClone.getChildren()[i].skeleton = clonedSkeleton;
      }
      return myClone;
    } else if (skeletons.length === originalMesh.getChildren().length) {
      // each child has its own skeleton
      for (let i = 0; i < myClone.getChildren().length; i++) {
        myClone.getChildren()[i].skeleton() = skeletons[i].clone(
          "clone_" + id + "_skeleton_" + i
        );
      }
      return myClone;
    }
  }

  return myClone;
}

window.addEventListener("resize", () => {
  engine.resize();
});

function modifySettings() {
  // as soon as we click on the game window, the mouse pointer is "locked"
  // you will have to press ESC to unlock it
  scene.onPointerDown = () => {
    if (!scene.alreadyLocked) {
      console.log("requesting pointer lock");
      canvas.requestPointerLock();
    } else {
      console.log("Pointer already locked");
    }
  };

  document.addEventListener("pointerlockchange", () => {
    let element = document.pointerLockElement || null;
    if (element) {
      // lets create a custom attribute
      scene.alreadyLocked = true;
    } else {
      scene.alreadyLocked = false;
    }
  });

  // key listeners for the tank
  inputStates.left = false;
  inputStates.right = false;
  inputStates.up = false;
  inputStates.down = false;
  inputStates.space = false;

  //add the listener to the main, window object, and update the states
  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "ArrowLeft" || event.key === "q" || event.key === "Q") {
        inputStates.left = true;
      } else if (
        event.key === "ArrowUp" ||
        event.key === "z" ||
        event.key === "Z"
      ) {
        inputStates.up = true;
      } else if (
        event.key === "ArrowRight" ||
        event.key === "d" ||
        event.key === "D"
      ) {
        inputStates.right = true;
      } else if (
        event.key === "ArrowDown" ||
        event.key === "s" ||
        event.key === "S"
      ) {
        inputStates.down = true;
      } else if (event.key === " ") {
        inputStates.space = true;
      }
    },
    false
  );

  //if the key will be released, change the states object
  window.addEventListener(
    "keyup",
    (event) => {
      if (event.key === "ArrowLeft" || event.key === "q" || event.key === "Q") {
        inputStates.left = false;
      } else if (
        event.key === "ArrowUp" ||
        event.key === "z" ||
        event.key === "Z"
      ) {
        inputStates.up = false;
      } else if (
        event.key === "ArrowRight" ||
        event.key === "d" ||
        event.key === "D"
      ) {
        inputStates.right = false;
      } else if (
        event.key === "ArrowDown" ||
        event.key === "s" ||
        event.key === "S"
      ) {
        inputStates.down = false;
      } else if (event.key === " ") {
        inputStates.space = false;
      }
    },
    false
  );
}
