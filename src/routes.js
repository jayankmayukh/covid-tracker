import React from 'react';
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import Graph from './components/Graph';
import Summary from './components/Summary';

export default (
  <Router>
        <Switch>
            <Route path="/">
                <Graph/>
            </Route>
            <Route path="/covid-19_summary">
                <Summary/>
            </Route>
        </Switch>
  </Router>
);