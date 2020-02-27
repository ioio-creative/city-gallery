import Stats from 'stats.js';
import * as dat from "dat.gui";
import * as THREE from 'three';

let stats = undefined;
let gui = undefined;

export const initStats = () => {
    stats = new Stats();
    stats.showPanel(0);
    stats.domElement.style.position = 'fixed';
    stats.domElement.style.top = 0;
    document.body.appendChild( stats.domElement );
  
    return stats;
}

export const removeStats = () => {
    stats.domElement.remove();
}

export const initGUI = (options) => {
    var arrayOptions = Object.entries(options);
    gui = new dat.GUI({width: 300});
    gui.domElement.parentNode.style.zIndex = 999;

    for(let i=0; i<arrayOptions.length; i++){
        var key = arrayOptions[i][0];
        var name = arrayOptions[i][1].name || key.charAt(0).toUpperCase() + key.slice(1);
        const hasFunc = arrayOptions[i][1].callback;

        if(hasFunc){
            gui.add(options[key], 'callback').name(name);
        }
        else{
            var min = arrayOptions[i][1].min;
            var max = arrayOptions[i][1].max;
            gui.add(options[key], 'value').min(min).max(max).name(name);
        }
    }
}

export const removeGUI = () => {
    if(gui) gui.destroy();
}

export const getScreenSizeIn3dWorld = (camera) => {
    let w,h;
    const vFOV = THREE.Math.degToRad(camera.fov);
    
    // if (vFOV) {
        h = 2 * Math.tan(vFOV / 2) * camera.position.z;
        w = h * camera.aspect;
    // } else {
    //     w = window.innerWidth;
    //     h = window.innerHeight;
    // }
    return { width: w, height: h };
}

export const cameraPositionTo2dPosition = (camera) => {
    var p = new THREE.Vector3(camera.position.x, camera.position.y, 0);
    const vector = new THREE.Vector2();
    const screen = getScreenSizeIn3dWorld(camera);
    vector.x = p.x / screen.width / 2 * window.innerWidth / 2;
    vector.y = p.y / screen.height / 2 * window.innerHeight / 2;

    return vector;
}

// Conver 2d position to 3d position
export const convert2dto3d = (x, y, camera) => {
    var vector = new THREE.Vector3(x, y, 1);
    vector.unproject( camera );
    var dir = vector.sub( camera.position ).normalize();
    var distance = - camera.position.z / dir.z;
    return camera.position.clone().add( dir.multiplyScalar( distance ) );
}

export const CameraControlsSystem = (function(_super){
    function _CameraControlsSystem(camera){
        const _this = _super.call(this) || this;
        const mouse = {
            offset: new THREE.Vector2(),
            prevPos: new THREE.Vector2(),
            startPos: new THREE.Vector2(),
            lastPos: new THREE.Vector2(),
            delta: new THREE.Vector2(),
            wheelDelta: 0,
            lastWheel: 0,
            button: {left:'rotate', right:'pan'},
            status: ''
        };
        _this.camera = camera;
        _this.yAxisUpSpace = new THREE.Quaternion().setFromUnitVectors(_this.camera.up, new THREE.Vector3(0, 1, 0));
        _this.spherical = new THREE.Spherical().setFromVector3(_this.camera.position.clone().applyQuaternion(_this.yAxisUpSpace));
        _this.sphericalEnd = _this.spherical.clone();
        _this.target = new THREE.Vector3();
        _this.targetEnd = _this.target.clone();
        _this.zoomEnd = _this.camera.zoom;
        //
        _this.easeTheta = _this.sphericalEnd.theta;
        _this.easePhi = _this.sphericalEnd.phi;
        _this.easeRadius = _this.sphericalEnd.radius;
        _this.easeTarget = new THREE.Vector3();
        _this.easeZoom = _this.zoomEnd;
        _this.rotationEase = .05;
        _this.translationEase = .05;
        _this.zoomEase = .05;
        _this.friction = .8;
        _this.minDistance = 0
        _this.maxDistance = Infinity;

        let _xColumn = new THREE.Vector3();
        let _yColumn = new THREE.Vector3();
        let _v3A = new THREE.Vector3();
        
        let looping = undefined;
        let clicked = false;

        const init = () => {
            onAnim();
            document.addEventListener('mousedown', onMouseDown, false);
            document.addEventListener('mousewheel', onMouseWheel, false);
            document.addEventListener('contextmenu', onContextMenu, false);
        }


        this.rotate = (theta, phi) => {
            this.rotateTo(_this.sphericalEnd.theta + theta, _this.sphericalEnd.phi + phi);
        }

        this.rotateTo = (theta, phi) => {
            _this.sphericalEnd.theta = theta;
            _this.sphericalEnd.phi = phi;
            _this.sphericalEnd.makeSafe();
            console.log('rotate',theta, phi);
        }


        this.pan = (dx, dy) => {
            const _camera = _this.camera;
            const offset = _v3A.copy(_camera.position).sub(_this.target);
            const fov = _camera.getEffectiveFOV() * THREE.Math.DEG2RAD;
            const targetDistance = offset.length() * Math.tan(fov * 0.5);
            const panSpeed = 2;
            const x = panSpeed * dx * targetDistance / window.innerHeight;
            const y = panSpeed * dy * targetDistance / window.innerHeight;

            this.panTo(x, y);

            console.log('pan',dx, dy);
        }

        this.panTo = (x, y) => {
            _this.camera.updateMatrix();
            _xColumn.setFromMatrixColumn(_this.camera.matrix, 0);
            _yColumn.setFromMatrixColumn(_this.camera.matrix, 1);
            _xColumn.multiplyScalar(-x);
            _yColumn.multiplyScalar(y);

            const offset2 = _v3A.copy(_xColumn).add(_yColumn);
            _this.targetEnd.add(offset2);
            _this.target.copy(_this.targetEnd);
        }


        const dolly = (delta) => {
            const dollyScale = Math.pow(0.95, -delta * 1);
            const distance = _this.sphericalEnd.radius * dollyScale;
            _this.dollyTo(distance);
        }

        this.dollyTo = (distance) => {
            _this.sphericalEnd.radius = THREE.Math.clamp(distance, _this.minDistance, _this.maxDistance);
        }


        this.zoom = (delta) => {
            const zoomScale = Math.pow(0.95, -delta * 1);
            const distance = _this.camera.zoom * zoomScale;
            _this.zoomTo(distance);
        }

        this.zoomTo = (zoom) => {
            _this.zoomEnd = zoom;
        }


        const update = () => {
            _this.easeTheta += (_this.sphericalEnd.theta - _this.easeTheta) * _this.rotationEase * _this.friction;
            _this.easePhi += (_this.sphericalEnd.phi - _this.easePhi) * _this.rotationEase * _this.friction;
            _this.easeRadius += (_this.sphericalEnd.radius - _this.easeRadius) * _this.rotationEase * _this.friction;
            _this.spherical.theta = _this.easeTheta;
            _this.spherical.phi = _this.easePhi;
            _this.spherical.radius = _this.easeRadius;

            _this.easeTarget.x += (_this.targetEnd.x - _this.easeTarget.x) * _this.translationEase * _this.friction;
            _this.easeTarget.y += (_this.targetEnd.y - _this.easeTarget.y) * _this.translationEase * _this.friction;
            _this.easeTarget.z += (_this.targetEnd.z - _this.easeTarget.z) * _this.translationEase * _this.friction;
            _this.target.copy(_this.easeTarget);
            
            _this.easeZoom += (_this.zoomEnd - _this.easeZoom) * _this.zoomEase * _this.friction;

            // convert spherical to vector3
            // then add translation
            _this.camera.position.setFromSpherical(_this.spherical).add(_this.target);
            _this.camera.lookAt(_this.target);
            _this.camera.updateMatrixWorld();
            
            _this.camera.zoom = _this.easeZoom;
            _this.camera.updateProjectionMatrix();
        }

        const onAnim = () => {
            looping = requestAnimationFrame(onAnim);
            update();
        }

        const stopAnim = () => {
            if(looping){
                cancelAnimationFrame(looping);
                looping = undefined;
            }
        }

        const onMouseDown = (e) => {
            e.preventDefault();

            const mx = e.clientX;
            const my = e.clientY;
            mouse.startPos.set(mx, my);
            mouse.lastPos.set(mx, my);
                    
            clicked = true;
            switch( e.button ){
                case 0:
                    mouse.status = mouse.button.left;
                    break;
                    
                case 2:
                    mouse.status = mouse.button.right;
                    break;

                default:
                    break;
            }

            
            document.addEventListener('mousemove', onMouseMove, false);
            document.addEventListener('mouseup', onMouseUp, false);

            // console.log('mousedown')
        }

        const onMouseMove = (e) => {
            if(clicked){
                const mx = e.clientX;
                const my = e.clientY;

                mouse.offset.set(mouse.startPos.x - mx, mouse.startPos.y - my);

                mouse.delta.set(-(mouse.lastPos.x - mx), -(mouse.lastPos.y - my));
                mouse.lastPos.set(mx,my);
                
                switch( mouse.status ){
                    case mouse.button.left:
                        const theta = 1 * (Math.PI * 2) * -mouse.delta.x / window.innerHeight;
                        const phi = 1 * (Math.PI * 2) * -mouse.delta.y / window.innerHeight;
                        _this.rotate(theta, phi);
                        break;
                        
                    case mouse.button.right:
                        _this.pan(mouse.delta.x, mouse.delta.y);
                        break;
        
                    default:
                        break;
                }
            }
        }

        const onMouseUp = () => {
            clicked = false;
            // console.log('mouseup')
            document.removeEventListener('mousemove', onMouseMove, false);
            document.removeEventListener('mouseup', onMouseUp, false);
        }

        const onMouseWheel = (e) => {
            const y = e.deltaY/ (3 * 10);
            dolly(y);
            // _this.zoom(y);
        }

        const onContextMenu = (e) => {
            e.preventDefault();
        }

        this.destroy = () => {
            document.removeEventListener('mousedown', onMouseDown, false);
            document.removeEventListener('mousewheel', onMouseWheel, false);
            document.removeEventListener('contextmenu', onContextMenu, false);
            stopAnim();
        }

        init();
    }

    _CameraControlsSystem.prototype = Object.create( _super.prototype );
    _CameraControlsSystem.prototype.constructor = _CameraControlsSystem; // re-assign constructor
    // _CameraControlsSystem.prototype.panTo = function(){
    //     console.log(this,'pan to');
    // }

    return _CameraControlsSystem;
}(THREE.EventDispatcher));


export const ObjectControl = (function(_super){
    const _ObjectControl = function(mesh){
        const _this = _super.call(this) || this;
        const targetMesh = mesh;
        const mouse = {
            offset: new THREE.Vector2(),
            prevPos: new THREE.Vector2(),
            startPos: new THREE.Vector2(),
            lastPos: new THREE.Vector2(),
            delta: new THREE.Vector2(),
            wheelDelta: 0,
            lastWheel: 0,
            button: {left:'rotate', right:'pan'},
            status: ''
        };
        let clicked = false;
        let thetaEnd = 0;
        let phiEnd = 0;
        let thetaEase = 0;
        let phiEase = 0;
        const friction = .8;
        const sphericalEnd = new THREE.Spherical();
        let auotRotate = 0;
        let disable = false;
        let disableEase = false;
        let numofTheta = 0;
        let numofPhi = 0;

        const init = () => {
            document.addEventListener('mousedown', onMouseDown, false);
            document.addEventListener('contextmenu', onContextMenu, false);
        }

        this.draw = () => {
            if(!clicked && !disable) auotRotate += 0.001;
            if(!disableEase){
                thetaEase += ((sphericalEnd.theta + auotRotate) - thetaEase) * .05 * friction;
                phiEase += ((sphericalEnd.phi) - phiEase) * .05 * friction;
            }
            else{
                thetaEase = sphericalEnd.theta;
                phiEase = sphericalEnd.phi;
            }
            

            targetMesh.rotation.set(phiEase, thetaEase, 0);
        }

        const rotate = (theta, phi) => {
            if(disableEase) disableEase = false;

            sphericalEnd.theta = sphericalEnd.theta + theta;
            sphericalEnd.phi = sphericalEnd.phi + phi;
        }

        this.setRotate = (theta, phi) => {
            if(!disableEase){
                disableEase = true;
                auotRotate = 0;
            }

            sphericalEnd.theta = theta;
            sphericalEnd.phi = phi;
        }

        this.getCurrentThetaPhi = () => {
            return {theta:thetaEase, phi:phiEase};
        }

        const onMouseDown = (e) => {
            e.preventDefault();

            const mx = e.clientX;
            const my = e.clientY;
            mouse.startPos.set(mx, my);
            mouse.lastPos.set(mx, my);
                    
            clicked = true;
            switch( e.button ){
                case 0:
                    mouse.status = mouse.button.left;
                    break;
                    
                // case 2:
                //     mouse.status = mouse.button.right;
                //     break;

                default:
                    break;
            }

            
            document.addEventListener('mousemove', onMouseMove, false);
            document.addEventListener('mouseup', onMouseUp, false);

            // console.log('mousedown')
        }

        const onMouseMove = (e) => {
            if(clicked){
                const mx = e.clientX;
                const my = e.clientY;

                mouse.offset.set(mouse.startPos.x - mx, mouse.startPos.y - my);

                mouse.delta.set(-(mouse.lastPos.x - mx), -(mouse.lastPos.y - my));
                mouse.lastPos.set(mx,my);
                
                switch( mouse.status ){
                    case mouse.button.left:
                        const theta = 1 * (Math.PI * 2) * mouse.delta.x / window.innerHeight;
                        const phi = 1 * (Math.PI * 2) * mouse.delta.y / window.innerHeight;
                        rotate(theta, phi);
                        break;
                        
                    // case mouse.button.right:
                    //     _this.pan(mouse.delta.x, mouse.delta.y);
                    //     break;
        
                    default:
                        break;
                }
            }
        }

        const onMouseUp = () => {
            clicked = false;
            disable = false;
            document.removeEventListener('mousemove', onMouseMove, false);
            document.removeEventListener('mouseup', onMouseUp, false);
        }

        const onContextMenu = (e) => {
            e.preventDefault();
        }

        this.disableAutoRotate = () => {
            disable = true;
        }

        this.destroy = () => {
            document.removeEventListener('mousedown', onMouseDown, false);
            document.removeEventListener('contextmenu', onContextMenu, false);
        }

        init();
    }

    _ObjectControl.prototype = Object.create( _super.prototype );
    _ObjectControl.prototype.constructor = _ObjectControl; // re-assign constructor

    return _ObjectControl;
}(THREE.EventDispatcher))


export const devMode = (scene) => {
    const axesHelper = new THREE.AxesHelper( 50 );
    scene.add( axesHelper );

    const init = () => {
        document.addEventListener('keydown', onKeydown, false);
    }

    const onKeydown = (e) => {
        const key = e.keyCode;
        if(key === 87){
            scene.traverse((child) => {
                if(child.isMesh){
                    child.material.wireframe = !child.material.wireframe;
                }
            });
        }
    }
    
    const destroy = () => {
        document.removeEventListener('keydown', onKeydown, false);
    }

    init();

    return {
        destroy: destroy
    }
}

export const lerp = (p1, p2, t) => {
    return p1 + (p2 - p1) * t
}

export const animEase = {
    // no easing, no acceleration
    linear: (t) => { return t },
    // accelerating from zero velocity
    easeInQuad: (t) => { return t*t },
    // decelerating to zero velocity
    easeOutQuad: (t) => { return t*(2-t) },
    // acceleration until halfway, then deceleration
    easeInOutQuad: (t) => { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
    // accelerating from zero velocity 
    easeInCubic: (t) => { return t*t*t },
    // decelerating to zero velocity 
    easeOutCubic: (t) => { return (--t)*t*t+1 },
    // acceleration until halfway, then deceleration 
    easeInOutCubic: (t) => { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
    // accelerating from zero velocity 
    easeInQuart: (t) => { return t*t*t*t },
    // decelerating to zero velocity 
    easeOutQuart: (t) => { return 1-(--t)*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuart: (t) => { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
    // accelerating from zero velocity
    easeInQuint: (t) => { return t*t*t*t*t },
    // decelerating to zero velocity
    easeOutQuint: (t) => { return 1+(--t)*t*t*t*t },
    // acceleration until halfway, then deceleration 
    easeInOutQuint: (t) => { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
}

export const calcThetaPhiFromLatLon = (lat, lon) => {
    const phi   = (lat)*Math.PI/180;// - 45 * THREE.Math.DEG2RAD;
    const theta = (lon-180)*Math.PI/180 + 90 * THREE.Math.DEG2RAD;

    return {targetTheta:-theta, targetPhi:phi}
}

export const calcPosFromLatLonRad = (lat,lon,radius) => {
    const phi   = (90-lat)*Math.PI/180;
    const theta = (lon)*Math.PI/180;//(lon-180)*Math.PI/180;

    const x = -((radius) * Math.sin(phi)*Math.cos(theta))
    const z = ((radius) * Math.sin(phi)*Math.sin(theta))
    const y = ((radius) * Math.cos(phi))

    return new THREE.Vector3(x,y,z);
}