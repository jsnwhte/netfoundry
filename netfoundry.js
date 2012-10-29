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

var receivers = {};
function _startProcessor(nodeType, callback) {
	var NodeMessageReceiver = require('./lib/nodeMessageReceiver.js');
	receiver = new NodeMessageReceiver(nodeType);
	receiver.on('ready', callback);
	receivers[nodeType] = receiver;
	receiver.start();
}
function _stopProcessor(nodeType, callback) {
	if (receivers[nodeType]) {
		var receiver = receivers[nodeType];
		receiver.on('stopped', function() {
			delete receivers[nodeType];
			callback();
		});
		receiver.stop();		
	}
	else {
		callback();
	}
}


/**
	Starts a message processing server for a given node type
	@param {string} nodeType The type of node for which to process messages
	@param {Function()} callback The function to be invoked when the processor is started
*/
exports.startProcessor = function(nodeType, callback) {
	if (receivers[nodeType]) {
		_stopProcessor(nodeType, function() {
			_startProcessor(nodeType, callback);
		});	
	}
	else {
		_startProcessor(nodeType, callback);
	}
};

/**
	Stops the message processing server for a given node type
	@param {string} nodeType The type of node processed by the processor to be stopped
	@param {Function()} callback The function to be invoked when the processor is stopped
*/
exports.stopProcessor = function(nodeType, callback) {
	_stopProcessor(nodeType, callback);
};

/**
	Stops all message processing servers
	@param {Function()} callback The function to be invoked when the processors are stopped
*/
exports.stopAllProcessors = function(callback) {
	var nodeTypes = [];
	for (var nodeType in receivers) {
		nodeTypes.push(nodeType);
	}
	
	_stopNextProcessor();
	
	function _stopNextProcessor() {
		if (nodeTypes.length > 0) {
			var nextType = nodeTypes.pop();
			_stopProcessor(nextType, function() {
				_stopNextProcessor();
			});
		}
		else {
			callback();
		}
	}
};

/**
	Stops all netfoundry resources
	@param {Function()} callback The function to be invoked when netfoundry is stopped
*/
exports.stop = function(callback) {
	exports.stopAllProcessors(function() {
		var amqpManager = require('./lib/amqpManager.js');
		amqpManager.stop();
		callback();
	});
}

