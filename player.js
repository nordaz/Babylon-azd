let zMovement = 5;
function createPlayer(scene, createFollowCamera) {
  let player = new BABYLON.MeshBuilder.CreateBox(
    "heroPlayer",
    { height: 1, depth: 6, width: 6 },
    scene
  )
  BABYLON.SceneLoader.ImportMesh(
      "him",
      "models/Dude/",
      "Dude.babylon",
      scene,
      (newMeshes, particleSystems, skeletons) => {
         p = newMeshes[0];

          p.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
          p.position.y = -1;
          p.position.x = -15;
          p.position.z = -40;
          p.speed = 1;
          p.frontVector = new BABYLON.Vector3(0, 0, 1);
          p.name = "heroPlayer";
    
          let a = scene.beginAnimation(skeletons[0], 0, 120, true, 1);
    
          player.dispose();
          player = p;
          let followCamera = createFollowCamera(scene, player);
          scene.activeCamera = followCamera;
      }
    );

    player.move = () => {
    
      //player.position.z += -1; // speed should be in unit/s, and depends on
    // deltaTime !

    // if we want to move while taking into account collision detections
    // collision uses by default "ellipsoids"

    let yMovement = 0;

    if (player.position.y > 2) {
      zMovement = 0;
      yMovement = -2;
    }
    //player.moveWithCollisions(new BABYLON.Vector3(0, yMovement, zMovement));

    if (inputStates.down) {
      //player.moveWithCollisions(new BABYLON.Vector3(0, 0, 1*player.speed));
      player.moveWithCollisions(
        player.frontVector.multiplyByFloats(player.speed, player.speed, player.speed)
      );
    }
    if (inputStates.up) {
      //player.moveWithCollisions(new BABYLON.Vector3(0, 0, -1*player.speed));
      player.moveWithCollisions(
        player.frontVector.multiplyByFloats(-player.speed, -player.speed, -player.speed)
      );
    }
    if (inputStates.left) {
      //player.moveWithCollisions(new BABYLON.Vector3(-1*player.speed, 0, 0));
      player.rotation.y -= 0.02;
      player.frontVector = new BABYLON.Vector3(
        Math.sin(player.rotation.y),
        0,
        Math.cos(player.rotation.y)
      );
    }
    if (inputStates.right) {
      //player.moveWithCollisions(new BABYLON.Vector3(1*player.speed, 0, 0));
      player.rotation.y += 0.02;
      player.frontVector = new BABYLON.Vector3(
        Math.sin(player.rotation.y),
        0,
        Math.cos(player.rotation.y)
      );
    }
  }

    player.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
    player.position.y = -1;
    player.position.x = -15;
    player.position.z = -40;
    player.speed = 1;
    player.frontVector = new BABYLON.Vector3(0, 0, 1);
    player.name = "heroPlayer";

  return player;
}