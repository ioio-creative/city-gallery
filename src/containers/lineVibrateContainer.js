import React, {Fragment} from 'react';
// new apis
import { useState, useEffect, useCallback, useMemo } from 'react';



/**
 *
 * @param {context} ctx			HTML5 Canvas
 * @param {number} x[]
 * @param {number} y[]
 * @param {integer} num		Number of points
 * @param {integer} sg		Segments between each points
 */
const drawBspline = ( ctx, x, y, num, sn ) => {
	if (sn < 0) return;

	var	e1 = new Array(sn),
		e2 = new Array(sn),
		e3 = new Array(sn),
		e4 = new Array(sn),
		x1, x2, x3, x4, y1, y2, y3, y4,
		t, i, j;

	for (i = 0; i < sn; i++) {
		t = ( i + 1 ) / sn;
		e1[i] = ( ( ( 3 - t ) * t - 3 ) * t + 1 ) / 6;
		e2[i] = ( ( 3 * t - 6 ) * t * t + 4 ) / 6;
		e3[i] = ( ( ( 3 - 3 * t ) * t + 3 ) * t + 1 ) / 6;
		e4[i] = t * t * t / 6;
	}

	x2 = x[0]; x3 = x[1]; x4 = x[2];
	y2 = y[0]; y3 = y[1]; y4 = y[2];
	ctx.moveTo((x2+4*x3+x4)/6,(y2+4*y3+y4)/6);

	for (i = 3; i < num; i++) {
		x1 = x2; x2 = x3; x3 = x4; x4 = x[i];
		y1 = y2; y2 = y3; y3 = y4; y4 = y[i];
		for (j = 0; j < sn; j++) {
			ctx.lineTo(e1[j]*x1+e2[j]*x2+e3[j]*x3+e4[j]*x4,
					   e1[j]*y1+e2[j]*y2+e3[j]*y3+e4[j]*y4);
		}
	}
}
const LineVibrateContainer = (props) => {
  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  // const [animationFrame, setAnimationFrame] = useState(null);
  const [canvasElRef, setCanvasElRef] = useState(null);
  const [curvePointsCount, setCurvePointsCount] = useState(10);
  // const [curveXArr, setCurveXArr] = useState([]);
  const [curveYArr, setCurveYArr] = useState(new Array(curvePointsCount).fill(0.5));
  // render
  // let canvasElRef = null;
  let animationFrame = null;
  useEffect(() => {
    window.addEventListener('resize', updateWindowsSize);
    document.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('touchmove', updateMousePosition);
    return () => {
      window.removeEventListener('resize', updateWindowsSize);
    document.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('touchmove', updateMousePosition);
    }
  }, [])
  useEffect(() => {
    if (canvasElRef) {
      canvasElRef.width = windowSize[0];
      canvasElRef.height = windowSize[1];
      // re-bind update function when window size changed
      animationFrame = requestAnimationFrame(onUpdate);
    }
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    }
  }, [canvasElRef, windowSize, curveYArr])
  const updateWindowsSize = () => {
    setWindowSize([window.innerWidth, window.innerHeight])
  }
  const updateMousePosition = (event) => {
    const winW = windowSize[0];
    const winH = windowSize[1];
    // assume multiple users approaching is supported
    const pointers = event.touches ? event.touches : [event];
    // in 0 - 1 scale
    const tmpCurveYArr = new Array(curvePointsCount).fill(0.5);
    for (let i = 0; i < pointers.length; i++) {
      // update the curve points base on the pointer position
      const exactX = pointers[i].clientX / winW * curvePointsCount;
      const nearestMaxX = Math.max(Math.floor(exactX), 0);
      const nearestMinX = Math.min(Math.ceil(exactX), curvePointsCount - 1);
      const exactY = (1 - pointers[i].clientY / winH) / 2;
      const nearestMaxXY = (nearestMinX - exactX) * exactY + 0.5;
      const nearestMinXY = (exactX - nearestMaxX) * exactY + 0.5;
      if (nearestMaxXY > tmpCurveYArr[nearestMaxX]) {
        tmpCurveYArr[nearestMaxX] = nearestMaxXY;
      }
      if (nearestMinXY > tmpCurveYArr[nearestMinX]) {
        tmpCurveYArr[nearestMinX] = nearestMinXY;
      }
      
      if (nearestMaxX === nearestMinX) {
        const specialNearestXY = exactY + 0.5;
        if (specialNearestXY > tmpCurveYArr[nearestMinX]) {
          tmpCurveYArr[nearestMinX] = specialNearestXY;
        }
      }
    }
    setCurveYArr(tmpCurveYArr);
  }
  const onUpdate = () => {
    animationFrame = requestAnimationFrame(onUpdate);
    const ctx = canvasElRef.getContext('2d');
    
    // drawBspline(ctx, xArr, yArr, );
    ctx.clearRect(0, 0, windowSize[0], windowSize[1]);

    const xArr = [];
    const yArr = [];
    const yArrInv = [];
    for (let i = 0; i < curveYArr.length; i++) {
      xArr.push(i * windowSize[0] / (curveYArr.length - 1));
      yArr.push(curveYArr[i] * windowSize[1]);
      yArrInv.push((1 - curveYArr[i]) * windowSize[1]);
      // ctx.lineTo(i * windowSize[0] / (curveYArr.length - 1), curveYArr[i] * windowSize[1]);
    }
    ctx.beginPath();
    ctx.strokeStyle = "red";    
    drawBspline(ctx, xArr, yArr, curveYArr.length, 5);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.strokeStyle = "blue";    
    drawBspline(ctx, xArr, yArrInv, curveYArr.length, 5);
    ctx.stroke();
    ctx.closePath();

    // ctx.clearRect(0, 0, windowSize[0], windowSize[1]);
    // ctx.beginPath();
    // ctx.strokeStyle = "red";    
    // for (let i = 0; i < curveYArr.length; i++) {
    //   ctx.lineTo(i * windowSize[0] / (curveYArr.length - 1), curveYArr[i] * windowSize[1]);
    // }
    // ctx.stroke();
    // ctx.closePath();
    // ctx.beginPath();
    // ctx.strokeStyle = "blue";    
    // for (let i = 0; i < curveYArr.length; i++) {
    //   ctx.lineTo(i * windowSize[0] / (curveYArr.length - 1), (1 - curveYArr[i]) * windowSize[1]);
    // }
    // ctx.stroke();
    // ctx.closePath();
  }
  return (
    <canvas ref={(ref) => setCanvasElRef(ref)} />
  );
}
// if use useContext, the withInfoContext is not necessary
// export default App;
export default LineVibrateContainer;