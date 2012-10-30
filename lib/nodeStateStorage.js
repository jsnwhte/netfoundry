/** @fileOverview
	Provides a MongoDB persistence layer for state.
*/

var mongoose = require('mongoose');
var config = require('./config.js');
var mapper = require('./uriToNodeTypeMapper.js');

function _getSchema(type) {
	var stateSchema = config.dbStateSchemas[type];
	if (!stateSchema) {
		stateSchema = config.dbStateSchemas[config.dbDefaultStateSchema];
	}

	var nodeSchema = new mongoose.Schema({
		uri: String,
		type: String,
		state: stateSchema,
		outgoingLinks: [],
		incomingLinks: [],
		pendingLinks: [],
		createdDate: Date,
		modifiedDate: Date
	});
	
	return nodeSchema;
}

var db = mongoose.createConnection(config.dbHost, config.dbName);

/** @namespace */
module.exports = {
	/**
		Saves the state to the database
		@param {string} uri The URI of the state
		@param {Object} obj The state to be saved
		@param {Function(err)} [callback] The callback function is passed 1 argument:
			err <tt>{string}</tt>
	*/
	save: function(uri, obj, callback) {
		var type = mapper.getNodeType(uri);
		var StoreNode = db.model(type, _getSchema(type));

		StoreNode.update({uri: obj.uri}, {$set: obj}, {upsert: true}, function(err) {
			if (callback) callback(err);
		});
	},
	
	/**
		Loads state from the database
		@param {string} uri The URI of the state to load
		@param {Function(err,obj)} callback The callback function is passed 2 arguments:
			err <tt>{string}</tt> error if any, obj <tt>{Object}</tt> object from database
	*/
	load: function(uri, callback) {
		var type = mapper.getNodeType(uri);
		var StoreNode = db.model(type, _getSchema(type));
		StoreNode.findOne({uri: uri}, callback);
	}
};
