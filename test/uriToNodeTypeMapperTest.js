
var mapper = require("../lib/uriToNodeTypeMapper.js");

module.exports.uriToNodeTypeMapperTest = {
	
	getNodeTypeTest: function(test) {
		test.expect(3);
		
		var uri = "http://foo.com/foo/1";
		test.equal(mapper.getNodeType(uri), "foo");
		
		uri = "/foo/1";
		test.equal(mapper.getNodeType(uri), "foo");
		
		uri = "http://foo.com";
		test.equal(mapper.getNodeType(uri), null);
		
		test.done();
	}
	
}