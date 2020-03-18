import React, { useEffect, useRef } from 'react';
import PeoplesAnim from './peoples';


const Section2 = props => {
    const stageLeft = useRef(null);
    const stageRight = useRef(null);
    const startFunc = useRef(null);
    const stopFunc = useRef(null);

    useEffect(()=>{
        const leftStage = new PeoplesAnim(stageLeft.current);
        const rightStage = new PeoplesAnim(stageRight.current);

        const start = (leftNum, rightNum) => {
            leftStage.start(leftNum);
            rightStage.start(rightNum);
        }
        startFunc.current = {start};

        const stop = () => {
            leftStage.stop();
            rightStage.stop();
        }
        stopFunc.current = {stop}

    },[])

    useEffect(()=>{
        if(props.detailIdx === 2){
            startFunc.current.start(20, 5);
        }
        else{
            stopFunc.current.stop();
        }
    },[props.detailIdx])

    return(
        <div id={`section2`} className={`section ${props.detailIdx === 2 ? 'active' : ''}`}>
            <div id="left" className="half">
                <div className="wrap">
                    <ul>
                        <li>
                            <div className="title big">Population Density (/km<sup>2</sup>)</div>
                            <div className="big">6,761.34</div>
                        </li>
                        <li>
                            <div className="title">Population</div>
                            <div className="medium">7,482,500</div>
                        </li>
                        <li>
                            <div className="title">Land Area (km<sup>2</sup>)</div>
                            <div className="medium">1,106.66</div>
                        </li>
                    </ul>
                    <div className="unit">
                        <div className="floorWrap">
                            <div className="floor">
                                <span><span></span></span>
                            </div>
                        </div>
                        <p>500/km<sup>2</sup></p>
                    </div>
                    <div className="imageWrap">
                        <div className="stageWrap">
                            <div ref={stageLeft} className="stage"></div>
                        </div>
                    </div>
                    <div className="source">
                        Source:<br/>HK Census And Statistics Department Population 2018<br/>Hong Kong Geographic Data 2019
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
            <div id="right" className="half">
                <div className="wrap">
                    <ul>
                        <li>
                            <div className="title big">Population Density (/km<sup>2</sup>)</div>
                            <div className="big">14,568.96</div>
                        </li>
                        <li>
                            <div className="title">Population</div>
                            <div className="medium">9,143,041</div>
                        </li>
                        <li>
                            <div className="title">Land Area (km<sup>2</sup>)</div>
                            <div className="medium">627.57</div>
                        </li>
                    </ul>
                    <div className="unit">
                        <div className="floorWrap">
                            <div className="floor">
                                <span><span></span></span>
                            </div>
                        </div>
                        <p>500/km<sup>2</sup></p>
                    </div>
                    <div className="imageWrap">
                        <div className="stageWrap">
                            <div ref={stageRight} className="stage"></div>
                        </div>
                    </div>
                    <div className="source">
                        Source:<br/>HK Census And Statistics Department Population 2018<br/>Hong Kong Geographic Data 2019
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
        </div>
    )
}

export default Section2;