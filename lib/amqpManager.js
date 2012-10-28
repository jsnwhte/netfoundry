var amqp = require("amqp");
var config = require("./config.js");
var conn = null;
var exch = null;
var queues = {};
	
module.exports = {
	initialize: function(callback) {
		conn = amqp.createConnection({host: config.amqpHost});
		conn.on("ready", function() {
			conn.exchange(config.amqpExchangeName, config.amqpExchangeOpts, function(exchange) {
				exch = exchange;
				callback();
			});
		});
	},
	
	publish: function(key, msg) {
		exch.publish(key, msg);		
	},
	
	subscribe: function(key, subsCallback, msgCallback) {  //msgcallback args: msg, header, deliveryInfo
		if (!queues[key]) {
			conn.queue(key, config.amqpQueueOpts, function(queue) {
				queue.on("queueBindOk", function() {
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
	
	queueShift: function(key) {
		if (queues[key]) {
			queues[key].queue.shift();
		}
	},
	
	stop: function() {
		for (var key in queues) {
			var queueItem = queues[key];
			var tag = queueItem.tags.pop();
			while (typeof(tag) != "undefined") {
				queueItem.queue.unsubscribe(tag);
				tag = queueItem.tags.pop();
			}
		}
		
		if (conn) {
			conn.end();
		}
	}
}