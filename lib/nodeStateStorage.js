/** @fileOverview
	Provides a MongoDB persistence layer for state.
*/

var mongoose = require('mongoose');
var config = require('./config.js');
var mapper = require('./uriToNodeTypeMapper.js');

var db = mongoose.createConnection(config.dbHost, config.dbName);

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


function _getModel(type) {
	return db.model(type, _getSchema(type));
}

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
		_getModel(type).update({uri: obj.uri}, {$set: obj}, {upsert: true}, function(err) {
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
		_getModel(type).findOne({uri: uri}, callback);
	},
	
	/**
		Gets the count of a given type
		@param {string} type The type to count
		@param {Object} conditions The search conditions example object
		@param {Function(err,count)} callback The callback function is passed 2 arguments:
			err <tt>{string}</tt> error if any, count <tt>{Number}</tt> the count
	*/
	count: function(type, conditions, callback) {
		_getModel(type).count(conditions, callback);
	},
	
	/**
		Loads state from the database
		@param {string} type The type to count
		@param {Object} conditions The search conditions example object
		@param {Function(err,objs)} callback The callback function is passed 2 arguments:
			err <tt>{string}</tt> error if any, objs <tt>[{Object}]</tt> objects from database
	*/
	loadAll: function(type, conditions, callback) {
		_getModel(type).find(conditions, callback);
	}
};
