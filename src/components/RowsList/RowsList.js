import React from 'react';
import Row from '../Row/Row';
import { SortableContainer } from 'react-sortable-hoc';

const RowsList = SortableContainer((props) => {
    console.log(props);
    return (
        <ol style={{ width: '100%' }}>
            {props.items.map((item, index) => (
                <Row

                    // state
                    index={index}
                    order={index}
                    key={item.id}
                    id={item.id}
                    body={item.body}
                    mic={item.mic}
                    rowCallbacks={props.rowCallbacks}

                />
            ))}
        </ol>
    );

});

export default RowsList;
