netfoundry
==========

netfoundry is a node.js based platform for self-organizing collaborative object networks. Objects link to each other, share state and notify each other of state changes. All interactions are event driven and queued via RabbitMQ. Object state is persisted in MongoDB.

netfoundry is based upon ideas from the <a href="http://the-object.net/">Object Network</a> and <a href="http://forest-roa.org/">FOREST</a> projects of <a href="http://duncan-cragg.org/">Duncan Cragg</a>. 

Dependencies
============
Install the following packages to get the examples running:
* amqp
* mongoose

You will also obviously have to install the underlying software systems those packages require: MongoDB and RabbitMQ (or some amqp compliant messaging system, but so far I've only tried RabbitMQ).

Example
=======
This example can be found in the examples/hello-world directory.

Create a message receiver/processor module to process messages sent between nodes.
```
var netfoundry = require('netfoundry');

//Specify how we would like our 'simple' nodes to react to state changes.
//In this example, we want to concatenate the state.
netfoundry.config.stateChangeProcessors['simple'] = function(fromUri) {
  var node1 = this;
  netfoundry.NodeState.load(fromUri, function(err, node2) {
    if (err) throw err;
    node1.state.value += node2.state.value;
    node1.save();
  });
}

//Initialize netfoundry
netfoundry.initialize(run);

//Run the message processor
function run() {
  netfoundry.startProcessor('simple', function() {
    console.log('message processor is ready');
  });
}
```

In another module create some nodes and link them. Then change state.
```
var netfoundry = require('netfoundry');

//Initialize netfoundry
netfoundry.initialize(run);

function run() {
  //create some nodes
  var node1 = new netfoundry.NodeState({uri: 'http://foo.com/simple/1', type: 'simple', state: {value: 'hello '}});
  var node2 = new netfoundry.NodeState({uri: 'http://foo.com/simple/2', type: 'simple'});
  node1.save();
  node2.save();

  //Link the nodes
  //This will trigger a message from node1 to node2 requesting that the link be added.
  //An acknowledgement will be sent back from node2 to node1
  node1.addIncomingLink(node2.uri);

  //Wait a second to let the messages acquiesce, then load the updated node2 and 
  //perform a state change. This will trigger another message from node2 to node1.
  setTimeout(function() {
    netfoundry.NodeState.load(node2.uri, function(err, linkedNode2) {
      if (err) throw err;
      linkedNode2.setState({value: 'world'});
      linkedNode2.save();

      //Wait another second to let the messages acquiesce, then load the updated
      //node1. Node1 has 'reacted' to the state change of node2.
      setTimeout(function() {
        netfoundry.NodeState.load(node1.uri, function(err, updatedNode1) {
          if (err) throw err;
          console.log(updatedNode1.state.value); // 'hello world'
          process.exit();
        });
      }, 1000);
    });
  }, 1000);
}
```

