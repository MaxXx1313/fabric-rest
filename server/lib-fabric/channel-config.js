

var helper = require('./helper.js');
var logger = helper.getLogger('Channel-Config');


/**
 *
 */
export function channelConfig(channelID, peer, username, org) {

	return helper.getChannelForOrg(channelID, username, org)
		.then(channel=>{
			//var client = channel.getClient();
			return channel.getChannelConfigFromOrderer();
		});
}