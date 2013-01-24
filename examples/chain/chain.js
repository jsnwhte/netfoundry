var netfoundry = require('../../netfoundry.js');
var async = require('async');

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

	netfoundry.NodeState.count('simple', function(err, count) {
		console.log('There are %d "simple" nodes', count);
	});

	//create some links, chaining nodes together
	var tasks = [];
	for (var i=0; i < 9; i++) {
		var linkState = new netfoundry.LinkState({linkUri: nodes[i+1].uri, type: 'simple_link'});
		var node = nodes[i];
		tasks.push(createLinkFunction(node, linkState));
	}
	
	function createLinkFunction(node, linkState) {
		return function(callback) {
			node.addIncomingLink(linkState, callback);
		};
	}

	async.parallel(tasks, function(err, results) {
		if (err) throw err;
		
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
	});
}

function getUri(i) {
	return 'http://foo.com/simple/' + i.toString();
}
