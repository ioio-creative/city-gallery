import React, { useEffect, useRef } from 'react';
import PeoplesAnim from './peoples';

const Section2 = props => {
  const stageLeft = useRef(null);
  const stageRight = useRef(null);
  const startFunc = useRef(null);
  const stopFunc = useRef(null);

  const globalData = props.globalData;
  const data = props.data;
  const locationName = props.locationName;

  useEffect(() => {
    const leftStage = new PeoplesAnim(stageLeft.current);
    const rightStage = new PeoplesAnim(stageRight.current);

    const start = (leftNum, rightNum) => {
      leftStage.start(leftNum);
      rightStage.start(rightNum);
    };
    startFunc.current = { start };

    const stop = () => {
      leftStage.stop();
      rightStage.stop();
    };
    stopFunc.current = { stop };
  }, []);

  useEffect(() => {
    if (locationName) {
      if (props.detailIdx === 2) {
        // startFunc.current.start(6761/1000, data[locationName].populationDensity.value.replace(',','')/1000);
        startFunc.current.start(6761 / 600, data[locationName].populationDensity.value.replace(',', '') / 600);
      } else {
        stopFunc.current.stop();
      }
    }
  }, [props.detailIdx, locationName]);

  return (
    <div id={`section2`} className={`section ${props.detailIdx === 2 ? 'active' : ''}`}>
      <div id='left' className='half'>
        <div className='wrap'>
          <ul>
            <li>
              <div className='title big' dangerouslySetInnerHTML={{ __html: globalData && globalData.populationDensity }}></div>
              <div className='big'>{data && data.hongkong.populationDensity.value}</div>
            </li>
            <li>
              <div className='title'>{globalData && globalData.population}</div>
              <div className='medium'>{data && data.hongkong.population.value}</div>
            </li>
            <li>
              <div className='title' dangerouslySetInnerHTML={{ __html: globalData && globalData.landArea }}></div>
              <div className='medium'>{data && data.hongkong.landArea.value}</div>
            </li>
          </ul>
          <div className='unit'>
            <div className='floorWrap'>
              <div className='floor'>
                <span>
                  <span></span>
                </span>
              </div>
            </div>
            <p dangerouslySetInnerHTML={{ __html: data && data.distance }}></p>
          </div>
          <div className='imageWrap'>
            <div className='stageWrap'>
              <div ref={stageLeft} className='stage'></div>
            </div>
          </div>
          <div className='source'>
            {globalData && globalData.source}
            <br />
            <span dangerouslySetInnerHTML={{ __html: data && data['hongkong'].source }}></span>
          </div>
        </div>
        <div className='bg'>
          <span></span>
        </div>
      </div>
      <div id='right' className='half'>
        <div className='wrap'>
          <ul>
            <li>
              {props.lang === 'tc' && <div className='fakeTitle'>城市人口密度（/平方公里）</div>}
              <div className={`title big ${props.lang === 'tc' ? 'trans' : ''}`} dangerouslySetInnerHTML={{ __html: globalData && globalData.populationDensity }}></div>
              <div className='big'>{data && locationName && data[locationName].populationDensity.value}</div>
            </li>
            <li>
              <div className='title'>{globalData && globalData.population}</div>
              <div className='medium'>{data && locationName && data[locationName].population.value}</div>
            </li>
            <li>
              {props.lang === 'tc' && <div className='fakeTitle land'>陸地面積（平方公里）</div>}
              <div className={`title ${props.lang === 'tc' ? 'trans' : ''}`} dangerouslySetInnerHTML={{ __html: globalData && globalData.landArea }}></div>
              <div className='medium'>{data && locationName && data[locationName].landArea.value}</div>
            </li>
          </ul>
          <div className='unit'>
            <div className='floorWrap'>
              <div className='floor'>
                <span>
                  <span></span>
                </span>
              </div>
            </div>
            <p dangerouslySetInnerHTML={{ __html: data && data.distance }}></p>
          </div>
          <div className='imageWrap'>
            <div className='stageWrap'>
              <div ref={stageRight} className='stage'></div>
            </div>
          </div>
          <div className='source'>
            {globalData && globalData.source}
            <br />
            <span dangerouslySetInnerHTML={{ __html: data && locationName && data[locationName].source }}></span>
          </div>
        </div>
        <div className='bg'>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default Section2;
