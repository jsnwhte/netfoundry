/** @fileOverview
	Translate a URI into a node type.
*/

var url = require('url');

/** @namespace */
module.exports = {
	/**
		Gets the node type from the given URI
		@param {string} uri The URI from which to derive node type
		@returns {string}
	*/
	getNodeType: function(uri) {
		var urlObj = url.parse(uri);
		var pathnameParts = urlObj.pathname.split('/');

		if (pathnameParts.length > 1 && pathnameParts[1].length > 0) {
			return pathnameParts[1];
		}
		
		return null;
	}
}
