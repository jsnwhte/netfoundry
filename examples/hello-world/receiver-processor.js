var amqpManager = require('../../lib/amqpManager.js');
var NodeMessageReceiver = require('../../lib/nodeMessageReceiver');
var NodeState = require('../../lib/nodeState.js');
var config = require('../../lib/config.js');

//Specify how we would like our 'simple' nodes to react to state changes.
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
