import React, {Fragment} from 'react';
// new apis
import { useState, useEffect, useCallback, useMemo } from 'react';

import {useContext} from 'react';

import FlipDotsContainer from 'containers/flipDotsContainer';

const App = (props) => {
  // render
  return (
    <Fragment>
      <div style={{height: '100%', overflow: 'auto'}}>
        <FlipDotsContainer />
        <FlipDotsContainer boardSize={[224, 56]}/>
      </div>
    </Fragment>
  );
}
export default App;