import React, {useEffect, useState, useRef, createRef} from 'react';
import './style.scss';
import gsap from 'gsap';

import Content from './Content';

const G302A = props => {
    const [contentData, setContentData] = useState(null);
    const [sectionIdx, setSectionIdx] = useState(null);
    const [dragging, setDragging] = useState(false);

    const sectionWrapElem = useRef(null);
    const sectionElems = useRef([...Array(5)].map(()=>createRef()));
    const sectionTextElems = useRef([...Array(5)].map(()=>createRef()));
    const sectionImgElems = useRef([...Array(5)].map(()=>createRef()));
    const nextSectionFunc = useRef(null);
    const prevSectionFunc = useRef(null);
    const setIsClickedSectionFunc = useRef(null);
    const getIsClickedSectionFunc = useRef(null);
    const getCurrentSectionFunc = useRef(null);


    useEffect(()=>{
        let currentSection = 0;
        let isClickedSection = false;
        const sectionWrapElemPos = {x:0};
        const sectionWrapElemEasePos = {x:0};
        const sectionElemEaseScale = [...Array(5).fill(1)];
        let maxWidth = sectionWrapElem.current.offsetWidth - window.innerWidth;
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
            sectionWrapElemPos.x = -currentSection * (window.innerWidth/2);
        }

        const nextSection = () => {
            currentSection = Math.min(5-1, ++currentSection);
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

            sectionWrapElemEasePos.x += (sectionWrapElemPos.x - sectionWrapElemEasePos.x) * .1;
            const x = sectionWrapElemEasePos.x / maxWidth * 66.666;
            sectionWrapElem.current.style.transform = `translate3d(${x}%,0,0)`;

            for(let i=0; i<5; i++){
                const section = sectionElems.current[i].current;
                const text = sectionTextElems.current[i].current;
                const img = sectionImgElems.current[i].current;
                const offsetLeft = (i * (window.innerWidth/2) + sectionWrapElemPos.x);
                const scale = 1-Math.abs(offsetLeft * .3 / (window.innerWidth));
                const textX = offsetLeft * .7 / (window.innerWidth);
                const textS = 1-Math.abs(offsetLeft * .2 / (window.innerWidth));
                const textO = 1-Math.abs(offsetLeft * 2 / (window.innerWidth));
                const imgX = offsetLeft * .2 / (window.innerWidth);
                
                // update section idx
                if(offsetLeft + window.innerWidth/2 > window.innerWidth/4 && offsetLeft + window.innerWidth/2 < window.innerWidth/1.333){
                    currentSection = i;
                }
                
                sectionElemEaseScale[i] += (scale - sectionElemEaseScale[i]) * .1;
                section.style.transform = `translate3d(-50%,-50%,0) scale(${sectionElemEaseScale[i]})`;

                text.style.transform = `translate3d(${textX * 100}%,0,0) scale(${textS})`;
                text.style.opacity = textO;

                img.style.transform = `translate3d(${imgX * 100}%,0,0) scale(0.8)`;
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
            maxWidth = sectionWrapElem.current.offsetWidth - window.innerWidth;
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
            setSectionIdx(i);
            setIsClickedSectionFunc.current.setIsClickedSection(true);

            gsap.set('#sidebarWrap', {delay:.98, className:'active disable'});
            gsap.set('#sidebarWrap', {delay:1, className:'active'});
            gsap.set('#contentWrap', {delay:1, className:'active'});
            gsap.set(sectionWrapElem.current, {delay:1, className:'hide'});
            // const tl = gsap.timeline({delay:.6});
            // tl.to(`.section:nth-child(${i+1}) #wrap`, 1, {width: 455 / 1920 * 100 + 'vw', ease:'power4.inOut'},'s');
            // tl.to(`.section:nth-child(${i+1}) .img`, .3, {autoAlpha:0, ease:'power1.inOut'},'s');
        }
    }

    const content = {
        'text1' : '政府推出「十年建屋計劃」， 大量興建公共房屋及發展新市鎮，並持續擴展運輸網絡，1979年地下鐵路投入服務，標誌着集體運輸系統的開始。'
    }

    return(
        <div id="home">
            <div ref={sectionWrapElem} id="sectionWrap">
                <div ref={sectionElems.current[0]} id="section1" className={`section${sectionIdx === 0 ? ' active' : ''}`} onClick={()=>onClickSection(0)}>
                    <div id="wrap">
                        <p ref={sectionTextElems.current[0]}>
                            {
                                content.text1.split('').map((v, i)=>{
                                    return <span key={i}><span>{v}</span></span>
                                })
                            }
                        </p>
                        <div ref={sectionImgElems.current[0]} className="img"></div>
                    </div>
                </div>
                <div ref={sectionElems.current[1]} id="section2" className={`section ${sectionIdx === 1 ? ' active' : ''}`} onClick={()=>onClickSection(1)}>
                    <div id="wrap">
                        <p ref={sectionTextElems.current[1]}>
                            {
                                content.text1.split('').map((v, i)=>{
                                    return <span key={i}><span>{v}</span></span>
                                })
                            }
                        </p>
                        <div ref={sectionImgElems.current[1]} className="img"></div>
                    </div>
                </div>
                <div ref={sectionElems.current[2]} id="section3" className={`section ${sectionIdx === 2 ? ' active' : ''}`} onClick={()=>onClickSection(2)}>
                    <div id="wrap">
                        <p ref={sectionTextElems.current[2]}>
                            {
                                content.text1.split('').map((v, i)=>{
                                    return <span key={i}><span>{v}</span></span>
                                })
                            }
                        </p>
                        <div ref={sectionImgElems.current[2]} className="img"></div>
                    </div>
                </div>
                <div ref={sectionElems.current[3]} id="section4" className={`section ${sectionIdx === 3 ? ' active' : ''}`} onClick={()=>onClickSection(3)}>
                    <div id="wrap">
                        <p ref={sectionTextElems.current[3]}>
                            {
                                content.text1.split('').map((v, i)=>{
                                    return <span key={i}><span>{v}</span></span>
                                })
                            }
                        </p>
                        <div ref={sectionImgElems.current[3]} className="img"></div>
                    </div>
                </div>
                <div ref={sectionElems.current[4]} id="section5" className={`section ${sectionIdx === 4 ? ' active' : ''}`} onClick={()=>onClickSection(4)}>
                    <div id="wrap">
                        <p ref={sectionTextElems.current[4]}>
                            {
                                content.text1.split('').map((v, i)=>{
                                    return <span key={i}><span>{v}</span></span>
                                })
                            }
                        </p>
                        <div ref={sectionImgElems.current[4]} className="img"></div>
                    </div>
                </div>
            </div>
            <Content 
                sectionIdx={sectionIdx}
                isClickedSection={getIsClickedSectionFunc.current && getIsClickedSectionFunc.current.getIsClickedSection()}
            ></Content>
        </div>
    )
}

export default G302A;