/** @fileOverview
	Contains the main processing logic for messages received by nodes.
*/

var constants = require('./constants.js');

/** @namespace */
module.exports = {
	
	/** 
		Processes a received message
		@param {NodeState} node The node receiving the message
		@param {Object} msg The message
	*/
	process: function(node, msg) {
		switch(msg.topic) {
			case constants.URI_NOTIF_STATE_CHANGE:
				node.receiveStateChangeNotification(msg.fromUri);
				break;
			
			case constants.URI_NOTIF_LINK_REQUEST:
				node.receiveLinkAddRequest(msg.fromUri, msg.linkType);
				break;
			
			case constants.URI_NOTIF_LINK_REQUEST_ACK:
				node.receiveLinkAddAck(msg.fromUri, msg.linkType, msg.ack);
				break;
			
			case constants.URI_NOTIF_LINK_REMOVE:
				node.receiveLinkRemoveNotification(msg.fromUri, msg.linkType);
				break;
			
			case constants.URI_NOTIF_MOCK:
				// do nothing
				break;
			
			default:
				throw 'unknown message topic: ' + msg.topic;
		}
	}
	
}
