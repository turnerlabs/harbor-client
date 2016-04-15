### harbor-client

JavaScript client library for Harbor.  It's isomorphic which means it can be used in both node.js and browsers.

Currently only supports deployments.

*usage*

```js
var harbor = require('harbor-client');

var options = {
  shipment: 'myapp',
  environment: 'dev',
  container: 'myapp',
  image: 'registry.services.dmtio.net/myapp:1.0.0',
  buildToken: 'zcdcNMgHuusHm6pDtOGJ01CJxwJCUKz9'
};

harbor.deploy(options, function(err, result) {
  if (!err && result.success)
    console.log('deploy succeeded!');
});
```
