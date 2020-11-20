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
import gsap from 'gsap';

const mapArray = [map1900, map1900ed, map1945, map1945ed, map1985, map1985ed, map2019, map2019ed];
const mapArrayPre = [map1900pre, map1945pre, map1985pre, map2019pre];
const yearArray = [year1900, year1945, year1985, year2019];
const blurLeft = [blurLeft1900, blurLeft1945, blurLeft1985, blurLeft2019];
const blurRight = [blurRight1900, blurRight1945, blurRight1985, blurRight2019];
const yearColor = [yearColor1900, yearColor1945, yearColor1985, yearColor2019];

const G303 = props => {
  const [yearIdx, setYearIdx] = useState(null);
  const [selectedYear, setSelectedYear] = useState(false);
  const [streetName, setStreetName] = useState(false);
  const [gameMode, setGameMode] = useState('l');
  const [mapIndicatorIdx, setMapIndicatorIdx] = useState(0);
  const [fakeZoom, setFakeZoom] = useState(0);
  const [zone, setZone] = useState([false, false, false, false]);

  const onClickYear = e => {
    setYearIdx(e);
    // if (e === 3) setStreetName(true);
    // else setStreetName(false);
  };
  const onClickStart = () => {
    setSelectedYear(true);
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
    <div id='g303Dummy'>
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
        />
      )}
    </div>
  );
};

export default G303;
