import * as React from 'react'
import { connect } from 'react-redux'
import Dialog from 'react-toolbox/lib/dialog'
import Snackbar from 'react-toolbox/lib/snackbar'
import { TooltipDropdown } from './sub/CoreComponents'

import * as Actions from '../actions'
import * as Store from "../store";
import * as Types from "../types";
import { Utils } from '../model-components/Utils'

import BPMNParser from '../model-components/BPMNParser'


interface Props {
    errorStackApiKey: string;
    uploadedFileContents: Array<Types.FileDefinition>;
}

interface State {
    loadedFiles: Array<File>;
    dragging: boolean;
    errorBarShowing: boolean;
    warningDialogShowing: boolean;
    firstError: string;
    errorSent: boolean;
    missingProcessDefinitions?: Array<{
        id: string;
        callerName: string;
        callerFilename: string;
    }>;
    simulationEntryFilename: string;
    simulationEntryFilenameError: string;
}

const initialState: State = {
    loadedFiles: [],
    dragging: false,
    errorBarShowing: false,
    warningDialogShowing: false,
    firstError: '',
    errorSent: false,
    simulationEntryFilename: '',
    simulationEntryFilenameError: undefined
}

declare var bimp: any;

const mapStateToProps = (state: Types.StoreType) => ({
    errorStackApiKey: state.application.config.errorStackApiKey,
    uploadedFileContents: state.application.uploadedFileContents
});

class UploadPage extends React.Component<Props & Types.DispatchProps, State> {

    private _parsers: Array<BPMNParser>;

    constructor(props: Props & Types.DispatchProps) {
        super(props)

        this.state = initialState;
    }

    componentWillMount() {
        let uploadedFileName = '';
        let uploadedFileContent = '';
        try {
            if (this.props.uploadedFileContents) {
                const parsers = this.props.uploadedFileContents.map(f => new BPMNParser(f.contents, f.name));
                this.setParsers(parsers);
            }
            else {
                if ((typeof (bimp) !== 'undefined') && !!bimp.file && !!bimp.file.uploadeddata) {
                    uploadedFileName = bimp.file.uploadedfilename;
                    uploadedFileContent = atob(bimp.file.uploadeddata);
                }
                else if (!!window.opener && window.opener.fileContentForBimp) {
                    uploadedFileName = window.opener.fileNameForBimp;
                    uploadedFileContent = window.opener.fileContentForBimp;
                }

                if (uploadedFileName && uploadedFileContent) {
                    this.setParsers([new BPMNParser(uploadedFileContent, uploadedFileName)]);
                }
            }
        }
        catch (error) {
            console.warn('Unable to load data', error);
        }
    }

    setSelectedFiles(files: Array<File>): void {
        this.setState({...this.state, loadedFiles: this.state.loadedFiles.concat(files), dragging: false, errorSent: false});
    }

    onDragOver = (e: React.DragEvent<HTMLElement>) => {
        e.stopPropagation();
        e.preventDefault();

        this.setState({...this.state, dragging: e.type == "dragover" });
    }

    onDragLeave = (e: React.DragEvent<HTMLElement>) => this.onDragOver(e);

    onDrop = (e: React.DragEvent<HTMLElement>) => {
        e.stopPropagation();
        e.preventDefault();

        if (!e.dataTransfer || e.dataTransfer.files.length == 0)
            return;

        const files = [];
        for (let i = 0; i < e.dataTransfer.files.length; ++i) {
            let file = e.dataTransfer.files.item(i);
            files.push(file);
        }

        this.setSelectedFiles(files);
    }

    onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.files.length == 0)
            return;

        const files = [];
        for (let i = 0; i < e.currentTarget.files.length; ++i) {
            let file = e.currentTarget.files.item(i);
            files.push(file);
        }

        this.setSelectedFiles(files);
    }

    onContinueClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
        let loadedFiles = this.state.loadedFiles;

        if (this.state.loadedFiles.length > 1) {
            if (!this.state.simulationEntryFilename) {
                this.setState({...this.state, simulationEntryFilenameError: 'Value is required'});
                return;
            }

            loadedFiles = loadedFiles.sort((a, b) => (a.name === this.state.simulationEntryFilename ? -1 :
                (b.name === this.state.simulationEntryFilename ? 1 : 0)));
        }

        this.setParsers(loadedFiles.map(file =>
            new BPMNParser(file)
        ));
    }

    handleErrorBarDismiss = (event, instance) => {
        this.setState({...this.state, errorBarShowing: false });
    };

    handleWarningDialogDismissClick = () => {
        this.setState({...this.state, warningDialogShowing: false });
    }

    handleWarningDialogContinueClick = () => {
        this.continueToScenarioPage(true);
    }

    handleErrorSubmit = () => {
        if (!this.props.errorStackApiKey)
            return;

        this._parsers.forEach(parser => {
            Utils.ReportErrorStackError(this.props.errorStackApiKey,
                'parser',
                parser.getFileContents(),
                this.state.firstError)
            .then(() => {
                this.setState({...this.state, errorSent: true});
            })
            .catch(() => {
                this.setState({...this.state, errorSent: true});
            });
        });
    }

    private setError(error: string | Error) {
        let errorText = '';
        if (typeof(error) == 'string') {
            errorText = error;
        }
        else if (typeof(error) == 'object') {
            if (error.message) {
                errorText = error.message;
            }
        }

        if (!!error && !errorText) {
            errorText = 'An error occurred.'
        }

        if (errorText) {
            errorText = 'Unable to parse file. ' + errorText;
            this.setState({...this.state, errorBarShowing: true, firstError: errorText });
        }
    };

    private setParsers(parsers: Array<BPMNParser>) {
        this._parsers = parsers;
        this.initFromParsers();
    }

    private initFromParsers() {
        Promise.all(this._parsers.map(parser => parser.parse()))
            .then(() => {
                try {
                    this.continueToScenarioPage(false);
                }
                catch(err) {
                    console.error('failed to get data', err);
                    this.setError(err);
                }
            })
            .catch((err: Error) => {
                console.error("parse error", err);
                this.setError(err);
            });
    }

    private continueToScenarioPage(ignoreMissingActivities: boolean) {
        // check if all referenced processes by CallActivity elements are present
        if (!ignoreMissingActivities) {
            const allProcessDefinitions = new Map<string, { id: string, fileName: string}>();

            this._parsers.forEach(parser => {
                parser.getProcessDefinitions().forEach(process => {
                    if (allProcessDefinitions.has(process.id)) {
                        const previousDefinition = allProcessDefinitions.get(process.id);
                        throw new Error("Duplicate process definition for " + process.id + " in " + parser.getFileName() + ". Previously defined in " + previousDefinition.fileName + ".");
                    }

                    allProcessDefinitions.set(process.id, {
                        id: process.id,
                        fileName: parser.getFileName()
                    })
                });
            });

            let missingProcessDefinitions = [];
            this._parsers.forEach(parser => {
                parser.getCallActivities().forEach(activity => {
                    if (!allProcessDefinitions.has(activity.calledElement)) {
                        missingProcessDefinitions.push({
                            id: activity.calledElement,
                            callerName: activity.name,
                            callerFilename: parser.getFileName()
                        });
                    }
                });
            });

            if (missingProcessDefinitions.length > 0) {
                this.setState({...this.state,
                    missingProcessDefinitions: missingProcessDefinitions,
                    warningDialogShowing: true
                })

                return; ///// <----- EXIT
            }
        }

        this.props.dispatch(Actions.setParsers(this._parsers));

        if (process.env.NODE_ENV !== 'production') {
            this._parsers.forEach(parser => {
                console.log('file name:', parser.getFileName());
                console.log('model sim info:', parser.getQbpSimulationInfo());
                console.log('tasks:', parser.getTasks());
                console.log('gateways:', parser.getGateways());
                console.log('catch events:', parser.getCatchEvents());
                console.log('results:', parser.getQbpSimulationResults());
            });
        }

        const firstParser = this._parsers[0];
        this.props.dispatch(Actions.setActiveParser(firstParser));

        const loadedResults = firstParser.getQbpSimulationResults();
        if (loadedResults) {
            this.props.dispatch(Actions.loadSimulationResults(loadedResults));
            this.props.dispatch(Actions.setNewPage('results'));
        }
        else {
            this.props.dispatch(Actions.setNewPage('scenario'));
        }
    }

    private readonly WARNING_DIALOG_ACTIONS = [
        { label: 'Cancel', onClick: this.handleWarningDialogDismissClick },
        { label: 'Continue', onClick: this.handleWarningDialogContinueClick }
    ];

    private readonly _linkStyle = { color: 'inherit', textDecoration: 'underline' };

    render() {
        const fileNames = this.state.loadedFiles.length > 0 ? this.state.loadedFiles.map(f => f.name) : ['No file selected.'];
        const loadedFilesDropdownSource = fileNames.map(name => ({
            value: name,
            label: name
        }));

        const loadedFiles = fileNames.map(name => {
            return (<span id="fileName" className="smallFont" key={name}>
                {name}<br/>
            </span>);
        });

        const missingDefinitions = this.state.missingProcessDefinitions ?
            this.state.missingProcessDefinitions.map((p, index) => {
                const calledElement = p.id ? p.id : 'no calledElement attribute';
                return (
                    <li key={index}>
                        <strong>{calledElement}</strong> (referenced by <strong>{p.callerName}</strong> in <strong>{p.callerFilename}</strong>)
                    </li>)})
            : null;

        return (
        <div id="uploadPage" className="contents">
            <div className="qbp-toppositions" id="top-model-area">
                <div id="upload-area">
                    <h3>Upload your .BPMN file</h3>
                    <br/>
                    <form id="upload">
                        <fieldset>
                            <input type="hidden" id="MAX_FILE_SIZE" name="MAX_FILE_SIZE" value="300000" />
                            <div>
                                <label htmlFor="file-select">Select a file to add: </label>
                                <input type="file" id="file-select" name="fileData" onChange={this.onFileSelected} multiple />
                                <div id="file-drag" className={this.state.dragging ? "hover" : ""} onDragOver={this.onDragOver} onDragLeave={this.onDragLeave} onDrop={this.onDrop}>or drop it here</div>
                            </div>
                            {this.state.loadedFiles.length > 0 && <div>Loaded files:</div>}
                            <br/>
                            {loadedFiles}

                            {this.state.loadedFiles.length > 1 && <TooltipDropdown
                                source={loadedFilesDropdownSource}
                                tooltip="Select the BPMN file which is the main entry point to the simulation scenario."
                                label="Simulation entry point"
                                required
                                allowBlank={true}
                                error={this.state.simulationEntryFilenameError}
                                value={this.state.simulationEntryFilename}
                                onChange={this.onSimulationEntryFilenameChanged}
                            />}
                        </fieldset>
                    </form>
                    <button className="button" id="continue-button" disabled={!this.state.loadedFiles} onClick={this.onContinueClicked}>Continue</button>
                </div>
                <div id="instructions" className="moduletable">
                    <h3>Here are some instructions</h3>
                    <br/>
                    <ol>
                        <li>Select a valid BPMN 2.0 file, or more if you need process definitions from multiple files.</li>
                        <li>Press <b className="blue">"Continue"</b> in order to add/change simulation information.</li>
                        <li>Tick the <b className="blue">"Generate a log"</b> box if you want to be able to download simulation MXML log afterwards.</li>
                        <li>Click <b className="blue">"Start simulation"</b>.</li>
                        <li>Be amazed and wonder how such magic came to be.</li>
                    </ol>
                </div>
            </div>
            <Snackbar
                action='Dismiss'
                active={this.state.errorBarShowing}
                //timeout={5000}
                onClick={this.handleErrorBarDismiss}
                onTimeout={this.handleErrorBarDismiss}
                type='cancel'>
                <div>{this.state.firstError}</div>
                {this.props.errorStackApiKey &&
                    <div>
                        {this.state.errorSent && "Bug report sent. Thank you!"}
                        {!this.state.errorSent && <div>If you think you have found a bug, then please <a style={this._linkStyle} className="sendErrorLink" href="#" onClick={this.handleErrorSubmit}>click here</a> to send an error report including your .bpmn file for investigation.</div>}
                    </div>
                }
            </Snackbar>
            <Dialog
                actions={this.WARNING_DIALOG_ACTIONS}
                active={this.state.warningDialogShowing}
                onEscKeyDown={this.handleWarningDialogDismissClick}
                title='Warning'>
                <div>Unable to find BPMN &lt;process /&gt; definitions or 'calledElement' attribute referenced by the following BPMN &lt;callActivity /&gt; elements:</div>
                <ul>{missingDefinitions}</ul>
                <br/>
                <br/>
                <div>Missing &lt;callActivity /&gt; elements will be simulated as tasks.</div>
            </Dialog>
        </div>
        )
    }

    private onSimulationEntryFilenameChanged = (value: string) => {
        this.setState({...this.state, simulationEntryFilename: value, simulationEntryFilenameError: !!value ? undefined : this.state.simulationEntryFilenameError});
    }
}

export default connect(mapStateToProps, Actions.DefaultDispatchToProps)(UploadPage)