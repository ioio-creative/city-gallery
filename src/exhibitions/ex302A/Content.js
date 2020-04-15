import React, {useEffect, useState, useRef, createRef} from 'react';
import './style.scss';
import gsap from 'gsap';

// import img1 from './images/img.png';

const Content = props => {
    // const [dragging, setDragging] = useState(false);
    const [minimalSidebar, setMinimalSidebar] = useState(false);
    const [minimalContentNav, setMinimalContentNav] = useState(false);
    const [contentIdx, setContentIdx] = useState(null);
    
    const setIsClickedSectionFunc = useRef(null);
    const moveContentFunc = useRef(null);
    const moveToItemFunc = useRef(null);
    // const onResizeFunc = useRef(null);
    const contentWrapElem = useRef(null);
    const contentElems = useRef([...Array(props.sectionNum)].map(()=>createRef()));
    const sidebarElems = useRef([...Array(props.sectionNum)].map(()=>createRef()));
    const contentNavElems = useRef([...Array(props.sectionNum)].map(()=>createRef()));
    const contentNavLineElems = useRef([...Array(props.sectionNum)].map(()=>createRef()));
    // const imgElems = useRef([...Array(0)].map(()=>createRef()));
    // const textElems = useRef(null);

    
    useEffect(()=>{
        // let currentContent = 0;
        let ww = window.innerWidth;
        let isClickedSection = false;
        const contentWrapElemPos = {x:0};
        const contentWrapElemEasePos = {x:0};
        // const contentElemEaseScale = [...Array(5).fill(1)];
        let maxWidth = contentWrapElem.current.offsetWidth - ww;
        const mouse = {
            currentPos: {x:0, y:0},
            startPos: {x:0, y:0},
            lastPos: {x:0, y:0},
            delta: {x:0, y:0}
        }

        let sidebarW = ww * (455 / 1920);
        let titleElems = null;
        let imgElems = null;


        const init = () => {
            titleElems = document.querySelectorAll('#title');
            imgElems = document.querySelectorAll('.imgWrap');
            
            animLoop();
            addEvent();
        }

        const onMouseDown = (event) => {
            if(isClickedSection){
                if(!event.touches) event.preventDefault();
                let e = (event.touches? event.touches[0]: event);
                mouse.startPos = {x:e.clientX, y:e.clientY};
                mouse.lastPos = {x:0, y:0};

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
            setMinimalContentNav(true);
            moveContentWrap();
        }

        const onMouseUp = () => {
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
            contentWrapElemPos.x += mouse.delta.x * 2;
            contentWrapElemPos.x = Math.min(0, Math.max(-maxWidth, contentWrapElemPos.x));
        }

        const moveContent = (i) => {
            contentWrapElemPos.x = -contentElems.current[i].current.offsetLeft;
            contentWrapElemEasePos.x = contentWrapElemPos.x;
        }
        moveContentFunc.current = {moveContent}

        const moveToItem = (i,j,lth) => {
            const currentContent = contentElems.current[i].current;
            const item = currentContent.querySelector(`.item:nth-child(${j+1})`);
            contentWrapElemPos.x = -currentContent.offsetLeft -(currentContent.offsetWidth-window.innerWidth) / (lth-1) * j;
            // console.log(currentContent.offsetLeft, currentContent.offsetWidth)
            // contentWrapElemPos.x = -currentContent.offsetLeft - item.offsetLeft + sidebarW;
        }
        moveToItemFunc.current = {moveToItem}

        const prevSection = () => {

        }

        const nextSection = () => {

        }
        
        const animLoop = () => {
            requestAnimationFrame(animLoop);

            contentWrapElemEasePos.x += (contentWrapElemPos.x - contentWrapElemEasePos.x) * .08;
            const x = contentWrapElemEasePos.x;
            contentWrapElem.current.style.transform = `translate3d(${x}px,0,0)`;

            for(let i=0; i<props.sectionNum; i++){
                // sidebar
                const content = contentElems.current[i].current;
                const sidebar = sidebarElems.current[i].current;

                const offsetX = content.getBoundingClientRect().left;
                let sx = Math.max(0, offsetX);
                if(offsetX - sidebarW <= -content.offsetWidth){
                    sx = Math.max(-sidebarW, offsetX+content.offsetWidth-sidebarW);
                }
                sidebar.style.transform = `translate3d(${sx}px,0,0)`;

                //
                //
                // content nav
                const contentNav = contentNavElems.current[i].current;
                let cx = Math.max(0, offsetX);
                if(offsetX <= -content.offsetWidth + contentNav.offsetWidth + sidebarW)
                    cx = Math.max(-contentNav.offsetWidth, offsetX+content.offsetWidth-sidebarW-contentNav.offsetWidth);
                contentNav.style.transform = `translate3d(${cx}px,0,0)`;
                
                const contentNavLine = contentNavLineElems.current[i].current;
                let s = Math.max(0, Math.min(1, -offsetX/(content.offsetWidth-window.innerWidth)));
                contentNavLine.style.transform = `translate3d(0,0,0) scaleX(${s})`;
                
                sx = null;
                cx = null;
                s = null;
            }



            if(imgElems)
                for(let i=0; i<imgElems.length; i++){
                    const img = imgElems[i];
                    const type = img.getAttribute('data-type');
                    let child = img.querySelector('img');

                    if(type === 'translate'){
                        const ix = -(img.getBoundingClientRect().left - sidebarW) * .06;
                        child.style.transform = `translate3d(${ix}px,0,0) scale(1.2)`;
                    }
                    else if(type === 'scale'){
                        const is = Math.max(1, 1 + (img.getBoundingClientRect().left - (ww/8)) / maxWidth * .8);
                        child.style.transform = `translate3d(0,0,0) scale(${is})`;
                    }

                    child = null;
                }

            if(titleElems)
                for(let i=0; i<titleElems.length; i++){
                    const text = titleElems[i];
                    
                    const offsetX = text.getBoundingClientRect().left - ww + ww/5;

                    if(offsetX < 0 && text.className !== 'done'){
                        text.className = 'done';
                        gsap.fromTo(text.querySelectorAll('span span'), 1, {force3D:true, y:'105%'}, {y:'0%', stagger:.08, ease:'power4.out'},'s');
                    }
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
            sidebarW = ww * (455 / 1920);
            maxWidth = contentWrapElem.current.offsetWidth - ww;         
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
        
        init();
        setTimeout(()=>{
            onResize();
        },1000);
        return () => {
            removeEvent();
        }
    },[]);


    useEffect(()=>{
        if(props.clickedSectionIdx !== null){
            const elem = sidebarElems.current[props.clickedSectionIdx].current;

            const tl = gsap.timeline({delay:1});
            
            tl.set('#sidebarWrap', {className:'active'});
            tl.set('#sectionWrap', {className:'hide'});
            tl.set(contentWrapElem.current, {className:'active'});
            tl.fromTo(elem.querySelectorAll('#des span span'), 1, {force3D:true, y:'100%'}, {y:'0%', stagger:.01, ease:'power4.out'},'s');
            tl.fromTo(elem.querySelectorAll('#date span'), 1, {force3D:true, y:'100%'}, { y:'0%', stagger:.1, ease:'power4.out'},'b-=.6');
            tl.fromTo(elem.querySelectorAll('#line'), 1, {force3D:true, scaleX:0}, {scaleX:1, ease:'power3.inOut'},'s+=.6');

            moveContentFunc.current.moveContent(props.clickedSectionIdx);
        }
    },[props.clickedSectionIdx])

    useEffect(()=>{
        if(props.isClickedSection !== null){
            setIsClickedSectionFunc.current.setIsClickedSection(props.isClickedSection);
        }
    },[props.isClickedSection])

    const onClickNav = (i,j) => {
        moveToItemFunc.current.moveToItem(i,j, props.contentData.sections[i].items.length);
    }
    
    const content = {
        'text1' : '政府推出「十年建屋計劃」， 大量興建公共房屋及發展新市鎮，並持續擴展運輸網絡，1979年地下鐵路投入服務，標誌着集體運輸系統的開始。',
        'text2' : ['完成', '《土地利用計劃書》']
    }

    return (
        <>
            <div id="contentNavWrap" className={`contentNav${props.clickedSectionIdx !== null && minimalSidebar ? ' active' : ''}`}>
                {
                    props.contentData.sections.map((v,i)=>{
                        return <div key={i} ref={contentNavElems.current[i]} id={`contentNav${i+1}`} className={`contentNav${minimalContentNav ? ' min' : ''}`}>
                            <div id="wrap">
                                <ul>
                                {
                                    v.items.map((c,j)=>{
                                        return <li key={j} onClick={()=>onClickNav(i,j)}>
                                            <p>
                                                <span dangerouslySetInnerHTML={{__html:c.text.title.join('<br/>')}}></span>
                                                <br/>
                                                <span id={c.category.id} className="category">{c.category.name}</span>
                                            </p>
                                        </li>
                                    })
                                }
                                </ul>
                                <div id="line"><span ref={contentNavLineElems.current[i]}></span></div>
                            </div>
                        </div>
                    })
                }
            </div>
            <div id="sidebarWrap">
                {
                    props.contentData.sections.map((v,i)=>{
                        return <div key={i} ref={sidebarElems.current[i]} id={`sidebar${i+1}`} className={`sidebar${props.clickedSectionIdx === i && !minimalSidebar ? ' active' : ''}`}>
                            <div id="des">
                                {
                                    content.text1.split('').map((v, i)=>{
                                        return <span key={i}><span>{v}</span></span>
                                    })
                                }
                            </div>
                            <div id="date">
                                {
                                    v.year.split(/(\d+)/g).filter(x => x).map((v, i)=>{
                                        return <span key={i}>{v}</span>
                                    })
                                }
                            </div>
                            <div id="line"></div>
                            <div id="img"></div>
                        </div>
                    })
                }
            </div>
            <div ref={contentWrapElem} id="contentWrap">
                {
                    props.contentData.sections.map((v,i)=>{
                        return <div key={i} ref={contentElems.current[i]} id={`content${i+1}`} className="content">
                             {
                                v.items.map((c,j)=>{
                                    return <div key={j} className="item">
                                        <div id="wrap">
                                            {
                                                c.image.url &&
                                                <div className="imgWrap" data-type={`${c.image.translationType}`}><img src={c.image.url} /></div>
                                            }
                                            {
                                                c.text.title &&
                                                <div id="title">
                                                    {
                                                        c.text.title.map((t, k)=>{
                                                            return <div key={k}>
                                                                {
                                                                    t.split('').map((tv, l)=>{
                                                                        return <span key={l}><span>{tv}</span></span>
                                                                    })
                                                                }
                                                            </div>
                                                        })
                                                    }
                                                </div>
                                            }
                                        </div>
                                    </div>
                                })
                            }
                        </div>
                    })
                }
            </div>
        </>
    )
}

export default Content;