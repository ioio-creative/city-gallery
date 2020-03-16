import React, {useEffect, useRef} from 'react';

import building1 from '../images/building1.png';
import building2 from '../images/building2.png';
import building3 from '../images/building3.png';
import building4 from '../images/building4.png';
import building5 from '../images/building5.png';
import building6 from '../images/building6.png';

const Section3 = props => {
    const startFunc = useRef(null);
    const stopFunc = useRef(null);

    useEffect(()=>{
        const loadImage = () => {
            const images = document.querySelectorAll('#section3 img');
            for(let i=0; i<images.length; i++){
                const img = images[i];
                const src = img.getAttribute('data-src');
                const _img = new Image();

                _img.onload = function(){
                    img.style.height = this.height / 2 / 1920 * 100 + 'vw';
                }
                _img.src = src;
                img.src = src;
            }
        }
        loadImage();

        const start = () => {
        }
        startFunc.current = {start};

        const stop = () => {
        }
        stopFunc.current = {stop}
    },[]);
    
    // load image after changed location
    useEffect(()=>{
    },[])
    
    useEffect(()=>{
        if(props.detailIdx === 4){
            startFunc.current.start();
        }
        else{
            stopFunc.current.stop();
        }
    },[props.detailIdx])

    return (
        <div id="section3" className={`section ${props.detailIdx === 3 ? 'active' : ''}`}>
            <div id="left" className="half">
                <div className="wrap">
                    <div className="imageWrap">
                        <div id="_2nd" className="building rectangle">
                            <div className="infos">
                                <div className="ranking">2nd</div>
                                <div className="height">416m</div>
                                <div className="floor">88 Floors</div>
                                <div className="name">Two International<br/>Finance Centre</div>
                            </div>
                            <img src="" data-src={building2} />
                            <div className="shadow"></div>
                        </div>
                        <div id="_1st" className="building rectangle">
                            <div className="infos">
                                <div className="ranking">1st</div>
                                <div className="height">484m</div>
                                <div className="floor">118 Floors</div>
                                <div className="name">International Commerce Centre</div>
                            </div>
                            <img src="" data-src={building1} />
                            <div className="shadow"></div>
                        </div>
                        <div id="_3rd" className="building rectangle">
                            <div className="infos">
                                <div className="ranking">3rd</div>
                                <div className="height">374m</div>
                                <div className="floor">78 Floors</div>
                                <div className="name">Central Plaza</div>
                            </div>
                            <img src="" data-src={building3} />
                            <div className="shadow"></div>
                        </div>
                    </div>
                    <div className="source">
                        Source: <br/>Emporis
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
            <div id="right" className="half">
                <div className="wrap">
                    <div className="imageWrap">
                        <div id="_2nd" className="building triangle">
                            <div className="infos">
                                <div className="ranking">2nd</div>
                                <div className="height">333m</div>
                                <div className="floor">7 Floors</div>
                                <div className="name">Tokyo Tower</div>
                            </div>
                            <img src="" data-src={building5} />
                            <div className="shadow"></div>
                        </div>
                        <div id="_1st" className="building triangle">
                            <div className="infos">
                                <div className="ranking">1st</div>
                                <div className="height">634m</div>
                                <div className="floor">52 Floors</div>
                                <div className="name">Tokyo Skytree</div>
                            </div>
                            <img src="" data-src={building4} />
                            <div className="shadow"></div>
                        </div>
                        <div id="_3rd" className="building rectangle">
                            <div className="infos">
                                <div className="ranking">3rd</div>
                                <div className="height">255m</div>
                                <div className="floor">52 Floors</div>
                                <div className="name">Toranomon Hills</div>
                            </div>
                            <img src="" data-src={building6} />
                            <div className="shadow"></div>
                        </div>
                    </div>
                    <div className="source">
                        Source:<br/> Emporis
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
        </div>
    )
}

export default Section3;