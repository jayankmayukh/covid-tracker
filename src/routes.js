import React from 'react';
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import App from './App';

const routes = (
  <Router>
        <Switch>
            <Route path="/*">
                <App/>
            </Route>
        </Switch>
  </Router>
);

export default routes;