import React, { useState, useRef } from 'react'
import './style.scss'

import Menu from './Menu'
import Map from './Map'

const G303 = props => {
    const [started, setStarted] = useState(false);
    const [yearIdx, setYearIdx] = useState(null);
    const [zoomed, setZoomed] = useState(false);
    const [mapIndicatorIdx, setMapIndicatorIdx] = useState(0);
    const [streetData, setStreetData] = useState(null);

    const handleZoom = useRef(null);
    const handleMove = useRef(null);
    const handleShowCoastline = useRef(null);
    const handleSelectCoastline = useRef(null);
    const handleStart = useRef(null);

    const onClickMapIndicator = (i) => {
        setMapIndicatorIdx(i);
        handleMove.current.updateMapIndicatorIdx(i, zoomed);
    }

    const onClickYear = (i) => {
        if(!started)
            if(i !== yearIdx){
                setYearIdx(i);
                handleSelectCoastline.current.selectCoastline(i);
            }
    }

    const onClickStart = () => {
        if(yearIdx !== null){
            setStarted(true);
            handleStart.current.start();
            handleShowCoastline.current.showCoastline(yearIdx);
        }
    }

    return (
        <div id="main" className={`${started ? 'started' : ''}${zoomed ? ' zoomed' : ''}`}>
            <div id="yearSelector" className={yearIdx === null ? 'disabled' : ''}>
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
            <div id="streetInfo">
                {
                    streetData &&
                    <h1>{streetData.name}</h1>
                }
                {/* <div id="markerOuterWrap">
                    <div id="markerWrap">
                        {
                            props.appData.streets[mapIndicatorIdx].map((v,i)=>{
                                return <span key={i} style={{transform:`translate3d(${v.marker.x}px, ${v.marker.y}px, 0`}}></span>
                            })
                        }
                    </div>
                </div> */}
            </div>
            <Map 
                appData={props.appData}
                setStreetData={setStreetData}
                setMapIndicatorIdx={setMapIndicatorIdx} 
                setZoomed={setZoomed}
                handleZoom={handleZoom}
                handleMove={handleMove}
                handleShowCoastline={handleShowCoastline}
                handleSelectCoastline={handleSelectCoastline}
                handleStart={handleStart}
            />
            <Menu handleZoom={handleZoom} />
        </div>
    )
}

export default G303;