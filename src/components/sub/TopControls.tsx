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

interface Props extends Types.DispatchProps {
    page: string;
    simulationId: string;
    mxmlGenerated: boolean;
    activeParser: BPMNParser;
}

interface State {
}

const initialState: State = {
}

export default class TopControls extends React.Component<Props, State> {

    constructor (props: Props) {
        super(props);

        this.state = initialState;
    }

    private serializeAndSaveFile(includeResults: boolean) {
        const updater = new BPMNUpdater(this.props.activeParser);
        const docStr = updater.getUpdatedDocumentAsString(
            store.getState().modelSimInfo,
            includeResults ? store.getState().simulation.results : null);

        if (process.env.NODE_ENV !== 'production') {
            console.log(docStr);
        }
        let blob = new Blob([docStr], { type: 'text/xml' });
        FileSaver.saveAs(blob, this.props.activeParser.getFileName());
    }

    onSaveFileButtonClicked = (e) => {
        this.serializeAndSaveFile(false);
    };

    onSaveResultsButtonClicked = (e) => {
        this.serializeAndSaveFile(true);
    };

    onUploadNewModelClicked = (e) => {
        this.props.dispatch(Actions.setNewPage('upload'));
    };

    onBackToEditDataClicked = (e) => {
        this.props.dispatch(Actions.setNewPage('scenario'));
    };

    onDownloadMXMLClicked = () => {
        const rh = new RequestHandler();
        rh.downloadSimulationResultsMxml(this.props.simulationId);
    }

    onDownloadCSVClicked = () => {
        const rh = new RequestHandler();
        rh.downloadSimulationResultsCsv(this.props.simulationId);
    }

    private onOpenBpmnViewerClicked = (e) => {
        BPMNViewerPage.openBpmnViewer();
    }

    private onOpenHeatmapViewerClicked = (e) => {
        BPMNViewerPage.openHeatmapViewer();
    }

    private onActiveBPMNFileChanged = (value) => {
        const allParsers = store.getState().application.parsers;

        this.props.dispatch(Actions.setActiveParser(allParsers.find(p => p.getFileName() === value)));
    };

    render() {
        const allParsers = store.getState().application.parsers;
        const parser = this.props.activeParser;

        const loadedFilesDropdownSource = allParsers.map(parser => ({
            value: parser.getFileName(),
            label: parser.getFileName()
        }));

        const results = this.props.page == 'results';
        return (<div>
            <div className="currentFile">
                <TooltipDropdown
                    source={loadedFilesDropdownSource}
                    tooltip="Select one of the uploaded BPMN files to edit."
                    label="Active BPMN file"
                    allowBlank={false}
                    value={parser.getFileName()}
                    onChange={this.onActiveBPMNFileChanged}
                    disabled={allParsers.length <= 1}
                />
            </div>

            {!results && <button id="uploadNewFile" className="button" onClick={this.onUploadNewModelClicked} title="Discard the current model and start editing a new one">Upload a new model</button>}
            {!results && <button id="saveFileButton" type="button" onClick={this.onSaveFileButtonClicked} className="button saveFileButton" title="Save the current model with simulation information to your computer">Save scenario</button>}
            {!results && <button id="viewModelButton" type="button" onClick={this.onOpenBpmnViewerClicked} className="button">View BPMN Diagram</button>}
            {results && <button id="viewModelHeatmapButton" type="button" className="button" onClick={this.onOpenHeatmapViewerClicked}>BPMN Diagram with results heat map</button>}
            {results && !!this.props.simulationId &&
                <button id="downloadCsv" onClick={this.onDownloadCSVClicked} className="button" title="Download results in CSV file">Download CSV</button>}
            {results && !!this.props.simulationId && this.props.mxmlGenerated &&
                <button id="downloadLog" onClick={this.onDownloadMXMLClicked} className="button" title="Download g-zipped MXML log">Download MXML</button>}
            {results && <button id="saveFileButton2" className="button saveFileButton" onClick={this.onSaveFileButtonClicked} title="Save the current model with simulation information to your computer">Save scenario</button>}
            {results && <button id="saveResultsButton" className="button saveResultsButton" onClick={this.onSaveResultsButtonClicked} title="Save the current simulation results with simulation information to your computer">Save results</button>}
            {results && <button id="backToEditData" className="button" onClick={this.onBackToEditDataClicked} title="Go back and modify the simulation specific information">Back to edit data</button>}
        </div>);
    }
}