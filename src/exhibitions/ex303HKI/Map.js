import React, { useEffect, useRef, useState } from 'react';
// import dat from 'dat.gui';
import * as PIXI from 'pixi.js';
import gsap from 'gsap';

const Map = props => {
  const [on, setOn] = useState(true);
  const wrapElem = useRef(null);
  const videoElem = useRef(null);
  const data = props.appData;

  const showHighlightFunc = useRef(null);

  useEffect(() => {
    // const gui = new dat.GUI({ width: 300 });
    const mapAssets = data[props.locationName].mapAssets;
    const options = {
      islandProgress: 0,
      oceanProgress: 0,
      year: {
        y1900: 0,
        y1945: 0,
        y1985: 0,
        y2019: 0,
        hideY1900:0,
        hideY1945:0,
        hideY1985:0,
        hideY2019:0
      },
      threshold: 0.001,
      useNoiseTxt: function () {
        map[props.locationName].image.shader.uniforms.noiseTexture = new PIXI.Sprite.from('noise').texture.baseTexture;
      },
      useSandTxt: function () {
        map[props.locationName].image.shader.uniforms.noiseTexture = new PIXI.Sprite.from('sand').texture.baseTexture;
      }
    };

    let app;
    const maxWidth = props.doubleScreen ? 1920 * 2 * 2 : 1920 * 2;
    const maxHeight = window.innerHeight * 2;
    const map = {};
    // const streets = [];
    // const coastlineParts = [];
    const mapContainer = new PIXI.Container();
    const markerContainer = new PIXI.Container();
    // const coastlinePartsContainer = new PIXI.Container();
    // const startPos = { x: window.innerWidth / 1.932, y: window.innerHeight / 0.935 };
    const startPos = { x: maxWidth / 2, y: maxHeight / 2 };
    // const zoomedPos = {
    //   x: -window.innerWidth * 0.13,
    //   // y: -window.innerHeight * 0.325
    //   y: -window.innerHeight * 0.4
    // };
    const years = ['1900', '1945', '1985', '2019'];
    let hasShownCoastline = false;
    let selectedHighlight = null;
    let highlightTl = null;
    let showCoastlineTl = null;
    let whiteBG = null;
    let selectedCoastlineIdx = 0;

    const initEngine = () => {
      app = new PIXI.Application({
        width: maxWidth,//window.innerWidth,
        height: maxHeight,//window.innerHeight,
        // antialias: true,
        transparent: true,
        resolution: 1,
        powerPreference:'low-power'
      });
      wrapElem.current.appendChild(app.view);

      initStage();
      // initGUI();
    };

    const initStage = () => {
      // preload all images
      preload();
      initWhiteBG();

      app.stage.addChild(mapContainer);
      app.stage.addChild(whiteBG);
      app.stage.addChild(markerContainer);
      // app.stage.addChild(coastlinePartsContainer);
    };

    // const initGUI = () => {
    //   gui.add(options, 'islandProgress', 0, 1, 0.01).name('Island').listen();
    //   gui.add(options, 'oceanProgress', 0, 1, 0.01).name('Ocean').listen();
    //   gui.add(options.year, 'y1900', 0, 1, 0.01).name('Coastline 1900').listen();
    //   gui.add(options.year, 'y1945', 0, 1, 0.01).name('Coastline 1945').listen();
    //   gui.add(options.year, 'y1985', 0, 1, 0.01).name('Coastline 1985').listen();
    //   gui.add(options.year, 'y2019', 0, 1, 0.01).name('Coastline 2019').listen();
    //   gui.add(options.year, 'hideY1900', 0, 1, 0.01).name('Coastline Hide 1900').listen();
    //   gui.add(options.year, 'hideY1945', 0, 1, 0.01).name('Coastline Hide 1945').listen();
    //   gui.add(options.year, 'hideY1985', 0, 1, 0.01).name('Coastline Hide 1985').listen();
    //   gui.add(options.year, 'hideY2019', 0, 1, 0.01).name('Coastline Hide 2019').listen();
    //   gui.add(options, 'threshold', 0.001, 1, 0.01).name('threshold').listen();
    //   gui.add(options, 'useNoiseTxt').name('Noise Texture');
    //   gui.add(options, 'useSandTxt').name('Sand Texture');
    // };

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
        const w = window.innerWidth * 2 * (this.width / maxWidth);
        const ratio = this.height / this.width;
        const h = w * ratio;
        // console.log('ori w:', this.width, 'ori h:', this.height, 'ori w:', w, 'ori h:', h);
        return { w, h };
      }

      create() {
        const { w, h } = this.getSize();

        const geometry = new PIXI.Geometry();
        geometry.addAttribute('aPosition', [-w / 2, -h / 2, w / 2, -h / 2, w / 2, h / 2, -w / 2, h / 2], 2);
        // geometry.addAttribute('aPosition', [-w/2, -h/2, w/2, -h/2, w/2, h/2, -w/2, h/2], 2);
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
          this.highlight[i] = new PIXI.Sprite.from(`${props.locationName}_coastline${year}_highlight`);
          this.highlight[i].anchor.set(0.5);
          this.highlight[i].x = startPos.x;
          this.highlight[i].y = startPos.y;
          this.highlight[i].alpha = 0;
          mapContainer.addChild(this.highlight[i]);

        }

        this.dottedline = new PIXI.Sprite.from(`${props.locationName}_coastline2019_dottedline`);
        this.dottedline.anchor.set(0.5);
        this.dottedline.x = startPos.x;
        this.dottedline.y = startPos.y;
        this.dottedline.alpha = 0;
        mapContainer.addChild(this.dottedline);

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
              uniform sampler2D islandDiffuse;
              uniform sampler2D oceanDiffuse;
              uniform sampler2D startIslandDiffuse;
              uniform sampler2D startOceanDiffuse;
              uniform sampler2D islandMaskTexture;
              //uniform sampler2D oceanMaskTexture;
              uniform sampler2D coastline1900Diffuse;
              uniform sampler2D coastline1945Diffuse;
              uniform sampler2D coastline1985Diffuse;
              uniform sampler2D coastline2019Diffuse;
              uniform sampler2D coastline1900Mask;
              uniform sampler2D coastline1945Mask;
              uniform sampler2D coastline1985Mask;
              uniform sampler2D coastline2019Mask;
              uniform sampler2D sandTexture;
              uniform sampler2D noiseTexture;
              uniform float islandProgress;
              uniform float oceanProgress;
              uniform float progress1900;
              uniform float progress1945;
              uniform float progress1985;
              uniform float progress2019;
              uniform float progressHide1900;
              uniform float progressHide1945;
              uniform float progressHide1985;
              uniform float progressHide2019;
              uniform float threshold;
              uniform float selectedCoastlineIdx;
              uniform float highlightOpacity;

              varying vec2 vUvs;
              
              void main(void){
                vec4 islandDiffuseColor = texture2D(islandDiffuse, vUvs);
                vec4 oceanDiffuseColor = texture2D(oceanDiffuse, vUvs);
                vec4 startIslandDiffuseColor = texture2D(startIslandDiffuse, vUvs);
                vec4 startOceanDiffuseColor = texture2D(startOceanDiffuse, vUvs);
                vec4 islandMaskTextureColor = texture2D(islandMaskTexture, vUvs);
                //vec4 oceanMaskTextureColor = texture2D(oceanMaskTexture, vUvs);
                vec4 coastline1900DiffuseColor = texture2D(coastline1900Diffuse, vUvs);
                vec4 coastline1945DiffuseColor = texture2D(coastline1945Diffuse, vUvs);
                vec4 coastline1985DiffuseColor = texture2D(coastline1985Diffuse, vUvs);
                vec4 coastline2019DiffuseColor = texture2D(coastline2019Diffuse, vUvs);
                vec4 coastline1900MaskColor = texture2D(coastline1900Mask, vUvs);
                vec4 coastline1945MaskColor = texture2D(coastline1945Mask, vUvs);
                vec4 coastline1985MaskColor = texture2D(coastline1985Mask, vUvs);
                vec4 coastline2019MaskColor = texture2D(coastline2019Mask, vUvs);
                vec4 sandTextureColor = texture2D(sandTexture, vUvs);
                vec4 noiseTextureColor = texture2D(noiseTexture, vUvs);

                float _threshold = threshold;
                vec4 coastlineColor = vec4(0.0);
                vec4 coastline1900Color = vec4(0.0);
                vec4 coastline1945Color = vec4(0.0);
                vec4 coastline1985Color = vec4(0.0);
                vec4 coastline2019Color = vec4(0.0);

                
                // ocean
                //if(oceanMaskTextureColor.a >= .01){
                  float value = oceanProgress * (1. + _threshold);
                  float v = clamp( (sandTextureColor.r - 1. + value) * (1./_threshold), 0., 1.);
                  gl_FragColor = mix(startOceanDiffuseColor, oceanDiffuseColor, value);
                //}

                if(coastline1900MaskColor.a >= 0.6){
                    float value = progress1900 * (1. + _threshold);
                    float v = clamp( (noiseTextureColor.r - 1. + value) * (1./_threshold), 0., 1.);

                    float value2 = progressHide1900 * (1. + _threshold);
                    float v2 = clamp( (noiseTextureColor.r - 1. + value2) * (1./_threshold), 0., 1.);
                    coastline1900Color = mix(vec4(0., 0., 0., 0.), vec4(70. / 255., 70. / 255., 70. / 255., .8), 1.-v);
                    coastline1900Color = mix(coastline1900Color, vec4(7. / 255., 74. / 255., 69. / 255., highlightOpacity), v);
                    coastline1900Color = vec4(mix(coastline1900DiffuseColor.rgb, coastline1900Color.rgb, coastline1900Color.a), 1.);
                    // hide effect
                    coastline1900Color = mix(vec4(0., 0., 0., 0.), coastline1900Color, v2);
                }
                if(coastline1945MaskColor.a >= 0.6){
                    float value = progress1945 * (1. + _threshold);
                    float v = clamp( (noiseTextureColor.r - 1. + value) * (1./_threshold), 0., 1.);

                    float value2 = progressHide1945 * (1. + _threshold);
                    float v2 = clamp( (noiseTextureColor.r - 1. + value2) * (1./_threshold), 0., 1.);
                    coastline1945Color = mix(vec4(0., 0., 0., 0.), vec4(70. / 255., 70. / 255., 70. / 255., .8), 1.-v);
                    coastline1945Color = mix(coastline1945Color, vec4(0. / 255., 122. / 255., 111. / 255., highlightOpacity), v);
                    coastline1945Color = vec4(mix(coastline1945DiffuseColor.rgb, coastline1945Color.rgb, coastline1945Color.a), 1.);
                    // hide effect
                    coastline1945Color = mix(vec4(0., 0., 0., 0.), coastline1945Color, v2);
                }
                if(coastline1985MaskColor.a >= 0.6){
                    float value = progress1985 * (1. + _threshold);
                    float v = clamp( (noiseTextureColor.r - 1. + value) * (1./_threshold), 0., 1.);
                    
                    float value2 = progressHide1985 * (1. + _threshold);
                    float v2 = clamp( (noiseTextureColor.r - 1. + value2) * (1./_threshold), 0., 1.);
                    coastline1985Color = mix(vec4(0., 0., 0., 0.), vec4(70. / 255., 70. / 255., 70. / 255., .8), 1.-v);
                    coastline1985Color = mix(coastline1985Color, vec4(40. / 255., 176. / 255., 155. / 255., highlightOpacity), v);
                    coastline1985Color = vec4(mix(coastline1985DiffuseColor.rgb, coastline1985Color.rgb, coastline1985Color.a), 1.);
                    // hide effect
                    coastline1985Color = mix(vec4(0., 0., 0., 0.), coastline1985Color, v2); 
                }
                if(coastline2019MaskColor.a >= 0.6){
                    float value = progress2019 * (1. + _threshold);
                    float v = clamp( (noiseTextureColor.r - 1. + value) * (1./_threshold), 0., 1.);

                    float value2 = progressHide2019 * (1. + _threshold);
                    float v2 = clamp( (noiseTextureColor.r - 1. + value2) * (1./_threshold), 0., 1.);
                    coastline2019Color = mix(vec4(0., 0., 0., 0.), vec4(70. / 255., 70. / 255., 70. / 255., .8), 1.-v);
                    coastline2019Color = mix(coastline2019Color, vec4(112. / 255., 204. / 255., 184. / 255., highlightOpacity), v);
                    coastline2019Color = vec4(mix(coastline2019DiffuseColor.rgb, coastline2019Color.rgb, coastline2019Color.a), 1.);
                    // hide effect
                    coastline2019Color = mix(vec4(0., 0., 0., 0.), coastline2019Color, v2);
                }

                gl_FragColor = mix(gl_FragColor, coastline2019Color, coastline2019Color.a);
                gl_FragColor = mix(gl_FragColor, coastline1985Color, coastline1985Color.a);
                gl_FragColor = mix(gl_FragColor, coastline1945Color, coastline1945Color.a);
                gl_FragColor = mix(gl_FragColor, coastline1900Color, coastline1900Color.a);
                
                // island
                if(islandMaskTextureColor.a >= 0.6){
                  float value = islandProgress * (1. + _threshold);
                  float v = clamp( (sandTextureColor.r - 1. + value) * (1./_threshold), 0., 1.);
                  gl_FragColor = mix(startIslandDiffuseColor, islandDiffuseColor, v);
                }
              }
            `,
          {
            islandProgress: options.islandProgress,
            oceanProgress: options.oceanProgress,
            progress1900: options.year.y1900,
            progress1945: options.year.y1945,
            progress1985: options.year.y1985,
            progress2019: options.year.y2019,
            progressHide1900: options.year.hideY1900,
            progressHide1945: options.year.hideY1945,
            progressHide1985: options.year.hideY1985,
            progressHide2019: options.year.hideY2019,
            selectedCoastlineIdx: selectedCoastlineIdx,
            threshold: options.threshold,
            islandDiffuse: this.texture, //map with all shader
            oceanDiffuse: new PIXI.Sprite.from(`${props.locationName}_1900_diffuse`).texture.baseTexture,
            startIslandDiffuse: new PIXI.Sprite.from(`${props.locationName}_start_diffuse`).texture.baseTexture,
            startOceanDiffuse: new PIXI.Sprite.from(`${props.locationName}_start_ocean_diffuse`).texture.baseTexture,
            // oldDiffuse: new PIXI.Sprite.from('hkIsland_old_diffuse').texture.baseTexture,
            islandMaskTexture: new PIXI.Sprite.from(`${props.locationName}_2019_mask`).texture.baseTexture,
            //oceanMaskTexture: new PIXI.Sprite.from('hkIsland_ocean2019_mask').texture.baseTexture,
            coastline1900Diffuse: null,//new PIXI.Sprite.from('hkIsland_coastline1900of2019_diffuse').texture.baseTexture,
            coastline1945Diffuse: null,//new PIXI.Sprite.from('hkIsland_coastline1945of2019_diffuse').texture.baseTexture,
            coastline1985Diffuse: null,//new PIXI.Sprite.from('hkIsland_coastline1985of2019_diffuse').texture.baseTexture,
            coastline2019Diffuse: null,//new PIXI.Sprite.from('hkIsland_coastline2019of2019_diffuse').texture.baseTexture,
            coastline1900Mask: null,//new PIXI.Sprite.from('hkIsland_coastline1900of2019_mask').texture.baseTexture,
            coastline1945Mask: null,//new PIXI.Sprite.from('hkIsland_coastline1945of2019_mask').texture.baseTexture,
            coastline1985Mask: null,//new PIXI.Sprite.from('hkIsland_coastline1985of2019_mask').texture.baseTexture,
            coastline2019Mask: null,//new PIXI.Sprite.from('hkIsland_coastline2019of2019_mask').texture.baseTexture,
            highlightOpacity: .8,
            sandTexture: new PIXI.Sprite.from('sand').texture.baseTexture,
            noiseTexture: new PIXI.Sprite.from('noise').texture.baseTexture
          }
        );
        // console.log(new PIXI.Sprite.from('hkIsland_coastline1900_mask').texture.baseTexture);
        // console.log(new PIXI.Sprite.from('hkIsland_coastline1945_mask').texture.baseTexture);
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

    // const showMarkers = (idx = 0) => {
    //   for (let s = 0; s < streets.length; s++) {
    //     for (let i = 0; i < streets[s].length; i++) {
    //       if (s === idx) {
    //         streets[s][i].sprite.alpha = 1;
    //       } else {
    //         streets[s][i].sprite.alpha = 0;
    //       }
    //     }
    //   }
    // };

    // const hideMarkers = () => {
    //   for (let s = 0; s < streets.length; s++) {
    //     for (let i = 0; i < streets[s].length; i++) {
    //       streets[s][i].sprite.alpha = 0;
    //     }
    //   }
    // };
    ///////////////////

    // class CoastlineParts {
    //   constructor(pos, name) {
    //     this.x = pos.x;
    //     this.y = pos.y;
    //     this.name = name;
    //   }

    //   create() {
    //     const path = [0, 0, 90, 0, 220, 40, 245, 80, 240, 155, 190, 145, 0, 25];

    //     this.sprite = new PIXI.Sprite.from(this.name);
    //     this.sprite.x = this.x;
    //     this.sprite.y = this.y;
    //     this.sprite.scale.set(1.08);
    //     this.sprite.alpha = 0;
    //     this.sprite.interactive = true;
    //     this.sprite.buttonMode = true;
    //     this.sprite.hitArea = new PIXI.Polygon(path);
    //     this.sprite.on('pointerdown', () => this.onClick());

    //     //
    //     this.clickArea = new PIXI.Graphics();
    //     this.clickArea.beginFill(0x3500fa, 0);
    //     this.clickArea.drawPolygon(path);
    //     this.clickArea.endFill();
    //     this.sprite.addChild(this.clickArea);

    //     coastlinePartsContainer.addChild(this.sprite);
    //   }

    //   showHitArea() {
    //     this.clickArea.alpha = 1;
    //   }

    //   onClick() {
    //     this.sprite.alpha = 1;
    //     // props.setStreetData(this.data);
    //   }
    // }

    const preload = () => {
      const loader = new PIXI.Loader();
      for (let i = 0, lth = mapAssets.length; i < lth; i++) {
        loader.add(mapAssets[i].name, mapAssets[i].src, { crossOrigin: true });
      }
      loader.load((loader, resources) => {
        // create map
        map[props.locationName] = new Map(resources[`${props.locationName}_2019_diffuse`].texture);
        map[props.locationName].create();
        selectedHighlight = map[props.locationName].highlight[0];
        // console.log(map[props.locationName])

        // for (let s = 0, lth = data.hki.streets.length; s < lth; s++) {
        //   streets[s] = [];
        //   for (let i = 0; i < data.hki.streets[s].length; i++) {
        //     const street = data.hki.streets[s][i];
        //     streets[s][i] = new Marker(street);
        //     streets[s][i].create();
        //   }
        // }

        // for (let i = 0, lth = data.hki.coastlineParts.length; i < lth; i++) {
        //   const parts = data.hki.coastlineParts[i];
        //   coastlineParts[i] = new CoastlineParts(parts.pos, parts.image.name);
        //   coastlineParts[i].create();
        // }
      });
    };

    const updateMapImage = () => {
      map[props.locationName].dottedline.texture = new PIXI.Sprite.from(`${props.locationName}_coastline${years[selectedCoastlineIdx]}_dottedline`).texture;
      map[props.locationName].image.shader.uniforms.islandDiffuse = new PIXI.Sprite.from(`${props.locationName}_${years[selectedCoastlineIdx]}_diffuse`).texture.baseTexture;
      map[props.locationName].image.shader.uniforms.islandMaskTexture = new PIXI.Sprite.from(`${props.locationName}_${years[selectedCoastlineIdx]}_mask`).texture.baseTexture;
      map[props.locationName].image.shader.uniforms.oceanDiffuse = new PIXI.Sprite.from(`${props.locationName}_${years[selectedCoastlineIdx]}_diffuse`).texture.baseTexture;
      // map[props.locationName].image.shader.uniforms.oceanMaskTexture = new PIXI.Sprite.from(`${props.locationName}_ocean${years[selectedCoastlineIdx]}_mask`).texture.baseTexture;

      if(selectedCoastlineIdx === 0 || selectedCoastlineIdx === 1 || selectedCoastlineIdx === 2 || selectedCoastlineIdx === 3){
        // map[props.locationName].image.shader.uniforms.coastline2019Diffuse = null;
        // map[props.locationName].image.shader.uniforms.coastline2019Mask = null;
        // map[props.locationName].image.shader.uniforms.coastline1985Diffuse = null;
        // map[props.locationName].image.shader.uniforms.coastline1985Mask = null;
        // map[props.locationName].image.shader.uniforms.coastline1945Diffuse = null;
        // map[props.locationName].image.shader.uniforms.coastline1945Mask = null;
        map[props.locationName].image.shader.uniforms.coastline1900Diffuse = new PIXI.Sprite.from(`${props.locationName}_coastline1900of${years[selectedCoastlineIdx]}_diffuse`).texture.baseTexture;
        map[props.locationName].image.shader.uniforms.coastline1900Mask = new PIXI.Sprite.from(`${props.locationName}_coastline1900of${years[selectedCoastlineIdx]}_mask`).texture.baseTexture;
      }
      if(selectedCoastlineIdx === 1 || selectedCoastlineIdx === 2 || selectedCoastlineIdx === 3){
        // map[props.locationName].image.shader.uniforms.coastline2019Diffuse = null;
        // map[props.locationName].image.shader.uniforms.coastline2019Mask = null;
        // map[props.locationName].image.shader.uniforms.coastline1985Diffuse = null;
        // map[props.locationName].image.shader.uniforms.coastline1985Mask = null;
        map[props.locationName].image.shader.uniforms.coastline1945Diffuse = new PIXI.Sprite.from(`${props.locationName}_coastline1945of${years[selectedCoastlineIdx]}_diffuse`).texture.baseTexture;
        map[props.locationName].image.shader.uniforms.coastline1945Mask = new PIXI.Sprite.from(`${props.locationName}_coastline1945of${years[selectedCoastlineIdx]}_mask`).texture.baseTexture;
      }
      if(selectedCoastlineIdx === 2 || selectedCoastlineIdx === 3){
        // map[props.locationName].image.shader.uniforms.coastline2019Diffuse = null;
        // map[props.locationName].image.shader.uniforms.coastline2019Mask = null;
        map[props.locationName].image.shader.uniforms.coastline1985Diffuse = new PIXI.Sprite.from(`${props.locationName}_coastline1985of${years[selectedCoastlineIdx]}_diffuse`).texture.baseTexture;
        map[props.locationName].image.shader.uniforms.coastline1985Mask = new PIXI.Sprite.from(`${props.locationName}_coastline1985of${years[selectedCoastlineIdx]}_mask`).texture.baseTexture;
      }
      if(selectedCoastlineIdx === 3){
        map[props.locationName].image.shader.uniforms.coastline2019Diffuse = new PIXI.Sprite.from(`${props.locationName}_coastline2019of${years[selectedCoastlineIdx]}_diffuse`).texture.baseTexture;
        map[props.locationName].image.shader.uniforms.coastline2019Mask = new PIXI.Sprite.from(`${props.locationName}_coastline2019of${years[selectedCoastlineIdx]}_mask`).texture.baseTexture;
      }
      
      
    }

    const startAnim = () => {
      app.ticker.add(delta => {
        if (map[props.locationName]) {
          map[props.locationName].image.shader.uniforms.islandProgress = options.islandProgress;
          map[props.locationName].image.shader.uniforms.oceanProgress = options.oceanProgress;
          map[props.locationName].image.shader.uniforms.progress1900 = options.year.y1900;
          map[props.locationName].image.shader.uniforms.progress1945 = options.year.y1945;
          map[props.locationName].image.shader.uniforms.progress1985 = options.year.y1985;
          map[props.locationName].image.shader.uniforms.progress2019 = options.year.y2019;
          map[props.locationName].image.shader.uniforms.progressHide1900 = options.year.hideY1900;
          map[props.locationName].image.shader.uniforms.progressHide1945 = options.year.hideY1945;
          map[props.locationName].image.shader.uniforms.progressHide1985 = options.year.hideY1985;
          map[props.locationName].image.shader.uniforms.progressHide2019 = options.year.hideY2019;
          map[props.locationName].image.shader.uniforms.threshold = options.threshold;
        }
      });
    };

    // const moveMap = (idx = 0) => {
    //   gsap.to([mapContainer, markerContainer], 1, {
    //     x: zoomedPos.x - idx * (map[props.locationName].image.width / (4 - 1)),
    //     y: zoomedPos.y,
    //     ease: 'power3.inOut'
    //   });
      // gsap.to('#markerOuterWrap', 1, {x:zoomedPos.x - (idx * (map[props.locationName].image.width/(4-1))), y:zoomedPos.y, ease:'power3.inOut'});
    // };

    // const zoomInOut = mode => {
    //   if (mode === 'l') {
    //     props.setZoomed(false);
    //     hideMarkers();
    //     gsap.to(whiteBG, 0.6, { alpha: 0, ease: 'power1.inOut' });
    //     gsap.to([mapContainer, markerContainer], 1, {
    //       x: 0,
    //       y: 0,
    //       ease: 'power4.inOut'
    //     });
    //     gsap.to([mapContainer.scale, markerContainer.scale], 1, {
    //       x: 1,
    //       y: 1,
    //       ease: 'power4.inOut'
    //     });
    //     // gsap.to('#markerOuterWrap', 1.05, {force3D:true, x:0, y:0, scale:1, ease:'power4.inOut'});
    //   } else {
    //     props.setZoomed(true);
    //     // props.setMapIndicatorIdx(0);
    //     moveMap();
    //     showMarkers();
    //     gsap.to(whiteBG, 0.6, { alpha: 0.5, ease: 'power1.inOut' });
    //     gsap.to([mapContainer.scale, markerContainer.scale], 1, {
    //       x: 1.8,
    //       y: 1.8,
    //       ease: 'power3.inOut'
    //     });
    //     // gsap.to('#markerOuterWrap', 1.01, {force3D:true, scale:1.8, ease:'power3.inOut'});
    //   }
    // };
    // props.handleZoom.current = { zoomInOut };

    // const updateMapIndicatorIdx = (idx, zoomed) => {
    //   if (zoomed) {
    //     moveMap(idx);
    //     showMarkers(idx);
    //   }
    // };
    // props.handleMove.current = { updateMapIndicatorIdx };

    const selectCoastline = idx => {
      selectedCoastlineIdx = idx;
      const showYears = [];
      const hideYears = [];
      const highlights = map[props.locationName].highlight;
      selectedHighlight = map[props.locationName].highlight[idx];
      if(highlightTl) highlightTl.kill();

      for (let i = 0; i < highlights.length; i++) {
        if (i !== idx) {
          const highlight = highlights[i];
          gsap.to(highlight, .6, { alpha: 0, ease: 'power1.inOut' });
        }
      }


      ///
      for (let i = 0; i < years.length; i++) {
        const v = { p2: options.year[`hideY${years[i]}`] };
        const v2 = { p2: options.year[`hideY${years[3-i]}`] };
        if(i <= idx)
          showYears[i] = v;
        if(i < 3-idx)
          hideYears[i] = v2;
      }

      gsap.to(showYears, 6, {p2: 1, stagger:0.4, ease: 'power2.out',
        onUpdate: function () {
          this.targets().forEach((target, i) => {
            if(i <= idx)
              options.year[`hideY${years[i]}`] = target.p2;
          });
        }
      })
      
      if(hideYears.length){
        gsap.to(hideYears, 6, {p2: 0, stagger:0.4, ease: 'power4.out',
          onUpdate: function () {
            this.targets().forEach((target, i) => {
              if(i < 3-idx)
                options.year[`hideY${years[3-i]}`] = target.p2;
            });
          }
        });
      }

      highlightTl = gsap.timeline();
      highlightTl.to(selectedHighlight, 1, {alpha: .8, ease: 'power1.inOut'},3);
      highlightTl.to(selectedHighlight, 1, {alpha: .4,repeat:-1, yoyo:true, ease: 'power1.inOut' },4);

      updateMapImage();
    };
    props.handleSelectCoastline.current = { selectCoastline };

    const showCoastline = idx => {
      const targetYears = [];
      for (let i = 0; i < years.length; i++) {
        const v = { p: options.year[`y${years[i]}`], p2: options.year[`hideY${years[i]}`] };
        targetYears[i] = v;
      }

      if (hasShownCoastline && idx === -1) {
        showDottedline(false);
        gsap.killTweensOf(options, "oceanProgress");
        gsap.to(options, 2, {oceanProgress: 0, ease: 'power3.out'});
        gsap.to(options, 5, {islandProgress: 0, ease: 'power3.inOut'});

        if(showCoastlineTl) showCoastlineTl.kill();
        showCoastlineTl = gsap.timeline();
        showCoastlineTl.to(targetYears, 10, { p: 0, stagger:0.4, ease: 'power2.out',
          onUpdate: function () {
            this.targets().forEach((target, i) => {
              if(i <= selectedCoastlineIdx)
                options.year[`y${years[selectedCoastlineIdx-i]}`] = target.p;
            });
          }
        })
        showCoastlineTl.call(()=>highlightTl.restart(), null, '-=6');
        showCoastlineTl.call(()=>{
          props.showNav(false);
          props.setGameMode('home');
          props.setRunTransition(false);
        }, null, '-=6');
        
        hasShownCoastline = false;
      }
      else if(!hasShownCoastline && idx > -1){
        videoElem.current.play();
        if(showCoastlineTl) showCoastlineTl.kill();
        showCoastlineTl = gsap.timeline({delay:1});
        showCoastlineTl.to(options, 3, {islandProgress: 1, ease: 'power3.inOut'},'s');
        showCoastlineTl.to(targetYears, 10 + ((3-idx) * 5), { p: 1, p2:0, stagger:1.3, ease: 'power3.out',
          onUpdate: function () {
            this.targets().forEach((target, i) => {
              if (i <= idx)
                options.year[`y${years[i]}`] = target.p;
              else
                options.year[`hideY${years[i]}`] = target.p2;
            });
          }
        },'s+=1');

        showCoastlineTl.killTweensOf(options, "oceanProgress");
        showCoastlineTl.to(options, 4, {oceanProgress: 1, ease: 'power3.out'}, `-=${5.5+((3-idx) * 5)}`);
        showCoastlineTl.call(()=>{
          props.showNav(true);
          props.setGameMode('coast');
          props.setRunTransition(false);
        }, null, `-=${5.5+((3-idx) * 5)}`);
        showCoastlineTl.call(()=>{
          showDottedline();
        }, null, `-=${5.5+((3-idx) * 5)}`);
        hasShownCoastline = true;
      }
    };
    props.handleShowCoastline.current = { showCoastline };

    const showDottedline = (bool = true) => {
      const dottedline = map[props.locationName].dottedline;
      gsap.to(dottedline, .6, { alpha: bool ? 1 : 0, overwrite:true, ease: 'power1.inOut' });
    }

    const start = i => {
      // gsap.to(options, 4, { progress: 1, ease: 'power2.inOut' });
      // gsap.killTweensOf(options, "oceanProgress");
      // gsap.to(options, 10, {oceanProgress: 1, ease: 'power3.out'});
      // gsap.to({}, i + 2.5, {
        // onComplete: () => {
        //   props.setOpacity(true);
        // }
      // });
      // gsap.to({}, i + 2.5 + 1, {
      //   onComplete: () => {
          
      //   }
      // });

      if(highlightTl) highlightTl.pause();
      gsap.to(selectedHighlight, 1, { alpha: 0, ease: 'power1.inOut' });
    };
    props.handleStart.current = { start };

    const showHighlight = (bool) => {
      gsap.to(map[props.locationName].image.shader.uniforms, .6,{highlightOpacity: bool ? .8 : .2, ease:'power1.inOut'})
    }
    showHighlightFunc.current = { showHighlight };

    initEngine();
    startAnim();
  }, []);

  useEffect(()=>{
    if(props.gameMode === 'coast'){
      onShowHighlight(true);
    }
    else if(props.gameMode === 'street'){
      onShowHighlight(false);
    }
  },[props.gameMode])

  const onShowHighlight = (bool) => {
    if(props.gameMode !== 'home'){
      setOn(bool);
      showHighlightFunc.current.showHighlight(bool);
    }
  }

  return <>
      <video ref={videoElem} width="100%" height="100%" style={{position:'fixed',top:0,left:0,zIndex:10,pointerEvents:'none',opacity: .5,objectFit: 'cover'}} preload="true" src="./images/ex303/sand_10sec.webm" ></video>
      <div ref={wrapElem} className={`shader ${props.gameMode === 'street' ? `zone${props.zone+1}` : ''}`}></div>
      {/* { !props.showYear && props.gameMode !== 'home' && <div style={{position:'fixed',top:'100px',right:'70px',zIndex:'999',fontSize:'60px',color:'#fff'}}><span style={{opacity: on ? '1' : '.4'}} onClick={()=>onShowHighlight(true)}>on</span> / <span style={{opacity: on ? '.4' : '1'}} onClick={()=>onShowHighlight(false)}>off</span></div>} */}
    </>
};

export default Map;
