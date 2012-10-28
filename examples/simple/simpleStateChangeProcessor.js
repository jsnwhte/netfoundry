var NodeState = require('../../lib/nodeState.js');

module.exports = {
	
	processStateChange: function(node, fromUri) {
		NodeState.load(fromUri, function(err, fromNode) {
			var uri = node.getUri();
			var nodeNum = uri.substring(uri.length - 1);
			node.setState(fromNode.getState() + nodeNum);
			node.save();
		});
	}
}
