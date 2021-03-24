import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { random } from '../exhibitions/exG02A2/globalFuncFor3d';
import './g02BContainer.scss';

import bubble1 from '../exhibitions/exG02B2/images/bubble.svg';
import bubble2 from '../exhibitions/exG02B2/images/bubble2.svg';
import circle1 from '../exhibitions/exG02B2/images/circle1.svg';
import circle2 from '../exhibitions/exG02B2/images/circle2.svg';
import circle3 from '../exhibitions/exG02B2/images/circle3.svg';
// import gallery from '../exhibitions/exG02B2/images/gallery.png';

const G02BStatus = {
  IDLE: 1 //
};

const CityBlock = props => {
  const cityIdx = props.data ? (props.blockIdx ? props.blockIdx : 0) : 0;

  return (
    <div
      id={cityIdx}
      className={`cityBlock${props.activeCenterClass ? ' center' : ''}${props.active ? ' clicked' : ''}`}
      style={{
        transform: `translate3d(${props.offsetX}px, ${props.offsetY}px, 0px)`
      }}
    >
      <div className='contentWrap' onClick={props.onClickBlock}>
        <div className='cityImage'>
          <div
            className='img'
            style={{
              backgroundImage: `url(${props.data && props.data.cities[cityIdx].image.src})`
            }}
          ></div>
        </div>
        <div className='cityName'>
          <div className='location'>{props.data && props.data.cities[cityIdx].name}</div>
          <div className='realName'>{props.data && props.data.cities[cityIdx].location}</div>
        </div>
        {/* <div className='otherLangName'>
          <b>{props.data && props.otherLangData.cities[cityIdx].name}</b>,{' '}
          {props.data && props.otherLangData.cities[cityIdx].location}
        </div> */}
        {/* <div style={{
        position: 'absolute',
        top:'50%',
        left:'50%',
        transform:'translate3d(-50%,-50%,0)',
        fontSize: 120,
        color: props.color,
        display:'inline-block',
        zIndex:99
      }}>{props.data && props.blockIdx}</div> */}
      </div>
    </div>
  );
};

let col = [0, 1, 2, 3, 4];
let row = [0, 1, 2, 3, 4];

const CitiesList = props => {
  const [startColIdx, setStartColIdx] = useState([]);
  const [lth, setLth] = useState(0);
  const [oldcurrentRowIdx, setOldcurrentRowIdx] = useState(2);
  const [oldcurrentColIdx, setOldcurrentColIdx] = useState(2);

  const blockWidth = window.innerWidth / 3.1;
  const blockHeight = blockWidth;
  const currentColIdx = props.currentColIdx;
  const currentRowIdx = props.currentRowIdx;

  useEffect(() => {
    let topRowIdx, bottomRowIdx, leftColIdx, rightColIdx;
    const colLth = col.length;
    const rowLth = row.length;
    let ridx;
    let cidx;

    if (currentRowIdx < oldcurrentRowIdx) {
      // console.log('up');
      topRowIdx = currentRowIdx - 2;
      bottomRowIdx = oldcurrentRowIdx + 2;
      ridx = ((bottomRowIdx % rowLth) + rowLth) % rowLth;
      row[ridx] = topRowIdx;
    } else if (currentRowIdx > oldcurrentRowIdx) {
      // console.log('down');
      topRowIdx = oldcurrentRowIdx - 2;
      bottomRowIdx = currentRowIdx + 2;
      ridx = ((topRowIdx % rowLth) + rowLth) % rowLth;
      row[ridx] = bottomRowIdx;
    }

    if (currentColIdx < oldcurrentColIdx) {
      // console.log('left');
      leftColIdx = currentColIdx - 2;
      rightColIdx = oldcurrentColIdx + 2;
      cidx = ((rightColIdx % colLth) + colLth) % colLth;
      col[cidx] = leftColIdx;
    } else if (currentColIdx > oldcurrentColIdx) {
      // console.log('right');
      leftColIdx = oldcurrentColIdx - 2;
      rightColIdx = currentColIdx + 2;
      cidx = ((leftColIdx % colLth) + colLth) % colLth;
      col[cidx] = rightColIdx;
    }

    setOldcurrentRowIdx(currentRowIdx);
    setOldcurrentColIdx(currentColIdx);

    // console.log('current row idx',currentRowIdx);
    // console.log('current col idx',currentColIdx);
  }, [currentRowIdx, currentColIdx]);

  /*
   0  1 2 3 4 5
   1  5 6 7 8 9
   2  8 9 _ 1 2
   3  1 2 3 4 5
   4  4 5 6 7 8
  */

  useEffect(() => {
    if (props.data) {
      setLth(props.data.cities.length);

      const idx = [1, 8, 5, 2, 9]; //[1,5,8,1,4];
      // for (let i = 0; i < 5; i++) {
      //   // if(i === 2)
      //   //   idx[i] = props.data.cities.length - 2;
      //   // else
      //   idx[i] = Math.round(random(0, props.data.cities.length - 1));
      // }
      setStartColIdx(idx);
    }
  }, [props.data]);

  return (
    <div
      className='citiesList'
      style={{
        transform: `translate3d(${props.posX}px, ${props.posY}px, 0px)`
      }}
    >
      {startColIdx.length &&
        [...Array(startColIdx.length)].map((v, yIdx) => {
          return [...Array(5)].map((v, xIdx) => {
            const colLth = col.length;
            const rowLth = row.length;
            const id = (startColIdx[yIdx] + (((col[xIdx] % lth) + lth) % lth)) % lth;
            return (
              <CityBlock
                key={yIdx * 5 + xIdx}
                active={props.blockElemIdx === yIdx * 5 + xIdx}
                blockIdx={id}
                activeCenterClass={xIdx === ((currentColIdx % colLth) + colLth) % colLth && yIdx === ((currentRowIdx % rowLth) + rowLth) % rowLth ? true : false}
                offsetX={col[xIdx] * blockWidth}
                offsetY={row[yIdx] * blockHeight}
                data={props.data}
                otherLangData={props.otherLangData}
                onClickBlock={e => {
                  props.onClickBlock(yIdx * 5 + xIdx, xIdx, yIdx);
                  props.setDomId(id);
                }}
              />
            );
          });
        })}
    </div>
  );
};

const G02BContainer = props => {
  const [dragging, setDragging] = useState(false);
  const goCenterFunc = useRef(null);
  const moveToClickedBlockFunc = useRef(null);
  const getDisableDragFunc = useRef(null);
  const detailsPageElem = useRef(null);
  const galleryListElem = useRef(null);
  const setIsIdleFunc = useRef(null); // local function

  const [domId, setDomId] = useState(0);
  let blockWidth = window.innerWidth / 3.1;
  let blockHeight = blockWidth;
  // const [status, setStatus] = useState(G02BStatus.IDLE);
  const [language, setLanguage] = useState('zh');
  const [contentData, setContentData] = useState(null);
  const [isHome, setIsHome] = useState(true);
  const [activeDetailPage, setActiveDetailPage] = useState(false);
  const [disableDrag, setDisableDrag] = useState(true);
  const [currentColIdx, setCurrentColIdx] = useState(2);
  const [currentRowIdx, setCurrentRowIdx] = useState(2);
  const [easeElemPos, setEaseElemPos] = useState({
    x: (-blockWidth * 4) / 2 + window.innerWidth / 2 - blockWidth / 2,
    y: (-blockHeight * 4) / 2 + window.innerHeight / 2 - blockHeight / 2
  });
  const [blockElemIdx, setBlockElemIdx] = useState(null);
  const [idle, setIdle] = useState(null);

  useEffect(() => {
    const mouse = {
      startPos: { x: 0, y: 0 },
      currentPos: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
      lastPos: { x: 0, y: 0 }
    };
    const initalPos = {
      x: easeElemPos.x,
      y: easeElemPos.y
    };
    const elemPos = {
      x: initalPos.x,
      y: initalPos.y
    };
    let player = null;
    let isDragDisabled = false;
    let timer = null;
    let isIdle = true;

    const onMouseDown = event => {
      if (!isIdle) idle();
      if (!isDragDisabled) {
        // idle();
        setDragging(false);
        let e = event.touches ? event.touches[0] : event;
        const mx = e.clientX;
        const my = e.clientY;

        mouse.startPos = { x: mx, y: my };
        mouse.lastPos = { x: 0, y: 0 };

        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('touchmove', onMouseMove, false);
        document.addEventListener('touchend', onMouseUp, false);
      }
    };

    const onMouseMove = event => {
      if (!isIdle) idle();
      setDragging(true);
      let e = event.touches ? event.touches[0] : event;
      const mx = e.clientX;
      const my = e.clientY;

      mouse.currentPos.x = mx - mouse.startPos.x;
      mouse.currentPos.y = my - mouse.startPos.y;

      mouse.delta.x = mouse.currentPos.x - mouse.lastPos.x;
      mouse.delta.y = mouse.currentPos.y - mouse.lastPos.y;

      mouse.lastPos.x = mouse.currentPos.x;
      mouse.lastPos.y = mouse.currentPos.y;

      elemPos.x += mouse.delta.x * 2;
      elemPos.y += mouse.delta.y * 2;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('mouseup', onMouseUp, false);
      document.removeEventListener('touchmove', onMouseMove, false);
      document.removeEventListener('touchend', onMouseUp, false);
    };

    const goCenter = (colIdx, rowIdx) => {
      elemPos.x = (-blockWidth * (colIdx * 2)) / 2 + window.innerWidth / 2 - blockWidth / 2;
      elemPos.y = (-blockHeight * (rowIdx * 2)) / 2 + window.innerHeight / 2 - blockHeight / 2;

      mouse.currentPos = { x: 0, y: 0 };
    };
    goCenterFunc.current = { goCenter };

    const moveToClickedBlock = (x, y) => {
      if (!isDragDisabled) {
        elemPos.x = -x + window.innerWidth / 2 - blockWidth / 2;
        elemPos.y = -y + window.innerHeight / 2 - blockHeight / 2;
      }
    };
    moveToClickedBlockFunc.current = { moveToClickedBlock };

    const getDisableDrag = d => {
      isDragDisabled = d;
    };
    getDisableDragFunc.current = { getDisableDrag };

    const idle = () => {
      if (timer) {
        clearTimeout(timer);
        setIdle(false);
        isIdle = false;
      }
      timer = setTimeout(() => {
        setIdle(true);
        isIdle = true;
      }, 1000 * 60);
    };

    const setIsIdle = bool => {
      isIdle = bool;
    };
    setIsIdleFunc.current = { setIsIdle };

    const loop = () => {
      player = requestAnimationFrame(loop);

      if (isIdle) {
        elemPos.x -= 0.2;
        elemPos.y -= 0.3;
      }

      setEaseElemPos({
        x: (easeElemPos.x += (elemPos.x - easeElemPos.x) * 0.1),
        y: (easeElemPos.y += (elemPos.y - easeElemPos.y) * 0.1)
      });

      setCurrentColIdx(-Math.floor((easeElemPos.x - blockWidth / 2) / blockWidth));
      setCurrentRowIdx(-Math.floor((easeElemPos.y + blockHeight / 8) / blockHeight));
    };

    const onResize = () => {
      blockWidth = window.innerWidth / 3.1;
      blockHeight = blockWidth;
    };

    loop();
    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('touchstart', onMouseDown, false);
    window.addEventListener('resize', onResize, false);
    return () => {
      cancelAnimationFrame(player);
      document.removeEventListener('mousedown', onMouseDown, false);
      document.removeEventListener('touchstart', onMouseDown, false);
      window.removeEventListener('resize', onResize, false);
    };
  }, []);

  useEffect(() => {
    if (props.appData) {
      setContentData(props.appData.contents['zh']);
    }
  }, [props.appData]);

  useEffect(() => {
    getDisableDragFunc.current.getDisableDrag(disableDrag);
  }, [disableDrag]);

  useEffect(() => {
    if (idle) {
      backToHome();
    }
  }, [idle]);

  const backToHome = () => {
    // goCenterFunc.current.goCenter(currentColIdx,currentRowIdx);
    setIsIdleFunc.current.setIsIdle(true);
    setIsHome(true);
    setDisableDrag(true);

    closeDetailPage(true);
    gsap.to(['#drag', '#homeBtn'], 0.3, {
      autoAlpha: 0,
      overwrite: true,
      ease: 'power1.inOut'
    });
  };

  const closeContent = () => {
    setBlockElemIdx(null);
    closeDetailPage();
  };

  const onClickBlock = (domIdx, c, r) => {
    if (!dragging && !isHome) {
      setDisableDrag(true);
      setBlockElemIdx(domIdx);
      moveToClickedBlockFunc.current.moveToClickedBlock(col[c] * blockWidth, row[r] * blockHeight);

      openDetailPage(domIdx);
    }
  };

  const openDetailPage = domIdx => {
    const elem = document.querySelector(`.cityBlock:nth-child(${domIdx + 1})`);
    const delay = Math.abs((elem.getBoundingClientRect().left + blockWidth / 2 - window.innerWidth / 2) / (window.innerWidth / 1.1)) + Math.abs((elem.getBoundingClientRect().top + blockWidth / 2 - window.innerHeight / 2) / window.innerWidth);

    gsap.to(['#drag'], 0.3, { autoAlpha: 0, ease: 'power1.inOut' });
    gsap.fromTo('#detailsPage #bg', 0.3, { autoAlpha: 0 }, { delay: delay, autoAlpha: 1, ease: 'power1.inOut' });
    gsap.fromTo('#detailsPage #bg', 1.3, { scale: 0.9 }, { force3D: true, delay: delay, scale: 3.6, ease: 'power4.inOut' });
    gsap.to('#detailsContent', 0.3, {
      delay: delay + 1,
      autoAlpha: 1,
      ease: 'power1.inOut'
    });
    gsap.to(['#exploreBtn'], 0.3, {
      delay: delay + 1,
      autoAlpha: 1,
      ease: 'power1.inOut'
    });
    setActiveDetailPage(true);

    galleryListElem.current.scrollTop = 0;
  };

  const closeDetailPage = goHome => {
    gsap.to(['#exploreBtn'], 0.3, { autoAlpha: 0, ease: 'power1.inOut' });
    gsap.to(['#drag'], 0.3, { delay: 0.6, autoAlpha: 1, ease: 'power1.inOut' });
    gsap.to('#detailsContent', 0.3, { autoAlpha: 0, ease: 'power1.inOut' });
    gsap.to('#detailsPage #bg', 0.6, {
      force3D: true,
      scale: 1,
      ease: 'power2.inOut'
    });
    gsap.to('#detailsPage #bg', 0.3, {
      delay: goHome ? 0 : 0.6,
      autoAlpha: 0,
      ease: 'power1.inOut',
      onComplete: function () {
        setActiveDetailPage(false);
        !goHome && setDisableDrag(false);
      }
    });
  };

  const onChangeLang = lang => {
    setIsHome(false);
    setDisableDrag(false);
    setContentData(props.appData.contents[lang]);
    setLanguage(lang);
    setIsIdleFunc.current.setIsIdle(false);
    goCenterFunc.current.goCenter(currentColIdx, currentRowIdx);

    gsap.to(['#drag', '#homeBtn'], 0.3, { autoAlpha: 1, ease: 'power1.inOut' });
  };

  return (
    <div id='G02BContainer' className={`${isHome ? 'home ' : ''}${language}`}>
      <svg width='0' height='0'>
        <defs>
          <clipPath id='smask' clipPathUnits='objectBoundingBox' transform='translate(.1,0) scale(0.00204, 0.00284)'>
            <path d='M132.4 76.9c93.3 0 82-84.9 244.6-76.3 92.1 13 184.2 151.1 33.1 319.4-65.3 65.5-195 7.2-246.1 7.2C61.9 324.4 0 299.1 0 213.6S39.1 76.9 132.4 76.9z' fill='none' />
          </clipPath>
        </defs>
      </svg>
      <div id='homeInfo'>
        <div>Please select language</div>
        <div>請選擇語言</div>
        <div id='lang'>
          {props.appData &&
            props.appData.languages.map((value, index) => (
              <div key={index} className='btn' onClick={() => onChangeLang(value.locale)}>
                {value.display}
              </div>
            ))}
        </div>
      </div>
      <div
        id='drag'
        dangerouslySetInnerHTML={{
          __html: contentData && contentData.global.dragHints
        }}
      ></div>
      <div id='exploreBtn' className='btn' onClick={closeContent}>
        <span>{contentData && contentData.global.exploreHints}</span>
      </div>
      <div id='homeBtn' className='btn' onClick={backToHome}></div>
      <CitiesList
        data={contentData}
        otherLangData={props.appData && props.appData.contents[language === 'zh' ? 'en' : 'zh']}
        posX={easeElemPos.x}
        posY={easeElemPos.y}
        currentColIdx={currentColIdx}
        currentRowIdx={currentRowIdx}
        blockElemIdx={blockElemIdx}
        onClickBlock={onClickBlock}
        setDomId={setDomId}
      />

      <div ref={detailsPageElem} id='detailsPage' className={activeDetailPage ? 'active' : ''}>
        <div id='detailsContent' style={{ background: `${contentData && contentData.cities[domId].backgroundColor}` }}>
          <div id='imageWrap'>
            <div
              className='img'
              style={{
                backgroundImage: `url(${contentData && contentData.cities[domId].image.src})`
              }}
            ></div>
          </div>
          <svg width='0' height='0'>
            <defs>
              <filter id='blur'>
                <feGaussianBlur in='SourceGraphic' stdDeviation='10' result='blur' />
                <feComposite in='SourceGraphic' in2='matrix' operator='atop' />
              </filter>
              <filter id='colormatrix'>
                <feColorMatrix in='blur' mode='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9' result='matrix' />
                <feComposite in='SourceGraphic' in2='matrix' operator='atop' />
              </filter>
            </defs>
          </svg>
          <div id='bubbleWrap1' className='bubbleWrap'>
            <div id='bubble1' className='bubble' style={{ backgroundImage: `url(${bubble1})` }}></div>
            <div id='bubble2' className='bubble' style={{ backgroundImage: `url(${bubble2})` }}></div>
          </div>
          <div id='bubbleWrap2' className='bubbleWrap'>
            <div id='bubble1' className='bubble' style={{ backgroundImage: `url(${bubble1})` }}></div>
            <div id='bubble2' className='bubble' style={{ backgroundImage: `url(${bubble2})` }}></div>
          </div>
          <div id='circle1' className='circle' style={{ backgroundImage: `url(${circle1})` }}></div>
          <div id='circle2' className='circle' style={{ backgroundImage: `url(${circle2})` }}></div>
          <div id='circle3' className='circle' style={{ backgroundImage: `url(${circle3})` }}></div>
          <div id='contentWrap'>
            <div id='title'>
              <span className={`${contentData && contentData.cities[domId].id ? `${contentData.cities[domId].id} ${language}` : ''}`}>{contentData && contentData.cities[domId].name}</span>
              <div id='cityIcon' className={`${contentData && contentData.cities[domId].id ? `${contentData.cities[domId].id} ${language}` : ''}`}>
                <span>
                  <div className='iconTitle' dangerouslySetInnerHTML={{ __html: contentData && contentData.global.iconTitle }}></div>
                  {contentData &&
                    contentData.cities[domId].icon &&
                    contentData.cities[domId].icon.map((v, i) => {
                      return (
                        <div key={i} className={`icon${i + 1}`}>
                          <img className={`${contentData.cities[domId].icon[i] ? '' : 'hide'}`} src={v} />
                        </div>
                      );
                    })}
                </span>
              </div>
            </div>
            <svg className={`${contentData && contentData.cities[domId].id ? `${contentData.cities[domId].id} ${language}` : ''}`}>
              {language === 'zh' && (
                <text x='0' y='75%' fill='none' stroke='#2F2D7C'>
                  {contentData && contentData.cities[domId].location}
                </text>
              )}
              {language === 'en' && (
                <text x='0' y='75%' fill='none' stroke='#2F2D7C'>
                  {contentData && contentData.cities[domId].location}
                </text>
              )}
            </svg>
            <div id='description' className={`${contentData && contentData.cities[domId].id ? `${contentData.cities[domId].id} ${language}` : ''}`}>
              {contentData && contentData.cities[domId].description}
            </div>
          </div>
          <div id='galleryListWrap' className={`${contentData && contentData.cities[domId].id}`}>
            <div id='dragForMore'>{contentData && contentData.global.dragMore}</div>
            <ul ref={galleryListElem} id='galleryList'>
              {contentData &&
                contentData.cities[domId].detailBlocks &&
                contentData.cities[domId].detailBlocks.map((v, i) => {
                  return (
                    <li key={i}>
                      <div className={`img ${contentData && contentData.cities[domId].id}`}>
                        <img src={v.image.src} />
                      </div>
                      <p className='credit'>{v.image.credit}</p>
                      <p>{v.image.caption}</p>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
        <div id='bg'></div>
      </div>
    </div>
  );
};

export default G02BContainer;
