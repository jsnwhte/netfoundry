/*  @fileOverview
	This module contains the default state change logic. It is invoked by the nodeState.js
	module during the receiveStateChangeNotification operation.
	
	State change logic modules are loaded according to the node type as configured in the
	stateChangeProcessors collection defined in config.js.
*/

/** @namespace */
module.exports = {
	/**
		Processes a state change notification from another node
		@param {string} fromUri The URI of the node whose state changed
		@this {NodeState} The node receiving the state change notification
	*/
	processStateChange: function(fromUri) {
		console.log(this.uri + ' took no action on state change from ' + fromUri);
	}
}
