/** @fileOverview
	Provides the main entry point for consumers of netfoundry
*/

/**
	The netfoundry config object
	@returns {Object}
*/
var config = require('./lib/config.js');
exports.config = config;

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
exports.LinkState = require('./lib/linkState.js');

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
	Starts a message processing server for node types
	@param [{string|Array}] nodeTypes The type(s) of node(s) for which to process messages.
                                      If this parameter is omitted, then the 
									  <tt>config.processNodeTypes<tt> value is used.
	@param {Function()} callback The function to be invoked when the processor is started
*/
exports.startProcessor = function(args) {
	if (args.length == 0) return;
	
	var callback = null;
	var nodeTypes = config.processNodeTypes;
	
	for (var i=0; i<arguments.length; i++) {
	
		if (typeof(arguments[i]) == 'function') {
			callback = arguments[i];
		} 
		else if (typeof(arguments[i]) == 'string') {
			nodeTypes = [arguments[i]];
		} 
		else if (Array.isArray(arguments[i])) {
			nodeTypes = arguments[i];
		}
	}
	
	_startNextProcessor();
	
	function _startNextProcessor() {
		if (nodeTypes.length > 0) {
			var nextType = nodeTypes.pop();
			if (receivers[nextType]) {
				_stopProcessor(nextType, function() {
					_startProcessor(nextType, _startNextProcessor);
				});	
			}
			else {
				_startProcessor(nextType, _startNextProcessor);
			}
		}
		else {
			if (callback) callback();
		}
	}
};

/**
	Stops all message processing servers
	@param {Function()} callback The function to be invoked when the processors are stopped
*/
exports.stopProcessor = function(callback) {
	var nodeTypes = [];
	for (var nodeType in receivers) {
		nodeTypes.push(nodeType);
	}
	
	_stopNextProcessor();
	
	function _stopNextProcessor() {
		if (nodeTypes.length > 0) {
			var nextType = nodeTypes.pop();
			_stopProcessor(nextType, _stopNextProcessor);
		}
		else {
			if (callback) callback();
		}
	}
};

/**
	Stops all netfoundry resources
	@param {Function()} callback The function to be invoked when netfoundry is stopped
*/
exports.stop = function(callback) {
	exports.stopProcessor(function() {
		var amqpManager = require('./lib/amqpManager.js');
		amqpManager.stop();
		callback();
	});
}

