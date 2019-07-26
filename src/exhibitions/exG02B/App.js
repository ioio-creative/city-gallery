import React from 'react';
import {useEffect, useState} from 'react';

import api from 'websiteApi';

import G02BContainer from 'containers/g02BContainer';


const App = (props) => {
  const [appData, setAppData] = useState(null);
  useEffect(() => {
    api.fetchExhibitionJsonFromUrl('/json/g02b.json', setAppData);
  }, [])
  useEffect(() => {
    console.log(appData)
  }, [appData]);
  return (
    <>
      <G02BContainer />
    </>
  );
}
export default App;