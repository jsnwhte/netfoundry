netfoundry
==========

netfoundry is a node.js based platform for self-organizing collaborative object networks. Objects link to each other, share state and notify each other of state changes. All interactions are event driven and queued via RabbitMQ. Object state is persisted in MongoDB.

netfoundry is based upon the <a href="http://the-object.net/">Object Network</a> and <a href="http://forest-roa.org/">FOREST</a> projects of <a href="http://duncan-cragg.org/">Duncan Cragg</a>. 

Example
=======
This example can be found in the examples/hello-world directory.

Create a message receiver/processor module to process messages sent between nodes.
```
//Specify how we would like our "simple" nodes to react to state changes.
//In this example, we want to concatenate the state.
config.stateChangeProcessors['simple'] = {processStateChange: function(node1, fromUri) {
  NodeState.load(fromUri, function(err, node2) {
  if (err) throw err;
	node1.state.value += node2.state.value;
	node1.save();
  });
}}

//Initialize the message receiver.
amqpManager.initialize(function() {
  var receiver = new NodeMessageReceiver('simple');
  receiver.on('ready', function() {
    console.log('message receiver is ready');
  });
  receiver.start();
});
```

In another module create some nodes and link them. Then change state.
```
var node1 = new NodeState({uri: 'http://foo.com/simple/1', type: 'simple', state: {value: 'hello '}});
var node2 = new NodeState({uri: 'http://foo.com/simple/2', type: 'simple'});
node1.save();
node2.save();

//This will trigger a message from node1 to node2 requesting that the link be added.
//An acknowledgement will be sent back from node2 to node1
node1.addIncomingLink(node2.uri);

//Wait a second to let the messages acquiesce, then load the updated node2 and 
//perform a state change. This will trigger another message from node2 to node1.
setTimeout(function() {
  NodeState.load(node2.uri, function(err, linkedNode2) {
    if (err) throw err;
    linkedNode2.setState({value: 'world'});
    linkedNode2.save();

    //Wait another second to let the messages acquiesce, then load the updated
    //node1. Node1 has "reacted" to the state change of node2.
    setTimeout(function() {
      NodeState.load(node1.uri, function(err, updatedNode1) {
        if (err) throw err;
        console.log(updatedNode1.state.value); // 'hello world'
      });
    }, 1000);
  });
}, 1000);
```

