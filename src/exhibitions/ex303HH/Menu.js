import React, { useState } from 'react';
import './menu.scss';
import normalInfo from './images/normalInfo.png';
import switchInfo from './images/switchInfo.png';
import place from './images/place.png';
import meunBar from './images/meunBar.png';
import lang from './images/lang.png';
import langTC from './images/langTC.png';
import langEN from './images/langEN.png';
import langInfo from './images/langInfo.png';

const Menu = props => {
  const [mode, setMode] = useState();

  const switchMode = m => {
    setMode(m);
    props.handleZoom.current.zoomInOut(m);
  };

  return (
    <div id='menu'>
      <img alt='' className='meunBar' src={meunBar}></img>
      <div id='lang'>
        {/* <span>語言</span>
        <ul>
          <li>繁</li>
          <li id='en'>ENG</li>
        </ul> */}
        <img alt='' className='lang' src={lang}></img>
        <img alt='' className='langTC' src={langTC}></img>
        <img alt='' className='langEN' src={langEN}></img>
        <img alt='' className='langInfo' src={langInfo}></img>
      </div>
      {props.streetName ? (
        <>
          <div id='switch' className={mode}>
            <span onClick={() => switchMode('l')}>海岸線</span>
            <span onClick={() => switchMode('r')}>街道</span>
          </div>
          <img alt='' className='switchInfo' src={switchInfo}></img>
        </>
      ) : (
        <>
          <img alt='' className='place' src={place}></img>
          <img alt='' className='normalInfo' src={normalInfo}></img>
        </>
      )}

      {/* <div id='home' onClick={props.homeBtn}>
        Home
      </div> */}
    </div>
  );
};

export default Menu;
