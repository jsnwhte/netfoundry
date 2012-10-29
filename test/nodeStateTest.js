var util = require('util');
var NodeState = require('../lib/nodeState.js');
var mockery = require('mockery');
var URI1 = 'http://foo.com/1';
var URI2 = 'http://foo.com/2';
var URI3 = 'http://foo.com/3';
var URI4 = 'http://foo.com/4';
var INCOMING = 'incoming';
var OUTGOING = 'outgoing';

exports.NodeStateTest = {

	setUp: function(callback) {
		mockery.warnOnUnregistered(false);
		mockery.deregisterAll();
		
		mockery.registerMock('./nodeMessagePublisher.js', {
			publish: function(key, msg) {}
		});
		mockery.registerMock('./nodeStateStorage.js', {
			save: function(uri, obj, callback) {
				callback(null);
			}
		});
		
		mockery.enable();
		callback();
	},

	testGetUri: function(test) {
		test.expect(1);
		
		var node = new NodeState({uri:URI1});
		test.equal(node.uri, URI1);
		test.done();
	},
	
	testGetSetState: function(test) {
		test.expect(1);

		
		var node = new NodeState();
		node.on('change', function() {
			test.equal(node.state,'hello');
			test.done();
		});
		node.setState('hello');
		node.save();
	},
	
	testGetType: function(test) {
		test.expect(1);
		
		var node = new NodeState({type: 'foo'});
		test.equal(node.type, 'foo');
		test.done();
	},
	
	testCreatedDate: function(test) {
		test.expect(1);
		
		var node = new NodeState();
		var created = node.createdDate;
		test.equal(created.getFullYear(), (new Date()).getFullYear());
		test.done();
	},
	
	testModifiedDate: function(test) {
		test.expect(1);
		
		var node = new NodeState();
		var modified = node.modifiedDate;
		setTimeout(function() {
			node.setState('hello');
			test.notDeepEqual(modified, node.modifiedDate);
			test.done();
		}, 100);
	},
	
	testAddOutgoingLink: function(test) {
		test.expect(6);
		
		var node = new NodeState({uri:URI1});
		node.on('linkRequest', function(fromUri, toUri, linkType) {
			test.equal(fromUri, URI1);
			test.equal(toUri, URI2);
			test.equal(linkType, OUTGOING);
			test.ok(node.hasPendingOutgoingLink(URI2));
			
			node.receiveLinkAddAck(URI2, OUTGOING, true);
			test.ok(!node.hasPendingOutgoingLink(URI2));
			test.equal(node.outgoingLinks.length, 1);

			test.done();
		});
		node.addOutgoingLink(URI2);
	},
	
	testRemoveOutgoingLink: function(test) {
		test.expect(5);
		
		var node = new NodeState({uri:URI1});
		node.addOutgoingLink(URI2);
		node.addOutgoingLink(URI3);
		node.receiveLinkAddAck(URI2, OUTGOING, true);
		test.ok(!node.hasPendingOutgoingLink(URI2));
		test.ok(node.hasPendingOutgoingLink(URI3));
		test.equal(node.outgoingLinks.length,1);
		
		node.removeOutgoingLink(URI3);
		test.ok(!node.hasPendingOutgoingLink(URI3));

		node.on('linkRemove', function(fromUri, toUri, linkType) {
			test.equal(node.outgoingLinks.length,0);

			test.done();		
		});
		
		node.removeOutgoingLink(URI2);
	},

	testAddOutgoingLinkRejected: function(test) {
		test.expect(4);
		
		var node = new NodeState({uri:URI1});
		node.addOutgoingLink(URI2);
		test.ok(node.hasPendingOutgoingLink(URI2));
		test.equal(node.outgoingLinks.length, 0);
		
		node.receiveLinkAddAck(URI2, OUTGOING, false);
		test.ok(!node.hasPendingOutgoingLink(URI2));
		test.equal(node.outgoingLinks.length, 0);
		
		test.done();
	},
	
	testAddIncomingLink: function(test) {
		test.expect(6);
		
		var node = new NodeState({uri:URI1});
		node.on('linkRequest', function(fromUri, toUri, linkType) {
			test.equal(fromUri, URI1);
			test.equal(toUri, URI2);
			test.equal(linkType, INCOMING);
			test.ok(node.hasPendingIncomingLink(URI2));
			
			node.receiveLinkAddAck(URI2, INCOMING, true);
			test.ok(!node.hasPendingIncomingLink(URI2));
			test.equal(node.incomingLinks.length, 1);
			
			test.done();
		});
		node.addIncomingLink(URI2);
	},
	
	testRemoveIncomingLink: function(test) {
		test.expect(5);
		
		var node = new NodeState({uri:URI1});
		node.addIncomingLink(URI2);
		node.addIncomingLink(URI3);
		node.receiveLinkAddAck(URI2, INCOMING, true);
		test.ok(!node.hasPendingIncomingLink(URI2));
		test.ok(node.hasPendingIncomingLink(URI3));
		test.equal(node.incomingLinks.length,1);
		
		node.removeIncomingLink(URI3);
		test.ok(!node.hasPendingIncomingLink(URI3));

		node.on('linkRemove', function(fromUri, toUri, linkType) {
			test.equal(node.incomingLinks.length,0);

			test.done();		
		});
		
		node.removeIncomingLink(URI2);
	},

	testAddIncomingLinkRejected: function(test) {
		test.expect(4);
		
		var node = new NodeState({uri:URI1});
		node.addIncomingLink(URI2);
		test.ok(node.hasPendingIncomingLink(URI2));
		test.equal(node.incomingLinks.length, 0);
		
		node.receiveLinkAddAck(URI2, INCOMING, false);
		test.ok(!node.hasPendingIncomingLink(URI2));
		test.equal(node.incomingLinks.length, 0);
		
		test.done();
	},
	
	testSave: function(test) {
		test.expect(2);
	
		var node = new NodeState({uri:URI1, type: 'foo'});
		node.setState('hello');
		var s = JSON.parse(JSON.stringify(node));
		
		mockery.registerMock('./nodeStateStorage.js', {
			save: function(uri, data) {
				test.equal(uri, URI1);
				test.deepEqual(data, s);
				test.done();
			}
		});
		mockery.enable();
		node.save();

	},

	testLoad: function(test) {
		test.expect(4);
	
		var node = new NodeState({uri:URI1, type: 'foo'});
		node.setState('hello');
		var o = JSON.stringify(node);
		
		mockery.registerMock('./nodeStateStorage.js', {
			load: function(uri, callback) {
				test.equal(uri, URI1);
				callback(null, o);
			}
		});
		mockery.enable();
		NodeState.load(URI1, function(err,node2) {
			test.equal(node2.uri, URI1);
			test.equal(node2.type, 'foo');
			test.equal(node2.state, 'hello');
			test.done();
		});
	}
	
}
