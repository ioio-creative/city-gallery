import React, { useState } from 'react';
// import './menu.scss';
import './nav.scss';

const Menu = props => {
  const globalData = props.globalData;
  const streetData = props.streetData;

  return (
    <div id='navWrap' className={`${props.showNav ? '' : 'hide'}`}>
      <div id='left'>
        {
          props.yearIdx === 3 &&
          <div id="indicator" className={props.yearIdx != 3 ? 'hideImg' : ''}>
            <>請按下不同的浮標以<br/>探索不同填海區的資訊</>
          </div>
        }
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
          {/* <div id='switch' className={`${props.gameMode} ${props.yearIdx === 3 ? '' : 'hide'}`}>
            <span onClick={() => {props.setGameMode('coast'); props.setStreetIdx(null); }}> {globalData.coastline} </span>
            <span onClick={() => {props.setGameMode('street'); props.setZone(0); }}> {globalData.street} </span>
          </div> */}
          <div className={`descriptionBox`}>
          葵涌 <span></span>  西九龍
          </div>
          <span id="space"></span>
          <div id="lang">
            <div id="tc" className={props.language === 'tc' ? 'active' : ''} onClick={()=>props.setLanguage('tc')}>繁</div>
            <div id="en" className={props.language === 'en' ? 'active' : ''} onClick={()=>props.setLanguage('en')}>ENG</div>
          </div>
          <div id="questionBtnWrap">
            <div id="questionBtn">?</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
