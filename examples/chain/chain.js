var netfoundry = require('../../netfoundry.js');
var util = require('util');

netfoundry.config.stateChangeProcessors['simple'] = '../examples/chain/simpleStateChangeProcessor.js';

netfoundry.initialize(setSubscriber);

function setSubscriber() {
	netfoundry.startProcessor('simple', run);
}

function run() {
	//create some nodes
	var nodes = new Array();

	for (var i=0; i < 10; i++) {
		nodes[i] = new netfoundry.NodeState({
			uri: getUri(i),
			type: 'simple'
		});
		nodes[i].save();
		
	}

	//create some links, chaining nodes together
	for (var i=0; i < 9; i++) {
		nodes[i].addIncomingLink(nodes[i+1].uri);
	}

	//trigger state change
	setTimeout(function() {
		netfoundry.NodeState.load(getUri(9), function(err,node) {	
			node.setState('hello');
			node.save(function(err) {
				setTimeout(function() {
					netfoundry.NodeState.load(getUri(0), function(err,node) {
						console.log(node.state); //'hello876543210'
						process.exit();
					});
				}, 1000);
			});
		});
	}, 1000);


}


function getUri(i) {
	return 'http://foo.com/simple/' + i.toString();
}
