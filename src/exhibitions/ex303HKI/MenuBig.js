import React, { useEffect } from 'react';
import './navBig.scss';

const Menu = props => {
  const globalData = props.globalData;
  const streetData = props.streetData;

  
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
        <div id="wrap" className={`${!props.showNav ? 'noBtn' : props.yearIdx < 3  ? 'noBtn' : ''} ${props.runTransition ? 'disable' : ''}`}>
          <div className={`yearButton ${props.gameMode === 'street' ? 'hide' : ''} ${props.showNav ? 'active' : ''}`} 
            onClick={() => { 
              props.showNav && props.back(); 
              props.socket.emit('navigationIndex', {data:{index:props.yearIdx}}); 
            }}
          >
            { globalData && globalData.selectYear }
          </div>
          <div id="streetNameWrap" className={`streetFont ${props.gameMode === 'street' ? '' : 'hide'}`}>
            {
              props.streetIdx === null ?
                globalData &&
                globalData.streetArea.map((v, i) => {
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
            { globalData && globalData.coastline } <span></span> 
            {
              globalData && 
              <p>{globalData.locations[0]}<span dangerouslySetInnerHTML={{__html:globalData.to}}></span>{globalData.locations[7]}</p>
            }
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
          <div id="indicator" className={!props.showNav ? 'hideImg' : props.yearIdx < 3 ? 'hideImg' : ''} 
            dangerouslySetInnerHTML={{__html: 
              globalData &&
              !props.showNav ? 
                globalData.reference
                :
                props.yearIdx === 3 ? 
                  globalData.hints
                : 
                  globalData.reference
            }}
          >
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
