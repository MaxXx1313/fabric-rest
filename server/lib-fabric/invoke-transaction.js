/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
'use strict';
const util = require('util');
const tools = require('../lib/tools.js');

// const config = require('../config.json');
const helper = require('./helper.js');
const logger = helper.getLogger('invoke-chaincode');
const peerListener = require('../lib-fabric/peer-listener.js');

// const hfc = require('./hfc'); // jshint ignore:line
// const FabricClient = require('./FabricClient.js');
// const peerListener = require('./peer-listener');

const INVOKE_TIMEOUT = parseInt(process.env.INVOKE_TIMEOUT) || 120000;
const INVOKE_RETRIES = parseInt(process.env.INVOKE_RETRIES) || 10;


// Invoke transaction on chaincode on target peers
function invokeChaincode(peersUrls, channelID, chaincodeName, fcn, args, username, org, _retryAttempts) {
    if (typeof _retryAttempts === "undefined") {
        _retryAttempts = INVOKE_RETRIES;
    }

    logger.debug(util.format('\n============ invoke transaction as %s@%s ============\n', username, org));
    // var client = new FabricClient(username, org);
    // var channel = client.getChannel(channelID);
    // var targets = FabricClient.newPeers(peersUrls);

    const targets = helper.newPeers(peersUrls);
    let tx_id = null;
    let channel;
    let channel_event_hub;

    return helper.getChannelForOrg(channelID, username, org)
        .then(_channel => {
            channel = _channel;
            const client = channel.getClient();

            peerListener.listenChannel(channel);

            channel_event_hub = channel.newChannelEventHub(channel.getPeers()[0]);

            //
            tx_id = client.newTransactionID();
            logger.debug('Sending transaction proposal "%j"', tools.replaceBuffer(tx_id));
            // send proposal to endorser
            let request = {
                targets: targets,
                chaincodeId: chaincodeName,
                fcn: fcn,
                args: args,
                chainId: channelID,
                txId: tx_id
            };
            return channel.sendTransactionProposal(request);
        })

        .then((results) => {
            // results[0] - proposal responses
            // results[1] - proposal itself

            const proposalResponses = results[0] || [];

            // check responses
            let lastError = null;
            for (let i = 0, n = proposalResponses.length; i < n; i++) {
                let response = proposalResponses[i] || {};
                let prResponseStatus = response.response ? response.response.status : -1;
                if (prResponseStatus === 200) {
                    logger.info('transaction proposal was good');
                } else {
                    logger.error('transaction proposal was bad', response);
                    lastError = response.message || 'transaction proposal was bad';
                }
            }
            if (lastError) {
                throw new Error(lastError || 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
            }

            logger.debug(util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status,
                proposalResponses[0].response.message,
                proposalResponses[0].response.payload,
                proposalResponses[0].endorsement.signature.toString('base64')
            ));

            return results;
        })
        .then((results) => {
            // a real application would check the proposal results
            logger.info('Successfully endorsed proposal to invoke chaincode');

            // start block may be null if there is no need to resume or replay
            let start_block; // getBlockFromSomewhere();

            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            const transactionID = tx_id.getTransactionID();
            const event_monitor = new Promise((resolve, reject) => {
                const handle = setTimeout(() => {
                    // do the housekeeping when there is a problem
                    channel_event_hub.unregisterTxEvent(transactionID);

                    logger.error('Timeout - Failed to receive the transaction event after %d milliseconds', INVOKE_TIMEOUT);
                    reject(new Error(`Timed out waiting for block event after ${INVOKE_TIMEOUT} milliseconds`));

                    // TODO: eventHub is broken? looking for transaction by ID
                    // channel.queryTransaction(transactionID, channel.getPeers()[0])
                    //     .then(() =>{
                    //         resolve({status: 'SUCCESS'});
                    //     })
                    //     .catch(() => {
                    //         reject(new Error(`Timed out waiting for block event after ${INVOKE_TIMEOUT} milliseconds`));
                    //     });

                }, INVOKE_TIMEOUT);

                channel_event_hub.registerTxEvent( transactionID, function(tx_id, status, block_num) {
                        // console.log(arguments);
                        clearTimeout(handle);
                        //channel_event_hub.unregisterTxEvent(event_tx_id); let the default do this
                        logger.info('Successfully received the transaction event for block:', block_num);
                        // console.log(tx_id, status, block_num);
                        // storeBlockNumForLater(block_num);
                        resolve(status);

                    }, (error) => {
                        clearTimeout(handle);
                        logger.error('Failed to receive the transaction event ::' + error);
                        reject(error);
                    },
                    // when this `startBlock` is null (the normal case) transaction
                    // checking will start with the latest block
                    {
                        startBlock: start_block,
                        unregister: true,
                        disconnect: true
                    }
                    // notice that `unregister` is not specified, so it will default to true
                    // `disconnect` is also not specified and will default to false
                );
                channel_event_hub.connect();
            });

            //
            let send_trans = channel.sendTransaction({proposalResponses: results[0], proposal: results[1]});

            return Promise.all([event_monitor, send_trans])
                .then((response) => response[1]);
        })
        // .then((results) => {
        //     return new Promise((resolve => {
        //         setTimeout(() => {
        //             resolve(results);
        //         }, 5000);
        //     }));
        // })
        /*
                .then((results) => {
                    // results[0] - proposal responses
                    // results[1] - proposal itself

                    const proposalResponses = results[0] || [];
                    const proposal = results[1];

                    const request = {
                        proposalResponses: proposalResponses,
                        proposal: proposal
                    };


                    // set the transaction listener and set a timeout of 30sec
                    // if the transaction did not get committed within the timeout period,
                    // fail the test
                    const transactionID = tx_id.getTransactionID();

                    let txPromise = new Promise((resolve, reject) => { // jshint ignore:line
                        let handle = setTimeout(() => {
                            // eh.disconnect();
                            reject(new Error('TIMEOUT'));
                        }, INVOKE_TIMEOUT);


                        peerListener.registerTxEvent(transactionID, (tx, code) => {
                            clearTimeout(handle);
                            peerListener.unregisterTxEvent(transactionID);

                            if (code !== 'VALID') {
                                logger.warn('Invoke failed, code = ' + code);
                                const e = new Error('Invoke failed: ' + code);
                                e.code = code;
                                reject(e);
                            } else {
                                logger.info('Invoke succeed');
                                resolve(tx);
                            }
                        });
                    });

                    logger.debug('Committing transaction "%j"', tools.replaceBuffer(tx_id));
                    const sendPromise = channel.sendTransaction(request);
                    return Promise.all([sendPromise, txPromise]).then((results) => {
                        // return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
                        logger.debug(' event promise all complete and testing complete');
                        return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                    });

                })
                */

        .then((response) => {
            // console.log(response);
            if (response.status === 'SUCCESS') {
                logger.info('Successfully sent transaction to the orderer: TXID=', tx_id.getTransactionID());
                return tx_id.getTransactionID();
            } else {
                logger.error('Failed to order the transaction. Error code: ' + response.status);
                throw new Error('Failed to order the transaction. Error code: ' + response.status);
            }
        })
        .catch(function (e) {
            if (e && e.code === "MVCC_READ_CONFLICT") {
                logger.info('Invoke retry %s times', _retryAttempts);
                // orderer race condition
                // retry the transaction
                if (_retryAttempts > 0) {
                    _retryAttempts--;
                    return invokeChaincode(peersUrls, channelID, chaincodeName, fcn, args, username, org, _retryAttempts);
                }
            }
            throw e;
        });


}

exports.invokeChaincode = invokeChaincode;
