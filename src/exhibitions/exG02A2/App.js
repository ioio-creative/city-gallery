import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
// import { useSelector } from 'react-redux';
import {ObjectControl, initStats, initGUI, removeStats, removeGUI, getScreenSizeIn3dWorld , devMode, calcPosFromLatLonRad, calcThetaPhiFromLatLon, animEase } from './globalFuncFor3d';
import * as THREE from 'three';
import './style.scss';

import earthMap from './images/earth/8081_earthmap4k.jpg';
import earthBumpMap from './images/earth/8081_earthbump4k.jpg';
import earthSpecularMap from './images/earth/8081_earthspec4k.jpg';
import earthNormalMap from './images/earth/earth_normalmap4k.jpg';


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
        const pointOffsets = [];
        const pointScaledOffsets = [];
        const pointScales = [];
        const pointInstanceColors = [];
        const pointBgInstanceColors = [];
        let pointsBgMaterial = null;
        const groupedMesh = new THREE.Group();
        let pointsMesh = null;
        let linesMesh = null;
        // let canvas = null;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(1,1);
        const scaleUpMatrix = new THREE.Matrix4().makeScale( 1,1,20 );
        const scaleDownMatrix = new THREE.Matrix4().makeScale( .5, .5, .5 );
        const instanceMatrix = new THREE.Matrix4();
        const instanceMatrix2 = new THREE.Matrix4();
        const matrix = new THREE.Matrix4();
        let currentHoveredInstanceId = null;
        let prevHoveredInstanceId = null;
        let oldHoveredInstanceId = null;

        let objectControl = null;
        let dragging = false;

        // cameraControl system
        // let cameraControl = null;

        // locations
        const locations = [
            { name:'Hong Kong', lat:22.377720, lon:114.155267 },
            { name:'Japan', lat:36.343782, lon:138.695725 },
            { name:'Taiwan', lat:23.888775, lon:120.989626 },
            { name:'Korea', lat:36.578477, lon:128.079916 },
            { name:'USA', lat:39.956661, lon:-98.027880 },
            { name:'France', lat:46.1385598, lon:-2.4472232 },
            { name:'Australia', lat:-24.495995, lon:134.599090 },
            { name:'Brasil', lat:-10.871609, lon:-50.468879 }
        ]

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
        }


        // param
        const earthRadius = 20;

        
        const initEngine = () => {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(30, window.innerWidth/window.innerHeight, 0.1, 1000);
            camera.position.set(0, 0, 130);


            renderer = new THREE.WebGLRenderer({ antialias: true, alpha:true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0xffffff, 0);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            canvasWrap.current.appendChild(renderer.domElement);
            

            stats = initStats();
            // initGUI(options);
            initLight();
            initMesh();

            // cameraControl = new CameraControlsSystem(camera, meshEarth);
            objectControl = new ObjectControl(groupedMesh);
            // dev = devMode(scene);
            
            renderer.setAnimationLoop(function() {
                update();
                render();
            });
        }

        const initLight = () => {
            ambientLight = new THREE.AmbientLight(0xeeeeee);

            lights[0] = new THREE.PointLight(0xffffff, .6, 100);
            lights[0].position.set(earthRadius*2, earthRadius*2, earthRadius*2);
            lights[0].add(new THREE.Mesh( new THREE.SphereGeometry(1,16,16), new THREE.MeshBasicMaterial({ color: 0xffffff })));
            lights[0].castShadow = true;

            scene.add(lights[0]);
            scene.add(ambientLight);
        };
      
        const initMesh = () => {
            initEarth();
            initHalo();
            initLocationPoints();

            for(let i=0; i< meshItems.length; i++)
                groupedMesh.add(meshItems[i]);

                // groupedMesh.position.y = -20;
                // groupedMesh.position.z = 50;
            scene.add(groupedMesh)
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
                shininess:20,
                side:THREE.DoubleSide
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            materialItems.push(material);
            geometryItems.push(geometry);
            meshItems.push(mesh);
        }

        const initHalo = () => {
            const geometry = new THREE.IcosahedronGeometry(earthRadius+4, 3);
            var material = new THREE.ShaderMaterial({
                vertexShader:[
                    'varying vec3 vNormal;',
                    'void main() {',
                        'vNormal = normalize( normalMatrix * normal );',
                        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                    '}'
                ].join('\n'),
                fragmentShader:[
                    'varying vec3 vNormal;',
                    'void main() {',
                        'float intensity = pow( 0.65 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 3.0 );',
                        'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
                    '}'
                ].join('\n'),
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthWrite: false,
            });
            var mesh = new THREE.Mesh( geometry, material );

            materialItems.push(material);
            geometryItems.push(geometry);
            meshItems.push(mesh);
        }

        const initLocationPoints = () => {
            createPoints();
            createPointsBg();
            createLines();
        }

        const createPoints = () => {
            const geometry = new THREE.IcosahedronBufferGeometry(.8, 2);
            const material = new THREE.MeshBasicMaterial({color:0xffffff});
            pointsMesh = new THREE.InstancedMesh( geometry, material, locations.length );
            const transform = new THREE.Object3D();

            for(let i=0; i<locations.length; i++){
                const location = locations[i];
                const pos = initLocationPointsPosition(location);

                pointOffsets.push(pos.x, pos.y, pos.z);
                pointScales.push(Math.random()*.3+1.15);

                transform.position.set( 0,0,0 );
                transform.scale.set(0.001,0.001,0.001);
                transform.updateMatrix();
                
                transform.position.set( pos.x, pos.y, pos.z ).multiplyScalar(pointScales[i]);
                transform.updateMatrix();
                pointScaledOffsets.push(transform.position.x, transform.position.y, transform.position.z);
                pointsMesh.setMatrixAt( i, transform.matrix );

                if(i===0)
                    pointInstanceColors.push(0/255, 53/255, 87/255)
                else
                    pointInstanceColors.push(81/255, 190/255, 255/255)
            }
            pointsMesh.castShadow = true;
            updateColor(geometry, pointsMesh);

            materialItems.push(material);
            geometryItems.push(geometry);
            meshItems.push(pointsMesh);
        }

        const createLines = () => {
            const geometry = new THREE.CylinderBufferGeometry(.1, .1, .1, 6, 1, true);
            const material = new THREE.MeshBasicMaterial({color:0xffffff});
            linesMesh = new THREE.InstancedMesh( geometry, material, locations.length );
            geometry.translate(0,.1/2,0);
            geometry.rotateX(90 * THREE.Math.DEG2RAD);

            const transform = new THREE.Object3D();
            for(let i=0; i<locations.length; i++){
                // reset
                transform.position.set( 0,0,0 );
                transform.updateMatrix();

                transform.lookAt(pointOffsets[i*3], pointOffsets[i*3+1], pointOffsets[i*3+2]);
                transform.position.set( pointOffsets[i*3]/2, pointOffsets[i*3+1]/2, pointOffsets[i*3+2]/2 );
                transform.scale.z = (earthRadius * pointScales[i] - earthRadius) * 10;
                transform.updateMatrix();
                linesMesh.setMatrixAt( i, transform.matrix );
            }
            linesMesh.castShadow = true;
            updateColor(geometry, linesMesh);
            
            materialItems.push(material);
            geometryItems.push(geometry);
            meshItems.push(linesMesh);
        }

        const createPointsBg = () => {
            const canvasTexture = createCanvasTexture();
            const animCanvasTexture = createAnimCanvasTexture();
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            const textures = [
                new THREE.CanvasTexture(canvasTexture), 
                new THREE.CanvasTexture(animCanvasTexture)
            ];
            const ids = [];

            for(let i=0; i<locations.length; i++){
                const scaledOffset = pointScaledOffsets;
                vertices.push(scaledOffset[i*3], scaledOffset[i*3+1], scaledOffset[i*3+2]);
                ids.push(i);
                if(i === 0)
                    pointBgInstanceColors.push(1,1,1);
                else
                    pointBgInstanceColors.push(81/255, 190/255, 255/255);
            }

            geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(vertices), 3 ) );
            geometry.setAttribute( 'instanceColor', new THREE.BufferAttribute( new Float32Array(pointBgInstanceColors), 3 ) );
            geometry.setAttribute( 'instanceId', new THREE.BufferAttribute( new Float32Array(ids), 1 ) );

            pointsBgMaterial = new THREE.ShaderMaterial({
                uniforms:{
                    activeInstanceId:{ type:'f', value: 0. },
                    textures:{
                        type: "t", value: textures
                    }
                },
                vertexShader:[
                    'attribute vec3 instanceColor;',
                    'attribute float instanceId;',
                    'varying vec3 vColor;',
                    'varying float vId;',

                    'void main() {',
                        'vColor = instanceColor;',
                        'vId = instanceId;',
                        'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
                        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                        `gl_PointSize = 2.5 * ${window.innerHeight * Math.PI} / -mvPosition.z;`,
                    '}'
                ].join('\n'),
                fragmentShader:[
                    'uniform sampler2D textures[2];',
                    'uniform float activeInstanceId;',
                    'varying vec3 vColor;',
                    'varying float vId;',

                    'void main() {',
                        'vec4 texture;',
                        'vec3 color;',

                        'if(activeInstanceId == vId){',
                            'color = vec3(1.,1.,1.);',
                            'texture = texture2D( textures[1], gl_PointCoord );',
                        '}',
                        'else{',
                            'color = vColor;',
                            'texture = texture2D( textures[0], gl_PointCoord );',
                        '}',
                        'gl_FragColor = vec4( color, 1.0 );',
                        'gl_FragColor = gl_FragColor * texture;',
                    '}'
                ].join('\n'),
                transparent:true,
                depthWrite: false,
                depthWrite:false
            });
            const mesh = new THREE.Points(geometry, pointsBgMaterial);
            
            console.log(mesh)
            materialItems.push(pointsBgMaterial);
            geometryItems.push(geometry);
            meshItems.push(mesh);
        }

        const createCanvasTexture = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 1024;
            canvas.height = 1024;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(255,255,255,0.01)';
            ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.arc(1024/2, 1024/2, 1024/2, 0, 2*Math.PI);
            ctx.fillStyle = `rgba(255,255,255,.6)`;
            ctx.fill();

            return canvas;
        }

        const createAnimCanvasTexture = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const radius = 1024/2-10;
            let circles = [];
            const animValue = {r:0};
            canvas.width = 1024;
            canvas.height = 1024;
            
            const clearCanvas = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'rgba(255,255,255,0.01)';
                ctx.fillRect(0,0,canvas.width,canvas.height);
            }
            
            const draw = (r) => {
                ctx.strokeStyle = `rgba(255,225,255,${1-r})`;
                ctx.lineWidth = 20;
                ctx.beginPath();
                ctx.arc(1024/2, 1024/2, r*radius, 0, 2*Math.PI);
                ctx.stroke();
            }
            
            setInterval(() => {
                circles.push({radius:0});
            },500);
            
            setInterval(() => {
                clearCanvas();
                const newCircles = [];
                for(let i=0; i<circles.length; i++){
                    const circle = circles[i];
                    circle.radius+=.02;
                    draw(circle.radius);

                    if(circle.radius <= 1)
                        newCircles.push(circle);
                }
                circles = newCircles;
                pointsBgMaterial.uniforms.textures.value[1].needsUpdate = true;
            },1000/60);

            // const tl = gsap.timeline({ repeat:-1, repeatDelay:1 });
            // tl.add(()=>{circles.push({radius:0})});
            // tl.add(()=>{circles.push({radius:0})}, .3);

            // gsap.to(animValue, 2, {repeat:-1, r:1, ease:'power3.out',
            //     onUpdate:function(){
            //         const value = this.targets()[0];
            //         clearCanvas();
            //         draw(value.r);
            //         pointsBgMaterial.uniforms.textures.value[1].needsUpdate = true;
            //     }
            // })
// document.body.appendChild(canvas);
            
            
            return canvas;
        }
        
        const showPointsBg = () => {
            const animValue = {alpha:0};
            gsap.to(animValue, 1, {alpha:.3, ease:'power3.out',
                onUpdate:function(){
                    const value = this.targets()[0];
                    draw(value.alpha);
                    material.map.needsUpdate = true;
                }
            });
        }
        
        const AnimPointsBg = () => {
            
        }

        const updateColor = (geometry, mesh) => {
            geometry.addAttribute( 'instanceColor', new THREE.InstancedBufferAttribute( new Float32Array( pointInstanceColors ), 3 ) );
            var colorParsChunk = [
                'attribute vec3 instanceColor;',
                'varying vec3 vInstanceColor;'
            ].join( '\n' ) + '\n';

            var instanceColorChunk = [
                'vInstanceColor = instanceColor;'
            ].join( '\n' ) + '\n';

            var fragmentParsChunk = [
                'varying vec3 vInstanceColor;'
            ].join( '\n' ) + '\n';

            var colorChunk = [
                'vec4 diffuseColor = vec4( diffuse * vInstanceColor, opacity );'
            ].join( '\n' ) + '\n';

            mesh.material.onBeforeCompile = function ( shader ) {
                shader.vertexShader = shader.vertexShader
                    .replace( '#include <common>\n', '#include <common>\n' + colorParsChunk )
                    .replace( '#include <begin_vertex>\n', '#include <begin_vertex>\n' + instanceColorChunk );

                shader.fragmentShader = shader.fragmentShader
                    .replace( '#include <common>\n', '#include <common>' + fragmentParsChunk )
                    .replace( 'vec4 diffuseColor = vec4( diffuse, opacity );\n', colorChunk )
            };
        }

        const pops = () => {
            for(let i=0; i<locations.length; i++){
                pointsMesh.getMatrixAt( i, instanceMatrix );
                linesMesh.getMatrixAt( i, instanceMatrix2 );

                const scaleValue = {s:0};
                const positionValue = {x:pointOffsets[i*3]/2,y:pointOffsets[i*3+1]/2,z:pointOffsets[i*3+2]/2};
                const pointTransform = new THREE.Object3D();
                const lineTransform = new THREE.Object3D();
                pointTransform.applyMatrix4(instanceMatrix);
                lineTransform.applyMatrix4(instanceMatrix2);


                const tl = gsap.timeline({delay:i*.15});
                tl.to(positionValue, .4, {x:pointOffsets[i*3], y:pointOffsets[i*3+1], z:pointOffsets[i*3+2], ease:'power4.out', //z:1+1/52
                    onUpdate:function(){
                        const value = this.targets()[0];
                        lineTransform.position.set(value.x, value.y, value.z);
                        lineTransform.updateMatrix();
                        linesMesh.setMatrixAt( i, lineTransform.matrix );
                        linesMesh.instanceMatrix.needsUpdate = true;
                    }
                });
                tl.fromTo(scaleValue, 2, {s:0}, {s:1, ease:'elastic.out(1.3, 0.3)',
                    onUpdate:function(){
                        const value = this.targets()[0];
                        pointTransform.scale.set(value.s,value.s,value.s);
                        pointTransform.updateMatrix();
                        pointsMesh.setMatrixAt( i, pointTransform.matrix );
                        pointsMesh.instanceMatrix.needsUpdate = true;
                    }
                },'-=.2');
            }
        }

        const getRotation = (vec) =>{
            var planeVector1 = new THREE.Vector3(0,1,0);
            var matrix1 = new THREE.Matrix4();
            var quaternion = new THREE.Quaternion().setFromUnitVectors(planeVector1, vec);
            var matrix = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);
            return quaternion;
        }	

        const initLocationPointsPosition = (location) => {
            const lat = location.lat;
            const lon = location.lon;

            return calcPosFromLatLonRad(lat, lon, earthRadius);
        }

        const onMouseDown = () => {
            dragging = false;
            document.addEventListener("mouseup", onMouseUp, false);
        }

        const onMouseMove = (e) => {
            e.preventDefault();
            if(!dragging) dragging = true;
            mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
        }

        const onMouseUp = () => {
            if(!dragging){
                if(currentHoveredInstanceId !== null){
                    objectControl.disableAutoRotate();

                    const {targetTheta, targetPhi} = calcThetaPhiFromLatLon(locations[currentHoveredInstanceId].lat, locations[currentHoveredInstanceId].lon);
                    const {theta, phi} = objectControl.getCurrentThetaPhi();
                    const animValue = {theta:theta, phi:phi};
                    let shortTheta;

                    
                    const currentTargetTheta = 
                    theta- targetTheta > 0 ?
                        theta - targetTheta
                    :
                        Math.PI*2 + (theta - targetTheta);

                    const fixedTargetTheta = // 0 -> 6.28 -> 0 -> 6.28
                    theta - targetTheta > 0 ?
                        currentTargetTheta % (Math.PI*2)
                    :
                        currentTargetTheta < 0 ?
                            Math.PI*2 + currentTargetTheta % (Math.PI*2)
                        :
                            currentTargetTheta % (Math.PI*2);

                    // console.log(theta, currentTargetTheta)

                    if(fixedTargetTheta > Math.PI && fixedTargetTheta < Math.PI*2){
                        // console.log('left side')
                        shortTheta = Math.PI*2 + (theta-fixedTargetTheta);
                    }else{
                        // console.log('right side')
                        shortTheta = theta-fixedTargetTheta;
                    }

                    gsap.to(camera.position, 1.3, { y: 0, z: 100, ease: 'power3.out'});
                    gsap.to(animValue, 1.3, { theta:shortTheta, phi:targetPhi, ease: 'power3.out',
                        onUpdate:function(){
                            const value = this.targets()[0];
                            objectControl.setRotate(value.theta, value.phi);
                        }
                    });

                    
                    const meshs = [pointsMesh, linesMesh];
                    resetColor(meshs);
                    toWhiteColor(meshs);

                    pointsBgMaterial.uniforms.activeInstanceId.value = currentHoveredInstanceId;
                }
            }
            document.removeEventListener('mouseup', onMouseUp, false);
        }

        // const scaleUp = (instanceId) => {
        //     pointsMesh.getMatrixAt( instanceId, instanceMatrix );
        //     matrix.multiplyMatrices( instanceMatrix, scaleUpMatrix );
        //     pointsMesh.setMatrixAt( instanceId, matrix );
        //     pointsMesh.instanceMatrix.needsUpdate = true;
        // }

        // const scaleDown = (instanceId) => {
        //     pointsMesh.getMatrixAt( instanceId, instanceMatrix );
        //     matrix.multiplyMatrices( instanceMatrix, scaleDownMatrix );
        //     pointsMesh.setMatrixAt( instanceId, matrix );
        //     pointsMesh.instanceMatrix.needsUpdate = true;
        // }

        const toWhiteColor = (meshs) => {
            const id = currentHoveredInstanceId;
            for(let i=0; i<meshs.length; i++){
                const mesh = meshs[i];
                const attribute = mesh.geometry.attributes.instanceColor;
                const animValue = {r:pointInstanceColors[id*3], g:pointInstanceColors[id*3+1], b:pointInstanceColors[id*3+2]}

                gsap.to(animValue, .3, {r:1, g:1, b:1, ease:'power3.out',
                    onUpdate:function(){
                        const value = this.targets()[0];
                        attribute.setXYZ(id, value.r, value.g, value.b);
                        attribute.needsUpdate = true;
                    }
                });
            }
            oldHoveredInstanceId = id;
        }

        const resetColor = (meshs) => {
            const id = oldHoveredInstanceId;
            if(id !== currentHoveredInstanceId && id !== null){
                for(let i=0; i<meshs.length; i++){
                    const mesh = meshs[i];
                    const attribute = mesh.geometry.attributes.instanceColor;
                    const animValue = {r:1, g:1, b:1}

                    gsap.to(animValue, .3, {r:pointInstanceColors[id*3], g:pointInstanceColors[id*3+1], b:pointInstanceColors[id*3+2], ease:'power3.out',
                        onUpdate:function(){
                            const value = this.targets()[0];
                            attribute.setXYZ(id, value.r, value.g, value.b);
                            attribute.needsUpdate = true;
                        }
                    });
                }
            }
        }
        
        const draw = () => {
            objectControl.draw();

            raycaster.setFromCamera( mouse, camera );
            const intersection = raycaster.intersectObject( pointsMesh );

            if(intersection.length > 0){
                currentHoveredInstanceId = intersection[ 0 ].instanceId;
                if(currentHoveredInstanceId !== prevHoveredInstanceId){
                    document.body.style.cursor = 'pointer';
                    // if(prevHoveredInstanceId !== null){
                        // scaleDown(prevHoveredInstanceId);
                    // }

                    // scaleUp(currentHoveredInstanceId);
                    prevHoveredInstanceId = currentHoveredInstanceId;
                }
            }
            else{
                if(prevHoveredInstanceId !== null){
                    document.body.style.cursor = '';
                    // scaleDown(prevHoveredInstanceId);
                    currentHoveredInstanceId = null;
                    prevHoveredInstanceId = null;
                }
            }
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

        const keyDown = (e) => {
            if(e.keyCode === 13){
                pops();
            }
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
            document.addEventListener("mousedown", onMouseDown, false);
            document.addEventListener("mousemove", onMouseMove, false);
            window.addEventListener("resize", onWindowResize, false);
            window.addEventListener("keydown", keyDown);
        }

        const removeEvent = () => {
            // if(cameraControl) cameraControl.destroy();
            if(dev) dev.destroy();
            document.removeEventListener("mousedown", onMouseDown, false);
            document.removeEventListener('mousemove', onMouseMove, false);
            window.removeEventListener("resize", onWindowResize, false);
            window.removeEventListener("keydown", keyDown);
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