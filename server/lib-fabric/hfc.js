/*

 */
const RELPATH = '/../'; // relative path to server root. Change it during file movement
const path = require('path');
const fs   = require('fs');

var log4js = require('log4js');
var logger = log4js.getLogger('fabric-client');
logger.setLevel('DEBUG');

// const CONFIG_DIR_DEFAULT = '/etc/hyperledger/artifacts';
const CONFIG_DIR_DEFAULT = '../artifacts/';
const CONFIG_FILE_DEFAULT = 'network-config.json';
// const CRYPTO_CONFIG_DIR_DEFAULT = '../../artifacts/crypto-config';

////
var configFile = process.env.CONFIG_FILE || CONFIG_FILE_DEFAULT;
var configDir = process.env.CONFIG_DIR || CONFIG_DIR_DEFAULT;
if(!path.isAbsolute(configDir)){
  configDir = path.join(__dirname, RELPATH, configDir);
}
var config = path.join(configDir, configFile);



// TODO: use basepath for 'crypto-config' folder in network-config.json
// var cryptoConfigDir = process.env.CRYPTO_CONFIG_DIR || CRYPTO_CONFIG_DIR_DEFAULT;
// if(!path.isAbsolute(cryptoConfigDir)){
//   cryptoConfigDir = path.join(__dirname, cryptoConfigDir);
// }
// logger.info('Use cryptoConfigDir: %s', cryptoConfigDir);




fs.accessSync(config, fs.constants.R_OK);
logger.info('Use network config file: %s', config);

///////
var hfc = require('fabric-client');
hfc.setLogger(logger);
hfc.addConfigFile(config);

// you can always get config:
// var ORGS = hfc.getConfigSetting('network-config');

module.exports = hfc;