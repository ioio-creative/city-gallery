import React, {useEffect, useState, useRef, createRef} from 'react';
import './style.scss';
import gsap from 'gsap';

import img1 from './images/img.png';

const Content = props => {
    // const [dragging, setDragging] = useState(false);
    const [minimalSidebar, setMinimalSidebar] = useState(false);
    // const [contentIdx, setContentIdx] = useState(null);
    
    const setIsClickedSectionFunc = useRef(null);
    const moveContentFunc = useRef(null);
    const contentWrapElem = useRef(null);
    const contentElems = useRef([...Array(5)].map(()=>createRef()));
    const sidebarElems = useRef([...Array(5)].map(()=>createRef()));
    const imgElems = useRef([...Array(3)].map(()=>createRef()));

    
    useEffect(()=>{
        // let currentContent = 0;
        let isClickedSection = false;
        const contentWrapElemPos = {x:0};
        const contentWrapElemEasePos = {x:0};
        // const contentElemEaseScale = [...Array(5).fill(1)];
        let maxWidth = contentWrapElem.current.offsetWidth - window.innerWidth;
        const mouse = {
            currentPos: {x:0, y:0},
            startPos: {x:0, y:0},
            lastPos: {x:0, y:0},
            delta: {x:0, y:0}
        }

        let sidebarW = window.innerWidth * (455 / 1920);

        const onMouseDown = (event) => {
            if(isClickedSection){
                if(!event.touches) event.preventDefault();
                let e = (event.touches? event.touches[0]: event);
                mouse.startPos = {x:e.clientX, y:e.clientY};
                mouse.lastPos = {x:0, y:0};
                
                // setDragging(false);

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

            setMinimalSidebar(true);
            moveContentWrap();
        }

        const onMouseUp = () => {
            // moveSection();
            document.removeEventListener("mousemove", onMouseMove, false);
            document.removeEventListener("touchmove", onMouseMove, false);
            document.removeEventListener('mouseup', onMouseUp, false);
            document.removeEventListener('touchend', onMouseUp, false);
        }

        const setIsClickedSection = (bool) => {
            isClickedSection = bool;
        }
        setIsClickedSectionFunc.current = {setIsClickedSection}
        
        const moveContentWrap = () => {
            contentWrapElemPos.x += mouse.delta.x;
            contentWrapElemPos.x = Math.min(0, Math.max(-maxWidth, contentWrapElemPos.x));
        }

        const moveContent = (i) => {
            contentWrapElemPos.x = -contentElems.current[i].current.offsetLeft;
            contentWrapElemEasePos.x = contentWrapElemPos.x;
        }
        moveContentFunc.current = {moveContent}
        
        const animLoop = () => {
            requestAnimationFrame(animLoop);

            contentWrapElemEasePos.x += (contentWrapElemPos.x - contentWrapElemEasePos.x) * .1;
            const x = contentWrapElemEasePos.x;
            contentWrapElem.current.style.transform = `translate3d(${x}px,0,0)`;

            for(let i=0; i<sidebarElems.current.length; i++){
                const content = contentElems.current[i].current;
                const sidebar = sidebarElems.current[i].current;

                const offsetX = content.getBoundingClientRect().left;
                let sx = Math.max(0, offsetX);
                if(offsetX - sidebarW <= -content.offsetWidth){
                    sx = Math.max(-sidebarW, offsetX+content.offsetWidth-sidebarW);
                    // console.log(offsetX+content.offsetWidth-sidebarW);
                }
                sidebar.style.transform = `translate3d(${sx}px,0,0)`;
            }

            for(let i=0; i<imgElems.current.length; i++){
                const img = imgElems.current[i].current;
                const imgX = -(img.getBoundingClientRect().left - sidebarW) * .06;
                console.log(imgX);
                img.querySelector('img').style.transform = `translate3d(${imgX}px,0,0) scale(1.2)`;
            }
        };
        
        const onKeyDown = (e) => {
            switch(e.code){
                case "ArrowLeft":
                    // prevSection();
                    break;

                case "ArrowRight":
                    // nextSection();
                    break;

                default:
                    break;
            }
        }

        const onResize = () => {
            sidebarW = window.innerWidth * (455 / 1920);
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

    useEffect(()=>{
        if(props.sectionIdx !== null){
            const elem = sidebarElems.current[props.sectionIdx].current;

            const tl = gsap.timeline({delay:1});
            
            tl.set('#sidebarWrap', {className:'active'});
            tl.set('#sectionWrap', {className:'hide'});
            tl.set(contentWrapElem.current, {className:'active'});
            tl.fromTo(elem.querySelectorAll('#des span span'), 1, {force3D:true, y:'100%'}, {y:'0%', stagger:.01, ease:'power4.out'},'s');
            tl.fromTo(elem.querySelectorAll('#date span'), 1, {force3D:true, y:'100%'}, { y:'0%', stagger:.1, ease:'power4.out'},'b-=.6');
            tl.fromTo(elem.querySelectorAll('#line'), 1, {force3D:true, scaleX:0}, {scaleX:1, ease:'power3.inOut'},'s+=.6');

            moveContentFunc.current.moveContent(props.sectionIdx);
        }
    },[props.sectionIdx])

    useEffect(()=>{
        if(props.isClickedSection !== null){
            setIsClickedSectionFunc.current.setIsClickedSection(props.isClickedSection);
        }
    },[props.isClickedSection])

    
    const content = {
        'text1' : '政府推出「十年建屋計劃」， 大量興建公共房屋及發展新市鎮，並持續擴展運輸網絡，1979年地下鐵路投入服務，標誌着集體運輸系統的開始。'
    }

    return (
        <>
            <div id="sidebarWrap">
                <div ref={sidebarElems.current[0]} id="sidebar1" className={`sidebar${props.sectionIdx === 0 && !minimalSidebar ? ' active' : ''}`}>
                    <div id="des">
                        {
                            content.text1.split('').map((v, i)=>{
                                return <span key={i}><span>{v}</span></span>
                            })
                        }
                    </div>
                    <div id="date"><span>1960</span><span>-</span><span>1979</span></div>
                    <div id="line"></div>
                    <div id="img"></div>
                </div>
                <div ref={sidebarElems.current[1]} id="sidebar2" className={`sidebar${props.sectionIdx === 1 && !minimalSidebar ? ' active' : ''}`}>
                    <div id="des">
                        {
                            content.text1.split('').map((v, i)=>{
                                return <span key={i}><span>{v}</span></span>
                            })
                        }
                    </div>
                    <div id="date"><span>1960</span><span>-</span><span>1979</span></div>
                    <div id="line"></div>
                    <div id="img"></div>
                </div>
                
                <div ref={sidebarElems.current[2]} id="sidebar3" className={`sidebar${props.sectionIdx === 2 && !minimalSidebar ? ' active' : ''}`}>
                    <div id="des">
                        {
                            content.text1.split('').map((v, i)=>{
                                return <span key={i}><span>{v}</span></span>
                            })
                        }
                    </div>
                    <div id="date"><span>1960</span><span>-</span><span>1979</span></div>
                    <div id="line"></div>
                    <div id="img"></div>
                </div>
                
                <div ref={sidebarElems.current[3]} id="sidebar4" className={`sidebar${props.sectionIdx === 3 && !minimalSidebar ? ' active' : ''}`}>
                    <div id="des">
                        {
                            content.text1.split('').map((v, i)=>{
                                return <span key={i}><span>{v}</span></span>
                            })
                        }
                    </div>
                    <div id="date"><span>1960</span><span>-</span><span>1979</span></div>
                    <div id="line"></div>
                    <div id="img"></div>
                </div>
                
                <div ref={sidebarElems.current[4]} id="sidebar5" className={`sidebar${props.sectionIdx === 4 && !minimalSidebar ? ' active' : ''}`}>
                    <div id="des">
                        {
                            content.text1.split('').map((v, i)=>{
                                return <span key={i}><span>{v}</span></span>
                            })
                        }
                    </div>
                    <div id="date"><span>1960</span><span>-</span><span>1979</span></div>
                    <div id="line"></div>
                    <div id="img"></div>
                </div>
            </div>
            <div ref={contentWrapElem} id="contentWrap">
                <div ref={contentElems.current[0]} id="content1" className="content">
                    <div className="item">
                        section1 - 1
                        <div ref={imgElems.current[0]} className="imgWrap"><img src={img1} /></div>
                    </div>
                    <div className="item">
                        section1 - 2
                        <div ref={imgElems.current[1]} className="imgWrap"><img src={img1} /></div>
                    </div>
                    <div className="item">
                        section1 - 3
                        <div ref={imgElems.current[2]} className="imgWrap"><img src={img1} /></div>
                    </div>
                </div>
                <div ref={contentElems.current[1]} id="content2" className="content">
                    <div className="item">section2 - 1</div>
                    <div className="item">section2 - 2</div>
                </div>
                <div ref={contentElems.current[2]} id="content3" className="content">
                    <div className="item">section3 - 1</div>
                    <div className="item">section3 - 2</div>
                </div>
                <div ref={contentElems.current[3]} id="content4" className="content">
                    <div className="item">section4 - 1</div>
                    <div className="item">section4 - 2</div>
                </div>
                <div ref={contentElems.current[4]} id="content5" className="content">
                    <div className="item">section5 - 1</div>
                    <div className="item">section5 - 2</div>
                </div>
            </div>
        </>
    )
}

export default Content;