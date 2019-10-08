import React from 'react';
import {createContext, useContext, useReducer} from 'react';

import reducer from './dataReducer';

const DataContext = createContext();
const DataProvider = ({initialState, children}) => {
  const reducerValue = useReducer(reducer, initialState); 
  return <DataContext.Provider value={reducerValue}>
    {children}
  </DataContext.Provider>;
}
const useDataValue = () => useContext(DataContext);

export {
  DataContext,
  DataProvider,
  useDataValue
}