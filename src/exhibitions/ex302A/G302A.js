import React, { useEffect, useState, useRef, createRef } from 'react';
import './style.scss';
import gsap from 'gsap';
import webSocket from 'socket.io-client';

import Content from './Content';

const G302A = props => {
  const [language, setLanguage] = useState('tc');
  const [contentData, setContentData] = useState(props.appData.contents[language]);
  const [clickedSectionIdx, setClickedSectionIdx] = useState(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [minimalSidebar, setMinimalSidebar] = useState(false);

  const sectionNum = contentData.sections.length;
  const sectionWrapElem = useRef(null);
  const sectionElems = useRef([...Array(sectionNum)].map(() => createRef()));
  const sectionTextElems = useRef([...Array(sectionNum)].map(() => createRef()));
  const sectionImgElems = useRef([...Array(sectionNum)].map(() => createRef()));
  const nextSectionFunc = useRef(null);
  const prevSectionFunc = useRef(null);
  const setIsClickedSectionFunc = useRef(null);
  const getIsClickedSectionFunc = useRef(null);
  const setCurrentSectionFunc = useRef(null);
  const getCurrentSectionFunc = useRef(null);
  const startFunc = useRef(null);
  const leaveFunc = useRef(null);
  const socketRef = useRef(null);


  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const delay = 1000;
    let canLeft = true;
    let canRight = true;
    let started = false;

    const start = () => {
      if (!started) {
        started = true;
        startFunc.current.start();
      }
    };

    const leave = () => {
      if (started) {
        started = false;
        leaveFunc.current.leave();
      }
    };

    const moveLeft = () => {
      if (started && canLeft && canRight) {
        canLeft = false;
        setTimeout(() => {
          canLeft = true;
        }, delay);
        prevSectionFunc.current.prevSection();
      }
    };

    const moveRight = () => {
      if (started && canLeft && canRight) {
        canRight = false;
        setTimeout(() => {
          canRight = true;
        }, delay);
        nextSectionFunc.current.nextSection();
      }
    };

    const getNavigationIndex = (d) => {
      goToSection(d.index, true);
    }

    if (socket) {
      socketRef.current = socket;
      socket.on('userEnter', start);
      socket.on('userLeave', leave);
      socket.on('navigationLeft', moveLeft);
      socket.on('navigationRight', moveRight);
      socket.on('navigationIndex', getNavigationIndex);
    } else {
      setSocket(webSocket('http://localhost:80/'));
    }

    return () => {
      if (socket) {
        socket.off('userEnter', start);
        socket.off('userLeave', leave);
        socket.off('navigationLeft', moveLeft);
        socket.off('navigationRight', moveRight);
        socket.off('navigationIndex', getNavigationIndex);
      }
    };
  }, [socket]);

  useEffect(() => {
    let ww = window.innerWidth;
    let started = false;
    let moving = false;
    let currentSection = 0;
    let oldSection = 0;
    let isClickedSection = false;
    const sectionWrapElemPos = { x: 0 };
    const sectionWrapElemEasePos = { x: ww };
    const sectionWrapElemEase2Pos = { x: ww };
    const sectionElemEaseScale = [...Array(sectionNum).fill(1)];
    const textElemEaseX = [...Array(sectionNum).fill(0)];
    const textElemEaseScale = [...Array(sectionNum).fill(1)];
    const textElemEaseOpacity = [...Array(sectionNum).fill(0)];
    const imageElemEaseX = [...Array(sectionNum).fill(0)];
    const imageElemEaseScale = [...Array(sectionNum).fill(1)];
    let maxWidth = sectionWrapElem.current.offsetWidth - ww;
    const mouse = {
      currentPos: { x: 0, y: 0 },
      startPos: { x: 0, y: 0 },
      lastPos: { x: 0, y: 0 },
      delta: { x: 0, y: 0 }
    };

    const init = () => {
      document.documentElement.style.setProperty('--sectionnum', contentData.sections.length);
      for (let i = 0; i < sectionNum; i++) {
        const section = sectionElems.current[i].current;
        section.style.left = `${(i + 1) * 50}vw`;
      }
      onResize();
    };

    const onMouseDown = event => {
      if (!isClickedSection) {
        if (!event.touches) event.preventDefault();
        let e = event.touches ? event.touches[0] : event;
        mouse.startPos = { x: e.clientX, y: e.clientY };
        mouse.lastPos = { x: 0, y: 0 };

        setDragging(false);
        moving = false;

        if (event.touches) document.addEventListener('touchmove', onMouseMove, false);
        else document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('touchend', onMouseUp, false);
      }
    };

    const onMouseMove = event => {
      if (!isClickedSection) {
        if (!event.touches) event.preventDefault();
        let e = event.touches ? event.touches[0] : event;

        mouse.currentPos.x = e.clientX - mouse.startPos.x;
        mouse.currentPos.y = e.clientY - mouse.startPos.y;

        mouse.delta.x = mouse.currentPos.x - mouse.lastPos.x;
        mouse.delta.y = mouse.currentPos.y - mouse.lastPos.y;

        mouse.lastPos.x = mouse.currentPos.x;
        mouse.lastPos.y = mouse.currentPos.y;

        if (moving) {
          setDragging(true);
        }
        moveSectionWrap();
        moving = true;
      }
    };

    const onMouseUp = () => {
      moveSection();
      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('touchmove', onMouseMove, false);
      document.removeEventListener('mouseup', onMouseUp, false);
      document.removeEventListener('touchend', onMouseUp, false);
    };

    const start = () => {
      sectionWrapElemPos.x = 0;
      isClickedSection = false;
      if (!started) {
        started = true;
        animLoop();
      }
    };
    startFunc.current = { start };

    const leave = () => {
      isClickedSection = true;
      setMinimalSidebar(false);
      setClickedSectionIdx(null);

      sectionWrapElemPos.x = window.innerWidth;
      sectionWrapElemEasePos.x = window.innerWidth;
    };
    leaveFunc.current = { leave };

    const setIsClickedSection = bool => {
      isClickedSection = bool;
    };
    setIsClickedSectionFunc.current = { setIsClickedSection };

    const getIsClickedSection = () => {
      return isClickedSection;
    };
    getIsClickedSectionFunc.current = { getIsClickedSection };

    const moveSectionWrap = () => {
      sectionWrapElemPos.x += mouse.delta.x;
      sectionWrapElemPos.x = Math.min(0, Math.max(-maxWidth, sectionWrapElemPos.x));
    };

    const moveSection = () => {
      sectionWrapElemPos.x = -currentSection * (ww / 2);
      setCurrentSectionIdx(currentSection);
      socketRef.current.emit('navigationIndex', {data:{index:currentSection}});

      if (oldSection !== currentSection) {
        const tl = gsap.timeline();
        tl.set('#sectionNav #line span', { force3D: true, x: oldSection * 100 + '%', scaleX: 0, overwrite: true });
        tl.to('#sectionNav #line span', 0.3, { scaleX: currentSection - oldSection, ease: 'power4.out' }, 's');
        tl.set('#sectionNav #line span ', { x: currentSection * 100 + '%', scaleX: -(currentSection - oldSection) }, 'b');
        tl.to('#sectionNav #line span', 0.4, { scaleX: 0, ease: 'power4.out' }, 'b');
      }

      oldSection = currentSection;
    };

    const nextSection = () => {
      if (!isClickedSection) {
        currentSection = Math.min(sectionNum - 1, ++currentSection);
        moveSection();
      }
    };
    nextSectionFunc.current = { nextSection };

    const prevSection = () => {
      if (!isClickedSection) {
        currentSection = Math.max(0, --currentSection);
        moveSection();
      }
    };
    prevSectionFunc.current = { prevSection };

    const setCurrentSection = i => {
      currentSection = i;
      moveSection();
    };
    setCurrentSectionFunc.current = { setCurrentSection };

    const getCurrentSection = () => {
      return currentSection;
    };
    getCurrentSectionFunc.current = { getCurrentSection };

    const animLoop = () => {
      requestAnimationFrame(animLoop);

      sectionWrapElemEase2Pos.x += (sectionWrapElemPos.x - sectionWrapElemEase2Pos.x) * 0.2;
      sectionWrapElemEasePos.x += (sectionWrapElemEase2Pos.x - sectionWrapElemEasePos.x) * 0.1;
      const x = (sectionWrapElemEasePos.x / maxWidth) * ((ww / 2 / sectionWrapElem.current.offsetWidth) * 100 * (sectionNum - 1));
      sectionWrapElem.current.style.transform = `translate3d(${x}%,0,0)`;

      for (let i = 0; i < sectionNum; i++) {
        const section = sectionElems.current[i].current;
        const text = sectionTextElems.current[i].current;
        const img = sectionImgElems.current[i].current;
        const offsetLeft = i * (ww / 2) + sectionWrapElemPos.x;
        const scale = 1 - Math.abs((offsetLeft * 0.3) / ww);
        const textX = (offsetLeft * 0.7) / ww;
        const textS = 1 - Math.abs((offsetLeft * 0.2) / ww);
        const textO = 1 - Math.abs((offsetLeft * 2) / ww);
        const imgX = (offsetLeft * 1) / ww;
        const imgS = 1 - Math.abs((offsetLeft * 0.2) / ww);

        // console.log(i)
        // update section idx
        const center = offsetLeft + ww / 2;
        if (center > ww / 5 && center < ww / 1.25) {
          currentSection = i;
        }

        textElemEaseX[i] += (textX - textElemEaseX[i]) * 0.1;
        textElemEaseScale[i] += (textS - textElemEaseScale[i]) * 0.1;
        textElemEaseOpacity[i] += (textO - textElemEaseOpacity[i]) * 0.1;
        text.style.transform = `translate3d(${textElemEaseX[i] * 100}%,0,0) scale(${textElemEaseScale[i]})`;
        text.style.opacity = textElemEaseOpacity[i];

        imageElemEaseX[i] += (imgX - imageElemEaseX[i]) * 0.1;
        imageElemEaseScale[i] += (imgS - imageElemEaseScale[i]) * 0.1;
        img.style.transform = `translate3d(${imageElemEaseX[i] * 100}%,0,0) scale(${imageElemEaseScale[i]})`;

        sectionElemEaseScale[i] += (scale - sectionElemEaseScale[i]) * 0.1;
        section.style.transform = `translate3d(-50%,-50%,0) scale(${sectionElemEaseScale[i]})`;
        // section.style.opacity = textElemEaseOpacity[i] * .8 + .2;
      }
    };

    const onKeyDown = e => {
      switch (e.code) {
        case 'ArrowLeft':
          prevSection();
          break;

        case 'ArrowRight':
          nextSection();
          break;

        default:
          break;
      }
    };

    const onResize = () => {
      ww = window.innerWidth;
      maxWidth = sectionWrapElem.current.offsetWidth - ww;
    };

    const addEvent = () => {
      document.addEventListener('mousedown', onMouseDown, false);
      document.addEventListener('touchstart', onMouseDown, false);
      document.addEventListener('keydown', onKeyDown, false);
      window.addEventListener('resize', onResize, false);
    };

    const removeEvent = () => {
      document.removeEventListener('mousedown', onMouseDown, false);
      document.removeEventListener('touchstart', onMouseDown, false);
      document.removeEventListener('keydown', onKeyDown, false);
      window.removeEventListener('resize', onResize, false);
    };

    init();
    addEvent();

    return () => {
      removeEvent();
    };
  }, []);

  // useEffect(() => {
  //     setContentData(props.appData.contents['tc']);
  // }, [props.appData]);

  useEffect(() => {
    setTimeout(() => {
      startFunc.current.start();
    }, 1000);
  }, []);

  const onClickSection = i => {
    if (!dragging && !getIsClickedSectionFunc.current.getIsClickedSection() && i === getCurrentSectionFunc.current.getCurrentSection()) {
      setClickedSectionIdx(i);
      setIsClickedSectionFunc.current.setIsClickedSection(true);

      socket.emit('selectIndex', {data:{index:i}});
    }
  };

  const onBack = () => {
    setMinimalSidebar(false);
    setClickedSectionIdx(null);
    // setCurrentSectionIdx();
    setIsClickedSectionFunc.current.setIsClickedSection(false);
  }

  const goToSection = (i, isSocket = false) => {
    setCurrentSectionFunc.current.setCurrentSection(i);
    setCurrentSectionIdx(i);

    if(!isSocket && socket)
      socket.emit('navigationIndex', {data:{index:i}});
  };

  const onChangeLanguage = lang => {
    setLanguage(lang);
    setContentData(props.appData.contents[lang]);
  };

  return (
    <div id='home' className={language}>
      {/* <svg width="100" height="100">
                <defs>
                    <mask id="circle-mask">
                        <rect fill="#000000" x="0" y="0" width="100" height="100"></rect>
                        <circle fill="#000000" cx="50" cy="50" r="50"></circle>
                    </mask>
                </defs>
            </svg> */}
      <div id='language'>
        <div className={`${language === 'tc' ? 'active' : ''} btn`} onClick={() => onChangeLanguage('tc')}>
          <span>繁</span>
        </div>
        <div className={`${language === 'en' ? 'active' : ''} btn`} onClick={() => onChangeLanguage('en')}>
          <span>EN</span>
        </div>
        <div id="backBtn" className={minimalSidebar ? 'hide' : ''}>
          <div id="back" className="hide" onClick={onBack}><span>回到選擇頁面</span></div>
        </div>
      </div>
      <div id="hints">拖曳畫面探索更多</div>
      <div id='sectionNav' className={`${clickedSectionIdx !== null ? 'hide' : ''}`}>
        <ul>
          {contentData &&
            contentData.sections.map((v, i) => {
              return (
                <li key={i} className={`${currentSectionIdx === i ? 'active' : ''}`} onClick={() => goToSection(i)}>
                  <span>{v.year}</span>
                </li>
              );
            })}
        </ul>
        <div id='line'>
          <span></span>
        </div>
      </div>
      <div ref={sectionWrapElem} id='sectionWrap'>
        {[...Array(sectionNum).fill(null)].map((v, i) => {
          return (
            <div key={i} ref={sectionElems.current[i]} id={`section${i + 1}`} className={`section${clickedSectionIdx === i ? ' active' : ''} ${currentSectionIdx === i ? ' current' : ''}`}>
              <div id='outerWrap'>
                <div id='wrap'>
                  <p className='eb' ref={sectionTextElems.current[i]}>
                    <span>{contentData && contentData.sections[i].text1}</span>
                  </p>
                  <div ref={sectionImgElems.current[i]} className='img' style={{ backgroundImage: `url(${contentData && contentData.sections[i].coverincircle.src})` }}></div>
                </div>
              </div>
              <div id='exploreBtn' onClick={() => onClickSection(i)}>{contentData && contentData.global.explore}</div>
            </div>
          );
        })}
      </div>
      {contentData && (
        <Content
          language={language}
          contentData={contentData}
          sectionNum={sectionNum}
          currentSectionIdx={currentSectionIdx}
          setCurrentSectionIdx={setCurrentSectionIdx}
          setClickedSectionIdx={setClickedSectionIdx}
          goToSection={goToSection}
          minimalSidebar={minimalSidebar}
          setMinimalSidebar={setMinimalSidebar}
          onBack={onBack}
          clickedSectionIdx={clickedSectionIdx}
          isClickedSection={getIsClickedSectionFunc.current && getIsClickedSectionFunc.current.getIsClickedSection()}
        ></Content>
      )}
    </div>
  );
};

export default G302A;
