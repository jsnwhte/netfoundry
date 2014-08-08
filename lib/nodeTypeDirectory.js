var mongoose = require('mongoose');
var config = require('./config.js');

var db = mongoose.createConnection(config.dbHost, config.dbName);

function _getSchema(type) {
	
	return nodeSchema;
}


function _getModel(type) {
	var schema = new mongoose.Schema({
		uri: String,
		dateAdded: Date
	});
	
	return db.model('_dir', schema);
}

function _exists(uri, callback) {
	_getModel.count({uri: uri}, function(err, count) {
		if (err) {
			callback(err, false);
		}
		else {
			var exists = (count > 0);
			callback(null, exists);
		}
	});
}


module.exports = {
	
	isLocal: function(uri) {
		return (uri.indexOf(config.baseUri) == 0);
	},

	exists: _exists,
	
	add: function(uri, callback) {
		_exists(uri, function(err, exists) {
			if (err) {
				callback(err);
			}
			else if (exists) {
				callback(null);
			}
			else {
				var obj = {uri: uri, dateAdded: new Date()};
				_getModel.update({uri: uri}, {$set: obj}, {upsert: true}, function(err) {
					if (callback) callback(err);
				});
			}
		});
	},
	
	remove: function(uri, callback) {
		_getModel.findOne({uri: uri}, function(err, obj) {
			if (err) {
				callback(err);
			}
			else {
				obj.remove();
				callback(null);
			}
		});
	}
}