import SyncClient from 'twilio-sync';
import { AccessManager } from 'twilio-common';
import { EventEmitter } from 'fbemitter';

class SyncManager {

    constructor (user, props) {

        // init props
        props = props || {};

        // validate we have an identityToken
        this.user = user;

        // create an event emitter for async event firing
        this.emitter = new EventEmitter();

        // if onready given
        if (props.onReady) {
            this.emitter.once('ready', props.onReady);
        }

        if (props.onAccessDenied) {
            this.emitter.addListener('accessDenied', props.onAccessDenied);
        }

        if (props.onConnectionState) {
            this.emitter.addListener('connectionState', props.onConnectionState);
        }

        if (props.onError) {
            this.emitter.addListener('error', props.onError);
        }

        // init endpoint
        this.tokenEndpoint = props.endpoint ? process.env.REACT_APP_API_HOST + props.endpoint : process.env.REACT_APP_API_HOST + '/tokens';
        console.log(this.tokenEndpoint);
        // fetch access token
        this.fetchAccessToken(this.createSync.bind(this));

        this.updateAccessManager = this.updateAccessManager.bind(this);
        this.getUser = this.getUser.bind(this);

    }

    on (event, callback) {
        this.emitter.addListener(event, callback);
    }

    fetchAccessToken (callback) {

        if (!this.user) {
            console.log('[SyncManager] no user set');
            return false;
        }
        // generate a token
        console.log('[SyncManager] fetching a sync token with identity token ');
        fetch(this.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: this.user })
        })
            .then((response) => {

                // based on response status
                switch (response.status) {
                    case 200:
                        return response.json();
                    case 403:
                    case 401:
                        this.emitter.emit('accessDenied');
                        break;
                    default:
                        this.emitter.emit('error', 'Error retrieving token: ' + response.statusText);
                        throw new Error('[SyncManager] Error retrieving token: ' + response.statusText);
                }

            })
            .then((responseJson) => {
                callback(responseJson);
            })
            .catch(this.errorHandler);

    }

    errorHandler (e) {
        console.log(e.message);
    }

    createSync (responseJson) {

        console.log('[SyncManager] Received JSON response');

        // get token from response
        if (responseJson) {
            const token = responseJson.token;

            if (!token)
                throw new Error('No token found at root level of server response');

            const syncClient = new SyncClient(token);

            // connect
            syncClient.on('connectionStateChanged', this.handleConnectionState.bind(this));

            // setup token refresh (AccessManager currently not working so leaving code)
            const accessManager = new AccessManager(token);

            // Need to update the Sync Client that the accessManager has a new token
            accessManager.on('tokenUpdated', (am) => {

                console.log('[AccessManager] Token Updated');

                // and update in the sync client

                if (typeof am.token !== 'undefined') {
                    syncClient.updateToken(am.token);
                } else {
                    console.log(am);
                    this.emitter.emit('accessDenied');
                }
            });

            // Give Access Manager the new token
            accessManager.on('tokenExpired', () => {
                console.log('[AccessManager] Sync token expired, refreshing...');
            });
            accessManager.on('tokenWillExpire', () => {
                console.log('[AccessManager] Sync token will expire, refreshing...');
            });
            accessManager.on('error', () => {
                console.log('[AccessManager] Error...');
            });

            accessManager.on('tokenExpired', this.fetchAccessToken.bind(this, this.updateAccessManager.bind(this)));
            accessManager.on('tokenWillExpire', this.fetchAccessToken.bind(this, this.updateAccessManager.bind(this)));

            // save a handle
            this.syncClient = syncClient;
            this.accessManager = accessManager;

            // fire onready if there was one
            this.emitter.emit('ready', syncClient, responseJson);
        }

    }

    updateAccessManager (responseJson) {

        console.log('[AccessManager] Updating AM token');
        if (typeof responseJson !== 'undefined') {
            const token = responseJson.token;

            // update the token in the access manager
            this.accessManager.updateToken(token);
        }
    }

    getSyncClient () {
        return this.syncClient;
    }

    getUser () {
        return this.user;
    }

    setUser (user) {

        console.log('[SyncManager] Updating IDtoken');

        this.user = user;

        // refetch
        this.fetchAccessToken(this.updateAccessManager);

    }

    handleConnectionState (connectionState) {
        this.emitter.emit('connectionState', connectionState);
    }

}

export default SyncManager;

