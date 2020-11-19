import React from 'react';
import {useEffect, useState} from 'react';
import api from 'websiteApi';
import G303 from './G303';

const App = (props) => {
  const [appData, setAppData] = useState(null);
  useEffect(() => {
    // api.fetchExhibitionJsonFromUrl('./json/303.json', setAppData);
  }, [])
  useEffect(() => {
    if(appData){
      console.log(appData)
    }
  }, [appData]);

  return <G303 />;
}
export default App;