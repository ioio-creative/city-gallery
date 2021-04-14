import React,{useEffect, useState} from 'react';
import api from 'websiteApi';
import G302A from './G302A';

const App = (props) => {
  const [appData, setAppData] = useState(null);
  useEffect(() => {
    api.fetchExhibitionJsonFromUrl('./json/302a.json', setAppData);
  }, [])
  useEffect(() => {
    if(appData){
      console.log(appData)
    }
  }, [appData]);

  return (
    <>
      {appData && <G302A appData={appData} />}
    </>
  );
}
export default App;