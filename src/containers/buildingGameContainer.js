import React, {Fragment} from 'react';
// new apis
import { useState, useEffect, useCallback, useMemo } from 'react';

import * as THREE from 'three';
// import OrbitControls from 'three-orbitcontrols';
import OrbitControls from 'utils/vendor/orbitControls';
// import SimplifyModifier from 'utils/vendor/SimplifyModifier';

import jsonCopy from 'utils/js/jsonCopy';

import building1Obj from 'media/models/buildings/B1.obj';
import building1Texture from 'media/models/buildings/B1.png';

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

import './buildingGameContainer.css';
import { TweenMax, Cubic, Bounce } from 'gsap';

const OBJLoader = require('three-obj-loader');
const threeObjLoader = {...THREE};
OBJLoader(threeObjLoader);
const BuildingGameContainer = (props) => {
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
  const [loadedModels, setLoadedModels] = useState({});
  const [modelsOnMap, setModelsOnMap] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isSelectingModel, setIsSelectingModel] = useState(false);
  const [objectPosition, setObjectPosition] = useState(new Array(5).fill(new Array(5).fill(null)) );
  let containerEl = null;
  let animationFrame = null;

  const setContainerEl = (ref) => containerEl = ref;
  const cameraDistance = 10;
  const models = [
    {
      name: 'trex',
      obj: require('media/models/trex/T-Rex V3.obj'),
      texture: require('media/models/trex/Diffuse.jpg'),
      scale: 0.01,
      size: {
        x: 1,
        z: 3
      }
    },
    {
      name: 'building 1',
      obj: require('media/models/buildings/B1.obj'),
      texture: require('media/models/buildings/B1.png'),
      scale: 0.01,
      size: {
        x: 1,
        z: 1
      }
    },
    {
      name: 'building 2',
      obj: require('media/models/buildings/B2.obj'),
      texture: require('media/models/buildings/B2.png'),
      scale: 0.01,
      size: {
        x: 1,
        z: 1
      }
    },
    {
      name: 'building 3',
      obj: require('media/models/buildings/B3.obj'),
      texture: require('media/models/buildings/B3.png'),
      scale: 0.01,
      size: {
        x: 1,
        z: 1
      }
    },
    {
      name: 'building 4',
      obj: require('media/models/buildings/B4.obj'),
      texture: require('media/models/buildings/B4.png'),
      scale: 0.01,
      size: {
        x: 1,
        z: 1
      }
    },
    {
      name: 'building 5',
      obj: require('media/models/buildings/B5.obj'),
      texture: require('media/models/buildings/B5.png'),
      scale: 0.01,
      size: {
        x: 1,
        z: 1
      }
    },
    {
      name: 'building 6',
      obj: require('media/models/buildings/B6.obj'),
      texture: require('media/models/buildings/B6.png'),
      scale: 0.01,
      size: {
        x: 2,
        z: 2
      }
    }
  ]
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
          object.children.forEach(child => {
            child.scale.set(model.scale, model.scale, model.scale);
            if (model.rotate) {
              child.rotation.set(model.rotate.x, model.rotate.y, model.rotate.z);
            }
            if (model.position) {
              child.position.set(model.position.x, model.position.y, model.position.z);
            }
          })
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
  useEffect(()=> {
    loadModels();
  },[])
  useEffect(() => {
    if (modelsloadedProgress === 100) {
      initScene();
    }
  },[modelsloadedProgress])
  useEffect(() => {
    if (animationFrame)
      cancelAnimationFrame(animationFrame);
    // console.log(threeObjects);
    if (threeObjects.scene) {
      update();
    }
    if (modelsloadedProgress === 100) {
      setTimeout(()=>setModelsLoadedProgress(101), 500);
    }
  }, [threeObjects, loadedModels]);

  useEffect(()=>{
    if (threeObjects.camera) {
      window.addEventListener('resize', onResize );
    }

    // the return function can treat as componentWillUnmount
    return () => {
      window.removeEventListener('resize', onResize );
    }
  }, [threeObjects])

  useEffect(() => {
    if (threeObjects.containerEl) {
      threeObjects.containerEl.addEventListener('touchstart', onTouchStart);
      threeObjects.containerEl.addEventListener('touchmove', onTouchMove);
      threeObjects.containerEl.addEventListener('touchend', onTouchEnd);
      threeObjects.containerEl.addEventListener('mousedown', onTouchStart);
      document.addEventListener('mousemove', onTouchMove);
      document.addEventListener('mouseup', onTouchEnd);
    }
    return () => {
      if (threeObjects.containerEl) {
        threeObjects.containerEl.removeEventListener('touchstart', onTouchStart);
        threeObjects.containerEl.removeEventListener('touchmove', onTouchMove);
        threeObjects.containerEl.removeEventListener('touchend', onTouchEnd);
        threeObjects.containerEl.removeEventListener('mousedown', onTouchStart);
        document.removeEventListener('mousemove', onTouchMove);
        document.removeEventListener('mouseup', onTouchEnd);
      }
    }
  }, [modelsOnMap, selectedModel, isSelectingModel])
  const initScene = () => {
    const floorWidth = 1;
    const viewWidth = 5;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 50, containerEl.offsetWidth / containerEl.offsetHeight, 1, viewWidth * 2 );
    camera.position.set(cameraDistance, cameraDistance, cameraDistance /2);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    // add a floor
    const tiles = [];
    for (let floorX = 0; floorX < 5; floorX++) {
      for (let floorZ = 0; floorZ < 5; floorZ++) {
        const floorGeometry = new THREE.PlaneGeometry( floorWidth, floorWidth );
        const floorColor = new THREE.Color(`rgb(
          ${~~((floorZ % 2 + 2) % 2 + (floorX % 2 + 2) % 2) * 64 + 127},
          ${~~((floorZ % 2 + 2) % 2 + (floorX % 2 + 2) % 2) * 64 + 127},
          ${~~((floorZ % 2 + 2) % 2 + (floorX % 2 + 2) % 2) * 64 + 127})`);
        // const floorColor = 0xcccccc;
        const floorMaterial = new THREE.MeshBasicMaterial({ color: floorColor, side: THREE.FrontSide });
        
        const floor = new THREE.Mesh( floorGeometry, floorMaterial );
        // objectToAdd.position.set((childCount + 1) % 5 - 2.5, 0, Math.floor((childCount + 1) / 5) - 2.5);
        floor.position.set((floorX - Math.ceil(viewWidth / floorWidth / 2)) * floorWidth, 0, (floorZ - Math.ceil(viewWidth / floorWidth / 2)) * floorWidth);
        floor.translateX(floorWidth / 2);
        floor.translateZ(floorWidth / 2);
        floor.rotateX(-Math.PI / 2);
        scene.add( floor );
        floor.userData = {
          floorX: floorX,
          floorZ: floorZ
        }
        tiles.push(floor);
      }
    }
    // mouse
    const mouse = new THREE.Vector2();
    
    const light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.set(50, 100, 100);
    scene.add(light);

    const renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( containerEl.offsetWidth, containerEl.offsetHeight );
    renderer.setClearColor( 0x000000, 1 );
    containerEl.appendChild( renderer.domElement );

    // add control
    const orbitControl = new OrbitControls( camera, renderer.domElement );
    // dampling
    orbitControl.enableDamping = true;
    orbitControl.dampingFactor = 0.05;
    // to cancel out the super fast rotation after enabled damping
    // orbitControl.enableRotate = false;
    orbitControl.rotateSpeed = 0.02;
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
    orbitControl.enableZoom = false;
    orbitControl.minDistance = 5;
    orbitControl.maxDistance = 5;
    // to disable rotation
    // orbitControl.enableRotate = false;
    // to disable pan
    orbitControl.enablePan = false;
    // orbitControl.panSpeed = 0.05;
    // raycaster
    const raycaster = new THREE.Raycaster(camera.position, new THREE.Vector3(0, 0, 0), 0, orbitControl.maxDistance * 2);
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

  const update = () => {
    animationFrame = requestAnimationFrame(update);
    threeObjects.orbitControl.update();
    threeObjects.renderer.render( threeObjects.scene, threeObjects.camera );
  }
  const getLoadedObject = useCallback((name) => {
    if (loadedModels[name]) {
      const tmp = loadedModels[name].clone();
      tmp.children.forEach((child) => {
        child.traverse((node) => {
          if (node.isMesh) {
            if (Array.isArray(node.material)) {
              const tmpMaterial = [];
              for(let i = 0; i < node.material.length; i++)
                tmpMaterial[i] = node.material[i].clone();
              node.material = tmpMaterial;
            } else {
              node.material = node.material.clone();
            }
          }
        });
      })
      return tmp;
    }
    return null;

    // return loadedModels[name]? loadedModels[name].clone(): null;
  }, [loadedModels]);
  const addModel = (modelName) => {
    const objectToAdd = getLoadedObject(modelName);
    if (objectToAdd) {
      setModelsOnMap((prevModelsOnMap) => {
        // const childCount = prevModelsOnMap.length;
        // console.log(childCount);
        // objectToAdd.position.set((childCount) % 5 - 2.5, 0, Math.floor((childCount) / 5) - 2.5);
        // objectToAdd.position.set(-0.5, 0, -0.5);
        console.log(models);
        // const size = {x:1,z:1};
        let selectedModel = null;
        for (let i = 0; i < models.length; i++) {
          if (models[i].name === modelName) {
            selectedModel = models[i];
            break;
          }
        }
        objectToAdd.position.set(-selectedModel.size.x / 2, 0, -selectedModel.size.z / 2);
        threeObjects.scene.add(objectToAdd);
        objectToAdd.userData = {
          count: modelsOnMap.length + 1,
          name: modelName
        };
        objectToAdd.children.forEach(child => {
          {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => {
                material.opacity = 0.5
                material.transparent = true;
              })
            } else {
              child.material.transparent = true;
              child.material.opacity = 0.5
            }
          };
        })
        TweenMax.fromTo(objectToAdd.scale, 0.5, {
          y: 0.8
        }, {
          y: 1,
          ease: Bounce.easeOut
        })
        setSelectedModel(objectToAdd);
        return [...prevModelsOnMap, objectToAdd];
      })
    }
  }
  const onResize = (event) => {
    threeObjects.camera.aspect = threeObjects.containerEl.offsetWidth / threeObjects.containerEl.offsetHeight;
    threeObjects.camera.updateProjectionMatrix();
    threeObjects.renderer.setSize(threeObjects.containerEl.offsetWidth, threeObjects.containerEl.offsetHeight);
  }
  // const onClick = (event) => {
  //   if (selectedModel) {
  //     selectedModel.children.forEach(child => {
  //       if (Array.isArray(child.material)) {
  //         child.material.forEach(material => material.opacity = 1)
  //       } else {
  //         child.material.opacity = 1
  //       }
  //     })
  //     setSelectedModel(null);
  //   } else {
  //     const pointer = (event.touches? event.touches[0]: event);
  //     const {containerEl, raycaster, tiles, camera, scene} = threeObjects;
  //     const mouse = {x: 0, y: 0};
  //     mouse.x = ( (pointer.clientX - containerEl.offsetLeft) / containerEl.offsetWidth ) * 2 - 1;
  //     mouse.y = - ( (pointer.clientY - containerEl.offsetTop) / containerEl.offsetHeight ) * 2 + 1;
  //     // console.log(mouse);
  //     raycaster.setFromCamera( mouse, camera );
  //     const intersections = raycaster.intersectObjects( modelsOnMap, true );
  //     let intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;
  //     if (intersection && intersection.object.parent) {
  //       console.log(intersection.object.parent.userData);
  //       // setObjectSelectingPanelVisible(true);
  //       const objectSelected = intersection.object.parent
  //       setSelectedModel(objectSelected);
  //       console.log(objectSelected);
  //       objectSelected.children.forEach(child => {
  //         if (Array.isArray(child.material)) {
  //           child.material.forEach(material => material.opacity = 0.5)
  //         } else {
  //           child.material.opacity = 0.5
  //         }
  //       })
  //       // selectedModel.material.opacity = 0.5;
  //       TweenMax.fromTo(objectSelected.scale, 0.5, {
  //         y: 0.8
  //       }, {
  //         y: 1,
  //         ease: Bounce.easeOut
  //       })
  //     } else {
  //       console.log('no intersection');
  //     }
  //   }
  // }
  const onTouchStart = (event) => {
    const pointer = (event.touches? event.touches[0]: event);
    const {containerEl, raycaster, tiles, camera, scene} = threeObjects;
    const mouse = {x: 0, y: 0};
    mouse.x = ( (pointer.clientX - containerEl.offsetLeft) / containerEl.offsetWidth ) * 2 - 1;
    mouse.y = - ( (pointer.clientY - containerEl.offsetTop) / containerEl.offsetHeight ) * 2 + 1;
    // console.log(mouse);
    raycaster.setFromCamera( mouse, camera );
    const intersections = raycaster.intersectObjects( modelsOnMap, true );
    let intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;
    if (intersection && intersection.object.parent) {
      threeObjects.orbitControl.enabled = false;
      // console.log(intersection.object.parent.userData);
      // setObjectSelectingPanelVisible(true);
      const objectSelected = intersection.object.parent
      if (selectedModel && selectedModel !== objectSelected) return;
      setIsSelectingModel(true);
      setSelectedModel(objectSelected);
      objectSelected.children.forEach(child => {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.opacity = 0.5)
        } else {
          child.material.opacity = 0.5
        }
      })
      // selectedModel.material.opacity = 0.5;
      TweenMax.fromTo(objectSelected.scale, 0.5, {
        y: 0.8
      }, {
        y: 1,
        ease: Bounce.easeOut
      })
    } else {
      console.log('no intersection');
    }
  }
  const onTouchMove = (event) => {
    if (selectedModel && isSelectingModel) {
      const pointer = (event.touches? event.touches[0]: event);
      const {containerEl, raycaster, tiles, camera, scene} = threeObjects;
      const mouse = {x: 0, y: 0};
      mouse.x = ( (pointer.clientX - containerEl.offsetLeft) / containerEl.offsetWidth ) * 2 - 1;
      mouse.y = - ( (pointer.clientY - containerEl.offsetTop) / containerEl.offsetHeight ) * 2 + 1;
      // console.log(mouse);
      raycaster.setFromCamera( mouse, camera );
      const intersections = raycaster.intersectObjects( tiles );
      let intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;
      if (intersection) {
        const position = intersection.object.userData;
        let selectedModelData = null;
        for (let i = 0; i < models.length; i++) {
          if (models[i].name === selectedModel.userData.name) {
            selectedModelData = models[i];
            break;
          }
        }

        // console.log(intersection);
        // console.log(position.floorX - 2.5, 0, position.floorZ - 2.5);
        let xOffset = selectedModelData.size.x / 2;
        let zOffset = selectedModelData.size.z / 2;
        const rotated = Math.round(selectedModel.rotation.y / (Math.PI / 2));
        if (rotated === 1 || rotated === 3) {
          xOffset = selectedModelData.size.z / 2;
          zOffset = selectedModelData.size.x / 2;
        }
        selectedModel.position.set(position.floorX - 2 - xOffset, 0, position.floorZ - 2 - zOffset);
        // // setObjectSelectingPanelVisible(true);
        // const objectSelected = intersection.object.parent
        // TweenMax.fromTo()
      } else {
        console.log('no intersection');
      }
    }
  }
  const onTouchEnd = (event) => {
    event.stopPropagation();
    setIsSelectingModel(false);
    if (selectedModel) {
      // selectedModel.children.forEach(child => {
      //   if (Array.isArray(child.material)) {
      //     child.material.forEach(material => material.opacity = 1)
      //   } else {
      //     child.material.opacity = 1
      //   }
      // })
      // setSelectedModel(null);
      threeObjects.orbitControl.enabled = true;
      
      const e = new Event('mouseup');
      document.removeEventListener('mouseup', onTouchEnd);
      document.dispatchEvent(e);
      document.addEventListener('mouseup', onTouchEnd);
    }
  }

  const deleteModel = () => {
    if (selectedModel) {
      threeObjects.scene.remove(selectedModel);
      setSelectedModel(null);
    }
  }
  const rotateModelClockwise = () => {
    selectedModel.rotation.y = (selectedModel.rotation.y + Math.PI * 3 / 2) % (Math.PI * 2);
  }
  const rotateModelAntiClockwise = () => {
    selectedModel.rotation.y = (selectedModel.rotation.y + Math.PI / 2) % (Math.PI * 2);
  }
  const sattleModel = () => {
    setIsSelectingModel(false);
    selectedModel.children.forEach(child => {
      if (Array.isArray(child.material)) {
        child.material.forEach(material => material.opacity = 1)
      } else {
        child.material.opacity = 1
      }
    })
    setSelectedModel(null);
  }
  return <div id="gamePanel">
    {(modelsloadedProgress <= 100) && <div className="loadingPanel">{Math.round(modelsloadedProgress * 100) / 100}%</div>}
    <div ref={setContainerEl}
      // onClick={onClick}
      // onMouseMove={onMouseMove}
      // onTouchMove={onMouseMove}
      className="objectBuildingPanel">
    </div>
    <div className="objectSelectingPanel">
      <div className="panelTitle">Select object to add</div>
      <div className="objectCategories">
        <div className="objectCategory">Character</div>
      </div>
      {!selectedModel? <div className="objectCategoryItemsList">
        {models.map(model => {
          return <div className="objectCategoryItem" key={model.name}>
            <div className="modelSelect" onClick={_ => {
              addModel(model.name);
            }}>
              {model.name}
            </div>
          </div>
        })}
      </div> :
      <div className="objectManipulatePanel">
        <div className="button rotateButton" onClick={rotateModelClockwise}>rotate Clockwise</div>
        <div className="button rotateButton" onClick={rotateModelAntiClockwise}>rotate anti-Clockwise</div>
        <div className="button confirmButton" onClick={sattleModel}>Confirm</div>
        <div className="button deleteButton" onClick={deleteModel}>Delete</div>
      </div>}
    </div>
  </div>;
}
export default BuildingGameContainer;
