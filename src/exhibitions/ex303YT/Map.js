import React, { useEffect, useRef } from 'react';
import dat from 'dat.gui';
import * as PIXI from 'pixi.js';
import gsap from 'gsap';

// import diff from './images/hkIsland_diffuse.svg'
// import start_diff from './images/hkIsland_start_diffuse.svg'
// import old_diff from './images/hkIsland_old_diffuse.svg'
// import mask from './images/hkIsland_mask.svg'
// import coastline1900_mask from './images/hkIsland_coastline1900_mask.svg'
// import coastline1945_mask from './images/hkIsland_coastline1945_mask.svg'
// import coastline1985_mask from './images/hkIsland_coastline1985_mask.svg'
// import coastline2019_mask from './images/hkIsland_coastline2019_mask.svg'
// import sand from './images/sand.png'
// import noise from './images/noise.png'
// import noise2 from './images/noise2.png'

const Map = props => {
  const wrapElem = useRef(null);
  const data = props.appData;

  useEffect(() => {
    const gui = new dat.GUI({ width: 300 });
    const mapAssets = data.yt.mapAssets;
    const options = {
      progress: 0,
      year: {
        y1900: 0,
        y1945: 0,
        y1985: 0,
        y2019: 0
      },
      threshold: 0.001,
      useNoiseTxt: function () {
        map['hkIsland'].image.shader.uniforms.noiseTexture = new PIXI.Sprite.from('noise').texture.baseTexture;
      },
      useSandTxt: function () {
        map['hkIsland'].image.shader.uniforms.noiseTexture = new PIXI.Sprite.from('sand').texture.baseTexture;
      }
    };

    let app;
    const maxWidth = 1920 * 2;
    const map = {};
    const streets = [];
    const coastlineParts = [];
    const mapContainer = new PIXI.Container();
    const markerContainer = new PIXI.Container();
    const coastlinePartsContainer = new PIXI.Container();
    const startPos = { x: window.innerWidth / 1.932, y: window.innerHeight / 0.935 };
    const zoomedPos = { x: -window.innerWidth * 0.13, y: -window.innerHeight * 0.325 };
    const years = ['1900', '1945', '1985', '2019'];
    let hasShownCoastline = false;
    let selectedHighlight = null;
    let whiteBG = null;

    const initEngine = () => {
      app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        antialias: true,
        transparent: true,
        resolution: 1
      });
      wrapElem.current.appendChild(app.view);

      initStage();
      initGUI();
    };

    const initStage = () => {
      // preload all images
      preload();
      initWhiteBG();

      app.stage.addChild(mapContainer);
      app.stage.addChild(whiteBG);
      app.stage.addChild(markerContainer);
      app.stage.addChild(coastlinePartsContainer);
    };

    const initGUI = () => {
      gui.add(options, 'progress', 0, 1, 0.01).name('Island').listen();
      gui.add(options.year, 'y1900', 0, 1, 0.01).name('Coastline 1900').listen();
      gui.add(options.year, 'y1945', 0, 1, 0.01).name('Coastline 1945').listen();
      gui.add(options.year, 'y1985', 0, 1, 0.01).name('Coastline 1985').listen();
      gui.add(options.year, 'y2019', 0, 1, 0.01).name('Coastline 2019').listen();
      gui.add(options, 'threshold', 0.001, 1, 0.01).name('threshold').listen();
      gui.add(options, 'useNoiseTxt').name('Noise Texture');
      gui.add(options, 'useSandTxt').name('Sand Texture');
    };

    const initWhiteBG = () => {
      whiteBG = new PIXI.Graphics();
      whiteBG.beginFill(0xffffff);
      whiteBG.alpha = 0;
      whiteBG.drawRect(0, 0, window.innerWidth, window.innerHeight);
      whiteBG.endFill();
    };

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

        return { w, h };
      }

      create() {
        const { w, h } = this.getSize();

        const geometry = new PIXI.Geometry();
        geometry.addAttribute('aPosition', [-w / 2, -h / 2, w / 2, -h / 2, w / 2, h / 2, -w / 2, h / 2], 2);
        geometry.addAttribute('aUvs', [0, 0, 1, 0, 1, 1, 0, 1], 2);
        geometry.addIndex([0, 1, 2, 0, 2, 3]);

        this.image = new PIXI.Mesh(geometry, this.createShader());
        this.image.x = startPos.x;
        this.image.y = startPos.y;
        mapContainer.addChild(this.image);

        // highlight
        this.highlight = [];
        for (let i = 0; i < years.length; i++) {
          const year = years[i];
          this.highlight[i] = new PIXI.Sprite.from(`hkIsland_coastline${year}_highlight`);
          this.highlight[i].anchor.set(0.5);
          this.highlight[i].x = startPos.x;
          this.highlight[i].y = startPos.y;
          this.highlight[i].alpha = 0;
          mapContainer.addChild(this.highlight[i]);
        }
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
                        uniform sampler2D startDiffuse;
                        uniform sampler2D oldDiffuse;
                        uniform sampler2D maskTexture;
                        uniform sampler2D coastline1900Mask;
                        uniform sampler2D coastline1945Mask;
                        uniform sampler2D coastline1985Mask;
                        uniform sampler2D coastline2019Mask;
                        uniform sampler2D noiseTexture;
                        uniform sampler2D noise2Texture;
                        uniform float progress;
                        uniform float progress1900;
                        uniform float progress1945;
                        uniform float progress1985;
                        uniform float progress2019;
                        uniform float threshold;

                        varying vec2 vUvs;
                        
                        void main(void){
                            vec4 diffuseColor = texture2D(diffuse, vUvs);
                            vec4 startDiffuseColor = texture2D(startDiffuse, vUvs);
                            vec4 oldDiffuseColor = texture2D(oldDiffuse, vUvs);
                            vec4 maskTextureColor = texture2D(maskTexture, vUvs);
                            vec4 coastline1900MaskColor = texture2D(coastline1900Mask, vUvs);
                            vec4 coastline1945MaskColor = texture2D(coastline1945Mask, vUvs);
                            vec4 coastline1985MaskColor = texture2D(coastline1985Mask, vUvs);
                            vec4 coastline2019MaskColor = texture2D(coastline2019Mask, vUvs);
                            vec4 noiseTextureColor = texture2D(noiseTexture, vUvs);
                            vec4 noise2TextureColor = texture2D(noise2Texture, vUvs);

                            float _threshold = threshold;
                            vec4 coastlineColor = vec4(0.0);
                            vec4 coastline1900Color = vec4(0.0);
                            vec4 coastline1945Color = vec4(0.0);
                            vec4 coastline1985Color = vec4(0.0);
                            vec4 coastline2019Color = vec4(0.0);


                            if(coastline1900MaskColor.r >= .1){
                                float value = progress1900 * (1. + _threshold);
                                float v = clamp( (noise2TextureColor.r - 1. + value) * (1./_threshold), 0., 1.);
                                coastline1900Color = mix(vec4(0., 0., 0., 0.), vec4(0. / 255., 91. / 255., 87. / 255., 1.), v);
                            }
                            if(coastline1945MaskColor.r >= .1){
                                float value = progress1945 * (1. + _threshold);
                                float v = clamp( (noise2TextureColor.r - 1. + value) * (1./_threshold), 0., 1.);
                                coastline1945Color = mix(vec4(0., 0., 0., 0.), vec4(0. / 255., 122. / 255., 114. / 255., 1.), v);
                            }
                            if(coastline1985MaskColor.r >= .1){
                                float value = progress1985 * (1. + _threshold);
                                float v = clamp( (noise2TextureColor.r - 1. + value) * (1./_threshold), 0., 1.);
                                coastline1985Color = mix(vec4(0., 0., 0., 0.), vec4(28. / 255., 185. / 255., 169. / 255., 1.), v);
                            }
                            if(coastline2019MaskColor.r >= .1){
                                float value = progress2019 * (1. + _threshold);
                                float v = clamp( (noise2TextureColor.r - 1. + value) * (1./_threshold), 0., 1.);
                                coastline2019Color = mix(vec4(0., 0., 0., 0.), vec4(119. / 255., 204. / 255., 189. / 255., 1.), v);
                            }
                            
                            gl_FragColor = mix(coastline2019Color, coastline1985Color, coastline1985Color.a);
                            gl_FragColor = mix(gl_FragColor, coastline1945Color, coastline1945Color.a);
                            gl_FragColor = mix(gl_FragColor, coastline1900Color, coastline1900Color.a);
                            
                            if(maskTextureColor.r >= .1){
                                float value = progress * (1. + _threshold);
                                float v = clamp( (noiseTextureColor.r - 1. + value) * (1./_threshold), 0., 1.);
                                gl_FragColor = mix(startDiffuseColor, diffuseColor, v);
                            }
                        }
                    `,
          {
            progress: options.progress,
            progress1900: options.year.y1900,
            progress1945: options.year.y1945,
            progress1985: options.year.y1985,
            progress2019: options.year.y2019,
            threshold: options.threshold,
            diffuse: this.texture,
            startDiffuse: new PIXI.Sprite.from('hkIsland_start_diffuse').texture.baseTexture,
            oldDiffuse: new PIXI.Sprite.from('hkIsland_old_diffuse').texture.baseTexture,
            maskTexture: new PIXI.Sprite.from('hkIsland_mask').texture.baseTexture,
            coastline1900Mask: new PIXI.Sprite.from('hkIsland_coastline1900_mask').texture.baseTexture,
            coastline1945Mask: new PIXI.Sprite.from('hkIsland_coastline1945_mask').texture.baseTexture,
            coastline1985Mask: new PIXI.Sprite.from('hkIsland_coastline1985_mask').texture.baseTexture,
            coastline2019Mask: new PIXI.Sprite.from('hkIsland_coastline2019_mask').texture.baseTexture,
            noiseTexture: new PIXI.Sprite.from('sand').texture.baseTexture,
            noise2Texture: new PIXI.Sprite.from('noise2').texture.baseTexture
          }
        );
        return shader;
      }
    }

    class Marker {
      constructor(street) {
        this.id = street.id;
        this.x = street.marker.x;
        this.y = street.marker.y;
        this.data = street;
      }

      create() {
        this.sprite = new PIXI.Sprite.from('marker');
        this.sprite.anchor.set(0.5, 1);
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.alpha = 0;
        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        this.sprite.on('pointerdown', () => this.onClick());

        markerContainer.addChild(this.sprite);
      }

      remove() {
        this.sprite.parent.removeChild(this.sprite);
        this.sprite = null;
        this.x = null;
        this.y = null;
      }

      onClick() {
        props.setStreetData(this.data);
      }
    }

    const showMarkers = (idx = 0) => {
      for (let s = 0; s < streets.length; s++) {
        for (let i = 0; i < streets[s].length; i++) {
          if (s === idx) {
            streets[s][i].sprite.alpha = 1;
          } else {
            streets[s][i].sprite.alpha = 0;
          }
        }
      }
    };

    const hideMarkers = () => {
      for (let s = 0; s < streets.length; s++) {
        for (let i = 0; i < streets[s].length; i++) {
          streets[s][i].sprite.alpha = 0;
        }
      }
    };
    ///////////////////

    class CoastlineParts {
      constructor(pos, name) {
        this.x = pos.x;
        this.y = pos.y;
        this.name = name;
      }

      create() {
        const path = [0, 0, 90, 0, 220, 40, 245, 80, 240, 155, 190, 145, 0, 25];

        this.sprite = new PIXI.Sprite.from(this.name);
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.scale.set(1.08);
        this.sprite.alpha = 0;
        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        this.sprite.hitArea = new PIXI.Polygon(path);
        this.sprite.on('pointerdown', () => this.onClick());

        //
        this.clickArea = new PIXI.Graphics();
        this.clickArea.beginFill(0x3500fa, 0);
        this.clickArea.drawPolygon(path);
        this.clickArea.endFill();
        this.sprite.addChild(this.clickArea);

        coastlinePartsContainer.addChild(this.sprite);
      }

      showHitArea() {
        this.clickArea.alpha = 1;
      }

      onClick() {
        this.sprite.alpha = 1;
        // props.setStreetData(this.data);
      }
    }

    const preload = () => {
      const loader = new PIXI.Loader();
      for (let i = 0, lth = mapAssets.length; i < lth; i++) {
        loader.add(mapAssets[i].name, mapAssets[i].src, { crossOrigin: true });
      }
      loader.load((loader, resources) => {
        // create map
        map['hkIsland'] = new Map(resources['hkIsland_diffuse'].texture);
        map['hkIsland'].create();

        for (let s = 0, lth = data.yt.streets.length; s < lth; s++) {
          streets[s] = [];
          for (let i = 0; i < data.yt.streets[s].length; i++) {
            const street = data.yt.streets[s][i];
            streets[s][i] = new Marker(street);
            streets[s][i].create();
          }
        }

        for (let i = 0, lth = data.yt.coastlineParts.length; i < lth; i++) {
          const parts = data.yt.coastlineParts[i];
          coastlineParts[i] = new CoastlineParts(parts.pos, parts.image.name);
          coastlineParts[i].create();
        }
      });
    };

    const startAnim = () => {
      app.ticker.add(delta => {
        if (map['hkIsland']) {
          map['hkIsland'].image.shader.uniforms.progress = options.progress;
          map['hkIsland'].image.shader.uniforms.progress1900 = options.year.y1900;
          map['hkIsland'].image.shader.uniforms.progress1945 = options.year.y1945;
          map['hkIsland'].image.shader.uniforms.progress1985 = options.year.y1985;
          map['hkIsland'].image.shader.uniforms.progress2019 = options.year.y2019;
          map['hkIsland'].image.shader.uniforms.threshold = options.threshold;
        }
      });
    };

    const moveMap = (idx = 0) => {
      gsap.to([mapContainer, markerContainer, coastlinePartsContainer], 1, {
        x: zoomedPos.x - idx * (map['hkIsland'].image.width / (4 - 1)),
        y: zoomedPos.y,
        ease: 'power3.inOut'
      });
      // gsap.to('#markerOuterWrap', 1, {x:zoomedPos.x - (idx * (map['hkIsland'].image.width/(4-1))), y:zoomedPos.y, ease:'power3.inOut'});
    };

    const zoomInOut = mode => {
      if (mode === 'l') {
        props.setZoomed(false);
        hideMarkers();
        gsap.to(whiteBG, 0.6, { alpha: 0, ease: 'power1.inOut' });
        gsap.to([mapContainer, markerContainer, coastlinePartsContainer], 1, { x: 0, y: 0, ease: 'power4.inOut' });
        gsap.to([mapContainer.scale, markerContainer.scale, coastlinePartsContainer.scale], 1, {
          x: 1,
          y: 1,
          ease: 'power4.inOut'
        });
        // gsap.to('#markerOuterWrap', 1.05, {force3D:true, x:0, y:0, scale:1, ease:'power4.inOut'});
      } else {
        props.setZoomed(true);
        props.setMapIndicatorIdx(0);
        moveMap();
        showMarkers();
        gsap.to(whiteBG, 0.6, { alpha: 0.5, ease: 'power1.inOut' });
        gsap.to([mapContainer.scale, markerContainer.scale, coastlinePartsContainer.scale], 1, {
          x: 1.8,
          y: 1.8,
          ease: 'power3.inOut'
        });
        // gsap.to('#markerOuterWrap', 1.01, {force3D:true, scale:1.8, ease:'power3.inOut'});
      }
    };
    props.handleZoom.current = { zoomInOut };

    const updateMapIndicatorIdx = (idx, zoomed) => {
      if (zoomed) {
        moveMap(idx);
        showMarkers(idx);
      }
    };
    props.handleMove.current = { updateMapIndicatorIdx };

    const selectCoastline = idx => {
      const highlights = map['hkIsland'].highlight;
      selectedHighlight = map['hkIsland'].highlight[idx];
      for (let i = 0; i < highlights.length; i++) {
        if (i !== idx) {
          const highlight = highlights[i];
          gsap.to(highlight, 0.3, { alpha: 0, ease: 'power1.inOut' });
        }
      }
      gsap.to(selectedHighlight, 0.3, { alpha: 1, ease: 'power1.inOut' });
    };
    props.handleSelectCoastline.current = { selectCoastline };

    const showCoastline = idx => {
      for (let i = 0; i < years.length; i++) {
        const v = { p: options.year[`y${years[i]}`] };
        if (i <= idx) {
          gsap.to(v, 4, {
            p: 1,
            delay: !hasShownCoastline ? 0 : 0.8,
            ease: 'power2.out',
            onUpdate: function () {
              options.year[`y${years[i]}`] = this._targets[0].p;
            }
          });

          if (!hasShownCoastline) hasShownCoastline = true;
        }
        // else{
        //     gsap.to(v, 2, {p:0, ease:'power4.out',
        //         onUpdate:function(){
        //             options.year[`y${years[i]}`] = this._targets[0].p
        //         }
        //     });
        // }
      }
    };
    props.handleShowCoastline.current = { showCoastline };

    const start = () => {
      gsap.to(options, 4, { progress: 1, ease: 'power2.inOut' });
      gsap.to(selectedHighlight, 1, { alpha: 0, ease: 'power1.inOut' });
    };
    props.handleStart.current = { start };

    initEngine();
    startAnim();
  }, []);

  return <div ref={wrapElem}></div>;
};

export default Map;
