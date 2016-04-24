# harbor-client

JavaScript client for Harbor.  It's isomorphic which means it can be used in both node.js and browsers (using a tool like [Browserify](http://browserify.org)). This project also contains a CLI.

### usage (library)

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
  else
    console.error('deploy failed');
});

options = {
  shipment: 'myapp',
  username: 'foo',
  password: 'bar'
};

harbor.deleteShipment(options, function(err, result) {
  if (!err && result.success)
    console.log('shipment deleted!');
  else
    console.error('delete shipment failed');
});

```

### usage (cli)

install into project
```
$ npm install --save-dev https://github.com/turnerlabs/harbor-client.git
```

or install globally
```
$ npm install -g https://github.com/turnerlabs/harbor-client.git
```

then

**deploy shipment**
```bash
$ harbor deploy --shipment myapp --environment dev --container myapp --image registry.services.dmtio.net/myapp:1.0.0 --buildtoken zcdcNMgHuusHm6pDtOGJ01CJxwJCUKz9
```

**delete shipment**
```bash
$ harbor delete --shipment myapp --user foo --passwd bar
```
