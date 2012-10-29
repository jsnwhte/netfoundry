var NodeState = require('../../lib/nodeState.js');

module.exports = {
	
	processStateChange: function(fromUri) {
		var toNode = this;
		NodeState.load(fromUri, function(err, fromNode) {
			var uri = toNode.uri;
			var nodeNum = uri.substring(uri.length - 1);
			toNode.setState(fromNode.state + nodeNum);
			toNode.save();
		});
	}
}
