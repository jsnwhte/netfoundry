var util = require('util');
var LinkState = require('../lib/linkState.js');
var mockery = require('mockery');
var URI1 = 'http://foo.com/1';
var URI2 = 'http://foo.com/2';
var URI3 = 'http://foo.com/3';
var URI4 = 'http://foo.com/4';
var INCOMING = 'incoming';
var OUTGOING = 'outgoing';

exports.LinkStateTest = {

	testConstructor: function(test) {
		test.expect(4);
		
		var linkState = new LinkState({linkUri:URI1, type:'simple_link', direction:INCOMING, state: {fooProp:'fooValue'}});
		test.equal(linkState.linkUri, URI1);
		test.equal(linkState.type, 'simple_link');
		test.equal(linkState.direction, INCOMING);
		test.equal(linkState.state.fooProp, 'fooValue');
		
		test.done();
	},
	
	testModifiedDate: function(test) {
		test.expect(2);
		
		var linkState = new LinkState({linkUri:URI1, type:'simple_link', direction:INCOMING, state: {fooProp:'fooValue'}});
		var modDate = linkState.modifiedDate;

		setTimeout(function() {
			linkState.setState({fooProp:'barValue'});
			test.equal(linkState.state.fooProp, 'barValue');
			test.ok(modDate < linkState.modifiedDate);
			test.done();
			
		}, 1000);
	}
	
}
