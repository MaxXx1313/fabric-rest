/**
 * Created by maksim on 7/18/17.
 */
"use strict";
const log4js = require('log4js');
const logger = log4js.getLogger('Socket');
const peerListener = require('../lib-fabric/peer-listener.js');
const tools = require('../lib/tools');

const hfc = require('../lib-fabric/hfc');
const networkConfig = hfc.getConfigSetting('network-config');

// config
// var config = require('../config.json');

const ORG = hfc.getConfigSetting('org');
const USERNAME = hfc.getConfigSetting('enrollmentConfig').enrollId;


module.exports = {
  init: init
};

/**
 * @param {Server} io
 * @ param {object} options
 * @return void
 */
function init(io/*, options*/){

  const orgConfig = networkConfig[ORG];
  if(!orgConfig){
    throw new Error('No such organisation in config: ' + ORG);
  }

  // get any peer on the current organisation
  const PEERS = Object.keys(orgConfig).filter(k=>k.includes('peer'));
  const peersAddress = PEERS.map(p=>tools.getHost(networkConfig[ORG][p].requests));

  // log connections
  io.on('connection', function(socket){
    logger.debug('a new user connected:', socket.id);
    socket.on('disconnect', function(/*socket*/){
      logger.debug('user disconnected:', socket.id);
    });
  });

  //TODO: listen all peers, remove duplicates
  // peerListener.init([peersAddress[0]], USERNAME, ORG); // TODO: wait for the operation finished

  peerListener.registerBlockEvent(function(block){
    // emit globally
    io.emit('chainblock', block);
  });

  // note: these statuses should be matched with client status set
  peerListener.eventHub.on('disconnected', function(){ io.emit('status', 'disconnected'); });
  peerListener.eventHub.on('connecting',   function(){ io.emit('status', 'connecting');   });
  peerListener.eventHub.on('connected',    function(){ io.emit('status', 'connected');    });

  // peerListener.listen();

  // emit current status for the new clients
  io.on('connection', function(socket){
    // socket.emit('status', peerListener.isConnected() ? 'connected':'disconnected' );
    socket.emit('status', 'connected');
  });


  // setInterval(function(){
  //   socket.emit('ping', Date.now() );
  // }, 5000);
}
