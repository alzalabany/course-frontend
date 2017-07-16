import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import 'typeface-roboto';

import App from './app.js';
import registerServiceWorker from './registerServiceWorker';

import Store from './createStore';


ReactDOM.render(
  <Provider store={Store}><App /></Provider>, 
document.getElementById('root'));

// registerServiceWorker();
