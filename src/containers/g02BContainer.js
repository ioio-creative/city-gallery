import React from 'react';

import { useState, useEffect, useCallback, useMemo } from 'react';

import placeholderImage from 'media/placeholder_400x400.png';

import './g02BContainer.css';


const G02BStatus = {
  IDLE: 1, // 
}

const CityBlock = (props) => {
  return <div className="cityBlock" style={{
    transform: `translate(${props.offsetX}px, ${props.offsetY}px)`
  }}>
    <div className="contentWrapper">
      <div className="cityImage">
        <img src={placeholderImage} alt="placeholder image" />
      </div>
      <div className="cityName">
        <div className="nickName">防衞之城</div>
        <div className="realName">佛羅里達</div>
      </div>
      <div style={{
        position: 'absolute',
        fontSize: 120,
        color: 'red'
      }}>{props.blockIdx}</div>
    </div>
  </div>;
}
const CitiesList = (props) => {
  const [blocks, setBlocks] = useState([]);
  const [blockHeight, setBlockHeight] = useState(window.innerWidth / 3);
  const [blockWidth, setBlockWidth] = useState(window.innerWidth / 3);
  const [offsetIdx, setOffsetIdx] = useState([0, 0, 0, 0]);
  const rowItemOffset = 3;
  useEffect(() => {
    // move blocks and append some if necessary
    /**
     * normally 3x2
     * max blocks visible horizontally: 5
     * max blocks visible vertically: 4
     * {7} {8} {9} {0} {1}
     * {0} [1] [2] [3] {4}
     * {3} [4] [5] [6] {7}
     * {6} {7} {8} {9} {0}
     */
    const xIdxStart = Math.floor(props.positionOffset[0] / blockWidth);
    const yIdxStart = Math.floor(props.positionOffset[1] / blockHeight);
    const xOffset = props.positionOffset[0] % blockWidth + xIdxStart * blockWidth;
    const yOffset = props.positionOffset[1] % blockWidth + yIdxStart * blockWidth;
    // console.log(xIdxStart, yIdxStart);
    setOffsetIdx(
      [
        xIdxStart, yIdxStart, 
        // props.positionOffset[0] - xIdxStart * blockWidth, props.positionOffset[1] - 
        xOffset, yOffset
      ]
    );
  }, [props.positionOffset]);
  // useEffect(() => {
  //   console.log(offsetIdx);
  // }, [offsetIdx]);
  return <div className="citiesList">
    {new Array(4).fill(0).map((_, yIdx) => {
      return new Array(5).fill(0).map((_, xIdx) => {
        return <CityBlock key={`(${xIdx}, ${yIdx})`}
          blockIdx={
            `${((xIdx - offsetIdx[0] + (yIdx - offsetIdx[1]) * rowItemOffset) % props.citiesArray.length + props.citiesArray.length) % props.citiesArray.length}`
            // `${xIdx}, ${yIdx}`
          }
          offsetX={(offsetIdx[2] % blockWidth + blockWidth) % blockWidth + (xIdx - 1) * blockWidth} 
          offsetY={(offsetIdx[3] % blockHeight + blockHeight) % blockHeight + (yIdx - 1) * blockHeight}
        />;
      });
    })}
 </div>;
}

const functions = new Set();
const G02BContainer = (props) => {
  const [status, setStatus] = useState(G02BStatus.IDLE);
  const [userIsInteract, setUserIsInteract] = useState(false);
  const [containerOffset, setContainerOffset] = useState([0,0]);
  const [pointerCoordinate, setPointerCoordinate] = useState([0,0]);
  const [autoPanSpeed, setAutoPanSpeed] = useState([1,-1]);
  // const [autoPanSpeed, setAutoPanSpeed] = useState([0,0]);
  let animationFrame = null;

  useEffect(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    // autoScroll();
    // console.log(autoPanSpeed);
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    }
  }, [userIsInteract, autoPanSpeed])

  const autoScroll = () => {
    if (userIsInteract) {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    } else {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      animationFrame = requestAnimationFrame(autoScroll);
      setContainerOffset(prevContainerOffset => {
        return [prevContainerOffset[0] + autoPanSpeed[0], prevContainerOffset[1] + autoPanSpeed[1]];
      })
    }
  }

  const dragStart = useCallback((event) => {
    let pointer = (event.touches? event.touches[0]: event);
    setPointerCoordinate([containerOffset[0] - pointer.clientX, containerOffset[1] - pointer.clientY]);
    setUserIsInteract(true);
  },[containerOffset]);

  functions.add(dragStart);
  useEffect(() => {
    if (userIsInteract) {
      document.addEventListener('mousemove', dragMove);
      document.addEventListener('mouseup', dragEnd);
    }
    return () => {
      document.removeEventListener('mousemove', dragMove);
      document.removeEventListener('mouseup', dragEnd);
    }
  }, [userIsInteract])
  const dragMove = (event) => {
    let pointer = (event.touches? event.touches[0]: event);
    // console.log(pointer.clientX, pointer.clientY);
    setContainerOffset(
      [pointerCoordinate[0] + pointer.clientX, pointerCoordinate[1] + pointer.clientY]
    )
  }
  const dragEnd = (event) => {
    let pointer = (event.touches? event.touches[0]: event);
    setUserIsInteract(false);
    // setAutoPanSpeed([(pointerCoordinate[0] + pointer.clientX) / 1200, (pointerCoordinate[1] + pointer.clientY) / 1200])
  }
  return <div id="G02BContainer" onMouseDown={dragStart}>
    <CitiesList 
      positionOffset={containerOffset}
      citiesArray={[0,1,2,3,4,5,6,7,8,9]}
    />
    {/* <CityDetailsContainer /> */}
    {/* <LanguageSelection /> */}
    {functions.size}
  </div>;
}

export default G02BContainer;