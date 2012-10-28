/** @fileOverview
	Contains configuration values that you'll potentially want to adjust.
*/


/**
	@namespace
*/
module.exports = {
	// Database configuration
	/**
		@member {string} 
	*/
	dbHost: 'localhost',
	/**
		The database name
		@type {string}
	*/
	dbName: 'test',
	
	// Messaging configuration
	/**
		The amqp host
		@type {string}
	*/
	amqpHost: '127.0.0.1',
	/**
		The amqp exchange name for outgoing messages
		@type {string}
	*/
	amqpExchangeName: 'netfoundry',
	/**
		The amqp exchange options. 
		See <a href="https://github.com/postwait/node-amqp/blob/master/README.md">node-amqp readme</a>.
		@type {Object}
	*/
	amqpExchangeOpts: {type: 'fanout', durable: true, internal: false, autodelete: false},
	/**
		The amqp queue options
		See <a href="https://github.com/postwait/node-amqp/blob/master/README.md">node-amqp readme</a>.
		@type {Object}
	*/
	amqpQueueOpts: {durable: true},
	/**
		The amqp queue subscribe options
		See <a href="https://github.com/postwait/node-amqp/blob/master/README.md">node-amqp readme</a>.
		@type {Object}
	*/
	amqpQueueSubscribeOpts: { ack: true, prefetchCount: 1 },
	
	/** 
		Collection of state change processors keyed to node type
		@type {Object}
	*/
	stateChangeProcessors: {
		'default': './nodeStateChangeProcessorDefault.js',
		/* 'my-node-type': 'my/node/type/state/change/processor.js' */
	},
	/** 
		Default state change processor used for node types not present in {stateChangeProcessors} collection
		@type {string}
	*/
	defaultStateChangeProcessor: 'default',
	
	/** 
		Collection of link add processors keyed to node type
		@type {Object}
	*/
	linkAddProcessors: {
		'default': './nodeLinkAddProcessorDefault.js',
		/* 'my-node-type': 'my/node/type/link/add/processor.js' */
	},
	/** 
		Default link add processor used for node types not present in {linkAddProcessors} collection
		@type {string}
	*/
	defaultLinkAddProcessor: 'default'
}

