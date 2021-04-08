import React, { useState, useRef, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
import './style.scss';
import webSocket from 'socket.io-client';
import VideoPlayer from '../../components/VideoPlayer';

import Menu from '../ex303HKI/MenuSmall';
import Map from '../ex303HKI/Map';

const G303 = props => {
  // const params = useParams();
  const [language, setLanguage] = useState('tc');
  // const [started, setStarted] = useState(false);
  const [yearIdx, setYearIdx] = useState(-1);
  const [tutorIdx, setTutorIdx] = useState(0);
  // const [zoomed, setZoomed] = useState(false);
  // const [mapIndicatorIdx, setMapIndicatorIdx] = useState(0);
  // const [streetData, setStreetData] = useState(null);
  // const [home, setHome] = useState(true);
  // const [fill, setFill] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [showYear, setShowYear] = useState(true);
  const [gameMode, setGameMode] = useState('home');
  // const [fakeZoom, setFakeZoom] = useState(0);
  // const [isVideo, setIsVideo] = useState(false);
  // const [videoNumber, setVideoNumber] = useState(null);
  const [zone, setZone] = useState(0);
  const [coastlineIdx, setCoastlineIdx] = useState(null);
  const [streetIdx, setStreetIdx] = useState(null);
  const [runTransition, setRunTransition] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [socket, setSocket] = useState(null);
  // const [showWholeScreen, setShowWholeScreen] = useState(params.fullscreen !== undefined ? true : false);

  // const handleZoom = useRef(null);
  const handleMove = useRef(null);
  const handleShowCoastline = useRef(null);
  const handleSelectCoastline = useRef(null);
  const handleStart = useRef(null);
  // const video1Ref = useRef(null);

  // const videoSrc = ['./images/ex303/video1.mp4', './images/ex303/video2.mp4'];
  const years = ['1900', '1945', '1985', '2019'];

  useEffect(() => {
    let started = false;

    const enter = () => {
      if (!started) {
        started = true;
        // setShowWholeScreen(true);
        // onBack();
      }
    };

    const leave = () => {
      if (started) {
        started = false;
        // setShowWholeScreen(false);
        setYearIdx(-1);
        onBack();
      }
    };

    const getNavigationIndex = d => {
      onClickYear(d.index, true);
    };

    if (socket) {
      socket.on('userEnter', enter);
      socket.on('userLeave', leave);
      socket.on('navigationIndex', getNavigationIndex);
    } else {
      setSocket(webSocket('http://localhost:80/'));
    }

    return () => {
      if (socket) {
        socket.off('userEnter', enter);
        socket.off('userLeave', leave);
        socket.off('navigationLeft', getNavigationIndex);
      }
    };
  }, [socket]);

  const onClickYear = (i, isSocket = false) => {
    if (i !== yearIdx) {
      setYearIdx(i);
      handleSelectCoastline.current.selectCoastline(i);

      if (!isSocket) socket.emit('navigationIndex', { data: { index: i } });
    }
  };

  const onStart = () => {
    if (yearIdx >= 0) {
      socket.emit('selectIndex', { data: { index: yearIdx } });
      setShowYear(false);
      // setTimeout(() => {
        setRunTransition(true);
        handleStart.current.start(yearIdx);
        handleShowCoastline.current.showCoastline(yearIdx);
      // }, 2000);
    }
  };

  const onBack = () => {
    // setYearIdx(-1);
    setCoastlineIdx(null);
    setStreetIdx(null);
    setZone(0);
    setRunTransition(true);
    setShowYear(true);
    handleShowCoastline.current.showCoastline(-1);
  };

  const onShowTutor = bool => {
    setShowTutor(bool);
    setTutorIdx(0);
  };

  const pxToVw = (px, isMarker = true) => {
    if (isMarker) return ((px + 61 / 2 - 7) / 1920) * 100 + 'vw';
    else return ((px - 12) / 1920) * 100 + 'vw';
  };
  const pxToVh = (px, isMarker = true) => {
    if (isMarker) return ((px + 69 - 8) / 1080) * 100 + 'vh';
    else return ((px - 13) / 1080) * 100 + 'vh';
  };

  const globalData = props.appData.tst.contents[language].global;
  const coastlineData = props.appData.tst.contents[language].coastline;
  const streetData = props.appData.tst.contents[language].street;

  return (
    // <div id='main' className={`${started ? 'started' : ''}${zoomed ? ' zoomed' : ''}`}>
    <div id='main' className={`${language}`} onTouchStart={()=> socket.emit('onTouchStart')}>
      <Map
        locationName='tst'
        doubleScreen={false}
        appData={props.appData}
        gameMode={gameMode}
        setGameMode={setGameMode}
        zone={zone}
        showYear={showYear}
        // setOpacity={fullOpacity}
        // setStreetData={setStreetData}
        // setMapIndicatorIdx={setMapIndicatorIdx}
        // setZoomed={setZoomed}
        // handleZoom={handleZoom}
        handleMove={handleMove}
        handleShowCoastline={handleShowCoastline}
        handleSelectCoastline={handleSelectCoastline}
        handleStart={handleStart}
        showNav={setShowNav}
        setRunTransition={setRunTransition}
      />
      <div id='coast' className={showYear ? 'hide' : yearIdx === 3 && gameMode === 'coast' ? '' : gameMode === 'home' ? 'hide' : `hide zone${zone + 1}`}>
        <div id='locationsWrap'>
          <div id='locations' className='streetFont'>
            {globalData &&
              globalData.locations.map((v, i) => {
                if (i > 0) return <div key={i}>{v}</div>;
                else return;
              })}
          </div>
        </div>
        <div id='contentWrap' className={coastlineIdx !== null ? 'showCard' : ''}>
          {coastlineData &&
            coastlineData.map((v, i) => {
              return (
                <div key={i} className={`item ${coastlineIdx === i ? 'show' : ''}`}>
                  <div id='markerWrap' style={{ left: pxToVw(v.marker.pos.x), top: pxToVh(v.marker.pos.y) }}>
                    <span id='marker' onClick={() => setCoastlineIdx(i)}></span>
                    <span id='location' dangerouslySetInnerHTML={{ __html: v.marker.name }}></span>
                  </div>
                  <div id='card'>
                    <div id='closeBtn' onClick={() => setCoastlineIdx(null)}>
                      <span></span>
                      <span></span>
                    </div>
                    <div id='wrap'>
                      <div id='title'>
                        <span dangerouslySetInnerHTML={{ __html: v.cardContent.title }}></span>
                        {/* <span>{v.cardContent.completedYear}</span> */}
                      </div>
                      <div id='imgWrap'>
                        <img src={v.cardContent.image.src} alt='' />
                      </div>
                      <ul id='info'>
                        {v.cardContent.info.map((vi, j) => {
                          return (
                            <li key={j}>
                              <span>{vi[0]}</span>
                              <span>{vi[1]}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <div id='btnOuterWrap'>
                      <div className='btnWrap'>
                        {i - 1 >= 0 && (
                          <div id='prevBtn' onClick={() => setCoastlineIdx(i - 1)}>
                            <div id='icon'>
                              <svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'>
                                <g>
                                  <g fill='none' stroke='#70ccb8' strokeLinecap='round' strokeWidth='2'>
                                    <path d='M26.339 33.179L14.037 20.877' />
                                    <path d='M26.339 8.575L14.037 20.877' />
                                  </g>
                                </g>
                              </svg>
                            </div>
                            {/* <span dangerouslySetInnerHTML={{ __html: coastlineData[i - 1].cardContent.title }}></span> */}
                          </div>
                        )}
                      </div>
                      <div className='btnWrap'>
                        {i + 1 < coastlineData.length && (
                          <div id='nextBtn' onClick={() => setCoastlineIdx(i + 1)}>
                            <div id='icon'>
                              <svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'>
                                <g>
                                  <g fill='none' stroke='#70ccb8' strokeLinecap='round' strokeWidth='2'>
                                    <path d='M15.618 8.437L27.92 20.739' />
                                    <path d='M15.618 33.041L27.92 20.739' />
                                  </g>
                                </g>
                              </svg>
                            </div>
                            {/* <span dangerouslySetInnerHTML={{ __html: coastlineData[i + 1].cardContent.title }}></span> */}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          <div id='bg' onClick={() => setCoastlineIdx(null)}></div>
        </div>
      </div>

      <div id='street' className={`${gameMode === 'street' ? '' : 'hide'} ${streetIdx !== null ? 'showVideo' : ''}`}>
        <div
          id='prevZoneBtn'
          className={`zoneBtn ${zone > 0 ? '' : 'hide'}`}
          onClick={() => {
            if (zone > 0) setZone(zone - 1);
          }}
        ></div>
        <div
          id='nextZoneBtn'
          className={`zoneBtn ${zone < 2 ? '' : 'hide'}`}
          onClick={() => {
            if (zone < 3) setZone(zone + 1);
          }}
        ></div>
        <div id='mapIndicator'>
          <span className='streetFont'>{globalData && globalData.area}</span>
          <ul>
            {[...Array(3)].map((v, i) => {
              return (
                // <li key={i} className={i === mapIndicatorIdx ? 'active' : ''} onClick={() => onClickMapIndicator(i)}>
                <li
                  key={i}
                  className={i === zone ? 'active' : ''}
                  onClick={() => {
                    setZone(i);
                  }}
                >
                  <span>{i + 1}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div id='locationsWrap' className={`${gameMode === 'street' ? `zone${zone + 1}` : ''}`}>
          <div id='locations' className='streetFont'>
            <div id='zone1' className={zone === 0 ? '' : 'hide'}>
              <div className='name'>{globalData && globalData.locations[3]}</div>
            </div>
            <div id='zone2' className={zone === 1 ? '' : 'hide'}>
              <div className='name'>{globalData && globalData.locations[1]}</div>
            </div>
            <div id='zone3' className={zone === 2 ? '' : 'hide'}>
              <div className='name'>{globalData && globalData.locations[0]}</div>
            </div>
          </div>
        </div>
        <div id='contentWrap' className={`${gameMode === 'street' ? `zone${zone + 1}` : ''}`}>
          <div id='contents'>
            {streetData &&
              streetData.map((v, i) => {
                return (
                  <div key={i} className={`item ${streetIdx === i ? 'active' : ''} ${zone + 1 === v.zone ? '' : 'hide'}`}>
                    <div id='markerWrap' style={{ left: pxToVw(v.marker.pos.x), top: pxToVh(v.marker.pos.y) }}>
                      <span id='marker' onClick={() => setStreetIdx(i)}>
                        <span id={`location`} className={`${v.marker.namePos} ${v.marker.id ? v.marker.id : ''}`} dangerouslySetInnerHTML={{ __html: v.marker.name }}></span>
                      </span>
                    </div>
                    <div id='roadWrap' style={{ left: pxToVw(v.road.pos.x, false), top: pxToVh(v.road.pos.y, false) }}>
                      <img src={streetIdx !== i && streetIdx !== null ? v.road.inactiveImage.src : v.road.image.src} alt='' />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        {streetData && streetIdx !== null && (
          <div id='videoWrap'>
            <div id='closeBtn' onClick={() => setStreetIdx(null)}></div>
            <VideoPlayer poster={streetData[streetIdx].road.video.poster.src} controls={true} autoplay={false} hideControls={['volume', 'playbackrates', 'fullscreen']} src={streetData[streetIdx].road.video.src} />
          </div>
        )}
        <div id='closeArea' onClick={() => setStreetIdx(null)}></div>
      </div>

      <div id='currentYear' className={`${showYear ? 'disabled' : gameMode !== 'coast' ? 'disabled' : ''} ${yearIdx === 3 ? 'w' : ''} eb`}>
        {years[yearIdx]}
      </div>
      <div id='yearSelector' className={`${yearIdx < 0 ? 'disabled' : ''} ${showYear && gameMode === 'home' ? '' : 'hide'}`}>
        <ul className='eb'>
          {['1900', '1945', '1985', '2019'].map((v, i) => {
            return (
              <li key={i} className={i === yearIdx ? 'active' : ''} onClick={() => onClickYear(i)}>
                <span>{v}</span>
              </li>
            );
          })}
        </ul>
        <div id='btnWrap' className={yearIdx >= 0 ? `idx_${yearIdx} active` : ''}>
          <span id='arrow'></span>
          <div id='startBtn' className={`${yearIdx < 0 ? 'disabled' : ''} ${showYear ? '' : 'hide'}`} onClick={onStart}>
            {globalData && globalData.confirm}
          </div>
          {globalData && (
            <p>
              <span>{yearIdx < 3 ? globalData.mapViewing : globalData.coastInfo}</span>
              {yearIdx >= 3 && <span>{globalData.streetInfo}</span>}
            </p>
          )}
        </div>
      </div>
      <div id='yearOfCoastline' className={`${showYear || coastlineIdx !== null || streetIdx !== null ? 'disabled' : gameMode === 'home' ? 'disabled' : gameMode === 'street' ? 'zoomed' : ''} ${yearIdx === 3 ? 'w' : 'b'} ${language === 'en' ? 'en' : 'zh'}`}>
        <p>{gameMode === 'street' ? `500 ${language === 'en' ? 'm' : '米'}` : `825 ${language === 'en' ? 'm' : '米'}`}</p>
        <span></span>
      </div>
      <div id='ref' className={`${showYear ? 'hide' : gameMode === 'home' ? 'hide' : ''} ${yearIdx === 3 ? 'w' : ''}`} dangerouslySetInnerHTML={{ __html: globalData && globalData.reference }}></div>
      <div id='popupTutor' className={showTutor ? 'active' : ''}>
        <div id='content' className={`slide${tutorIdx + 1}`}>
          <div id='title'>
            <p>{globalData && globalData.tutor[tutorIdx][0]}</p>
            <span>{globalData && globalData.tutor[tutorIdx][1]}</span>
          </div>
          <div id='man'>
            <span></span>
          </div>
          <div id='leftBtn' className={`btn ${tutorIdx === 0 ? 'hide' : ''}`} onClick={() => setTutorIdx(0)}></div>
          <div id='rightBtn' className={`btn ${tutorIdx === 1 ? 'hide' : ''}`} onClick={() => setTutorIdx(1)}></div>
        </div>
        <div id='bg' onClick={() => onShowTutor(false)}></div>
      </div>

      <Menu
        locationName='tst'
        globalData={globalData}
        streetData={streetData}
        language={language}
        setLanguage={setLanguage}
        runTransition={runTransition}
        onShowTutor={onShowTutor}
        back={onBack}
        showNav={showNav}
        showYear={showYear}
        yearIdx={yearIdx}
        gameMode={gameMode}
        setGameMode={setGameMode}
        streetIdx={streetIdx}
        setStreetIdx={setStreetIdx}
        setCoastlineIdx={setCoastlineIdx}
        zone={zone}
        setZone={setZone}
        socket={socket}
      />
    </div>
  );
};

export default G303;
