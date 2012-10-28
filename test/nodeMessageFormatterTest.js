var formatter = require("../lib/nodeMessageFormatter.js");
var NodeState = require("../lib/nodeState.js");
var constants = require("../lib/constants.js");
var util = require("util");

var URI1 = "http://foo.com/foo/1";
var URI2 = "http://foo.com/doo/2";


module.exports.nodeMessageFormatterTest = {
	
	testFormat: function(test) {
		test.expect(7);
		
		var node = new NodeState({uri: URI1, type: "foo"});
		var msg = formatter.format(node, constants.URI_NOTIF_STATE_CHANGE, URI2, "doo", {additionalField: "bar"});
		
		test.equal(msg.fromUri, URI1);
		test.equal(msg.fromType, "foo");
		test.equal(msg.toUri, URI2);
		test.equal(msg.toType, "doo");
		test.equal(msg.topic, constants.URI_NOTIF_STATE_CHANGE);
		test.equal(msg.additionalField, "bar");
		
		var msg = formatter.format(node, constants.URI_NOTIF_STATE_CHANGE, URI2, "doo");
		test.ok(true, "additionalProps arg optional");
				
		test.done();
	}
}