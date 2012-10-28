/** @fileOverview
	Formats a message that can be sent to another node.
*/

/** @namespace */
module.exports = {
	/** 
		Formats a message that can be sent to another node
		@param {NodeState} node The node publishing the message
		@param {string} topic The topic URI
		@param {string} toUri The URI of the node to receive the message
		@param {string} toType the node type of the node to receive the message
		@param {Object} [additionalProps] Additional message properties
	*/
	format: function(node, topic, toUri, toType, additionalProps) {
		
		var msg = {
			topic: topic,
			fromUri: node.uri,
			fromType: node.type,
			toUri: toUri,
			toType: toType
		};
		
		if (typeof(additionalProps) == 'object') {
			for (var prop in additionalProps) {	
				msg[prop] = additionalProps[prop];
			}
		}
		
		return msg;
	}
}
