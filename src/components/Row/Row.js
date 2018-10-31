import React from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';

// sort
import { SortableElement } from 'react-sortable-hoc';

// edit
import { RIEInput } from 'riek';
import _ from 'lodash';

import Button from '@material-ui/core/es/Button/Button';
import Grid from '@material-ui/core/Grid/Grid';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core';
import Paper from '@material-ui/core/Paper/Paper';
import Typography from '@material-ui/core/Typography/Typography';
import './Row.css';

const styles = theme => ({
    root: {
        flexGrow: 1
    },
    paper: {
        height: 60,
        width: 500,
        padding: 15
    }
});

const Row = SortableElement((props) => {
    return (
        <Grid item xs={12} style={{ zIndex: 1000, marginBottom: 15 }} className={'row'}>
            <Paper className={props.classes.paper}>
                <Grid container
                      direction="row"
                      justify="space-between"
                      alignItems="center">
                    <Typography component="h1" variant="display1" align={'center'} gutterBottom>
                        {props.order + 1}
                        <RIEInput
                            value={props.body}
                            change={props.rowCallbacks.edit.bind(null, props.id)}
                            propName='body'
                            className={props.body === 'New Row' ? 'row__editor row__edit-me' : 'row__editor'}
                            validate={_.isString}
                        />
                    </Typography>
                    <div>
                        <Button
                            onClick={props.rowCallbacks.toggleMute.bind(null, props.id)}
                        >
                            {props.mic ? <MicIcon/> : <MicOffIcon/>}
                        </Button>
                        <Button
                            onClick={props.rowCallbacks.remove.bind(null, props.id)}
                        >
                            <DeleteIcon/>
                        </Button>
                    </div>
                </Grid>
            </Paper>
        </Grid>
    );
});

export default withRouter(withStyles(styles)(Row));
