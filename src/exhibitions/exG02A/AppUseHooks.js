// testing react hooks api
// Hooks are a new addition in React 16.8
// https://reactjs.org/docs/hooks-reference.html

import React, {Fragment} from 'react';
// new apis
import { useState, useEffect, useCallback, useMemo } from 'react';

import {useContext} from 'react';

import {InfoContext, withInfoContext} from 'globals/contexts/infoContext';

const App = (props) => {
  const [count, setCount] = useState({value: 0});
  const [count2, setCount2] = useState(0);
  // useContext same as using HOC
  // infoContext and infoContextHOC have the same values
  const infoContext = useContext(InfoContext);
  const infoContextHOC = props.infoContext;

  let testEl = null;
  // combine of componentDidMount and componentWillUnmount:
  useEffect(() => {
    // componentDidMount
    console.log('componentDidMount');
    testEl.addEventListener('click', eventListenerOnClick.bind(this));

    // the return function can treat as componentWillUnmount
    return () => {
      console.log('componentWillUnmount');
      testEl.removeEventListener('click', eventListenerOnClick.bind(this));
    }

    // without [], useEffect will run every render, i.e. = componentDidUpdate
    // the [] can put the variable to monitor, when the variable changed, useEffect will run
    // }, [count]) // everytime count is updated, useEffect will run, i.e. = setState callback
  }, [])

  // setState (setCount only) callback
  useEffect(() => {
    console.log('after setCount, count.value: ', count.value);
  }, [count])

  // componentDidUpdate
  useEffect(() => {
    // console.log('componentDidUpdate');
  })

  // useRef seems same as React.createRef before and the ref element is in el.current also
  const setTestEl = (ref) => testEl = ref;

  // useMemo will use the "same" return value when call unless the watching value updated
  // in this test, the testMemo return the old timestamp unless count2 updated
  const testMemo = useMemo(()=>{
    console.log('useMemo: ', Date.now());
    return Date.now();
  }, [count2])

  // useCallback will use the "same" function when call unless the watching value updated
  // in this test, the setCount will not function unless use callback
  const elementOnClick = useCallback((e) => {
    e.preventDefault();
    // if direct bind on jsx, count is the most updated value
    // same as before, if the state update too frequent, still need callback
    console.log('elementOnClick, count value: ', count.value);
    console.log('time now: ', new Date);
    console.log('testMemo: ', testMemo);
    // this fails
    setCount({...count, value: count.value + 1});
    // this works
    // setCount(prevCount => {
    //   return {
    //     ...prevCount, value: prevCount.value + 1
    //   }
    // });
  }, [count2])

  const eventListenerOnClick = (e) => {
    e.preventDefault();
    // if bind on addEventListener, must use callback to retrieve current state 
    console.log('eventListenerOnClick, count2 value: ', count2); // always the initial value
    setCount2(prevCount2=>prevCount2 + 1);
  }
  // render
  return (
    <Fragment>
      <div>{testMemo}</div>
      <div onClick={elementOnClick}>Bind on jsx: {count.value}</div>
      <div ref={setTestEl} >Bind on addEventListener: {count2}</div>
      <div onClick={()=>{
        console.log(infoContext.state);
        console.log(infoContextHOC.state);
      }}>
        test context
      </div>
    </Fragment>
  );
}
// if use useContext, the withInfoContext is not necessary
// export default App;
export default withInfoContext(App);