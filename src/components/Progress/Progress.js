import sayings from './sayings';
import Grid from '@material-ui/core/Grid/Grid';
import Typography from '@material-ui/core/Typography/Typography';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';
import React from 'react';
import { withStyles } from '@material-ui/core';

const styles = theme => ({
    progress: {
        marginLeft: '50%'
    },
    flex: {
        flexGrow: 1
    }
});

class Progress extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            saying: sayings[Math.floor(Math.random() * sayings.length)]
        };
    }

    componentDidMount () {
        this.setState({ saying: sayings[Math.floor(Math.random() * sayings.length)] });
    }

    render () {
        const {classes} = this.props
        return (
            <Grid className={classes.flex} container spacing={24} justify="center" alignItems={'center'}
                  direction={'column'}
                  style={{ marginTop: '20%' }}>
                <Typography variant={'caption'}>{this.state.saying}</Typography>
                <CircularProgress color="secondary"/>
            </Grid>);
    }
}

export default withStyles(styles)(Progress);
