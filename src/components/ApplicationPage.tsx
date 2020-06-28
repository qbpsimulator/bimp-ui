import * as React from 'react'
import { connect } from 'react-redux'

import UploadPage from './UploadPage'
import ScenarioPage from './ScenarioPage'
import SimulationResultsPage from './SimulationResultsPage'
import TopControls from './sub/TopControls'

import * as Actions from '../actions'
import * as Types from '../types'
import * as Store from '../store'

import RequestHandler from '../model-components/RequestHandler'

// declare var window;
// window.Perf = require('react-addons-perf');

interface Props {
    app: Types.ApplicationType
    currency: string
    simulation: Types.SimulationType
    resources: Types.ProcessSimulationInfoTypeResourcesType
}

const mapStateToProps = (state: Types.StoreType) => ({
    app: state.application,
    resources: state.modelSimInfo.resources,
    simulation: state.simulation,
    currency: state.modelSimInfo.currency
})
class Application extends React.Component<Props & Types.DispatchProps, void> {
    private timeout: any

    componentDidUpdate(prevProps: Props) {
        // new simulation, start timer
        if (
            this.props.simulation &&
            this.props.simulation.id &&
            (!prevProps.simulation || this.props.simulation.id !== prevProps.simulation.id)
        ) {
            this.timeout = setTimeout(this.simulationTimer, 2000)
        }

        if (
            !!this.timeout &&
            !!this.props.simulation &&
            !!this.props.simulation.status &&
            (this.props.simulation.status.status === 'COMPLETED' || this.props.simulation.status.status === 'FAILED')
        ) {
            this.timeout = null
        }
    }

    render() {
        return (
            <div className="bimp-page-container container">
                {this.props.app.page === 'upload' && <UploadPage />}
                {(this.props.app.page === 'scenario' || this.props.app.page === 'results') && (
                    <TopControls
                        dispatch={this.props.dispatch}
                        page={this.props.app.page}
                        simulationId={this.props.simulation.id}
                        mxmlGenerated={this.props.simulation.mxmlRequested}
                        activeParser={this.props.app.activeParser}
                    />
                )}
                {this.props.app.page === 'scenario' && <ScenarioPage />}
                {this.props.app.page === 'results' && (
                    <SimulationResultsPage
                        simulation={this.props.simulation}
                        resources={this.props.resources}
                        currency={this.props.currency}
                    />
                )}
            </div>
        )
    }

    simulationTimer = () => {
        const simId = this.props.simulation.id
        if (!simId) return

        let rq = new RequestHandler()

        rq.getSimulationStatus(simId).then(() => {
            if (this.props.simulation.status.status !== 'COMPLETED' && this.props.simulation.status.status !== 'FAILED') {
                this.timeout = setTimeout(this.simulationTimer, 2000)
            }
        })
    }
}

export default connect(mapStateToProps, Actions.DefaultDispatchToProps)(Application)
