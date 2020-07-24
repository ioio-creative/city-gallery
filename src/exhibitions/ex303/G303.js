import React, { useState, useRef } from 'react'
import './style.scss'

import Menu from './Menu'
import Map from './Map'

const G303 = () => {
    const [yearIdx, setYearIdx] = useState(0);
    const [zoomed, setZoomed] = useState(false);
    const [mapIndicatorIdx, setMapIndicatorIdx] = useState(0);
    const handleZoom = useRef(null);
    const handleMove = useRef(null);
    const handleChangeCoastline = useRef(null);
    const handleStart = useRef(null);

    const onClickMapIndicator = (i) => {
        setMapIndicatorIdx(i);
        handleMove.current.updateMapIndicatorIdx(i, zoomed);
    }

    const onClickYear = (i) => {
        if(i !== yearIdx){
            setYearIdx(i);
            handleChangeCoastline.current.changeCoastline(i);
        }
    }

    const onClickStart = () => {
        handleStart.current.start();
    }

    return (
        <div id="main" className={zoomed ? 'zoomed' : ''}>
            <div id="yearSelector">
                <ul>
                {
                    ['1900','1945','1985','2019'].map((v,i)=>{
                        return <li key={i} className={i === yearIdx ? 'active' : ''} onClick={()=>onClickYear(i)}><span>{v}</span></li>
                    })
                }
                </ul>
                <div id="startBtn" onClick={onClickStart}>確定</div>
            </div>
            <div id="mapIndicator">
                <span>分區</span>
                <ul>
                    {
                        [...Array(4)].map((v,i)=>{
                            return <li key={i} className={ i === mapIndicatorIdx ? 'active' : '' } onClick={()=>onClickMapIndicator(i)}>{i+1}</li>
                        })
                    }
                </ul>
            </div>
            <Map 
                setMapIndicatorIdx={setMapIndicatorIdx} 
                setZoomed={setZoomed}
                handleZoom={handleZoom}
                handleMove={handleMove}
                handleChangeCoastline={handleChangeCoastline}
                handleStart={handleStart}
            />
            <Menu handleZoom={handleZoom} />
        </div>
    )
}

export default G303;