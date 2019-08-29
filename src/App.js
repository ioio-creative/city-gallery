import React from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import routes from 'globals/routes';

import asyncLoadingPage, {asyncLoadingAppUseHooks} from 'components/asyncLoadingComponent';
// import {library} from '@fortawesome/fontawesome-svg-core';
import { InfoContextProvider } from 'globals/contexts/infoContext';

import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.getRenderPropForRoute = this.getRenderPropForRoute.bind(this);
  }
  componentDidMount() {
  }
  getRenderPropForRoute(pageName) {
    const AppComponent = asyncLoadingPage(pageName);
    // const AppComponent = asyncLoadingAppUseHooks(pageName);
    return (match) => { return (<AppComponent match={match} />) };
  }
  render() {
    return (
      <div id="App">
        <InfoContextProvider>
          <Switch>
            <Route exact path={routes.exG02A} render={this.getRenderPropForRoute('exG02A')} />
            <Route exact path={routes.exG02B} render={this.getRenderPropForRoute('exG02B')} />
            <Route exact path={routes.exG02B2} render={this.getRenderPropForRoute('exG02B2')} />
            <Route exact path={routes.ex402} render={this.getRenderPropForRoute('ex402')} />
            <Route exact path={routes.ex302} render={this.getRenderPropForRoute('ex302')} />
            <Route exact path={routes.ex302A} render={this.getRenderPropForRoute('ex302A')} />
            <Route exact path={routes.ex302B} render={this.getRenderPropForRoute('ex302B')} />
            <Redirect to={routes.ex302} />
          </Switch>
        </InfoContextProvider>
      </div>
    );
  }
}

export default App;
