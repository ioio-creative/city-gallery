import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
// import { useSelector } from 'react-redux';
import { ObjectControl, initStats, removeStats, removeGUI, getScreenSizeIn3dWorld, devMode, calcPosFromLatLonRad, calcThetaPhiFromLatLon } from './globalFuncFor3d';
import * as THREE from 'three';
import { OBJLoader } from 'three-obj-mtl-loader';
import './style.scss';

import earthMap from './images/earth/8081_earthmap4k.jpg';
import earthBumpMap from './images/earth/8081_earthbump4k.jpg';
import earthSpecularMap from './images/earth/8081_earthspec4k.jpg';
import earthNormalMap from './images/earth/earth_normalmap4k.jpg';
import cloudObj from './low_poly_cloud.obj';
import pin from './images/pin.svg';
import pinHK from './images/pin_hk.svg';
import pinWhite from './images/pin_w.svg';
// import hkImage from './images/hk.png';

import Section1 from './detailpage/Section1';
import Section2 from './detailpage/Section2';
import Section3 from './detailpage/Section3';
import Section4 from './detailpage/Section4';
import Section5 from './detailpage/Section5';

const App = props => {
  // const [started, setStarted] = useState(false);
  // const count = useSelector(state => state.count);
  const canvasWrap = useRef(null);
  const zoomInFunc = useRef(null);
  const zoomOutFunc = useRef(null);
  const enableRotateFunc = useRef(null);
  const disableRotateFunc = useRef(null);
  const enableAutoRotateFunc = useRef(null);
  const selectLocationFunc = useRef(null);
  const toWhiteColorFunc = useRef(null);
  const resetPointsColorFunc = useRef(null);
  const locationsWrapElem = useRef(null);
  const locationsOuterWrapElem = useRef(null);
  const locationsElem = useRef(null);
  const selectCityElem = useRef(null);
  const timeLineRef = useRef(null);
  // const canvasTextureRef = useRef(null);
  const showDetailsRef = useRef(null);
  const objectControlRef = useState(null);
  const locations = [
    { name: { en: 'Hong Kong', tc: '香港' }, lat: 22.37772, lon: 114.155267, offset:1.04 },
    { name: { en: 'Beijing', tc: '北京' }, lat: 39.920244, lon: 116.411309, offset:1.07 },
    { name: { en: 'Cairo', tc: '開羅' }, lat: 30.050844, lon: 31.236143, offset:1.04 },
    { name: { en: 'London', tc: '倫敦' }, lat: 51.510833, lon: -0.127461, offset:1.04 },
    { name: { en: 'Paris', tc: '巴黎' }, lat: 48.862788, lon: 2.339303, offset:1.04 },
    { name: { en: 'Mexico City', tc: '墨西哥城' }, lat: 19.595333, lon: -99.142672, offset:1.1 },
    { name: { en: 'Mumbai', tc: '孟買' }, lat: 19.144194, lon: 72.883378, offset:1.05 },
    { name: { en: 'New York', tc: '紐約' }, lat: 40.7632, lon: -74.041618, offset:1.04 },
    { name: { en: 'Singapore', tc: '新加坡' }, lat: 1.34969, lon: 103.88134, offset:1.04 },
    { name: { en: 'Sydney', tc: '悉尼' }, lat: -33.817029, lon: 151.213937, offset:1.05 },
    { name: { en: 'Tokyo', tc: '東京' }, lat: 35.680331, lon: 139.767505, offset:1.04 }
  ];
  // const moveToFunc = useRef(null);
  const moveFromIdFunc = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [detailIdx, setDetailIdx] = useState(null);
  const [scrolledDetailIdx, setScrolledDetailIdx] = useState(1);
  const [scrolling, setScrolling] = useState(null);
  const [zindex, setZindex] = useState(1);
  const [data, setData] = useState(null);
  const [allData, setAllData] = useState(null);
  const [language, setLanguage] = useState('en');
  const [hideEarth, setHideEarth] = useState(false);
  const [aniLock, setAniLock] = useState([false, false, false, false, false]);

  useEffect(() => {
    let scene = undefined,
      camera = undefined,
      dev = undefined,
      renderer = undefined,
      screen = { width: undefined, height: undefined };

    // light
    let ambientLight = undefined;
    let lights = [];

    // items array
    let geometryItems = [];
    let materialItems = [];
    let textureItems = [];
    let meshItems = [];
    // const pointOffsets = [];
    // const pointScaledOffsets = [];
    // const pointScales = [];
    // const pointInstanceColors = [];
    // const pointBgInstanceColors = [];
    let pointsBgMaterial = null;
    const groupedMesh = new THREE.Group();
    // let pointsMesh = null;
    let pinMesh = null;
    // let linesMesh = null;
    // let canvasTexture = null;
    // let animCanvasTexture = null;
    const numsOfClouds = 8;
    let cloudsMesh = null;
    const cloudSpeed = [];
    let outerCircleLine = null;
    let innerCircleLine = null;
    // let canvas = null;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(1, 1);
    // const scaleUpMatrix = new THREE.Matrix4().makeRotationY( 0.1 );
    // const scaleDownMatrix = new THREE.Matrix4().makeScale( .5, .5, .5 );
    const instanceMatrix = new THREE.Matrix4();
    // const instanceMatrix2 = new THREE.Matrix4();
    const matrix = new THREE.Matrix4();
    let currentHoveredInstanceId = null;
    // let prevHoveredInstanceId = null;
    let oldHoveredInstanceId = null;

    let objectControl = null;
    let dragging = false;
    let isHideEarth = false;
    let goToDetail = false;

    // let attributesSize = [];
    let animValue = [];

    // cameraControl system
    // let cameraControl = null;

    // stats
    let stats = undefined;

    // options
    const options = {
      // zoomIn:{ callback:()=> cameraControl.zoom(20), name:'Zoom In' },
      // zoomOut:{ callback:()=> cameraControl.zoom(-20), name:'Zoom Out' },
      // rotateT:{ callback:()=>cameraControl.rotate( 45 * THREE.Math.DEG2RAD, 0 ), name:'Rotate Theta 45deg' },
      // zoomrotate:{ callback:()=>{cameraControl.zoom(2); cameraControl.rotate( 45 * THREE.Math.DEG2RAD, -25 * THREE.Math.DEG2RAD )}, name:'Zoom and Rotate' },
      // cameraZ:{ value:5, min:0, max:20, name:'Camera Z' },
      // scale:{ value:10, min:0, max:50 }
    };

    // param
    const earthRadius = 20;

    const initEngine = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 170);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, precision:'lowp', powerPreference:'low-power' });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      // renderer.setClearColor(0xffffff, 0);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      canvasWrap.current.appendChild(renderer.domElement);

      // stats = initStats();
      // initGUI(options);

      // cameraControl = new CameraControlsSystem(camera, meshEarth);
      objectControl = new ObjectControl(groupedMesh);
      objectControlRef.current = objectControl;

      // const {targetTheta, targetPhi} = calcThetaPhiFromLatLon(locations[0].lat, locations[0].lon);
      // objectControl.setRotate(targetTheta, targetPhi + 25 * THREE.Math.DEG2RAD);
      // setTimeout(()=>{
      //     objectControl.enableAutoRotate();
      // },1000)
      // dev = devMode(scene);

      renderer.setAnimationLoop(function () {
        update();
        render();
      });
      
      initLight();
      initMesh();
    };

    const clearIdx = () => {
      currentHoveredInstanceId = null;
    };

    const initLight = () => {
      ambientLight = new THREE.AmbientLight(0xeeeeee);

      lights[0] = new THREE.PointLight(0xffffff, 0.6, 100);
      lights[0].position.set(earthRadius * 2, earthRadius * 2, earthRadius * 2);
      lights[0].add(new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff })));
      lights[0].castShadow = true;

      scene.add(lights[0]);
      scene.add(ambientLight);
    };

    const initMesh = () => {
      initEarth();
      initHalo();
      initLocationPoints();
      outerCircleLine = initCircleLineBg(80, 2.3, 2, 20, '#ffffff');
      innerCircleLine = initCircleLineBg(50, 3, 4, 15, '#63db71');
      scene.add(outerCircleLine);
      scene.add(innerCircleLine);
      initClouds();

      for (let i = 0; i < meshItems.length; i++) groupedMesh.add(meshItems[i]);

      // groupedMesh.position.y = -20;
      // groupedMesh.position.z = 50;
      scene.add(groupedMesh);
    };

    const initEarth = () => {
      const geometry = new THREE.IcosahedronGeometry(earthRadius, 5);
      const material = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(earthMap),
        displacementMap: new THREE.TextureLoader().load(earthBumpMap),
        displacementScale: 3,
        normalMap: new THREE.TextureLoader().load(earthNormalMap),
        specularMap: new THREE.TextureLoader().load(earthSpecularMap),
        specular: new THREE.Color('grey'),
        shininess: 20,
        // side: THREE.DoubleSide,
        // wireframe:true
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      materialItems.push(material);
      geometryItems.push(geometry);
      meshItems.push(mesh);
    };

    const initHalo = () => {
      const geometry = new THREE.IcosahedronGeometry(earthRadius + 4, 3);
      var material = new THREE.ShaderMaterial({
        vertexShader: ['varying vec3 vNormal;', 'void main() {', 'vNormal = normalize( normalMatrix * normal );', 'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );', '}'].join('\n'),
        fragmentShader: ['varying vec3 vNormal;', 'void main() {', 'float intensity = pow( 0.65 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 3.0 );', 'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;', '}'].join('\n'),
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
      });
      var mesh = new THREE.Mesh(geometry, material);

      materialItems.push(material);
      geometryItems.push(geometry);
      meshItems.push(mesh);
    };

    const initLocationPoints = () => {
      // createPoints();
      createPointsBg();
      // createLines();
    };

    // const createPoints = () => {
    //   const geometry = new THREE.IcosahedronBufferGeometry(0.8, 2);
    //   const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    //   pointsMesh = new THREE.InstancedMesh(geometry, material, locations.length);
    //   const transform = new THREE.Object3D();

    //   for (let i = 0; i < locations.length; i++) {
    //     const location = locations[i];
    //     const pos = getLocationPointsPosition(location);

    //     pointOffsets.push(pos.x, pos.y, pos.z);
    //     pointScales.push(Math.random() * 0.2 + 1.2);

    //     transform.position.set(0, 0, 0);
    //     transform.scale.set(0.001, 0.001, 0.001);
    //     transform.updateMatrix();

    //     transform.position.set(pos.x, pos.y, pos.z).multiplyScalar(pointScales[i]);
    //     transform.updateMatrix();
    //     pointScaledOffsets.push(transform.position.x, transform.position.y, transform.position.z);
    //     pointsMesh.setMatrixAt(i, transform.matrix);

    //     if (i === 0) pointInstanceColors.push(0 / 255, 53 / 255, 87 / 255);
    //     else pointInstanceColors.push(81 / 255, 190 / 255, 255 / 255);
    //   }
    //   pointsMesh.castShadow = true;
    //   updateColor(geometry, pointsMesh);

    //   materialItems.push(material);
    //   geometryItems.push(geometry);
    //   meshItems.push(pointsMesh);
    // };

    // const createLines = () => {
    //   const geometry = new THREE.CylinderBufferGeometry(0.1, 0.1, 0.1, 6, 1, true);
    //   const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    //   linesMesh = new THREE.InstancedMesh(geometry, material, locations.length);
    //   geometry.translate(0, 0.1 / 2, 0);
    //   geometry.rotateX(90 * THREE.Math.DEG2RAD);

    //   const transform = new THREE.Object3D();
    //   for (let i = 0; i < locations.length; i++) {
    //     // reset
    //     transform.position.set(0, 0, 0);
    //     transform.updateMatrix();

    //     transform.lookAt(pointOffsets[i * 3], pointOffsets[i * 3 + 1], pointOffsets[i * 3 + 2]);
    //     transform.position.set(pointOffsets[i * 3] / 2, pointOffsets[i * 3 + 1] / 2, pointOffsets[i * 3 + 2] / 2);
    //     transform.scale.z = (earthRadius * pointScales[i] - earthRadius) * 10;
    //     transform.updateMatrix();
    //     linesMesh.setMatrixAt(i, transform.matrix);
    //   }
    //   linesMesh.castShadow = true;
    //   updateColor(geometry, linesMesh);

    //   materialItems.push(material);
    //   geometryItems.push(geometry);
    //   meshItems.push(linesMesh);
    // };

    const createPointsBg = () => {
      // canvasTexture = new createCanvasTexture();
      // canvasTextureRef.current = canvasTexture;
      // animCanvasTexture = new createAnimCanvasTexture();
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const textures = [
        new THREE.TextureLoader().load(pin), 
        new THREE.TextureLoader().load(pinWhite),
        new THREE.TextureLoader().load(pinHK)
      ];
      textures[0].flipY = false;
      textures[1].flipY = false;
      textures[2].flipY = false;
      const ids = [];
      const sizes = [];

      for (let i = 0; i < locations.length; i++) {
        const location = locations[i];
        const pos = getLocationPointsPosition(location);
        // pointOffsets.push(pos.x, pos.y, pos.z);
        pos.multiplyScalar(location.offset);
        // const scaledOffset = pointScaledOffsets;
        vertices.push(pos.x, pos.y, pos.z);
        ids.push(i);
        sizes[i] = 0.0;
        // pointBgInstanceColors.push(1, 1, 1);
        animValue[i] = {s:sizes[i]};
        // else pointBgInstanceColors.push(81 / 255, 190 / 255, 255 / 255);
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      // geometry.setAttribute('instanceColor', new THREE.BufferAttribute(new Float32Array(pointBgInstanceColors), 3));
      geometry.setAttribute('instanceId', new THREE.BufferAttribute(new Float32Array(ids), 1));
      geometry.setAttribute('size', new THREE.Float32BufferAttribute( sizes, 1 ));

      pointsBgMaterial = new THREE.ShaderMaterial({
        uniforms: {
          activeInstanceId: { type: 'f', value: -1.0 },
          textures: {
            type: 't',
            value: textures
          }
        },
        vertexShader: [
          // 'attribute vec3 instanceColor;',
          'attribute float instanceId;',
          'attribute float size;',
          // 'varying vec3 vColor;',
          'varying float vId;',

          'void main() {',
          // 'vColor = instanceColor;',
          'vId = instanceId;',
          'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            'gl_PointSize = size * 100.0;',
            //`gl_PointSize = 2.5 * ${(window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth * 4) * Math.PI} / -mvPosition.z;`,
          '}'
        ].join('\n'),
        fragmentShader: [
          'uniform sampler2D textures[3];',
          'uniform float activeInstanceId;',
          // 'varying vec3 vColor;',
          'varying float vId;',

          'void main() {',
            'vec4 texture;',
            // 'vec3 color;',


            'if(vId > activeInstanceId-.5 && vId < activeInstanceId+.5){',
              // 'color = vec3(1.,1.,1.);',
              'texture = texture2D( textures[1], gl_PointCoord );',
            '}',
            'else{',
              // 'color = vColor;',
              'texture = texture2D( textures[0], gl_PointCoord );',
            '}',
            
            'if(vId == 0.){',
              'texture = texture2D( textures[2], gl_PointCoord );',
            '}',
            'gl_FragColor = vec4( vec3(1.,1.,1.), 1.0 );',
            'gl_FragColor = gl_FragColor * texture;',
          '}'
        ].join('\n'),
        transparent: true,
        depthWrite: false,
        // depthTest:false
      });
      pinMesh = new THREE.Points(geometry, pointsBgMaterial);

      materialItems.push(pointsBgMaterial);
      geometryItems.push(geometry);
      meshItems.push(pinMesh);
    };

    // const createCanvasTexture = function () {
    //   const _this = this;
    //   this.canvas = document.createElement('canvas');
    //   this.ctx = this.canvas.getContext('2d');
    //   this.canvas.width = 128;
    //   this.canvas.height = 128;
    //   this.animValue = { a: 0 };

    //   const clearCanvas = () => {
    //     _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
    //     _this.ctx.fillStyle = 'rgba(255,255,255,0.01)';
    //     _this.ctx.fillRect(0, 0, _this.canvas.width, _this.canvas.height);
    //   };

    //   const draw = (opacity = 0.3) => {
    //     clearCanvas();
    //     _this.ctx.beginPath();
    //     _this.ctx.arc(128 / 2, 128 / 2, 128 / 2, 0, 2 * Math.PI);
    //     _this.ctx.fillStyle = `rgba(255,255,255,${opacity})`;
    //     _this.ctx.fill();
    //   };

    //   this.show = () => {
    //     gsap.to(_this.animValue, 1, {a: 0.3,
    //       onUpdate: function () {
    //         const value = this.targets()[0];
    //         draw(value.a);
    //         if (pointsBgMaterial) pointsBgMaterial.uniforms.textures.value[0].needsUpdate = true;
    //       }
    //     });
    //   };

    //   this.hide = () => {
    //     gsap.to(_this.animValue, 1, {a: 0,
    //       onUpdate: function () {
    //         const value = this.targets()[0];
    //         draw(value.a);
    //         if (pointsBgMaterial) pointsBgMaterial.uniforms.textures.value[0].needsUpdate = true;
    //       }
    //     });
    //   };
    // };

    // const createAnimCanvasTexture = function () {
    //   const _this = this;
    //   this.canvas = document.createElement('canvas');
    //   this.ctx = this.canvas.getContext('2d');
    //   this.radius = 64 / 2 - 10;
    //   this.circles = [];
    //   this.counter = 0;
    //   this.player = null;

    //   const init = () => {
    //     _this.canvas.width = 64;
    //     _this.canvas.height = 64;
    //   };

    //   this.start = () => {
    //     _this.destroy();
    //     animLoop();
    //   };

    //   this.destroy = () => {
    //     cancelAnimationFrame(_this.player);
    //     // clearCanvas();
    //     _this.circles = [];
    //   };

    //   const clearCanvas = () => {
    //     _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
    //     _this.ctx.fillStyle = 'rgba(255,255,255,0.01)';
    //     _this.ctx.fillRect(0, 0, _this.canvas.width, _this.canvas.height);
    //   };

    //   const draw = r => {
    //     _this.ctx.strokeStyle = `rgba(255,225,255,${1 - r * r})`;
    //     _this.ctx.lineWidth = 2;
    //     _this.ctx.beginPath();
    //     _this.ctx.arc(64 / 2, 64 / 2, r * _this.radius, 0, 2 * Math.PI);
    //     _this.ctx.stroke();
    //   };

    //   const addCircle = () => {
    //     if (_this.counter >= 40) {
    //       _this.circles.push({ radius: 0 });
    //       _this.counter = 0;
    //     }
    //     _this.counter++;
    //   };

    //   const updateCircle = () => {
    //     const newCircles = [];
    //     for (let i = 0; i < _this.circles.length; i++) {
    //       const circle = _this.circles[i];
    //       circle.radius += 0.01;
    //       draw(circle.radius);

    //       if (circle.radius <= 1.5) newCircles.push(circle);
    //     }
    //     _this.circles = newCircles;
    //   };

    //   const animLoop = () => {
    //     _this.player = requestAnimationFrame(animLoop);

    //     clearCanvas();
    //     addCircle();
    //     updateCircle();

    //     if (pointsBgMaterial) pointsBgMaterial.uniforms.textures.value[1].needsUpdate = true;
    //   };

    //   init();
    // };

    const initClouds = () => {
      const objLoader = new OBJLoader();
      objLoader.load(cloudObj, object => {
        var geometry = new THREE.Geometry().fromBufferGeometry(object.children[0].geometry);
        geometry.mergeVertices();
        geometry.computeVertexNormals();
        // geometry.rotateX(270 * Math.PI/180)
        geometry.scale(0.1, 0.1, 0.1);
        geometry.translate(0, 20, 0);

        const material = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 30, transparent:true, opacity:.9});
        cloudsMesh = new THREE.InstancedMesh(geometry, material, numsOfClouds);
        cloudsMesh.castShadow = true;
        const transform = new THREE.Object3D();

        for (let i = 0; i < numsOfClouds; i++) {
          cloudSpeed.push(Math.random() * 0.0005 + 0.0001);
          // const pos = getLocationPointsPosition({lat:random(-90, 90), lon:random(-180, 180)});

          // const y = Math.random()*1;
          const scale = Math.random() * 0.2 + 1.1;
          transform.rotation.set(Math.random() * 15, 0, Math.random() * 15);
          // transform.updateMatrix();
          // transform.position.multiplyScalar(10);
          // transform.lookAt(0,0,0);
          transform.scale.set(scale, scale, scale);
          transform.updateMatrix();

          // transform.updateMatrix();

          cloudsMesh.setMatrixAt(i, transform.matrix);
        }

        groupedMesh.add(cloudsMesh);

        materialItems.push(material);
        geometryItems.push(geometry);
        meshItems.push(cloudsMesh);
      });
    };

    const updateClouds = () => {
      if (cloudsMesh) {
        for (let i = 0; i < numsOfClouds; i++) {
          cloudsMesh.getMatrixAt(i, instanceMatrix);
          matrix.multiplyMatrices(instanceMatrix, new THREE.Matrix4().makeRotationZ(cloudSpeed[i]));

          cloudsMesh.setMatrixAt(i, matrix);
          cloudsMesh.instanceMatrix.needsUpdate = true;
        }
      }
    };

    const initCircleLineBg = (size, angle, lineWidth, lineHeight, color) => {
      const map = new THREE.CanvasTexture(circleLineBgTexture(angle, lineWidth, lineHeight, color));
      const geometry = new THREE.PlaneBufferGeometry(size, size, 1, 1);
      const material = new THREE.MeshBasicMaterial({map: map,transparent: true, depthWrite:false});
      map.premultiplyAlpha = true;
      material.blending = THREE.CustomBlending;
      const mesh = new THREE.Mesh(geometry, material);
      // document.body.appendChild(canvas);

      materialItems.push(material);
      geometryItems.push(geometry);

      return mesh;
      // meshItems.push(mesh);
    };

    const circleLineBgTexture = (angle, lineWidth, lineHeight, color) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const radius = 1024 / 2;
      const innerRadius = radius - lineHeight;
      const eachRadian = (angle * Math.PI) / 180;

      canvas.width = 1024;
      canvas.height = 1024;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      for (let i = 0; i < Math.PI * 2; i += eachRadian) {
        const x = radius + radius * Math.sin(i);
        const y = radius + radius * Math.cos(i);
        const inner_x = radius + innerRadius * Math.sin(i);
        const inner_y = radius + innerRadius * Math.cos(i);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(inner_x, inner_y);
        ctx.stroke();
      }

      return canvas;
    };

    const updateCircleLineBg = () => {
      outerCircleLine.rotation.z = (performance.now() / 1000) * 0.02;
      innerCircleLine.rotation.z = (-performance.now() / 1000) * 0.02;
    };

    // const updateColor = (geometry, mesh) => {
    //   geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(new Float32Array(pointInstanceColors), 3));
    //   var colorParsChunk = ['attribute vec3 instanceColor;', 'varying vec3 vInstanceColor;'].join('\n') + '\n';
    //   var instanceColorChunk = ['vInstanceColor = instanceColor;'].join('\n') + '\n';
    //   var fragmentParsChunk = ['varying vec3 vInstanceColor;'].join('\n') + '\n';
    //   var colorChunk = ['vec4 diffuseColor = vec4( diffuse * vInstanceColor, opacity );'].join('\n') + '\n';

    //   mesh.material.onBeforeCompile = function (shader) {
    //     shader.vertexShader = shader.vertexShader.replace('#include <common>\n', '#include <common>\n' + colorParsChunk).replace('#include <begin_vertex>\n', '#include <begin_vertex>\n' + instanceColorChunk);
    //     shader.fragmentShader = shader.fragmentShader.replace('#include <common>\n', '#include <common>' + fragmentParsChunk).replace('vec4 diffuseColor = vec4( diffuse, opacity );\n', colorChunk);
    //   };
    // };

    const pops = () => {
      gsap.to(animValue, 2, {s: 1, stagger:.1, ease:'elastic.out(1, 0.3)',
        // onUpdate: function () {
          // for(let i=0, lth=this.targets().length; i<lth; i++){
          //   const t = this.targets()[i];
          //   pinMesh.geometry.attributes.size.array[ i ] = t.s;
          //   pinMesh.geometry.attributes.size.needsUpdate = true;
          // }
        // }
      });

      // for (let i = 0; i < locations.length; i++) {
      //   pointsMesh.getMatrixAt(i, instanceMatrix);
      //   linesMesh.getMatrixAt(i, instanceMatrix2);

      //   const startScaleValue = { s: 0 };
      //   const startPositionValue = { x: pointOffsets[i * 3] / 2, y: pointOffsets[i * 3 + 1] / 2, z: pointOffsets[i * 3 + 2] / 2 };
      //   const pointTransform = new THREE.Object3D();
      //   const lineTransform = new THREE.Object3D();
      //   pointTransform.applyMatrix4(instanceMatrix);
      //   lineTransform.applyMatrix4(instanceMatrix2);

      //   const tl = gsap.timeline({ delay: i * 0.15 });
      //   tl.to(startPositionValue, 0.4, {x: pointOffsets[i * 3],y: pointOffsets[i * 3 + 1],z: pointOffsets[i * 3 + 2],ease: 'power4.out', //z:1+1/52
      //     onUpdate: function () {
      //       const value = this.targets()[0];
      //       lineTransform.position.set(value.x, value.y, value.z);
      //       lineTransform.updateMatrix();
      //       linesMesh.setMatrixAt(i, lineTransform.matrix);
      //       linesMesh.instanceMatrix.needsUpdate = true;
      //     }
      //   });
      //   tl.fromTo(startScaleValue, 2, { s: 0 }, { s: 1, ease: 'elastic.out(1.3, 0.3)',
      //     onUpdate: function () {
      //       const value = this.targets()[0];
      //       pointTransform.scale.set(value.s, value.s, value.s);
      //       pointTransform.updateMatrix();
      //       pointsMesh.setMatrixAt(i, pointTransform.matrix);
      //       pointsMesh.instanceMatrix.needsUpdate = true;
      //     }
      //   },'-=.2');
      // }

      // setTimeout(() => {
      //   canvasTexture.show();
      // }, 1000);
    };

    const reversePops = () => {
      gsap.to(animValue, 1, {s: 0, stagger:.1, ease:'back.out(1.7)',
        // onUpdate: function () {
          // for(let i=0, lth=this.targets().length; i<lth; i++){
          //   const t = this.targets()[i];
          //   pinMesh.geometry.attributes.size.array[ i ] = t.s;
          //   pinMesh.geometry.attributes.size.needsUpdate = true;
          // }
        // }
      });
      // for (let i = 0; i < locations.length; i++) {
      //   pointsMesh.getMatrixAt(i, instanceMatrix);
      //   linesMesh.getMatrixAt(i, instanceMatrix2);

      //   const scaleValue = { s: 0 };
      //   const positionValue = { x: pointOffsets[i * 3] / 2, y: pointOffsets[i * 3 + 1] / 2, z: pointOffsets[i * 3 + 2] / 2 };
      //   const pointTransform = new THREE.Object3D();
      //   const lineTransform = new THREE.Object3D();
      //   pointTransform.applyMatrix4(instanceMatrix);
      //   lineTransform.applyMatrix4(instanceMatrix2);

      //   const tl = gsap.timeline({ delay: i * 0.15 });
      //   tl.to(positionValue, 0.4, {x: 0,y: 0,z: 0,ease: 'power4.out', //z:1+1/52
      //     onUpdate: function () {
      //       const value = this.targets()[0];
      //       lineTransform.position.set(value.x, value.y, value.z);
      //       lineTransform.updateMatrix();
      //       linesMesh.setMatrixAt(i, lineTransform.matrix);
      //       linesMesh.instanceMatrix.needsUpdate = true;
      //     }
      //   });
      //   tl.fromTo(scaleValue, 2, { s: 1 }, {s: 0.0001, ease: 'elastic.out(1.3, 0.3)',
      //       onUpdate: function () {
      //         const value = this.targets()[0];
      //         pointTransform.scale.set(value.s, value.s, value.s);
      //         pointTransform.updateMatrix();
      //         pointsMesh.setMatrixAt(i, pointTransform.matrix);
      //         pointsMesh.instanceMatrix.needsUpdate = true;
      //       }
      //     },'-=.2');
      // }
      // canvasTexture.hide();
    };

    // const getRotation = (vec) =>{
    //     var planeVector1 = new THREE.Vector3(0,1,0);
    //     var matrix1 = new THREE.Matrix4();
    //     var quaternion = new THREE.Quaternion().setFromUnitVectors(planeVector1, vec);
    //     var matrix = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);
    //     return quaternion;
    // }

    const getLocationPointsPosition = location => {
      const lat = location.lat;
      const lon = location.lon;

      return calcPosFromLatLonRad(lat, lon, earthRadius);
    };

    const onMouseDown = () => {
      if (document.querySelector('#home').classList[0] === undefined) {
        dragging = false;


        // console.log("first mousedown");
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('touchmove', onMouseMove, false);
        document.addEventListener('touchend', onMouseUp, false);
      }
    };

    const onMouseMove = event => {
      // if (!event.touches) event.preventDefault();
      // let e = event.touches ? event.touches[0] : event;
      if (!dragging) dragging = true;

      // mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      // mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onMouseUp = (event) => {
      if (!dragging && !goToDetail) {
        let e = event.touches ? event.touches[0] : event;

        if(e){
          mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
          
          raycaster.setFromCamera(mouse, camera);
          const intersection = raycaster.intersectObject(pinMesh);

          if (intersection.length > 0) {
            currentHoveredInstanceId = intersection[0].index;

            if(currentHoveredInstanceId !== 0){
              if(currentHoveredInstanceId !== oldHoveredInstanceId){
                selectLocation(currentHoveredInstanceId);
                moveFromIdFunc.current.moveFromId(currentHoveredInstanceId);
              }
              else{
                showDetails(currentHoveredInstanceId);
                goToDetail = true;
              }
            }
            
            // currentHoveredInstanceId = null;

            // currentHoveredInstanceId = intersection[0].instanceId;
            // // console.log("balls clicked");
            // if (currentHoveredInstanceId !== prevHoveredInstanceId) {
            //   // document.body.style.cursor = 'pointer';
            //   prevHoveredInstanceId = currentHoveredInstanceId;
            // }
          } 
        }
        // else {
        //   if (prevHoveredInstanceId !== null) {
        //     // document.body.style.cursor = '';
        //     currentHoveredInstanceId = null;
        //     prevHoveredInstanceId = null;
        //   }
        // }

        
        // if (currentHoveredInstanceId !== null && currentHoveredInstanceId !== 0) {
          // if(currentHoveredInstanceId !== null && currentHoveredInstanceId !== oldHoveredInstanceId && currentHoveredInstanceId !== 0){
          // selectLocation();
          // moveFromIdFunc.current.moveFromId(currentHoveredInstanceId);
          // currentHoveredInstanceId = null;
        // }
      }
      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('mouseup', onMouseUp, false);
      document.removeEventListener('touchmove', onMouseMove, false);
      document.removeEventListener('touchend', onMouseUp, false);
    };

    const selectLocation = (id) => {
      if (id) currentHoveredInstanceId = id;
      if(currentHoveredInstanceId !== 0){
        if(currentHoveredInstanceId !== oldHoveredInstanceId){
          objectControl.disableAutoRotate();


          // find short rotation distance
          const { targetTheta, targetPhi } = calcThetaPhiFromLatLon(locations[currentHoveredInstanceId].lat, locations[currentHoveredInstanceId].lon);
          const { theta, phi } = objectControl.getCurrentThetaPhi();
          const animValue = { theta: theta, phi: phi };
          let shortTheta;
          const currentTargetTheta = theta - targetTheta > 0 ? theta - targetTheta : Math.PI * 2 + (theta - targetTheta);
          const fixedTargetTheta = theta - targetTheta > 0 ? currentTargetTheta % (Math.PI * 2) : currentTargetTheta < 0 ? Math.PI * 2 + (currentTargetTheta % (Math.PI * 2)) : currentTargetTheta % (Math.PI * 2); // 0 -> 6.28 -> 0 -> 6.28

          if (fixedTargetTheta > Math.PI && fixedTargetTheta < Math.PI * 2) {
            // left side
            shortTheta = Math.PI * 2 + (theta - fixedTargetTheta);
          } else {
            // right side
            shortTheta = theta - fixedTargetTheta;
          }

          // gsap.to(camera.position, 1.3, { y: 0, z: 100, ease: 'power3.out' });
          gsap.to(animValue, 1.3, {
            theta: shortTheta,
            phi: targetPhi,
            ease: 'power3.out',
            onUpdate: function () {
              const value = this.targets()[0];
              objectControl.setRotate(value.theta, value.phi);
            }
          });

          // point bg
            // resetPointsColor();
            // toWhiteColor();
            // animCanvasTexture.start();
          //   setTimeout(() => {
          //     animCanvasTexture.destroy();
          //     setHideEarth(true);
          //   }, 1600);
            pointsBgMaterial.uniforms.activeInstanceId.value = currentHoveredInstanceId;
            oldHoveredInstanceId = currentHoveredInstanceId;

          //
          // gsap.to('#selectCity', 0.3, { autoAlpha: 0, ease: 'power1.inOut' });
          // gsap.to('#locationsOuterWrap', 0.3, { autoAlpha: 1, ease: 'power1.inOut' });
          if(selectCityElem.current) selectCityElem.current.classList.add('hide');
          if(locationsOuterWrapElem.current) locationsOuterWrapElem.current.classList.add('show');
          //   showDetails();
        }
        else{
          showDetails(currentHoveredInstanceId);
        }
      }
    };
    selectLocationFunc.current = { selectLocation };

    // const toWhiteColor = () => {
    //   const meshs = [pointsMesh, linesMesh];
    //   const id = currentHoveredInstanceId;
    //   for (let i = 0; i < meshs.length; i++) {
    //     const mesh = meshs[i];
    //     const attribute = mesh.geometry.attributes.instanceColor;
    //     const animValue = { r: pointInstanceColors[id * 3], g: pointInstanceColors[id * 3 + 1], b: pointInstanceColors[id * 3 + 2] };

    //     gsap.to(animValue, 0.3, {r: 1,g: 1,b: 1,overwrite: true,ease: 'power3.out',
    //       onUpdate: function () {
    //         const value = this.targets()[0];
    //         attribute.setXYZ(id, value.r, value.g, value.b);
    //         attribute.needsUpdate = true;
    //       }
    //     });
    //   }
    // };
    // toWhiteColorFunc.current = { toWhiteColor };

    const resetPointsColor = () => {
      isHideEarth = false;
      goToDetail = false;
      pointsBgMaterial.uniforms.activeInstanceId.value = -1;
      oldHoveredInstanceId = null;
      // const meshs = [pointsMesh, linesMesh];
      // const id = oldHoveredInstanceId;
      // if (id !== currentHoveredInstanceId && id !== null) {
      //   for (let i = 0; i < meshs.length; i++) {
      //     const mesh = meshs[i];
      //     const attribute = mesh.geometry.attributes.instanceColor;
      //     const animValue = { r: 1, g: 1, b: 1 };

      //     gsap.to(animValue, 0.3, {
      //       r: pointInstanceColors[id * 3],
      //       g: pointInstanceColors[id * 3 + 1],
      //       b: pointInstanceColors[id * 3 + 2],
      //       ease: 'power3.out',
      //       onUpdate: function () {
      //         const value = this.targets()[0];
      //         attribute.setXYZ(id, value.r, value.g, value.b);
      //         attribute.needsUpdate = true;
      //       }
      //     });
      //   }
      // }
      // pointsBgMaterial.uniforms.activeInstanceId.value = -1;

    };
    resetPointsColorFunc.current = { resetPointsColor };

    const showDetails = idx => {
      currentHoveredInstanceId = idx;
      objectControl.disable();
      // resetPointsColor();
      // toWhiteColor();
      // animCanvasTexture.start();
      setTimeout(() => {
        // animCanvasTexture.destroy();
        isHideEarth = true;
        setHideEarth(true);
      }, 600);
      // pointsBgMaterial.uniforms.activeInstanceId.value = currentHoveredInstanceId;
      // oldHoveredInstanceId = currentHoveredInstanceId;
      gsap.set('#detailPage', { className: 'active' });
      gsap.fromTo('#opening .bg', 0.8, { y: '100%' }, { force3D: true, y: '0%', stagger: 0.1, ease: 'expo.inOut' });
      // gsap.fromTo('#sectionWrap #line span', 0.6, { y: '100vh', autoAlpha:.5 }, { force3D: true, y: '-150vh', autoAlpha:0, stagger: 0.1, ease: 'power3.inOut' });

      // setTimeout(() => {
        setDetailIdx(0);
        // console.log('what happened');
      // }, 1000);
      // gsap.set('#opening',{delay:2, className:'section active'});
    };
    showDetailsRef.current = { showDetails };

    const zoomIn = () => {
      const tl = gsap.timeline({ onComplete: pops });
      timeLineRef.current = tl;
      tl.to('#lang', 0.3, { autoAlpha: 0, ease: 'power1.inOut' });
      tl.to(camera.position, 2, { y: 0, z: 100, ease: 'power4.inOut' }, '-=.1');
      tl.to('#locationSelector', 0.3, { autoAlpha: 1, ease: 'power1.inOut' }, 'end');
      //   tl.call(pops, null, 'end');
    };
    zoomInFunc.current = { zoomIn };

    const zoomOut = () => {
      const tl = gsap.timeline();
      tl.to('#locationSelector', 0.3, { autoAlpha: 0, ease: 'power1.inOut' });
      tl.to(camera.position, 2, { y: 0, z: 170, ease: 'power4.inOut' }, 'a');
      tl.call(()=>reversePops(),null,'a');
      tl.to('#lang', 0.3, { autoAlpha: 1, ease: 'power1.inOut' },'end');
      setSelectedId(null);
    };
    zoomOutFunc.current = { zoomOut, clearIdx };

    const disableRotate = () => {
      objectControl.disable();
    };
    disableRotateFunc.current = { disableRotate };

    const enableRotate = () => {
      objectControl.enable();
    };
    enableRotateFunc.current = { enableRotate };

    const enableAutoRotate = () => {
      objectControl.enableAutoRotate();
    };
    enableAutoRotateFunc.current = { enableAutoRotate };

    const updatePin = () => {
      for(let i=0, lth = locations.length; i<lth; i++){
        const { targetTheta, targetPhi } = calcThetaPhiFromLatLon(locations[i].lat, locations[i].lon);
        const { theta, phi } = objectControl.getCurrentThetaPhi();

        const st = Math.abs((Math.abs(theta - targetTheta)* 180/Math.PI) % 360 - 180) / 100;
        const sp = 1 - Math.abs((Math.abs(phi - targetPhi)* 180/Math.PI) % 360) / 100;
        // console.log(st);
        pinMesh.geometry.attributes.size.array[ i ] = (st * sp) * animValue[i].s;
        pinMesh.geometry.attributes.size.needsUpdate = true;
      }
    }

    const draw = () => {
      if(!isHideEarth){
        objectControl.draw();

        updateClouds();
        updateCircleLineBg();
        updatePin();

        // raycaster.setFromCamera(mouse, camera);
        // const intersection = raycaster.intersectObject(pointsMesh);

        // if (intersection.length > 0) {
        //   currentHoveredInstanceId = intersection[0].instanceId;
        //   // console.log("balls clicked");
        //   if (currentHoveredInstanceId !== prevHoveredInstanceId) {
        //     document.body.style.cursor = 'pointer';
        //     prevHoveredInstanceId = currentHoveredInstanceId;
        //   }
        // } else {
        //   if (prevHoveredInstanceId !== null) {
        //     document.body.style.cursor = '';
        //     currentHoveredInstanceId = null;
        //     prevHoveredInstanceId = null;
        //   }
        // }
      }
    };

    const update = () => {
      draw();
      // if (stats) stats.update();
    };

    const render = () => {
      // renderer.render(scene, dev.godCamera);
      renderer.render(scene, camera);
    };

    const removeObjectIn3dWorld = () => {
      for (let i = 0, lth = geometryItems.length; i < lth; i++) {
        let geometry = geometryItems[i];
        geometry.dispose();
        if (i === lth - 1) geometryItems = undefined;
      }
      for (let i = 0, lth = materialItems.length; i < lth; i++) {
        let material = materialItems[i];
        material.dispose();
        if (i === lth - 1) materialItems = undefined;
      }
      for (let i = 0, lth = textureItems.length; i < lth; i++) {
        let texture = textureItems[i];
        texture.dispose();
        if (i === lth - 1) textureItems = undefined;
      }
      for (let i = 0, lth = meshItems.length; i < lth; i++) {
        let mesh = meshItems[i];
        scene.remove(mesh);
        if (i === lth - 1) meshItems = undefined;
      }
      scene.dispose();
    };

    const keyDown = e => {
      if (e.keyCode === 13) {
        pops();
      }
    };
    // setTimeout(()=>{
    //     pops();
    // },3000)

    const onWindowResize = () => {
      // camera.left = -window.innerWidth / 2;
      // camera.right = window.innerWidth / 2;
      // camera.top = window.innerHeight / 2;
      // camera.bottom = -window.innerHeight / 2;
      const screen = getScreenSizeIn3dWorld(camera);
      screen.width = screen.width;
      screen.height = screen.height;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const initEvent = () => {
      addEvent();
    };

    const addEvent = () => {
      document.addEventListener('mousedown', onMouseDown, false);
      // document.addEventListener('mousemove', onMouseMove, false);

      document.addEventListener('touchstart', onMouseDown, false);
      // document.addEventListener('touchmove', onMouseMove, false);
      window.addEventListener('resize', onWindowResize, false);
      window.addEventListener('keydown', keyDown);
    };

    const removeEvent = () => {
      // if(cameraControl) cameraControl.destroy();
      if (dev) dev.destroy();
      document.removeEventListener('mousedown', onMouseDown, false);
      // document.removeEventListener('mousemove', onMouseMove, false);

      document.removeEventListener('touchstart', onMouseDown, false);
      // document.removeEventListener('touchmove', onMouseMove, false);
      window.removeEventListener('resize', onWindowResize, false);
      window.removeEventListener('keydown', keyDown);
    };

    initEngine();
    initEvent();

    return () => {
      removeStats();
      // removeGUI();
      removeEvent();
      removeObjectIn3dWorld();
      renderer.setAnimationLoop(null);
    };
  }, []);

  useEffect(() => {
    if(allData){
      const parent = locationsWrapElem.current;
      const halfHeight = parent.offsetHeight / 2;
      const child = locationsElem.current;
      const items = child.querySelectorAll('li');
      const itemHeight = items[0].offsetHeight;
      let clicked = false;
      const mouse = {
        pos: { x: 0, y: 0 },
        startPos: { x: 0, y: 0 },
        lastPos: { x: 0, y: 0 },
        delta: { x: 0, y: 0 }
      };
      let y = 0;
      let easeY = 0;
      let activedId = 0;
      let isHideEarth = false;
      let delaySelect = null;
      // let clickedId = 0;

      const onMouseDown = event => {
        let e = event.touches ? event.touches[0] : event;
        mouse.startPos.x = e.clientX;
        mouse.startPos.y = e.clientY;
        mouse.lastPos.x = 0;
        mouse.lastPos.y = 0;
        clicked = true;
        setScrolling(false);
        // console.log('second mousedown');
        disableRotate();
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('touchmove', onMouseMove, false);
        document.addEventListener('touchend', onMouseUp, false);
      };

      const onMouseMove = event => {
        if (clicked) {
          setScrolling(true);
          let e = event.touches ? event.touches[0] : event;

          mouse.pos.x = mouse.startPos.x - e.clientX;
          mouse.pos.y = mouse.startPos.y - e.clientY;

          mouse.delta.x = mouse.lastPos.x - mouse.pos.x;
          mouse.delta.y = -(mouse.lastPos.y - mouse.pos.y);
          mouse.delta.y *= 2;

          mouse.lastPos.x = mouse.pos.x;
          mouse.lastPos.y = mouse.pos.y;

          moveElem(mouse.delta);
        }
      };

      const onMouseUp = () => {
        selectLocation(activedId+1);
        clicked = false;
        enableRotate();
        document.addEventListener('touchmove', onMouseMove, false);
        document.removeEventListener('mouseup', onMouseUp, false);
        document.removeEventListener('touchmove', onMouseMove, false);
        document.removeEventListener('touchend', onMouseUp, false);
      };

      const moveElem = delta => {
        moveTo(y + delta.y);
      };

      const moveTo = _y => {
        y = Math.max(-parent.offsetHeight / 2 + items[0].offsetHeight / 2 - 7, Math.min(child.offsetHeight - parent.offsetHeight + items[0].offsetHeight, _y));
      };
      // moveToFunc.current = {moveTo}

      const moveFromId = id => {
        // if(items[id - 1]){
          moveTo(items[id - 1].offsetTop - items[id - 1].offsetHeight);
          setSelectedId(id);
        // }
      };
      moveFromIdFunc.current = { moveFromId };

      const update = () => {
        if(!isHideEarth){
          easeY += (y - easeY) * 0.3;
          child.style.transform = `translate3d(-50%,${-easeY}px,0)`;

          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemOffsetTop = item.getBoundingClientRect().top - parent.getBoundingClientRect().top;
            const itemOffsetBot = itemOffsetTop + itemHeight;
            
            if (itemOffsetTop < halfHeight && itemOffsetBot > halfHeight && i !== activedId) {
              activedId = i;
              setScrolledDetailIdx(i + 1);
              setHoverId(i+1);
              // setSelectedId(null);
            }
          }
        }
      };

      // const delaySelectLocation = (i) => {
      //   if(clicked) {
      //     if(delaySelect) clearTimeout(delaySelect);
      //     delaySelect = setTimeout(()=>{
      //       console.log(i);
      //       clearTimeout(delaySelect);
      //     },1000);
      //   }
      // }

      const animLoop = () => {
        requestAnimationFrame(animLoop);
        update();
      };

      const initEvent = () => {
        parent.addEventListener('mousedown', onMouseDown, false);
        parent.addEventListener('touchstart', onMouseDown, false);
      };

      initEvent();
      animLoop();
    }
    // return () => {};
  }, [allData]);

  useEffect(() => {
    fetch('./json/g02a.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        setAllData(data);
        setData(data.content[language]);
      });
  }, []);

  const onChangeLang = lang => {
    if (allData) {
      // setStarted(true);
      zoomInFunc.current.zoomIn();
      setLanguage(lang);
      setData(allData.content[lang]);
      //   const { targetTheta, targetPhi } = calcThetaPhiFromLatLon(locations[0].lat, locations[0].lon);
      //   const { theta, phi } = objectControlRef.current.getCurrentThetaPhi();
      //   const animValue = { theta: theta, phi: phi };
      //   let shortTheta;

      //   const currentTargetTheta = theta - targetTheta > 0 ? theta - targetTheta : Math.PI * 2 + (theta - targetTheta);

      //   const fixedTargetTheta = theta - targetTheta > 0 ? currentTargetTheta % (Math.PI * 2) : currentTargetTheta < 0 ? Math.PI * 2 + (currentTargetTheta % (Math.PI * 2)) : currentTargetTheta % (Math.PI * 2); // 0 -> 6.28 -> 0 -> 6.28

      //   if (fixedTargetTheta > Math.PI && fixedTargetTheta < Math.PI * 2) {
      //     // left side
      //     shortTheta = Math.PI * 2 + (theta - fixedTargetTheta);
      //   } else {
      //     // right side
      //     shortTheta = theta - fixedTargetTheta;
      //   }

      //   gsap.to(camera.position, 1.3, { y: 0, z: 100, ease: 'power3.out' });
      //   gsap.to(animValue, 1.3, {
      //     theta: shortTheta,
      //     phi: targetPhi,
      //     ease: 'power3.out',
      //     onUpdate: function () {
      //       const value = this.targets()[0];
      //       objectControlRef.current.setRotate(value.theta, value.phi);
      //     }
      //   });
    }
  };

  const onChangeDetail = idx => {
    if (detailIdx !== idx) {
      setAniLock(prevAniLock => {
        let tempArray = prevAniLock;
        tempArray[idx - 1] = true;
        return tempArray;
      });
      setDetailIdx(idx);
      setZindex(zindex + 1);
      let temp = gsap.timeline({
        onComplete: () => {
          setAniLock(prevAniLock => {
            let tempArray = prevAniLock;
            tempArray[idx - 1] = false;
            return tempArray;
          });
          // console.log('finish', aniLock);
        }
      });
      temp.set(`#section${idx}`, { zIndex: zindex });
      temp.fromTo(`#section${idx} .bg span`, 1, { y: '100%' }, { force3D: true, y: '-100%', ease: 'expo.out' },'s');
      temp.fromTo(`#section${idx} .bg`, 0.8, { y: '100%' }, { force3D: true, y: '0%', stagger: 0.1, ease: 'expo.inOut' },'-=.8');
      // temp.fromTo('#sectionWrap #line span', 0.4, { y: '100vh',autoAlpha:.5 }, { force3D: true, y: '-150vh', autoAlpha:0, stagger: 0.1, ease: 'power2.inOut' },'s');
      // temp.to({}, {duration:4});
      // gsap.set(`#section${idx}`, {zIndex:zindex});
      // gsap.fromTo(`#section${idx} .bg span`, 1, {y:'100%'},{force3D:true, y:'-100%', stagger:.08, ease:'expo.out'});
      // gsap.fromTo(`#section${idx} .bg`, .6, {y:'100%'},{force3D:true, y:'0%', stagger:.08, ease:'expo.inOut'});
    }
  };

  const enableRotate = () => {
    enableRotateFunc.current.enableRotate();
  };

  const disableRotate = () => {
    disableRotateFunc.current.disableRotate();
  };

  const selectLocation = (id) => {
    // if (!scrolling) {
      moveFromIdFunc.current.moveFromId(id);
      selectLocationFunc.current.selectLocation(id);
      // console.log('debug');
    // }
  };

  const onBackHome = (zoomOut = false) => {
    if (aniLock.every(x => x === false)) {
      gsap.to(`.section.active .bg`, 0.6, {
        force3D: true,
        y: '100%',
        overwrite: true,
        stagger: 0.04,
        ease: 'expo.out',
        onComplete: () => {
          if (zoomOut === true) {
            zoomOutFunc.current.zoomOut();
          }
        }
      });
      gsap.set(`.section:not(.active) .bg`, { y: '100%' });
      gsap.set(`.section .bg span`, { y: '100%' });
      gsap.set('#detailPage', { className: '' });
      setDetailIdx(null);
      setSelectedId(null);
      // setStarted(false);
      enableRotate();
      resetPointsColorFunc.current.resetPointsColor();
      enableAutoRotateFunc.current.enableAutoRotate();
      setHideEarth(false);
      zoomOutFunc.current.clearIdx();
      //   console.log('enter');
    }
  };

  return (
    <div id='home' className={hideEarth ? 'hideEarth' : ''}>
      <div ref={canvasWrap} id='canvasWrap'></div>
      <div id='touch'>
        Touch screen to select
        <br />
        觸碰螢幕以選取
      </div>
      <div id='lang'>
        {allData && (
          <>
            <p>
              Please select language
              <br />
              請選擇語言
            </p>
            <div onClick={() => onChangeLang('en')}>English</div>
            <div onClick={() => onChangeLang('tc')}>繁體中文</div>
          </>
        )}
      </div>
      <div id='locationSelector'>
        <div id='hk' className='sameWidth big'>
          {locations[0].name[language]}
        </div>
        <div id='line'></div>
        <div id='selector' className='sameWidth'>
          <div ref={selectCityElem} id='selectCity' className='big'>
            {data && data.global.selectCity}
          </div>
          <div ref={locationsOuterWrapElem} id='locationsOuterWrap'>
            <div ref={locationsWrapElem} id='locationsWrap'>
              <ul ref={locationsElem} id='locations'>
                {locations.map((value, idx) => {
                  return idx !== 0 ? (
                    <li key={idx} className={selectedId === idx || hoverId === idx ? 'active' : ''}
                      onClick={() => {
                        selectLocation(idx);
                      }}>
                      <span onClick={() => {
                          // showDetailsRef.current.showDetails(idx);
                        }}
                      >
                        {value.name[language]}
                      </span>
                    </li>
                  ) : (
                    false
                  );
                })}
              </ul>
            </div>
            <div id='scroll'>
              <div id='index'>
                <span>{scrolledDetailIdx < 10 ? `0${scrolledDetailIdx}` : scrolledDetailIdx}</span>/10
              </div>
              <span></span>
              <p>{data && data.global.scrollDown}</p>
            </div>
          </div>
        </div>
      </div>
      <div id='detailPage' className=''>
        <div id='sectionWrap'>
          <div id='opening' className={`section ${detailIdx === 0 ? 'active' : ''}`}>
            <div id='left' className='half'>
              <div className='wrap'>
                <span className='name'>{locations[0].name[language]}</span>
                <div className='img lowerBg' style={{ backgroundImage: `url(./images/exG02a/hongkongbg.jpg)` }}></div>
              </div>
              <div className='bg'>
                <span></span>
              </div>
            </div>
            <div id='right' className='half'>
              <div className='wrap'>
                <span className='name'>{selectedId && locations[selectedId].name[language]}</span>
                <div className='img' style={{ backgroundImage: `url(./images/exG02a/${selectedId ? locations[selectedId].name['en'].replace(' ', '').toLowerCase() : 'hongkong'}bg.jpg)` }}></div>
              </div>
              <div className='bg'>
                <span></span>
              </div>
            </div>
          </div>

          <div className={`locationName left ${detailIdx !== 0 && detailIdx !== null ? 'active' : ''}`}>
            {locations[0].name[language]}
            <span style={{ backgroundImage: `url(./images/exG02a/hongkongflag.svg)` }}></span>
          </div>
          <div className={`locationName right ${detailIdx !== 0 && detailIdx !== null ? 'active' : ''}`}>
            {selectedId && locations[selectedId].name['en'].replace(' ', '') !== 'Tokyo' && <span style={{ backgroundImage: `url(./images/exG02a/${selectedId ? locations[selectedId].name['en'].replace(' ', '').toLowerCase() : 'hongkong'}flag.png)`, borderRadius: 5 + 'px' }}></span>}
            {selectedId && locations[selectedId].name['en'].replace(' ', '') === 'Tokyo' && <span style={{ backgroundImage: `url(./images/exG02a/${selectedId ? locations[selectedId].name['en'].replace(' ', '').toLowerCase() : 'hongkong'}flag.svg)` }}></span>}
            {selectedId && locations[selectedId].name[language]}
          </div>

          {/* <div id="line">
            {
              [...Array(5)].map((v,i)=>{
                return <span key={i}></span>
              })
            }
          </div> */}

          <Section1 data={data && data.section1} globalData={data && data.global} detailIdx={detailIdx} locationName={selectedId && locations[selectedId].name['en'].replace(' ', '').toLowerCase()} />
          <Section2 data={data && data.section2} globalData={data && data.global} detailIdx={detailIdx} locationName={selectedId && locations[selectedId].name['en'].replace(' ', '').toLowerCase()} />
          <Section3 data={data && data.section3} globalData={data && data.global} detailIdx={detailIdx} locationName={selectedId && locations[selectedId].name['en'].replace(' ', '').toLowerCase()} />
          <Section4 data={data && data.section4} globalData={data && data.global} detailIdx={detailIdx} locationName={selectedId && locations[selectedId].name['en'].replace(' ', '').toLowerCase()} />
          <Section5 data={data && data.section5} globalData={data && data.global} detailIdx={detailIdx} locationName={selectedId && locations[selectedId].name['en'].replace(' ', '').toLowerCase()} />
        </div>
        <div id='nav'>
          <div
            id='homeBtn'
            onClick={() => {
              onBackHome();
            }}
          ></div>
          <ul>
            <li>
              <img alt='' src='./images/exG02a/earth_icon.png'
                onClick={() => {
                  onBackHome(true);
                }}
              ></img>
            </li>
            {data &&
              data.menu.map((value, idx) => {
                return (
                  <li key={idx} className={detailIdx === idx + 1 ? 'active' : ''}
                    onClick={() => {
                      onChangeDetail(idx + 1);
                    }}
                  >
                    <span>{value}</span>
                  </li>
                );
              })}
            {/* <li className={detailIdx === 1 ? 'active' : ''} onClick={()=>onChangeDetail(1)}><span>Urban Form</span></li>
                        <li className={detailIdx === 2 ? 'active' : ''} onClick={()=>onChangeDetail(2)}><span>Population Density</span></li>
                        <li className={detailIdx === 3 ? 'active' : ''} onClick={()=>onChangeDetail(3)}><span>Tallest Buildings</span></li>
                        <li className={detailIdx === 4 ? 'active' : ''} onClick={()=>onChangeDetail(4)}><span>Transportation</span></li>
                        <li className={detailIdx === 5 ? 'active' : ''} onClick={()=>onChangeDetail(5)}><span>GDP</span></li> */}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
