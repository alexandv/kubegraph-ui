import { Component } from 'react';
import ReactHTMLParser from 'react-html-parser';
import Viz from 'viz.js';

class Graph extends Component {
    findConnections(podName,namespace,connections) {
        for(let connection of connections) {
            if(connection.PodName === podName && connection.Namespace === namespace)
                return connection;
        }
        return null;
    }

    findPodByIP(pods,dstIP) {
        for(let pod of pods) {
            if(pod.status.podIP === dstIP)
                return pod;
        }
        return null;
    }

    isPodListening(conn,port) {
        for(let connection of conn.Connections) {
            if ((connection.SrcPort === port) && (connection.Status === "listening"))
                return true;
        }

        return false;
    }

    // Generate the graph in DOT format based on pods state value
    buildGraph(pods,selected_namespaces,connections,services) {
        if (pods === null) {
        return null;
        }

        // Init graph with default shape for nodes
        let graph = "digraph kube {\nnode[shape=rectangle,style=rounded];\n";
        let subGraphs = {};
        // store pod by nodename and filter by namespace
        pods.items.forEach((pod) => {
        if(subGraphs[pod.spec.nodeName] === undefined)
            subGraphs[pod.spec.nodeName] = [];
        console.log(selected_namespaces);
        if((selected_namespaces.length === 0) || (selected_namespaces.includes(pod.metadata.namespace)))
            subGraphs[pod.spec.nodeName].push(pod);
        });

        for(let subGraphName in subGraphs) {
        graph += 'subgraph "cluster_'+subGraphName+'"{\nstyle=dashed;\ncolor=lightblue;\n';
        graph += 'label="' + subGraphName + '"';

        let orientationLinks = "";
        let connectionsLinksString = "";

        for(let i = 0;i<subGraphs[subGraphName].length; ++i) {
            const pod = subGraphs[subGraphName][i]
            let containerNames = ""
            for(let container of pod.spec.containers)
                containerNames += '<tr><td border="1">'+container.name+'</td></tr>\n';
            
            let connectionsString = "";
            if(connections !== null) {
                let conn = this.findConnections(pod.metadata.name,pod.metadata.namespace,connections)
                if (conn !== null) {
                    let ports = {};
                    for(let connection of conn.Connections) {
                        if(connection.Status === "listening") {
                            const portName = pod.metadata.namespace + pod.metadata.name + connection.Protocol + connection.SrcPort;
                            if(connection.IPVersion == 4)
                                connectionsString += '<tr><td border="1" port="'+ portName + '">'+connection.Protocol + ":" + connection.SrcPort + '</td></tr>\n';
                            else
                                connectionsString += '<tr><td border="1" port="'+ portName + '">'+connection.Protocol + connection.IPVersion + ":" + connection.SrcPort + '</td></tr>\n';
                        }
                        else {
                            // TODO: Check that the pod is really listening on this port and protocol
                            const targetPod = this.findPodByIP(pods.items,connection.DstIP);
                            if((!this.isPodListening(conn,connection.SrcPort)) && (targetPod !== null)) {
                                const portName = targetPod.metadata.namespace + targetPod.metadata.name + connection.Protocol + connection.DstPort
                                if (!(portName in ports)) {
                                    ports[portName] = "";
                                    connectionsLinksString += '"' + pod.metadata.name + '":pod -> "' + targetPod.metadata.name + '":"' + portName + '";\n';
                                }
                            }
                        }
                    }
                }
            }
            graph = graph + '"' + pod.metadata.name + '"' + '[shape=none,label=<<table border="0" cellspacing="0">' +
            '<tr><td border="1" port="pod" bgcolor="lightblue">' + pod.metadata.name +'</td></tr>\n' + containerNames + connectionsString +
            '</table>>];\n';

            // Need to add invisible link for proper orientation
            if (i>0) {
                orientationLinks += '"' + subGraphs[subGraphName][i-1].metadata.name + '" -> "' + pod.metadata.name + '" [style=invisible dir=none];\n';
            }
        }

        graph += "}\n" + orientationLinks + connectionsLinksString;
        }
        graph += "}";
        console.log(graph)

        return graph;
    }

    render() {
        const graph = this.buildGraph(this.props.pods,this.props.selected_namespaces,this.props.connections);
    
        return ReactHTMLParser(Viz(graph, { format: "svg"}));
    }
}

export default Graph;