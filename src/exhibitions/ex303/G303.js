import React, { useState, useRef } from 'react'
import './style.scss'

import Menu from './Menu'
import Map from './Map'

const G303 = () => {
    const [zoomed, setZoomed] = useState(false);
    const [indicatorIdx, setIndicatorIdx] = useState(0);
    const zoomHandle = useRef(null);
    const moveHandle = useRef(null);

    const onClickIndicator = (i) => {
        setIndicatorIdx(i);
        moveHandle.current.updateIndicatorIdx(i, zoomed);
    }

    return (
        <div id="main" className={zoomed ? 'zoomed' : ''}>
            <div id="indicator">
                <span>分區</span>
                <ul>
                    {
                        [...Array(4)].map((v,i)=>{
                            return <li key={i} className={ i === indicatorIdx ? 'active' : '' } onClick={()=>onClickIndicator(i)}>{i+1}</li>
                        })
                    }
                </ul>
            </div>
            <Map 
                setIndicatorIdx={setIndicatorIdx} 
                setZoomed={setZoomed}
                zoomHandle={zoomHandle}
                moveHandle={moveHandle}
            />
            <Menu zoomHandle={zoomHandle} />
        </div>
    )
}

export default G303;