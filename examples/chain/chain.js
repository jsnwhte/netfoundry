var config = require('../../lib/config.js');
var NodeState = require('../../lib/nodeState.js');
var amqpMgr = require('../../lib/amqpManager.js');
var NodeMessageReceiver = require('../../lib/nodeMessageReceiver.js');
var util = require('util');

config.stateChangeProcessors['simple'] = '../examples/chain/simpleStateChangeProcessor.js';

amqpMgr.initialize(function() {
	setSubscriber();
});

function setSubscriber() {
	var receiver = new NodeMessageReceiver('simple');
	receiver.on('ready', function() {
		run();
	});
	receiver.start();
}

function run() {
	//create some nodes
	var nodes = new Array();

	for (var i=0; i < 10; i++) {
		nodes[i] = new NodeState({
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
		NodeState.load(getUri(9), function(err,node) {	
			node.setState('hello');
			node.save(function(err) {
				setTimeout(function() {
					NodeState.load(getUri(0), function(err,node) {
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
