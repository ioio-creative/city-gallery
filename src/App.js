import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import routes from 'globals/routes';

import asyncLoadingPage, { asyncLoadingAppUseHooks } from 'components/asyncLoadingComponent';
// import {library} from '@fortawesome/fontawesome-svg-core';
import { InfoContextProvider } from 'globals/contexts/infoContext';

import './App.css';
const App = props => {
  // constructor(props) {
  //   super(props);
  //   this.getRenderPropForRoute = this.getRenderPropForRoute.bind(this);
  // }
  // componentDidMount() {
  // }
  const getRenderPropForRoute = pageName => {
    const AppComponent = asyncLoadingPage(pageName);
    // const AppComponent = asyncLoadingAppUseHooks(pageName);
    return match => {
      return <AppComponent match={match} />;
    };
  };
  // render() {
  return (
    <div id='App'>
      <InfoContextProvider>
        <Switch>
          <Route exact path={routes.exG02A} render={getRenderPropForRoute('exG02A')} />
          <Route exact path={routes.exG02A2} render={getRenderPropForRoute('exG02A2')} />
          <Route exact path={routes.exG02B} render={getRenderPropForRoute('exG02B')} />
          <Route exact path={routes.exG02B2} render={getRenderPropForRoute('exG02B2')} />
          <Route exact path={routes.ex402} render={getRenderPropForRoute('ex402')} />
          <Route exact path={routes.ex302} render={getRenderPropForRoute('ex302')} />
          <Route exact path={routes.ex302A} render={getRenderPropForRoute('ex302A')} />
          <Route exact path={routes.ex303HKI} render={getRenderPropForRoute('ex303HKI')} />
          <Route exact path={routes.ex303KC} render={getRenderPropForRoute('ex303KC')} />
          <Route exact path={routes.ex303HH} render={getRenderPropForRoute('ex303HH')} />
          <Route exact path={routes.ex303YT} render={getRenderPropForRoute('ex303YT')} />
          {/* <Route exact path={routes.ex302B} render={getRenderPropForRoute('ex302B')} /> */}
          <Redirect to={routes.ex303HKI} />
        </Switch>
      </InfoContextProvider>
    </div>
  );
  // }
};

export default App;
