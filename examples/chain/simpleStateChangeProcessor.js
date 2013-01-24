var NodeState = require('../../lib/nodeState.js');

module.exports = {
	
	processStateChange: function(fromUri, callback) {
		var toNode = this;
		NodeState.load(fromUri, function(err, fromNode) {
			if (err) {
				if (callback) callback(err);
				return;
			}
			var uri = toNode.uri;
			var nodeNum = uri.substring(uri.length - 1);
			toNode.setState(fromNode.state + nodeNum);
			toNode.save(callback);
		});
	}
}
