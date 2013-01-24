/** @fileOverview
	Sets up a messaging receiver for a given node type. It will
	listen to an input queue and pass any messages received to the 
	nodeMessageReceiveProcessor module.
*/

module.exports = NodeMessageReceiver;

var events = require('events');
var util = require('util');
var NodeState = require('./nodeState.js');
var amqpMgr = require('./amqpManager.js');
var processor = require("./nodeMessageReceiveProcessor.js");

util.inherits(NodeMessageReceiver, events.EventEmitter);

/**
	Represents a message receiver and processor for a given node type
	@constructor
	@param {string} nodeType The type of node whose messages will be received by this receiver
*/
function NodeMessageReceiver(nodeType) {
	var _self = this;
	var _nodeType = nodeType;
	var _tag = null;
	
	/**
		Starts the receiver and emits the "ready" event when done
	*/
	this.start = function() {
		amqpMgr.subscribe(_nodeType, _subsCallback, _msgCallback);
		
		function _subsCallback(tag) {
			_tag = tag;
			_self.emit('ready');
		}
		
		function _msgCallback(msg, headers, deliveryInfo) {
			NodeState.load(msg.toUri, function(err, node) {
				if (err) throw err;

				processor.process(node, msg, function(err) {
					if (err) throw err;
					amqpMgr.queueShift(_nodeType);
				});
			});
		}
	},
	
	/**
		Stops the receiver and emits the "stopped" event when done
	*/
	this.stop = function() {
		amqpMgr.unsubscribe(_nodeType, _tag, function() {
			_self.emit('stopped');
		});
	}
}
