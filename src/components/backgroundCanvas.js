import React, { useState, useEffect } from 'react';

import './backgroundCanvas.css';

function randomRange(min, max) {
  return ~~(Math.random() * (max - min + 1)) + min
};
function getPointOnSin(x, frequency, offset, amplitude, yOffset = 60) {
  return (Math.sin((x) / frequency + offset) * amplitude) + yOffset;
};
function rotateFromPosition(point, angle, position) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  let translatedX = point.x - position.x;
  let translatedY = point.y - position.y;
  let rotatedX = translatedX * cos - translatedY * sin;
  let rotatedY = translatedY * cos + translatedX * sin;
  rotatedX = rotatedX + position.x;
  rotatedY = rotatedY + position.y;
  return {x: rotatedX, y: rotatedY};
}
function createPathString(lineData, viewBox, ctx, backgroundImage) {
  const line = lineData; // lineDataArr[lineIndex];
  const offset = line.counter / line.speed + lineData.offset.x;
  const frequency = line.frequency;
  // const amplitude = line.amplitude * (0.5 * Math.cos(offset * 0.3));
  // const amplitude = line.amplitude;
  const amplitude = line.amplitude * (0.25 * Math.cos(line.counter / line.speed) + 0.75);
  // let amplitude = line.amplitude * Math.cos(offset);
  let minX = parseInt(viewBox[0]);
  let minY = parseInt(viewBox[1]);
  let maxX = parseInt(viewBox[2]);
  let maxY = parseInt(viewBox[3]);
  const rotationAngle = lineData.rotationAngle;
  // extend the sin wave
  // find the intersections

  const centerX = (maxX + minX) / 2;
  const centerY = (maxY + minY) / 2;
  const center = {
    x: centerX,
    y: centerY
  };
  
  const firstY = getPointOnSin(minX, frequency, offset, amplitude, lineData.offset.y);

  let rotated = {
    x: 0,
    y: 0
  };
  // const firstY = lineData.offset.y;
  // let completedPath = 'M' + minX + comma + firstY;
  //   // completedPath += ' L' + minX + ' ' + getPointOnSin(minX, frequency, offset, amplitude, lineData.offset.y);
  //   for (let i = minX + 1; i < maxX - 1; i+=10) {
  //   completedPath += ' L' + i + ' ' + getPointOnSin(i, frequency, offset, amplitude, lineData.offset.y);
  // }
  // completedPath += ' L'+ maxX +' '+ getPointOnSin(maxX, frequency, offset, amplitude, lineData.offset.y) + ' L'+ maxX +' '+ maxY +' L'+ minX +' '+ maxY +' L'+ minX +' '+ firstY +' Z';
  // ctx.clearRect(minX, minY, maxX - minX, maxY - minY);

  ctx.save();

  ctx.beginPath();
  rotated = rotateFromPosition({x: minX, y: firstY}, rotationAngle, center);
  ctx.moveTo(rotated.x, rotated.y);
  for (let i = minX + 1; i < maxX - 1; i+=10) {
    const calculatedY = getPointOnSin(i, frequency, offset, amplitude, lineData.offset.y);
    rotated = rotateFromPosition({x: i, y: calculatedY}, rotationAngle, center);
    ctx.lineTo(rotated.x, rotated.y);
  }
  const calculatedY = getPointOnSin(maxX, frequency, offset, amplitude, lineData.offset.y);
  rotated = rotateFromPosition({x: maxX, y: calculatedY}, rotationAngle, center);
  ctx.lineTo(rotated.x, rotated.y);
  
  rotated = rotateFromPosition({x: maxX, y: maxY}, rotationAngle, center);
  ctx.lineTo(rotated.x, rotated.y);
  // ctx.lineTo(0, rotated.y);
  
  rotated = rotateFromPosition({x: minX, y: maxY}, rotationAngle, center);
  ctx.lineTo(rotated.x, rotated.y);
  // ctx.lineTo(0, 0);

  rotated = rotateFromPosition({x: minX, y: firstY}, rotationAngle, center);
  ctx.lineTo(rotated.x, rotated.y);

  if (backgroundImage) {
    ctx.clip();
    ctx.drawImage(backgroundImage, 0, 0, maxX, maxY);
  } else {
    if (lineData.fillGradient) {
      const grd = ctx.createLinearGradient(
        lineData.fillGradient['x1'],
        lineData.fillGradient['y1'],
        lineData.fillGradient['x2'],
        lineData.fillGradient['y2']
      );
      lineData.fillGradient['stops'].forEach(stop => {
        grd.addColorStop(stop['percent'], stop['color']);
      })
      ctx.fillStyle = grd;
    } else {
      ctx.fillStyle = lineData.fillColor;
    }
    // ctx.fillStyle = lineData.fillGradient;
    ctx.globalAlpha = lineData.fillOpacity;
    ctx.fill();
  }

  ctx.restore();

  if (lineData.shadow) {
    Object.keys(lineData.shadow).forEach(key => {
      ctx[key] = lineData.shadow[key];
    })
  }
  line.counter++;
  // console.log('drawing()');
  return;
};
const BackgroundCanvas = (props) => {
  const {
    viewBox: defaultViewBox = `0 0 800 800`,
    minSpeed: defaultMinSpeed = 80,
    maxSpeed: defaultMaxSpeed = 140,
    backgroundColor: defaultBackgroundColor = 'transparent',
    lines: defaultLines = [{
      fillColor: '#FFFFFF',
      fillOpacity: 1,
      frequency: 200,
      amplitude: 10,
      rotationAngle: Math.PI / 2,
      minSpeed: 80,
      maxSpeed: 80,
      offset: {
        x: 0,
        y: 690
      },
      // shadow: {
      //   shadowColor: '#999',
      //   shadowBlur: 1,
      //   shadowOffsetX: 0,
      //   shadowOffsetY: 0
      // }
    }],
    backgroundImageSrc: defaultBackgroundImageSrc = null,
    autoplay: isAutoplay = false,
    className: defaultClassName = ''
  } = props;
  const [viewBox, ] = useState(defaultViewBox);
  const [minSpeed, setMinSpeed] = useState(defaultMinSpeed);
  const [maxSpeed, setMaxSpeed] = useState(defaultMaxSpeed);
  const [backgroundColor, setBackgroundColor] = useState(defaultBackgroundColor);
  const [lines, ] = useState(defaultLines);
  const [lineDataArr, setLineDataArr] = useState([]);
  const [canvasEl, setCanvasElRef] = useState(null);
  const [ctx, setCtx] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  let animationFrame = null;

  const init = () => {
    const viewBoxArr = viewBox.split(' ');
    canvasEl.setAttribute('width', viewBoxArr[2]);
    canvasEl.setAttribute('height', viewBoxArr[3]);
    setCtx(canvasEl.getContext('2d'));
    createLines();
  };
  const animLoop = () => {
    draw();
    // reference the requestAnimationFrame, use for cancel when unmount
    animationFrame = requestAnimationFrame(animLoop);
  };
  const draw = () => {
    // const lineDataArr = lineDataArr;
    const viewBoxArr = viewBox.split(' ');
    // const ctx = this.ctx;
    // const backgroundImage = this.backgroundImage;
    ctx.clearRect(0, 0, viewBoxArr[2], viewBoxArr[3]);
    lineDataArr.forEach((lineData) => {
      createPathString(lineData, viewBoxArr, ctx, backgroundImage);
    });    
  };
  const play = () => {
    if (!animationFrame) {
      animLoop();
    }
  }
  const pause = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }
  // let lineDataArr = [];
  let newPathElArray=[];

  useEffect(() => {
    if (defaultBackgroundImageSrc) {
      const tmpBackgroundImage = new Image();    
      tmpBackgroundImage.onload = () => {
        setBackgroundImage(tmpBackgroundImage);
      };
      tmpBackgroundImage.src = defaultBackgroundImageSrc;
    }
  }, [defaultBackgroundImageSrc]);

  useEffect(() => {
    if (canvasEl) {
      init();
    }
  }, [canvasEl])
  useEffect(() => {
    if (ctx && isAutoplay) {
      play();
    }
    return () => {
      if (ctx) {
        pause();
      }
    }
  }, [ctx, isAutoplay])

  const createLines = () => {
    const allLines = lines;
    const viewBoxArr = viewBox.split(' ');
    let newLineDataArr = [];
    allLines.forEach(line=> {
      // higher is slower
      const minSpeed = line.minSpeed || minSpeed;
      const maxSpeed = line.maxSpeed || maxSpeed;
      const rotationAngle = line.rotationAngle || 0;
      const yOffset = line.offset.y;
      let viewBoxBound = viewBoxArr;
      const center = {
        x: (viewBoxArr[0] + viewBoxArr[1]) / 2,
        y: (viewBoxArr[2] + viewBoxArr[3]) / 2
      }
      // (y2 - y1) / (x2 - x1) = Math.tan(rotationAngle);
      if (rotationAngle % 2 * Math.PI === 0) {
        // 0, 360
        // nothing
        // viewBoxBound = viewBox
      } else if (rotationAngle % Math.PI === 0) {
        // 180 
        // viewBoxBound = viewBox invert
        // 
      } else if (rotationAngle % Math.PI / 2 === 0) {
        // 90, 270
        // rotationAngle / (Math.PI / 2) === 1
        // viewBoxBound -> left
        // rotationAngle / (Math.PI / 2) === 1
        // viewBoxBound -> right
        // need invert x,y boundary
        viewBoxBound[0] = viewBoxArr[1];
        viewBoxBound[1] = viewBoxArr[0];
        viewBoxBound[2] = viewBoxArr[3];
        viewBoxBound[3] = viewBoxArr[2];
      } else {
        // other angles
        // calculate intersect bound
        // new sine line length
        // const originToRotatedPoint = Math.sqrt((center.y * center.y) + (center.x * center.x)) + (yOffset - center.y);
        const xIntersect = (yOffset - center.y) / Math.cos(rotationAngle) + center.x;
        const yIntersect = (yOffset - center.y) / Math.sin(rotationAngle) + center.y;
        // console.log(xIntersect);
        let minX = viewBoxArr[2];
        let minY = viewBoxArr[3];
        let maxX = viewBoxArr[0];
        let maxY = viewBoxArr[1];
        if (xIntersect < minX && xIntersect > viewBoxArr[0]) {
          minX = xIntersect;
        }
        if (xIntersect > maxX && xIntersect < viewBoxArr[2]) {
          maxX = xIntersect;
        }
      }
      // y = rotationAngle * 0 + yOffset;
      const userDefinedCounterOffset = (line.counter===undefined? randomRange(1, 500): line.counter);
      const lineDataObj = {
        counter: userDefinedCounterOffset, // a broad counter range ensures lines start at different cycles (will look more random)
        frequency: line.frequency, // randomRange(20,40),
        amplitude: line.amplitude, // randomRange(40,60),
        fillColor: line.fillColor,
        fillGradient: line.fillGradient,
        fillOpacity: line.fillOpacity,
        rotationAngle: rotationAngle,
        speed: randomRange(minSpeed, maxSpeed),
        offset: line.offset,
        shadow: line.shadow,
      }
      newLineDataArr.push(lineDataObj);
    });
    setLineDataArr(newLineDataArr);
  }
  return (
    <div className={`canvas-animate-background ${defaultClassName}`}>
      <canvas ref={ref=>setCanvasElRef(ref)} />
    </div>
  );
}
export default BackgroundCanvas;
