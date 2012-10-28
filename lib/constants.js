/** @fileOverview
	Defines "constants" used by other modules.
*/

var config = require('./config.js');

/** @namespace */
module.exports = {
	/** @const */ INCOMING: 'incoming',
	/** @const */ OUTGOING: 'outgoing',
	/** @const */ PENDING: 'pending',
	/** @const */ URI_NOTIF_STATE_CHANGE: 'http://uri.netfoundry.org/notification/state-change',
	/** @const */ URI_NOTIF_LINK_REQUEST: 'http://uri.netfoundry.org/notification/link-request',
	/** @const */ URI_NOTIF_LINK_REQUEST_ACK: 'http://uri.netfoundry.org/notification/link-request-ack',
	/** @const */ URI_NOTIF_LINK_REMOVE: 'http://uri.netfoundry.org/notification/link-remove',
	/** @const */ URI_NOTIF_MOCK: 'http://uri.netfoundry.org/notification/mock'	
}
