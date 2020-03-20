import React from 'react';
import {useEffect, useState} from 'react';

import api from 'websiteApi';

import G02BContainer from 'containers/g02BContainer2';


const App = (props) => {
  const [appData, setAppData] = useState(null);
  useEffect(() => {
    api.fetchExhibitionJsonFromUrl('./json/g02b.json', setAppData);
  }, [])
  useEffect(() => {
    if(appData){
      console.log(appData)
    }
  }, [appData]);

  return (
    <>
      <G02BContainer appData={appData} />
    </>
  );
}
export default App;