import {SET_PAGE_ID} from '../actions';

const initialState = {
  pageid: 0

};

const exhibitionStatusReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PAGE_ID: 
    console.log(action);
      return {
        ...state,
        pageid: action.data
      }
    default:
      return state;
  }
}

export default exhibitionStatusReducer;