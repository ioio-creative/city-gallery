import React, {useEffect, useState, useRef, createRef} from 'react';
import './style.scss';
import gsap from 'gsap';

import Content from './Content';

const G302A = props => {
    const [contentData, setContentData] = useState(null);
    const [clickedSectionIdx, setClickedSectionIdx] = useState(null);
    const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
    const [dragging, setDragging] = useState(false);

    const sectionNum = 5;
    const sectionWrapElem = useRef(null);
    const sectionElems = useRef([...Array(sectionNum)].map(()=>createRef()));
    const sectionTextElems = useRef([...Array(sectionNum)].map(()=>createRef()));
    const sectionImgElems = useRef([...Array(sectionNum)].map(()=>createRef()));
    const nextSectionFunc = useRef(null);
    const prevSectionFunc = useRef(null);
    const setIsClickedSectionFunc = useRef(null);
    const getIsClickedSectionFunc = useRef(null);
    const getCurrentSectionFunc = useRef(null);


    useEffect(()=>{
        let ww = window.innerWidth;
        let currentSection = 0;
        let oldSection = 0;
        let isClickedSection = false;
        const sectionWrapElemPos = {x:0};
        const sectionWrapElemEasePos = {x:0};
        const sectionWrapElemEase2Pos = {x:0};
        const sectionElemEaseScale = [...Array(sectionNum).fill(1)];
        const textElemEaseX = [...Array(sectionNum).fill(0)];
        const textElemEaseScale = [...Array(sectionNum).fill(1)];
        const textElemEaseOpacity = [...Array(sectionNum).fill(0)];
        const imageElemEaseX = [...Array(sectionNum).fill(0)];
        const imageElemEaseScale = [...Array(sectionNum).fill(1)];
        let maxWidth = sectionWrapElem.current.offsetWidth - ww;
        const mouse = {
            currentPos: {x:0, y:0},
            startPos: {x:0, y:0},
            lastPos: {x:0, y:0},
            delta: {x:0, y:0}
        }
        
        const onMouseDown = (event) => {
            if(!isClickedSection){
                if(!event.touches) event.preventDefault();
                let e = (event.touches? event.touches[0]: event);
                mouse.startPos = {x:e.clientX, y:e.clientY};
                mouse.lastPos = {x:0, y:0};
                
                setDragging(false);

                document.addEventListener("mousemove", onMouseMove, false);
                document.addEventListener("touchmove", onMouseMove, false);
                document.addEventListener("mouseup", onMouseUp, false);
                document.addEventListener("touchend", onMouseUp, false);
            }
        }

        const onMouseMove = (event) => {
            if(!event.touches) event.preventDefault();
            let e = (event.touches? event.touches[0]: event);

            mouse.currentPos.x = e.clientX - mouse.startPos.x;
            mouse.currentPos.y = e.clientY - mouse.startPos.y;

            mouse.delta.x = mouse.currentPos.x - mouse.lastPos.x;
            mouse.delta.y = mouse.currentPos.y - mouse.lastPos.y;

            mouse.lastPos.x = mouse.currentPos.x;
            mouse.lastPos.y = mouse.currentPos.y;

            setDragging(true);
            moveSectionWrap();
        }

        const onMouseUp = () => {
            moveSection();
            document.removeEventListener("mousemove", onMouseMove, false);
            document.removeEventListener("touchmove", onMouseMove, false);
            document.removeEventListener('mouseup', onMouseUp, false);
            document.removeEventListener('touchend', onMouseUp, false);
        }

        const setIsClickedSection = (bool) => {
            isClickedSection = bool;
        }
        setIsClickedSectionFunc.current = {setIsClickedSection};

        const getIsClickedSection = () => {
            return isClickedSection;
        }
        getIsClickedSectionFunc.current = {getIsClickedSection};

        const moveSectionWrap = () => {
            sectionWrapElemPos.x += mouse.delta.x;
            sectionWrapElemPos.x = Math.min(0, Math.max(-maxWidth, sectionWrapElemPos.x));
        }

        const moveSection = () => {
            sectionWrapElemPos.x = -currentSection * (ww/2);
            setCurrentSectionIdx(currentSection);

            if(oldSection !== currentSection){
                const tl = gsap.timeline();
                tl.set('#sectionNav #line span', {force3D:true, x: oldSection * 100 +'%', scaleX:0, overwrite:true});
                tl.to('#sectionNav #line span', .3, {scaleX:currentSection-oldSection, ease:'power4.out'}, 's');
                tl.set('#sectionNav #line span ', {x: currentSection * 100 +'%', scaleX:-(currentSection-oldSection)},'b');
                tl.to('#sectionNav #line span', .4, {scaleX:0, ease:'power4.out'},'b');
            }

            oldSection = currentSection;
        }

        const nextSection = () => {
            currentSection = Math.min(sectionNum-1, ++currentSection);
            moveSection();
        }
        nextSectionFunc.current = {nextSection};

        const prevSection = () => {
            currentSection = Math.max(0, --currentSection);
            moveSection();
        }
        prevSectionFunc.current = {prevSection};

        const getCurrentSection = () => {
            return currentSection;
        }
        getCurrentSectionFunc.current = {getCurrentSection};

        const animLoop = () => {
            requestAnimationFrame(animLoop);

            sectionWrapElemEase2Pos.x += (sectionWrapElemPos.x - sectionWrapElemEase2Pos.x) * .2;
            sectionWrapElemEasePos.x += (sectionWrapElemEase2Pos.x - sectionWrapElemEasePos.x) * .1;
            const x = sectionWrapElemEasePos.x / maxWidth * (ww / 2 / sectionWrapElem.current.offsetWidth * 100 * (sectionNum-1) );
            sectionWrapElem.current.style.transform = `translate3d(${x}%,0,0)`;

            for(let i=0; i<sectionNum; i++){
                const section = sectionElems.current[i].current;
                const text = sectionTextElems.current[i].current;
                const img = sectionImgElems.current[i].current;
                const offsetLeft = (i * (ww/2) + sectionWrapElemPos.x);
                const scale = 1-Math.abs(offsetLeft * .3 / (ww));
                const textX = offsetLeft * .7 / (ww);
                const textS = 1-Math.abs(offsetLeft * .2 / (ww));
                const textO = 1-Math.abs(offsetLeft * 2 / (ww));
                const imgX = offsetLeft * 1 / (ww);
                const imgS = 1-Math.abs(offsetLeft * .2 / (ww));
                
                // console.log(i)
                // update section idx
                const center = (offsetLeft + ww/2);
                if(center > ww/5 && center < ww/1.25){
                    currentSection = i;
                }
                
                sectionElemEaseScale[i] += (scale - sectionElemEaseScale[i]) * .1;
                section.style.transform = `translate3d(-50%,-50%,0) scale(${sectionElemEaseScale[i]})`;

                textElemEaseX[i] += (textX - textElemEaseX[i]) * .1;
                textElemEaseScale[i] += (textS - textElemEaseScale[i]) * .1;
                textElemEaseOpacity[i] += (textO - textElemEaseOpacity[i]) * .1;
                text.style.transform = `translate3d(${textElemEaseX[i] * 100}%,0,0) scale(${textElemEaseScale[i]})`;
                text.style.opacity = textElemEaseOpacity[i];

                imageElemEaseX[i] += (imgX - imageElemEaseX[i]) * .1;
                imageElemEaseScale[i] += (imgS - imageElemEaseScale[i]) * .1;
                img.style.transform = `translate3d(${imageElemEaseX[i] * 100}%,0,0) scale(${imageElemEaseScale[i]})`;
            }
        }
        
        const onKeyDown = (e) => {
            switch(e.code){
                case "ArrowLeft":
                    prevSection();
                    break;

                case "ArrowRight":
                    nextSection();
                    break;

                default:
                    break;
            }
        }

        const onResize = () => {
            ww = window.innerWidth;
            maxWidth = sectionWrapElem.current.offsetWidth - ww;
        }

        const addEvent = () => {
            document.addEventListener("mousedown", onMouseDown, false);
            document.addEventListener("touchstart", onMouseDown, false);
            document.addEventListener("keydown", onKeyDown, false);
            window.addEventListener("resize", onResize, false);
        }

        const removeEvent = () => {
            document.removeEventListener("mousedown", onMouseDown, false);
            document.removeEventListener("touchstart", onMouseDown, false);
            document.removeEventListener("keydown", onKeyDown, false);
            window.removeEventListener("resize", onResize, false);
        }

        animLoop();
        addEvent();
        return () => {
            removeEvent();
        }
    },[]);

    useEffect(() => {
        if(props.appData){
          setContentData(props.appData.contents['zh']);
        }
    }, [props.appData]);

    const onClickSection = (i) => {
        if(!dragging && !getIsClickedSectionFunc.current.getIsClickedSection() && i === getCurrentSectionFunc.current.getCurrentSection()){
            setClickedSectionIdx(i);
            setIsClickedSectionFunc.current.setIsClickedSection(true);
        }
    }

    const content = {
        'text1' : '政府推出「十年建屋計劃」， 大量興建公共房屋及發展新市鎮，並持續擴展運輸網絡，1979年地下鐵路投入服務，標誌着集體運輸系統的開始。'
    }

    return(
        <div id="home">
            <div id="sectionNav" className={`${clickedSectionIdx !== null ? 'hide' : ''}`}>
                <ul>
                    {
                        [...Array(sectionNum).fill(null)].map((v, i)=>{
                            return <li key={i} className={`${currentSectionIdx === i ? 'active' : ''}`}><span>1960-1979</span></li>
                        })
                    }
                </ul>
                <div id="line"><span></span></div>
            </div>
            <div ref={sectionWrapElem} id="sectionWrap">
                {
                    [...Array(sectionNum).fill(null)].map((v, i)=>{
                        return <div key={i} ref={sectionElems.current[i]} id={`section${i+1}`} className={`section${clickedSectionIdx === i ? ' active' : ''}`} onClick={()=>onClickSection(i)}>
                            <div id="wrap">
                                <p ref={sectionTextElems.current[i]}>
                                    <span>{content.text1}</span>
                                </p>
                                <div ref={sectionImgElems.current[i]} className="img"></div>
                            </div>
                        </div>
                    })
                }
                {/* <div ref={sectionElems.current[0]} id="section1" className={`section${clickedSectionIdx === 0 ? ' active' : ''}`} onClick={()=>onClickSection(0)}>
                    <div id="wrap">
                        <p ref={sectionTextElems.current[0]}>
                            <span>{content.text1}</span>
                        </p>
                        <div ref={sectionImgElems.current[0]} className="img"></div>
                    </div>
                </div>
                <div ref={sectionElems.current[1]} id="section2" className={`section ${clickedSectionIdx === 1 ? ' active' : ''}`} onClick={()=>onClickSection(1)}>
                    <div id="wrap">
                        <p ref={sectionTextElems.current[1]}>
                            <span>{content.text1}</span>
                        </p>
                        <div ref={sectionImgElems.current[1]} className="img"></div>
                    </div>
                </div>
                <div ref={sectionElems.current[2]} id="section3" className={`section ${clickedSectionIdx === 2 ? ' active' : ''}`} onClick={()=>onClickSection(2)}>
                    <div id="wrap">
                        <p ref={sectionTextElems.current[2]}>
                            <span>{content.text1}</span>
                        </p>
                        <div ref={sectionImgElems.current[2]} className="img"></div>
                    </div>
                </div>
                <div ref={sectionElems.current[3]} id="section4" className={`section ${clickedSectionIdx === 3 ? ' active' : ''}`} onClick={()=>onClickSection(3)}>
                    <div id="wrap">
                        <p ref={sectionTextElems.current[3]}>
                            <span>{content.text1}</span>
                        </p>
                        <div ref={sectionImgElems.current[3]} className="img"></div>
                    </div>
                </div> */}
                {/* <div ref={sectionElems.current[4]} id="section5" className={`section ${clickedSectionIdx === 4 ? ' active' : ''}`} onClick={()=>onClickSection(4)}>
                    <div id="wrap">
                        <p ref={sectionTextElems.current[4]}>
                            <span>{content.text1}</span>
                        </p>
                        <div ref={sectionImgElems.current[4]} className="img"></div>
                    </div>
                </div> */}
            </div>
            <Content 
                clickedSectionIdx={clickedSectionIdx}
                isClickedSection={getIsClickedSectionFunc.current && getIsClickedSectionFunc.current.getIsClickedSection()}
            ></Content>
        </div>
    )
}

export default G302A;