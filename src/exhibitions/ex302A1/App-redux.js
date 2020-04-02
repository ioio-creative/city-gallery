import React from 'react';
import {useState, useEffect} from 'react';

import { Provider } from 'react-redux'

import store from './redux/store';

import ReduxPageId from './ReduxPageId';

const App = (props) => {
    // render
  return (
    <Provider store={store}>
      <div className="decadeSelect">
        1
        2
        3
        4
        5
      </div>
      <ReduxPageId />
    </Provider>
  );
}
export default App;