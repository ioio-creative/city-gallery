import React, {Fragment} from 'react';
// new apis
import { useState, useEffect, useCallback, useMemo } from 'react';
const Dot = (props) => {
  const [isActive, setIsActive] = useState(0);
  const toggleActive = () => {
    setIsActive(!isActive);
  }
  useEffect(() => {
    setIsActive(props.status);
  }, [props.status]);
  return (<circle onMouseDown={toggleActive} onMouseEnter={props.autoToggle ? toggleActive: null} cx={props.position[0] * 15 + 7.5} cy={props.position[1] * 15 + 7.5} r="7.5" stroke="#aaa" strokeWidth="0.1" fill={isActive? "white": "transparent"} />);
}

const FlipDotsContainer = (props) => {
  const [boardSize, setBoardSize] = useState([112, 42]);
  const [autoToggle, setAutoToggle] = useState(false);
  const [boardStatus, setBoardStatus] = useState(new Array(boardSize[0]).fill(new Array(boardSize[1]).fill(0)));
  let svgElRef = null;
  let svgDataTextRef = null;
  useEffect(() => {
    console.log('componentDidMount');
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      console.log('componentWillUnmount');
      document.removeEventListener('mouseup', onMouseUp);
    }
  }, [])
  useEffect(() => {
    console.log('boardStatus changed');
  }, [boardStatus])
  const onMouseUp = () => {
    setAutoToggle(false);
  }
  const generateSvgForDownload = () => {
    const data = new XMLSerializer().serializeToString(svgElRef);
    const svg = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svg);

    const evt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true
    });
    const dateNow = new Date();
    const dateStr = 
      dateNow.getFullYear() + '-' + (dateNow.getMonth() + 1).toString().padStart(2, '0') + '-'  + dateNow.getDate().toString().padStart(2, '0') + '_' +
      dateNow.getHours().toString().padStart(2, '0') + '.' + dateNow.getMinutes().toString().padStart(2, '0') + '.' + dateNow.getSeconds().toString().padStart(2, '0');
    const a = document.createElement('a');
    a.setAttribute('download', `filpDots_${dateStr}.svg`);
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
  
    a.dispatchEvent(evt);
  }
  const loadSvg = () => {
    const evt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true
    });
    const svgSelectBox = document.createElement('input');
    svgSelectBox.accept = 'image/svg+xml';
    svgSelectBox.type = 'file';
    svgSelectBox.dispatchEvent(evt);
    svgSelectBox.onchange = (e) => {
      // console.log('onchange');
      // debugger;
      const file = e.target.files[0];
      if (file) {
        // console.log('onchange');
        const obj = document.createElement('object');
        obj.data = URL.createObjectURL(file);
        obj.style.width = '1px';
        obj.style.height = '1px';
        obj.style.position = 'fixed';
        obj.style.top = '-1px';
        obj.style.left = '-1px';
        obj.onload = e => {
          URL.revokeObjectURL(obj.data);
          // Get the SVG document inside the Object tag
          const svgDoc = obj.contentDocument;
          // Get one of the SVG items by ID;
      // debugger;

          const svgItems = svgDoc.getElementsByTagName("circle");
          const tmpStatus = [];
          // for (let i = 0; i < boardSize[0]; i++) {
          //   tmpStatus[i] = new Array(boardSize[1]).fill(1);
          // }
          // setBoardStatus(tmpStatus);
          for (let i = 0; i < boardSize[0]; i++) {
            tmpStatus[i] = new Array(boardSize[1]).fill(0);
          }
          // setBoardStatus(tmpStatus);
          // new Array(boardSize[0]).fill(new Array(boardSize[1]).fill(0));
          // console.log(tmpStatus.map(row => row.join('')).join("\n"));
          [...svgItems].forEach(el => {
            const r = el.getAttribute('r');
            const x = Math.round((parseFloat(el.getAttribute('cx')) - r) / (2 * r));
            const y = Math.round((parseFloat(el.getAttribute('cy')) - r) / (2 * r));
            const fill = el.getAttribute('fill') === "transparent"? 0: 1;
            // console.log(x,y,fill);
            tmpStatus[x][y] = fill;
            // if (fill !== 0) console.log(x,y);            
            // console.log((el.getAttribute('cx') - 7.5) / el.getAttribute('r'), (el.getAttribute('cy') - 7.5) / el.getAttribute('r'), el.getAttribute('fill'));
          })
          // debugger;
          setBoardStatus(tmpStatus);
          document.body.removeChild(obj);

        }
        document.body.appendChild(obj);
        
      }
    }
  }
  const loadPlastic = () => {
    const plasticArr = [
      [...new Array(14).fill(0),0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,...new Array(15).fill(0)],
      [...new Array(14).fill(0),0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,...new Array(15).fill(0)],
      [...new Array(14).fill(0),0,0,1,0,0,1,0,0,1,0,0,0,1,0,0,...new Array(15).fill(0)],
      [...new Array(14).fill(0),0,1,0,0,0,1,0,0,1,1,1,0,0,1,0,...new Array(15).fill(0)],
      [...new Array(14).fill(0),0,1,0,0,1,1,1,0,0,0,0,1,0,1,0,...new Array(15).fill(0)],
      [...new Array(14).fill(0),1,0,1,1,1,1,0,0,0,0,0,1,0,0,1,...new Array(15).fill(0)],
      [...new Array(14).fill(0),1,0,0,0,0,0,1,1,1,0,0,0,1,0,1,...new Array(15).fill(0)],
      [...new Array(14).fill(0),1,0,0,0,0,0,1,1,1,0,0,0,1,0,1,...new Array(15).fill(0)],
      [...new Array(14).fill(0),1,0,0,0,0,0,1,1,1,0,0,0,1,0,1,...new Array(15).fill(0)],
      [...new Array(14).fill(0),1,0,1,1,1,1,0,0,0,0,0,1,0,0,1,...new Array(15).fill(0)],
      [...new Array(14).fill(0),0,1,0,0,1,1,1,0,0,0,0,1,0,1,0,...new Array(15).fill(0)],
      [...new Array(14).fill(0),0,1,0,0,0,1,0,0,1,1,1,0,0,1,0,...new Array(15).fill(0)],
      [...new Array(14).fill(0),0,0,1,0,0,1,0,0,1,0,0,0,1,0,0,...new Array(15).fill(0)],
      [...new Array(14).fill(0),0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,...new Array(15).fill(0)],
      [...new Array(14).fill(0),0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,...new Array(15).fill(0)]
    ];
    for (let i = 0; i < 48; i++) {
      plasticArr.unshift(new Array(42).fill(0));
      plasticArr.push(new Array(42).fill(0));
    }
    plasticArr.push(new Array(42).fill(0));
    setBoardStatus(plasticArr);
  }
  // render
  return (
    <div style={{
      backgroundColor:"#333",
      textAlign: 'center'
    }}>
      <div style={{
        overflow: 'auto',
        backgroundColor:"#000",
        display: 'inline-block',
        border: '5px solid #ccc',
        margin: '15px auto 5px',
        position: 'relative'
      }}>
        <svg width="1680" height="630"
          onMouseDown={() => setAutoToggle(true)} 
          // onMouseUp={() => setAutoToggle(false)}
          ref={(ref) => svgElRef = ref}
          style={{verticalAlign: 'top'}}
        >
          {boardStatus.map((rowX, xIdx) => {
            return rowX.map((rowY, yIdx) => {
              {/* if (rowY !== 0) debugger; */}
              return <Dot key={xIdx+'_'+yIdx+'_'+rowY} position={[xIdx,yIdx]} status={rowY} autoToggle={autoToggle}/>;
            });
          })}
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          marginTop: -2.5,
          height: 5,
          width: 5,
          backgroundColor: 'red'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          right: 0,
          marginTop: -2.5,
          height: 5,
          width: 5,
          backgroundColor: 'red'
        }}></div>
      </div>
      <br/>
      <div style={{
        color: '#FFFFFF',
        padding: '5px 10px',
        margin: '10px 20px',
        cursor: 'pointer',
        border: '1px solid #ccc',
        display: 'inline-block',
        marginRight: 10
      }}
        onClick={generateSvgForDownload}>
        Download
      </div>
      <div style={{
        color: '#FFFFFF',
        padding: '5px 10px',
        margin: '10px 20px',
        cursor: 'pointer',
        border: '1px solid #ccc',
        display: 'inline-block',
        marginRight: 10
      }}
        onClick={loadSvg}>
        Load Data
      </div>
      <div style={{
        color: '#FFFFFF',
        padding: '5px 10px',
        margin: '10px 20px',
        cursor: 'pointer',
        border: '1px solid #ccc',
        display: 'inline-block',
        marginRight: 10
      }}
        onClick={loadPlastic}>
        Load Plastic
      </div>
    </div>
  );
}
// if use useContext, the withInfoContext is not necessary
// export default App;
export default FlipDotsContainer;