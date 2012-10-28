/** 
	@fileOverview
	Provides a layer of indirection between nodes and the messaging system
*/

var amqpMgr = require('./amqpManager.js');

/** @namespace */
module.exports = {
	/**
		Publishes the given message under the given routing key
		@param {string} key Routing key
		@param {Object} msg Message
	*/
	publish: function(key, msg) {
		amqpMgr.publish(key, msg);		
	}
}

