import React, { useEffect, useRef } from 'react';
// import { useSelector } from 'react-redux';
import {CameraControlsSystem, initStats, initGUI, removeStats, removeGUI, getScreenSizeIn3dWorld , devMode } from './globalFuncFor3d';
import * as THREE from 'three';
import './style.scss';

import earthMap from './images/earth/8081_earthmap4k.jpg';
import earthBumpMap from './images/earth/8081_earthbump4k.jpg';
import earthSpecularMap from './images/earth/8081_earthspec4k.jpg';


const App = props => {
    // const count = useSelector(state => state.count);
    const canvasWrap = useRef(null);


    useEffect(()=>{
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

        // stats
        let stats = undefined;

        // options
        const options = {
            cameraZ:{ value:5, min:0, max:20, name:'Camera Z' },
            scale:{ value:10, min:0, max:50 }
        }

        // dragging system
        let dragging = null;

        // param
        const earthRadius = 20;

        
        const initEngine = () => {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(30, window.innerWidth/window.innerHeight, 0.1, 10000);
            camera.position.set(0, 0, 150);


            renderer = new THREE.WebGLRenderer({ antialias: true, alpha:true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0xffffff, 0);
            canvasWrap.current.appendChild(renderer.domElement);
            

            stats = initStats();
            initGUI(options);
            initLight();
            initMesh();

            dragging = new CameraControlsSystem(camera);
            setTimeout(()=>{
                dragging.zoomTo(2);
                dragging.rotateTo(Math.sin(45 * Math.PI/180), Math.cos(45 * Math.PI/180));
            },2000);
            dev = devMode(scene);
            
            renderer.setAnimationLoop(function() {
                update();
                render();
            });
        }

        const initLight = () => {
            ambientLight = new THREE.AmbientLight(0xcccccc);

            lights[0] = new THREE.PointLight(0xffffff, .7, 100);
            lights[0].position.set(earthRadius*2, earthRadius*2, earthRadius*2);
            lights[0].add(new THREE.Mesh( new THREE.SphereGeometry(1,4,4), new THREE.MeshBasicMaterial({ color: 0xffffff })));
            
            lights[1] = new THREE.PointLight(0xffffff, .7, 100);
            lights[1].position.set(earthRadius*2, -earthRadius*2, -earthRadius*2);
            lights[1].add(new THREE.Mesh( new THREE.SphereGeometry(1,4,4), new THREE.MeshBasicMaterial({ color: 0xffffff })));

            scene.add(lights[0]);
            // scene.add(lights[1]);
            scene.add(ambientLight);
        };
      
        const initMesh = () => {            
            initEarth();

            for(let i=0; i< meshItems.length; i++)
                scene.add(meshItems[i]);
        };

        const initEarth = () => {console.log(new THREE.TextureLoader().load(earthSpecularMap))
            const geometry = new THREE.IcosahedronGeometry(earthRadius, 4);
            const material = new THREE.MeshPhongMaterial({
                map: new THREE.TextureLoader().load(earthMap),
                bumpMap: new THREE.TextureLoader().load(earthBumpMap),
                bumpMapScale: .7,
                specularMap: new THREE.TextureLoader().load(earthSpecularMap),
                specular: new THREE.Color('grey')
                // wireframe:false
            });
            const mesh = new THREE.Mesh(geometry, material);
            // material.shading = THREE.FlatShading;

            materialItems.push(material);
            geometryItems.push(geometry);
            meshItems.push(mesh);
        }

        const draw = () => {
            // pointLight.position.x = Math.cos(performance.now()/1000) * 20;
            // pointLight.position.y = Math.sin(performance.now()/1000 *2) * 20;
            // pointLight.position.z = Math.sin(performance.now()/1000) * 20;
        }
        
        const update = () => {
            draw();
            stats.update();
        };
  
        const render = () => {
            // renderer.render(scene, dev.godCamera);
            renderer.render(scene, camera);
        };

        const removeObjectIn3dWorld = () => {
            for(let i=0, lth=geometryItems.length; i<lth; i++){
                let geometry = geometryItems[i];
                geometry.dispose();
                if(i === lth-1)geometryItems = undefined;
            }
            for(let i=0, lth=materialItems.length; i<lth; i++){
                let material = materialItems[i];
                material.dispose();
                if(i === lth-1)materialItems = undefined;
            }
            for(let i=0, lth=textureItems.length; i<lth; i++){
                let texture = textureItems[i];
                texture.dispose();
                if(i === lth-1)textureItems = undefined;
            }
            for(let i=0, lth=meshItems.length; i<lth; i++){
                let mesh = meshItems[i];
                scene.remove(mesh);
                if(i === lth-1)meshItems = undefined;
            }
            scene.dispose();
        }

        
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
        }

        const initEvent = () => {
            addEvent();
        }

        const addEvent = () => {
            window.addEventListener("resize", onWindowResize);
        }

        const removeEvent = () => {
            if(dragging) dragging.destroy();
            if(dev) dev.destroy();
            window.removeEventListener("resize", onWindowResize);
        }

        initEngine();
        initEvent();

        return () => {
            removeStats();
            removeGUI();
            removeEvent();
            removeObjectIn3dWorld();
            renderer.setAnimationLoop(null);
        }
    },[])

    return (
        <div id="home">
            <div ref={canvasWrap} id="canvasWrap"></div>
        </div>
    )
}

export default App;