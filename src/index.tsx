import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/core/styles'

import ApplicationPage from './components/ApplicationPage'
import BPMNViewerPage from './components/BPMNViewerPage'
import { Config } from './types/Config'
import { store } from './store'
import * as ApplicationAction from './actions/ApplicationAction'
import { FileDefinition } from './types'
import BPMNUpdater from './model-components/BPMNUpdater'
import { ProcessSimulationInfo } from './model-components/ProcessSimulationInfo'
import { theme } from './theme'

const BPMNViewer = () => <BPMNViewerPage />
const HeatmapViewer = () => <BPMNViewerPage showHeatmap={true} />

const defaultConfig: Config = {
    protocol: 'https://',
    host: 'api.qbp-simulator.com',
    url: '/rest/v1/Simulation',
    linkPrefix: '',
    errorStackApiKey: ''
}

interface MainAppWrapperProps {
    readonly config: Config
    readonly initialFiles: Array<FileDefinition>
}

class MainAppWrapper extends React.PureComponent<MainAppWrapperProps, undefined> {
    constructor(props: MainAppWrapperProps) {
        super(props)
        store.dispatch(ApplicationAction.init(this.props.config, this.props.initialFiles))
    }

    render() {
        return <ApplicationPage />
    }
}

/**
 * Initialize UI.
 * @param containerId target selector where to render the UI
 * @param config configuration object
 * @param initialFiles array of initial files to load. format: [{ name: "filename.bpmn", contents: "<?xml.. file contents" }]
 */
export function init(containerId: string, config: Config = defaultConfig, initialFiles: Array<FileDefinition> = undefined) {
    ReactDOM.render(<BimpApp config={config} />, document.getElementById(containerId))
}

export interface BimpAppProps {
    config?: Config
    initialFiles?: Array<FileDefinition>
    routePrefix?: string
}
export const BimpApp = (props: BimpAppProps) => {
    const { config, initialFiles, routePrefix } = props
    return (
        <ThemeProvider theme={theme}>
            <Provider store={store}>
                <div id="react-root">
                    <BrowserRouter>
                        <Switch>
                            <Route path="*bpmnViewer*" component={BPMNViewer} />
                            <Route path="*heatmapViewer*" component={HeatmapViewer} />
                            <Route
                                path={`${routePrefix}/`}
                                component={() => <MainAppWrapper config={config} initialFiles={initialFiles} />}
                            />
                        </Switch>
                    </BrowserRouter>
                </div>
            </Provider>
        </ThemeProvider>
    )
}
BimpApp.defaultProps = {
    config: defaultConfig,
    routePrefix: ''
}

/**
 * Get updated files from BIMP
 * @param includeResults whether to embed simulation results or not
 */
export function getUpdatedFiles(includeResults: boolean): Array<FileDefinition> {
    const currentParser = store.getState().application.activeParser
    const currentSimInfo = store.getState().modelSimInfo

    return store.getState().application.parsers.map((parser) => {
        const updater = new BPMNUpdater(parser)
        let modelSimInfo

        if (currentParser != parser) {
            modelSimInfo = ProcessSimulationInfo.createSimInfoWithDefaultsFromAnother(currentSimInfo, parser.getQbpSimulationInfo())
        } else {
            modelSimInfo = currentSimInfo
        }

        const docStr = updater.getUpdatedDocumentAsString(modelSimInfo, includeResults ? store.getState().simulation.results : null)

        return {
            name: parser.getFileName(),
            contents: docStr
        }
    })
}

/**
 * Get state of the application
 */
export function getState() {
    return store.getState()
}

/**
 * Start simulation
 * @param mxmlLog whether the MXML log will be created or not
 */
export function startSimulation(mxmlLog: boolean = false) {
    ApplicationAction.startSimulation(mxmlLog)
}
