import React from 'react';

const Namespaces = ({namespaces}) => (
    namespaces.map((namespace) =>
    <div>  
        <input id={namespace.metadata.name} type="checkbox" onClick=""/>
        <label>{namespace.metadata.name}</label>
    </div>
    )
);

export default Namespaces;