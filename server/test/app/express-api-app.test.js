/**
 * Created by maksim on 7/28/17.
 */
var assert = require('assert');
var request = require('../express-mock-request');


//
process.env.CONFIG_FILE = 'test/resources/network-config.json';
process.env.ORG = 'org1';
var app = require('../../app/express-api-app.js')();

/**
 *
 */
describe('Express API application', function(){

  /**
   *
   */
  it('/config', function(){
    var responseExpected = {"org":"org1", network:getNetworkConfig() };
    return promisisfy(request(app).get('/config'))
      .then(response=>{
          assert.deepEqual(response, responseExpected);
      });
  });




});

/**
 *
 */
function promisisfy(expressReq){
  return new Promise(function(resolve){
    expressReq.expect(function(response) {
      resolve( JSON.parse(response.body) );
    });
  });
}





function getNetworkConfig(){
  return {
    "orderer": {
      "url": "grpcs://orderer.example.com:7050",
      "server-hostname": "orderer.example.com",
      "tls_cacerts": "../../artifacts/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt"
    },

    "org1": {
      "name":  "peerorg1",
      "mspid": "org1MSP",
      "ca": "https://ca.org1.example.com:7054",
      "peer0": {
        "requests": "grpcs://peer0.org1.example.com:7051",
        "events":   "grpcs://peer0.org1.example.com:7053",
        "server-hostname": "peer0.org1.example.com",
        "tls_cacerts": "../../artifacts/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
      },
      "peer1": {
        "requests": "grpcs://peer1.org1.example.com:7051",
        "events":   "grpcs://peer1.org1.example.com:7053",
        "server-hostname": "peer1.org1.example.com",
        "tls_cacerts": "../../artifacts/crypto-config/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt"
      },
      "admin": {
        "key":  "../../artifacts/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore",
        "cert": "../../artifacts/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts"
      }
    },

    "org2": {
      "name":  "peerorg2",
      "mspid": "org2MSP",
      "ca": "https://ca.org2.example.com:7054",
      "peer0": {
        "requests": "grpcs://peer0.org2.example.com:7051",
        "events":   "grpcs://peer0.org2.example.com:7053",
        "server-hostname": "peer0.org2.example.com",
        "tls_cacerts": "../../artifacts/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
      },
      "peer1": {
        "requests": "grpcs://peer1.org2.example.com:7051",
        "events":   "grpcs://peer1.org2.example.com:7053",
        "server-hostname": "peer1.org2.example.com",
        "tls_cacerts": "../../artifacts/crypto-config/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/tls/ca.crt"
      },
      "admin": {
        "key":  "../../artifacts/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/keystore",
        "cert": "../../artifacts/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/signcerts"
      }
    }
  }

}

