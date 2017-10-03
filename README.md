BIMP-UI
====

BIMP is a graphical user interface for [QBP Business Process Simulator](http://www.qbp-simulator.com) simulation service.

BIMP provides a siplistic yet complete front end to:
- Upload and parse business process models in standard BPMN 2.0 format
- Collect simulation scenario specific data from user for the business prcessmodel
- Run the simulation scenario
- Show and visualize the simulation results e.g. waiting times, resource utilization and etc
- Show a heatmap of process element weights based on several measures
- Save scenario
- Save simulation results as into BPMN, as MXML logs or as CSV file

BIMP Backend / Access / Limitations
------------
BIMP backend runs on QBP Business Process Simulator backend. BIMP by default uses limited account in the backend simulation service and large-scale simulatation cannot be conducted. Contact info@qbp-simulator.com for more information about full access.

Consuming BIMP
------------

The easiest way to use BIMP is to build it and run it.
Steps:
- run the following commands to generate the package bundle and sample app into ./dist folder
```
npm install
gulp
```
- See ./dist/ folder for the sample app and dependencies. index.html is the entry point to the application that initializes BIMP.
- For distribution you need heatmapViewer.html, bpmnViewer.html and ./css/* files from ./dist
- See "Configuration options" for bimpConfig configuration object.


Or you can use BIMP in npm packag. See notes below about a few manual dependencies that are needed.

Install BIMP from npm:
```
npm install --save bimp-ui
```

Assuming you have a HTML element with id 'root-container' on your page somewhere. E.g. <div id='root-container'></div>.

```
import * as Bimp from 'bimp-ui'

window.addEventListener('DOMContentLoaded', function () {
    Bimp.init('root-container', bimpConfig);
}, true);
```


See "Configuration options" for bimpConfig configuration object.

Add CSS stylesheet to your site:
```
<link href="./resources/css/style.css" rel="stylesheet" type="text/css" />
```

Also, you need the following files to be included on your site (opened to launc BPMN viewer and heatmap):
example/heatmapViewer.html, example/bpmnViewer.html

You can set the files to initialize Bimp with by passing in an argument to init function:

```
// initial set of files to be loaded. Name - file name, contents - file BPMN content
var initialFiles = [
    {
        name: 'file1.bpmn',
        contents: '<?xml ... '
    },
    {
        name: 'file2.bpmn',
        contents: '<?xml ... '
    }
];
Bimp.init('root-container', bimpConfig, initialFiles);
```


To get file contents back from Bimp then you can use the following function. First you can specify a boolean
value in the first argument if you want to include simuation results as well or only scenario information:
```
var files = Bimp.getUpdatedFiles(includeResults);
files.forEach(f => {
  console.log(f.name);
  console.log(f.contents);
}
```


If you want to start start simulation programatically, then after BPMN files have been loaded, call:
```
Bimp.startSimulation(mxmlLog);
```
The first parameters is a boolen indicating whether MXML logs should be created.



To get state of the application (page, simulation status and etc), call:
```
var state = Bimp.getState();
```

Additional dependencies if consuming bimp-ui from NPM
------------

Add the following packages to your NPM package using command:
```
npm install --save-dev css-loader postcss-loader postcss-cssnext postcss-each postcss-import postcss-mixins style-loader
```

Copy following files to your NPM package root folder from:
```
resources/postcss.config.js
resources/theme-vars.js
```

If you are using Webpack, then add the css-loader with postcss-loader for files with .css extensions:

```
        ...
        module: {
            rules: [
                ...
                {
                    test: /\.css$/,
                    use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                            sourceMap: true,
                            importLoaders: 1,
                            localIdentName: "[name]--[local]--[hash:base64:8]"
                        }
                    },
                    "postcss-loader" // has separate config, see postcss.config.js nearby
                    ]
                },
                ...
            ]
        },
        ...
```


Configuration options
------------

```
var bimpConfig = {
    // Protocol for Simulation Service
    protocol: "http://",
    // Hostname and port where RESTful Simulation Service is hosted
    host: "www.qbp-simulator.com:8080", // or: window.location.hostname + ":8080"
    // Path to the Simulation endpoint in the service
    url: "/qbp-simulator/rest/Simulation",
    // Basic AUTH token. BASE64 encoded string containing: 'username:password'
    authtoken: "",
    // Relative path prefix to BPMN and Heatmap viewer files (bpmnViewer.html and heatmapViewer.html) to be opened when requested.
    linkPrefix: ""
};
```

Tooling and building
----------------

BIMP UI is written in Typescript and built on React framework.

If you do not have gulp installed, then run:
```
npm install -g gulp
```

To create the bundles run:
```
npm install
gulp
```



Simulation scenario is embedded to the BPMN file following schema: QBPSchema.xsd
QBP Business Process Simulator RESTful service API schema is defined in: ApiSchema201212.xsd

Schema definition files need to be generated when either of the schema is changed.

This can be done by doing the following:
- start webpack dev server with ```npm start```
- run npm script: ```npm run xsdgen```


License
=======

[The MIT License](https://raw.githubusercontent.com/qbpsimulator/bimp-ui/master/LICENSE)

Copyright (c) 2017 Madis Abel
info@qbp-simulator.com

