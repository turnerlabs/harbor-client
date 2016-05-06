#!/usr/bin/env node

'use strict';

var minimist = require('minimist')(process.argv.slice(2));
var harbor = require('./index.js');

if (minimist._.indexOf('deploy') > -1)
  deployShipment();
else if (minimist._.indexOf('delete') > -1)
  deleteShipment();
else if (minimist._.indexOf('updateEnvVars') > -1)
  updateEnvVars();
else
  usage();

function usage() {
  console.log('deploy example: harbor deploy --shipment myapp --environment dev --container myapp --image registry.services.dmtio.net/myapp:1.0.0 --buildtoken zcdcNMgHuusHm6pDtOGJ01CJxwJCUKz9');
  console.log('delete example: harbor delete --shipment myapp --user foo --passwd bar');
  console.log('update example: harbor updateEnvVars --shipment myapp --environment dev --envVarsFile environments/dev.json --user foo --passwd bar');
}

function deployShipment() {
  if (!minimist.shipment
    || !minimist.environment
    || !minimist.container
    || !minimist.image
    || !minimist.buildtoken){
    usage();
    return;
  }

  console.log('deploying shipment...');
  var options = {
    shipment: minimist.shipment,
    environment: minimist.environment,
    container: minimist.container,
    image: minimist.image,
    buildToken: minimist.buildtoken
  };

  harbor.deploy(options, function(err, result) {
    if (!err && result.success)
      console.log('deploy succeeded!');
    else
      console.error('deploy failed: %s', err);
  });
}

function deleteShipment() {
  if (!minimist.shipment
    || !minimist.user
    || !minimist.passwd) {
    usage();
    return;
  }
  console.log('deleting shipment...');

  var options = {
    shipment: minimist.shipment,
    username: minimist.user,
    password: minimist.passwd
  };

  harbor.deleteShipment(options, function(err, result) {
    if (!err && result.success)
      console.log('shipment deleted!');
    else
      console.error('delete shipment failed: %s', err);
  });
}

function updateEnvVars() {
  if (!minimist.shipment
    || !minimist.environment
    || !minimist.envVarsFile
    || !minimist.user
    || !minimist.passwd) {
    usage();
    return;
  }
  console.log('updating shipment environment variables...');

  var options = {
    shipment: minimist.shipment,
    environment: minimist.environment,
    envVarsFile: minimist.envVarsFile,
    username: minimist.user,
    password: minimist.passwd
  };

  harbor.updateEnvVars(options, function(err, result) {
    if (!err && result.success)
      console.log('shipment envVars updated!');
    else
      console.error('updateEnvVars shipment failed: %s', err);
  });
}
