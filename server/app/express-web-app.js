

const RELPATH = '/../'; // relative path to server root. Change it during file movement

var path    = require('path');
var express = require('express');
var expressJs      = require('../lib/express-js-file-middleware');
var expressPromise  = require('../lib/express-promise');


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

/**
 *
 */
module.exports = function(rootFolder) {
  "use strict";

  if(!path.isAbsolute(rootFolder)){
    rootFolder = path.join(__dirname, RELPATH, rootFolder);
  }

  var app = express();
  app.use(expressPromise());



  const env = getPublicEnv();
  app.get('/env.js', expressJs('__env', env));
  app.get('/env', function(req, res) {
      // res.setHeader('X-Api-Version', packageInfo.version);
      res.send(env);
  });

  // console.log('The following config will be exposed to client as env.js: ', clientEnv);
  // app.get('/env.js', expressJs(clientEnv));
  app.use( express.static(rootFolder, { index: 'index.html'}) );

  // at last - send 404
  app.use(function(req, res, next) { // jshint ignore:line
    res.status(404).end('Not Found');
  });

  return app;
};