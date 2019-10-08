import React from 'react';
// import BackgroundCanvas from 'components/backgroundCanvas';

import './ex302aBackground.css';
const Ex302aBackground = () => {
  return <section id="backgroundPage" className="page">   
    <div className="middleLine"></div>
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translateX(-50%)',
      color: '#FFF'
    }}>this line will be replaced by unity webgl canvas</div>
  </section>;
}
export default Ex302aBackground;
