var util = require('util');
var request = require('request');

module.exports = (function() {
  'use strict';

  var shipItUri = 'http://shipit.services.dmtio.net';
  var triggerUri = 'http://harbor-trigger.services.dmtio.net';

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
      if (err)
        callback(err);
      else if (res.statusCode != 200)
        callback(new Error('non-200 status code: ' + body));

      //now trigger the shipment
      var triggerUrl = util.format('%s/%s/%s/ec2',
        triggerUri,
        options.shipment,
        options.environment
      );

      request.post(triggerUrl, function(err, res, body) {
        if (err)
          callback(err);
        else if (res.statusCode != 200)
          callback(new Error('non-200 status code: ' + body));

        callback(null, { success: true });
      });
    });
  };

  return {
    deploy: deploy,
  };

})();
