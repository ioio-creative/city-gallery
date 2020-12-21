import React, { useState, useRef, useEffect } from 'react';
import './style.scss';
// import gsap from 'gsap';
// import VideoPlayer from 'react-video-js-player';
// import { Player } from 'video-react';
import VideoPlayer from '../../components/VideoPlayer';

import Menu from './Menu';
import Map from './Map';

// import video1 from '../../../src/media/ex303/video1.mp4';
// import video2 from '../../../src/media/ex303/video2.mp4';
// import img from './images/image.png';

const G303 = props => {
  const [language, setLanguage] = useState('tc');
  // const [started, setStarted] = useState(false);
  const [yearIdx, setYearIdx] = useState(-1);
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

  // const handleZoom = useRef(null);
  const handleMove = useRef(null);
  const handleShowCoastline = useRef(null);
  const handleSelectCoastline = useRef(null);
  const handleStart = useRef(null);
  // const video1Ref = useRef(null);

  // const videoSrc = ['./images/ex303/video1.mp4', './images/ex303/video2.mp4'];
  const years = ['1900', '1945', '1985', '2019'];

  // const onClickMapIndicator = i => {
  //   setMapIndicatorIdx(i);
  //   handleMove.current.updateMapIndicatorIdx(i, zoomed);
  // };

  // const fullOpacity = tf => {
  //   setFill(tf);
  // };

  const onClickYear = i => {
    // if (!started)
      if (i !== yearIdx) {
        setYearIdx(i);
        handleSelectCoastline.current.selectCoastline(i);
      }
  };

  const onClickStart = () => {
    if (yearIdx >= 0) {
      // setHome(false);
      // setStarted(true);
      //setShowNav(false);
      setShowYear(false);
      handleStart.current.start(yearIdx);
      handleShowCoastline.current.showCoastline(yearIdx);
    }
  };

  const onBack = () => {
    // setFill(false);
    // setHome(true);
    setGameMode('home');
    // setYearIdx(0);
    setShowNav(false);
    setShowYear(true);
    handleShowCoastline.current.showCoastline(-1);
    // handleSelectCoastline.current.selectCoastline(null);
  };

  // const toFakeZoom = () => {
  //   if (gameMode !== 'street') {
  //     setGameMode('street');
  //     gsap.to(
  //       {},
  //       {
  //         duration: 1,
  //         onComplete: () => {
  //           setFakeZoom(1);
  //         }
  //       }
  //     );
  //     zoneControl(0);
  //   }
  // };

  // const leaveFakeZoom = () => {
  //   if (gameMode !== 'coast') {
  //     setZone([false, false, false, false]);
  //     setFakeZoom(0);
  //     gsap.to(
  //       {},
  //       {
  //         duration: 1.5,
  //         onComplete: () => {
  //           setGameMode('coast');
  //         }
  //       }
  //     );
  //   }
  // };

  // const zoneControl = i => {
  //   setZone([false, false, false, false]);
  //   gsap.to(
  //     {},
  //     {
  //       duration: 2,
  //       onComplete: () => {
  //         setZone(() => {
  //           let temp = [false, false, false, false];
  //           temp[i] = true;
  //           return temp;
  //         });
  //       }
  //     }
  //   );
  // };

  const pxToVw = (px, isMarker = true) => {
    if(isMarker)
      return (px + 61/2 - 10) / 3840 * 100+'vw';
    else
      return (px - 15) / 3840 * 100+'vw';
  }
  const pxToVh = (px, isMarker = true) => {
    if(isMarker)
      return (px + 69 - 5) / 1080 * 100+'vh';
    else
      return (px - 10) / 1080 * 100+'vh';
  }

  const globalData = props.appData.hki.contents[language].global;
  const coastlineData = props.appData.hki.contents[language].coastline;
  const streetData = props.appData.hki.contents[language].street;

  return (
    // <div id='main' className={`${started ? 'started' : ''}${zoomed ? ' zoomed' : ''}`}>
    <div id='main'>
      <Map
          locationName="hki"
          doubleScreen={true}
          appData={props.appData}
          gameMode={gameMode}
          setGameMode={setGameMode}
          zone={zone}
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
        />
      <div id="coast" className={yearIdx === 3 && gameMode === 'coast' ? '' : 'hide'}>
        <div id="locationsWrap">
          <div id="locations" className="streetFont">
            <div>堅尼地城</div>
            <div>上環 </div>
            <div>中環</div>
            <div>灣仔</div>
            <div>銅鑼灣</div>
            <div>北角</div>
            <div>鰂魚涌</div>
            <div>筲箕灣</div>
          </div>
        </div>
        <div id="contentWrap" className={coastlineIdx !== null ? 'showCard' : ''}>
          {
            coastlineData &&
            coastlineData.map((v, i)=>{
              return <div key={i} className={`item ${coastlineIdx === i ? 'show': ''}`}>
                <div id="markerWrap" style={{left:pxToVw(v.marker.pos.x),top:pxToVh(v.marker.pos.y)}}>
                  <span id="marker" onClick={()=> setCoastlineIdx(i)}></span>
                  <span id="location" dangerouslySetInnerHTML={{__html:v.marker.name}}></span>
                </div>
                <div id="card">
                  <div id="closeBtn" onClick={()=> setCoastlineIdx(null)}><span></span><span></span></div>
                  <div id="wrap">
                    <div id="title"><span>{v.cardConetnt.title}</span><span>{v.cardConetnt.completedYear}</span></div>
                    <img src={v.cardConetnt.image.src} />
                    <ul id="info">
                    {
                      v.cardConetnt.info.map((vi, j)=>{
                        return <li key={j}><span>{vi[0]}</span><span>{vi[1]}</span></li>
                      })
                    }
                    </ul>
                    <div id="btnOuterWrap">
                      <div className="btnWrap">{i-1 >= 0 && <div id="prevBtn" onClick={()=> setCoastlineIdx(i-1)}><span dangerouslySetInnerHTML={{__html:coastlineData[i-1].marker.name}}></span></div>}</div>
                      <div className="btnWrap">{i+1 < coastlineData.length && <div id="nextBtn" onClick={()=> setCoastlineIdx(i+1)}><span dangerouslySetInnerHTML={{__html:coastlineData[i+1].marker.name}}></span></div>}</div>
                    </div>
                  </div>
                </div>
              </div>
            })
          }
        </div>
      </div>

      <div id="street" className={`${gameMode === 'street' ? '' : 'hide'} ${streetIdx !== null ? 'showVideo' : ''}`}>
        <div id="prevZoneBtn" className={`zoneBtn ${zone > 0 ? '' : 'hide'}`} onClick={()=> {if(zone > 0) setZone(zone-1)}}></div>
        <div id="nextZoneBtn" className={`zoneBtn ${zone < 3 ? '' : 'hide'}`} onClick={()=> {if(zone < 3) setZone(zone+1)}}></div>
        <div id="mapIndicator">
          <span className="streetFont">分區</span>
          <ul>
            {[...Array(4)].map((v, i) => {
              return (
                // <li key={i} className={i === mapIndicatorIdx ? 'active' : ''} onClick={() => onClickMapIndicator(i)}>
                <li key={i} className={i === zone ? 'active' : ''} onClick={() => { setZone(i);}}>
                  <span>{i + 1}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div id="locationsWrap" className={`${gameMode === 'street' ? `zone${zone+1}` : ''}`}>
          <div id="locations" className="streetFont">
            <div id="zone1" className={zone === 0 ? '' : 'hide'}>
              <div className="name">上環</div>
            </div>
            <div id="zone2" className={zone === 1 ? '' : 'hide'}>
              <div className="name">中環</div>
              <div className="name">灣仔</div>
            </div>
            <div id="zone3" className={zone === 2 ? '' : 'hide'}>
              <div className="name">銅鑼灣</div>
              <div className="name">北角</div>
            </div>
            <div id="zone4" className={zone === 3 ? '' : 'hide'}>
              <div className="name">鰂魚涌</div>
            </div>
          </div>
        </div>
        <div id="contentWrap" className={`${gameMode === 'street' ? `zone${zone+1}` : ''}`}>
          <div id="contents">
            {
              streetData &&
              streetData.map((v, i)=>{
                return <div key={i} className={`item ${streetIdx !== i && streetIdx !== null ? 'inactive' : ''} ${zone+1 === v.zone ? '' : 'hide'}`}>
                  <div id="markerWrap" style={{left:pxToVw(v.marker.pos.x),top:pxToVh(v.marker.pos.y)}}>
                    <span id="marker" onClick={()=> setStreetIdx(i)}>
                      <span id="location" className={v.marker.namePos} dangerouslySetInnerHTML={{__html:v.marker.name}}></span>
                    </span>
                  </div>
                  <div id="roadWrap" style={{left:pxToVw(v.road.pos.x, false),top:pxToVh(v.road.pos.y, false)}}>
                    <img src={streetIdx !== i && streetIdx !== null ? v.road.inactiveImage.src : v.road.image.src} />
                  </div>
                </div>
              })
            }
          </div>
        </div>
        {
          streetData &&
          streetIdx !== null &&
          <div id="videoWrap">
            <div id="closeBtn" onClick={()=>setStreetIdx(null)}></div>
            <VideoPlayer
              poster={streetData[streetIdx].road.video.poster.src}
              controls={true}
              autoplay={false}
              hideControls={['volume','playbackrates','fullscreen']}
              src={streetData[streetIdx].road.video.src}
            />
          </div>
        }
         {/* <img className={`nav_2019_sea ${gameMode === 'street' ? '' : 'hide'}`} src={`./images/ex303/SNM_nav_right.png`}></img>
        <img className={`disclaimer ${gameMode === 'street' ? '' : 'hide'}`} src={`./images/ex303/disclaimer.png`}></img>
        <img className={`smallMap ${gameMode === 'street' ? '' : 'hide'}`} src={`./images/ex303/small_map.png`}></img>
        <div className={`wrap`}>
          <img className={`zoomMap ${gameMode === 'street' ? '' : 'hide'} ${fakeZoom !== 0 ? `zoom${fakeZoom}` : ''}`} alt='' src='./images/ex303/2019_Zoom_BaseMap.png'></img>
        </div>
        <svg
          className={`dot d1 ${zone[0] ? '' : 'hide'} ${isVideo ? 'active' : ''}`}
          xmlns='http://www.w3.org/2000/svg'
          width='55.3'
          height='64'
          viewBox='0 0 44.258 53.348'
          onClick={() => {
            setIsVideo(true);
            setVideoNumber(0);
          }}
        >
          <path
            id='dot1'
            data-name='Path 203'
            d='M136.5,244.418a22.122,22.122,0,0,0-16.655,36.691l-.008.008.105.1a22.217,22.217,0,0,0,1.882,1.882l14.662,14.662,14.494-14.494a22.123,22.123,0,0,0-14.48-38.854Zm0,27.855a5.726,5.726,0,1,1,5.725-5.726A5.726,5.726,0,0,1,136.5,272.273Z'
            transform='translate(-114.371 -244.418)'
            fill='#FFF'
          />
        </svg>
        <img className={`road r1 ${zone[0] ? '' : 'hide'}`} alt='' src='./images/ex303/hollywood_path.png'></img>
        <svg
          className={`dot d2 ${zone[1] ? '' : 'hide'} ${isVideo ? 'active' : ''}`}
          xmlns='http://www.w3.org/2000/svg'
          width='55.3'
          height='64'
          viewBox='0 0 44.258 53.348'
          onClick={() => {
            setIsVideo(true);
            setVideoNumber(1);
          }}
        >
          <path
            id='dot2'
            data-name='Path 203'
            d='M136.5,244.418a22.122,22.122,0,0,0-16.655,36.691l-.008.008.105.1a22.217,22.217,0,0,0,1.882,1.882l14.662,14.662,14.494-14.494a22.123,22.123,0,0,0-14.48-38.854Zm0,27.855a5.726,5.726,0,1,1,5.725-5.726A5.726,5.726,0,0,1,136.5,272.273Z'
            transform='translate(-114.371 -244.418)'
            fill='#FFF'
          />
        </svg>
        <img className={`road r2 ${zone[1] ? '' : 'hide'}`} alt='' src='./images/ex303/cannon_path.png'></img>
        <div className={`videoWrap ${isVideo ? 'active' : 'hide'}`}></div>

        <div className={`${isVideo ? '' : 'hide'}`}>
          {<video className={`${videoNumber === 0 ? '' : 'hide'}`} preload='auto' src={isVideo ? video1 : null} autoPlay={false} muted controls></video>}
          {<video className={`${videoNumber === 1 ? '' : 'hide'}`} preload='auto' src={video2} autoPlay={false} muted controls></video>}
        </div> */}
        {/*<div
          className={`cross ${isVideo ? '' : 'hide'}`}
          onClick={() => {
            setIsVideo(false);
          }}
        >
          X
        </div>
        {(zone[0] || zone[1]) && (
          <>
            <img
              className={`toRight`}
              src='./images/ex303/right_button.png'
              onClick={() => {
                onClickMapIndicator(1);
                setFakeZoom(1 + 1);
                zoneControl(1);
              }}
            ></img>
            <img
              className={`toLeft ${!zone[0] ? 'active' : 'hide'}`}
              src='./images/ex303/left_button.png'
              onClick={() => {
                onClickMapIndicator(0);
                setFakeZoom(0 + 1);
                zoneControl(0);
              }}
            ></img>
          </>
        )} */}
      </div>

      {/* <img className={`legend ${fill && (yearIdx === 0 || yearIdx === 1 || yearIdx === 2) ? '' : 'hide'}`} alt='' src='./images/ex303/HKI_legend.png'></img>
      <img className={`legend ${fill && yearIdx === 3 ? '' : 'hide'}`} alt='' src='./images/ex303/HKI_legend_white.png'></img> */}
      {/* <img className={`correction ${gameMode === "r" ? '' : 'hide'}`} alt='' src='./images/ex303/hkislandstnamegame_quarrybay.png'></img> */}

      <div id="currentYear" className={`${gameMode !== 'coast' ? 'disabled' : ''} ${yearIdx === 3 ? 'w' : ''} eb`}>{years[yearIdx]}</div>
      <div id='yearSelector' className={`${yearIdx < 0 ? 'disabled' : ''} ${showYear ? '' : 'hide'}`}>
        <ul className="eb">
          {['1900', '1945', '1985', '2019'].map((v, i) => {
            return (
              <li key={i} className={i === yearIdx ? 'active' : ''} onClick={() => onClickYear(i)}>
                <span>{v}</span>
              </li>
            );
          })}
        </ul>
        <div id='startBtn' onClick={onClickStart}>{globalData && globalData.confirm}</div>
      </div>
      <div id="yearOfCoastline" className={`${gameMode === 'home' ? 'disabled' : ''} ${yearIdx === 3 ? 'w' : ''}`}></div>
      
      {/* <div id='streetInfo'> */}
        {/* {streetData && <h1>{streetData.name}</h1>} */}
        {/* <div id='markerOuterWrap'>
          <div id='markerWrap'>
            {props.appData.streets[mapIndicatorIdx].map((v, i) => {
              return <span key={i} style={{ transform: `translate3d(${v.marker.x}px, ${v.marker.y}px, 0` }}></span>;
            })}
          </div>
        </div> */}
      {/* </div> */}

      <Menu 
        globalData={globalData}
        streetData={streetData}
        language={language}
        setLanguage={setLanguage}
        back={onBack}
        showNav={showNav} 
        yearIdx={yearIdx} 
        gameMode={gameMode}
        setGameMode={setGameMode} 
        streetIdx={streetIdx}
        setStreetIdx={setStreetIdx}
        zone={zone}
        setZone={setZone} />
    </div>
  );
};

export default G303;
