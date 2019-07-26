import React from 'react';

const InfoContext = React.createContext();

class InfoContextProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [
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
      ]
    }
  }
  componentDidMount() {    
  }
  render() {
    const props = this.props;
    const state = this.state;
    return (
      <InfoContext.Provider 
        value={{
          state: this.state
        }}>
        {props.children}
      </InfoContext.Provider>          
    );
  }
}
function withInfoContext(Component) {
  return function WrapperComponent(props) {
    return (
      <InfoContext.Consumer>
        {scene => <Component {...props} infoContext={scene} />}
      </InfoContext.Consumer>
    );
  };
}
export {
  InfoContext,
  InfoContextProvider,
  withInfoContext
};