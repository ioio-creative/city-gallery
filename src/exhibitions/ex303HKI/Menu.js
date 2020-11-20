import React, { useState } from 'react';
import './menu.scss';
import './nav.scss';

const Menu = props => {
  const [mode, setMode] = useState('l');
  const [lang, setLang] = useState('tc');

  const switchMode = m => {
    setMode(m);
    // props.handleZoom.current.zoomInOut(m);
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
    // <div id='switch' className={mode}>
    //   <span onClick={() => switchMode('l')}>海岸線</span>
    //   <span onClick={() => switchMode('r')}>街道</span>
    // </div>
    // </div>
    <div id='navWrap' className={`${props.show ? '' : 'hide'}`}>
      <div className='left'>
        <div
          className={`yearButton ${mode === 'l' ? '' : 'hide'}`}
          onClick={() => {
            props.back();
          }}
        >
          選擇年份
        </div>
        {['上環區', '中環及灣仔區', '銅鑼灣區', '鰂魚涌區'].map((v, i) => {
          return (
            <div key={i} className={`streetName streetFont ${mode === 'r' && i === props.mapIndicatorIdx && !props.isVideo ? 'active' : 'hide'}`}>
              {v}
            </div>
          );
        })}
        {['荷李活道', '炮台里'].map((v, i) => {
          return (
            <div key={i} className={`streetName streetFont ${mode === 'r' && i === props.idx && props.isVideo ? 'active' : 'hide'}`}>
              {v}
            </div>
          );
        })}
        <div id='switch' className={`${mode} ${props.yearIdx === 3 ? '' : 'hide'}`}>
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
        <div className={`descriptionBox ${props.yearIdx === 0 || props.yearIdx === 1 || props.yearIdx === 2 ? '' : 'hide'}`}>
          海岸綫 <span>———</span> 香港島
        </div>
      </div>
      <div className='right'></div>
    </div>
  );
};

export default Menu;
