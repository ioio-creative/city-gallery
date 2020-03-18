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
    {/* <div className="cityBgColor"></div> */}
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
        zIndex:99
      }}>{props.data && props.blockIdx}</div>
    </div>
    {/* <div className="mainContentWrap">
        <h2 className="nickName">{props.data && props.data.cities[cityIdx].name}</h2>
        <h2 className="realName">{props.data && props.data.cities[cityIdx].nickname}</h2>
    </div> */}
  </div>
}

const startIdx = [1,5,8,1,4];
let col = [0,1,2,3,4];
let row = [0,1,2,3,4];
let ridx = 2;
let cidx = 2;
let oldcurrentRowIdx = 2;
let oldcurrentColIdx = 2;

const CitiesList = (props) => {
  const blockWidth = window.innerWidth / 3.1;
  const blockHeight = blockWidth;
  // const currentColIdx = -Math.floor((props.posX-blockWidth/2) / blockWidth);
  // const currentRowIdx = -Math.floor(props.posY / blockHeight);
  const currentColIdx = props.currentColIdx;
  const currentRowIdx = props.currentRowIdx;
  // const [domIdx, setDomIdx] = useState(null);

  // const handleClick = (_domIdx, blockIdx, c,r) =>{
  //   if(!props.dragging){
  //     setDomIdx(_domIdx);
  //     props.getblockElemIdx(_domIdx);
  //     props.moveToBlock(col[c] * blockWidth, row[r] * blockHeight);
  //   }
  // }

  // useEffect(()=>{
  //   setDomIdx(props.blockElemIdx);
  // });
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
   0  1 2 3 4 5
   1  5 6 7 8 9
   2  8 9 _ 1 2
   3  1 2 3 4 5
   4  4 5 6 7 8
  */

  const lth = props.data && props.data.cities.length || 0;

  return <div className="citiesList" style={{transform:`translate3d(${props.posX}px, ${props.posY}px, 0px)`}}>
    {
      new Array(startIdx.length).fill(0).map((value, yIdx)=>{
        return new Array(5).fill(0).map((value, xIdx)=>{
          return <CityBlock 
            key={yIdx*5 + xIdx}
            active={props.blockElemIdx === yIdx*5 + xIdx}
            blockIdx={(startIdx[yIdx] + ((col[xIdx]%lth)+lth)%lth)%lth}
            activeCenterClass={xIdx === ((currentColIdx%col.length)+col.length)%col.length && yIdx === ((currentRowIdx%row.length)+row.length)%row.length ? true : false}
            offsetX={col[xIdx] * blockWidth} 
            offsetY={row[yIdx] * blockHeight}
            color={xIdx === ((currentColIdx%col.length)+col.length)%col.length || yIdx === ((currentRowIdx%row.length)+row.length)%row.length?'red':''}
            data={props.data}
            onClickBlock={(e)=>{props.onClickBlock(yIdx*5 + xIdx, xIdx, yIdx)}}
          />
        })
      })
    }
  </div>
}



const G02BContainer = (props) => {
  const [dragging, setDragging] = useState(false);
  const goCenterFunc = useRef(null);
  const moveToClickedBlockFunc = useRef(null);
  const getDisableDragFunc = useRef(null);
  const detailsPageElem = useRef(null);

  // const [domIdx, setDomIdx] = useState(null);
  const blockWidth = window.innerWidth / 3.1;
  const blockHeight = blockWidth;
  // const [status, setStatus] = useState(G02BStatus.IDLE);
  const [contentData, setContentData] = useState(null);
  const [isHome, setIsHome] = useState(true);
  const [disableDrag, setDisableDrag] = useState(true);
  // const [isShowHints, setIsShowHints] = useState(false);
  // const [isShowExplore, setIsShowExplore] = useState(false);
  const [currentColIdx, setCurrentColIdx] = useState(2);
  const [currentRowIdx, setCurrentRowIdx] = useState(2);
  const [easeElemPos, setEaseElemPos] = useState({
    x: -blockWidth*4/2 + window.innerWidth/2 - blockWidth/2,// + blockWidth*.015,
    y: -blockHeight*4/2 + window.innerHeight/2 - blockHeight/2//+ blockHeight*.015
  });
  const [blockElemIdx, setBlockElemIdx] = useState(null);
  // let hintsElem = [];
 
  

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
      x: easeElemPos.x, 
      y: easeElemPos.y
    };
    const elemPos = {
      x: initalPos.x,
      y: initalPos.y
    }
    // const easeElemPos = {x:initalPos.x,y:initalPos.y};
    let player = null;
    let isDragDisabled = false;
    // const offset = 0;//blockWidth*.015;


    const onMouseDown = (event) => {
      if(!isDragDisabled){
        setDragging(false);
        let e = (event.touches? event.touches[0]: event);
        const mx = e.clientX;
        const my = e.clientY;

        mouse.startPos = {x:mx, y:my};
        mouse.lastPos = {x:0, y:0};
        
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);
      }
    }

    const onMouseMove = (event) => {
      setDragging(true);
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
      // setDragging(false);
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
      if(!isDragDisabled){
        elemPos.x = -x + window.innerWidth/2 - blockWidth/2;
        elemPos.y = -y + window.innerHeight/2 - blockHeight/2;
      }
    }
    moveToClickedBlockFunc.current = {moveToClickedBlock}


    const getDisableDrag = (d) => {
      isDragDisabled = d;
    }
    getDisableDragFunc.current = {getDisableDrag};


    const loop = ()=>{
      player = requestAnimationFrame(loop);

      setEaseElemPos({
        x:easeElemPos.x += (elemPos.x - easeElemPos.x) * .1,
        y:easeElemPos.y += (elemPos.y - easeElemPos.y) * .1
      });

      setCurrentColIdx(-Math.floor((easeElemPos.x-blockWidth/2) / blockWidth));
      setCurrentRowIdx(-Math.floor(((easeElemPos.y+blockHeight/8) / blockHeight)));
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


  useEffect(()=>{
    getDisableDragFunc.current.getDisableDrag(disableDrag);
  },[disableDrag]);
  

  const backToHome = () => {
    goCenterFunc.current.goCenter(currentColIdx,currentRowIdx);
    setIsHome(true);
    setDisableDrag(true);
    // setIsShowHints(false);
  }
  
  const showHints = () => {
    // const tl = gsap.timeline();
    // setIsShowHints(false);

    // hintsElem.map((elem, idx) => {
      gsap.to(['#drag', '#homeBtn'],.3,{autoAlpha:1, ease:'power1.inOut'});
      // if(idx === hintsElem.length-1)
      //   tl.to(elem,.3,{autoAlpha:0,ease:'Power1.easeInOut',onComplete:()=>{setIsShowHints(true);}},'+=1');
      // else
      //   tl.to(elem,.3,{autoAlpha:0,ease:'Power1.easeInOut'},'+=1');
    // });
  }
  
  const closeContent = () => {
    // setIsShowExplore(false);
    setBlockElemIdx(null);
    detailsPageElem.current.className = '';
  }
  
  const onClickBlock = (domIdx, c, r) =>{
    if(!dragging && !isHome){
      setDisableDrag(true);
      setBlockElemIdx(domIdx);
      moveToClickedBlockFunc.current.moveToClickedBlock(col[c] * blockWidth, row[r] * blockHeight);
      const elem = document.querySelector(`.cityBlock:nth-child(${domIdx+1})`);
      const delay = Math.abs((elem.getBoundingClientRect().left + (blockWidth/2) - (window.innerWidth/2)) / (window.innerWidth/1.1)) + Math.abs((elem.getBoundingClientRect().top + (blockWidth/2) - (window.innerHeight/2)) / (window.innerWidth));
      // console.log(elem.getBoundingClientRect().left + (blockWidth/2) - window.innerWidth/2)
      gsap.to(['#drag'],.3,{autoAlpha:0, ease:'power1.inOut'});
      gsap.to(['#exploreBtn'],.3,{autoAlpha:1, ease:'power1.inOut'});
      gsap.fromTo('#detailsPage #bg', .3, {autoAlpha:0}, {delay:delay, autoAlpha:1, ease:'power1.inOut'});
      gsap.fromTo('#detailsPage #bg', 1.3, {scale:.8}, {force3D:true, delay:delay, scale:3.6, ease:'power4.inOut'});
      detailsPageElem.current.className = 'active';
    }
  }

  const onChangeLang = (lang) =>{
    setIsHome(false);
    setDisableDrag(false);
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
            props.appData && props.appData.languages.map((value,index) => 
              <div key={index} onClick={()=>onChangeLang(value.locale)}>{value.display}</div>
            )
          }
        </div>
      </div>
      <div id="drag" dangerouslySetInnerHTML={{__html:props.appData && contentData && contentData.ui.dragHints}}></div>
      {/* <div id="hints"> */}
        {/* <div ref={(e)=> hintsElem.push(e)}>{props.appData && contentData && contentData.ui.clickHints}</div> */}
      {/* </div> */}
      {/* <div id="hintsBtn" className={`btn${isShowHints?'':' hide'}`} onClick={()=>{showHints()}}>?</div> */}
      <div id="exploreBtn" onClick={closeContent}><span>{props.appData && contentData && contentData.ui.exploreHints}</span></div>
      <div id="homeBtn" className="btn" onClick={backToHome}></div>
      <CitiesList 
        data={contentData}
        posX={easeElemPos.x}
        posY={easeElemPos.y}
        currentColIdx={currentColIdx}
        currentRowIdx={currentRowIdx}
        blockElemIdx={blockElemIdx}
        onClickBlock={onClickBlock}
      />

      <div ref={detailsPageElem} id="detailsPage">
        <div>{props.data && props.data.cities[blockElemIdx%10].name}</div>
        {currentColIdx+currentRowIdx}
        <div id="bg"></div>
      </div>

      {/* <CityDetailsContainer /> */}
      {/* <LanguageSelection /> */}
    </div>
  );
}

export default G02BContainer;