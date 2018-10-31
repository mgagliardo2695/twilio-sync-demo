import React from 'react';
import {render} from 'react-dom';
import App from './components/App/App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import 'typeface-roboto';
import {Route, Router, Switch} from "react-router-dom";
import {Whoops404} from "./components";
import createHashHistory from 'history/createHashHistory';
const history = createHashHistory();

render(
    <Router history={history}>
        <Switch>
            <App/>
            <Route path="*" component={Whoops404}/>
        </Switch>
    </Router>,
    document.getElementById('root')
);

registerServiceWorker();
