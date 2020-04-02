import React, {useEffect, useState, useRef, createRef} from 'react';
import './style.scss';

const G302A = props => {
    const [contentData, setContentData] = useState(null);
    const [sectionIdx, setSectionIdx] = useState(null);
    const [dragging, setDragging] = useState(false);

    const sectionWrapElem = useRef(null);
    const sectionElems = useRef([...Array(5)].map(()=>createRef()));
    const nextSectionFunc = useRef(null);
    const prevSectionFunc = useRef(null);

    useEffect(()=>{
        let currentSection = 0;
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

        const animLoop = () => {
            requestAnimationFrame(animLoop);

            sectionWrapElemEasePos.x += (sectionWrapElemPos.x - sectionWrapElemEasePos.x) * .1;
            const x = sectionWrapElemEasePos.x / maxWidth * 66.666;
            sectionWrapElem.current.style.transform = `translate3d(${x}%,0,0)`;

            for(let i=0; i<5; i++){
                const section = sectionElems.current[i].current;
                const offsetLeft = (i * (window.innerWidth/2) + sectionWrapElemPos.x);
                const scale = 1-Math.abs(offsetLeft * .4 / (window.innerWidth));

                sectionElemEaseScale[i] += (scale - sectionElemEaseScale[i]) * .1;
                section.style.transform = `translate3d(-50%,-50%,0) scale(${sectionElemEaseScale[i]})`;
                
                // update section idx
                if(offsetLeft + window.innerWidth/2 > window.innerWidth/4 && offsetLeft + window.innerWidth/2 < window.innerWidth/1.333){
                    currentSection = i;
                }
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
        if(!dragging)
            setSectionIdx(i);
    }

    return(
        <div id="home">
            <div ref={sectionWrapElem} id="sectionWrap">
                <div id="sectionInnerWrap">
                    <div ref={sectionElems.current[0]} id="section1" className={`section${sectionIdx === 0 ? ' active' : ''}`} onClick={()=>onClickSection(0)}>
                        <div id="wrap">
                            <div></div>
                        </div>
                    </div>
                    <div ref={sectionElems.current[1]} id="section2" className={`section ${sectionIdx === 1 ? ' active' : ''}`} onClick={()=>onClickSection(1)}>
                        <div id="wrap">
                            <div></div>
                        </div>
                    </div>
                    <div ref={sectionElems.current[2]} id="section3" className={`section ${sectionIdx === 2 ? ' active' : ''}`} onClick={()=>onClickSection(2)}>
                        <div id="wrap">
                            <div></div>
                        </div>
                    </div>
                    <div ref={sectionElems.current[3]} id="section4" className={`section ${sectionIdx === 3 ? ' active' : ''}`} onClick={()=>onClickSection(3)}>
                        <div id="wrap">
                            <div></div>
                        </div>
                    </div>
                    <div ref={sectionElems.current[4]} id="section5" className={`section ${sectionIdx === 4 ? ' active' : ''}`} onClick={()=>onClickSection(4)}>
                        <div id="wrap">
                            <div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default G302A;