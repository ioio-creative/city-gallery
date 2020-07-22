import React, { useEffect, useRef } from "react"
import dat from 'dat.gui'
import * as PIXI from 'pixi.js'
import gsap from 'gsap'

import diff from './images/hkIsland_diffuse.svg'
import old_diff from './images/hkIsland_old_diffuse.svg'
import mask from './images/hkIsland_mask.svg'
import coastline_mask from './images/hkIsland_coastline_mask.svg'
import sand from './images/sand.png'
import noise from './images/noise.png'
import noise2 from './images/noise2.png'

const Map = props => {
    const wrapElem = useRef(null);

    useEffect(()=>{console.log(diff)
        const gui = new dat.GUI({width: 300});
        let app;
        const maxWidth = 1920 * 2;
        const mapAssets = [
            {
                name: 'hkIsland_diffuse',
                src: diff
            },
            {
                name: 'hkIsland_old_diffuse',
                src: old_diff
            },
            {
                name: 'hkIsland_mask',
                src: mask
            },
            {
                name: 'hkIsland_coastline_mask',
                src: coastline_mask
            },
            {
                name: 'sand',
                src: sand
            },
            {
                name: 'noise',
                src: noise
            },
            {
                name: 'noise2',
                src: noise2
            }
        ];
        const map = {}
        const allMap = new PIXI.Container();
        const zoomedPos = {x:-window.innerWidth*.13, y:-window.innerHeight*.325};

        var options = {
            progress: 0,
            progress2: 0,
            threshold: .001,
            useNoiseTxt: function(){
                map['hkIsland'].image.shader.uniforms.noiseTexture = new PIXI.Sprite.from('noise').texture.baseTexture;
            },
            useSandTxt: function(){
                map['hkIsland'].image.shader.uniforms.noiseTexture = new PIXI.Sprite.from('sand').texture.baseTexture;
            },
        }

        const initEngine = () => {
            app = new PIXI.Application({ 
                width: window.innerWidth,
                height: window.innerHeight,
                antialias: true,
                transparent: true,
                resolution: 1
            })
            wrapElem.current.appendChild(app.view);

            initStage();
            initGUI();
        }

        const initStage = () => {
            app.stage.addChild(allMap);
            // preload all images
            preload()
        }

        const initGUI = () => {
            gui.add(options,'progress',0,1,0.01).name('Island').listen();
            gui.add(options,'progress2',0,1,0.01).name('Coastline').listen();
            gui.add(options,'threshold',0.001,1,0.01).name('threshold').listen();
            gui.add(options,'useNoiseTxt').name('Noise Texture');
            gui.add(options,'useSandTxt').name('Sand Texture');
        }

        class Map {
            constructor(t) {
                this.image = null;
                this.width = t.width;
                this.height = t.height;
                this.texture = t;
            }

            getSize() {
                const w = window.innerWidth * (this.width / maxWidth);
                const ratio = this.height / this.width;
                const h = w * ratio;
// console.log((this.width / maxWidth))
                return { w, h }
            }

            create() {
                const {w, h} = this.getSize();

                const geometry = new PIXI.Geometry();
                geometry.addAttribute('aPosition', [-w/2, -h/2, w/2, -h/2, w/2, h/2, -w/2, h/2], 2);
                geometry.addAttribute('aUvs', [0,0,1,0,1,1,0,1], 2)
                geometry.addIndex([0,1,2,0,2,3])

                this.image = new PIXI.Mesh(geometry, this.createShader());
                this.image.x = window.innerWidth / 1.94;
                this.image.y = window.innerHeight / .935;
                allMap.addChild(this.image);
            }

            createShader() {
                const shader = new PIXI.Shader.from(
                    `
                        precision mediump float;

                        attribute vec2 aPosition;
                        attribute vec2 aUvs;

                        uniform mat3 translationMatrix;
                        uniform mat3 projectionMatrix;

                        varying vec2 vUvs;

                        void main() {
                            vUvs = aUvs;
                            gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
                        }
                    `,
                    `
                        uniform sampler2D diffuse;
                        uniform sampler2D oldDiffuse;
                        uniform sampler2D maskTexture;
                        uniform sampler2D coastlineMaskTexture;
                        uniform sampler2D noiseTexture;
                        uniform sampler2D noise2Texture;
                        uniform float progress;
                        uniform float progress2;
                        uniform float threshold;

                        varying vec2 vUvs;
                        
                        void main(void){
                            vec4 diffuseColor = texture2D(diffuse, vUvs);
                            vec4 oldDiffuseColor = texture2D(oldDiffuse, vUvs);
                            vec4 maskTextureColor = texture2D(maskTexture, vUvs);
                            vec4 coastlineMaskTextureColor = texture2D(coastlineMaskTexture, vUvs);
                            vec4 noiseTextureColor = texture2D(noiseTexture, vUvs);
                            vec4 noise2TextureColor = texture2D(noise2Texture, vUvs);

                            float _threshold = threshold;

                            if(coastlineMaskTextureColor.r >= .1){
                                float value = progress2 * (1. + _threshold);
                                float v = clamp( (noise2TextureColor.r - 1. + value) * (1./_threshold), 0., 1.);
                                gl_FragColor = mix(vec4(0., 0., 0., 0.), vec4(119. / 255., 204. / 255., 189. / 255., 1.), v);
                            }
                            
                            if(maskTextureColor.r >= .1){
                                float value = progress * (1. + _threshold);
                                float v = clamp( (noiseTextureColor.r - 1. + value) * (1./_threshold), 0., 1.);
                                gl_FragColor = mix(diffuseColor, oldDiffuseColor, v);
                            }
                        }
                    `,
                    {
                        progress: options.progress,
                        progress2: options.progress2,
                        threshold: options.threshold,
                        diffuse: this.texture,
                        oldDiffuse: new PIXI.Sprite.from('hkIsland_old_diffuse').texture.baseTexture,
                        maskTexture: new PIXI.Sprite.from('hkIsland_mask').texture.baseTexture,
                        coastlineMaskTexture: new PIXI.Sprite.from('hkIsland_coastline_mask').texture.baseTexture,
                        noiseTexture:new PIXI.Sprite.from('sand').texture.baseTexture,
                        noise2Texture:new PIXI.Sprite.from('noise2').texture.baseTexture
                    }
                );
                return shader;
            }
        }

        const preload = () => {
            const loader = new PIXI.Loader();
            for(let i=0, lth=mapAssets.length; i<lth; i++){
                loader.add(mapAssets[i].name, mapAssets[i].src, { crossOrigin:true });
            }
            loader.load((loader, resources) => {
                // create map
                map['hkIsland'] = new Map(resources['hkIsland_diffuse'].texture);
                map['hkIsland'].create();

            });
        }

        const startAnim = () => {
            app.ticker.add((delta) => {
                if(map['hkIsland']){
                    map['hkIsland'].image.shader.uniforms.progress = options.progress;
                    map['hkIsland'].image.shader.uniforms.progress2 = options.progress2;
                    map['hkIsland'].image.shader.uniforms.threshold = options.threshold;
                }
            })
        }

        const move = (idx = 0) => {
            gsap.to(allMap, 1, {x:zoomedPos.x - (idx * (map['hkIsland'].image.width/(4-1))), y:zoomedPos.y, ease:'power3.inOut'});
        }

        const zoomInOut = (mode) => {
            if(mode === 'l'){
                props.setZoomed(false);
                gsap.to(allMap, 1, {x:0, y:0, ease:'power4.inOut'});
                gsap.to(allMap.scale, 1, {x:1, y:1, ease:'power4.inOut'});
            }
            else{
                props.setZoomed(true);
                props.setIndicatorIdx(0);
                move();
                gsap.to(allMap.scale, 1, {x:1.8, y:1.8, ease:'power3.inOut'});
            }
        }
        props.zoomHandle.current = {zoomInOut};

        const updateIndicatorIdx = (idx, zoomed) => {
            if(zoomed)
                move(idx);
        }
        props.moveHandle.current = {updateIndicatorIdx};

        initEngine();
        startAnim();
    },[])

    return (
        <div ref={wrapElem}></div>
    )
}

export default Map;