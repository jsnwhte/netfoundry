/** @fileOverview
	Defines a prototype NodeState object that represents a Node's state.
	It provides operations to handle incoming message processing and to emit events
	to enable outgoing message publication.
	@module netfoundry/nodeState 
*/
module.exports = NodeState;

var util = require('util');
var events = require('events');
var config = require('./config.js');
var constants = require('./constants.js');

util.inherits(NodeState, events.EventEmitter);

/**
	Encapsulates a network node's state
	@constructor
	@param {Object|string} [arg] Object or JSON string providing values for hydrating the instance
*/
function NodeState(arg)
{
	var _self = this;
	var _modified = false;
	var _configurator = require('./nodeMessagePublisherConfigurator.js');

	/** 
		The URI of the node 
		@type {string}
	*/
	this.uri = null;
	/** 
		The type of the node 
		@type {string}
	*/
	this.type = null;
	/** 
		The node state object. Use setState to manipulate. 
		@type {Object}
	*/
	this.state = new Object();
	/** 
		An array of outgoing link URIs. Use {@link NodeState#addOutgoingLink} and {@link NodeState#removeOutgoingLink} to manipulate. 
		@type {Array}
	*/
	this.outgoingLinks = new Array();
	/** 
		An array of outgoing link URIs. Use {@link NodeState#addIncomingLink} and {@link NodeState#removeIncomingLink} to manipulate. 
		@type {Array}
	*/
	this.incomingLinks = new Array();
	/** 
		An array of pending link URIs for which requests have been sent. 
		Use {addIncomingLink} and {removeIncomingLink} to manipulate. 
		@type {Array}
	*/
	this.pendingLinks = new Array();
	/** 
		The datetime the node was created
		@type {Date}
	*/
	this.createdDate = new Date();
	/**
		The datetime the node's state was last modified
		@type {Date}
	*/
	this.modifiedDate = new Date();
	
	var argType = typeof(arg);
	switch (argType)
	{
		case 'string':
		case 'object':
			_hydrate(arg);
			break;
		
		case 'undefined':
			break;
		
		default:
			throw 'unsupported constructor parameter type: ' + argType;
	}
	
	_configurator.configure(this);
	
	/**
		Sets the node's state and flags it as modified
		@param {Object} state The new state object
	*/
	this.setState = function(state) {
		_self.state = state;
		_self.flagAsModified();
	}
	
	/**
		Flags the node as having been modified
	*/
	this.flagAsModified = function() {
		_self.modifiedDate = new Date();
		_modified = true;
	}

	/**
		Requests an outgoing link from the current node to
		a node at the given URI
		@param {string} linkUri The URI of the node to link to
	*/
	this.addOutgoingLink = function(linkUri) {
		_addLinkRequest(linkUri, constants.OUTGOING);
	}

	/**
		Removes an outgoing link from the current node to 
		a node at the given URI and sends a notification to that node.
		@param {string} linkUri The URI of the node to which to remove the link
	*/
	this.removeOutgoingLink = function(linkUri) {
		_removeLinkRequest(linkUri, constants.OUTGOING);
	}
	
	/**
		Searches the {@link NodeState#pendingLinks} array for a pending outgoing link to
		the given URI.
		@param {string} linkUri The URI to search for
		@returns {boolean}
	*/
	this.hasPendingOutgoingLink = function(linkUri) {
		return (_self.pendingLinks.indexOf(_getPendingLinkUri(linkUri, constants.OUTGOING)) > -1);
	}

	/**
		Requests an incoming link from a node at the given URI to
		this node
		@param {string} linkUri The URI of the node to link from
	*/
	this.addIncomingLink = function(linkUri) {
		_addLinkRequest(linkUri, constants.INCOMING);
	}
	
	/**
		Removes an incoming link from a node at the given URI to 
		this node and sends a notification to the former.
		@param {string} linkUri The URI of the node from which to remove the link
	*/
	this.removeIncomingLink = function(linkUri) {
		_removeLinkRequest(linkUri, constants.INCOMING);
	}
	
	/**
		Searches the {@link NodeState#pendingLinks} array for a pending incoming link from
		the given URI.
		@param {string} linkUri The URI to search for
		@returns {boolean}
	*/
	this.hasPendingIncomingLink = function(linkUri) {
		return (_self.pendingLinks.indexOf(_getPendingLinkUri(linkUri, constants.INCOMING)) > -1);
	}
	
	/** 
		Processes a notification of a link removal received from another node
		@param {string} linkUri The URI of the other node
		@param {string} direction The direction of the link from the perspective of the other node. 
								  Can be either "incoming" or "outgoing".
	*/
	this.receiveLinkRemoveNotification = function(linkUri, direction) {
		console.log('%s received link remove notification from %linkUri', _self.uri, linkUri);
		_removeLink(linkUri, direction);
	}
	
	/**
		Processes an acknowledgement of a link request previously sent to another node
		@param {string} linkUri The URI of the other node
		@param {string} direction The link direction from the perspective of this node.
								  Can be either "incoming" or "outgoing".
		@ack {boolean} ack Indicates whether the link request was accepted by the other node
	*/
	this.receiveLinkAddAck = function(linkUri, direction, ack) {
		console.log('%s received link add ack from %s, ack=%s', _self.uri, linkUri, ack);
		if (ack) {
			_addLink(linkUri, direction);
		}
		else {
			_removeLink(linkUri, direction);
		}
	}
	
	/**
		Processes a link add request received from another node, selecting the link add processor
		by node type from {@link config#linkAddProcessors} collection
		@param {string} linkUri The URI of the node requesting the link
		@param {string} direction The direction of the link requested from the perspective of the other node.
								  Can be either "incoming" or "outgoing".
	*/
	this.receiveLinkAddRequest = function(linkUri, direction) {
		console.log('%s received link add request from %s', _self.uri, linkUri);
		switch (direction) {
			case constants.INCOMING:
			case constants.OUTGOING:
				// reverse polatity on the link because it comes in from the perspective of the requester
				var myDirection = (direction == constants.INCOMING ? constants.OUTGOING : constants.INCOMING);
				
				var processor = config.linkAddProcessors[_self.type];
				if (processor == undefined) {
					processor = config.linkAddProcessors[config.defaultLinkAddProcessor];
				}
				
				if (typeof(processor) == 'string') {
					processor = require(processor).processLinkAdd;
				}
				else if (typeof(processor) == 'object') {
					processor = processor.processLinkAdd;
				}
				
				var ack = processor.call(_self, linkUri, myDirection);
				
				if (ack) {
					_addLink(linkUri, myDirection);
				}
				
				this.emit('linkRequestAck', linkUri, direction, ack);
				
				return;
				
			default:
				this.emit('linkRequestAck', linkUri, direction, false);
				throw 'unknown link direction: ' + direction;
		}
		
		this.emit('linkRequestAck', linkUri, direction, false);
	}

	/**
		Processes a state change notification received from another node, selecting the 
		state change processor by node type from {@link config#stateChangeProcessors} collection
		@param {string} fromUri The URI of the node notifying of state change
	*/
	this.receiveStateChangeNotification = function(fromUri) {
		console.log('%s received state change notification from %s', _self.uri, fromUri);
		if (_self.incomingLinks.indexOf(fromUri) == -1) {
			throw 'no incoming link authorized for: ' + fromUri;
		}
	
		// get the state change processor for this node type and tell it to process the change
		var processor = config.stateChangeProcessors[_self.type];
		if (processor == undefined) {
			processor = config.stateChangeProcessors[config.defaultStateChangeProcessor];
		}
		
		if (typeof(processor) == 'string') {
			processor = require(processor).processStateChange;
		}
		else if (typeof(processor) == 'object') {
			processor = processor.processStateChange;
		}
		
		processor.call(_self, fromUri);
	}
	
	/**
		Persists the node in the database
		@param {Function(err)} [callback] Callback function is passed 1 argument:
		err <tt>{string}</tt>
	*/
	this.save = function(callback) {
		var db = require('./nodeStateStorage.js');
		db.save(_self.uri, JSON.parse(JSON.stringify(_self)), function(err) {

			if (err == null && _modified) {
				console.log('%s state change detected, emitting "change" event', _self.uri);
				_modified = false;
				_self.emit('change');
			}
			
			if (callback) callback(err);
		});
	}
	
	
	/*
	** Private
	*/

	function _getPendingLinkUri(linkUri, direction) {
		return linkUri + '/' + direction;
	}
	
	function _addLinkRequest(linkUri, direction) {
		var pendUri = _getPendingLinkUri(linkUri,direction);
		if (_getLinkArray(direction).indexOf(linkUri) == -1 && _self.pendingLinks.indexOf(pendUri) == -1) {
			_addLink(pendUri, constants.PENDING);
			_self.emit('linkRequest', _self.uri, linkUri, direction);
		}
	}

	function _removeLinkRequest(linkUri, direction) {
		if (_removeLink(linkUri, direction)) {
			_self.emit('linkRemove', _self.uri, linkUri, direction);
		}
	}
	
	function _getLinkArray(direction) {
		switch(direction) {
			case constants.INCOMING:
				return _self.incomingLinks;
			case constants.OUTGOING:
				return _self.outgoingLinks;
			case constants.PENDING:
				return _self.pendingLinks;
			default:
				throw 'unknown link direction: ' + direction;
		}
	}

	function _addLink(linkUri, direction) {
		switch (direction) {
			case constants.INCOMING:
			case constants.OUTGOING:
				_getLinkArray(direction).push(linkUri);
				_removeLink(_getPendingLinkUri(linkUri,direction), constants.PENDING);
				_self.save();
				break;
			
			case constants.PENDING:
				_self.pendingLinks.push(linkUri);
				_self.save();
				break;
			
			default:
				console.error('unknown link direction: %s', direction);
				break;
		}
	}
	
	function _removeLink(linkUri, direction) {
		switch (direction) {
			case constants.INCOMING:
			case constants.OUTGOING:
				var links = _getLinkArray(direction);
				var pendUri = _getPendingLinkUri(linkUri,direction);
				var i = links.indexOf(linkUri);
				if (i > -1) {
					links.splice(i,1);
					_removeLink(pendUri, constants.PENDING);
					_self.save();
					return true;
				}
				
				return _removeLink(pendUri, constants.PENDING);
			
			case constants.PENDING:
				var i = _self.pendingLinks.indexOf(linkUri);
				if (i > -1) {
					_self.pendingLinks.splice(i,1);
					_self.save();
					return true;
				}
				break;
				
			default:
				console.error('unknown link direction: %s', direction);
				break;
		}
		
		return false;
	}	
	

	function _hydrate(arg) {
		var obj = arg;
		if (typeof(arg) == 'string') {
			obj = JSON.parse(arg);
		}

		for (var prop in obj) {
			switch (prop)
			{
				case 'uri':
					_self.uri = obj.uri;
					break;
				
				case 'state':
					_self.state = obj.state;
					break;
				
				case 'outgoingLinks':
					_self.outgoingLinks = obj.outgoingLinks;
					break;
				
				case 'incomingLinks':
					_self.incomingLinks = obj.incomingLinks;
					break;
				
				case 'pendingLinks':
					_self.pendingLinks = obj.pendingLinks;
					break;

				case 'createdDate':
					_self.createdDate = obj.createdDate;
					break;
				
				case 'modifiedDate':
					_self.modifiedDate = obj.modifiedDate;
					break;
				
				case 'type':
					_self.type = obj.type;
					break;
			}
		}
	}
}

/**
	Loads the node from the database
	@param {string} uri The uri of the node to load
	@param {Function(err, node)} callback The callback function is passed 2 arguments:
	err <tt>{string}</tt>, node <tt>{{@link NodeState}}</tt>
*/
NodeState.load = function(uri, callback) {
	var db = require('./nodeStateStorage.js');
	db.load(uri, function(err, obj) {
		if (!err && obj != null) {
			var node = new NodeState(obj);
			callback(null, node);
		}
		else {
			callback(err, null);
		}
	});
}

/**
	Loads all objects of a given type
	@param {string} type The type to count
	@param {Object} [conditions] The search conditions example object
	@param {Function(err,objs)} callback The callback function is passed 2 arguments:
		err <tt>{string}</tt> error if any, objs <tt>[{Object}]</tt> the objects
*/
NodeState.loadAll = function(type, conditions, callback) {
	var db = require('./nodeStateStorage.js');
	
	if (arguments.length == 2) {
		callback = arguments[1];
		if (typeof(callback) != 'function') throw 'callback function must be provided';
		
		conditions = null;
	}
	
	var example = {type: type};
	if (conditions) {
		example.state = conditions;
	}
	
	db.loadAll(type, example, callback);
}


/**
	Gets the count of a given type
	@param {string} type The type to count
	@param {Object} [conditions] The search conditions example object
	@param {Function(err,count)} callback The callback function is passed 2 arguments:
		err <tt>{string}</tt> error if any, count <tt>{Number}</tt> the count
*/
NodeState.count = function(type, conditions, callback) {
	var db = require('./nodeStateStorage.js');
	
	if (arguments.length == 2) {
		callback = arguments[1];
		if (typeof(callback) != 'function') throw 'callback function must be provided';
		
		conditions = null;
	}
	
	var example = {type: type};
	if (conditions) {
		example.state = conditions;
	}
	
	db.count(type, example, callback);
}

