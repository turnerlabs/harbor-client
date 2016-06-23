#!/usr/bin/env node

var fs = require('fs');
var readline = require('readline');
var minimist = require('minimist')(process.argv.slice(2));
var harbor = require('./index.js');
var yaml = require('js-yaml');

if (minimist._.indexOf('deploy') > -1)
  deployShipment();
else if (minimist._.indexOf('delete') > -1)
  deleteShipment();
else if (minimist._.indexOf('update') > -1)
  update();
else if (minimist._.indexOf('up') > -1)
  up();
else if (minimist._.indexOf('down') > -1)
  down();  
else
  usage();

function usage() {
  console.log('deploy example: harbor deploy --shipment myapp --environment dev --container myapp --image registry.services.dmtio.net/myapp:1.0.0 --buildtoken zcdcNMgHuusHm6pDtOGJ01CJxwJCUKz9');
  console.log('delete example: harbor delete --shipment myapp --user foo');
  console.log('update example: harbor update --file environments/dev.json --user foo');
  console.log('up example: harbor up --user foo');
  console.log('down example: harbor down --user foo');
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

  //read the harbor config from the specified .json file
  var harborConfig = require(util.format('%s/%s', process.cwd(), minimist.file));

  console.log('updating shipment...');

  var options = {
    username: minimist.user,
    password: passwd,
    shipment: harborConfig.shipment,
    environment: harborConfig.environment,
    envVars: harborConfig.envVars
  };

  harbor.update(options, function(err, result) {
    if (!err && result.success)
      console.log('shipment updated!');
    else
      console.error('update shipment failed: %s', err);
  });
}

function up() {
  if (!minimist.user) {
    usage();
    return;
  }
  updateAndTrigger('Starting');
}

function down() {
  if (!minimist.user) {
    usage();
    return;
  }
  updateAndTrigger('Stopping');
}

function updateAndTrigger(action) {

  //prompt user for password
  promptHidden('password: ', function(passwd) {

    //look for a docker-compose.yml file
    var file = 'docker-compose.yml';
    try {
      var dockerCompose = yaml.safeLoad(fs.readFileSync('./' + file, 'utf8'));
      //console.log(dockerCompose);

      //now look for harbor.yml
      try {
        var harborCompose = yaml.safeLoad(fs.readFileSync('./harbor-compose.yml', 'utf8'));
        //console.log(harborCompose);

        //get list of services from compose file
        var services = [];
        Object.getOwnPropertyNames(dockerCompose.services)
          .forEach(function(service) { services.push(service); });
        
        //get compose service config
        //todo: iterate
        var dockerConfig = dockerCompose.services[services[0]];

        //get harbor config
        var shipment = Object.getOwnPropertyNames(harborCompose)[0];
        var harborConifg = harborCompose[shipment];        

        // - update environment variables (in docker-compose.yml)
        var options = {
          username: minimist.user,
          password: passwd,
          shipment: shipment,
          environment: harborConifg.env,
          envVars: dockerConfig.environment,
          replicas: harborConifg.replicas,                    
          buildToken: harborConifg.buildToken
        };

        //if stopping, set replicas = 0
        if (action === 'Stopping')            
          options.replicas = 0;

        console.log('Updating shipment');

        harbor.update(options, function(err, result) {
          if (!err && result.success) {
            
            // - set replicas
            // - trigger
            // todo: iterate containers/services in compose file
            console.log(action, services[0]);

            //add additional options
            options.container = services[0];
            options.image = dockerConfig.image;

            harbor.deploy(options, function(err, result) {
              if (!err && result.success) {
                // - wait for elb to come up
              }                
              else {
                console.error('deploy failed: %s', err);
              }                
            });         
          }
          else {
            console.error('update shipment failed: %s', err);
          }            
        });
      }
      catch (e) {
        console.log(e);
      }
    }
    catch (e) {
      console.log(e);
    }
  });
}