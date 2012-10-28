/** @fileOverview
	Wires up node messaging event handlers to a {@link NodeState} object.
*/

var formatter = require('./nodeMessageFormatter.js');
var mapper = require('./uriToNodeTypeMapper.js');
var constants = require('./constants.js');
var publisher = require('./nodeMessagePublisher.js');

/** @namespace */
module.exports = {

	/**
		Configures the event handlers used for node message publishing
		@param {NodeState} node The node whose events are to be handled
	*/
	configure: function(node) {
		node.on('change', function() {
			var links = node.outgoingLinks;
			for (var i = 0; i < links.length; i++) {
				var type = mapper.getNodeType(links[i]);
				var msg = formatter.format(node, constants.URI_NOTIF_STATE_CHANGE, links[i], type);
				publisher.publish(msg.toType, msg);
			}
		});
		
		node.on('linkRequest', function(fromUri, toUri, linkType) {
			var type = mapper.getNodeType(toUri);
			var msg = formatter.format(node, constants.URI_NOTIF_LINK_REQUEST, toUri, type, {linkType: linkType});
			publisher.publish(msg.toType, msg);
		});

		node.on('linkRequestAck', function(toUri, linkType, ack) {
			var type = mapper.getNodeType(toUri);
			var msg = formatter.format(node, constants.URI_NOTIF_LINK_REQUEST_ACK, toUri, type, {linkType: linkType, ack: ack});
			publisher.publish(msg.toType, msg);
		});
		
		node.on('linkRemove', function(fromUri, toUri, linkType) {
			var type = mapper.getNodeType(toUri);
			var msg = formatter.format(node, constants.URI_NOTIF_LINK_REMOVE, toUri, type, {linkType: linkType});
			publisher.publish(msg.toType, msg);
		});		
	}
}
