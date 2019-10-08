// pass the initial state through props
// const initialState = {};
const reducer = (state, action) => {
  switch (action.type) {
    case 'toggleTutorial':
      return {
        ...state,
        showTutorial: !state.showTutorial
      };
    case 'hideTutorial':
      return {
        ...state,
        showTutorial: false
      };
    case 'showTutorial':
      return {
        ...state,
        showTutorial: true
      };
    default:
      return state;
  }
}

export default reducer;