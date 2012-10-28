module.exports = {
	
	requestAddLinkResult: true,
	getStateResponseData: {fooState: "foo"},
	
	requestAddLink: function(toUri, linkUri, type, callback) {
		if (callback) callback(this.requestAddLinkResult);
	},

	notifyLinkRemoval: function(toUri, linkUri, type, callback) {
	},
	
	notifyStateChange: function(uri, state, outgoingLinks, callback) {
	},
	
	getState: function(toUri, fromUri, callback) {
		callback(true, toUri, this.getStateResponseData);
	}
}