import React from 'react';
import {useState, useEffect, useRef} from 'react';
import {useDataValue} from 'globals/contexts/dataContext';
import {TimelineMax, TweenMax, Back, Power0} from 'gsap';
import './ex302aDecadeSelection.css';
// should be load from json
const decadesData = [
  {
    color: '#541d95',
    decade: '1930',
    decadeRange: '1930-1939',
    decadeBrief: 'Lorem ipsum dolor sit amet',
    coverImage: './images/ex302a/cover_1930.png',
    backgroundImage: './images/ex302a/background.jpg',
    years: [
      {
        year: 1930,
        type: 1,
        text: 'Lorem ipsum dolor sit amet',
        images: [
          './images/ex302a/cover_1930.png'
        ]
      },
      {
        year: 1931,
        type: 1,
        text: 'Lorem ipsum dolor sit amet',
        images: [
          './images/ex302a/cover_1930.png'
        ]
      },
      {
        year: 1932,
        type: 1,
        text: 'Lorem ipsum dolor sit amet',
        images: [
          './images/ex302a/cover_1930.png'
        ]
      }
    ]
  },
  {
    color: '#0f0',
    decade: '1950',
    coverImage: './images/ex302a/cover_1950.png',
    backgroundImage: './images/ex302a/background.jpg'
  },
  {
    color: '#00f',
    decade: '1970',
    coverImage: './images/ex302a/cover_1970.png',
    backgroundImage: './images/ex302a/background.jpg'
  },
  {
    color: '#0f0',
    decade: '1980',
    coverImage: './images/ex302a/cover_1950.png',
    backgroundImage: './images/ex302a/background.jpg'
  },
  {
    color: '#00f',
    decade: '1990',
    coverImage: './images/ex302a/cover_1970.png',
    backgroundImage: './images/ex302a/background.jpg'
  }
];
const Ex302aDecadeSelection = () => {
  const [{showTutorial, currentStage}, dispatch] = useDataValue();
  const [currentDecade, setCurrentDecade] = useState(0);
  const [activeDecade, setActiveDecade] = useState(null);
  let timelineInstance = useRef();
  const selectDecade = (decade) => {
    if (decade === null && currentDecade !== null) {
      if (timelineInstance.current) {
        timelineInstance.current.kill();
      }
      const decadeContentEl = document.querySelectorAll('.decadeContent')[currentDecade];
      const decadeContentBackgroundEl = decadeContentEl.querySelector('.decadeContentBackground');
      const decadeCoverImageEl = decadeContentEl.querySelector('.decadeCoverImage');
      const middleLineEl = decadeContentEl.querySelector('.middleLine');
      const decadeRangeEl = decadeContentEl.querySelector('.decadeRange');
      const decadeBriefEl = decadeContentEl.querySelector('.decadeBrief');
      timelineInstance.current = new TimelineMax;
      timelineInstance.current.add([
        TweenMax.to(decadeContentBackgroundEl, 0.2, {
          width: '100%',
          opacity: 1
        }),
        TweenMax.to(middleLineEl, 0.2, {
          autoAlpha: 0
        }),
        TweenMax.to(decadeCoverImageEl, 0.2, {
          autoAlpha: 1,
          delay: 0.4
        }),
        TweenMax.to(decadeContentEl, 0.2, {
          delay: 0.2,
          width: 600,
          height: 600,
          borderRadius: '50%'
        }),
        TweenMax.to(decadeBriefEl, 0.2, {
          autoAlpha: 0
        }),
        TweenMax.to(decadeRangeEl, 0.2, {
          autoAlpha: 0
        }),
        TweenMax.set(decadeBriefEl, {
          delay: 0.2,
          top: 160,
          fontSize: 26,
          width: 320
        }),
        TweenMax.set(decadeRangeEl, {
          delay: 0.2,
          top: 120,
          fontSize: 26
        })
        ,
        TweenMax.to(decadeBriefEl, 0.2, {
          delay: 0.4,
          autoAlpha: 1
        }),
        TweenMax.to(decadeRangeEl, 0.2, {
          delay: 0.4,
          autoAlpha: 1
        })
      ])
      setActiveDecade(null);
    } else if (currentDecade === decade) {
      const decadeContentEl = document.querySelectorAll('.decadeContent')[currentDecade];
      const decadeContentBackgroundEl = decadeContentEl.querySelector('.decadeContentBackground');
      const decadeCoverImageEl = decadeContentEl.querySelector('.decadeCoverImage');
      const middleLineEl = decadeContentEl.querySelector('.middleLine');
      const decadeRangeEl = decadeContentEl.querySelector('.decadeRange');
      const decadeBriefEl = decadeContentEl.querySelector('.decadeBrief');

      if (activeDecade !== decade) {
        if (timelineInstance.current) {
          timelineInstance.current.kill();
        }
        timelineInstance.current = new TimelineMax;
        timelineInstance.current.add([
          TweenMax.to(decadeContentEl, 0.2, {
            width: 1080,
            height: 1080,
            ease: Power0.easeNone
          }),
          TweenMax.to(middleLineEl, 0.2, {
            delay: 0.2,
            autoAlpha: 1
          }),
          TweenMax.to(decadeContentEl, 0.2, {
            delay: 0.2,
            borderRadius: '0%',
            height: 1080,
            width: 1920
          }),
          TweenMax.to(decadeContentBackgroundEl, 0.2, {
            delay: 0.2,
            opacity: 0.6
          }),
          TweenMax.to(decadeBriefEl, 0.4, {
            top: 100,
            fontSize: 52,
            width: 960
          }),
          TweenMax.to(decadeRangeEl, 0.4, {
            top: 560,
            fontSize: 32
          }),
          TweenMax.to(decadeContentBackgroundEl, 0.4, {
            delay: 1.8,
            width: 500
          }),
          TweenMax.to(decadeCoverImageEl, 0.2, {
            autoAlpha: 0,
            delay: 1.6
          }),
          TweenMax.to(decadeBriefEl, 0.4, {
            delay: 1.8,
            width: 300,
            fontSize: 26
          }),
          TweenMax.to(decadeRangeEl, 0.4, {
            delay: 1.8,
            fontSize: 65
          }),
        ])
        setActiveDecade(decade);
      }
    } else {
      setCurrentDecade(decade);
    }
  }

  const onYearContentScrollStart = (e, decadeIdx) => {
    // console.log(e, e.clientX);
    const parentEl = e.currentTarget.parentElement;
    const contentWrapperEl = parentEl.parentElement.querySelector('.decadeYearsListWrapper');
    const contentCount = contentWrapperEl.children.length;
    console.log(e.clientX);
    const onDragging = (e) => {
      // e.clientX / window.innerWidth
      const newPercent = Math.max(0, Math.min(e.clientX / window.innerWidth, 1));
      contentWrapperEl.style.transform = `translateX(-${(contentCount - 1) * newPercent * 100}%)`;
      parentEl.style.width = newPercent * 100 + '%';
    }
    document.addEventListener('mousemove', onDragging)
    document.addEventListener('mouseup', function onDragEnd() {
      document.removeEventListener('mousemove', onDragging);
      document.removeEventListener('mouseup', onDragEnd);
    })    
  }
  return <section id="decadeSelectionPage" className="page">
    <div className="currentDecadeIndicator">
      {decadesData.map((decadeData, idx) => {
        return <div key={idx} 
          className={`decadeDot${currentDecade === idx? ' current': ''}`}
        />;
      })}
    </div>
    <div className="decadeSelectionControls">
      <div className="control controlPrev"></div>
      <div className="control controlNext"></div>
    </div>
    <div className="decadesListWrapper" style={{
      transform: `translate(-${currentDecade * 100}%, -50%)`
    }}>
      {decadesData.map((decadeData, idx) => {
        return <div className={`decadeWrapper${currentDecade === idx? ' current': ''}`} key={idx}>
          <div className="decadeContent" onClick={() => {
            selectDecade(idx);
          }}>
            <div className="decadeContentBackground" style={{
              backgroundColor: decadeData['color']
            }} />
            <div className="decadeContentBackgroundImage" style={{
              backgroundImage: `url(${decadeData['backgroundImage']})`
            }} />
            <div className="decadeCoverImage" style={{
              backgroundImage: `url(${decadeData['coverImage']})`
            }} />
            <div className="decadeRange">{decadeData['decadeRange']}</div>
            <div className="decadeBrief">{decadeData['decadeBrief']}</div>
            <div className="decadeBackBtn" onClick={()=>selectDecade(null)}>Select Decade</div>
            <div className="decadeYearsListWrapper">
              {decadeData['years'] && decadeData['years'].map((yearData, yIdx) => {
                return <div className={`decadeYearWrapper type_${yearData['type']}`} key={yIdx}>
                  <div class="year">{yearData['year']}</div>
                  <div class="text">{yearData['text']}</div>
                  <div class="image">{yearData['images'] && yearData['images'].length && <img width="50%" src={yearData['images'][0]} />}</div>
                </div>
              })}
            </div>
            <div className="middleLine" />
            <div className="bottomIndicatorLine">
              <div className="gradientHead" style={{ backgroundImage: `linear-gradient(90DEG, ${decadeData['color']}, transparent)`}} />
              <div className="gradientTail" style={{ backgroundColor:  decadeData['color'] }} />
              <div className="handle" onMouseDown={(e) => onYearContentScrollStart(e, idx)}></div>
            </div>
          </div>
        </div>;
      })}
    </div>
  </section>;
}

export default Ex302aDecadeSelection;