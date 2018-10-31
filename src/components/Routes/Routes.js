import React from 'react';
import { Route, Switch } from 'react-router-dom';
// Route components
import SyncDoc from '../../lib/Sync/SyncDoc';
import PropTypes from 'prop-types';
import Home from '../Home/Home';

const NoMatch404 = ({ location }) => (
    <div>
        <h3>No match for <code>{location.pathname}</code></h3>
    </div>
);

NoMatch404.propTypes = {
    location: PropTypes.object.isRequired
};

const Routes = ({ user, syncClient }) => {

    return (
        <Switch>
            <Route exact path="/"
                   render={(p) =>
                       <SyncDoc syncClient={syncClient} user={user}>
                           <Home user={user} match={p.match}/>
                       </SyncDoc>
                   }
            />
            <Route component={NoMatch404}/>
        </Switch>
    );

};

Routes.propTypes = {
    syncClient: PropTypes.object.isRequired,
    user: PropTypes.string.isRequired
};

export default Routes;
