import React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import placeholderImage from 'media/placeholder_400x400.png';
import './g02BContainer.css';


const G02BStatus = {
  IDLE: 1, // 
}

const CityBlock = (props) => {
  return <div className="cityBlock" style={{
    transform: `translate3d(${props.offsetX}px, ${props.offsetY}px, 0px)`
  }}>
    <div className="contentWrapper">
      <div className="cityImage">
        <img src={placeholderImage} alt="placeholder image" />
      </div>
      <div className="cityName">
        <div className="nickName">防衞之城</div>
        <div className="realName">佛羅里達</div>
      </div>
      <div style={{
        position: 'absolute',
        fontSize: 120,
        color: props.color
      }}>{props.blockIdx}</div>
    </div>
  </div>
}
const startIdx = [9,3,8,1,5];
let col = [0,1,2,3,4];
let row = [0,1,2,3,4];
let ridx = 2;
let cidx = 2;
let oldcurrentRowIdx = 2;
let oldcurrentColIdx = 2;



const CitiesList = (props) => {
  const blockWidth = window.innerWidth / 3;
  const blockHeight = blockWidth;
  const currentColIdx = -Math.floor((props.posX-blockWidth/2) / blockWidth);
  const currentRowIdx = -Math.floor(props.posY / blockHeight);

  useEffect(()=>{
    let topRowIdx,
        bottomRowIdx,
        leftColIdx,
        rightColIdx;

    if(currentRowIdx < oldcurrentRowIdx){
      console.log('up');
      topRowIdx = currentRowIdx - 2;
      bottomRowIdx = oldcurrentRowIdx + 2;
      ridx = ((bottomRowIdx%row.length)+row.length)%row.length;
      row[ridx] = topRowIdx;
    }
    else if(currentRowIdx > oldcurrentRowIdx){
      console.log('down');
      topRowIdx = oldcurrentRowIdx - 2;
      bottomRowIdx = currentRowIdx + 2;
      ridx = ((topRowIdx%row.length)+row.length)%row.length;
      row[ridx] = bottomRowIdx;
    }

    if(currentColIdx < oldcurrentColIdx){
      console.log('left');
      leftColIdx = currentColIdx - 2;
      rightColIdx = oldcurrentColIdx + 2;
      cidx = ((rightColIdx%col.length)+col.length)%col.length;
      col[cidx] = leftColIdx;
    }
    else if(currentColIdx > oldcurrentColIdx){
      console.log('right');
      leftColIdx = oldcurrentColIdx - 2;
      rightColIdx = currentColIdx + 2;
      cidx = ((leftColIdx%col.length)+col.length)%col.length;
      col[cidx] = rightColIdx;
    }

    oldcurrentRowIdx = currentRowIdx;
    oldcurrentColIdx = currentColIdx;

    // console.log(row,topRowIdx,bottomRowIdx);
    // console.log('current row idx',currentRowIdx);
    // console.log('current col idx',currentColIdx);
  },[currentRowIdx,currentColIdx]);

 
  /*
   0  6 7 8 9 0
   1  2 3 4 5 6
   2  9 0 _ 2 3
   3  3 4 5 6 7
   4  1 2 3 4 5
  */

  return <div className="citiesList" style={{transform:`translate3d(${props.posX}px, ${props.posY}px, 0px)`}}>
    {
      new Array(startIdx.length).fill(0).map((value, yIdx)=>{
        return new Array(5).fill(0).map((value, xIdx)=>{
          return <CityBlock 
            key={`(${yIdx},${xIdx})`}
            blockIdx={(startIdx[yIdx] + ((col[xIdx]%10)+10)%10)%10}
            offsetX={col[xIdx] * blockWidth} 
            offsetY={row[yIdx] * blockHeight}
            color={xIdx == ((currentColIdx%col.length)+col.length)%col.length || yIdx == ((currentRowIdx%row.length)+row.length)%row.length?'red':''}
          />
        })
      })
    }
 </div>
}



const G02BContainer = (props) => {
  const blockWidth = window.innerWidth / 3;
  const blockHeight = blockWidth;
  const [status, setStatus] = useState(G02BStatus.IDLE);
  const [data, setData] = useState({
    initalPos:{
      x: -blockWidth*4/2 + window.innerWidth/2 - blockWidth/2, 
      y: -blockHeight*3/2 + window.innerHeight/2 - blockHeight
    },
    startPos:{x:0, y:0},
    currentPos:{x: 0, y:0},
    nextPos:{x:0, y:0},
    offset:{x:0, y:0},
    delta:{x:0, y:0},
    lastPos:{x:0, y:0}
  });
  const [allowDrag, setAllowDrag] = useState(false);
  const [easePos, setEasePos] = useState({x:data.initalPos.x, y:data.initalPos.y});
  
  const dragStart = (event) => {
    let e = (event.touches? event.touches[0]: event);
    const mx = e.clientX;
    const my = e.clientY;
    setData({...data,
      startPos:{x:e.clientX, y:e.clientY},
      offset:{x:0,y:0},
      delta:{x:0,y:0},
      lastPos:{x: mx, y:my},
    });
    setAllowDrag(true);
  }

  const dragMove = (event) => {
    let e = (event.touches? event.touches[0]: event);
    if(allowDrag){
      const mx = e.clientX;
      const my = e.clientY;
      setData({...data,
        offset:{
          x:mx - data.startPos.x, 
          y:my - data.startPos.y
        },
        currentPos: {
          x:data.nextPos.x + data.offset.x + data.delta.x, 
          y:data.nextPos.y + data.offset.y + data.delta.y
        },
        lastPos:{x: mx, y:my},
        delta: {
          x:data.lastPos.x - mx,
          y:data.lastPos.y - my
        },
      });
    }
  }

  const dragEnd = (event) => {
    let e = (event.touches? event.touches[0]: event);
    // const mx = e.clientX;
    // const my = e.clientY;
    setData({...data,
      nextPos:{...data.currentPos},
      offset:{x:0,y:0},
      // delta:{x:0,y:0},
      // lastPos:{x: mx, y:my},
    });
    setAllowDrag(false);
  }
  const easing={x:0,y:0};

  useEffect(()=>{
    let animId;
    const loop = ()=>{
      animId = requestAnimationFrame(loop);
      setEasePos({
        x: easePos.x += ((data.currentPos.x + data.initalPos.x) - easePos.x) * .1,
        y: easePos.y += ((data.currentPos.y + data.initalPos.y) - easePos.y) * .1
      })
    }
    animId = requestAnimationFrame(loop);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('mousemove', dragMove);
      document.removeEventListener('mouseup', dragEnd);
    }
  },[easing]);

  return <div id="G02BContainer" onMouseDown={dragStart}>
    <CitiesList 
      posX={easePos.x} 
      posY={easePos.y}
    />
    {/* <CityDetailsContainer /> */}
    {/* <LanguageSelection /> */}
  </div>;
}

export default G02BContainer;