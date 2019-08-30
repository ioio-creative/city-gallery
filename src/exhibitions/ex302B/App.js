import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import Orbitcontrols from 'three-orbitcontrols';
import * as dat from 'dat.gui';
import { TweenMax } from 'gsap';
import { MeshLine, MeshLineMaterial } from 'three.meshline';

const App = (props) => {
  const [sceneElem, setSceneElem] = useState(null);

  useEffect(()=>{
      let onWindowResize = null;

      if(sceneElem){

        let width = window.innerWidth,
            height = window.innerHeight; 
        let scene, camera, renderer;
        const offsetDepth = 6;
        const offsetWidth = 1;
        const row = 10;
        const col = 20;
        const pointsLth = row * col;
        let pointGeometry;
        const pointMesh = [];
        const lines = [];
        const lineMesh = [];
        const startTime = new Date();
        let lastTime = new Date();
        const options = {
          waveWidth: 1,
          waveScale: 0,
          pointSize: 0
        }
        const lineWidth = .25;

        const initScene = () => {
          // camera = new THREE.OrthographicCamera( width / - cameraDepth, width / cameraDepth, height / cameraDepth, height / - cameraDepth, 0.1, 1000 );
          camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );

          // camera.position.x = 50;
          // camera.position.y = 50;
          camera.position.z = 50;

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

          TweenMax.to(options, 3, {waveScale: 1, ease:'Power4.easeInOut'});
        }

        const initGUI = () => {
          const gui = new dat.GUI();
          gui.add(options, 'waveWidth',1, 20).name('Wave Width').listen();
          gui.add(options, 'waveScale',0, 10).name('Wave Scale').listen();
          gui.add(options, 'pointSize',0, 1).name('Point Size').listen();
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
            pointSize: { value: options.pointSize }
          }
          const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader:[
                'uniform float pointSize;',
                'void main() {',
                  'vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);',
                  'gl_Position = projectionMatrix * modelViewPosition;',

                  'float dist = (50. - sqrt(position.z*position.z + 30.*30.)) ;',
                  `gl_PointSize = (0. + dist) * pointSize;`,
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

          pointMesh.push(mesh);
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
          pointMesh[0].material.uniforms.pointSize.value = options.pointSize;
        }

        const initLine = () => {
          for(let i=0; i<row; i++){
            const pos = pointGeometry.attributes.position.array;
            const geometry = new THREE.Geometry();
            const idx = i*col;
            for(let c=0; c<col ;c++){
              geometry.vertices.push( new THREE.Vector3(pos[(idx+c)*3+0], pos[(idx+c)*3+1], pos[(idx+c)*3+2]) );
            }
            const line = new MeshLine();
            line.setGeometry( geometry );
            const material = new MeshLineMaterial({
              color: 0xffffff,
              lineWidth: Math.abs(i-row) * lineWidth * .1
            });

            const mesh = new THREE.Mesh( line.geometry, material ); 
            lines.push(mesh);
            lineMesh.push(line);          


            scene.add(mesh);
          }
        }

        const updateLinePos = (t) => {
          const pos = pointGeometry.attributes.position.array;
          const geometry = new THREE.Geometry();
          for(let i=0; i<lines.length; i++){
            const line = lines[i];
            if(!lineMesh[i].morph){
              const idx = i*col;
              geometry.vertices = [];
              
              for(let c=0; c<col; c++){
                geometry.vertices.push(
                  new THREE.Vector3(pos[(idx+c)*3+0], pos[(idx+c)*3+1], pos[(idx+c)*3+2])
                );
              }
              
              lineMesh[i].setGeometry( geometry );
            }
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
          updateLinePos(timer);

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