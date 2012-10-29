var NodeState = require('../../lib/nodeState.js');
var config = require('../../lib/config.js');
var amqpManager = require('../../lib/amqpManager.js');

amqpManager.initialize(function() {
  run();
});

function run() {
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
      //node1. Node1 has 'reacted' to the state change of node2.
      setTimeout(function() {
        NodeState.load(node1.uri, function(err, updatedNode1) {
          if (err) throw err;
          console.log(updatedNode1.state.value); // 'hello world'
          process.exit();
        });
      }, 1000);
    });
  }, 1000);
}
