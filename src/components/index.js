import React from 'react';
import PropTypes from 'prop-types';

export const Whoops404 = ({ location }) => (
    <div>
        <h1>Whoops, resource not found</h1>
        <p>Could not find {location.pathname}</p>
    </div>
);

Whoops404.propTypes = {
    location: PropTypes.object.isRequired
};
