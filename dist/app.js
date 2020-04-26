var bimpConfig = {
    // Protocol for Simulation Service
    protocol: "https://",
    // Hostname and port where RESTful Simulation Service is hosted
    host: "api.qbp-simulator.com",
    // Path to the Simulation endpoint in the service
    url: "/rest/v1/Simulation", // or just /Simulation on localhost
    // Credentials for obtaining JWT Token
    // jwtAuth: {
    //     // token: "jwt auth token if known"
    // },
    // Credentials for basic auth, if applicable
    basicAuth: {
        username: "limited",
        password: "limited"
    },
    // Relative path prefix to BPMN and Heatmap viewer files (bpmnViewer.html and heatmapViewer.html) to be opened when requested.
    linkPrefix: "",
    // API key for errorstack.com error reporting
    errorStackApiKey: ""
};

// Allow config to be passed via JSON in query string
var bimpConfigParam = new URLSearchParams(window.location.search).get('bimpConfig');
if (bimpConfigParam) {
    bimpConfig = Object.assign(bimpConfig, JSON.parse(bimpConfigParam));
}

// sample initial set of files to be loaded
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


var urlParams = new URLSearchParams(window.location.search);
// init with postMessage
if (urlParams.get("post-init")) {
    window.addEventListener("message", function (message) {
        var content = JSON.parse(message.data);
        if (content.type === "INIT") {
            var file = {
                name: content.fileName,
                contents: atob(content.fileContent)
            }

            Bimp.init('root-container', bimpConfig, [file]);
        }
    });
}
else {
    // auto init
    window.addEventListener('DOMContentLoaded', function () {
            Bimp.init('root-container', bimpConfig);
        },
        true
    );
}

