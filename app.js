const { Bimp } = require('./src/Bimp')

var bimpConfig = {
    // Protocol for Simulation Service
    protocol: 'https://',
    // Hostname and port where RESTful Simulation Service is hosted
    // host: "qbp-simulator.com:8080", // or: window.location.hostname + ":8080"
    host: 'api.qbp-simulator.com', // or: window.location.hostname + ":8080"
    // Path to the Simulation endpoint in the service
    url: '/rest/v1/Simulation',
    // Relative path prefix to BPMN and Heatmap viewer files (bpmnViewer.html and heatmapViewer.html) to be opened when requested.
    linkPrefix: '',
    // API key for errorstack.com error reporting
    errorStackApiKey: 's',
    // jwtAuth: {
    //     token: 'api access token if known'
    // },
    // Credentials for basic auth, if applicable
    basicAuth: {
        username: 'limited',
        password: 'limited'
    }
}

var urlParams = new URLSearchParams(window.location.search)
// init with postMessage
if (urlParams.get('post-init')) {
    window.addEventListener('message', function (message) {
        var content = JSON.parse(message.data)

        if (content.type === 'INIT') {
            var file = {
                name: content.fileName,
                contents: atob(content.fileContent)
            }

            Bimp.init('root-container', bimpConfig, [file])
        }
    })
} else {
    // auto init
    window.addEventListener(
        'DOMContentLoaded',
        function () {
            Bimp.init('root-container', bimpConfig)
        },
        true
    )
}
