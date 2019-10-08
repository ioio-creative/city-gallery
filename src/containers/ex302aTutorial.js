import React from 'react';
import {useState, useEffect, useRef} from 'react';
import {useDataValue} from 'globals/contexts/dataContext';
import {TweenMax, Back} from 'gsap';
import './ex302aTutorial.css';
const Ex302aTutorial = () => {
  const [{showTutorial, currentStage}, dispatch] = useDataValue();
  const [currentStep, setCurrentStep] = useState(0);

  let stepsWrapperEl = useRef();
  let tutorialBtn = null;
  let stepBtn = null;
  let tutorialContent = null;
  useEffect(() => {
    // const stepEl = stepsWrapperEl.current.querySelectorAll('.stepWrapper .step');
    // const contentEl = stepsWrapperEl.current.querySelectorAll('.stepContent');
    // TweenMax.set(contentEl, { opacity: 0 });
    // TweenMax.set(tutorialBtn, {
    //   autoAlpha: 0
    // });
    // TweenMax.set(stepEl, {
    //   scale: 0
    // })
    // TweenMax.set(stepBtn, { 
    //   scale: 0, 
    //   autoAlpha: 0 
    // });
  }, [])
  useEffect(() => {
    const stepEl = stepsWrapperEl.current.querySelectorAll('.stepWrapper .step');
    const contentEl = stepsWrapperEl.current.querySelectorAll('.stepContent');
    if (showTutorial) {
      TweenMax.set(contentEl, { opacity: 0 });
      // TweenMax.set(tutorialContent, { className: '-=hide'});
      TweenMax.to(tutorialBtn, 0.2, {
        autoAlpha: 0
      });
      TweenMax.fromTo(stepEl, 0.2, {
        scale: 0
      }, {
        scale: 1, ease: Back.easeOut,
        onComplete: () => {
          TweenMax.to(stepBtn, 0.2, { scale: 1, ease: Back.easeOut, autoAlpha: 1 });
          TweenMax.to(contentEl, 0.2, { opacity: 1 });
        }
      })
    } else {
      TweenMax.set(contentEl, { opacity: 0 });
      // TweenMax.set(stepEl, { scale: 0 });
      TweenMax.to(tutorialBtn, 0.2, {
        autoAlpha: 1
      });
      TweenMax.to(contentEl, 0.2, {
        opacity: 0,
        onComplete: () => {
          TweenMax.to(stepEl, 0.2, { scale: 0 });
          TweenMax.to(stepBtn, 0.2, { scale: 0, ease: Back.easeIn, autoAlpha: 0 });
          TweenMax.delayedCall(0.2, () => {
            // TweenMax.set(tutorialContent, { className: '+=hide' });
            setCurrentStep(0);
          });
        }
      })
    }
  }, [showTutorial])
  useEffect(() => {
    if (currentStep < 3) {
      TweenMax.to(stepsWrapperEl.current, 0.4, {
        x: -(currentStep % 3) * 100 + '%'
      })
    } else {
      dispatch({
        type: 'hideTutorial'
      })
    }
  }, [currentStep])
  return <section id="tutorialPage" className={`page${showTutorial?'':' hide'}`}>
    <div className="tutorialContent" ref={ref=>tutorialContent=ref}>
      <div className="stepsWrapper" ref={ref=>stepsWrapperEl.current=ref}>
        <div className="stepWrapper">
          <div className="step">
            <div className="stepContent">
              left<br />
              O<br />
              \/|\<br />
              /\<br />
              1
            </div>
          </div>
        </div>
        <div className="stepWrapper">
          <div className="step">
            <div className="stepContent">
              right<br />
              O<br />
              /|\/<br />
              /\<br />
              2
            </div>
          </div>
        </div>
        <div className="stepWrapper">
          <div className="step">
            <div className="stepContent">
              go<br />
              O<br />
              /|\<br />
              /\<br />
              3
            </div>
          </div>
        </div>
      </div>
      <div className="stepNavigationsWrapper">
        <div className="stepBtn stepNext" 
          ref={ref=>stepBtn=ref}
          onClick={()=>showTutorial && setCurrentStep((prevStep) => prevStep + 1)}>
          {currentStep < 2 ? 'Next': 'Start'}
        </div>
      </div>
    </div>
    <div className="tutorialBtn" 
      ref={ref=>tutorialBtn=ref}
      onClick={()=>dispatch({
        type: 'showTutorial'
      })}>?</div>
  </section>;
}

export default Ex302aTutorial;