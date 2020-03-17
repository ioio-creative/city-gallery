import React, { useState, useEffect, useRef} from 'react';
import gsap from 'gsap';
import './g02BContainer.scss';

import hamburg from '../exhibitions/exG02B2/images/hamburg.png';

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
    <div className="cityBgColor"></div>
    <div className="contentWrap" onClick={props.onClickBlock}>
      <div className="cityImage" style={{backgroundImage:`url(${hamburg})`}}></div>
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
        display:'inline-block',
        zIndex:9
      }}>{props.blockIdx}</div>
    </div>
    <div className="mainContentWrap">
        <h2 className="nickName">{props.data && props.data.cities[cityIdx].name}</h2>
        <h2 className="realName">{props.data && props.data.cities[cityIdx].nickname}</h2>
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
  const [domIdx, setDomIdx] = useState(null);

  // const handleClick = (_domIdx, blockIdx, c,r) =>{
  //   if(!props.dragging){
  //     setDomIdx(_domIdx);
  //     props.getActiveBlockIdx(_domIdx);
  //     props.moveToBlock(col[c] * blockWidth, row[r] * blockHeight);
  //   }
  // }

  useEffect(()=>{
    setDomIdx(props.activeBlockIdx);
  });
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
            active={domIdx === yIdx*5 + xIdx}
            blockIdx={(startIdx[yIdx] + ((col[xIdx]%10)+10)%10)%10}
            activeCenterClass={xIdx === ((currentColIdx%col.length)+col.length)%col.length && yIdx === ((currentRowIdx%row.length)+row.length)%row.length ? true : false}
            offsetX={col[xIdx] * blockWidth} 
            offsetY={row[yIdx] * blockHeight}
            color={xIdx === ((currentColIdx%col.length)+col.length)%col.length || yIdx === ((currentRowIdx%row.length)+row.length)%row.length?'red':''}
            data={props.data}
            clickBlock={(e)=>{props.clickBlock(yIdx*5 + xIdx, (startIdx[yIdx] + ((col[xIdx]%10)+10)%10)%10, xIdx, yIdx)}}
          />
        })
      })
    }
  </div>
}



const G02BContainer = (props) => {
  const [dragging, setDragging] = useState(false);
  const citiesListElem = useRef(null);
  const goCenterFunc = useRef(null);
  const moveToClickedBlockFunc = useRef(null);

  const [domIdx, setDomIdx] = useState(null);
  const blockWidth = window.innerWidth / 3;
  const blockHeight = blockWidth;
  // const [status, setStatus] = useState(G02BStatus.IDLE);
  const [contentData, setContentData] = useState(null);
  const [isHome, setIsHome] = useState(true);
  const [isShowHints, setIsShowHints] = useState(false);
  const [isShowExplore, setIsShowExplore] = useState(false);
  const [currentColIdx, setCurrentColIdx] = useState(2);
  const [currentRowIdx, setCurrentRowIdx] = useState(2);
  const [easeElemPos, setEaseElemPos] = useState({
    x: -blockWidth*4/2 + window.innerWidth/2 - blockWidth/2,
    y: -blockHeight*4/2 + window.innerHeight/2 - blockHeight/2
  });
  // const [data, setData] = useState({
  //   initalPos:{
  //     x: -blockWidth*4/2 + window.innerWidth/2 - blockWidth/2, 
  //     y: -blockHeight*4/2 + window.innerHeight/2 - blockHeight/2
  //   },
  //   startPos:{x:0, y:0},
  //   currentPos:{x: 0, y:0},
  //   prevPos:{x:0, y:0},
  //   offset:{x:0, y:0},
  //   delta:{x:0, y:0,t:0},
  //   lastPos:{x:0, y:0}
  // });
  // const [disableDrag, setDisableDrag] = useState(false);
  // const [startDrag, setStartDrag] = useState(false);
  // const [easePos, setEasePos] = useState({x:data.initalPos.x, y:data.initalPos.y});
  const [activeBlockIdx, setActiveBlockIdx] = useState(null);
  // let timestamp = Date.now();
  let hintsElem = [];
  
  // const dragStart = (event) => {
  //   if(!disableDrag){
  //     let e = (event.touches? event.touches[0]: event);
  //     const mx = e.clientX;
  //     const my = e.clientY;
  //     setData({...data,
  //       startPos:{x:e.clientX, y:e.clientY},
  //       offset:{x:0,y:0},
  //       delta:{x:0,y:0,t:Date.now() - timestamp},
  //       lastPos:{x: mx, y:my},
  //       prevPos: {...data.currentPos},
  //     });
  //     setStartDrag(true);
  //     setDragging(false);
  //   }
  // }

  // const dragMove = (event) => {
  //   if(!disableDrag){
  //     let e = (event.touches? event.touches[0]: event);
  //     if(startDrag){
  //       const mx = e.clientX;
  //       const my = e.clientY;

  //       setData({...data,
  //         offset:{
  //           x:mx - data.startPos.x, 
  //           y:my - data.startPos.y
  //         },
  //         delta: {
  //           x: mx - data.lastPos.x,
  //           y: my - data.lastPos.y,
  //           t: Date.now() - timestamp
  //         },
  //         currentPos: {
  //           x:data.prevPos.x + data.offset.x + data.delta.x, 
  //           y:data.prevPos.y + data.offset.y + data.delta.y
  //         },
  //         lastPos:{x: mx, y:my},
  //       });


  //       setDragging(true);
  //       setIsHome(false);
  //       setIsShowHints(true);
  //     }
  //   }
  // }

  // const dragEnd = (event) => {
  //   if(!disableDrag){
  //     setData({...data,
  //       delta: {...data.delta,
  //         t: Date.now() - timestamp
  //       },
  //       currentPos: {
  //         x:data.prevPos.x + data.offset.x + Math.round(data.delta.x / data.delta.t * 200), 
  //         y:data.prevPos.y + data.offset.y + Math.round(data.delta.y / data.delta.t * 200)
  //       },
  //       prevPos: {...data.currentPos},
  //     });
  //     console.log(data.delta)
  //     setStartDrag(false);
  //     timestamp = Date.now();
  //   }
  // }

  




  
  

  useEffect(()=>{
    const mouse = {
      startPos:{x:0, y:0},
      currentPos:{x:0, y:0},
      delta:{x:0, y:0},
      lastPos:{x:0, y:0}
    }
    // const blockWidth = window.innerWidth / 3;
    // const blockHeight = blockWidth;
    const initalPos = {
      x: -blockWidth*4/2 + window.innerWidth/2 - blockWidth/2, 
      y: -blockHeight*4/2 + window.innerHeight/2 - blockHeight/2
    };
    const elemPos = {
      x: initalPos.x,
      y: initalPos.y
    }
    // const easeElemPos = {x:initalPos.x,y:initalPos.y};
    let player = null;


    const onMouseDown = (event) => {
      setDragging(false);
      let e = (event.touches? event.touches[0]: event);
      const mx = e.clientX;
      const my = e.clientY;

      mouse.startPos = {x:mx, y:my};
      mouse.lastPos = {x:0, y:0};
        
      document.addEventListener('mousemove', onMouseMove, false);
      document.addEventListener('mouseup', onMouseUp, false);
    }

    const onMouseMove = (event) => {
      // setDragging(true);
      let e = (event.touches? event.touches[0]: event);
      const mx = e.clientX;
      const my = e.clientY;

      mouse.currentPos.x = mx - mouse.startPos.x;
      mouse.currentPos.y = my - mouse.startPos.y;

      mouse.delta.x =  mouse.currentPos.x - mouse.lastPos.x;
      mouse.delta.y =  mouse.currentPos.y - mouse.lastPos.y;

      mouse.lastPos.x = mouse.currentPos.x;
      mouse.lastPos.y = mouse.currentPos.y;

      elemPos.x += mouse.delta.x * 2;
      elemPos.y += mouse.delta.y * 2;
    }

    const onMouseUp = (event) => {
      setDragging(false);
      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('mouseup', onMouseUp, false);
    }

    const goCenter = (colIdx, rowIdx) => {
      elemPos.x = -blockWidth*(colIdx*2)/2 + window.innerWidth/2 - blockWidth/2;
      elemPos.y = -blockHeight*(rowIdx*2)/2 + window.innerHeight/2 - blockHeight/2;
      
      mouse.currentPos = {x:0, y:0};
    }
    goCenterFunc.current = {goCenter};
    

    const moveToClickedBlock = (x,y) => {
      setIsHome(false);
      setIsShowHints(false);
      setIsShowExplore(true);
      elemPos.x = -x + blockWidth;
      elemPos.y = -y + window.innerHeight/2 - blockHeight/2;
    }
    moveToClickedBlockFunc.current = {moveToClickedBlock}

    

    // console.log('current row idx',currentRowIdx);
    // console.log('current col idx',currentColIdx);

    const loop = ()=>{
      player = requestAnimationFrame(loop);

      setEaseElemPos({
        x:easeElemPos.x += (elemPos.x - easeElemPos.x) * .1,
        y:easeElemPos.y += (elemPos.y - easeElemPos.y) * .1
      });

      setCurrentColIdx(-Math.floor((easeElemPos.x-blockWidth/2) / blockWidth));
      setCurrentRowIdx(-Math.floor(((easeElemPos.y+blockHeight/4) / blockHeight)));

      // citiesListElem.current.style.transform = `translate3d(${easeElemPos.x}px, ${easeElemPos.y}px, 0)`;
    }

    loop();
    document.addEventListener('mousedown', onMouseDown, false);
    return () => {
      cancelAnimationFrame(player);
      document.removeEventListener('mousedown', onMouseDown, false);
    }
  },[]);

  useEffect(() => {
    if(props.appData){
      setContentData(props.appData.contents['zh']);
    }
  }, [props.appData]);

  
  
  const backToHome = () => {
    goCenterFunc.current.goCenter(currentColIdx,currentRowIdx);
    setIsHome(true);
    setIsShowHints(false);
  }
  
  const showHints = () => {
    const tl = gsap.timeline();
    setIsShowHints(false);

    hintsElem.map((elem, idx) => {
      tl.to(elem,.3,{autoAlpha:1,ease:'Power1.easeInOut'});
      if(idx === hintsElem.length-1)
        tl.to(elem,.3,{autoAlpha:0,ease:'Power1.easeInOut',onComplete:()=>{setIsShowHints(true);}},'+=1');
      else
        tl.to(elem,.3,{autoAlpha:0,ease:'Power1.easeInOut'},'+=1');
    });
  }
  
  const closeContent = () => {
    // setDisableDrag(false);
    setIsShowExplore(false);
    setActiveBlockIdx(null);
  }
  
  const onClickBlock = (domIdx, blockIdx, c,r) =>{
    if(!dragging){
      setActiveBlockIdx(domIdx);
      moveToClickedBlockFunc.current.moveToClickedBlock(col[c] * blockWidth, row[r] * blockHeight);
    }
  }

  const onChangeLang = (lang) =>{
    setIsHome(false);
    setContentData(props.appData.contents[lang]);
    showHints();
  }


  return (
    <div id="G02BContainer" className={`${isHome?'home':''}`}>
      <div id="homeInfo">
        <div>Please select language</div>
        <div>請選擇語言</div>
        <div id="lang">
          {
            props.appData && props.appData.languages.map((value,index)=>
              <div key={index} onClick={()=>onChangeLang(value.locale)}>{value.display}</div>
            )
          }
        </div>
      </div>
      <div id="hints">
        <div ref={(e)=> hintsElem.push(e)}>{props.appData && contentData && contentData.ui.dragHints}</div>
        <div ref={(e)=> hintsElem.push(e)}>{props.appData && contentData && contentData.ui.clickHints}</div>
      </div>
      <div id="hintsBtn" className={`btn${isShowHints?'':' hide'}`} onClick={()=>{showHints()}}>?</div>
      <div id="exploreBtn" className={`btn${isShowExplore?'':' hide'}`} onClick={()=>{closeContent()}}>{props.appData && contentData && contentData.ui.exploreHints}</div>
      <div id="homeBtn" className="btn" onClick={()=>{backToHome()}}>O</div>


      {/* <div ref={citiesListElem} className="citiesList">
        {
          new Array(startIdx.length).fill(0).map((value, yIdx)=>{
            return new Array(5).fill(0).map((value, xIdx)=>{
              return <CityBlock 
                key={yIdx*5 + xIdx}
                active={domIdx === yIdx*5 + xIdx}
                blockIdx={(startIdx[yIdx] + ((col[xIdx]%10)+10)%10)%10}
                activeCenterClass={xIdx === ((currentColIdx%col.length)+col.length)%col.length && yIdx === ((currentRowIdx%row.length)+row.length)%row.length ? true : false}
                offsetX={col[xIdx]} 
                offsetY={row[yIdx]}
                color={xIdx === ((currentColIdx%col.length)+col.length)%col.length || yIdx === ((currentRowIdx%row.length)+row.length)%row.length?'red':''}
                data={contentData}
                // onClickBlock={(e)=>{onClickBlock(yIdx*5 + xIdx, (startIdx[yIdx] + ((col[xIdx]%10)+10)%10)%10, xIdx, yIdx)}}
              />
            })
          })
        }
      </div> */}
      {/* <div ref={citiesListElem} className="citiesList"> */}
        <CitiesList 
          data={contentData}
          posX={easeElemPos.x}
          posY={easeElemPos.y}
          currentColIdx={currentColIdx}
          currentRowIdx={currentRowIdx}
          // moveToClickedBlock={moveToClickedBlock}
          // dragging={dragging}
          activeBlockIdx={activeBlockIdx}
          onClickBlock={onClickBlock}
        />
      {/* </div> */}
      {/* <CityDetailsContainer /> */}
      {/* <LanguageSelection /> */}
    </div>
  );
}

export default G02BContainer;