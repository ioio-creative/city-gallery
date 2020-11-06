import React, {useEffect, useRef} from 'react'
import gsap from 'gsap'

// import building1 from './images/exG02a/section3/hongkong1st.svg';
// import building2 from './images/exG02a/section3/hongkon2nd.svg';
// import building3 from './images/exG02a/section3/hongkong3rd.svg';
// import building4 from '../images/building4.png';
// import building5 from '../images/building5.png';
// import building6 from '../images/building6.png';

const Section3 = props => {
    const startFunc = useRef(null);
    const stopFunc = useRef(null);

    const globalData = props.globalData;
    const data = props.data;
    const locationName = props.locationName;

    useEffect(()=>{
        if(locationName !== null){
            gsap.set('#section3 img', {'height':0});

            const loadImage = () => {
                const images = document.querySelectorAll('#section3 img');
                for(let i=0; i<images.length; i++){
                    const img = images[i];
                    const src = img.getAttribute('data-src');
                    const _img = new Image();

                    _img.onload = function(){
                        img.style.height = this.height / 1920 * 100 + 'vw';
                    }
                    _img.src = src;
                    img.src = src;
                }
            }
            loadImage();
        }

    },[locationName]);
    
    // load image after changed location
    // useEffect(()=>{
    // },[])

    return (
        <div id="section3" className={`section ${props.detailIdx === 3 ? 'active' : ''}`}>
            <div id="left" className="half">
                <div className="wrap">
                    <div className="imageWrap">
                        <div id="_2nd" className="building rectangle">
                            <div className="infos">
                                <div className="ranking">2nd</div>
                                <div className="name">{data && locationName && data['hongkong'].building[1].name}</div>
                                <div className="height">{data && locationName && data['hongkong'].building[1].height}</div>
                                <div className="floor">{data && locationName && data['hongkong'].building[1].floor}</div>
                            </div>
                            <img src="" data-src={'./images/exG02a/section3/hongkong2nd.svg'} />
                            <div className="shadow" style={{backgroundImage:`url(./images/exG02a/section3/hongkong2nd.svg)`}}></div>
                        </div>
                        <div id="_1st" className="building rectangle">
                            <div className="infos">
                                <div className="ranking">1st</div>
                                <div className="name">{data && locationName && data['hongkong'].building[0].name}</div>
                                <div className="height">{data && locationName && data['hongkong'].building[0].height}</div>
                                <div className="floor">{data && locationName && data['hongkong'].building[0].floor}</div>
                            </div>
                            <img src="" data-src={'./images/exG02a/section3/hongkong1st.svg'} />
                            <div className="shadow" style={{backgroundImage:`url(./images/exG02a/section3/hongkong1st.svg)`}}></div>
                        </div>
                        <div id="_3rd" className="building rectangle">
                            <div className="infos">
                                <div className="ranking">3rd</div>
                                <div className="name">{data && locationName && data['hongkong'].building[2].name}</div>
                                <div className="height">{data && locationName && data['hongkong'].building[2].height}</div>
                                <div className="floor">{data && locationName && data['hongkong'].building[2].floor}</div>
                            </div>
                            <img src="" data-src={'./images/exG02a/section3/hongkong3rd.svg'} />
                            <div className="shadow" style={{backgroundImage:`url(./images/exG02a/section3/hongkong3rd.svg)`}}></div>
                        </div>
                    </div>
                    <div className="source">
                        {globalData && globalData.source}<br/><span dangerouslySetInnerHTML={{__html:data && data['hongkong'].source}}></span>
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
            <div id="right" className="half">
                <div className="wrap">
                    <div className="imageWrap">
                        <div id="_2nd" className="building rectangle">
                            <div className={`infos ${locationName}2`}>
                                <div className="ranking">2nd</div>
                                <div className="name">{data && locationName && data[locationName].building[1].name}</div>
                                <div className="height">{data && locationName && data[locationName].building[1].height}</div>
                                <div className="floor">{data && locationName && data[locationName].building[1].floor}</div>
                            </div>
                            <img src="" data-src={`./images/exG02a/section3/${locationName}2nd.svg`} />
                            <div className="shadow" style={{backgroundImage:`url(./images/exG02a/section3/${locationName}2nd.svg)`}}></div>
                        </div>
                        <div id="_1st" className="building rectangle">
                            <div className={`infos ${locationName}1`}>
                                <div className="ranking">1st</div>
                                <div className="name">{data && locationName && data[locationName].building[0].name}</div>
                                <div className="height">{data && locationName && data[locationName].building[0].height}</div>
                                <div className="floor">{data && locationName && data[locationName].building[0].floor}</div>
                            </div>
                            <img src="" data-src={`./images/exG02a/section3/${locationName}1st.svg`}/>
                            <div className="shadow" style={{backgroundImage:`url(./images/exG02a/section3/${locationName}1st.svg)`}}></div>
                        </div>
                        <div id="_3rd" className="building rectangle">
                            <div className={`infos ${locationName}3`}>
                                <div className="ranking">3rd</div>
                                <div className="name">{data && locationName && data[locationName].building[2].name}</div>
                                <div className="height">{data && locationName && data[locationName].building[2].height}</div>
                                <div className="floor">{data && locationName && data[locationName].building[2].floor}</div>
                            </div>
                            <img src="" data-src={`./images/exG02a/section3/${locationName}3rd.svg`} />
                            <div className="shadow" style={{backgroundImage:`url(./images/exG02a/section3/${locationName}3rd.svg)`}}></div>
                        </div>
                    </div>
                    <div className="source">
                        {globalData && globalData.source}<br/><span dangerouslySetInnerHTML={{__html: data && locationName && data[locationName].source}}></span>
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
        </div>
    )
}

export default Section3;