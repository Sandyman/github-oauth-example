import React from 'react'
import App from './App'
import reducer from './reducers'
import thunk from 'redux-thunk'

import './semantic/dist/semantic.css';

const config = {
    polyfills: 'default,fetch,Symbol,Symbol.iterator,Array.prototype.find',
    root: <App/>,
    redux: {
        reducer: reducer,
        // initialState,
        middleware: [ thunk ],
        // enhancers: [],
        // parseServerState: serverState => serverState,
    },
};

export default config
