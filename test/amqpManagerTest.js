var mockery = require("mockery");
var util = require("util");
var config = require("../lib/config.js");
var constants = require("../lib/constants.js");

var URI1 = "http://foo.com/foo/1";
var URI2 = "http://foo.com/foo/2";
var URI3 = "http://foo.com/bar/1";


function registerMock(test)
{
	mockery.registerMock("amqp", {
		createConnection: function(obj) {
			test.equal(config.amqpHost, obj.host);
			return {
				on: function(event, handler) {
					if (event == "ready") handler();
				},
				end: function() {
					test.ok(true);
				},
				exchange: function(name, opts, callback) {
					test.equal(name, config.amqpExchangeName);
					callback({
						publish: function(key, msg) {
							test.equal("fookey", key);
							test.equal("foomsg", msg);
						}
					});
				},
				queue: function(name, opts, callback) {
					test.equal(name, "footype");
					callback({
						on: function(event, handler) {
							if (event == "queueBindOk") {
								test.ok(true);
								handler();
							}
						},
						bind: function(exch, key) {
							test.ok(true);
						},
						subscribe: function(opts, msgCallback) {
							setTimeout(function() {msgCallback("foomsg");},100);
							return {
								addCallback: function(cbFunction) {
									test.ok(true);
									cbFunction({consumerTag: "footag"});
								}
							};
						},
						unsubscribe: function(tag) {
							test.equal(tag, "footag");
							return {
								addCallback: function(cbFunction) {
									test.ok(true);
									cbFunction();
								}
							};
						},
						shift: function() {
							test.ok(true);
						}
					});
				}
			}
		}
		
	});
	
	mockery.registerMock("./nodeStateStorage.js", {
		save: function(uri, obj, callback) {
			callback(null);
		}
	});

}

module.exports.amqpManagerTest = {

	setUp: function(callback) {
		mockery.warnOnUnregistered(false);
		mockery.deregisterAll();
		mockery.registerAllowable("../lib/amqpManager.js", true);
		mockery.enable();
		callback();
	},

	testInitialize: function(test) {
		test.expect(2);
		
		registerMock(test);
		
		var amqpManager = require("../lib/amqpManager.js");
		amqpManager.initialize(function() {
			test.done();
		});
	},
	
	testPublish: function(test) {
		test.expect(4);
		
		registerMock(test);

		var amqpManager = require("../lib/amqpManager.js");
		amqpManager.initialize(function() {
			amqpManager.publish("fookey", "foomsg");
			test.done();
		});
	},

	testSubscribe: function(test) {
		test.expect(7);
		
		registerMock(test);

		var amqpManager = require("../lib/amqpManager.js");
		amqpManager.initialize(function() {
			amqpManager.subscribe("footype", function(tag) {
				test.equal(tag, "footag");
			},
			function(msg, header, deliveryInfo) {
				test.done();	
			});
		});
	},

	testUnsubscribe: function(test) {
		test.expect(9);
		
		registerMock(test);

		var amqpManager = require("../lib/amqpManager.js");
		amqpManager.initialize(function() {
			amqpManager.subscribe("footype", function(tag) {
				test.equal(tag, "footag");
			},
			function(msg, header, deliveryInfo) {
				amqpManager.unsubscribe("footype", "footag", function() {
					test.done();	
				});
			});
		});
	},
	
	testQueueShift: function(test) {
		test.expect(8);
		
		registerMock(test);

		var amqpManager = require("../lib/amqpManager.js");
		amqpManager.initialize(function() {
			amqpManager.subscribe("footype", function(tag) {
				test.equal(tag, "footag");
			},
			function(msg, header, deliveryInfo) {
				amqpManager.queueShift("footype");
				test.done();	
			});
		});
	},

	testEnd: function(test) {
		test.expect(9);
		
		registerMock(test);

		var amqpManager = require("../lib/amqpManager.js");
		amqpManager.initialize(function() {
			amqpManager.subscribe("footype", function(tag) {
				test.equal(tag, "footag");
			},
			function(msg, header, deliveryInfo) {
				amqpManager.stop();
				test.done();	
			});
		});
	}	

}