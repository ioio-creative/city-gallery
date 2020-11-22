import React, { useState, useRef } from 'react';
import './style.scss';

import Menu from './Menu';
import Map from './Map';

import map1900 from './images/1900.png';
import map1900ed from './images/1900ed.png';
import map1945 from './images/1945.png';
import map1945ed from './images/1945ed.png';
import map1985 from './images/1985.png';
import map1985ed from './images/1985ed.png';
import map2019 from './images/2019.png';
import map2019ed from './images/2019ed.png';

import map1900pre from './images/1900pre.png';
import map1945pre from './images/1945pre.png';
import map1985pre from './images/1985pre.png';
import map2019pre from './images/2019pre.png';

import year1900 from './images/year1900.png';
import year1945 from './images/year1945.png';
import year1985 from './images/year1985.png';
import year2019 from './images/year2019.png';
import blurLeft1900 from './images/blurLeft.png';
import blurLeft1945 from './images/blurLeft.png';
import blurLeft1985 from './images/blurLeft.png';
import blurLeft2019 from './images/blurLeft2019.png';
import blurRight1900 from './images/blurRight.png';
import blurRight1945 from './images/blurRight.png';
import blurRight1985 from './images/blurRight.png';
import blurRight2019 from './images/blurRight2019.png';
import yearColor1900 from './images/yearColor.png';
import yearColor1945 from './images/yearColor.png';
import yearColor1985 from './images/yearColor.png';
import yearColor2019 from './images/yearColor2019.png';

import region1 from './images/region1.png';
import region2 from './images/region2.png';
import region3 from './images/region3.png';

import up_button from './images/up_button.png';
import down_button from './images/down_button.png';

import video1 from './images/video1.mp4';
import video2 from './images/video2.mp4';

import gsap from 'gsap';

const mapArray = [map1900, map1900ed, map1945, map1945ed, map1985, map1985ed, map2019, map2019ed];
const mapArrayPre = [map1900pre, map1945pre, map1985pre, map2019pre];
const yearArray = [year1900, year1945, year1985, year2019];
const blurLeft = [blurLeft1900, blurLeft1945, blurLeft1985, blurLeft2019];
const blurRight = [blurRight1900, blurRight1945, blurRight1985, blurRight2019];
const yearColor = [yearColor1900, yearColor1945, yearColor1985, yearColor2019];
const region = [region1, region2, region3];

const G303 = props => {
  const [yearIdx, setYearIdx] = useState(null);
  const [selectedYear, setSelectedYear] = useState(false);
  const [streetName, setStreetName] = useState(false);
  const [regionNumber, setRegionNumber] = useState(0);
  const [gameMode, setGameMode] = useState('l');
  const [fakeZoom, setFakeZoom] = useState(0);
  const [mapIndicatorIdx, setMapIndicatorIdx] = useState(0);
  const [isVideo, setIsVideo] = useState(false);
  const [videoNumber, setVideoNumber] = useState(null);
  const [zone, setZone] = useState([false, false, false]);

  const onClickMapIndicator = i => {
    setMapIndicatorIdx(i);
  };

  const onClickYear = e => {
    setYearIdx(e);
    if (e === 3) setStreetName(true);
    else setStreetName(false);
  };
  const onClickStart = () => {
    setSelectedYear(true);
    console.log(selectedYear);
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
      setZone([false, false, false]);
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
    setZone([false, false, false]);
    gsap.to(
      {},
      {
        duration: 2,
        onComplete: () => {
          setZone(() => {
            let temp = [false, false, false];
            temp[i] = true;
            return temp;
          });
        }
      }
    );
  };

  return (
    <div id='g303Dummy' className={`${gameMode === 'l' ? '' : 'hide'}`}>
      <div id='coast' className={`${gameMode === 'l' ? '' : 'hide'}`}>
        <div id='yearSelector' className={yearIdx === null ? 'disabled' : selectedYear ? 'hide' : ''}>
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
        <div id='mapCover' className={selectedYear ? 'hide' : yearIdx === null ? 'show' : ''}>
          {mapArrayPre.map((imgsrc, idx) => {
            return <img className={`${yearIdx === idx ? 'active' : ''}`} src={imgsrc} />;
          })}
        </div>
        <div id='mapWrapper' className={selectedYear}>
          {mapArray.map((imgsrc, idx) => {
            return <img className={`${idx % 2 === 0 ? 'base' : 'cover'} ${yearIdx * 2 === idx || (selectedYear && yearIdx * 2 + 1 === idx) ? 'active' : ''}`} src={imgsrc} />;
          })}
        </div>
        <div id='leftInfo'>
          <img alt='' className='blur' src={blurLeft[yearIdx]}></img>
          <img alt='' className='year' src={yearArray[yearIdx]}></img>
        </div>
      </div>

      <div id='rightInfo'>
        <img alt='' className='blur' src={blurRight[yearIdx]}></img>
        <img alt='' className='yearColor' src={yearColor[yearIdx]}></img>
      </div>
      {selectedYear && (
        <Menu
          handleZoom={{
            current: {
              zoomInOut: console.log
            }
          }}
          homeBtn={() => {
            setSelectedYear(false);
            {
              /* setYearIdx(0); */
            }
          }}
          streetName={streetName}
          setGameMode={setGameMode}
          toFakeZoom={toFakeZoom}
          leaveZoom={leaveFakeZoom}
          mapIndicatorIdx={mapIndicatorIdx}
          idx={videoNumber}
          isVideo={isVideo}
        />
      )}

      <div id='street' className={`${gameMode === 'r' ? '' : 'hide'}`}>
        {/* <img className={`smallMap ${gameMode === 'r' ? '' : 'hide'}`} src={`./images/ex303/small_map.png`}></img> */}
        <div className={`wrap`}>
          <img className={`zoomMap ${gameMode === 'r' ? '' : 'hide'} ${fakeZoom !== 0 ? `zoom${fakeZoom}` : ''}`} alt='' src={map2019ed}></img>
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
          {<video className={`${videoNumber === 1 ? '' : 'hide'}`} preload='auto' src={isVideo ? video2 : null} autoPlay={false} muted controls></video>}
        </div>
        <div
          className={`cross ${isVideo ? '' : 'hide'}`}
          onClick={() => {
            setIsVideo(false);
          }}
        >
          X
        </div>
        <div id='mapIndicator'>
          <span>分區</span>
          <ul>
            {[...Array(3)].map((v, i) => {
              return (
                // <li key={i} className={i === mapIndicatorIdx ? 'active' : ''} onClick={() => onClickMapIndicator(i)}>
                <li
                  key={i}
                  className={i === mapIndicatorIdx ? 'active' : ''}
                  // onClick={() => {
                  //   onClickMapIndicator(i);
                  //   setFakeZoom(i + 1);
                  //   zoneControl(i);
                  // }}
                >
                  {i + 1}
                </li>
              );
            })}
          </ul>
        </div>
        {(zone[0] || zone[1]) && (
          <>
            <img
              className={`toUp`}
              src={up_button}
              onClick={() => {
                onClickMapIndicator(1);
                setFakeZoom(1 + 1);
                zoneControl(1);
              }}
            ></img>
            <img
              className={`toDown ${!zone[0] ? 'active' : 'hide'}`}
              src={down_button}
              onClick={() => {
                onClickMapIndicator(0);
                setFakeZoom(0 + 1);
                zoneControl(0);
              }}
            ></img>
          </>
        )}
      </div>
    </div>
  );
};

export default G303;
