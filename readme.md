# harbor-client

JavaScript client for Harbor.  Both CLI and library.  It's isomorphic which means it can be used in both node.js and browsers (using a tool like [Browserify](http://browserify.org)).

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

**update environment variables on a shipment**

Note that this does a delete/add against the api.

```bash
$ harbor updateEnvVars --shipment myapp --environment dev --envVarsFile environments/dev.json --user foo --passwd bar
```
The expected format of the environment variables file is
```json
{
  "SOME_VARIABLE": "foo",
  "ANOTHER_VARIABLE": "bar"
}
```

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

options = {
  shipment: 'myapp',
  environment: 'dev',
  envVarsFile: '/path/to/my/file.json',
  username: 'foo',
  password: 'bar'
};

harbor.updateEnvVars(options, function(err, result) {
  if (!err && result.success)
    console.log('shipment updated!');
  else
    console.error('update shipment failed');
});

```
