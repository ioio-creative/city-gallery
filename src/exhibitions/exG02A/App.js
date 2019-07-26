import React, {Component, Fragment} from 'react';
// import {addLocaleData, injectIntl} from "react-intl";

// import api from 'websiteApi';

// import mergeObjects from 'utils/js/mergeObjects';

// import Page from 'pages/page';

import GlobeContainer from 'containers/globeContainer';
// import ClickableArea from 'containers/clickableArea';
import CmsPanel from 'containers/cmsPanel';

// import {config} from './localConfig';
// import localeData from './locales/data.json';

// since only text this time,
// try use remote data source (no localJson) only
// (with the help of electron to open json? file)

// // // const localJson = require('json/exhibition_2.1.right.json');


class App extends Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     testing: true
  //   }
  // }

  componentDidMount() {
    
  }

  componentWillUnmount() {
    
  }

  render() {
    // const state = this.state;
    // console.log(state.testing);
    return (
      <Fragment>
        <GlobeContainer />
        <CmsPanel />
      </Fragment>
    );
  }
}

export default App;