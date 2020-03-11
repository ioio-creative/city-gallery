import React from 'react';
import map1 from '../images/map1@2x.png';
import map2 from '../images/map2@2x.png';

const Section1 = props => {

    return(
        <div id="section1" className={`section ${props.detailIdx === 1 ? 'active' : ''}`}>
            <div id="left" className="half">
                <div className="wrap">
                    <div className="title medium"><span></span>Population Area</div>
                    <div className="imageWrap">
                        <div className="map" style={{backgroundImage:`url(${map1})`}}></div>
                    </div>
                    <div className="dist">5km<span style={{width:`${60 / 1920 * 100}vw`}}></span></div>
                    <div className="source">
                        Source : (Source Holder)
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
            <div id="right" className="half">
                <div className="wrap">
                    <div className="title medium"><span></span>Population Area</div>
                    <div className="imageWrap">
                        <div className="map" style={{backgroundImage:`url(${map2})`}}></div>
                    </div>
                    <div className="dist">5km<span style={{width:`${109 / 1920 * 100}vw`}}></span></div>
                    <div className="source">
                        Source : (Source Holder)
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
        </div>
    )
}

export default Section1;