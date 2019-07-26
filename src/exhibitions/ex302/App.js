import React, {Fragment} from 'react';
// new apis
import { useState, useEffect, useCallback, useMemo } from 'react';

import {useContext} from 'react';

import FlipDotsContainer from 'containers/flipDotsContainer';

const App = (props) => {
  // render
  return (
    <Fragment>
      <FlipDotsContainer />
    </Fragment>
  );
}
export default App;