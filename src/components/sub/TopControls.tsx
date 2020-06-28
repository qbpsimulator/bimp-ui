import * as React from 'react'
import * as FileSaver from 'file-saver'
import { TooltipDropdown } from './CoreComponents'

import * as BPMNViewerPage from '../BPMNViewerPage'
import BPMNParser from '../../model-components/BPMNParser'
import BPMNUpdater from '../../model-components/BPMNUpdater'
import RequestHandler from '../../model-components/RequestHandler'

import * as Actions from '../../actions'
import * as Types from '../../types'

import { store } from '../../store'

import './TopControls.sass'

interface Props extends Types.DispatchProps {
    page: string
    simulationId: string
    mxmlGenerated: boolean
    activeParser: BPMNParser
}

interface State {}

const initialState: State = {}

export default class TopControls extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = initialState
    }

    private serializeAndSaveFile(includeResults: boolean) {
        const updater = new BPMNUpdater(this.props.activeParser)
        const docStr = updater.getUpdatedDocumentAsString(
            store.getState().modelSimInfo,
            includeResults ? store.getState().simulation.results : null
        )

        let blob = new Blob([docStr], { type: 'text/xml' })
        FileSaver.saveAs(blob, this.props.activeParser.getFileName())
    }

    onSaveFileButtonClicked = (e) => {
        this.serializeAndSaveFile(false)
    }

    onSaveResultsButtonClicked = (e) => {
        this.serializeAndSaveFile(true)
    }

    onUploadNewModelClicked = (e) => {
        this.props.dispatch(Actions.setNewPage('upload'))
    }

    onBackToEditDataClicked = (e) => {
        this.props.dispatch(Actions.setNewPage('scenario'))
    }

    onDownloadMXMLClicked = () => {
        const rh = new RequestHandler()
        rh.downloadSimulationResultsMxml(this.props.simulationId)
    }

    onDownloadCSVClicked = () => {
        const rh = new RequestHandler()
        rh.downloadSimulationResultsCsv(this.props.simulationId)
    }

    private onOpenBpmnViewerClicked = (e) => {
        BPMNViewerPage.openBpmnViewer()
    }

    private onOpenHeatmapViewerClicked = (e) => {
        BPMNViewerPage.openHeatmapViewer()
    }

    private onActiveBPMNFileChanged = (value) => {
        const allParsers = store.getState().application.parsers

        this.props.dispatch(Actions.setActiveParser(allParsers.find((p) => p.getFileName() === value)))
    }

    render() {
        const allParsers = store.getState().application.parsers
        const parser = this.props.activeParser

        const loadedFilesDropdownSource = allParsers.map((parser) => ({
            value: parser.getFileName(),
            label: parser.getFileName()
        }))

        const results = this.props.page == 'results'
        return (
            <div className="section">
                <div className="container">
                    <div className="container">
                        <TooltipDropdown
                            source={loadedFilesDropdownSource}
                            tooltip="Select one of the uploaded BPMN files to edit."
                            label="Active BPMN file"
                            value={parser.getFileName()}
                            onChange={(e) => this.onActiveBPMNFileChanged(e.target.value)}
                            disabled={allParsers.length <= 1}
                        />
                    </div>
                    {!results && (
                        <div>
                            <button id="viewModelButton" onClick={this.onOpenBpmnViewerClicked} className="button is-primary">
                                View BPMN Diagram
                            </button>
                            <button
                                id="saveFileButton"
                                onClick={this.onSaveFileButtonClicked}
                                className="button is-primary is-pulled-right"
                                title="Save the current model with simulation information to your computer"
                            >
                                Save scenario
                            </button>
                            <button
                                id="uploadNewFile"
                                className="button is-pulled-right is-primary"
                                onClick={this.onUploadNewModelClicked}
                                title="Discard the current model and start editing a new one"
                            >
                                Upload a new model
                            </button>
                        </div>
                    )}

                    {results && (
                        <div>
                            <button id="viewModelHeatmapButton" className="button is-primary" onClick={this.onOpenHeatmapViewerClicked}>
                                BPMN Diagram with results heat map
                            </button>
                            <button
                                id="saveResultsButton"
                                className="button is-primary"
                                onClick={this.onSaveResultsButtonClicked}
                                title="Save the current simulation results with simulation information to your computer"
                            >
                                Save results
                            </button>
                            <button
                                id="backToEditData"
                                className="button is-pulled-right is-primary"
                                onClick={this.onBackToEditDataClicked}
                                title="Go back and modify the simulation specific information"
                            >
                                Back to edit data
                            </button>
                            <button
                                id="saveFileButton2"
                                className="button is-pulled-right is-primary"
                                onClick={this.onSaveFileButtonClicked}
                                title="Save the current model with simulation information to your computer"
                            >
                                Save scenario
                            </button>

                            {!!this.props.simulationId && (
                                <button
                                    id="downloadCsv"
                                    onClick={this.onDownloadCSVClicked}
                                    className="button is-pulled-right is-primary"
                                    title="Download results in CSV file"
                                >
                                    Download CSV
                                </button>
                            )}
                            {!!this.props.simulationId && this.props.mxmlGenerated && (
                                <button
                                    id="downloadLog"
                                    onClick={this.onDownloadMXMLClicked}
                                    className="button is-pulled-right is-primary"
                                    title="Download g-zipped MXML log"
                                >
                                    Download MXML
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )
    }
}
