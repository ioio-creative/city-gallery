import React, { useState, useRef } from 'react';
import './style.scss';

import Menu from './Menu';
import Map from './Map';

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

  const onClickMapIndicator = i => {
    setMapIndicatorIdx(i);
    handleMove.current.updateMapIndicatorIdx(i, zoomed);
  };

  const onClickYear = i => {
    if (!started)
      if (i !== yearIdx) {
        setYearIdx(i);
        handleSelectCoastline.current.selectCoastline(i);
      }
  };

  const onClickStart = () => {
    if (yearIdx !== null) {
      // setStarted(true);
      handleStart.current.start();
      handleShowCoastline.current.showCoastline(yearIdx);
    }
  };

  return (
    <div id='main' className={`${started ? 'started' : ''}${zoomed ? ' zoomed' : ''}`}>
      {/* <img alt='' src='./images/ex303/hkIsland_diffuse.svg' style={{position:"absolute", top: 223, left: 364, opacity:0.3}}></img> */}
      {/* <img alt='' src='./images/ex303/1900_BaseMap.svg' style={{position:"absolute", top: 223, left: 364, opacity:0.3}}></img> */}
      {/* <img alt='' src='./images/ex303/Pre-1900_HKI.png' style={{position:"absolute", top: 223, left: 364, opacity:0.3}}></img> */}
      {/* <img alt='' src='./images/ex303/Pre-1900_HKI_Mask.svg' style={{position:"absolute", top: 223, left: 364, opacity:0.3}}></img> */}
      {/* <svg style={{position:"absolute"}} id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="3242.1" height="1859.6" viewBox="0 0 3842.1 2159.6">
        <defs>
        <style></style>
        </defs>
        <rect width="3242.1" height="1859.6" viewBox="0 0 3842.1 1859.6"/>
        <g id="Pre1900_HKI" data-name="Pre1900 HKI">
        <polygon fill="#fff" points="259.94 437.52 265.99 443.57 270.02 447.6 278.08 451.63 282.11 459.69 286.14 463.72 286.14 471.77 290.17 475.81 294.2 479.83 294.2 489.55 298.23 495.95 298.23 504.01 294.2 508.04 290.17 512.07 286.14 516.1 282.11 520.13 278.08 524.16 274.05 528.19 270.02 528.19 265.99 528.19 261.96 520.13 259.94 515.36 257.93 512.07 253.9 512.07 249.87 516.1 245.84 512.07 245.84 508.04 245.84 504.01 241.81 504.01 237.78 504.01 233.75 504.01 229.72 499.98 225.69 495.95 225.69 491.92 225.69 486.43 225.69 480.76 229.72 475.81 229.72 471.77 233.75 466.86 237.78 459.69 241.81 455.66 245.84 451.63 249.87 443.57 253.9 443.57 259.94 437.52"/>
        <polygon fill="#fff" points="8.08 516.1 12.11 508.04 20.17 499.98 28.23 495.95 32.26 487.89 37.4 487.89 42.69 482.86 44.35 479.83 52.41 475.81 60.47 471.77 68.53 471.77 76.59 471.77 84.65 467.75 88.68 467.75 96.74 471.77 100.77 467.75 108.83 463.72 112.86 459.69 116.89 463.72 116.89 468.85 120.92 475.81 120.92 479.83 124.95 483.86 128.98 487.89 133.01 491.92 137.03 499.98 141.06 504.01 145.09 508.04 149.13 512.07 157.18 512.07 161.21 512.07 165.24 512.07 171.6 516.1 177.33 516.1 181.36 520.13 185.39 524.16 189.42 532.22 194.17 532.22 197.48 536.25 197.48 542.43 197.48 550.59 201.51 556.4 201.51 564.61 197.48 572.52 193.45 580.58 185.39 588.64 181.36 592.67 176 592.67 173.3 592.67 168 592.67 165.24 592.67 161.21 596.7 157.18 596.7 153.16 596.7 149.13 600.73 145.17 600.73 141.06 600.73 137.03 596.7 133.01 592.67 128.98 592.67 124.95 596.7 121.7 600.73 116.89 604.76 112.86 604.76 108.83 604.76 108.83 600.73 104.8 596.7 104.8 592.67 100.77 592.67 96.74 592.67 92.71 596.7 88.68 600.73 88.68 600.73 84.65 604.76 80.62 604.76 76.59 604.76 72.56 604.76 68.53 600.73 64.5 600.73 60.47 600.73 56.44 604.76 56.44 608.79 60.47 612.82 65.71 612.82 72.56 616.85 72.56 616.85 72.56 620.88 68.53 620.88 64.5 620.88 56.44 620.88 48.38 624.91 44.35 620.88 38.93 624.91 36.29 628.94 32.26 628.94 28.23 624.91 26.37 628.94 28.23 632.97 24.2 637 16.14 637 12.11 632.97 16.14 628.94 12.11 624.91 8.08 624.87 4.05 620.88 0.02 616.85 4.05 612.82 0.02 608.79 0.02 603.8 0.02 600.73 0.02 595.43 0.02 588.64 4.05 584.61 4.05 580.58 4.05 576.55 8.08 572.52 12.11 568.49 12.11 564.46 12.11 560.43 12.11 556.4 16.14 548.34 16.14 544.31 12.11 540.28 12.11 536.25 12.11 532.22 12.11 528.19 12.11 524.16 8.08 520.13 8.08 516.1"/>
        <path id="Pre1900_HKI-2" data-name="Pre1900 HKI" fill="#fff" opacity='0.9' d="M942.93,2035.05l7.24-7.23,4-8.06,4-12.08,4-4-8-4,8-8,8.06-8.06,4-8,8-12.09h5.21l2.85-12.08v-8.06l4-8,4-4,4-12.08v-28.2l12.09-12.08v-16.11l4-12.08v-24.17l-8-4v-12.08l-4-4,4-8.06-4-8h-4l-4-8.06-8-4,4-12.09v-24.16l-4-4-8.06-4v-8.06l-12.08,4-13.77-4-6.37,4h-8.06l-4-4-4,4-8.06-4V1718l4-8.4-8-8v-6.49l-8.06-9.62-4-8.06-8-4-4-8,8.05-12.09,8.06-8L922,1633.1,918,1621l-4-8-4-8.06v-16.11l4-8.06-8.06-8-4-12.08v-12.09l-4-8-4,12.08H881.7l-8.06-4-4,4v12.08l-4,4,4,8.06-4,7.79-12.09.26-4,4-4,12.08-4,8.06-8.06,4-8.05,4-8.06,4-12.08,4v12.08l-8.06,4-4-4v-7L785,1625H768.92L760.86,1613h-8.05l-4-4-8,4-4-4-4-8.06-8.06-4V1585l-4-4.3-8.06-12.08-8-12.08-4-4v-13.15l4-7-4-8.05,8-12.09v-16.11l-4-12.08,4-12.09,8.06-4-4-12.09v-12.08l4-12.08,4-8.06,8-8.05,4-12.09-8.06-8-4,4v-16.11l8-8-4-8.06,4-4v-8l-8-4v-8.05l-4-8.06H708.5l-8-7.92v-8.19l-8.06-4-8-4-8.06-4-4-8.06v-12.08l-8-4,4-8.06-4-4,4-8.06V1242.4l4-12.08,8.06-8.06v-4l-8.06-8V1190L660.17,1178l-8.06-8.06-8.05-4-8.06,8.06v11.37l-4,4.74-4,8.06-8.06,4-4,8.06-8.05,4H595.73l-12.09,4-8-4h-8.06l-12.08-8.06H531.28l-20.14-4-12.08-4H491L483,1186H470.86l-4-8-4-4-12.08-4-4-4-12.14-4-4-4-8.06-4V1149l-8-7.25,4-12.09-4-7.24-4-4.84h-8.06l-8.05-8.06-4-8-4-4-12.08-4-4-8-12.08-16.11h-8.52l-7.59-4-4-8.06-8.06-4-8.05-8.06-8.06-4-8-4-8.06-4h-7.13l-5-4-8.06,4-8-8.06-12.09-4-4-8,4-16.11-4-8.06v-7.38l-4-4.7,4-8.06-8.05-4,4-12.08-12.09-4,8.06-12.08,4-16.11,12.08-12.09V892l4-12.08,4-12.08V855.73l12.08-8.05V835.59l-4-8.05,4-8.06V807.4l8.05-4,12.09-8,12.08-16.11,8.06-4,8.05-12.09,4-8.05L342,743l4-12.09,8.06-8,8.05-12.09,24.17-20.14,16.11-8.05,8.06-12.08,16.11-4,8.05-4,28.2-4,8.05-4,12.09-4L495,642.26l28.2-4,16.11-4h19.41l20.86-4h16.12l20.13,8.05,20.14,4h36.25l16.11,4,16.12,4,8,4,12.08,8.06,12.09,4,16.11,4h16.11l16.11-4,16.11-4,12.09-4,12.08-4,20.14-12.08,12.08-12.08,8.06-12.09,8-16.11,4-12.08,4-12.08,8-8.06,8.06-8,12.08-8.06L926,545.59l12.09-12.08,8-8,8.06-4,12.08-8.06,4-20.14,4-12.08,8-12.08L990.45,457V436.84c4,4-4-8-4-8l4-12.08,8-8.06h16.12l12.08,4,16.11,4,28.19,4,16.12,12.09,12.08,4h44.3l20.14-4,12.09-4,16.11-8.06,16.11-8.05,12.08-8.06,12.09-8.05,12.08-4,16.11-4h24.17l12.08,12.08,8.06,4,12.08,4h16.11l16.11-4,16.11-8.05,4-12.09,4-12.08,4-4,8.05-4h28.2l12.08,4h8l4,12.09v8.05l8.06,8.06,12.08,4H1506l12.09,4h8.05l16.11,4h24.17l8.06,4,4,4,4,8.05,8.06,4h8.05l8.06,4,4,4h16.11l8.05-4,8.06-4,4-4,8-8.05,8.06-4h4l8.05-4,8.06-4,4-4h4l8.06,4,12.08,8.06,8.06,8.05,16.11,12.09,12.08,12.08,12.08,8.06L1771.84,465H1796l4-8.06,8.06-4h8.05l4,8.05,12.08,8.06,12.09,8.05,4,8.06v12.08l12.08,4,12.08,4h8.06l8.05-4,8.06-4h4l8-4,4-8.05h12.08l12.09,4h24.16l16.11,8.05,8.06,4h20.14l12.08,4,8.06,4,4,4,4,4,8.06,8.06,12.08,8,4,12.08v16.12l4,8,12.08,12.08,4,8.06L2086,598l8.06,8,4,8.06,4,4,8.05,8.06,8.06,12.08,4,12.09,8.06,8,8.06,12.09,12.08,12.08,8.05,8.05,4,8.06,4,8.06,4,8,12.08,8.06,8.06,16.11,8.05,8.05h12.09l12.08,4H2235l8.06,4,8-4h28.2l8-4,20.14-4,20.14,4,20.14,4,24.17,8.06,20.14,8,20.14,8.06,12.08,8.05,16.11,12.09,16.11,12.08,16.11,12.08,4,8.06v16.22l4,3.92h3.61l4.44-4,4-4,12.08-4h28.2l8-4,8.06-4,8.06-8.06,12.08-8.05h4l4,4,4,4,8.06,8.06,4,4,8,8v5.19l-12.08,10.92-8.06,8.06-8.05,12.08,4,8.06H2593l16.59,4,12.08,8,8.06,4,8,4,12.08,8,8.06,4,8.06,8.06,4,4,16.11,12.09,12.09,8,12.08,8.06,12.08,8.05,8.06,8.06,8.06,4h20.13l12.09-4h8.05l12.09,4,12.08,8h54.64l9.8,8.06,16.12-4,8-4,12.08-4,8.06-4,12.08-4,16.11-12.08,12.09-4,16.11-4h12.08l12.09-8.06,8-4,8.06-4,28.19,8.05,28.2-20.13,12.08-16.12V892H3101l40.27-12.08,20.14-16.11,16.11-4L3201.7,896l-4,24.17,8.06,36.25,8.05,8.05H3238l16.11-7.21,16.11-16.95,12.09-16.11,12.08-4,28.19-12.09L3342.67,888l-12.08-32.23V839.62l4-12.08v-8.06l-4-12.08v-8.06l2.54-12.7,2.91-7.26,3.24-3.24,6.46-6.46,9.7-9.7,6.46-9.7,3.24-9.69,3.23-9.7-3.23-6.47-6.47-6.46-3.23-6.46-3.23-9.7,2.55-7.18,8-4,12.08-4,12.09,4,12.08,12.09,4,20.14v8l-4,12.09-8,8-4,8.06v8l12.08,4,12.08,8.06,16.12,16.11,16.11,12.08,20.14,8.06,24.16,8,24.17,4h32.22l12.09,16.11,16.11,12.08,12.08,4,20.14-4,20.14-8.05,20.14-4,28.19-8.06h60.42l16.11-12.08,4-16.11-4-20.14-8.06-16.11L3733.37,751V722.82l-4-24.17-4-24.17V642.26l-4-32.22V577.82l-4-32.23-4-36.25-4-20.13V465l4-16.11,12.08-12.09,28.2-36.25,24.16-28.19L3826,316l20.14-24.17,16.11-12.08,16.11-8.05h16.11l20.14,4,16.11,4,20.14,4,16.11,4h44.3l16.12-4,20.13-4,28.2-8.05,28.19-8.06,28.2-4,32.22-4h36.25l24.17-4,16.11-4,20.14-8.06,24.16-12.08,32.23-16.11,24.16-8.06,25.46-4h35l12.08,4,16.11,8.06,24.17,12.08,32.22,12.09,22.16,11.8,10.06,8.33,4,8.06,4,24.17,8.06,36.25,8.05,36.25,8.06,28.19,8.05,28.2,8.06,28.19,12.08,28.19,16.11,32.23,16.11,24.16,8.06,12.09,8.06,8h12.08l12.08-8,8.06-8.06,4-12.08v-8.06l8.05-12.08,8.06-8.06,12.08-8.05,8.06-4,8.05,4,4,8.05,8.05,12.09,12.09,20.14,8.05,16.11,8.06,12.08,8.05,4h8.06l4-8.06,4-12.08,8.05-12.08,16.11-16.12,12.09-8,12.08-4H4833l16.11,8.06,20.14,12.08,16.11,8.06,12.09,12.08,20.14,8.05,20.13,4,24.17,4,32.22,12.08,20.14,16.11,8.06,12.09,24.16,32.22,12.09,20.14,16.11,20.14,12.08,20.14,12.09,20.14,20.13,20.13L5143.09,743l32.22,20.13,36.25,16.12,28.2,8,32.22,8.06,16.11,12.08,16.11,24.17,12.09,20.14,16.11,24.16L5344.48,896l8.06,8.06,12.08,8,16.11,8.06,12.08,12.08,12.09,8.06,8.05-4L5425,924.21l8.05-8.06,4,12.08,8.05,4h12.09l8.05,8.06,12.09,8h12.08V920.18l8.06-8.06L5509.62,900l8.05-12.08-8.05-4-12.08-16.11-8.06-24.17V819.48l4-28.19,16.11-24.17V738.93l-4-20.14-8.05-24.17V674.48l12.08-16.11,20.14-12.08,16.11-4H5558l16.11,4,12.09,16.11,12.08,16.11,16.11,12.08,20.14-4,8.06,4,8.05-4-4-12.09-4-8.05V626.15L5634.48,610V598l12.08-8.06,20.16-4h16.09l8.06,12.09,12.08,8,8.06,12.08,8.05,8.06,16.11,12.08,16.12,12.09,16.11,12.08,12.08,12.08,20.14,16.11,16.11,12.09,16.11,4,12.09,4,4,8.06h16.11l8.06,8.05,8.06,4,8,4,8.06,8.06-16.11,4-4,4,8.05,4h12.09l8.05,4,8.06,12.08-4,4-4,8.05-4,8.06-4,8.05v8.06l-8.06,4,4,8.05-4,8.06-4,8.05-8.05,4v8.06l-8.06,8.05-12.08,4-8.06,8.06-12.08,4-4,4-12.08,4-8.06,4V896l-4,16.11v16.11l4,12.09,4,4,8.06,8.06,12.08,8.06,8.06,4h8v8.06l-4,8.06,8.06,4,8.05,8.06,8.06,8.05,4,12.09,8.05,12.08,12.09,8.06,12.08,8,12.08,4,12.09-4h12.08l8.06-4h36.25l8-4,4-8.06v-8.05l8.05-4,4,4v8.05l-4,4,4,4h8.06l4,4-4,4,4,4,4,4-8.05,4-4,8.05-4,4v8l-12.08,4-4,4-12.08,4-8.06,8h-8.05l-8.06-8-8-8.06-4,8.06v8l4,8.06,4,4-4,8h-4l-8.06-4-8.05,8.06v8.06l-4,4-8.06,8.06v4l-4,12.08-4,8.06-4,12.08-8.06,4v20.14l-4,4-4,8.06-4,12.08v8.06l4,8-12.08,4-4,4,4,8-4,4-4,8.06v12.08l-8.06,12.08,8.06,4-4,4,8.06,4,4,8-8.06,4,4,8.06-8.06,4-4,4,4,4L5856,1343.1v8.05l-4,8.06-4,12.08-8.05,4v8l-12.09,4-4,12.08,4,12.09-8.05,12.08-4,8.06,8.06,4v12.09l-8.06,8-4,8.06,4,12.08,8.06,12.09,12.08,12.08,8.06,4,12.08-4,8.05-4,8.06,4,4,8-4,8.06v16.11l-4,12.08-12.08,4-4,12.09-8,8.05-12.09,4h-16.11l-8.06-8.06-8.05-8v-8.06l4-8h8.05v-8.06l-8.05-4-8.06-8-8.05,4-4,4-8.06-4-4-8.06-4-12.08-4-8.06,2.93-5-2.93-7-8.06-4h-12.08l-8.06-8.06-4-8v-8.06l-8.06-8-4-8.06-12.08-4,4,8.06,8.05,8.06,4,12.08,4,4V1480l-8.06,8.06h8.06l6.62,3,1.43,13.09,4,4-8.05,8.06v8.06l4,4v12.09l4,8v12.09l8.06,8.05,12.08,8.06h12.08l4,4,4,12.09,4,4,4,8.05-4,8.06,4,4,4-4,8.06-4,4,8,12.08,4v4l-4,8.06-4,8.05,4,8.06,8.06-12.09,12.08-4h12.09l8,12.08,8.06,8,12.08,4,8.06,4,12.08-8.06,12.08-8,4-12.08,12.08-12.09,16.11-8,12.09-12.09,24.16-4h16.12l4-16.12,8.06-12.08h16.11l16.11-4,12.08-8,8.06-8.06h0l12.08-8,8.06-8.06,12.08-4h12.09l8-4,8.06-4,4-8.06,8.06-8h4l12.08-8.06,8.06-12.08,8.05-12.09,8.06-4h20.14l8.05,4,4,4,8.06,8.06,4,4h8.06l8.05,4,4,4,4,4,4,8,4,4,4,8.06,4,8,4,4,4,8.06,4,4,4,8.06v24.17l8.06,4,4,4,4,4,8.06,4,4,4,4,4,4,4V1621l-4,4-4,4,4,8,8.06,4v20.14l-4,4-4,8v8.06l-4,4,4,4,8.06,4v4l-8.06,8.06-4,8.05-4,8.06v4l4-4,8.05-8.06,4-4,8.06-4h52.36l12.08-4h36.25l8.06-8.06,8-8,8.06-4h4l4-12.08v-24.17l4-8.06-4-8-4-12.09,4-8v-24.17l-4-16.11v-8.05l4-8.06v-8.06l4-4,20.14-4,4-4,12.08-8.05h8.06l8-8.06,8.06,4h12.08l8.06,8,4,4,8.06,4,12.08,4,8.06,8,4,12.09h4l8.06,8.05v8.06l4,12.08,8.05,8.06v8.05l4,8.06,8.06,4V1625l4,12.08,8.06,8.06,4,8h12.08l8.06,4,12.08,4,16.11,8.06h16.11l8.06,4,8.05,4,4,8.06h8.06l8,4,8.06,8.06-4,4-8.06,4-12.08,4-8.06,4-8.05,4-12.08,4h-12.09l-8.05,4-8.06-8h-4l-4,8-4,4-8.06-4-4-4-8.05,4h-8.06l-4,8.06V1762l4,20.14v12.09l4,8v4l4,12.08v8.06l8.05,8v24.17l-4,8.06v20.14l4,8.05,4,8.06,4,4h8.06l4,8.06,12.09,4,8.05,4,4,4-4,8.06,12.09,4,4,4v8.06l4,4,4,8-12.08,4-8.06,8.06-8.06,6.84v13.3l-8.05,8.05v12.08l-4,12.09-3.62,7.23"/>
        <polygon id="Pre1900_Kettle_Is." data-name="Pre1900 Kettle Is." class="cls-1" points="3268.16 572.52 3276.22 564.46 3283.37 568.49 3283.37 578.75 3292.34 580.58 3296.37 588.64 3292.34 596.7 3292.34 604.76 3288.31 608.79 3282.26 621.24 3272.19 616.85 3264.13 616.85 3258.16 621.24 3252.04 620.88 3256.07 612.82 3264.13 608.79 3264.13 600.73 3259.15 592.85 3260.1 584.61 3264.13 580.58 3268.16 572.52"/>
        </g>
      </svg> */}
      <div id='yearSelector' className={yearIdx === null ? 'disabled' : ''}>
        <ul>
          {['1900', '1945', '1985', '2019'].map((v, i) => {
            return (
              <li key={i} className={i === yearIdx ? 'active' : ''} onClick={() => onClickYear(i)}>
                <span>{v}</span>
              </li>
            );
          })}
        </ul>
        <div id='startBtn' onClick={onClickStart}>
          確定
        </div>
      </div>
      <div id='mapIndicator'>
        <span>分區</span>
        <ul>
          {[...Array(4)].map((v, i) => {
            return (
              <li key={i} className={i === mapIndicatorIdx ? 'active' : ''} onClick={() => onClickMapIndicator(i)}>
                {i + 1}
              </li>
            );
          })}
        </ul>
      </div>
      <div id='streetInfo'>
        {streetData && <h1>{streetData.name}</h1>}
        {/* <div id='markerOuterWrap'>
          <div id='markerWrap'>
            {props.appData.streets[mapIndicatorIdx].map((v, i) => {
              return <span key={i} style={{ transform: `translate3d(${v.marker.x}px, ${v.marker.y}px, 0` }}></span>;
            })}
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
  );
};

export default G303;