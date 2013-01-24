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
	/**
		Collection of node state schemas keyed to node type. Schemas are defined according
		to <a href="http://mongoosejs.com/docs/guide.html">Mongoose documentation</a>.
		@type {Object}
	*/
	dbStateSchemas: {
		'default': {},
		/*
		'my-node-type-x': {'name':String, 'email':String}
		*/
	},
	/** 
		The default node state schema used for node types not present
		in the {dbStateSchemas} collection.
		@type {string}
	*/
	dbDefaultStateSchema: 'default',
	
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
		Collection of state change processors keyed to node type. Collection items may be either a 
		require string, a <tt>{Function(fromUri, callback)}</tt>, or an <tt>Object</tt> with a 
		<tt>processStateChange</tt> function member. The callback parameter takes 1 argument which
		is an error string.
		@type {Object}
	*/
	stateChangeProcessors: {
		'default': './nodeStateChangeProcessorDefault.js',
		/* 
		'my-node-type-x': 'my/node/type-x/state/change/processor.js',
		'my-node-type-y': function(fromUri, callback) { ... },
		'my-node-type-z': {processStateChange: function(fromUri, callback) { ... }}
		*/
	},
	/** 
		Default state change processor used for node types not present in 
		{stateChangeProcessors} collection. 
		@type {string}
	*/
	defaultStateChangeProcessor: 'default',
	
	/** 
		Collection of link add processors keyed to node type. Collection items may be either a 
		require string, a <tt>{Function(linkUri, direction, callback)}</tt>, or an <tt>Object</tt> with a
		<tt>processLinkAdd</tt> function member.
		@type {Object}
	*/
	linkAddProcessors: {
		'default': './nodeLinkAddProcessorDefault.js',
		/* 
		'my-node-type-x': 'my/node/type-x/link/add/processor.js',
		'my-node-type-y': function(linkUri, direction, callback) { ... },
		'my-node-type-z': {processLinkAdd: function(linkUri, direction, callback) { ... }}
		*/
	},
	/** 
		Default link add processor used for node types not present in {linkAddProcessors} collection
		@type {string}
	*/
	defaultLinkAddProcessor: 'default'
}

