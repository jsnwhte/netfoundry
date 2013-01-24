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
		@param {LinkState} linkState The state describing the requested link
		@param {Function(err)} [callback] Callback function is passed 1 argument:
										  err <tt>{string}</tt>
		@this {NodeState} The node processing the request 
	*/
	processLinkAdd: function(linkState, callback) {
		switch (linkState.direction) {
			case constants.INCOMING:
			case constants.OUTGOING:
				// by default, automatically accept links
				callback(null, true);
				return;
				
			default:
				callback(null, false);
				return;
		}
	}
}
