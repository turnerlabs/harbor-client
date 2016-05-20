var util = require('util');
var request = require('request');

module.exports = (function() {
  'use strict';

  var shipItUri = 'http://shipit.services.dmtio.net';
  var triggerUri = 'http://harbor-trigger.services.dmtio.net';
  var authApi = 'http://auth.services.dmtio.net';

  var deploy = function(options, callback) {

    var url = util.format('%s/v1/shipment/%s/environment/%s/container/%s',
      shipItUri,
      options.shipment,
      options.environment,
      options.container
    );

    var payload = {
      buildToken: options.buildToken,
      image: options.image
    };

    //update the shipment with the new image
    request.put({ url: url, json: payload }, function (err, res, body) {
      if (err) {
        callback(err, { success: false });
        return;
      }
      else if (res.statusCode != 200) {
        callback(new Error(util.format('update shipment, status code: %s, %s', res.statusCode, body)), { success: false });
        return;
      }

      //now trigger the shipment
      var triggerUrl = util.format('%s/%s/%s/ec2',
        triggerUri,
        options.shipment,
        options.environment
      );

      request.post(triggerUrl, function(err, res, body) {
        if (err) {
          callback(err, { success: false });
          return;
        }
        else if (res.statusCode != 200) {
          callback(new Error(util.format('trigger, status code: %s, %s', res.statusCode, body)), { success: false });
          return;
        }
        callback(null, { success: true });
      });
    });
  };

  var deleteShipment = function(options, callback) {
    //get token
    var payload = {
      username: options.username,
      password: options.password
    };
    request.post({ url: authApi + '/v1/auth/gettoken', json: payload }, function(err, res, body) {
      if (err) {
        callback(err, { success: false });
        return;
      }
      else if (res.statusCode != 200) {
        callback(new Error(util.format('gettoken, status code: %s, %s', res.statusCode, body)), { success: false });
        return;
      }

      //now actually delete shipment
      var reqOptions = {
        url: shipItUri + '/v1/shipment/' + options.shipment,
        headers: {
          'x-username': payload.username,
          'x-token': body.token
        }
      };
      request.del(reqOptions, function(err, res, body) {
        if (err) {
          callback(err, { success: false });
          return;
        }
        else if (res.statusCode != 200) {
          callback(new Error(util.format('delete, status code: %s, %s', res.statusCode, body)), { success: false });
          return;
        }
        callback(null, { success: true });
      });
    });
  };

  var update = function(options, callback) {

    //get token
    var payload = {
      username: options.username,
      password: options.password
    };

    request.post({ url: authApi + '/v1/auth/gettoken', json: payload }, function(err, res, body) {
      if (err) {
        callback(err, { success: false });
        return;
      }
      else if (res.statusCode != 200) {
        callback(new Error(util.format('gettoken, status code: %s, %s', res.statusCode, body)), { success: false });
        return;
      }

      //read the environment variables from the .json file
      var harborConig = require(util.format('%s/%s', process.cwd(), options.file));

      //track the async calls
      var items = [];

      //delete the envvars, then add them back
      Object.getOwnPropertyNames(harborConig.envVars).forEach(function(envVar) {
        console.log('updating ' + envVar);
        items.push(envVar);

        var url = util.format('%s/v1/shipment/%s/environment/%s/envVar',
          shipItUri,
          harborConig.shipment,
          harborConig.environment
        );
        console.log(url);

        var headers = {
          'x-username': payload.username,
          'x-token': body.token
        };

        var reqOptions = {
          url: url + '/' + envVar,
          headers: headers
        };

        request.del(reqOptions, function(err, res, body) {
          if (err) {
            callback(err, { success: false });
            return;
          }
          else if (!(res.statusCode === 200 || res.statusCode === 422)) {
            callback(new Error(util.format('delete, status code: %s, %s', res.statusCode, body)), { success: false });
            return;
          }

          //now re-create envvar
          var reqOptions = {
            url: url + 's',
            headers: headers,
            json: true,
            body: { name: envVar, value: harborConig.envVars[envVar] }
          };

          request.post(reqOptions, function(err, res, body) {
            if (err) {
              callback(err, { success: false });
              return;
            }
            else if (res.statusCode != 200) {
              callback(new Error(util.format('post, status code: %s, %s', res.statusCode, body)), { success: false });
              return;
            }
            items.pop();

            //fire callback when we're done
            if (items.length === 0)
              callback(null, { success: true });
          });
        });
      }); //foreach
    });
  };

  return {
    deploy: deploy,
    deleteShipment: deleteShipment,
    update: update
  };

})();
