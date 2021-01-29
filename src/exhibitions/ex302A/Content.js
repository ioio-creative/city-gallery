import React, { useEffect, useState, useRef, createRef } from 'react';
import './style.scss';
import gsap from 'gsap';

// import img1 from './images/img.png';

const usePrevious = value => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const Content = props => {
  // const [dragging, setDragging] = useState(false);
  // const [minimalSidebar, setMinimalSidebar] = useState(false);
  const [minimalContentNav, setMinimalContentNav] = useState(true);
  const [galleryItems, setGalleryItems] = useState(null);
  const [openedGallery, setOpenedGallery] = useState(false);
  // const [currentSectionIdx, setCurrentSectionIdx] = useState(props.currentSectionIdx);
  const [navIdx, setNavIdx] = useState(null);
  const prevIdx = usePrevious(props.clickedSectionIdx);

  const setIsClickedSectionFunc = useRef(null);
  const setIsOpenedGalleryFunc = useRef(null);
  const moveContentFunc = useRef(null);
  const moveToItemFunc = useRef(null);
  const getCurrentSectionIdxFunc = useRef(null);
  const getDataFunc = useRef(null);
  const triggerMinimal = useRef(null);
  // const onResizeFunc = useRef(null);
  const contentWrapElem = useRef(null);
  const contentElems = useRef(
    [...Array(props.sectionNum)].map(() => createRef())
  );
  const sidebarElems = useRef(
    [...Array(props.sectionNum)].map(() => createRef())
  );
  const contentNavElems = useRef(
    [...Array(props.sectionNum)].map(() => createRef())
  );
  const contentNavLineElems = useRef(
    [...Array(props.sectionNum)].map(() => createRef())
  );
  const galleryListElem = useRef(null);
  const controlBarElem = useRef(null);
  const controlBarBtnElem = useRef(null);
  // const imgElems = useRef([...Array(0)].map(()=>createRef()));
  // const textElems = useRef(null);

  useEffect(() => {
    // let currentContent = 0;
    let ww = window.innerWidth;
    let isClickedSection = false;
    let isOpenedGallery = false;
    let isClickedControlBarBtn = false;
    const contentWrapElemPos = { x: 0 };
    const contentWrapElemEasePos = { x: 0 };
    const galleryPos = { x: 0 };
    const galleryEasePos = { x: 0 };
    // const contentElemEaseScale = [...Array(5).fill(1)];
    let maxWidth = contentWrapElem.current.offsetWidth - ww;
    let maxGalleryWidth = 0; //contentWrapElem.current.offsetWidth - ww;
    let mouse = {
      currentPos: { x: 0, y: 0 },
      startPos: { x: 0, y: 0 },
      lastPos: { x: 0, y: 0 },
      delta: { x: 0, y: 0 }
    };

    let sidebarW = ww * (455 / 1920);
    // let imgYearElems = null;
    // let imgDesWrapElems = null;
    let itemElems = null;
    let imgElems = null;
    let currentSectionIdx = 0;
    let oldCurrentSectionIdx = 0;
    let oldPageOfNav = -1;
    let isStartedToMove = false;
    let data = null;
    let controlBarWidth = controlBarElem.current.offsetWidth;
    let controlBarBtnWidth = controlBarBtnElem.current.offsetWidth;
    let maxControlWidth = controlBarWidth - controlBarBtnWidth;
    const sectionNum = props.sectionNum;
    let disableDrag = false;

    const init = () => {
      // imgYearElems = document.querySelectorAll('#imgYear');
      itemElems = document.querySelectorAll('.item');
      // imgDesWrapElems = document.querySelectorAll('#imgDesWrap');
      imgElems = document.querySelectorAll('.imgWrap');

      animLoop();
      addEvent();
    };

    const onMouseDown = event => {
      if (isClickedSection) {
        if (!event.touches) event.preventDefault();
        let e = event.touches ? event.touches[0] : event;
        mouse.startPos = { x: e.clientX, y: e.clientY };
        mouse.lastPos = { x: 0, y: 0 };
        maxGalleryWidth = galleryListElem.current.offsetWidth - ww;

        if (event.touches)
          document.addEventListener('touchmove', onMouseMove, false);
        else document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('touchend', onMouseUp, false);
      }
    };

    const onMouseMove = event => {
      if (!event.touches) event.preventDefault();
      let e = event.touches ? event.touches[0] : event;

      if (!isStartedToMove) isStartedToMove = true;

      mouse.currentPos.x = e.clientX - mouse.startPos.x;
      mouse.currentPos.y = e.clientY - mouse.startPos.y;

      mouse.delta.x = mouse.currentPos.x - mouse.lastPos.x;
      mouse.delta.y = mouse.currentPos.y - mouse.lastPos.y;

      mouse.lastPos.x = mouse.currentPos.x;
      mouse.lastPos.y = mouse.currentPos.y;

      props.setMinimalSidebar(true);

      if (isOpenedGallery) {
        if (!isClickedControlBarBtn) moveGallery();
        else moveGalleryByControlBtn();
      } else moveContentWrap();
    };

    const onMouseUp = () => {
      isClickedControlBarBtn = false;
      isStartedToMove = false;
      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('touchmove', onMouseMove, false);
      document.removeEventListener('mouseup', onMouseUp, false);
      document.removeEventListener('touchend', onMouseUp, false);
    };

    const onClickControlBarBtn = () => {
      isClickedControlBarBtn = true;
    };

    const setIsClickedSection = bool => {
      isClickedSection = bool;
    };
    setIsClickedSectionFunc.current = { setIsClickedSection };

    const moveContentWrap = () => {
      if(!disableDrag){
        contentWrapElemPos.x += mouse.delta.x * 2;
        contentWrapElemPos.x = Math.min(
          0,
          Math.max(-maxWidth, contentWrapElemPos.x)
        );
      }
    };

    const moveContent = i => {
      contentWrapElemPos.x = -contentElems.current[i].current.offsetLeft;
      contentWrapElemEasePos.x = contentWrapElemPos.x;
    };
    moveContentFunc.current = { moveContent };

    const moveToItem = (i, j, lth) => {
      const currentContent = contentElems.current[i].current;
      // const item = currentContent.querySelector(`.item:nth-child(${j+1})`);
      contentWrapElemPos.x =
        -currentContent.offsetLeft -
        ((currentContent.offsetWidth - window.innerWidth) / (lth - 1)) * j;
      // console.log(currentContent.offsetLeft, currentContent.offsetWidth)
      // contentWrapElemPos.x = -currentContent.offsetLeft - item.offsetLeft + sidebarW;
    };
    moveToItemFunc.current = { moveToItem };

    //
    //
    // [start] gallery
    const setIsOpenedGallery = bool => {
      isOpenedGallery = bool;
      if (bool) galleryPos.x = 0;
    };
    setIsOpenedGalleryFunc.current = { setIsOpenedGallery };

    const moveGallery = () => {
      if (maxGalleryWidth > 0) {
        galleryPos.x += mouse.delta.x * 2;
        galleryPos.x = Math.min(0, Math.max(-maxGalleryWidth, galleryPos.x));
      }
    };

    const moveGalleryByControlBtn = () => {
      galleryPos.x += -mouse.delta.x;
      galleryPos.x = Math.min(0, Math.max(-maxGalleryWidth, galleryPos.x));
    };

    const moveControlBarBtn = progress => {
      controlBarBtnElem.current.style.transform = `translate3d(${
        maxControlWidth * progress
      }px,0,0)`;
    };
    // [end] gallery
    //
    //

    // const prevSection = () => {

    // }

    // const nextSection = () => {

    // }

    const getCurrentSectionIdx = idx => {
      currentSectionIdx = idx;
    };
    getCurrentSectionIdxFunc.current = { getCurrentSectionIdx };

    const getData = _data => {
      data = _data;
    };
    getDataFunc.current = { getData };

    const animLoop = () => {
      requestAnimationFrame(animLoop);

      if (!isOpenedGallery) {
        contentWrapElemEasePos.x += (contentWrapElemPos.x - contentWrapElemEasePos.x) * 0.08;
        let x = contentWrapElemEasePos.x;
        contentWrapElem.current.style.transform = `translate3d(${x}px,0,0)`;

        if (isClickedSection) {
          for (let i = 0; i < sectionNum; i++) {
            //
            //
            // sidebar
            const content = contentElems.current[i].current;
            const sidebar = sidebarElems.current[i].current;

            const offsetX = content.getBoundingClientRect().left;
            let sx = Math.max(0, offsetX);
            if (offsetX - sidebarW <= -content.offsetWidth) {
              sx = Math.max(
                -sidebarW,
                offsetX + content.offsetWidth - sidebarW
              );
            }
            sidebar.style.transform = `translate3d(${sx}px,0,0)`;

            if (i < currentSectionIdx){
              if (!sidebar.classList.contains('minimize')) {
                sidebar.classList.remove('active');
                sidebar.classList.add('minimize');
              }
            }

            if (currentSectionIdx === i) {
              if (sx === 0 && isStartedToMove) {
                if (!sidebar.classList.contains('minimize')) {
                  setTimeout(()=>{
                    sidebar.classList.remove('active');
                    sidebar.classList.add('minimize');
                    props.setClickedSectionIdx(i);
                  },0);

                  moveContent(i);
                  disableDrag = true;
                  setTimeout(()=>{
                    disableDrag = false;
                  },1000);
                }
              }
            } else if (i > currentSectionIdx) {
              if (sx >= window.innerWidth)
                if (!sidebar.classList.contains('active')) {
                  sidebar.classList.add('active');
                  sidebar.classList.remove('minimize');
                }
            }
            //else{
            // if(sx + sidebar.offsetWidth < 0){
            //     if(!sidebar.classList.contains('active'))
            //         sidebar.classList.add('active');
            // }
            // }

            //
            //
            // content nav
            const contentNav = contentNavElems.current[i].current;
            let cx = Math.max(0, offsetX);
            if (offsetX <= -content.offsetWidth + contentNav.offsetWidth + sidebarW)
              cx = Math.max(-contentNav.offsetWidth, offsetX + content.offsetWidth - sidebarW - contentNav.offsetWidth);
            contentNav.style.transform = `translate3d(${cx}px,0,0)`;

            const contentNavLine = contentNavLineElems.current[i].current;
            let s = Math.max(0, Math.min(1, -offsetX / (content.offsetWidth - window.innerWidth)));
            contentNavLine.style.transform = `translate3d(0,0,0) scaleX(${s})`;

            if (data)
              if (offsetX <= window.innerWidth / 2 && offsetX + content.offsetWidth >= window.innerWidth / 2) {
                const pageOfNav = Math.floor((s + 0.005) / (1 / (data.sections[i].items.length-1)));
                if(oldPageOfNav !== pageOfNav){
                  // console.log(pageOfNav)
                  setNavIdx(pageOfNav);
                  oldPageOfNav = pageOfNav;
                }

                if(oldCurrentSectionIdx !== i){
                  // console.log(i);
                  // props.setCurrentSectionIdx(i);
                  props.goToSection(i);
                  oldCurrentSectionIdx = i;
                }
                // console.log(i,pageOfNav)
              }
            // if(i === currentSectionIdx && data)
            //     console.log(currentSectionIdx, offsetX, Math.floor(s / (1/(data.sections[currentSectionIdx].items.length-1))))

            sx = null;
            cx = null;
            s = null;
          }
        }
        else{
          for (let i = 0; i < sectionNum; i++) {
            const sidebar = sidebarElems.current[i].current;
            if (!sidebar.classList.contains('active')) {
              gsap.set(sidebar, {delay:1, className: 'sidebar active' });
            }
          }
        }

        if (imgElems)
          for (let i = 0; i < imgElems.length; i++) {
            const img = imgElems[i];
            const type = img.getAttribute('data-type');
            let child = img.querySelector('img');

            if (type === 'translate') {
              const ix = -(img.getBoundingClientRect().left - sidebarW) * 0.06;
              child.style.transform = `translate3d(${ix}px,0,0) scale(1.2)`;
            } else if (type === 'scale') {
              const is = Math.max(
                1,
                1 + (img.getBoundingClientRect().left - ww * .6) / (maxWidth*.1)
              );
              child.style.transform = `translate3d(0,0,0) scale(${is})`;
            }

            child = null;
          }

        if (itemElems)
          for (let i = 0; i < itemElems.length; i++) {
            const item = itemElems[i];

            const offsetX = item.getBoundingClientRect().left - ww / 2.5;
            if (offsetX < 0 && !item.classList.contains('done')) {
              item.classList.add('done');
              gsap.fromTo(
                item.querySelectorAll('#top span span'),
                1,
                { force3D: true, y: '105%' },
                { y: '0%', stagger: 0.08, ease: 'power4.out' },
                's'
              );
            }
          }
        } else {
          galleryEasePos.x += (galleryPos.x - galleryEasePos.x) * 0.08;
          galleryListElem.current.style.transform = `translate3d(${galleryEasePos.x}px,0,0)`;
          moveControlBarBtn(galleryEasePos.x / -maxGalleryWidth);
        }
    };

    const onKeyDown = e => {
      switch (e.code) {
        case 'ArrowLeft':
          // prevSection();
          break;

        case 'ArrowRight':
          // nextSection();
          break;

        default:
          break;
      }
    };

    const onResize = () => {
      sidebarW = ww * (455 / 1920);
      maxWidth = contentWrapElem.current.offsetWidth - ww;
    };

    const addEvent = () => {
      document.addEventListener('mousedown', onMouseDown, false);
      document.addEventListener('touchstart', onMouseDown, { passive: false });
      document.addEventListener('keydown', onKeyDown, false);
      window.addEventListener('resize', onResize, false);

      controlBarBtnElem.current.addEventListener(
        'mousedown',
        onClickControlBarBtn,
        false
      );
      controlBarBtnElem.current.addEventListener(
        'touchstart',
        onClickControlBarBtn,
        false
      );
    };

    const removeEvent = () => {
      document.removeEventListener('mousedown', onMouseDown, false);
      document.removeEventListener('touchstart', onMouseDown, {
        passive: false
      });
      document.removeEventListener('keydown', onKeyDown, false);
      window.removeEventListener('resize', onResize, false);

      controlBarBtnElem.current.removeEventListener(
        'mousedown',
        onClickControlBarBtn,
        false
      );
      controlBarBtnElem.current.removeEventListener(
        'touchstart',
        onClickControlBarBtn,
        false
      );
    };

    init();
    setTimeout(() => {
      onResize();
    }, 1000);
    return () => {
      removeEvent();
    };
  }, []);

  useEffect(() => {
    if (props.clickedSectionIdx !== null) {
      const elem = sidebarElems.current[props.clickedSectionIdx].current;
      const tl = gsap.timeline({ delay: 1 });

      tl.set('#sidebarWrap', {className: 'active'});
      tl.set('#sectionWrap', {className: 'hide',clearProps: 'opacity,visibility'});
      tl.set(contentWrapElem.current, {className: 'active',clearProps: 'opacity,visibility'});
      tl.fromTo(elem.querySelectorAll('#des span span'),1,{ force3D: true, y: '100%' },{ y: '0%', stagger: 0.01, ease: 'power4.out' },'s');
      tl.fromTo(elem.querySelectorAll('#date span'),1,{ force3D: true, y: '100%' },{ y: '0%', stagger: 0.1, ease: 'power4.out' },'b-=.6');
      tl.fromTo(elem.querySelectorAll('#line'),1,{ force3D: true, scaleX: 0 },{ scaleX: 1, ease: 'power3.inOut' },'s+=.6');
      tl.set('#language #back', {className:'show'},'end-=.4');
      tl.set('#language #back span', {className:'show'},'end');

      moveContentFunc.current.moveContent(props.clickedSectionIdx);
    } else {
      if (prevIdx !== null && prevIdx !== undefined) {
        const tl = gsap.timeline();
        tl.set(contentWrapElem.current,{ className: '', autoAlpha: 0 },'s');
        tl.set('#sidebarWrap', { className: 'hide'}, 's');
        tl.set('#sectionWrap', { className: '' },'s');
        tl.set('#language #back span', {className:''},'s');
        tl.set('#language #back', {className:''},'s+=.4');
        tl.fromTo('#sectionWrap',1,{ autoAlpha: 0 },{ autoAlpha: 1, ease: 'power1.inOut' },'s');
      }
    }
  }, [props.clickedSectionIdx]);

  useEffect(() => {
    getCurrentSectionIdxFunc.current.getCurrentSectionIdx(props.currentSectionIdx);
  }, [props.currentSectionIdx]);

  useEffect(() => {
    if (props.isClickedSection !== null) {
      setIsClickedSectionFunc.current.setIsClickedSection(props.isClickedSection);
    }
  }, [props.isClickedSection]);

  useEffect(() => {
    getDataFunc.current.getData(props.contentData);
  }, [props.contentData]);

  useEffect(() => {
    setIsOpenedGalleryFunc.current.setIsOpenedGallery(openedGallery);
  }, [openedGallery]);

  // useEffect(()=>{
  //     if(!minimalContentNav){
  //         if(triggerMinimal.current) clearTimeout(triggerMinimal.current);
  //         triggerMinimal.current = setTimeout(()=>{
  //             setMinimalContentNav(true);
  //         },1000 * 10);
  //     }
  // },[minimalContentNav])

  const onClickNav = (i, j) => {
    if (!minimalContentNav)
      moveToItemFunc.current.moveToItem(
        i,
        j,
        props.contentData.sections[i].items.length
      );

    if (triggerMinimal.current) clearTimeout(triggerMinimal.current);
    triggerMinimal.current = setTimeout(() => {
      setMinimalContentNav(true);
    }, 10000);
  };

  const showGallery = galleryData => {
    setGalleryItems(galleryData);
    setOpenedGallery(true);
  };

  return (
    <>
      {/* <div id="contentNavIndicator" className={`${props.clickedSectionIdx !== null && props.minimalSidebar ? ' active' : ''}`}>打開快速頁面</div> */}
      <div id='contentNavWrap' className={`contentNav${props.clickedSectionIdx !== null && props.minimalSidebar ? ' active' : ''}`}>
        {props.contentData.sections.map((v, i) => {
          return (
            <div key={i} ref={contentNavElems.current[i]} id={`contentNav${i + 1}`} className={`contentNav${minimalContentNav ? ' minimal' : ''}`}
              onClick={() => minimalContentNav ? setMinimalContentNav(false) : null }
            >
              <div id='wrap'>
                <ul>
                  {v.items.map((c, j) => {
                    return (
                      <li
                        key={j}
                        id={c.category.id}
                        className={
                          props.currentSectionIdx === i && navIdx === j
                            ? 'active'
                            : ''
                        }
                        onClick={() => onClickNav(i, j)}
                      >
                        <div id="point"></div>
                        <span className='category'>{c.category.name}</span>
                        <span id='year' className='eb' dangerouslySetInnerHTML={{ __html: c.text.year }}></span>
                      </li>
                    );
                  })}
                </ul>
                <div id='line'>
                  <span ref={contentNavLineElems.current[i]}></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div id='sidebarWrap' className="hide">
        {props.contentData.sections.map((v, i) => {
          return (
            <div key={i} ref={sidebarElems.current[i]} id={`sidebar${i + 1}`} className={`sidebar`}>
              <div id="numOfItems"><p className="eb">{v.items.length}</p>{props.contentData.global.stories}</div>
              <div id="numOfItemsSmall"><span className="eb">{v.items.length}</span>{props.contentData.global.stories}</div>
              <div id='bg' style={{ backgroundImage: `url('./images/ex302a/sidebarbg_${i}.png')` }}></div>
              <div id='desWrap'>
                <div id='des'>
                  {props.language === 'tc' &&
                    v.text1.split('').map((v, i) => {
                      return (
                        <span key={i}>
                          <span>{v}</span>
                        </span>
                      );
                    })}
                  {props.language === 'en' &&
                    v.text1.split(' ').map((v, i) => {
                      return (
                        <span key={i}>
                          <span>{v}&nbsp;</span>
                        </span>
                      );
                    })}
                </div>
              </div>
              <div id='date' className='eb'>
                {v.year.split(/(\d+)/g).filter(x => x).map((v, i) => {
                  return <span key={i}>{v}</span>;
                })}
              </div>
              {/* <div id="selectYearBtn" onClick={props.onBack}>選擇年份</div> */}
              <div id='line'></div>
              <div id='img' style={{ backgroundImage: `url(${v.coverinsidebar.src}` }}></div>
            </div>
          );
        })}
      </div>
      <div ref={contentWrapElem} id='contentWrap'>
        {props.contentData.sections.map((v, i) => {
          return (
            <div
              key={i}
              ref={contentElems.current[i]}
              id={`content${i + 1}`}
              className='content'
            >
              {v.items.map((c, j) => {
                return (
                  <div key={j} className='item'>
                    <div id='top'>
                      <div id='imgOuterWrap'>
                        {c.image.src && (
                          <div className='imgWrap' data-type={`${c.image.translationType}`}>
                            <img src={c.image.src} />
                            {c.image.gallery && c.image.gallery.length > 0 && (
                              <div
                                id='galleryBtn'
                                onClick={() => showGallery(c.image.gallery)}
                              ></div>
                            )}
                          </div>
                        )}
                        <div id='imgDesWrap'>
                          <div id='imgYear' className='eb'>
                            {c.text.year
                              .toString()
                              .split('')
                              .map((t, k) => {
                                return (
                                  <div key={k}>
                                    <span>
                                      <span>{t}</span>
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                          <div id='imgDes'>
                            {c.image.description.split('<br/>').map((t, l) => {
                              return (
                                <div key={l}>
                                  <span>
                                    <span dangerouslySetInnerHTML={{__html:t}}></span>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div id={c.category.id} className='category'>
                        {c.category.name}
                      </div>
                    </div>
                    <div id='bot'>
                      {c.text.content && (
                        <div
                          id='itemContent'
                          dangerouslySetInnerHTML={{ __html: c.text.content }}
                        ></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {
        <div id='gallery' className={openedGallery && props.ClickedSectionIdx !== null ? 'active' : ''}>
          <div id='galleryContent'>
            <ul ref={galleryListElem}>
              {galleryItems &&
                galleryItems.map((v, i) => {
                  return (
                    <li key={i}>
                      <img src={v.src} />
                      {/* <p id='des'>{v.description}</p> */}
                      <p id='ref'>{v.reference}</p>
                    </li>
                  );
                })}
            </ul>
            <div id='controlWrap' className={galleryItems && galleryItems.length < 3 ? 'hide' : ''}>
              <div ref={controlBarElem} id='controlBar'>
                <div ref={controlBarBtnElem} id='controlBarBtn'></div>
              </div>
            </div>
          </div>
          <div id='galleryTotalNum' className='eb'>
            <span>{galleryItems && galleryItems.length}</span>
          </div>
          <div id='backBtn' onClick={() => setOpenedGallery(false)}>
            {props.contentData.global.back}
          </div>
          <div id='bg'></div>
        </div>
      }
    </>
  );
};

export default Content;
