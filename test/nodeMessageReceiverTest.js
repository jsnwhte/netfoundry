var mockery = require("mockery");
var constants = require("../lib/constants.js");
var NodeState = require("../lib/nodeState.js");

var URI1 = "http://foo.com/mock/1";
var URI2 = "http://foo.com/mock/2";

function registerMocks(test, testCallback) {

	mockery.registerMock("./amqpManager.js", {
		subscribe: function(type, subsCallback, msgCallback) {
			test.equal(type, "mock");
			subsCallback("footag");
			msgCallback({toUri: URI2, topic: constants.URI_NOTIF_MOCK});
		},
		queueShift: function(type) {
			test.equal(type, "mock");
		},
		unsubscribe: function(type, tag, callback) {
			test.equal(type, "mock");
			test.equal(tag, "footag");
			callback();
		}
	});

	mockery.registerMock("./nodeStateStorage.js", {
		load: function(uri, callback) {
			test.equal(uri, URI2);
			callback(null, new NodeState({uri: URI2, type: "mock"}));
		}
	});
}

module.exports.NodeMessageReceiverTest = {
	
	setUp: function(callback) {
		mockery.warnOnUnregistered(false);
		mockery.deregisterAll();
		mockery.registerAllowable("../lib/nodeMessageReceiver.js", true);
		mockery.enable();
		callback();
	},
	
	testStateChange: function(test) {
		test.expect(5);
		
		registerMocks(test);
		
		var NodeMessageReceiver = require("../lib/nodeMessageReceiver.js");
		var receiver = new NodeMessageReceiver("mock");
		receiver.on('ready', function() {
			setTimeout(function() {receiver.stop();}, 100);
		});
		receiver.on('stopped', function() {
			test.done();
		});
		
		receiver.start();
	}	
}
