var assert = require('chai').assert;
var harbor = require('../index.js');

describe('deploy', function() {
  describe('integration', function () {
    it('should deploy successfully', function(done) {

      var options = {
        shipment: 'mss-poc-thingproxy',
        environment: 'dev',
        container: 'mss-poc-thingproxy',
        image: 'registry.services.dmtio.net/thingproxy:0.0.4',
        buildToken: 'zcdcNMgHuusHm6pDtOGJ01CJxwJCUKz9'
      };

      harbor.deploy(options, function(err, result) {
        if (err) {
          console.error('error deploying');
          throw err;
        }
        console.log(result);
        assert.equal(result.success, true);
        done();
      });
    });
  });
});
