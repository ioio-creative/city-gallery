import React from 'react';
import { useState, useEffect } from 'react';
import placeholderImage from 'media/placeholder_400x400.png';
import './g02BContainer.css';
import { TweenMax, TimelineMax } from 'gsap';


const G02BStatus = {
  IDLE: 1, // 
}

const CityBlock = (props) => {
  const cityIdx = props.data ? props.blockIdx ? props.blockIdx : 0 : 0;

  return <div 
    id={cityIdx}
    className={`cityBlock${props.activeCenterClass?' center':''}${props.active?' clicked':''}`} 
    style={{transform: `translate3d(${props.offsetX}px, ${props.offsetY}px, 0px)`}}
  >
    <div className="contentWrapper" onClick={props.handleClick}>
      <div className="cityImage">
        <img src={placeholderImage} alt="placeholder image" />
      </div>
      <div className="cityName">
        <div className="nickName">{props.data && props.data.cities[cityIdx].name}</div>
        <div className="realName">{props.data && props.data.cities[cityIdx].nickname}</div>
      </div>
      <div style={{
        position: 'absolute',
        top:'50%',
        left:'50%',
        transform:'translate3d(-50%,-50%,0)',
        fontSize: 120,
        color: props.color,
        display:'inline-block'
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
  // const currentColIdx = -Math.floor((props.posX-blockWidth/2) / blockWidth);
  // const currentRowIdx = -Math.floor(props.posY / blockHeight);
  const currentColIdx = props.currentColIdx;
  const currentRowIdx = props.currentRowIdx;
  const [activeIdx, setActiveIdx] = useState(null);

  const handleClick = (domIdx, blockIdx) =>{
    if(!props.dragging){
      setActiveIdx(domIdx);
      console.log('clicked block index:',blockIdx);
    }
  }

  useEffect(()=>{
    let topRowIdx,
        bottomRowIdx,
        leftColIdx,
        rightColIdx;

    if(currentRowIdx < oldcurrentRowIdx){
      // console.log('up');
      topRowIdx = currentRowIdx - 2;
      bottomRowIdx = oldcurrentRowIdx + 2;
      ridx = ((bottomRowIdx%row.length)+row.length)%row.length;
      row[ridx] = topRowIdx;
    }
    else if(currentRowIdx > oldcurrentRowIdx){
      // console.log('down');
      topRowIdx = oldcurrentRowIdx - 2;
      bottomRowIdx = currentRowIdx + 2;
      ridx = ((topRowIdx%row.length)+row.length)%row.length;
      row[ridx] = bottomRowIdx;
    }

    if(currentColIdx < oldcurrentColIdx){
      // console.log('left');
      leftColIdx = currentColIdx - 2;
      rightColIdx = oldcurrentColIdx + 2;
      cidx = ((rightColIdx%col.length)+col.length)%col.length;
      col[cidx] = leftColIdx;
    }
    else if(currentColIdx > oldcurrentColIdx){
      // console.log('right');
      leftColIdx = oldcurrentColIdx - 2;
      rightColIdx = currentColIdx + 2;
      cidx = ((leftColIdx%col.length)+col.length)%col.length;
      col[cidx] = rightColIdx;
    }

    oldcurrentRowIdx = currentRowIdx;
    oldcurrentColIdx = currentColIdx;

    // console.log('current row idx',currentRowIdx);
    // console.log('current col idx',currentColIdx);
  },[currentRowIdx,currentColIdx]);

 
  /*
   0  0 1 2 3 4
   1  5 6 7 8 9
   2  9 0 _ 2 3
   3  3 4 5 6 7
   4  1 2 3 4 5
  */

  return <div className="citiesList" style={{transform:`translate3d(${props.posX}px, ${props.posY}px, 0px)`}}>
    {
      new Array(startIdx.length).fill(0).map((value, yIdx)=>{
        return new Array(5).fill(0).map((value, xIdx)=>{
          return <CityBlock 
            key={yIdx*5 + xIdx}
            active={activeIdx === yIdx*5 + xIdx}
            blockIdx={(startIdx[yIdx] + ((col[xIdx]%10)+10)%10)%10}
            activeCenterClass={xIdx == ((currentColIdx%col.length)+col.length)%col.length && yIdx == ((currentRowIdx%row.length)+row.length)%row.length ? true : false}
            offsetX={col[xIdx] * blockWidth} 
            offsetY={row[yIdx] * blockHeight}
            color={xIdx == ((currentColIdx%col.length)+col.length)%col.length || yIdx == ((currentRowIdx%row.length)+row.length)%row.length?'red':''}
            data={props.data}
            handleClick={()=>{handleClick(yIdx*5 + xIdx, (startIdx[yIdx] + ((col[xIdx]%10)+10)%10)%10)}}
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
  const [contentData, setContentData] = useState(null);
  const [isHome, setIsHome] = useState(true);
  const [isShowHints, setIsShowHints] = useState(false);
  const [currentColIdx, setCurrentColIdx] = useState(2);
  const [currentRowIdx, setCurrentRowIdx] = useState(2);
  const [data, setData] = useState({
    initalPos:{
      x: -blockWidth*4/2 + window.innerWidth/2 - blockWidth/2, 
      y: -blockHeight*4/2 + window.innerHeight/2 - blockHeight/2
    },
    startPos:{x:0, y:0},
    currentPos:{x: 0, y:0},
    prevPos:{x:0, y:0},
    offset:{x:0, y:0},
    delta:{x:0, y:0,t:0},
    lastPos:{x:0, y:0}
  });
  const [dragging, setDragging] = useState(false);
  const [allowDrag, setAllowDrag] = useState(false);
  const [easePos, setEasePos] = useState({x:data.initalPos.x, y:data.initalPos.y});
  let timestamp = Date.now();
  let hintsElem = [];
  let hintsBtn;
  
  const dragStart = (event) => {
    let e = (event.touches? event.touches[0]: event);
    const mx = e.clientX;
    const my = e.clientY;
    setData({...data,
      startPos:{x:e.clientX, y:e.clientY},
      offset:{x:0,y:0},
      delta:{x:0,y:0,t:Date.now() - timestamp},
      lastPos:{x: mx, y:my},
      prevPos: {...data.currentPos},
    });
    setAllowDrag(true);
    setDragging(false);
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
        delta: {
          x: mx - data.lastPos.x,
          y: my - data.lastPos.y,
          t: Date.now() - timestamp
        },
        currentPos: {
          x:data.prevPos.x + data.offset.x + data.delta.x, 
          y:data.prevPos.y + data.offset.y + data.delta.y
        },
        lastPos:{x: mx, y:my},
      });

      setDragging(true);
      setIsHome(false);
      setIsShowHints(true);
    }
  }

  const dragEnd = (event) => {
    setData({...data,
      delta: {...data.delta,
        t: Date.now() - timestamp
      },
      currentPos: {
        x:data.prevPos.x + data.offset.x + Math.round(data.delta.x / data.delta.t * 200), 
        y:data.prevPos.y + data.offset.y + Math.round(data.delta.y / data.delta.t * 200)
      },
      prevPos: {...data.currentPos},
    });
    setAllowDrag(false);
    timestamp = Date.now();
  }
  
  const backToHome = () => {
    setData({...data,
      initalPos:{
        x: -blockWidth*(currentColIdx*2)/2 + window.innerWidth/2 - blockWidth/2, 
        y: -blockHeight*(currentRowIdx*2)/2 + window.innerHeight/2 - blockHeight/2
      },
      nextPos:{
        x:0,
        y:0
      },
      currentPos:{
        x:0,
        y:0
      }
    });
    setIsHome(true);
    setIsShowHints(false);
  }

  const showHints = () => {
    const tl = new TimelineMax();
    setIsShowHints(false);
    // tl.to(hintsBtn,.3,{autoAlpha:0,ease:'Power2.easeInOut'});
    hintsElem.map((elem, idx) => {
      tl.to(elem,.3,{autoAlpha:1,ease:'Power1.easeInOut'});
      if(idx === hintsElem.length-1)
        tl.to(elem,.3,{autoAlpha:0,ease:'Power1.easeInOut',onComplete:()=>{setIsShowHints(true);}},'+=1');
      else
        tl.to(elem,.3,{autoAlpha:0,ease:'Power1.easeInOut'},'+=1');
    });
    // tl.to(hintsBtn,.3,{autoAlpha:1,ease:'Power2.easeInOut'});
  }

  useEffect(()=>{
    let animId;
    const loop = ()=>{
      animId = requestAnimationFrame(loop);
      setEasePos({
        x: easePos.x += ((data.currentPos.x + data.initalPos.x) - easePos.x) * .1,
        y: easePos.y += ((data.currentPos.y + data.initalPos.y) - easePos.y) * .1
      })
    }

    setCurrentColIdx(-Math.floor((easePos.x-blockWidth/2) / blockWidth));
    setCurrentRowIdx(-Math.floor(((easePos.y+blockHeight/4) / blockHeight)));


    animId = requestAnimationFrame(loop);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('mousemove', dragMove);
      document.removeEventListener('mouseup', dragEnd);
    }
  });

  useEffect(() => {
    if(props.appData){
      setContentData(props.appData.contents['zh']);
    }
  }, [props.appData]);

  const handleClick = (lang) =>{
    setIsHome(false);
    setContentData(props.appData.contents[lang]);
    showHints();
  }

  return (
    <div id="G02BContainer" className={`${isHome?'home':''}`} onMouseDown={dragStart}>
      <div id="homeInfo">
        <div>{props.appData && props.appData.contents.home.line1}</div>
        <div>{props.appData && props.appData.contents.home.line2}</div>
        <div>{props.appData && props.appData.contents.home.selectLanguageHints1}</div>
        <div>{props.appData && props.appData.contents.home.selectLanguageHints2}</div>
        <div id="lang">
          {
            props.appData && props.appData.languages.map((value,index)=>
              <div key={index} onClick={()=>handleClick(value.locale)}>{value.display}</div>
            )
          }
        </div>
      </div>
      <div id="hints">
        <div ref={(e)=> hintsElem.push(e)}>{props.appData && contentData && contentData.ui.dragHints}</div>
        <div ref={(e)=> hintsElem.push(e)}>{props.appData && contentData && contentData.ui.clickHints}</div>
      </div>
      <div ref={(e)=> hintsBtn=e} id="hintsBtn" className={`btn${isShowHints?'':' hide'}`} onClick={()=>{showHints()}}>?</div>
      <div id="homeBtn" className="btn" onClick={()=>{backToHome()}}>O</div>
      <CitiesList 
        data={contentData}
        posX={easePos.x} 
        posY={easePos.y}
        currentColIdx={currentColIdx}
        currentRowIdx={currentRowIdx}
        dragging={dragging}
      />
      {/* <CityDetailsContainer /> */}
      {/* <LanguageSelection /> */}
    </div>
  );
}

export default G02BContainer;