/** @fileOverview
	This module contains the default link add logic. It is invoked by the nodeState.js
	module during the receiveLinkAddRequest operation.
	
	State change logic modules are loaded according to the node type as configured in the
	linkAddProcessors collection defined in config.js.
*/

var constants = require('./constants.js');

/**
	@namespace
*/	
module.exports = {
	/**
		Processes a link add request
		@param {NodeState} node The node processing the request
		@param {string} linkUri The URI of the node requesting the link
		@param {string} linkType The type of link from the perspective of <tt>node</tt>.
								 Can be either "incoming" or "outgoing".
	*/
	processLinkAdd: function(node, linkUri, linkType) {
		switch (linkType) {
			case constants.INCOMING:
			case constants.OUTGOING:
				// by default, automatically accept links
				return true;
				
			default:
				return false;
		}
	}
}
