import React, { useState } from 'react';
import './menu.scss';
import './nav.scss';

const Menu = props => {
  const globalData = props.globalData;
  const streetData = props.streetData;

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
    //   <span onClick={() => switchMode('coast')}>海岸線</span>
    //   <span onClick={() => switchMode('street')}>街道</span>
    // </div>
    // </div>
    <div id='navWrap' className={`${props.showNav ? '' : 'hide'}`}>
      <div id='left'>
        <div id="wrap" className={props.yearIdx != 3 ? 'noBtn' : ''}>
          <div className={`yearButton ${props.gameMode === 'street' ? 'hide' : ''}`} onClick={() => { props.back(); }}>
            選擇年份
          </div>
          <div id="streetNameWrap" className={`streetFont ${props.gameMode === 'street' ? '' : 'hide'}`}>
            {
              props.streetIdx === null ?
                ['上環區', '中環及灣仔區', '銅鑼灣區', '鰂魚涌區'].map((v, i) => {
                  if(i === props.zone)
                    return (
                      <div key={i} className={`streetName ${i === 1 ? 's' : ''}`}>
                        {v}
                      </div>
                    );
                  else
                    return;
                })
              :
                <div className="streetName">{streetData && streetData[props.streetIdx].marker.name}</div>
            }
          </div>
          <span id="space"></span>
          <div id='switch' className={`${props.gameMode} ${props.yearIdx === 3 ? '' : 'hide'}`}>
            <span onClick={() => {props.setGameMode('coast'); props.setStreetIdx(null); }}> {globalData.coastline} </span>
            <span onClick={() => {props.setGameMode('street'); props.setZone(0); }}> {globalData.street} </span>
          </div>
          <div className={`descriptionBox ${props.yearIdx === 0 || props.yearIdx === 1 || props.yearIdx === 2 ? '' : 'hide'}`}>
            海岸綫 <span></span> 香港島
          </div>
        </div>
      </div>
      <div id="right">
        <div id="wrap">
          <div id="lang">
            <div id="tc" className={props.language === 'tc' ? 'active' : ''} onClick={()=>props.setLanguage('tc')}>繁</div>
            <div id="en" className={props.language === 'en' ? 'active' : ''} onClick={()=>props.setLanguage('en')}>ENG</div>
          </div>
          <div id="questionBtnWrap">
            <div id="questionBtn">?</div>
          </div>
          <div id="indicator" className={props.yearIdx != 3 ? 'hideImg' : ''}>
            {
              props.yearIdx === 3 &&
              <>請按下不同的浮標以<br/>探索不同填海區的資訊</>
            }
            {
              props.yearIdx != 3 &&
              <>本圖的海岸線只供參考。</>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
