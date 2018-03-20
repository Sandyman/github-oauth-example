import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';

import './index.css';

import config from './linc.config.js';

const configMiddleware = config.redux.middleware || [];
const initialState = (window && window.__INITIALSTATE__) || config.redux.initialState || {};
const composeEnhancers = (window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const store = createStore(
  config.redux.reducer,
  initialState,
  composeEnhancers(applyMiddleware(...configMiddleware))
);

render(
  <Provider store={store}>
    <BrowserRouter>
      {config.root}
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
