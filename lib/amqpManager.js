/** @fileOverview
	Encapsulates amqp functions needed by the system
*/

var amqp = require('amqp');
var config = require('./config.js');
var conn = null;
var exch = null;
var queues = {};
	
/** @namespace */
	
module.exports = {
	/**
		Initializes amqp
		@param {Function()} callback The callback function is called when amqp is ready
	*/
	initialize: function(callback) {
		conn = amqp.createConnection({host: config.amqpHost});
		conn.on('ready', function() {
			console.log('amqp connection ready');
			conn.exchange(config.amqpExchangeName, config.amqpExchangeOpts, function(exchange) {
				exch = exchange;
				callback();
			});
		});
	},
	
	/**
		Publishes a message to an exchange with a given routing key
		@param {string} key The routing key
		@param {Object} msg The message
	*/
	publish: function(key, msg) {
		exch.publish(key, msg);		
	},
	
	/**
		Subscribes to the queue for a given routing key
		@param {string} key The routing key
		@param {Function(tag)} subsCallback The callback function for successful
			subscription. Arguments: tag <tt>{string}</tt>
		@param {Function(msg, header, deliveryInfo)} msgCallback The callback function for
			message delivery. Arguments: msg <tt>{Object}</tt>, header <tt>{Object}</tt>, 
			deliveryInfo <tt>{Object}</tt>
	*/
	subscribe: function(key, subsCallback, msgCallback) {  //msgcallback args: msg, header, deliveryInfo
		if (!queues[key]) {
			conn.queue(key, config.amqpQueueOpts, function(queue) {
				queue.on('queueBindOk', function() {
					queues[key] = {queue: queue, tags: []};
					_subscribe(queues[key], subsCallback, msgCallback);
				});
				queue.bind(exch, key);				
			});
		}
		else {
			_subscribe(queues[key], subsCallback, msgCallback);
		}
		
		function _subscribe(queueItem, subsCallback, msgCallback) {
			queueItem.queue.subscribe(config.amqpQueueSubscribeOpts, msgCallback) 
			.addCallback(function(ok) {
				queueItem.tags.push(ok.consumerTag);
				subsCallback(ok.consumerTag);
			});
		}
	},
	
	/**
		Unsubscribes from the queue for a given routing key
		@param {string} key The routing key
		@param {string} tag The tag provided from the {subscribe} function callback
		@param {Function()} callback The callback function called after successful unsubscription
	*/
	unsubscribe: function(key, tag, callback) {
		if (queues[key]) {
			queues[key].queue.unsubscribe(tag).addCallback(function(ok) {
				callback();
			});
		}
		else {
			callback();
		}
	},

	/**
		Shifts the queue for the given routing key, to be called after successfully processing 
		a message
		@param {string} key The routing key
	*/	
	queueShift: function(key) {
		if (queues[key]) {
			queues[key].queue.shift();
		}
	},
	
	/**
		Stops amqp
	*/
	stop: function() {
		for (var key in queues) {
			var queueItem = queues[key];
			var tag = queueItem.tags.pop();
			while (typeof(tag) != 'undefined') {
				queueItem.queue.unsubscribe(tag);
				tag = queueItem.tags.pop();
			}
		}
		
		if (conn) {
			conn.end();
		}
	}
}
