/**
 * This is a SHARED module!
 * It means it used both for backend and frontend.
 */
"use strict";
/* jshint esversion: 5 */

module.exports = {
  _extendConfig:_extendConfig,

  getHost: getHost,
  getOrgs: getOrgs,
  getPeers: getPeers,
  getPeerIds: getPeerIds,
  getOrgByDepcode: getOrgByDepcode,
  getPeerHostByCompositeID:getPeerHostByCompositeID
};

/**
 * @typedef {object} Config
 * @property {Object<OrgConfig>} network-config
 *
 * @property {object}  network-config.orderer - orderer config
 * @property {url}     network-config.orderer.url
 * @property {string} [network-config.orderer.server-hostname]
 * @property {string} [network-config.orderer.tls_cacerts]
 */

/**
 * @typedef {object} PeerConfig
 * @property {url}    requests grpc endpoint for making ledger request
 * @property {url}    events   grpc endpoint for listening ledger events
 * @property {string} [server-hostname] host name. Override the host in requests and events, so can be used to establish ssl connection
 * @property {string} [tls_cacerts]
 */

/**
 * @typedef {object} OrgConfig
 * @property {string} name    organisation name
 * @property {string} mspid   ledger membership name
 * @property {url}    ca   http(s) endpoint of organisation CA
 * @property {object} [admin] - CA admin credentials (certificate and key). Filled only for your organisation
 * @property {string} admin.key
 * @property {object} admin.cert
 */




/**
 * MODIFY the original config and add few usable properties
 * add getOrgs() to netConfig
 * add getPeers(orgId:string) to netConfig

 * add id to org info

 * add id to peer info
 * add org to peer info
 * add host to peer info
 * @param {Config} config
 */
function _extendConfig(config){
  var networkConfig = config['network-config'];
  Object.keys(networkConfig)
    .filter(function(key){ return key !== 'orderer'; })
    .forEach(function(orgId){

      // add org.id
      networkConfig[orgId].id = orgId;

      var orgConfig = networkConfig[orgId] || {};

      // add peers stuff
      Object.keys(orgConfig)
        .filter(function(key){ return key.startsWith('peer'); })
        .forEach(function(peerId){
          orgConfig[peerId].id   = peerId;
          orgConfig[peerId].host = getHost(orgConfig[peerId].requests);
          orgConfig[peerId].org  = orgId;
        });

    });
  // return networkConfig;
}



/**
 * Get peer host:port by composite id.
 * Composite ID is a combination of orgID and peerID, split by '/'. For example: 'org1/peer2'
 * @param {Config} config
 * @param {string} orgPeerID
 * @returns {string}
 */
function getPeerHostByCompositeID(config, orgPeerID){
  var networkConfig = config['network-config'];
  var parts = orgPeerID.split('/');
  var peer = networkConfig[parts[0]][parts[1]] || {};
  return getHost(peer.requests);
}



/**
 * @param {Config} config
 * @returns {OrgConfig[]}
 */
function getOrgs(config){
  var networkConfig = config['network-config'];
  return Object.keys(networkConfig)
    .filter(function(key){ return key !== 'orderer'; })
    .map(function(key){ return networkConfig[key]; });
}


/**
 * @param {Config} config
 * @param {string} orgID
 * @returns {PeerConfig[]}
 */
function getPeers(config, orgID){
  var networkConfig = config['network-config'];
  var orgConfig = networkConfig[orgID]||{};

  return Object.keys(orgConfig)
    .filter(function(key){ return key.startsWith('peer'); })
    .map(function(key){ return orgConfig[key]; });
}

/**
 * @param {Config} config
 * @param {string} orgID
 * @returns {string[]}
 */
function getPeerIds(config, orgID){
  var networkConfig = config['network-config'];
  var orgConfig = networkConfig[orgID]||{};

  return Object.keys(orgConfig)
    .filter(function(key){ return key.startsWith('peer'); })
    .map(function(key){ return orgID+'/'+key; });
}



/**
 * Extract host+port from url
 * @param {string} url
 * @return {string}
 */
function getHost(url){
  //                         1111       222222
  var m = (url||"").match(/^(\w+:)?\/\/([^\/]+)/) || [];
  return m[2];
}



/**
 * get organosation ID by deponent code (1 to 1 matching)
 * @param {Config} config
 * @param  {string} depCode
 * @return {string} orgID
 */
function getOrgByDepcode(config, depCode){
  var accountConfig = config['account-config'];
  // looking for second participant
  for(var org in accountConfig){
    if(accountConfig.hasOwnProperty(org)){
      if(accountConfig[org].dep === depCode){
        return org;
      }
    }
  }
  return null;
}
