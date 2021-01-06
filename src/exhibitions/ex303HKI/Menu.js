import React, { useState } from 'react';
// import './menu.scss';
import './nav.scss';

const Menu = props => {
  const globalData = props.globalData;
  const streetData = props.streetData;

  return (
    <div id='navWrap'>
      <div id='left'>
        <div id="wrap" className={`${!props.showNav ? 'noBtn' : props.yearIdx < 3  ? 'noBtn' : ''} ${props.runTransition ? 'disable' : ''}`}>
          <div className={`yearButton ${props.gameMode === 'street' ? 'hide' : ''} ${props.yearIdx > -1 ? 'active' : ''} ${!props.showNav ? 'radar' : ''}`} onClick={() => { !props.showNav ? props.start() : props.back(); }}>
            {
              globalData && 
              !props.showNav ?
                globalData.confirm
              :
                '選擇年份'
            }
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
          <div id='switch' className={`${props.gameMode} ${props.yearIdx === 3 && props.gameMode !== 'home' ? '' : 'hide'}`}>
            <span onClick={() => {props.setGameMode('coast'); props.setStreetIdx(null); }}> {globalData.coastline} </span>
            <span onClick={() => {props.setGameMode('street'); props.setZone(0); }}> {globalData.street} </span>
          </div>
          <div className={`descriptionBox ${!props.showNav ? '' : props.yearIdx < 3 ? '' : 'hide'}`}>
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
          <div id="indicator" className={!props.showNav ? 'hideImg' : props.yearIdx < 3 ? 'hideImg' : ''}>
            {
              !props.showNav ? 
                <>本圖的海岸線只供參考。填海資料僅顯示維港範圍以內部分區域。</>
                :
                props.yearIdx === 3 ? 
                  <>請按下不同的浮標以<br/>探索不同填海區的資訊</>
                : 
                  <>本圖的海岸線只供參考。填海資料僅顯示維港範圍以內部分區域。</>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
