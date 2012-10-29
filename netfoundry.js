/** @fileOverview
	Provides the main entry point for consumers of netfoundry
*/

/**
	The netfoundry config object
	@returns {Object}
*/
exports.config = require('./lib/config.js');

/**
	Initializes the netfoundry communication and storage systems
	@param {Function()} callback The function to be invoked when netfoundry is initialized
*/
exports.initialize = function(callback) {
	var amqpManager = require('./lib/amqpManager.js');
	amqpManager.initialize(callback);
};

/**
	Class that represents a network node and houses its state
*/
exports.NodeState = require('./lib/nodeState.js');

/**
	Starts a message processing server for a given node type
	@param {string} nodeType The type of node for which to process messages
	@param {Function()} callback The function to be invoked when the processor is started
*/
exports.startProcessor = function(nodeType, callback) {
	var NodeMessageReceiver = require('./lib/nodeMessageReceiver.js');
	var receiver = new NodeMessageReceiver(nodeType);
	receiver.on('ready', callback);
	receiver.start();
};
