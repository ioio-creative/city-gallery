import React, {Fragment} from 'react';
// new apis
import { useState, useEffect, useCallback, useMemo } from 'react';

import * as THREE from 'three';
// import OrbitControls from 'three-orbitcontrols';
import OrbitControls from 'utils/vendor/orbitControls';
// import SimplifyModifier from 'utils/vendor/SimplifyModifier';

import jsonCopy from 'utils/js/jsonCopy';

import dcjaiObj from 'media/models/dcjai/dave_pose.obj';
import dcjaiTex from 'media/models/dcjai/GF_Dave_smile.jpg';

import watchTowerObj from 'media/models/watchtower/wooden watch tower2.obj';
import watchTowerTex from 'media/models/watchtower/Wood_Tower_Col.jpg';

import containerObj from 'media/models/container/12281_Container_v2_L2.obj';
import containerTex from 'media/models/container/12281_Container_diffuse.jpg';

import templeObj from 'media/models/temple/Japanese_Temple.obj';
import templeTex from 'media/models/temple/Japanese_Temple_Paint2_Japanese_Shrine_Mat_AlbedoTransparency.png';
import templeNormalTex from 'media/models/temple/Japanese_Temple_Paint2_Japanese_Shrine_Mat_AlbedoTransparency.png';
import templeRoughnessTex from 'media/models/temple/Japanese_Temple_Paint2_Japanese_Shrine_Mat_AlbedoTransparency.png';
import templeMatallicTex from 'media/models/temple/Japanese_Temple_Paint2_Japanese_Shrine_Mat_AlbedoTransparency.png';

import catObj from 'media/models/cat/12221_Cat_v1_l3.obj';
import catTex from 'media/models/cat/Cat_diffuse.jpg';

import birdObj from 'media/models/bird/12213_Bird_v1_l3.obj';
import birdTex from 'media/models/bird/12213_bird_diffuse.jpg';

import cityObj from 'media/models/city/Organodron City.obj';
// import cityTex from 'media/models/city/b1b2.jpg';
import cityTex from 'media/models/city/cta4.jpg';

import trexObj from 'media/models/trex/T-Rex V3.obj';
import trexTex from 'media/models/trex/Diffuse.jpg';

import ironmanObj from 'media/models/ironman/IronMan.obj';
// import ironmanTex from 'media/models/ironman/Diffuse.jpg';

// import './buildingGameContainer.css';
import { TweenMax, Cubic, Bounce } from 'gsap';

const OBJLoader = require('three-obj-loader');
const threeObjLoader = {...THREE};
OBJLoader(threeObjLoader);

const CityDisplayContainer = (props) => {
  const [threeObjects, setThreeObjects] = useState({
    scene: null,
    camera: null,
    containerEl: null,
    mouse: null,
    plane: null,
    tiles: null,
    renderer: null,
    orbitControl: null,
    raycaster: null,
  });
  const [modelsloadedProgress, setModelsLoadedProgress] = useState(0);
  const [renderFloor, setRenderFloor] = useState({});
  const [renderObject, setRenderObject] = useState({});
  const [loadedModels, setLoadedModels] = useState({});
  const [objectSelectingPanelVisible, setObjectSelectingPanelVisible] = useState(false);
  let containerEl = null;
  let animationFrame = null;
  const cameraDistance = 15;
  const setContainerEl = (ref) => containerEl = ref;
  const models = [{
    name: 'dcjai',
    obj: dcjaiObj,
    texture: dcjaiTex,
    scale: 0.02
  },
  {
    name: 'watchtower',
    obj: watchTowerObj,
    texture: watchTowerTex,
    scale: 0.5
  },
  {
    name: 'temple',
    obj: templeObj,
    texture: templeTex,
    scale: 0.1
  },
  {
    name: 'container',
    obj: containerObj,
    texture: containerTex,
    scale: 0.005,
    rotate: {
      x: -Math.PI / 2,
      y: 0,
      z: 0
    }
  },
  {
    name: 'city',
    obj: cityObj,
    texture: cityTex,
    scale: 0.01,
    position: {
      x: 0,
      y: 0,
      z: 3
    }
  },
  {
    name: 'cat',
    obj: catObj,
    texture: catTex,
    scale: 0.05,
    rotate: {
      x: -Math.PI / 2,
      y: 0,
      z: 0
    }
  },
  {
    name: 'bird',
    obj: birdObj,
    texture: birdTex,
    scale: 0.05,
    rotate: {
      x: -Math.PI / 2,
      y: 0,
      z: 0
    }
  },
  {
    name: 'trex',
    obj: trexObj,
    texture: trexTex,
    scale: 0.01,
    rotate: {
      x: 0,
      y: Math.PI,
      z: 0
    }
  },
  {
    name: 'ironman',
    obj: ironmanObj,
    texture: null,
    scale: 0.01,
    // rotate: {
    //   x: 0,
    //   y: Math.PI,
    //   z: 0
    // }
  }]
  useEffect(() => {
    // componentDidMount
    console.log('componentDidMount');
    loadModels();
    // the return function can treat as componentWillUnmount
    return () => {
      console.log('componentWillUnmount');
    }

    // without [], useEffect will run every render, i.e. = componentDidUpdate
    // the [] can put the variable to monitor, when the variable changed, useEffect will run
    // }, [count]) // everytime count is updated, useEffect will run, i.e. = setState callback
  }, [])
  useEffect(() => {
    if (modelsloadedProgress === 100) {
      initScene();
    }
  },[modelsloadedProgress])
  useEffect(()=>{
    if (threeObjects.camera) {
      window.addEventListener('resize', onResize );
    }
    // the return function can treat as componentWillUnmount
    return () => {
      window.removeEventListener('resize', onResize );
    }
  }, [threeObjects])
  const onResize = (event) => {
    threeObjects.camera.aspect = threeObjects.containerEl.offsetWidth / threeObjects.containerEl.offsetHeight;
    threeObjects.camera.updateProjectionMatrix();
    threeObjects.renderer.setSize(threeObjects.containerEl.offsetWidth, threeObjects.containerEl.offsetHeight);
  }
  const initScene = () => {
    const floorWidth = 10;
    const viewWidth = 25;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 50, containerEl.offsetWidth / containerEl.offsetHeight, 1, viewWidth * 2 );
    camera.position.set(cameraDistance, cameraDistance, cameraDistance /2);
    // camera.position.clamp(new THREE.Vector3(-floorWidth, -floorWidth, -floorWidth), new THREE.Vector3(floorWidth, floorWidth, floorWidth));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    // add a floor
    const tiles = [];
    // mouse
    const mouse = new THREE.Vector2();
    
    // try add a ball with texture
    
    // this.scene.add(group);

    // // lights
    // const lights = [];
    // lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
    // lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
    // lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

    // lights[ 0 ].position.set( 0, 200, 0 );
    // lights[ 1 ].position.set( 100, 200, 100 );
    // lights[ 2 ].position.set( - 100, - 200, - 100 );

    // scene.add( lights[ 0 ] );
    // scene.add( lights[ 1 ] );
    // scene.add( lights[ 2 ] );

    // const light = new THREE.PointLight(0xFFFFFF, 1, 0);
    const light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.set(50, 100, 100);
    // light.castShadow = true;
    // light.shadow.mapSize.width = 512;  // default
    // light.shadow.mapSize.height = 512; // default
    // light.shadow.camera.near = 0.5;       // default
    // light.shadow.camera.far = 500;
    scene.add(light);

    const renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( containerEl.offsetWidth, containerEl.offsetHeight );
    renderer.setClearColor( 0x000000, 1 );
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerEl.appendChild( renderer.domElement );

    // add control
    const orbitControl = new OrbitControls( camera, renderer.domElement );
    // auto rotate
    // orbitControl.autoRotate = true;
    // dampling
    orbitControl.enableDamping = true;
    orbitControl.dampingFactor = 0.05;
    // to cancel out the super fast rotation after enabled damping
    // orbitControl.enableRotate = false;
    orbitControl.rotateSpeed = 0.01;
    // orbitControl.autoRotateSpeed = 0.05;
    
    /**
     * limit the vertical rotation
     * https://stackoverflow.com/questions/25308943/limit-orbitcontrols-horizontal-rotation/25311658#25311658
     **/ 
    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians
    orbitControl.minPolarAngle = Math.PI / 8;
    orbitControl.maxPolarAngle = Math.PI * 3 / 8;
    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    orbitControl.minAzimuthAngle = Math.PI / 4;
    orbitControl.maxAzimuthAngle = Math.PI / 4; 
    
    // to disable zoom
    // orbitControl.enableZoom = false;
    orbitControl.minDistance = 10;
    orbitControl.maxDistance = 10;
    // to disable rotation
    // orbitControl.enableRotate = false;
    // to disable pan
    // orbitControl.enablePan = false;
    orbitControl.panSpeed = 0.05;
    // console.log(orbitControl);
    orbitControl.mouseButtons = {
      LEFT: THREE.MOUSE.RIGHT,
      MIDDLE: THREE.MOUSE.MIDDLE,
      RIGHT: THREE.MOUSE.LEFT
    }
    // raycaster
    const raycaster = new THREE.Raycaster(camera.position, new THREE.Vector3(0, 0, 0), 0, orbitControl.maxDistance + Math.sqrt((floorWidth + 1) * (floorWidth + 1) * 2));
    setThreeObjects({
      scene: scene,
      camera: camera,
      containerEl: containerEl,
      mouse: mouse,
      tiles: tiles,
      // plane: plane,
      renderer: renderer,
      orbitControl: orbitControl,
      raycaster: raycaster
    })
  }

  const loadModels = () => {
    const objLoader = new threeObjLoader.OBJLoader();
    const textureLoader = new THREE.TextureLoader();
    const totalProgress = models.length;
    const loadedProgress = [];
    models.forEach((model, idx) => {
      let modelLoaded = null;
      let textureLoaded = null;
      // const modifier = new SimplifyModifier();
      objLoader.load(
        model.obj,
        (object) => {
          modelLoaded = object;
          const obj = object.children[0];
          // if (model.name === 'trex') {
            // object.children.splice(45, 15);
            object.children.forEach(child => {
              // if (child.name !== 'Simple_Body002') {
                child.scale.set(model.scale, model.scale, model.scale);
                if (model.rotate) {
                  child.rotation.set(model.rotate.x, model.rotate.y, model.rotate.z);
                }
                if (model.position) {
                  child.position.set(model.position.x, model.position.y, model.position.z);
                }
              // }
            })
          // }
          // let count = obj.geometry.attributes.position.count;
          // if (count > 20000) {
          //   while (count > 20000)
          //     count = Math.floor(count / 2);
          //   obj.geometry = modifier.modify(obj.geometry, count);
          // }
          console.log(`${model.name}: ${obj.geometry.attributes.position.count}`);
          // obj.scale.set(model.scale, model.scale, model.scale);
          // if (model.rotate) {
          //   obj.rotation.set(model.rotate.x, model.rotate.y, model.rotate.z);
          // }
          // if (model.position) {
          //   obj.position.set(model.position.x, model.position.y, model.position.z);
          // }
          modelLoaded.needsUpdate = true;
          if (textureLoaded || !model.texture) {
            if (Array.isArray(modelLoaded.children[0].material)) {
              modelLoaded.children[0].material.forEach(material =>
                material.map = textureLoaded
              )
            } else {
              modelLoaded.children[0].material.map = textureLoaded;
            }
            // modelLoaded.children[0].castShadow = true;
            setLoadedModels((prevLoadedModels) => {
              return {
                ...prevLoadedModels,
                [model.name]: modelLoaded
              }
            })
          }
        }, (xhr) =>{
          loadedProgress[idx] = xhr.loaded / xhr.total;
          const totalLoaded = loadedProgress.reduce((total, sum) => total + sum);
          console.log('model: ' + totalLoaded / totalProgress * 100 + '%');
          setModelsLoadedProgress(totalLoaded / totalProgress * 100);
        }
      )
      if (model.texture) {
        textureLoader.load(
          model.texture,
          (texture) => {
            textureLoaded = texture;
            if (modelLoaded) {
              if (Array.isArray(modelLoaded.children[0].material)) {
                modelLoaded.children[0].material.forEach(material =>
                  material.map = textureLoaded
                )
              } else {
                modelLoaded.children[0].material.map = textureLoaded;
              }
              // modelLoaded.children[0].material.map = textureLoaded;
              textureLoaded.needsUpdate = true;
              setLoadedModels((prevLoadedModels) => {
                return {
                  ...prevLoadedModels,
                  [model.name]: modelLoaded
                }
              })
            }
          }
        )
      }
    })
  }
  useEffect(() => {
    if (animationFrame)
      cancelAnimationFrame(animationFrame);
    // console.log(threeObjects);
    if (threeObjects.scene) {
      update();
    }

  }, [threeObjects, loadedModels]);
  const update = () => {
    animationFrame = requestAnimationFrame(update);
    threeObjects.orbitControl.update();

    // update the floor base on camera position here
    // console.log(threeObjects.camera.position);
    updateFloor(threeObjects.camera.position);
    updateObject(threeObjects.camera.position);

    threeObjects.renderer.render( threeObjects.scene, threeObjects.camera );
  }
  const onClick = (event) => {
    const {containerEl, raycaster, tiles, camera, scene} = threeObjects;
    const mouse = {x: 0, y: 0};
    mouse.x = ( (event.clientX - containerEl.offsetLeft) / containerEl.offsetWidth ) * 2 - 1;
    mouse.y = - ( (event.clientY - containerEl.offsetTop) / containerEl.offsetHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    const intersections = raycaster.intersectObjects( scene.children );
    let intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;
    if (intersection) {
      console.log(intersection.object.userData);
      // setObjectSelectingPanelVisible(true);
    } else {
      console.log('no intersection');
    }
  }
  const onMouseDown = (event) => {
    const {containerEl, raycaster, tiles, camera} = threeObjects;
    const mouse = {x: 0, y: 0};
    mouse.x = ( (event.clientX - containerEl.offsetLeft) / containerEl.offsetWidth ) * 2 - 1;
    mouse.y = - ( (event.clientY - containerEl.offsetTop) / containerEl.offsetHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    const intersections = raycaster.intersectObjects( tiles );
    let intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;
    if (intersection) {
      threeObjects.orbitControl.enabled = false;
    } else {
      threeObjects.orbitControl.enabled = true;
    }
  }
  const onMouseUp = (event) => {
    threeObjects.orbitControl.enabled = true;
  }
  const updateFloor = (position) => {
    const cameraX = position.x;
    const cameraY = position.y;
    const cameraZ = position.z;
    const floorWidth = 5;
    const viewWidth = 30;
    const scene = threeObjects.scene;
    // const floor
    const viewingFloorX = Math.round(cameraX / floorWidth);
    const viewingFloorZ = Math.round(cameraZ / floorWidth);
    // console.log(threeObjects.scene.children.length);
    // assume the floor is some position in front of the camera
    // console.log(cameraX, cameraZ);
    setRenderFloor((prevRenderFloor) => {
      // console.log(viewingFloorX, viewingFloorZ);
      const tmpFloor = {}; // jsonCopy(prevRenderFloor);
      const minX = viewingFloorX;
      const minZ = viewingFloorZ;
      const maxX = viewingFloorX + Math.ceil(viewWidth / floorWidth);
      const maxZ = viewingFloorZ + Math.ceil(viewWidth / floorWidth);

      Object.keys(prevRenderFloor).forEach(tmpXtmpZ => {
        const splited = tmpXtmpZ.split(',');
        const tmpX = splited[0];
        const tmpZ = splited[1];
        if (prevRenderFloor[tmpXtmpZ] &&
          (tmpX < minX || tmpZ < minZ ||
          tmpX > maxX || tmpZ > maxZ)) {
          // remove objects outside viewport
          const obj = scene.getObjectById(prevRenderFloor[tmpXtmpZ]);
          scene.remove(obj);
          // need to delete the key to remain the performance
          tmpFloor[tmpXtmpZ] = null;
          // delete tmpFloor[tmpXtmpZ];
        }
      })
      for (let floorX = maxX; floorX > minX; floorX--) {
        for (let floorZ = maxZ; floorZ > minZ ; floorZ--) {
          const tmpXtmpZ = `${floorX},${floorZ}`;
          // console.log(prevRenderFloor);
          // console.log((!prevRenderFloor[floorX]),(prevRenderFloor[floorX] && !prevRenderFloor[floorX][floorZ]));
          if ((!prevRenderFloor[tmpXtmpZ])) {
            const modelIdx = ((floorX + floorZ) % models.length + models.length) % models.length;
            const floorGeometry = new THREE.PlaneGeometry( floorWidth, floorWidth );
            const floorColor = new THREE.Color(`rgb(${~~((floorZ % 2 + 2) % 2 + (floorX % 2 + 2) % 2) * 127},${~~((floorZ % 2 + 2) % 2 + (floorX % 2 + 2) % 2) * 127},${~~((floorZ % 2 + 2) % 2 + (floorX % 2 + 2) % 2) * 127})`);
            // const floorColor = 0xcccccc;
            const floorMaterial = new THREE.MeshBasicMaterial({ color: floorColor, side: THREE.FrontSide });
            
            const floor = new THREE.Mesh( floorGeometry, floorMaterial );
            floor.translateX((floorX - Math.ceil(viewWidth / floorWidth - 1)) * floorWidth);
            floor.translateZ((floorZ - Math.ceil(viewWidth / floorWidth) + 1) * floorWidth);
            floor.rotateX(-Math.PI / 2);
            scene.add( floor );
            
            floor.userData = {
              floorX: floorX,
              floorZ: floorZ,
              name: models[modelIdx]['name']
            };
            tmpFloor[tmpXtmpZ] = floor.id;
          }
        }
      }
      // console.log(scene.children.length);
      return {...prevRenderFloor, ...tmpFloor};
    })
  }
  const getLoadedObject = useCallback((name) => {
    return loadedModels[name]? loadedModels[name].clone(): null;
  }, [loadedModels]);
  const updateObject = (position) => {
    const cameraX = position.x;
    const cameraY = position.y;
    const cameraZ = position.z;
    const floorWidth = 5;
    const viewWidth = 30;
    const scene = threeObjects.scene;
    // const floor
    const viewingFloorX = Math.round(cameraX / floorWidth);
    const viewingFloorZ = Math.round(cameraZ / floorWidth);
    // console.log(threeObjects.scene.children.length);
    // assume the floor is some position in front of the camera
    // console.log(cameraX, cameraZ);
    setRenderObject((prevRenderObject) => {
      // console.log(viewingFloorX, viewingFloorZ);
      const tmpObject = {}; // jsonCopy(prevRenderObject);
      const minX = viewingFloorX;
      const minZ = viewingFloorZ;
      const maxX = viewingFloorX + Math.ceil(viewWidth / floorWidth);
      const maxZ = viewingFloorZ + Math.ceil(viewWidth / floorWidth);

      Object.keys(prevRenderObject).forEach(tmpXtmpZ => {
        const splited = tmpXtmpZ.split(',');
        const tmpX = splited[0];
        const tmpZ = splited[1];
        if (prevRenderObject[tmpXtmpZ] && 
          (tmpX < minX || tmpZ < minZ ||
          tmpX > maxX || tmpZ > maxZ)) {
            // remove objects outside viewport
          const obj = scene.getObjectById(prevRenderObject[tmpXtmpZ]);
          // try to manually dispose to reduce memory, but the performance decrease a lot
          // if (obj && obj.children) {
          //   TweenMax.killTweensOf(obj.scale);
          //   // if (Array.isArray(obj.children[0].material)) {
          //   //   obj.children[0].material.forEach((material) => {
          //   //     material.map.dispose();
          //   //     material.dispose();
          //   //   })
          //   // } else {
          //     obj.children[0].material.map.dispose();
          //     obj.children[0].material.dispose();
          //   // }
          //   obj.children[0].geometry.dispose();
          // }
          scene.remove(obj);
          // need to delete the key to remain the performance
          // delete tmpObject[`${tmpX},${tmpZ}`];
          tmpObject[tmpXtmpZ] = null;
        }
      })
      for (let floorX = maxX; floorX > minX; floorX --) {
        for (let floorZ = maxZ; floorZ > minZ ; floorZ --) {
        const tmpXtmpZ = `${floorX},${floorZ}`;
          // console.log(prevRenderFloor);
          // console.log((!prevRenderFloor[floorX]),(prevRenderFloor[floorX] && !prevRenderFloor[floorX][floorZ]));
          if ((!prevRenderObject[tmpXtmpZ])) {
            const modelIdx = ((floorX + floorZ) % models.length + models.length) % models.length;
            const dcjai = getLoadedObject(models[modelIdx]['name']);
            if (dcjai) {
              scene.add(dcjai);
              dcjai.translateX((floorX - Math.ceil(viewWidth / floorWidth - 1)) * floorWidth);
              dcjai.translateZ((floorZ - Math.ceil(viewWidth / floorWidth) + 1 ) * floorWidth);
              if (prevRenderObject[tmpXtmpZ] !== null) {
                dcjai.scale.set(0.5, 0.001, 0.5);
                TweenMax.to(dcjai.scale, 1, {
                  x: 1,
                  y: 1,
                  z: 1,
                  ease: Bounce.easeOut,
                  delay: 0.5
                })
              }
              tmpObject[tmpXtmpZ] = dcjai.id;
            }
          }
        }
      }
      // console.log(scene.children.length);
      return {...prevRenderObject, ...tmpObject};
    })

  }
  // render
  return (
    <Fragment>
      {modelsloadedProgress < 100 ? <div>
        {modelsloadedProgress}%
      </div>:
      <div 
        ref={setContainerEl} 
        onClick={onClick} 
        // onMouseDown={onMouseDown} 
        onMouseUp={onMouseUp} 
        style={{
          width: '100%',
          height: '100%'
        }}
      />}
      
      {/* {objectSelectingPanelVisible && <div className="objectSelectingPanel" onClick={() => setObjectSelectingPanelVisible(false)}>
        <div></div>
      </div>} */}
    </Fragment>
  );
}
// if use useContext, the withInfoContext is not necessary
// export default App;
export default CityDisplayContainer;