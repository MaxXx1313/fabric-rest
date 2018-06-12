/*

 */
"use strict";
const RELPATH = '/../'; // relative path to server root. Change it during file movement
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

var log4js = require('log4js');

var logger = log4js.getLogger('fabric-client');
logger.setLevel('INFO');

// const CONFIG_FILE_DEFAULT = '/etc/hyperledger/artifacts/network-config.json';
const CONFIG_FILE_DEFAULT = '../artifacts/network-config.json';

////
var configFile = process.env.CONFIG_FILE || CONFIG_FILE_DEFAULT;
if (!path.isAbsolute(configFile)) {
    configFile = path.join(__dirname, RELPATH, configFile);
}
var configDir = path.dirname(configFile);

logger.info('Load config file:', configFile);
var config = JSON.parse(fs.readFileSync(configFile).toString());

///////
var hfc = require('fabric-client');
hfc.setLogger(logger);
hfc.addConfigFile(configFile);  // this config needed for lib-fabric

hfc.setConfigSetting('config', config);  // this config needed for client
hfc.setConfigSetting('config-dir', configDir);
hfc.setConfigSetting('config-file', configFile);


var ibpConfigFile = path.join(configFile, '/../', 'ibp-config.json');
logger.info('Load config file:', ibpConfigFile);
if (fs.existsSync(ibpConfigFile)) {

    var ibpConfig = JSON.parse(fs.readFileSync(ibpConfigFile).toString());

    var networkConfig = {
        "orderer": {
            url: _.get(ibpConfig, 'orderers.orderer.url'),
            tlsCACerts: _.get(ibpConfig, 'orderers.orderer.tlsCACerts.pem')
        }
    };

    _.each(_.keys(ibpConfig.organizations), org => {
        let orgCA = _.get(ibpConfig, `organizations.${org}.certificateAuthorities[0]`);
        hfc.getConfigSetting('enrollmentConfig') || hfc.setConfigSetting('enrollmentConfig', _.get(ibpConfig, `certificateAuthorities.${orgCA}.registrar[0]`)); //todo: several enrollment  configs
        hfc.getConfigSetting('tlsCACerts') || hfc.setConfigSetting('tlsCACerts', _.get(ibpConfig, `certificateAuthorities.${orgCA}.tlsCACerts.pem`));
        _.each(_.get(ibpConfig, `organizations.${org}.peers`), peer => {
            networkConfig[org] = {
                name: org,
                mspid: _.get(ibpConfig, `organizations.${org}.mspid`),
                ca: _.get(ibpConfig, `certificateAuthorities.${orgCA}.url`)
            };
            networkConfig[org][peer] = {
                requests: _.get(ibpConfig, `peers.${peer}.url`),
                events: _.get(ibpConfig, `peers.${peer}.eventUrl`),
                tlsCACerts: _.get(ibpConfig, `peers.${peer}.tlsCACerts.pem`)
            };
        });
    });

    hfc.addConfigFile(ibpConfigFile);
    hfc.setConfigSetting('config', {"network-config": networkConfig});
    hfc.setConfigSetting('network-config', networkConfig);

}

// you can always get config:
// var ORGS = hfc.getConfigSetting('network-config');
// var CONFIG_DIR = hfc.getConfigSetting('config-dir');

module.exports = hfc;