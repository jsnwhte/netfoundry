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
		@param {Function(err)} [callback] Callback function is passed 1 argument:
										  err <tt>{string}</tt>
	*/
	process: function(node, msg, callback) {
		switch(msg.topic) {
			case constants.URI_NOTIF_STATE_CHANGE:
				node.receiveStateChangeNotification(msg.fromUri, callback);
				break;
			
			case constants.URI_NOTIF_LINK_REQUEST:
				node.receiveLinkAddRequest(msg.fromUri, msg.linkDirection, msg.linkType, callback);
				break;
			
			case constants.URI_NOTIF_LINK_REQUEST_ACK:
				node.receiveLinkAddAck(msg.fromUri, msg.linkDirection, msg.ack, callback);
				break;
			
			case constants.URI_NOTIF_LINK_REMOVE:
				node.receiveLinkRemoveNotification(msg.fromUri, msg.linkDirection, callback);
				break;
			
			case constants.URI_NOTIF_MOCK:
				if (callback) callback(null);
				break;
			
			default:
				throw 'unknown message topic: ' + msg.topic;
		}
	}
	
}
