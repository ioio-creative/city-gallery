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

const mapArray = [
  map1900,
  map1900ed,
  map1945,
  map1945ed,
  map1985,
  map1985ed,
  map2019,
  map2019ed
];
const mapArrayPre = [
  map1900pre,
  map1945pre,
  map1985pre,
  map2019pre
];
const G303 = props => {
  const [yearIdx, setYearIdx] = useState(null);
  const [selectedYear, setSelectedYear] = useState(false);

  const onClickYear = (e) => {
    setYearIdx(e)
  }
  const onClickStart = () => {
    setSelectedYear(true);
  }

  return <div id="g303Dummy">
    <div id='yearSelector' className={yearIdx === null ? 'disabled' : (selectedYear? 'hide': '')}>
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
    <div id="mapCover" className={selectedYear? "hide": (yearIdx === null? "show": "")}>
      {mapArrayPre.map((imgsrc, idx) => {
        return <img className={`${(yearIdx === idx)? 'active': ''}`} src={imgsrc} />
      })}
    </div>
    <div id="mapWrapper" className={selectedYear}>
      {mapArray.map((imgsrc, idx) => {
        return <img className={`${(idx%2 === 0)?'base': 'cover'} ${(yearIdx * 2 === idx || (selectedYear && yearIdx * 2 + 1 === idx))? 'active': ''}`} src={imgsrc} />
      })}
    </div>
    <Menu handleZoom={{current: {
      zoomInOut: console.log
    }}}
      homeBtn={() => {
        setSelectedYear(false);
        {/* setYearIdx(0); */}
      }}
    />
  </div>;
};

export default G303;
