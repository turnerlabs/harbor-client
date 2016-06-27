# harbor-client

JavaScript client for Harbor.  Both CLI and library.  It's isomorphic which means it can be used in both node.js and browsers (using a tool like [Browserify](http://browserify.org)).

### usage (cli)

install into project
```
$ npm install --save-dev https://github.com/turnerlabs/harbor-client.git#docker-compose
```

or install globally
```
$ npm install -g https://github.com/turnerlabs/harbor-client.git#docker-compose
```

then

**deploy shipment**
```bash
$ harbor deploy --shipment myapp --environment dev --container myapp --image registry.services.dmtio.net/myapp:1.0.0 --buildtoken zcdcNMgHuusHm6pDtOGJ01CJxwJCUKz9
```

**delete shipment**
```bash
$ harbor delete --shipment myapp --user foo
```

**update a shipment**

Currently only supports updating environment variables.  Note that this does a delete/add against the api.

```bash
$ harbor update --file dev.json --user foo
```
The expected file format is
```json
{
  "shipment": "my-app",
  "environment": "dev",
  "envVars": {
    "SOME_VARIABLE": "foo",
    "ANOTHER_VARIABLE": "bar"
  }
}
```

**Experimental docker-compose like features**

Define and run multi-container Docker applications on Harbor.

Assuming you have a docker-compose.yml in your current directory, you can bring up a shipment with... 

```
$ harbor up --user foo
```

- updates environment variables 
- updates replicas
- triggers


To stop a shipment, remove containers, and delete the ELB

```
$ harbor down --user foo
```

- updates replicas=0
- triggers


Missing features here are: 

- dynamically creating a shipment if it doesn't already exist
- multi-container support
- access logs


This diagram shows how we can take an existing docker-compose.yml file that describes a containerized app, and run it on a variety of backends.

![docker-compose diagram](docker-workflow.png)



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
