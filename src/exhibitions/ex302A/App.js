import React, {Fragment} from 'react';
// new apis
import { useState, useEffect, useCallback, useMemo } from 'react';

import {useContext} from 'react';

import LineVibrateContainer from 'containers/lineVibrateContainer';

const App = (props) => {
  // render
  return (
    <Fragment>
      <LineVibrateContainer />
    </Fragment>
  );
}
export default App;