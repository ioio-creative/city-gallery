import React from 'react';

// new apis
import {useState, useEffect, useContext} from 'react';

const InfoContext = React.createContext();

const InfoContextProvider = (props) => {
  const [locations, setLocations] = useState([
    {
      name: "hk",
      position: {
        lat: 22.330571,
        lon: 114.172992
      },
      data: [
        {
          area: 1108
        }, {
          population: 7448900
        }, {
          density: 6777 // per km square
        }, {
          gdp: 484000000000
        }, {
          gini: 53.9
        }
      ]
    }
  ]);
  useEffect(() => {

  }, [])
  const setLocations = (locationsData) => {
    if (Array.isArray(locationsData)) {
      locationsData.forEach(locationData => {
        locationData.name
      })
    }
  }
  return (
    <InfoContext.Provider 
      value={{
        locations: locations,
        setLocations: setLocations
      }}>
      {props.children}
    </InfoContext.Provider>          
  );
}
const InfoContextValue = () => useContext(InfoContext);

export {
  InfoContext,
  InfoContextProvider,
  InfoContextValue
};