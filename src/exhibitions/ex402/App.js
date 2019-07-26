import React, {Fragment} from 'react';
// new apis
import { useState, useEffect, useCallback, useMemo } from 'react';

import {useContext} from 'react';

import CityDisplayContainer from 'containers/cityDisplayContainer';
import BuildingGameContainer from 'containers/buildingGameContainer';

const App = (props) => {
  // render
  return (
    <Fragment>
      {/* <CityDisplayContainer /> */}
      <BuildingGameContainer />
    </Fragment>
  );
}
export default App;