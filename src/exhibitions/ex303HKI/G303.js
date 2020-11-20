import React, { useState, useRef, useEffect } from 'react';
import './style.scss';
import gsap from 'gsap';
import VideoPlayer from 'react-video-js-player';
import { Player } from 'video-react';

import Menu from './Menu';
import Map from './Map';

// import video1 from '../../../src/media/ex303/video1.mpg'
// import video2 from '../../../src/media/ex303/video2.mpg'

const G303 = props => {
  const [started, setStarted] = useState(false);
  const [yearIdx, setYearIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [mapIndicatorIdx, setMapIndicatorIdx] = useState(0);
  const [streetData, setStreetData] = useState(null);
  const [hm, setHm] = useState(true);
  const [fill, setFill] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [showYear, setShowYear] = useState(true);
  const [gameMode, setGameMode] = useState('l');
  const [fakeZoom, setFakeZoom] = useState(0);
  const [isVideo, setIsVideo] = useState(false);
  const [videoNumber, setVideoNumber] = useState(0);
  const [zone, setZone] = useState([false, false, false, false]);

  const handleZoom = useRef(null);
  const handleMove = useRef(null);
  const handleShowCoastline = useRef(null);
  const handleSelectCoastline = useRef(null);
  const handleStart = useRef(null);

  const videoSrc = ['./images/ex303/video1.mp4', './images/ex303/video2.mp4'];

  const onClickMapIndicator = i => {
    setMapIndicatorIdx(i);
    handleMove.current.updateMapIndicatorIdx(i, zoomed);
  };

  const fullOpacity = tf => {
    setFill(tf);
  };

  const onClickYear = i => {
    if (!started)
      if (i !== yearIdx) {
        setYearIdx(i);
        handleSelectCoastline.current.selectCoastline(i);
      }
  };

  const onClickStart = () => {
    if (yearIdx !== null) {
      setHm(false);
      // setStarted(true);
      setShowNav(false);
      setShowYear(false);
      handleStart.current.start(yearIdx);
      handleShowCoastline.current.showCoastline(yearIdx);
    }
  };

  const onBack = () => {
    setFill(false);
    setHm(true);
    // setYearIdx(0);
    setShowNav(false);
    setShowYear(true);
    handleShowCoastline.current.showCoastline(-1);
    // handleSelectCoastline.current.selectCoastline(null);
  };

  const toFakeZoom = () => {
    if (gameMode !== 'r') {
      setGameMode('r');
      gsap.to(
        {},
        {
          duration: 1,
          onComplete: () => {
            setFakeZoom(1);
          }
        }
      );
      zoneControl(0);
    }
  };

  const leaveFakeZoom = () => {
    if (gameMode !== 'l') {
      setZone([false, false, false, false]);
      setFakeZoom(0);
      gsap.to(
        {},
        {
          duration: 1.5,
          onComplete: () => {
            setGameMode('l');
          }
        }
      );
    }
  };

  const zoneControl = i => {
    setZone([false, false, false, false]);
    gsap.to(
      {},
      {
        duration: 2,
        onComplete: () => {
          setZone(() => {
            let temp = [false, false, false, false];
            temp[i] = true;
            return temp;
          });
        }
      }
    );
  };

  return (
    // <div id='main' className={`${started ? 'started' : ''}${zoomed ? ' zoomed' : ''}`}>
    <div id='main' className={`${started ? 'started' : ''}${gameMode === 'r' ? ' zoomed' : ''}`}>
      {/* fake dog */}
      <div id='coast' className={`${gameMode === 'l' ? '' : 'hide'}`}>
        <div className={`hmWrap ${hm ? '' : 'hide'}`}>
          <img className='baseMap' alt='' src={`./images/ex303/303_YearSelection_${yearIdx}.png`}></img>
        </div>

        <div className={`wrap ${yearIdx === 0 && !hm ? 'active' : 'hide'}`}>
          <img className={`island`} alt='' src='./images/ex303/1900_HKI.png'></img>
          <img className={`full ${fill ? 'true' : ''}`} alt='' src='./images/ex303/1900_BaseMap.png'></img>
        </div>

        <div className={`wrap ${yearIdx === 1 && !hm ? 'active' : 'hide'}`}>
          <img className={`island`} alt='' src='./images/ex303/1945_HKI.png'></img>
          <img className={`full ${fill ? 'true' : ''}`} alt='' src='./images/ex303/1945_BaseMap.png'></img>
        </div>

        <div className={`wrap ${yearIdx === 2 && !hm ? 'active' : 'hide'}`}>
          <img className={`island`} alt='' src='./images/ex303/1985_HKI.png'></img>
          <img className={`full ${fill ? 'true' : ''}`} alt='' src='./images/ex303/1985_BaseMap.png'></img>
        </div>

        <div className={`wrap ${yearIdx === 3 && !hm ? 'active' : 'hide'}`}>
          <img className={`island`} alt='' src='./images/ex303/2019_HKI.png'></img>
          <img className={`full ${fill ? 'true' : ''}`} alt='' src='./images/ex303/2019_BaseMap.png'></img>
        </div>

        <Map
          appData={props.appData}
          setOpacity={fullOpacity}
          setStreetData={setStreetData}
          setMapIndicatorIdx={setMapIndicatorIdx}
          setZoomed={setZoomed}
          handleZoom={handleZoom}
          handleMove={handleMove}
          handleShowCoastline={handleShowCoastline}
          handleSelectCoastline={handleSelectCoastline}
          handleStart={handleStart}
          show={setShowNav}
        />
        <img className={`yearMark ${!hm ? '' : 'hide'}`} src={`./images/ex303/${yearIdx}_mark.png`}></img>
        <img className={`nav_2019_sea ${yearIdx === 3 && showNav ? '' : 'hide'}`} src={`./images/ex303/2019_nav_right.png`}></img>
        <img className={`nav_2019_sea ${(yearIdx === 0 || yearIdx === 1 || yearIdx === 2) && showNav ? '' : 'hide'}`} src={`./images/ex303/non_2019_nav_right.png`}></img>
      </div>

      <div id='street' className={`${gameMode === 'r' ? '' : 'hide'}`}>
        <img className={`nav_2019_sea ${gameMode === 'r' ? '' : 'hide'}`} src={`./images/ex303/SNM_nav_right.png`}></img>
        <img className={`disclaimer ${gameMode === 'r' ? '' : 'hide'}`} src={`./images/ex303/disclaimer.png`}></img>
        <img className={`smallMap ${gameMode === 'r' ? '' : 'hide'}`} src={`./images/ex303/small_map.png`}></img>
        <div className={`wrap`}>
          <img className={`zoomMap ${gameMode === 'r' ? '' : 'hide'} ${fakeZoom !== 0 ? `zoom${fakeZoom}` : ''}`} alt='' src='./images/ex303/2019_Zoom_BaseMap.png'></img>
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
          {/* {videoNumber === 0 && <VideoPlayer
            controls={true}
            autoplay={false}
            preload={'auto'}
            bigPlayButton={true}
            hideControls={['play', 'volume', 'playbackrates', 'fullscreen']}
            src="./images/ex303/video1.mp4"
          />}
          {videoNumber === 1 && <VideoPlayer
            controls={true}
            autoplay={false}
            preload={'auto'}
            bigPlayButton={true}
            hideControls={['play', 'volume', 'playbackrates', 'fullscreen']}
            src="./images/ex303/video2.mp4"
          />} */}
          {videoNumber === 0 && <video className='' src='../images/ex303/video1.mp4' autoPlay={true} muted loop></video>}
        </div>
        <div
          className={`cross ${isVideo ? '' : 'hide'}`}
          onClick={() => {
            setIsVideo(false);
          }}
        >
          X
        </div>
        <img className={`toRight ${isVideo ? 'active' : 'hide'}`} src='./images/ex303/right_button.png'></img>
        <img className={`toLeft ${isVideo && !zone[0] ? 'active' : 'hide'}`} src='./images/ex303/left_button.png'></img>
      </div>
      {/* fake dog */}

      <img className={`legend ${fill && (yearIdx === 0 || yearIdx === 1 || yearIdx === 2) ? '' : 'hide'}`} alt='' src='./images/ex303/HKI_legend.png'></img>
      <img className={`legend ${fill && yearIdx === 3 ? '' : 'hide'}`} alt='' src='./images/ex303/HKI_legend_white.png'></img>
      {/* <img className={`correction ${gameMode === "r" ? '' : 'hide'}`} alt='' src='./images/ex303/hkislandstnamegame_quarrybay.png'></img> */}

      <div id='yearSelector' className={`${yearIdx === null ? 'disabled' : ''} ${showYear ? '' : 'hide'}`}>
        <ul>
          {['1900', '1945', '1985', '2019'].map((v, i) => {
            return (
              <li key={i} className={i === yearIdx ? 'active' : ''} onClick={() => onClickYear(i)}>
                <span>{v}</span>
              </li>
            );
          })}
        </ul>
        <div id='startBtn' onClick={onClickStart}>
          確定
        </div>
      </div>
      <div id='mapIndicator'>
        <span>分區</span>
        <ul>
          {[...Array(4)].map((v, i) => {
            return (
              // <li key={i} className={i === mapIndicatorIdx ? 'active' : ''} onClick={() => onClickMapIndicator(i)}>
              <li
                key={i}
                className={i === mapIndicatorIdx ? 'active' : ''}
                onClick={() => {
                  onClickMapIndicator(i);
                  setFakeZoom(i + 1);
                  zoneControl(i);
                }}
              >
                {i + 1}
              </li>
            );
          })}
        </ul>
      </div>
      <div id='streetInfo'>
        {streetData && <h1>{streetData.name}</h1>}
        {/* <div id='markerOuterWrap'>
          <div id='markerWrap'>
            {props.appData.streets[mapIndicatorIdx].map((v, i) => {
              return <span key={i} style={{ transform: `translate3d(${v.marker.x}px, ${v.marker.y}px, 0` }}></span>;
            })}
          </div>
        </div> */}
      </div>

      <Menu handleZoom={handleZoom} back={onBack} show={showNav} yearIdx={yearIdx} gameMode={setGameMode} mapIndicatorIdx={mapIndicatorIdx} toFakeZoom={toFakeZoom} leaveZoom={leaveFakeZoom} />
    </div>
  );
};

export default G303;
