import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid/Grid';
import Rows from '../Rows/Rows';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { arrayMove } from 'react-sortable-hoc';
import Progress from '../Progress/Progress';

const styles = theme => ({
    root: {
        flexGrow: 1
    }
});

class Home extends Component {

    constructor (props) {

        super(props);

        this.state = {
            rows: [],
            fetching: true
        };

        // bind all
        this.addRow = this.addRow.bind(this);
        this.removeRow = this.removeRow.bind(this);
        this.sortRow = this.sortRow.bind(this);
        this.editRow = this.editRow.bind(this);
        this.toggleMute = this.toggleMute.bind(this);
        this.open = this.open.bind(this);
        this.handlePreOpenCheck = this.handlePreOpenCheck.bind(this);
        this.mountSyncDoc = this.mountSyncDoc.bind(this);
        this.createSyncDoc = this.createSyncDoc.bind(this);
        this.openDocError = this.openDocError.bind(this);

    }

    componentDidMount () {
        // give doc a name
        this.doc_name = this.props.user;
        // open it
        this.open(this.doc_name);
    }

    componentWillReceiveProps (nextProps, nextContext) {
        if (!_.isEqual(nextProps.document.rows, this.state.rows) && nextProps.document.rows) {
            this.setState({ rows: nextProps.document.rows });
        }
    }

    open () {
        this.setState({ fetching: true });

        fetch(process.env.REACT_APP_API_HOST + '/sync/' + this.doc_name, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then((r) => {
                return { code: r.status, body: r.json() };
            })
            .then(this.handlePreOpenCheck)
            .catch(this.openDocError);

    };

    handlePreOpenCheck = (response) => {
        console.log(response);
        this.setState({ errorCode: response.code });
        // based on response code
        switch (response.code) {
            case 404:
                this.createSyncDoc();
                break;
            case 403:
                this.mountSyncDoc();
                break;
            case 409:
                this.props.open(this.doc_name);
                this.setState({ fetching: false });
                break;
            case 200:
                this.props.open(this.doc_name);
                this.setState({ fetching: false });
            default:
                this.props.fetched();

        }

    };

    mountSyncDoc () {
        fetch(process.env.REACT_APP_API_HOST + '/sync/' + this.doc_name + '/mount', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then((r) => {
                return r.json();
            })
            .then(() => {
                this.props.readOnly(this.doc_name);
                this.setState({ fetching: false });
            })
            .catch(this.openDocError);
    };

    createSyncDoc () {
        const doc = {
            rows: this.state.rows
        };
        fetch(process.env.REACT_APP_API_HOST + '/sync/' + this.doc_name, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(doc)
        })
            .then((r) => {
                return r.json();
            })
            .then((doc) => {
                if (typeof doc !== 'undefined') {
                    setTimeout(() => {
                        this.props.open(this.doc_name);
                        this.setState({ fetching: false });
                    }, 1500);
                } else {
                    alert('doc not created');
                }
            })
            .catch(this.openDocError);

    }

    openDocError (error) {
        console.log('[ERROR] In GoalsDoc: ' + error);
        this.setState({ error: error });
    }

    // overriding parent class to only serialize Goals related stuff
    serialize () {
        return {
            rows: this.state.rows
        };
    }

    setStateWrapper = (state) => {

        this.setState(state);
        this.props.updateDoc(state);
    };

    addRow () {
        const rows = JSON.parse(JSON.stringify(this.state.rows));
        const id = uuid();
        rows.push({ body: 'New Row', id: id, key: id, mic: false });
        this.setStateWrapper({ rows: rows });

    }

    removeRow (rowId) {
        // get the given Row
        let rows = JSON.parse(JSON.stringify(this.state.rows));
        const RowIndex = rows.findIndex((el) => {
            return el.id === rowId;
        });

        // remove it
        if (RowIndex > -1 && window.confirm('Are you sure you want to remove Row \'' + rows[RowIndex].body + '\'?')) {

            // splice it Out
            rows.splice(RowIndex, 1);
            this.setStateWrapper({ rows: rows });
        }

    }

    sortRow (params) {

        let rows = JSON.parse(JSON.stringify(this.state.rows));

        this.setStateWrapper({
            rows: arrayMove(rows, params.oldIndex, params.newIndex)
        });
    }

    editRow (rowId, params) {

        // get the given Row
        let rows = JSON.parse(JSON.stringify(this.state.rows));
        const Row = rows.find((el) => {
            return el.id === rowId;
        });

        // if found
        if (Row) {

            // change the body text
            Row.body = params.body;

            // set state
            this.setStateWrapper({ rows: rows });
        }

    }

    toggleMute (rowId) {

        // get the given Row
        let rows = JSON.parse(JSON.stringify(this.state.rows));
        const Row = rows.find((el) => {
            return el.id === rowId;
        });

        // if found
        if (Row) {

            // change the body text
            Row.mic = !Row.mic;

            // set state
            this.setStateWrapper({ rows: rows });
        }

    }

    render () {
        const { classes } = this.props;
        const rowCallbacks = {
            add: this.addRow,
            remove: this.removeRow,
            sort: this.sortRow,
            edit: this.editRow,
            toggleMute: this.toggleMute
        };
        if(this.state.fetching){
            return (<Progress/>)
        }

        return (
            <Grid
                id="home"
                className={classes.root}
                container
                alignItems="center"
                justify="center"
                direction={'column'}
                spacing={24}>
                <Rows
                    rows={this.state.rows}
                    id="row"
                    rowCallbacks={rowCallbacks}
                    mode={this.state.mode}
                    scoreCallback={this.scoreCallback}
                    viewMode={this.state.viewMode}
                />
            </Grid>);

    }
}

export default withRouter(withStyles(styles)(Home));
