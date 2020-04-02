import React from 'react';
import {useState, useEffect} from 'react';
import {DataProvider as Provider} from 'globals/contexts/dataContext';

import {STAGE} from './globals/constants';
import Ex302aTutorial from 'containers/ex302aTutorial';
import Ex302aBackground from 'containers/ex302aBackground';

import './App.css';
import Ex302aDecadeSelection from 'containers/ex302aDecadeSelection';
const App = (props) => {
    // render
  return (
    <Provider initialState={{
      showTutorial: false,
      currentStage: STAGE.IDLE,

    }}>
      <div className="idleLayer lineLayer">idleLayer lineLayer</div>
      {/* <div className="tutorialLayer">tutorialLayer</div> */}
      <Ex302aBackground />
      <Ex302aTutorial />
      <Ex302aDecadeSelection />
      {/* <div className="decadeSelectLayer">decadeSelectLayer</div> */}
      <div className="decadeViewingLayer">decadeViewingLayer</div>
      <div className="menuLayer">menuLayer</div>
      <div className="decadeLandingLayer">decadeLandingLayer</div>
      <div className="galleryLayer">galleryLayer</div>
    </Provider>
  );
}
export default App;