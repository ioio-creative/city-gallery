import React, { useState } from 'react';
import './menu.scss';
import normalInfo from './images/normalInfo.png';
import switchInfo from './images/switchInfo.png';
import place from './images/place.png';
import meunBar from './images/meunBar.png';
import yearSelect from './images/yearSelect.png';
import langTC from './images/langTC.png';
import langEN from './images/langEN.png';
import langInfo from './images/langInfo.png';

const Menu = props => {
  const [mode, setMode] = useState('l');

  const switchMode = m => {
    setMode(m);
    // props.handleZoom.current.zoomInOut(m);
  };

  return (
    <div id='main'>
      <div id='menu'>
        <img alt='' className='meunBar' src={meunBar}></img>
        <img alt='' className={`yearSelect ${mode === 'l' ? '' : 'hide'}`} src={yearSelect} onClick={props.homeBtn}></img>
        <div className='textBox'>
          {['旺角及大角咀1區', '油麻地區'].map((v, i) => {
            return (
              <div key={i} className={`streetName streetFont ${mode === 'r' && i === props.mapIndicatorIdx && !props.isVideo ? 'active' : 'hide'}`}>
                {v}
              </div>
            );
          })}
          {['西洋菜街', '船渡街'].map((v, i) => {
            return (
              <div key={i} className={`streetName streetFont ${mode === 'r' && i === props.idx && props.isVideo ? 'active' : 'hide'}`}>
                {v}
              </div>
            );
          })}
        </div>
        <div id='lang'>
          {/* <span>語言</span>
        <ul>
          <li>繁</li>
          <li id='en'>ENG</li>
        </ul> */}
          <img alt='' className='langTC' src={langTC}></img>
          <img alt='' className='langEN' src={langEN}></img>
          <img alt='' className='langInfo' src={langInfo}></img>
        </div>
        {props.streetName ? (
          <>
            <div id='switch' className={mode}>
              <span
                onClick={() => {
                  switchMode('l');
                  props.leaveZoom();
                }}
              >
                海岸線
              </span>
              <span
                onClick={() => {
                  switchMode('r');
                  props.toFakeZoom();
                }}
              >
                街道
              </span>
            </div>
          </>
        ) : (
          <img alt='' className='place' src={place}></img>
        )}

        {/* <div id='home' onClick={props.homeBtn}>
          Home
        </div> */}
      </div>
      {props.streetName && <img alt='' className='switchInfo' src={switchInfo}></img>}
      <img alt='' className='normalInfo' src={normalInfo}></img>
    </div>
  );
};

export default Menu;
