/**
 * Created by maksim on 8/11/17.
 */
var fs = require('fs');
var assert = require('assert');
var ConfigHelper = require('../../lib/ConfigHelper');



var configBase = JSON.parse(fs.readFileSync(__dirname+'/network-config-test.json').toString());


describe('ConfigHelper', function(){

  var config;
  var networkConfig;
  var accountConfig;
  beforeEach(function(){
    config = clone(configBase);
    networkConfig = config['network-config'];
    accountConfig = config['account-config'];
  });

  it('_extendConfig', function(){
    ConfigHelper._extendConfig(config);

    assert.equal( networkConfig.orderer.id, undefined, 'no id for orderer');
    assert.equal( networkConfig.nsd.id, 'nsd');
    assert.equal( networkConfig.a.id, 'a');
    assert.equal( networkConfig.b.id, 'b');

    assert.equal( networkConfig.nsd.peer0.id, 'peer0');
    assert.equal( networkConfig.nsd.peer1.id, 'peer1');

    assert.equal( networkConfig.nsd.peer0.org, 'nsd');
    assert.equal( networkConfig.nsd.peer1.org, 'nsd');

    assert.equal( networkConfig.nsd.peer0.host, 'localhost:7051');
    assert.equal( networkConfig.nsd.peer1.host, 'localhost:7056');
  });

  it('getPeerHostByCompositeID', function(){
    var nsd_peer0 = ConfigHelper.getPeerHostByCompositeID(config, 'nsd/peer0');
    assert.equal( nsd_peer0, 'localhost:7051');

    var a_peer1 = ConfigHelper.getPeerHostByCompositeID(config, 'a/peer1');
    assert.equal( a_peer1, 'localhost:8056');

    var b_admin = ConfigHelper.getPeerHostByCompositeID(config, 'b/admin');
    assert.equal( b_admin, null, 'Should not access not peer info');
  });


  it('getOrgs', function() {
    assert.deepEqual(ConfigHelper.getOrgs(config), [
      networkConfig.nsd, networkConfig.a, networkConfig.b, networkConfig.c
    ]);
  });


  it('getPeers', function() {
    assert.deepEqual(ConfigHelper.getPeers(config, 'nsd'), [
      networkConfig.nsd.peer0, networkConfig.nsd.peer1
    ]);
  });


  it('getPeerIds', function() {
    assert.deepEqual(ConfigHelper.getPeerIds(config, 'nsd'), [
      'nsd/peer0', 'nsd/peer1'
    ]);
  });


  it('getHost', function(){
    assert.equal( ConfigHelper.getHost('http://localhost:7053/asd'), "localhost:7053");
    assert.equal( ConfigHelper.getHost('http://localhost:7053'), "localhost:7053");
  });


  it('getOrgByDepcode', function(){
    assert.equal( ConfigHelper.getOrgByDepcode(config, 'JP3946600008'), "nsd");
    assert.equal( ConfigHelper.getOrgByDepcode(config, 'CA9861913023'), "a");
    assert.equal( ConfigHelper.getOrgByDepcode(config, '404:no_such_dep'), null);
  });


});


function clone(obj){
  return JSON.parse(JSON.stringify(obj));
}


