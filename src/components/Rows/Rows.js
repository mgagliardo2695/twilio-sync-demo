import React from 'react';
import RowsList from '../RowsList/RowsList';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button/Button';
import Grid from '@material-ui/core/Grid/Grid';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography/Typography';

const styles = theme => ({
    root: {
        flexGrow: 1
    }
});

const Rows = (props) => (
    <Grid item xs={12} className={props.classes.root}>
        <Typography component="h2" variant="display1" align={'center'} gutterBottom>
            Row State Demo
        </Typography>
        <RowsList
            style={{width: '100%'}}
            items={props.rows}
            // callbacks to keep state
            rowCallbacks={props.rowCallbacks}
            // sort ops
            onSortEnd={props.rowCallbacks.sort}
            useDragHandle={false}
            pressDelay={125}
            disabled={true}
            lockToContainerEdges={true}
            lockAxis='y'/>

        <Button onClick={props.rowCallbacks.add}>
            <AddIcon/> Add Row
        </Button>

    </Grid>

);

export default withRouter(withStyles(styles)(Rows));
