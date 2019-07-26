import React, {Component} from 'react';
import {TweenMax, Power0} from 'gsap';
import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';

// import earthTexture from 'media/earth.jpg';
import earthTexture from 'media/earth-8k.jpg';
// import earthTexture from 'media/earth-square.jpg';
import moonTexture from 'media/moon.png';
import cloudTexture from 'media/cloud.jpg';
import backgroundTexture from 'media/space.jpg';
// import earthTexture from 'media/earthgrid.png';

const cameraDistance = 10;
const earthRadius = 4;
// just for fun variables
const earthRealRadius = 6371;
const moonRealRadius = 1737;
const earthMoonRealDistance = 384400;
const moonRadius = earthRadius / earthRealRadius * moonRealRadius;
const moonDistance = earthMoonRealDistance / earthRealRadius * earthRadius;
// -- end --

// https://www.movable-type.co.uk/scripts/latlong-vectors.html
function latLonToVector3(lat, lon, radius = 1) {
  const radLat = (90 - lat) / 180 * Math.PI;
  const radLon = (lon + 180) / 180 * Math.PI;
  const cosLat = Math.cos(radLat);
  const cosLon = Math.cos(radLon);
  const sinLat = Math.sin(radLat);
  const sinLon = Math.sin(radLon);
  return new THREE.Vector3(
    // cosLat * cosLon,
    // cosLat * sinLon,
    // sinLat
    - radius * sinLat * cosLon,
    radius * cosLat,
    radius * sinLat * sinLon
  );
  
}
class GlobeContainer extends Component {
  constructor(props) {
    super(props);
    this.containerEl = null;
    this.setContainerEl = (ref) => this.containerEl = ref;
    // threejs
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.locationPoints = [];

    this.animationFrame = null;
    this.update = this.update.bind(this);
    // this.onDocumentMouseMove = this.onDocumentMouseMove.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onResize = this.onResize.bind(this);
    // this.initScene = this.initScene.bind(this);
    this.mouse = null;
    this.orbitControl = null;
    this.raycaster = null;

    this.autoRotateTimeout = null;
  }
  componentDidMount() {
    this.initScene();
    // document.addEventListener('mousemove', this.onDocumentMouseMove, false );
    document.addEventListener('click', this.onClick, false );
    window.addEventListener('resize', this.onResize, false );

    this.orbitControl.addEventListener('start', _=>{
      clearTimeout(this.autoRotateTimeout);
      this.orbitControl.autoRotate = false;
    });
    
    // restart autorotate after the last interaction & an idle time has passed
    this.orbitControl.addEventListener('end', _=>{
      this.autoRotateTimeout = setTimeout(_=>{
        const oldPos = this.camera.position.clone();
        const newPosition = {
          x: oldPos.x,
          y: 0,
          z: oldPos.z
        };
        TweenMax.to(oldPos, 0.5, {
          ...newPosition,
          onUpdate: _=> {
            const tmpPos = new THREE.Vector3(oldPos.x, oldPos.y, oldPos.z);
            tmpPos.normalize().multiplyScalar(cameraDistance);
            this.camera.position.set(tmpPos.x, tmpPos.y, tmpPos.z);
            this.camera.lookAt(0, 0, 0);
          }
        })
        this.orbitControl.autoRotate = true;
      }, 5000);
    });
    this.autoRotateTimeout = setTimeout(_=>{
      const oldPos = this.camera.position.clone();
      const newPosition = {
        x: oldPos.x,
        y: 0,
        z: oldPos.z
      };
      TweenMax.to(oldPos, 0.5, {
        ...newPosition,
        onUpdate: _=> {
          const tmpPos = new THREE.Vector3(oldPos.x, oldPos.y, oldPos.z);
          tmpPos.normalize().multiplyScalar(cameraDistance);
          this.camera.position.set(tmpPos.x, tmpPos.y, tmpPos.z);
          this.camera.lookAt(0, 0, 0);
        }
      })
      this.orbitControl.autoRotate = true;
    }, 5000);
    this.animationFrame = requestAnimationFrame(this.update);
  }
  initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 50, this.containerEl.offsetWidth / this.containerEl.offsetHeight, 1, 500 );
    const cameraPos = latLonToVector3(0, 0, cameraDistance);
    this.camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateMatrix();
    
    // mouse
    this.mouse = new THREE.Vector2();
    
    // try add a ball with texture
    const loader = new THREE.TextureLoader();
    const group = new THREE.Group();
    loader.load( backgroundTexture, (texture) => {
      texture.repeat = {
        x: 2,
        y: 2
      }
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.needsUpdate = true;
      this.scene.background = texture;
    });
    loader.load( moonTexture, (texture) => {
      const geometry = new THREE.SphereGeometry(moonRadius, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        map: texture,
        // overdraw: 0.5,
        opacity: 0.5
      });
      const sphere = new THREE.Mesh( geometry, material );
      // console.log(sphere);
      // group.rotateY(Math.PI / 2);
      sphere.position.z = moonDistance;
      group.add(sphere);
    });
    loader.load( earthTexture, (texture) => {
      const geometry = new THREE.SphereGeometry(earthRadius, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        map: texture,
        // overdraw: 0.5
      });
      const sphere = new THREE.Mesh( geometry, material );
      // console.log(sphere);
      // group.rotateY(Math.PI / 2);
      group.add(sphere);
      const dotsPos = [
        // latLonToVector3(0, 0, earthRadius), // test
        latLonToVector3(22.330571, 114.172992, earthRadius), // hk
        latLonToVector3(52.520455, 13.397340, earthRadius), // berlin, germany
        latLonToVector3(-37.814637, 144.962559, earthRadius), // melbourne, australia
        latLonToVector3(51.507366, -0.127788, earthRadius), // london, uk
      ]
      const dotsLocation = [
        "hk",
        "berlin, germany",
        "melbourne, australia",
        "london, uk",
      ]
      dotsPos.forEach((dotPos, idx) => {
        const dotGeometry = new THREE.SphereGeometry(earthRadius / 50, 8, 8);
        const dotMaterial = new THREE.MeshBasicMaterial({
          color: (idx === 0? 0xFF0000: 0x0000FF)
        });
        const dot = new THREE.Mesh( dotGeometry, dotMaterial );
        // dot.position = dotPos;
        dot.position.set(dotPos.x, dotPos.y, dotPos.z);
        dot.userData = {
          location: dotsLocation[idx]
        }
        group.add(dot);
        this.locationPoints.push(dot);
      })
      const newPosition = {
        x: this.locationPoints[0].position.x,
        y: this.locationPoints[0].position.y,
        z: this.locationPoints[0].position.z
      };
      const oldPos = new THREE.Vector3(cameraDistance, 0, 0);
      TweenMax.to(oldPos, 1, {
        ...newPosition,
        onUpdate: _=> {
          const tmpPos = new THREE.Vector3(oldPos.x, oldPos.y, oldPos.z);
          tmpPos.normalize().multiplyScalar(cameraDistance);
          this.camera.position.set(tmpPos.x, tmpPos.y, tmpPos.z);
          this.camera.lookAt(0, 0, 0);
        }
      })
    });
    loader.load( cloudTexture, (texture) => {
      const geometry = new THREE.SphereGeometry(earthRadius * 1.01, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        map: texture,
        // overdraw: 0.5,
        opacity: 0.5
      });
      const sphere = new THREE.Mesh( geometry, material );
      // console.log(sphere);
      // group.rotateY(Math.PI / 2);
      group.add(sphere);
      const rotation = {
        angle: 0
      }
      TweenMax.to(rotation, 60, {
        angle: 360,
        ease: Power0.easeNone,
        onUpdate: _=> {
          sphere.rotateY(-0.005 / 180 * Math.PI)
        },
        repeat: -1
      })
    });
    this.scene.add(group);

    // lights
    const lights = [];
    lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
    lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
    lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

    lights[ 0 ].position.set( 0, 200, 0 );
    lights[ 1 ].position.set( 100, 200, 100 );
    lights[ 2 ].position.set( - 100, - 200, - 100 );

    this.scene.add( lights[ 0 ] );
    this.scene.add( lights[ 1 ] );
    this.scene.add( lights[ 2 ] );

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( this.containerEl.offsetWidth, this.containerEl.offsetHeight );
    this.renderer.setClearColor( 0x000000, 1 );
    this.containerEl.appendChild( this.renderer.domElement );

    // add control
    const orbitControl = new OrbitControls( this.camera, this.renderer.domElement );
    orbitControl.enableZoom = false;
    // auto rotate
    // orbitControl.autoRotate = true;
    // dampling
    orbitControl.enableDamping = true;
    orbitControl.dampingFactor = 0.05;
    // to cancel out the super fast rotation after enabled damping
    orbitControl.rotateSpeed = 0.05;
    orbitControl.autoRotateSpeed = 0.05;
    
    /**
     * limit the vertical rotation
     * https://stackoverflow.com/questions/25308943/limit-orbitcontrols-horizontal-rotation/25311658#25311658
     **/ 
    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians
    orbitControl.minPolarAngle = Math.PI / 8;
    orbitControl.maxPolarAngle = Math.PI * 7 / 8;
    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    // orbitControl.minAzimuthAngle = -Math.PI;
    // orbitControl.maxAzimuthAngle = Math.PI; 
    
    // to disable zoom
    orbitControl.enableZoom = false;
    // to disable rotation
    // orbitControl.enableRotate = false;
    // to disable pan
    orbitControl.enablePan = false;

    this.orbitControl = orbitControl;
    // raycaster
    this.raycaster = new THREE.Raycaster(this.camera.position, new THREE.Vector3(0, 0, 0), 0, cameraDistance);
    // this.raycaster.params.Points.threshold = 0.1;
  }
  update() {
    this.animationFrame = requestAnimationFrame(this.update);
    this.orbitControl.update();
    this.renderer.render( this.scene, this.camera );
  }
  componentWillUnmount() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    // document.removeEventListener('mousemove', this.onDocumentMouseMove );
    document.removeEventListener('click', this.onClick );
    window.removeEventListener('resize', this.onResize );
  }
  // onDocumentMouseMove( event ) {
  //   event.preventDefault();
  //   this.mouse.x = ( event.clientX / this.containerEl.offsetWidth ) * 2 - 1;
  //   this.mouse.y = - ( event.clientY / this.containerEl.offsetHeight ) * 2 + 1;
  //   // console.log(this.mouse);
  // }
  onClick(event) {
    this.mouse.x = ( (event.clientX - this.containerEl.offsetLeft) / this.containerEl.offsetWidth ) * 2 - 1;
    this.mouse.y = - ( (event.clientY - this.containerEl.offsetTop) / this.containerEl.offsetHeight ) * 2 + 1;
    this.raycaster.setFromCamera( this.mouse, this.camera );
    const intersections = this.raycaster.intersectObjects( this.locationPoints );
    let intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;
    if (intersection) {
      // intersection.object.material.color = new THREE.Color('#FF0000');
      // this.camera.lookAt(intersection.object.position);
      // console.log(this.camera);
      const dir = new THREE.Vector3(); // create once an reuse it
      // const dir = new THREE.Vector3(
      //   intersection.object.position.x,
      //   intersection.object.position.y,
      //   intersection.object.position.z
      // );
      this.locationPoints.forEach(point => {
        if (point.id === intersection.object.id) {
          // console.log(point);
          point.material.color = new THREE.Color(0xFF0000);
        } else {
          point.material.color = new THREE.Color(0x0000FF);
        }
      })
      dir.subVectors( intersection.object.position, new THREE.Vector3(0, 0, 0) ).normalize();
      const newPos = dir.normalize().multiplyScalar(cameraDistance);
      // console.log(dir, intersection.object.position, newPos);
      const oldPos = this.camera.position.clone();
      TweenMax.to(oldPos, 0.5, {
        ...newPos,
        onUpdate: _=> {
          const tmpPos = new THREE.Vector3(oldPos.x, oldPos.y, oldPos.z);
          tmpPos.normalize().multiplyScalar(cameraDistance);
          this.camera.position.set(tmpPos.x, tmpPos.y, tmpPos.z);
          this.camera.lookAt(0, 0, 0);
        },
        onComplete: _=> {
          // console.log(this.camera.position);
          // maybe show a popup ?
          // try zoom camera
          const zoom = {
            factor: 1
          }
          // console.log(intersection.object);
          intersection.object.material.visible = false;
          // console.log(intersection.object.visible);
          TweenMax.to(zoom, 0.5, {
            factor:  100,
            onUpdate: _=> {
              this.camera.zoom = zoom.factor;
              this.camera.updateProjectionMatrix();
            },
            onComplete: _=> {
              alert(intersection.object.userData.location);
              intersection.object.material.visible = true;
              this.camera.zoom = 1;
              this.camera.updateProjectionMatrix();
            }
          })
        }
      });
    } else {
      this.locationPoints.forEach(point => {
        point.material.color = new THREE.Color(0x0000FF);
        point.material.visible = true;
      })
      const zoom = {
        factor: this.camera.zoom
      }
      TweenMax.to(zoom, 0.5, {
        factor: 1,
        onUpdate: _=> {
          this.camera.zoom = zoom.factor;
          this.camera.updateProjectionMatrix();
        }
      })
    }
  }
  onResize(event) {

    this.camera.aspect = this.containerEl.offsetWidth / this.containerEl.offsetHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.containerEl.offsetWidth, this.containerEl.offsetHeight);
  }
  render() {
    // return <div>Hello</div>;
    
    return <div ref={this.setContainerEl} id="globeContainer" />;
  }
}

export default GlobeContainer;