/**

 */
"use strict";
const RELPATH = '/../'; // relative path to server root. Change it whne file is moved
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
var hfc = require('fabric-client');

var log4js = require('log4js');
var logger = log4js.getLogger('fabric-client');
logger.setLevel('INFO');
hfc.setLogger(logger);

/**
 * Current organisation
 */
const ORG = process.env.ORG || null;

hfc.setConfigSetting('org', ORG);

// const CONFIG_FILE_DEFAULT = '/etc/hyperledger/artifacts/network-config.json';
const CONFIG_FILE_DEFAULT = '../artifacts/network-config.json';

////
var configFile = process.env.CONFIG_FILE || CONFIG_FILE_DEFAULT;
if (!path.isAbsolute(configFile)) {
    configFile = path.join(__dirname, RELPATH, configFile);
}

var configDir = path.dirname(configFile);

hfc.setConfigSetting('config-dir', configDir);
hfc.setConfigSetting('config-file', configFile);


// Load network-config.json
if (!fs.existsSync(configFile)) {
    logger.info('No config file:', configFile);
} else {
    logger.info('Load config file:', configFile);
    var config = JSON.parse(fs.readFileSync(configFile).toString());
    hfc.addConfigFile(configFile);  // this config needed for lib-fabric
    hfc.setConfigSetting('config', config);  // this config needed for client
}

// Load ibp-config.json
var ibpConfigFile = path.join(configFile, '/../', 'ibp-config.json');
if (!fs.existsSync(ibpConfigFile)) {
    logger.info('No config file:', ibpConfigFile);
} else {
    logger.info('Load config file:', ibpConfigFile);

    var ibpConfig = JSON.parse(fs.readFileSync(ibpConfigFile).toString());

    var networkConfig = {
        "orderer": {
            url: _.get(ibpConfig, 'orderers.orderer.url'),
            tlsCACerts: _.get(ibpConfig, 'orderers.orderer.tlsCACerts.pem')
        }
    };

    _.each(_.keys(ibpConfig.peers), peer => {
    // _.each(_.keys(ibpConfig.organizations), org => {

        const org = _.get(ibpConfig, `peers.${peer}.x-mspid`);
        let orgCA = _.get(ibpConfig, `organizations.${org}.certificateAuthorities[0]`);

        //todo: several enrollment  configs
        const enrollmentConfig =  _.get(ibpConfig, `certificateAuthorities.${orgCA}.registrar[0]`);
        if (enrollmentConfig) {
            hfc.getConfigSetting('org') || hfc.setConfigSetting('org', org);
            hfc.setConfigSetting('enrollmentConfig', enrollmentConfig);
        }

        hfc.getConfigSetting('tlsCACerts') || hfc.setConfigSetting('tlsCACerts', _.get(ibpConfig, `certificateAuthorities.${orgCA}.tlsCACerts.pem`));

        if (!networkConfig[org]) {
            networkConfig[org] = {
                name: org,
                mspid: _.get(ibpConfig, `organizations.${org}.mspid`),
                ca: _.get(ibpConfig, `certificateAuthorities.${orgCA}.url`)
            };
        }

        networkConfig[org][peer] = {
            requests: _.get(ibpConfig, `peers.${peer}.url`),
            events: _.get(ibpConfig, `peers.${peer}.eventUrl`),
            tlsCACerts: _.get(ibpConfig, `peers.${peer}.tlsCACerts.pem`)
        };
    });

    hfc.addConfigFile(ibpConfigFile);
    hfc.setConfigSetting('config', {"network-config": networkConfig});
    hfc.setConfigSetting('network-config', networkConfig);
}


if (!hfc.getConfigSetting('org')) {
  throw new Error('ORG must be set in environment');
}

// you can always get config:
// var ORGS = hfc.getConfigSetting('network-config');
// var CONFIG_DIR = hfc.getConfigSetting('config-dir');

module.exports = hfc;