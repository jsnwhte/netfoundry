var NodeState = require('../../lib/nodeState.js');

module.exports = {
	
	processStateChange: function(node, fromUri) {
		NodeState.load(fromUri, function(err, fromNode) {
			var uri = node.uri;
			var nodeNum = uri.substring(uri.length - 1);
			node.setState(fromNode.state + nodeNum);
			node.save();
		});
	}
}
