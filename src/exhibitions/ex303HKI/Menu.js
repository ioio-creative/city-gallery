import React, { useState } from 'react';
import './menu.scss';
import './nav.scss';

const Menu = props => {
  const [mode, setMode] = useState();
  const [lang, setLang] = useState('tc');

  const switchMode = m => {
    setMode(m);
    props.handleZoom.current.zoomInOut(m);
  };

  return (
    // <div id='menu'>
    //   <div id='lang'>
    //     <span>語言</span>
    //     <ul>
    //       <li>繁</li>
    //       <li>簡</li>
    //       <li id='en'>ENG</li>
    //     </ul>
    //   </div>
    //   <div id='switch' className={mode}>
    //     <span onClick={() => switchMode('l')}>海岸線</span>
    //     <span onClick={() => switchMode('r')}>街道</span>
    //   </div>
    // </div>
    <div id='navWrap'>
      <div className='left'>
        <div
          className='yearButton'
          onClick={() => {
            props.back();
          }}
        >
          選擇年份
        </div>
      </div>
      <span onClick={() => switchMode('l')}>海岸線</span>
      <span onClick={() => switchMode('r')}>街道</span>
      <div className='right'></div>
    </div>
  );
};

export default Menu;
