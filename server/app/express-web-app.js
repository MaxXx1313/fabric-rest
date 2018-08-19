

const RELPATH = '/../'; // relative path to server root. Change it during file movement

var path    = require('path');
var express = require('express');
var expressJs      = require('../lib/express-js-file-middleware');
var expressPromise  = require('../lib/express-promise');

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



  // const env = getPublicEnv();
  // app.get('/env', function(req, res) {
  //     // res.setHeader('X-Api-Version', packageInfo.version);
  //     res.send(env);
  // });

  // console.log('The following config will be exposed to client as env.js: ', clientEnv);
  // app.get('/env.js', expressJs({api:''}));
  app.use( express.static(rootFolder, { index: 'index.html'}) );

  // at last - send 404
  app.use(function(req, res, next) { // jshint ignore:line
    res.status(404).end('Not Found');
  });

  return app;
};