import { Reducer, Action } from 'redux'
import * as qbpapi from '../../xmlns/www.qbp-simulator.com/ApiSchema201212';

import * as Actions from '../actions'
import { store } from '../store'
import { SimulationType } from '../types/SimulationType'


const initialState: SimulationType = {
    pending: false,
};

interface XMLPayloadAction extends Action {
    payload: string & qbpapi.document & qbpapi.ResultsType;
    error?: any;
    meta?: {
        generateMxml?: boolean
    };
}

export const SimulationReducer: Reducer<SimulationType> =
(state: SimulationType = initialState, action: XMLPayloadAction): SimulationType => {
    switch (action.type) {
        case Actions.Action_Application_Init: {
            return {...initialState };
        }
        case "START_SIMULATION_PENDING":
            return {...state, pending: true, error: null, status: null, results: null, mxmlRequested: !!action.meta.generateMxml }
        case "SIMULATION_STATUS_PENDING":
        case "SIMULATION_KPI_PENDING":
            return {...state, pending: true, error: null }

        case "START_SIMULATION_REJECTED":
        case "START_SIMULATION_PARSE_REJECTED":
        case "SIMULATION_STATUS_REJECTED":
        case "SIMULATION_STATUS_PARSE_REJECTED":
        case "SIMULATION_KPI_REJECTED":
        case "SIMULATION_KPI_PARSE_REJECTED":
        case "SIMULATION_PROCESS_DURATION_REJECTED":
        case "SIMULATION_PROCESS_DURATION_PARSE_REJECTED":
        case "SIMULATION_PROCESS_CYCLETIME_REJECTED":
        case "SIMULATION_PROCESS_CYCLETIME_PARSE_REJECTED":
        case "SIMULATION_PROCESS_WAITINGTIME_REJECTED":
        case "SIMULATION_PROCESS_WAITINGTIME_PARSE_REJECTED":
        case "SIMULATION_PROCESS_COST_REJECTED":
        case "SIMULATION_PROCESS_COST_PARSE_REJECTED":
            console.error(action.payload);
            return {...state, pending: false, error: action.payload }

        case "START_SIMULATION_FULFILLED":
        case "SIMULATION_STATUS_FULFILLED":
        case "SIMULATION_KPI_FULFILLED":
            return {...state, pending: false, error: null }

        case "START_SIMULATION_PARSE_FULFILLED":
            const startResponse = action.payload.StartSimulationResponse;
            return {...state, id: startResponse.id, status: startResponse.status, error: null }

        case "SIMULATION_STATUS_PARSE_FULFILLED":
            const statusResponse = action.payload.SimulationStatusResponse;
            return {...state, status: statusResponse.status, error: null }

        case "SIMULATION_KPI_PARSE_FULFILLED":
            const kpiResponse = action.payload.SimulationKPIResponse;

            let results = {} as qbpapi.ResultsType;
            results.Results = kpiResponse;

            return {...state, results: results, error: null }

        case "SIMULATION_PROCESS_DURATION_PARSE_FULFILLED":
        case "SIMULATION_PROCESS_CYCLETIME_PARSE_FULFILLED":
        case "SIMULATION_PROCESS_WAITINGTIME_PARSE_FULFILLED":
        case "SIMULATION_PROCESS_COST_PARSE_FULFILLED":
            const distibutionResponse = action.payload.SimulationHistogramResponse;
            let newResults = {...state.results};

            if (action.type === "SIMULATION_PROCESS_DURATION_PARSE_FULFILLED") {
                newResults.CycleTimesInTimetableData = distibutionResponse;
            }
            else if (action.type === "SIMULATION_PROCESS_CYCLETIME_PARSE_FULFILLED") {
                newResults.CycleTimesData = distibutionResponse;
            }
            else if (action.type === "SIMULATION_PROCESS_WAITINGTIME_PARSE_FULFILLED") {
                newResults.WaitingTimesData = distibutionResponse;
            }
            else if (action.type === "SIMULATION_PROCESS_COST_PARSE_FULFILLED") {
                newResults.CostsData = distibutionResponse;
            }

            return {...state, results: newResults };

        case "SIMULATION_RESULTS_LOADED":
            return {...state, results: action.payload };

        default:
            return state
    }
}
