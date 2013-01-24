var netfoundry = require('../../netfoundry.js');
var util = require('util');

//Specify how we would like our 'simple' nodes to react to state changes.
//In this example, we want to concatenate the state.
netfoundry.config.stateChangeProcessors['simple'] = function(fromUri, callback) {
  var node1 = this;
  netfoundry.NodeState.load(fromUri, function(err, node2) {
    if (err) {
		callback(err);
		return;
	}
    node1.state.value += node2.state.value;
    node1.save(callback);
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
