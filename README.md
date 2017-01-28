# KlarkJS

Module loader (plugin system) based on dependency injection for NodeJS applications.

Forget the
 
* relative paths
* *require()* boilerplate code
* large-scale project entropy
* unorganized NodeJS structure

![Klark JS](/doc/klark.png "Klark JS")

KlarkJS is a novel system for NodeJS module dependency management that handles the creation of the modules, resolves their internal and external dependencies, and provides them to other modules.

It works with dependency injection based on function parameters in order to define the components dependencies. This architecture decreases dramatically the boiler plate code of an ordinary NodeJS application.

We inspired from 2 main tools:

- Angular 1 dependency injection
- Architect js package management

> npm install --save klark-js

## Table of Contents

<!-- MarkdownTOC depth=4 autolink=true bracket=round -->

- [Main Idea](#main-idea)
- [Benefits](#benefits)
    - [Pure NodeJS implementation](#pure-nodejs-implementation)
    - [KlarkJS implementation](#klarkjs-implementation)
    - [Comparison](#comparison)
        - [Boilerplate Code](#boilerplate-code)
        - [Relative Path Avoidance](#relative-path-avoidance)
        - [Code Guidance](#code-guidance)
- [API](#api)
    - [run\(\[config\]\)](#runconfig)
        - [config](#config)
    - [KlarkJS Controller Function](#klarkjs-controller-function)
        - [Internal Dependencies](#internal-dependencies)
        - [External Dependencies](#external-dependencies)
        - [Return Value](#return-value)
    - [KlarkAPI](#klarkapi)
        - [getModule\(name\)](#getmodulename)
        - [getInternalModule\(name\)](#getinternalmodulename)
        - [getExternalModule\(name\)](#getexternalmodulename)
        - [injectInternalModuleFromMetadata\(moduleName, controller\)](#injectinternalmodulefrommetadatamodulename-controller)
        - [injectInternalModuleFromFilepath\(filepath\)](#injectinternalmodulefromfilepathfilepath)
        - [injectExternalModule\(name\)](#injectexternalmodulename)
        - [getApplicationDependenciesGraph\(\)](#getapplicationdependenciesgraph)
        - [config](#config-1)
- [Plugin System](#plugin-system)
- [Unit Tests](#unit-tests)
- [KlarkJS Development](#klarkjs-development)
- [References](#references)

<!-- /MarkdownTOC -->

## Main Idea

Potentially, all the NodeJS modules are isolated plugins. Each plugin depends on other plugin. The other plugins could either be external (from `node_modules` folder) or internal (another plugin in our source code tree). Thus, we can simply define a plugin providing the plugin name and the dependencies. The following is a typical KlarkJS module declaration:

```javascript
KlarkModule(module, 'myModuleName1', function($nodeModule1, myModuleName2) {
    return {
        log: function() { console.log('Hello from module myModuleName1') }
    };
});
```

`KlarkModule` is a global function provided by KlarkJS in order to register a module. The module registration requires 3 parameters.

1. The NodeJS native [module](https://nodejs.org/api/modules.html#modules_the_module_object)
2. The name of the module
3. The module's [controller](#klarkjs-controller-function)

The dependencies of the module are defined by the controller parameter names. The names of the modules are always camel case and the external modules (`node_modules`) are always prefixed by `$`.

## Benefits

On the following excerpts we depict a simple NodeJS application in pure NodeJS modules and a NodeJS application in KlarkJS. We will observe the simplicity and the minimalism that KlarkJS provides.

### Pure NodeJS implementation

```javascript
/////////////////////
// ./app.js
var express = require('express');
var config = require('./config');
var mongooseConnector = require('./db/mongoose-connector.js');

var app = express();
app.get('/', function(req, res){
    mongooseConnector.connect(function(db) {
        db.collection('myCollection').find().toArray(function(err, items) {
            res.send(items);
        });
    });
});
app.listen(config.PORT);

/////////////////////
// /db/mongoose-connector.js
var mongoose = require('mongoose');
var logger = require('./logger');
var config = require('./config');

module.exports = {
    connect: connect
};

var connected = false;
function connect(cb) {
    if (connected) {
        cb($mongoose.connection);
        return;
    }
    mongoose.connect(config.MONGODB_URL);]
    db.once('open', function() {
      logger.log('connected');
      connected = true;
      cb(mongoose.connection);
    });
}

/////////////////////
// ./logger.js
module.exports = {
    log: function() { console.log.apply(console, arguments); },
    error: function() { console.error.apply(console, arguments); }
};

/////////////////////
// ./config.js
module.exports = {
    MONGODB_URL: 'mongodb://localhost:27017/my-db',
    POST: 3000
};

/////////////////////
// ./index.js
require('./app');
```

### KlarkJS implementation

```javascript
/////////////////////
// /plugins/app/index.js
KlarkModule(module, 'app', function($express, config, dbMongooseConnector) {
    var app = $express();
    app.get('/', function(req, res){
        dbMongooseConnector.connect(function(db) {
            db.collection('myCollection').find().toArray(function(err, items) {
                res.send(items);
            });
        });
    });
    app.listen(config.PORT);
});

/////////////////////
// /plugins/db/mongoose-connector/index.js
KlarkModule(module, 'dbMongooseConnector', function($mongoose, logger, config) {
    var connected = false;
    return {
        connect: connect
    };

    function connect(cb) {
        if (connected) {
            cb($mongoose.connection);
            return;
        }
        $mongoose.connect(config.MONGODB_URL);]
        db.once('open', function() {
          logger.log('connected');
          connected = true;
          cb($mongoose.connection);
        });
    }
});

/////////////////////
// /plugins/logger/index.js
KlarkModule(module, 'logger', function() {
    return {
        log: function() { console.log.apply(console, arguments); },
        error: function() { console.error.apply(console, arguments); }
    };
});

/////////////////////
// /plugins/config/index.js
KlarkModule(module, 'config', function() {
    return {
        MONGODB_URL: 'mongodb://localhost:27017/my-db',
        POST: 3000
    };
});

/////////////////////
// ./index.js
var klark = require('klark-js');
klark.run();
```

### Comparison

#### Boilerplate Code

```javascript
// pure NodeJS
var express = require('express');
var app = express(); ...

// Kark JS
KlarkModule(module, 'app', function($express) {
```

In pure NodeJS version, when we want to use an external dependency, we have to repeat the dependency name 3 times.

1. `require('express');`
2. `var express`
3. `express();`

In KlarkJS version, we define the dependency only once, as the parameter of the function.

#### Relative Path Avoidance

```javascript
// pure NodeJS
var mongooseConnector = require('./db/mongoose-connector.js');

// Kark JS
KlarkModule(module, 'app', function(dbMongooseConnector) { ...
```

In pure NodeJS version, we define the internal dependencies using the relative path from the current file location to the dependency's file location. This pattern generates an organization issue. When our source files increases, and we want to change the location of a file, we have to track all the files that depends on the this file, and change the relative path.
In KlarkJS version, we refer on the file with a unique name. The location of the file inside the source tree does not effect the inclusion process.

#### Code Guidance

The module registration function `KlarkModule` forces the programmer to follow a standard pattern for the module definition. For instance, we always know that the dependencies of the module are defined on the controller's parameters. In pure NodeJS the dependencies of the module can be written in many different ways.

## API

```javascript
var klark = require('klark-js');
klark.run();
```

### run([config])

Starts the Klark engine. It loads the files, creates the modules dependencies, instantiates the modules.

* `config` | `{Object}` | (optionally)
* return | `Promise<KlarkAPI>`

#### config

* `predicateFilePicker` | `Function -> Array<string>` | A function that returns the file path patterns that the modules are located. [Read more about the file patterns](https://github.com/sindresorhus/globby#globbing-patterns). Default:
```javascript
predicateFilePicker: function() {
  return [
    'plugins/**/index.js',
    'plugins/**/*.module.js'
  ];
}
```
* `globalRegistrationModuleName` | `String` | The name of the global function that registers the KlarkJS modules. Default: `KlarkModule`.
* `base` | `String` | The root location of the application. The `predicateFilePicker` search for files under the `base` folder. Default: `process.cwd()`.
* `logLevel` | `String` | The verbose level of KlarkJS logging. When we want to debug the module loading process, we can yield the logger on `high` and observe the sequence of loading. It is enumerated by:
    - high
    - middle
    - low
    - off (Default)
* `moduleAlias` | `Object<String, String>` | Alias name for the modules. If you provide an alias name for a module, you can either refer to it with the original name, or the alias name. For instance, we will could take a look on the Default object:
```javascript
moduleAlias: {
  '_': 'lodash'
}
```
When we define the alias name we can either refer on external library lodash either using the name `'lodash'`
```
KlarkModule(module, '..', function($lodash) {
```
or `'_'`
```
KlarkModule(module, '..', function(_) {
```

### KlarkJS Controller Function

```javascript
KlarkModule(module, 'myModule1', function($lodash, myModule2, $simpleNodeLogger) {
    return {
        doSomething: function() { return 'something'; }
    };
});
```

The KlarkJS function controller is the third argument on the KlarkModule registration. The argument names of the controller defines the dependencies.

#### Internal Dependencies

The internal dependencies should consist of camel case string. The name matches directly the name of the dependency module. In our case, if our argument variable is `myModule2`, the KlarkJS will search for the `myModule2` module. If the `myModule2` does not exists, an error will be thrown.

#### External Dependencies

We define the external dependencies with the prefix `$`. This way separates the external with the internal dependencies. The KlarkJS engine translate the real name from the argument and searches on the node_modules to find the package. An error will be thrown if the package does not exists. The name resolution process is the following:

|Argument|Real Name|
|---|---|
|$lodash|lodash|
|$simpleNodeLogger|simple-node-logger|

#### Return Value

A KlarkJS module instance is the result of the return value of the controller function. It is somehow similar on the `module.exports`. For example, the instance of the KlarkJS module 'myModule1' will be the object:

```javascript
{
    doSomething: function() { return 'something'; }
}
```

### KlarkAPI

#### getModule(name)

Searches on the internal and the external modules.

* `name` `String`. The name of the module.
* return: the instance of the module.

#### getInternalModule(name)

Searches on the internal modules.

* `name` `String`. The name of the module.
* return: the instance of the module.

#### getExternalModule(name)

Searches on the external modules.

* `name` `String`. The name of the module.
* return: the instance of the module.

#### injectInternalModuleFromMetadata(moduleName, controller)

Creates and inserts in the internal dependency chain a new module with the name `moduleName` and the controller `controller`.

* `moduleName` `String`. The name of the module.
* `controller` `Function`. The controller of the module.
* return: `Promise<ModuleInstance>`

#### injectInternalModuleFromFilepath(filepath)

Creates and inserts in the internal dependency chain a new module from the file on `filepath`.
The content of the file file should follow the KlarkJS module registration pattern.

* `filepath` `String`. The filepath of the file.
* return: `Promise<ModuleInstance>`

#### injectExternalModule(name)

Creates and inserts in the external dependency chain a new module with the name `moduleName`.
This module should already exists in the external dependencies (*nome_modules*)

* `name` `String`. The name of the module.
* return: the instance of the module.

#### getApplicationDependenciesGraph()

Returns the internal and external dependencies of the application's modules in a graph form.

* return:
```javascript
{
    innerModule1: [
        {
            isExternal: true,
            name: 'lodash'
        }
    ],
    innerModule2: [
        {
            isExternal: false,
            name: 'innerModule1'
        }
    ]
}
```

#### config

Access the klark [configuration object](#config)

## Plugin System

We can take advantage of the injection API methods and plug-in modules on the fly.
Those modules can either be loaded from a file in the file system, or from a pure JS function.

## Unit Tests

From the bibliography, there are many ways to structure the unit testing process.
We will Follow a common used pattern that works fine on a large-scale source code tree.
Essentially, we will test each plugin separately. In order to accomplish the isolated testing,
we will create at least one testing file on each plugin. For instance, our `/plugins/db/mongoose-connector/`
folder could consists from the following files:

* `index.js`, that contains the functionality of mongoose-connector.
* `index-test.js`, that tests the `index.js` functionality.

Example of `index-test.js`:

```javascript
var $$dbMongooseConnector;
var $$_;
var expect;

KlarkModule(module, 'dbMongooseConnectorTest', function($chai, $_, dbMongooseConnector) {
  $$dbMongooseConnector = dbMongooseConnector;
  $$_ = $_;
  expect = $chai.expect;
});

describe('dbMongooseConnector', function() {
    it('Should provide a connect function', function() {
        expect($$_.isFunction($$dbMongooseConnector.connect)).to.equal(true);
    });
});
```

For consistency all the unit testing files should postfixed by the `-test` name.
If we follow the above pattern, we can easily modify the KlarkJS `predicateFilePicker`
(@see [config](#config)), to exclude the `-test` files when we run the application,
and include the `-test` files when we are testing the application.

```javascript
klark.run({
    predicateFilePicker: function() {
        var files = ['plugins/**/index.js'];
        if (isTesting) {
            files = files.concat('plugins/**/*-test.js');
        }
        return files;
    }
});
```

## KlarkJS Development

* `npm test`. Runs the tests located on `/test` folder.
* `npm run coverage`. Runs the test coverage tool and extracts the results on `/coverage` folder.

## References

* [Architect JS](https://github.com/c9/architect)
* [Angular Dependency Injection](https://docs.angularjs.org/guide/di)
* [Wiki Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection)
