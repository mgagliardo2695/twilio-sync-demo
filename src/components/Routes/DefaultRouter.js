import React from 'react';
import PropTypes from 'prop-types';
import {createMuiTheme, MuiThemeProvider, withStyles} from '@material-ui/core/styles';
import Hidden from '@material-ui/core/Hidden';
import CheckIcon from '@material-ui/icons/Check';
import Warning from '@material-ui/icons/Warning';
import CircularProgress from '@material-ui/core/CircularProgress';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Routes from './Routes';
// Router
import {Link, Router, withRouter} from 'react-router-dom';
import createHashHistory from 'history/createHashHistory';
import Progress from '../Progress/Progress';

const history = createHashHistory();

const classNames = require('classnames');

const theme = createMuiTheme({

});


const styles = {
    root: {
        flexGrow: 1,
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        height: '100vh'
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,

    },
    menuButton: {
        marginLeft: 40,
        marginRight: 8
    },
    hide: {
        display: 'none'
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar
    },
    flex: {
        flex: 1
    },
    title: {
        paddingRight: '15px'
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3,
        marginTop: '56px',
        minWidth: 0, // So the Typography noWrap works
        overflowY: 'auto'
    },
    statusWrapper: {
        flex: 1,
        margin: theme.spacing.unit,
        position: 'relative'
    },
    fabProgress: {
        color: amber[500],
        position: 'absolute',
        top: -6,
        left: -6,
        zIndex: 1
    },
    buttonProgress: {
        color: green[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12
    },
    buttonSuccess: {
        backgroundColor: green[500],
        '&:hover': {
            backgroundColor: green[700]
        }
    },
    progress: {
        margin: theme.spacing.unit * 2
    },
    navIconHide: {
        [theme.breakpoints.up('sm')]: {
            display: 'none'
        }
    }
};

class DefaultRouter extends React.Component {
    state = {
        open: false,
        mobileOpen: false,
        reconnect: false,
        autocomplete: []
    };
    reconnectTimer = 10;
    timer = null;

    constructor(props) {
        super(props);
        this.handleDrawerClose.bind(this);
        this.handleDrawerOpen.bind(this);
        this.handleDrawerToggle.bind(this);
        this.beginReconnectTimer.bind(this);
    }

    componentDidMount() {
        this.beginReconnectTimer();
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    beginReconnectTimer() {
        this.timer = setInterval(() => {
            if (!this.props.writeClient.connected) {
                const time = this.reconnectTimer - 1;
                this.reconnectTimer = time;
                if (time <= 30) {
                    this.setState({reconnect: true});
                }

                if (time === 0) {
                    this.reconnectTimer = 10;
                    if (this.state.reconnect && !this.props.writeClient.connected) {
                        this.props.recoverServices();
                    }
                }
            }
        }, 1000);
    }

    handleDrawerOpen = () => {
        this.setState({open: true});
    };

    handleDrawerClose = () => {
        this.setState({open: false});
    };

    handleDrawerToggle = () => {
        this.setState(state => ({mobileOpen: !state.mobileOpen}));
    };

    render() {
        const {classes, writeClient} = this.props;

        return (
            <Router history={history}>
                <MuiThemeProvider theme={theme}>
                    <div className={classes.root}>
                        <AppBar
                            className={classNames(classes.appBar)}>
                            <Toolbar
                                className={classNames(classes.menuButton)}>
                                <Link to="/"><img src="https://material-ui.com/static/images/material-ui-logo.svg"
                                                  alt='Material UI'
                                                  /></Link>
                                <Typography variant="title" color="inherit" className={classes.title}>
                                    <Link to="/">Sync Demo</Link>
                                </Typography>
                                <Hidden xsDown>
                                    <Typography color="inherit">
                                        Sync: {writeClient.connected ? 'connected' : 'disconnected'}
                                    </Typography>
                                    <div className={classes.statusWrapper}>

                                        {writeClient.connected ? <CheckIcon/> : <Warning/>}

                                        {!writeClient.connected &&
                                        <CircularProgress size={38} className={classes.fabProgress}/>}
                                    </div>
                                </Hidden>
                            </Toolbar>
                        </AppBar>
                        <main className={classes.content}>
                            {writeClient.connected ?
                                <Routes syncClient={writeClient} user={'aWriteUser'} />
                                :
                                <Grid container alignItems="center" justify="center" direction={'column'}>
                                    <Grid item>
                                        <Typography variant={'headline'}>Connecting to services.</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Progress/>
                                    </Grid>
                                    <Hidden xsUp={!this.state.reconnect}>
                                        <Grid item>
                                            <Typography variant={'body2'} align={'center'}>We are having trouble
                                                connecting to
                                                services...</Typography>
                                            <Typography variant={'caption'} align={'center'}>Attempting to reconnect
                                                in... {this.reconnectTimer} seconds </Typography>
                                        </Grid>
                                    </Hidden>

                                </Grid>
                            }
                        </main>
                    </div>
                </MuiThemeProvider>
            </Router>
        );
    }
}

DefaultRouter.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    writeClient: PropTypes.object.isRequired,
    recoverServices: PropTypes.func.isRequired
};

export default withRouter(withStyles(styles)(DefaultRouter));
