#!/usr/bin/env node

var fs = require('fs');
var readline = require('readline');
var minimist = require('minimist')(process.argv.slice(2));
var harbor = require('./index.js');

if (minimist._.indexOf('deploy') > -1)
  deployShipment();
else if (minimist._.indexOf('delete') > -1)
  deleteShipment();
else if (minimist._.indexOf('update') > -1)
  update();
else
  usage();

function usage() {
  console.log('deploy example: harbor deploy --shipment myapp --environment dev --container myapp --image registry.services.dmtio.net/myapp:1.0.0 --buildtoken zcdcNMgHuusHm6pDtOGJ01CJxwJCUKz9');
  console.log('delete example: harbor delete --shipment myapp --user foo');
  console.log('update example: harbor update --file environments/dev.json --user foo');
}

function promptHidden(query, callback) {

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  var stdin = process.openStdin();
  process.stdin.on('data', function(char) {
    char = char + '';
    switch (char) {
      case '\n':
      case '\r':
      case '\u0004':
        stdin.pause();
        break;
      default:
        process.stdout.write('\033[2K\033[200D' + query + Array(rl.line.length + 1).join('*'));
        break;
    }
  });

  rl.question(query, function(value) {
    rl.history = rl.history.slice(1);
    callback(value);
  });
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
  if (!minimist.shipment || !minimist.user) {
    usage();
    return;
  }

  //prompt user for password
  promptHidden('password: ', deleteInternal);
}

function deleteInternal(passwd) {
  console.log('deleting shipment...');

  var options = {
    shipment: minimist.shipment,
    username: minimist.user,
    password: passwd
  };

  harbor.deleteShipment(options, function(err, result) {
    if (!err && result.success)
      console.log('shipment deleted!');
    else
      console.error('delete shipment failed: %s', err);
  });
}

function update() {
  if (!minimist.file || !minimist.user) {
    usage();
    return;
  }

  //prompt user for password
  promptHidden('password: ', updateInternal);
}

function updateInternal(passwd) {
  console.log('updating shipment...');

  var options = {
    file: minimist.file,
    username: minimist.user,
    password: passwd
  };

  harbor.update(options, function(err, result) {
    if (!err && result.success)
      console.log('shipment updated!');
    else
      console.error('update shipment failed: %s', err);
  });
}
