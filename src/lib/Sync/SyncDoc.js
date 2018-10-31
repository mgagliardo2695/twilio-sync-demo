import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';

class SyncDoc extends React.Component {

    constructor (props) {

        super(props);
        this.state = {
            docData: {}
        };

        this.docData = {};
        this.readClient = false;
        // ensure we have an identity token
        if (typeof props.user === 'undefined')
            throw new Error('Must pass user to SyncDoc');

        // validate
        if (typeof props.name !== 'undefined') {
            this.doc_name = props.name;
        }
    }

    readOnly = (docName) => {
        this.doc_name = docName;
        this.readClient = true;
        // open doc
        // Open a Document by unique name and update its value
        console.log('Opening ' + docName + ' in read only');
        this.props.readClient.client.document(this.doc_name)
            .then(this.bindDoc.bind(this))
            .catch(this.errorHandler);

    };

    open = (docName) => {
        this.doc_name = docName;
        this.readClient = false;
        // open doc
        // Open a Document by unique name and update its value
        this.props.syncClient.client.document(this.doc_name)
            .then(this.bindDoc.bind(this))
            .catch(this.errorHandler);
    };

    create = (docName) => {
        this.doc_name = docName;
        // open doc
        // Open a Document by unique name and update its value
        this.props.syncClient.client.document(this.doc_name)
            .then(this.bindDoc.bind(this))
            .catch(this.errorHandler);
    };

    /* save to sync */
    save = () => {
        if (this.document && !this.readClient) {
            let serialized = this.serialize();
            let size = JSON.stringify(serialized).length;

            this.setState({ size: size });

            console.log('Serialized document to save, size: ' + size + ' characters');

            // add user & timestamps

            // init - but don't get from this.state afterward b/c it may not be updated yet!
            this.docData.creator = this.props.user;
            this.docData.dateCreated = Date.now();

            // and set serialized
            serialized.creator = this.docData.creator;
            serialized.dateCreated = this.docData.dateCreated;

            // last edit meta data
            this.docData.lastEditBy = this.props.user;
            this.docData.dateUpdated = Date.now();
            serialized.lastEditBy = this.docData.lastEditBy;
            serialized.dateUpdated = this.docData.dateUpdated;

            // sync changes back to sync doc
            // serialize
            this.document.set(serialized)
                .then(this.handleSave)
                .catch(this.errorHandler);
        }

    };

    removeDoc = (document, directory) => {
        this.props.syncClient.client.document(document)
            .then((doc) => {
                doc.removeDocument(document)
                    .then(() => {
                        console.log(`Document removed ${document} successfully`);
                    })
                    .catch(this.errorHandler);
            })
            .catch(this.errorHandler);

    };

    /* Wraps setState to keep a history and to optionally sync to Twilio Sync */
    updateDoc = (newState) => {
        this.updating = true;
        console.log(newState);
        // set state to say we're making unsaved changes
        let data = Object.assign(this.state.docData, newState);
        this.setState({
            changesSaved: false,
            docData: data
        });

        this.docData = data;
        this.save();
        this.updating = false;

    };

    setSyncRealtime = (event) => {
        // if turning on autosync and there are unsaved changes, then save them
        if (event.target.checked && !this.props.changesSaved)
            this.save();

        this.props.setSyncRealtime(event.target.checked);
    };

    /* serialize state: override to selectively decide what to sync! */
    serialize () {
        const newState = Object.assign(this.docData);
        this.docData = {};
        return newState;
    }

    handleSave = () => {
        console.log('Changes synced! Updating local state');
        this.setState({
            docData: this.docData,
            changesSaved: true,
            version: parseInt(this.document.descriptor.revision, 16)
        });
    };

    errorHandler = (e) => {

        if (e.code === 54100) {
            console.log(this.doc_name);
        }
        if (e.code === 54007) {
            console.log('Opening ' + this.doc_name + ' in read only');
            this.props.readClient.client.document(this.doc_name)
                .then(this.bindDoc.bind(this))
                .catch((r) => {
                    console.error(r);
                });

        } else {
            console.log(e);
        }

    };

    handleUpdate (doc) {

        console.log('=============================================');
        console.log('Handling sync update...');

        if (doc.isLocal) {
            console.log('Doc updated locally... skipping update');
        } else {

            // apply remote update
            console.log('Doc updated externally... updating');

            // if all changes are saved, then just

            const newDoc = Object.assign(doc.value);
            const currentDoc = Object.assign(this.state.docData);
            delete currentDoc.dateUpdated;
            delete newDoc.dateUpdated;

            if (this.state.changesSaved || !_.isEqual(newDoc, currentDoc)) {
                this.setState({
                    docData: doc.value,
                    changesSaved: true,
                    version: parseInt(this.document.descriptor.revision, 16)
                });
            }

        }

        console.log('=============================================');
    }

    bindDoc (document) {

        // save a handle to the document
        this.document = document;
        // Listen to updates on the Document
        document.on('updated', this.handleUpdate.bind(this));

        // if value empty
        if (document.value) {

            console.log('=============================================');
            console.log('initialized document from sync doc:');
            console.log('=============================================');
            // set status

            this.setState({
                docData: document.value,
                changesSaved: true,
                version: parseInt(this.document.descriptor.revision, 16)
            });

        } else {
            console.log('Sync doc was empty... setting state to template');
        }

    }

    isReadOnly = () => {
        return this.readClient;
    };

    render () {

        const childWithProp = React.Children.map(this.props.children, (child) => {
            return React.cloneElement(child, {
                save: this.save,
                open: this.open,
                readOnly: this.readOnly,
                redo: this.redo,
                undo: this.undo,
                isReadOnly: this.isReadOnly,
                updateDoc: this.updateDoc,
                removeDoc: this.removeDoc,
                document: this.state.docData
            });
        });

        return <div>{childWithProp}</div>;
    }

}

SyncDoc.propTypes = {
    children: PropTypes.object.isRequired
};

export default withRouter(SyncDoc);
