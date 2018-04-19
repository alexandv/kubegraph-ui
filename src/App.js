import React, { Component } from 'react';
import Namespaces from './Namespaces.jsx';
import Graph from './Graph.jsx';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {services: null, services_error:null ,connections: null, connections_error:null ,pods_error: null, pods: null,namespaces: null, namespaces_error: null, selected_namespaces: []};
  }

  setPodsState() {
    fetch("/apis/kubernetes/pods")
    .then(result => 
      {
        result.json().then(pods => 
          {
            this.setState({ pods: pods });
          }
        );
      }).catch(error => {
        this.setState({ pods: null, pods_error: "Failed to retrieve pods details." });
      });
  }

  setConnectionsState() {
    fetch("/apis/kubernetes/connections")
    .then(result => 
      {
        result.json().then(connections => 
          {
            this.setState({ connections: connections });
          }
        );
      }).catch(error => {
        this.setState({ connections: null, connections_error: "Failed to retrieve connections details." });
      });
  }

  setNamespacesState() {
    fetch("/apis/kubernetes/namespaces")
    .then(result => 
      {
        result.json().then(namespaces => 
          {
            this.setState({ namespaces: namespaces });
          }
        );
      }).catch(error => {
        this.setState({ namespaces: null, namespaces_error: "Failed to retrieve namespaces details." });
      });
  }

  setServicesState() {
    fetch("/apis/kubernetes/services")
    .then(result => 
      {
        result.json().then(services => 
          {
            this.setState({ services: services });
          }
        );
      }).catch(error => {
        this.setState({ services: null, services_error: "Failed to retrieve services details." });
      });
  }
  componentDidMount() {
    this.setPodsState();
    this.setNamespacesState();
    this.setConnectionsState();
    this.setServicesState();
  }

  render() {
    const pods = this.state.pods;
    const namespaces = this.state.namespaces;
    const selected_namespaces = this.state.selected_namespaces;
    const connections = this.state.connections;
    const services = this.state.services;

    return (
      <div>
        {namespaces && <Namespaces namespaces={namespaces.items}/>}
        {pods && <Graph pods={pods} selected_namespaces={selected_namespaces} connections={connections} services={services}/>}
      </div>
    );
  }
}

export default App;