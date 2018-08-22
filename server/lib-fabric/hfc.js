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
const env = getPublicEnv();

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
    loadConfigFile(configFile);
}

// Load ibp-config.json
var ibpConfigFile = path.join(configFile, '/../', 'ibp-config.json');
if (!fs.existsSync(ibpConfigFile)) {
    logger.info('No config file:', ibpConfigFile);
} else {
    loadConfigFile(ibpConfigFile);
}


if (!hfc.getConfigSetting('org')) {
  throw new Error('ORG must be set in environment');
}

// you can always get config:
// var ORGS = hfc.getConfigSetting('network-config');
// var CONFIG_DIR = hfc.getConfigSetting('config-dir');

module.exports = hfc;

/**
 * Load config file.
 * Detects proper config format (NetworkConfig or IBPConfig)
 */
function loadConfigFile(configFile) {
    var config = JSON.parse(fs.readFileSync(configFile).toString());

    if (config["network-config"]) {
        loadNetworkConfigObject(configFile);
    } else {
        loadIBPConfigObject(configFile);
    }
}

/**
 * @typedef {object} NetworkConfig
 *
 * @property {object} env - 'WEBAPP_*' and 'X_*' environment variables
 *
 * @property {object} network-config
 *
 * @property {object} network-config.orderer
 * @property {object} network-config.orderer.url
 * @property {object} network-config.orderer.tls_cacerts - file location
 *
 * @property {object} network-config.<orgId>
 * @property {object} network-config.<orgId>.name
 * @property {object} [network-config.<orgId>.x-name]
 * @property {object} network-config.<orgId>.mspid
 * @property {object} network-config.<orgId>.ca - ca url
 *
 * @property {object} network-config.<orgId>.peer<peerNum>
 * @property {object} network-config.<orgId>.peer<peerNum>.requests
 * @property {object} network-config.<orgId>.peer<peerNum>.events
 * @property {object} network-config.<orgId>.peer<peerNum>.tls_cacerts - file location

 * @property {object} [network-config.<orgId>.admin]
 * @property {object} [network-config.<orgId>.admin].key - file location
 * @property {object} [network-config.<orgId>.admin].cert - file location
 */


/**
 * @typedef {object} IBPConfig
 *
 * @property {string}  name
 * @property {string}  description
 * @property {string}  x-networkId
 * @property {string}  x-fabricVersion
 * @property {string}  version
 * @property {string}  x-type

 * @property {object}  client - client info
 * @property {string}  client.organization - organisation ID
 * @property {string}  [client.x-organizationName] - organisation human-readable name

 * @property {object}  channels - (TODO)
 *
 * @property {object}                   organizations - organisations info
 * @property {string}                   organizations.<orgId>.mspid
 * @property {Array<string>}            organizations.<orgId>.peers - peers id
 * @property {Array<string>}            organizations.<orgId>.certificateAuthorities - CA id
 * @property {PersonalCertifacteInfo}   organizations.<orgId>.signedCert
 * @property {PersonalCertifacteInfo}   organizations.<orgId>.x-uploadedSignedCerts
 *
 * @property {object}           orderers - orderers info
 * @property {string}           orderers.<ordererId>.url
 * @property {object}           orderers.<ordererId>.grpcOptions
 * @property {CACertifacteInfo} orderers.<ordererId>.tlsCACerts
 *
 * @property {object}           peers - peers info
 * @property {string}           peers.<peerId>.url
 * @property {string}           peers.<peerId>.eventUrl
 * @property {object}           peers.<peerId>.grpcOptions
 * @property {CACertifacteInfo} peers.<peerId>.tlsCACerts
 * @property {string}           peers.<peerId>.x-mspid
 * @property {string}           peers.<peerId>.x-ledgerDbType
 * @property {object}           [peers.<peerId>.x-installed-chaincode]
 * @property {ChaincodeInfo}    peers.<peerId>.x-installed-chaincode.<chaincodeId>
 *
 * @property {object}               certificateAuthorities - ca info
 * @property {string}               certificateAuthorities.<caId>.url
 * @property {object}               certificateAuthorities.<caId>.httpOptions
 * @property {CACertifacteInfo}     certificateAuthorities.<caId>.tlsCACerts
 * @property {Array<RegistrarInfo>} certificateAuthorities.<caId>.registrar
 * @property {caName}               certificateAuthorities.<caId>.caName
 * @property {caName}               certificateAuthorities.<caId>.x-mspid
 */




/**
 * @typedef {object} CACertifacteInfo
 * @property {string}  pem - file content
 */

/**
 * @typedef {object} PersonalCertifacteInfo
 * @property {string}  pem - file content
 * @property {string}  x-name
 */


/**
 * @typedef {object} ChaincodeInfo
 * @property {string}  version
 * @property {string}  path
 */

/**
 * @typedef {object} RegistrarInfo
 * @property {string}  enrollId
 * @property {string}  enrollSecret - password
 */

/**
 * Load NetworkConfig
 * @param {string} configFile - config file location
 */
function loadNetworkConfigObject(configFile) {
    logger.info('Load NetworkConfig file:', configFile);

    const networkConfig = JSON.parse(fs.readFileSync(configFile).toString());
    hfc.addConfigFile(configFile);  // this config needed for lib-fabric

    networkConfig.env = env;
    hfc.setConfigSetting('config', networkConfig);  // this config needed for client


    // enrollment config
    const configJson = require('../config.json');
    hfc.setConfigSetting('enrollmentConfig', {
        enrollId:       _.get(configJson, 'user.username') || 'admin',
        enrollSecret:   _.get(configJson, 'user.secret') || 'adminpw',
    });
}



/**
 * Load IBPConfig and converts it to NetworkConfig (for compartibility)
 * @param {IBPConfig} ibpConfig
 * @param {string} _configFile - config file location
 */
function loadIBPConfigObject(ibpConfigFile) {
    logger.info('Load IBPConfig file:', ibpConfigFile);

    var ibpConfig = JSON.parse(fs.readFileSync(ibpConfigFile).toString());

    var networkConfig = {};

    // home IBM will fix if on their own
    if ( _.get(ibpConfig, 'client.x-organizationName')) {
        const orgId = _.get(ibpConfig, 'client.organization');
        _.set(ibpConfig, `organizations.${orgId}.x-organizationName`, _.get(ibpConfig, 'client.x-organizationName'));
    }

    var ibpOrdererId = _.keys(_.get(ibpConfig, 'orderers'))[0];
    networkConfig.orderer = {
        url: _.get(ibpConfig, `orderers.${ibpOrdererId}.url`),
        tlsCACerts: _.get(ibpConfig, `orderers.${ibpOrdererId}.tlsCACerts.pem`)
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
                'x-name': _.get(ibpConfig, `organizations.${org}.x-organizationName`),
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
    hfc.setConfigSetting('config', {"network-config": networkConfig, env: env});
    hfc.setConfigSetting('network-config', networkConfig);




    // clear sensitive information from ibp config
    const ibpConfigSafe = clone(ibpConfig);
    _.each(_.keys( _.get(ibpConfigSafe, `certificateAuthorities`)), orgId => {
        _.unset(ibpConfigSafe, `certificateAuthorities.${orgId}.registrar`);
    });

    //
    hfc.setConfigSetting('ipb-config', ibpConfigSafe);
}


function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}



/**
 *
 */
function envForbiddenRules(key) {
    return [
        // key.startsWith('npm_'),
        // key.startsWith('SSH_'),
        // key == 'GRPC_SSL_CIPHER_SUITES',
        // key == 'LS_COLORS',
        // key == 'PATH',

        false // allow all
        // true // deny all
    ];
};

/**
 *
 */
function envAllowedRules(key) {
    return [
        // key.startsWith('LC_'),
        key.startsWith('X_'),
        key.startsWith('x_'),
        key.startsWith('WEBAPP_'),
        key.startsWith('webapp_'),
        key == 'ORG',
        key == 'API',
        // key == 'CONFIG_FILE',
    ];
};

/**
 *
 */
function getPublicEnv() {
  return Object.keys(process.env)
      .filter(key => envForbiddenRules(key).every( r => !r ))
      .filter(key => !envAllowedRules(key).every( r => !r ))
      .reduce((result, key) => {
          result[key] = process.env[key];
          return result;
      }, {});
}
