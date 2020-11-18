import React from 'react';

const Section1 = props => {

    const globalData = props.globalData;
    const data = props.data;
    const locationName = props.locationName;

    return(
        <div id="section1" className={`section ${props.detailIdx === 1 ? 'active' : ''}`}>
            <div id="left" className="half">
                <div className="wrap">
                    <div className="title medium"><span></span>{data && data.populationArea}</div>
                    <div className="imageWrap">
                        <div className="map" style={{backgroundImage:`url(${data && data.images['hongkong'].src})`}}></div>
                    </div>
                    <div className="dist">{data && data.distance}<span style={{width:`${60 / 1920 * 100}vw`}}></span></div>
                    <div className="source">
                        {globalData && globalData.source}<br/><span dangerouslySetInnerHTML={{__html:data && data.images.hongkong.source}}></span>
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
            <div id="right" className="half">
                <div className="wrap">
                    <div className="title medium"><span></span>{data && data.populationArea}</div>
                    <div className="imageWrap">
                        <div className="map" style={{backgroundImage:`url(${data && locationName && data.images[locationName].src})`}}></div>
                    </div>
                    <div className="dist">{data && data.distance}<span style={{width:`${60 / 1920 * 100}vw`}}></span></div>
                    <div className="source">
                        {globalData && globalData.source}<br/><span dangerouslySetInnerHTML={{__html:data && locationName && data.images[locationName].source}}></span>
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
        </div>
    )
}

export default Section1;