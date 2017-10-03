var bimpConfig = {
    // Protocol for Simulation Service
    protocol: "http://",
    // Hostname and port where RESTful Simulation Service is hosted
    host: "www.qbp-simulator.com:8080", // or: window.location.hostname + ":8080"
    // Path to the Simulation endpoint in the service
    url: "/qbp-simulator/rest/Simulation",
    // Basic AUTH token. BASE64 encoded string containing: 'username:password'
    authtoken: "bGltaXRlZDpsaW1pdGVk",
    // Relative path prefix to BPMN and Heatmap viewer files (bpmnViewer.html and heatmapViewer.html) to be opened when requested.
    linkPrefix: "",
    // API key for errorstack.com error reporting
    errorStackApiKey: ""
};

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

window.addEventListener('DOMContentLoaded', function () {
        Bimp.init('root-container', bimpConfig /*, initialFiles */);
    },
    true
);

