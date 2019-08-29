import React, { useState, useEffect} from 'react';
import * as THREE from 'three';
import Orbitcontrols from 'three-orbitcontrols';
import { LineGeometry } from './lines/LineGeometry.js';
import { LineMaterial } from './lines/LineMaterial.js';
import { Line2 } from './lines/Line2.js';
import * as dat from 'dat.gui';
import {TweenMax} from 'gsap';

const App = (props) => {
  const [sceneElem, setSceneElem] = useState(null);

  useEffect(()=>{
      let onWindowResize = null;

      if(sceneElem){


        let width = window.innerWidth,
            height = window.innerHeight; 
        let scene, camera, renderer;
        const offsetDepth = 6;
        const offsetWidth = 2;
        const row = 7;
        const col = 50;
        const pointsLth = row * col;
        let pointGeometry;
        const lines = [];
        const startTime = new Date();
        const options = {
          waveWidth: 10,
          waveScale: 0
        }
        const lineWidth = .3;

        const initScene = () => {
          // camera = new THREE.OrthographicCamera( width / - cameraDepth, width / cameraDepth, height / cameraDepth, height / - cameraDepth, 0.1, 1000 );
          camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );

          // camera.position.x = 50;
          // camera.position.y = 50;
          camera.position.z = 30;

          scene = new THREE.Scene();

          renderer = new THREE.WebGLRenderer({antialias: true});
          renderer.setClearColor(0x000000);
          renderer.setPixelRatio( window.devicePixelRatio );
          renderer.setSize( width, height );
          // renderer.shadowMap.enabled = true;
          // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          renderer.setAnimationLoop(render);
          sceneElem.appendChild( renderer.domElement );

          new Orbitcontrols( camera, renderer.domElement );
          
          initGUI();
          initLights();
          initGeometry();

          TweenMax.to(options, 3, {waveScale: 3, ease:'Power4.easeInOut'});
          // TweenMax.to(options, 3, {delay:5, waveScale: 0, ease:'Power4.easeInOut'});
        }

        const initGUI = () => {
          const gui = new dat.GUI();
          gui.add(options, 'waveWidth',1, 20).name('Wave Width').listen();
          gui.add(options, 'waveScale',0, 10).name('Wave Scale').listen();
        }

        const initLights = () => {
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
          scene.add(ambientLight);

          const pointLight = new THREE.PointLight(0xffffff, 1, 100);
          pointLight.position.set( 20, 50, 0 );
          scene.add(pointLight);
        }

        const initDot = () => {
          pointGeometry = new THREE.BufferGeometry();
          const positions = new THREE.BufferAttribute( new Float32Array(pointsLth * 3) , 3 );
          const sizes = new THREE.BufferAttribute( new Float32Array(pointsLth), 1);
          pointGeometry.addAttribute( 'position', positions );
          pointGeometry.addAttribute( 'size', sizes );

          const uniforms = {
            time: { value: 1.0 },
          }
          const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader:[
                'void main() {',
                  'vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);',
                  'gl_Position = projectionMatrix * modelViewPosition;',

                  'float dist = (30. - sqrt(position.z*position.z + 30. * 30.)) * 2.5 ;',
                  // 'gl_PointSize = (10. + dist) * .5;',
                  'gl_PointSize = 0.;',
                '}'
            ].join('\n'),
            fragmentShader:[
              'void main() {',
                'gl_FragColor = vec4(1., 1., 1., 1.);',
              '}'
            ].join('\n')
          });
          const mesh = new THREE.Points( pointGeometry, material );
          scene.add(mesh);
        }

        const updateDotPos = (t=0) => {
          for(let r=0; r<row; r++){
            for(let c=0; c<col; c++){
              const idx = c + r*col;
              const pos = pointGeometry.attributes.position.array;
              pos[idx*3+0] = (c*offsetWidth) - (col * offsetWidth/2) + (offsetWidth/2);
              pos[idx*3+1] = Math.sin(t + idx / options.waveWidth) * (Math.abs(idx - (pointsLth-1)) * .01) * options.waveScale;
              pos[idx*3+2] = -r*offsetDepth;
            }
          }
          pointGeometry.attributes.position.needsUpdate = true;
        }

        const initLine = () => {
          for(let i=0; i<row; i++){
            const positions = [];
            const pos = pointGeometry.attributes.position.array;
            for(let c=0; c<col; c++){
              const idx = i*col;
              positions.push( new THREE.Vector3(pos[(idx+c)*3+0], pos[(idx+c)*3+1], pos[(idx+c)*3+2]) );
            }
            
            const lineGeo = new LineGeometry();
            const lineMat = new LineMaterial({
              color: 0xffffff,
              linewidth: Math.abs(i-row) * lineWidth * .003, // in pixels
              dashed: false
            });

            const line = new Line2(lineGeo, lineMat);
            lines.push(line);
            scene.add(line);
          }
        }

        const updateLinePos = () => {
          for(let i=0; i<lines.length; i++){
            const line = lines[i];
            const pos = [];
            const pPos = pointGeometry.attributes.position.array;
            const idx = i*col;
            for(let p=0; p<col; p++){
              pos[p*3+0] = pPos[(idx+p)*3+0];
              pos[p*3+1] = pPos[(idx+p)*3+1];
              pos[p*3+2] = pPos[(idx+p)*3+2];
            }
            line.geometry.setPositions( pos );
          }
        }

        const initGeometry = () => {
          initDot();
          updateDotPos();

          initLine();
        }
        
        const update = () => {
          const timer = (new Date() - startTime) * .002;
          updateDotPos(timer);
          updateLinePos();
          camera.lookAt(0,0,0);
        }

        const render = () => {
          update();
          renderer.render( scene, camera );
        }

        onWindowResize = () => {
          // camera.left = -window.innerWidth / cameraDepth;
          // camera.right = window.innerWidth / cameraDepth;
          // camera.top = window.innerHeight / cameraDepth;
          // camera.bottom = -window.innerHeight / cameraDepth;
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize( window.innerWidth, window.innerHeight );
        }
        window.addEventListener( 'resize', onWindowResize, false );

        initScene();
      }
      
      return ()=>{
        if(onWindowResize)
            window.removeEventListener( 'resize', onWindowResize, false );
      }
  },[sceneElem]);

  return <>
      <div ref={(elem)=>{setSceneElem(elem)}} id="scene3d"></div>
  </>
}
export default App;