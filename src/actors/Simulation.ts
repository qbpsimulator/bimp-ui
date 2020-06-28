import { Dispatch } from 'redux'
import { StoreType } from '../types'
import * as Actions from '../actions'
import RequestHandler from '../model-components/RequestHandler'

let hadSimulationCompleted = false
export function fetchSimulationKPIsActor(state: StoreType, dispatch: Dispatch) {
    const isSimulationCompleted = !!state.simulation && !!state.simulation.status && state.simulation.status.status === 'COMPLETED'

    if (isSimulationCompleted != hadSimulationCompleted) {
        if (isSimulationCompleted) {
            const rh = new RequestHandler()
            rh.getSimulationResults(state.simulation.id)
        }

        hadSimulationCompleted = isSimulationCompleted
    }
}

let hadSimulationKPIs = false
export function fetchSimulationHistogramDataActor(state: StoreType, dispatch: Dispatch) {
    const hasSimulationKPIs = !!state.simulation && !!state.simulation.results && !!state.simulation.results.Results

    if (hasSimulationKPIs != hadSimulationKPIs) {
        if (hasSimulationKPIs) {
            dispatch(Actions.setNewPage('results'))
        }

        hadSimulationKPIs = hasSimulationKPIs
    }
}
