import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from '../components/Home';
import Success from './Success';

const Main = () => (
  <main>
    <Switch>
      <Route exact path='/' component={Home} />
      <Route path='/oauth/callback' component={Success} />
    </Switch>
  </main>
);

export default Main;
