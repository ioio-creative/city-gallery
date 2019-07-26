import React from 'react';
import ReactDOM from 'react-dom';
import App from 'App';
import {HashRouter} from 'react-router-dom';
import './index.css';
// import registerServiceWorker from './registerServiceWorker';
ReactDOM.render((
  <HashRouter>
		<App />
  </HashRouter>
), document.getElementById('root'));
// registerServiceWorker();