'use strict';
const util = require('util');
const EventEmitter = require('events');
const _ = require('lodash');
const helper = require('./helper.js');
const logger = helper.getLogger('peer-listener');

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
///////////////////////////////////////////////
/**
 * @type {EventEmitter}
 */
const blockEvents = new EventEmitter();

/**
 * @type {Map<string, ChannelEventHub>}
 */
const channelEventHubs = {};



/**
 * @param {Channel} channel
 * @return {ChannelEventHub}
 */
function listenChannel(channel) {

    if (!channelEventHubs[channel._name]) {
        channelEventHubs[channel._name] = _connect(channel);
    }
    return channelEventHubs[channel._name];
}

/**
 * @param {Channel} channel
 * @return {ChannelEventHub}
 */
function _connect(channel) {
    const channelName = channel._name;


    // start block may be null if there is no need to resume or replay
    let start_block; // getBlockFromSomewhere();
    const channel_event_hub = channel.newChannelEventHub(channel.getPeers()[0]);

    channel_event_hub._connectTimer = setInterval(_checkConnection.bind(channel_event_hub), 1000); // TODO: socket connection check interval
    channel_event_hub._connectTimer.unref();
    logger.debug('connecting to channel:', channelName);
    blockEvents.emit('connecting');
    __connect();

    //
    function _checkConnection() {
        const eh = this; //jshint ignore:line
        if(eh._connected) {
            clearInterval(eh._connectTimer);
            eh._connectTimer = null;

            logger.debug('connected to channel:', channelName);
            blockEvents.emit('connected');
            logger.debug(util.format('\n(((((((((((( listen for blocks in channel %s: %s )))))))))))\n', channelName, eh._peer._url));

        }
    }


    function __connect() {
        const reg_num = channel_event_hub.registerBlockEvent(function (blockFiltered) {
                // console.log(blockFiltered);

                const first_tx = blockFiltered.filtered_transactions[0].txid; // get the first transaction
                const channel_id = blockFiltered.channel_id;
                if (channelName !== channel_id) {
                    return;
                }

                // const blockHash = block.header.data_hash;
                logger.info('Received block (((event))) for transaction:', first_tx);

                // make compartible block info
                const compartibleBlock = {};
                _.set(compartibleBlock, 'header.number', _.get(blockFiltered, 'number'));
                _.set(compartibleBlock, 'data.data[0].payload.header.channel_header.type', _.get(blockFiltered, 'filtered_transactions[0].type'));
                _.set(compartibleBlock, 'data.data[0].payload.header.channel_header.channel_id', channel_id);
                _.set(compartibleBlock, 'data.data[0].payload.header.channel_header.tx_id', first_tx);
                _.set(compartibleBlock, 'data.data[0].payload.header.channel_header.timestamp', Date.now());

                _.set(compartibleBlock, 'data._original_', blockFiltered);
                blockEvents.emit('block_success', compartibleBlock);

            }, (error) => {
                logger.error(util.format('Failed to receive block event in channel "%s" :' + error, channelName));
                blockEvents.emit('block_error', error);

                if (!channel_event_hub._connected) {
                    logger.debug('disconnected from', channelName);
                    // blockEvents.emit('disconnected');

                    // reconnect
                    channel_event_hub.unregisterBlockEvent(reg_num);
                    setTimeout(__connect.bind(null, channel), 5000); // TODO: socket reconnect interval
                }

            },
            // when this `startBlock` is null (the normal case) transaction
            // checking will start with the latest block
            {
                startBlock: start_block,
                unregister: false,
                disconnect: false
            }
            // notice that `unregister` is not specified, so it will default to true
            // `disconnect` is also not specified and will default to false
        );

        channel_event_hub.connect();
    }

    return channel_event_hub;
}

/**
 *
 */
function disconnect() {
    logger.warn('METHOD REMOVED');
    // channelEventHubs
}


function isConnected() {
    return Object.keys(channelEventHubs).length > 0;
}


// the same api as EventHub.js has

/**
 * Register a listener to receive all block events <b>from all the channels</b> that
 * the target peer is part of. The listener's "onEvent" callback gets called
 * on the arrival of every block. If the target peer is expected to participate
 * in more than one channel, then care must be taken in the listener's implementation
 * to differentiate blocks from different channels.
 *
 * @param {function} onEvent - Callback function that takes a single parameter
 *                             of a {@link Block} object
 * @param {function} onError - Optional callback function to be notified when this event hub
 *                             is shutdown. The shutdown may be caused by a network error or by
 *                             a call to the "disconnect()" method or a connection error.
 * @returns {int} This is the block registration number that must be
 *                sed to unregister (see unregisterBlockEvent)
 */
function registerBlockEvent(onEvent, onError) {
  onEvent && blockEvents.on('block_success', onEvent);
  onError && blockEvents.on('block_error', onError);
}

/**
 * @param onEvent
 * @param onError
 */
function unregisterBlockEvent(onEvent, onError) {
  onEvent && blockEvents.removeListener('block_success', onEvent);
  onError && blockEvents.removeListener('block_error', onError);
}

/**
 * Register a callback function to receive a notification when the transaction
 * by the given id has been committed into a block
 *
 * @param {string} txid - Transaction id string
 * @param {function} onEvent - Callback function that takes a parameter of type
 *                             {@link Transaction}, and a string parameter which
 *                             indicates if the transaction is valid (code = 'VALID'),
 *                             or not (code string indicating the reason for invalid transaction)
 * @param {function} onError - Optional callback function to be notified when this event hub
 *                             is shutdown. The shutdown may be caused by a network error or by
 *                             a call to the "disconnect()" method or a connection error.
 */
function registerTxEvent(txid, onEvent, onError) {
    logger.warn('METHOD REMOVED');
  // eventhub && eventhub.registerTxEvent(txid, onEvent, onError);

  // onEvent && blockEvents.on('tx_success_'+txid, onEvent);
  // onError && blockEvents.on('tx_error_'+txid, onError);
}

function unregisterTxEvent(txid) {
    logger.warn('METHOD REMOVED');
  // eventhub && eventhub.unregisterTxEvent(txid);

  // blockEvents.removeAllListeners('tx_success_'+txid);
  // blockEvents.removeAllListeners('tx_error_'+txid);
}

// registerChaincodeEvent(ccid, eventname, onEvent, onError) {

module.exports = {
  listenChannel   : listenChannel,
  disconnect      : disconnect,

  eventHub        : blockEvents,
  isConnected     : isConnected,

  registerBlockEvent   : registerBlockEvent,
  unregisterBlockEvent : unregisterBlockEvent,
  registerTxEvent      : registerTxEvent,
  unregisterTxEvent    : unregisterTxEvent,
};
