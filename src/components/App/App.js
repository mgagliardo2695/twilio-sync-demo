import React, {Component} from 'react';
import DefaultRouter from '../../components/Routes/DefaultRouter';
import SyncManager from '../../lib/Sync/SyncManager';
import {withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';

const READ_USER = {user: 'READY_ONLY'};

class App extends Component {

    constructor(props) {

        super(props);

        this.state = {
            loading: true,
            readClient: {client: {}, connected: false},
            writeClient: {client: {}, connected: false}
        };

        this.readUser = {
            token: ''
        };

        this.writeUser = {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IndyaXRlVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.M0B0VqS7QazMh6ievMrxKukMp0Pn8q8bKGLCWiBFno8'
        };

        this.handleLogout = this.handleLogout.bind(this);
        this.handleConnectionState = this.handleConnectionState.bind(this);
        this.installSync = this.installSync.bind(this);

    }

    componentDidMount() {
        this.loadSync();
    }

    errorHandler = (e) => {
        console.log(e);
    };

    installSync = (sync, client) => {
        let state = {};
        state[client] = {};
        state[client].client = sync;
        state[client].connected = this.state[client].connected;
        this.setState(state);
    };

    handleConnectionState = (newConnectionState, client) => {
        let state = {};
        state[client] = {};
        state[client].client = this.state[client].client;
        state[client].connected = newConnectionState === 'connected';
        this.setState(state);
    }

    loadSync = () => {

        this.initWriteManager();
        // this.initReadManager();
        this.setState({loading: false});

    };

    initWriteManager = () => {
        // give our sync manager the ID token
        if (!this.writeManager) {
            // instantiate a sync manager
            this.writeManager = new SyncManager('aWriteUser', {
                onConnectionState: (connection) => {
                    this.handleConnectionState(connection, 'writeClient');
                },
                onAccessDenied: this.errorHandler,
                onReady: (sync) => {
                    this.installSync(sync, 'writeClient')
                },
            });

        }else {

            console.log('[APP] Refreshing user in SyncManager...');

            // update token
            this.writeManager.setUser('aWriteUser');
        }
    };

    initReadManager = () => {
        // give our sync manager the ID token
        if (!this.readManager) {
            // instantiate a sync manager
            this.readManager = new SyncManager('aReadUser', {
                onConnectionState: (connection) => {
                    this.handleConnectionState(connection, 'readClient');
                },
                onAccessDenied: this.errorHandler,
                onReady: (sync) => {
                    this.installSync(sync, 'readClient')
                },
                endpoint: '/token/readonly'
            });

        }else {

            console.log('[APP] Refreshing user in SyncManager...');

            // update token
            this.readManager.setUser('aReadUser');
        }
    };

    handleLogout() {
        delete this.writeManager;
        delete this.readManager;

    }

    render() {
        return (
            <DefaultRouter
                readClient={this.state.readClient}
                writeClient={this.state.writeClient}
                recoverServices={this.loadSync}
            />
        );
    }

}

App.propTypes = {};

export default withRouter(App);
