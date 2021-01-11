import React, { useEffect } from 'react';
// import './menu.scss';
import './navSmall.scss';

const Menu = props => {
  const globalData = props.globalData;
  const streetData = props.streetData;
  const fromTo = {
    'tst':['西九龍','紅磡'],
    'kb':['九龍城','油塘'],
    'wk':['葵涌','西九龍']
  }

  useEffect(() => {
    const updateLang = (i) => {
      props.setLanguage(i === 0 ? 'tc' : 'en');
    }

    if (props.socket) {
      props.socket.on('selectLang', updateLang);
    }

    return () => {
      if (props.socket) {
        props.socket.off('selectLang', updateLang);
      }
    };
  }, [props.socket]);

  return (
    <div id='navWrap'>
      <div id='left'>
        {
          !props.showYear && props.gameMode !== 'home' &&
          <div id="indicator" className={`${props.yearIdx != 3 ? 'hideImg' : ''} ${props.zone > 0 ? 'moveup' : ''}`} dangerouslySetInnerHTML={{__html:globalData && globalData.hints}}></div>
        }
        <div id="wrap" className={`${!props.showNav ? 'noBtn' : props.yearIdx < 3  ? 'noBtn' : ''} ${props.runTransition ? 'disable' : ''}`}>
          <div className={`yearButton ${props.gameMode === 'street' ? 'hide' : ''} ${props.showNav ? 'active' : ''}`} onClick={() => { props.showNav && props.back(); }}>
            { globalData && globalData.selectYear }
          </div>
          {
            props.locationName === 'tst' &&
            <div id="streetNameWrap" className={`streetFont ${props.gameMode === 'street' ? '' : 'hide'}`}>
              {
                globalData.streetArea &&
                props.streetIdx === null ?
                  globalData.streetArea.map((v, i) => {
                    if(i === props.zone)
                      return (
                        <div key={i} className={`streetName ${i === 2 ? 's' : ''}`}>
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
          }
          <span id="space"></span>
          {
            props.locationName === 'tst' &&
            <div id='switch' className={`${props.gameMode} ${props.yearIdx === 3 && props.gameMode !== 'home' ? '' : 'hide'}`}>
              <span onClick={() => {props.setGameMode('coast'); props.setStreetIdx(null); props.setZone(0); }}> {globalData.coastline} </span>
              <span onClick={() => {props.setGameMode('street'); }}> {globalData.street} </span>
            </div>
          }
          <div className={`descriptionBox ${props.locationName === 'tst' ? (!props.showNav ? '' : props.yearIdx < 3 ? '' : 'hide') : ''}`}>
            { globalData && globalData.locations[0] } <span></span> 
            { props.locationName === 'tst' && globalData && globalData.locations[3] }
            { props.locationName === 'wk' && globalData && globalData.locations[4] }
            { props.locationName === 'kb' && globalData && globalData.locations[2] }
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
