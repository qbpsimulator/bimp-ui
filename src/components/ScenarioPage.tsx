import * as React from 'react'
import { connect } from 'react-redux'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Button from '@material-ui/core/Button'

import * as Actions from '../actions'
import * as Store from '../store'
import * as Types from '../types'

import { TooltipCheckbox } from './sub/CoreComponents'
import { CatchEvents } from './sub/CatchEvents'
import { DurationDistribution } from './sub/DurationDistribution'
import { Gateways } from './sub/Gateways'
import { Resources } from './sub/Resources'
import { SimulationSpec } from './sub/SimulationSpec'
import { Tasks } from './sub/Tasks'
import { TimeTables } from './sub/TimeTables'

import SimulationStatusDialog from './sub/SimulationStatusDialog'
import RequestHandler from '../model-components/RequestHandler'

import './ScenarioPage.sass'

interface Props {
    application: Types.ApplicationType
    modelSimInfo: Types.ProcessSimulationInfoType
    simulation: Types.SimulationType
}

interface State {
    mxmlLog: boolean
    allValidated: boolean
    errorBarShowing: boolean
}

const initialState: State = {
    mxmlLog: false,
    allValidated: false,
    errorBarShowing: false
}

const mapStateToProps = (state: Types.StoreType): Props => ({
    application: state.application,
    modelSimInfo: state.modelSimInfo,
    simulation: state.simulation
})

class ScenarioPage extends React.Component<Props & Types.DispatchProps, State> {
    constructor(props: Props & Types.DispatchProps) {
        super(props)

        this.state = initialState
    }

    onStartSimulationButtonClick = () => {
        const validator = this.props.application.validator
        const isValid = validator.validateAll()

        if (this.state.allValidated !== isValid || !isValid)
            this.setState({ ...this.state, allValidated: isValid, errorBarShowing: !isValid })

        if (isValid) {
            Actions.startSimulation(this.state.mxmlLog)
        }
    }

    onInputChange = (name: string, value: any) => {
        this.setState({ ...this.state, [name]: value })
    }

    handleErrorBarDismiss = () => {
        this.setState({ ...this.state, errorBarShowing: false })
    }

    render() {
        const parser = this.props.application.activeParser

        const firstError = this.props.application.validator.getErrors().length ? this.props.application.validator.getErrors()[0] : ''
        return (
            <div className="section">
                <div id="data-input">
                    <form action="">
                        <SimulationSpec
                            modelSimInfo={this.props.modelSimInfo}
                            dispatchModelSimInfoChange={this.props.dispatchModelSimInfoChange}
                            mxmlLog={this.state.mxmlLog}
                        />
                        <Resources
                            resources={this.props.modelSimInfo.resources}
                            timetables={this.props.modelSimInfo.timetables}
                            dispatch={this.props.dispatch}
                        />
                        <TimeTables timetables={this.props.modelSimInfo.timetables} dispatch={this.props.dispatch} />
                        <Tasks
                            resources={this.props.modelSimInfo.resources}
                            elements={this.props.modelSimInfo.elements}
                            tasks={parser.getTasks()}
                            currency={this.props.modelSimInfo.currency}
                            dispatch={this.props.dispatch}
                            dispatchElementSimInfoChange={this.props.dispatchElementSimInfoChange}
                            processIds={this.props.application.allProcessIds}
                        />
                        <Gateways
                            sequenceFlows={this.props.modelSimInfo.sequenceFlows.sequenceFlow}
                            gateways={parser.getGateways()}
                            dispatch={this.props.dispatch}
                        />
                        <CatchEvents
                            elements={this.props.modelSimInfo.elements}
                            catchEvents={parser.getCatchEvents()}
                            dispatchElementSimInfoChange={this.props.dispatchElementSimInfoChange}
                        />
                    </form>
                </div>
                <div className="has-text-centered">
                    <TooltipCheckbox
                        checked={this.state.mxmlLog}
                        label="Generate a MXML log"
                        onChange={(v, checked) => this.onInputChange('mxmlLog', checked)}
                        tooltip="Generates simulation logs in MXML format. Simulation takes much more time if selected. MXML is a format to store event logs using an XML-based syntax. The logs could be analyzed with other process mining tools."
                        color="primary"
                    />
                </div>
                <div id="submit-button" className="has-text-centered">
                    <button className="button is-primary is-large" onClick={this.onStartSimulationButtonClick}>
                        Start Simulation
                    </button>
                </div>
                <br />
                <Snackbar
                    open={this.state.errorBarShowing}
                    onClose={this.handleErrorBarDismiss}
                    message={'There appears to be a problem with simulation scenario. Please correct the errors: ' + firstError}
                    autoHideDuration={5000}
                    action={
                        <React.Fragment>
                            <Button color="secondary" size="small" onClick={this.handleErrorBarDismiss}>
                                Dismiss
                            </Button>
                            <IconButton size="small" aria-label="close" color="inherit" onClick={this.handleErrorBarDismiss}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </React.Fragment>
                    }
                />
                <SimulationStatusDialog
                    simulation={this.props.simulation}
                    lastModelData={RequestHandler.getLastRequestData()}
                    errorStackApiKey={this.props.application.config.errorStackApiKey}
                />
            </div>
        )
    }
}

export default connect(mapStateToProps, Actions.DefaultDispatchToProps)(ScenarioPage)
