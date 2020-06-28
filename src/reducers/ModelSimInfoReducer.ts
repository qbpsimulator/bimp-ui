import { Reducer } from 'redux'

import * as qbp from '../../xmlns/www.qbp-simulator.com/Schema201212'

import * as Actions from '../actions'

import { Helpers } from '../model-components/Helpers'

const initialState = {} as qbp.ProcessSimulationInfoType

type PotentialPayloads = Actions.ModelSimInfoLoadedPayload &
    Actions.ModelSimInfoPropertyUpdatePayload &
    Actions.ElementSimInfoPropertyUpdatePayload &
    Actions.ElementSimInfoSubPropertyUpdatePayload &
    Actions.ItemIdPayload &
    Actions.ApplicationPayload

export const ModelSimInfoReducer: Reducer<qbp.ProcessSimulationInfoType> = (
    state: qbp.ProcessSimulationInfoType = initialState,
    action: Actions.Action<PotentialPayloads>
): qbp.ProcessSimulationInfoType => {
    switch (action.type) {
        case Actions.Action_Application_Init: {
            return { ...initialState }
        }

        case Actions.Action_Application_SetActiveParser:
            return action.payload.parser.getQbpSimulationInfo()

        case Actions.Action_Model_SimInfoPropertyUpdated:
            let key = action.payload.key
            let value = action.payload.value

            if (action.payload.key.indexOf('.') >= 0) {
                const keys = action.payload.key.split('.')

                key = keys[0]
                value = state[key] ? { ...state[key] } : {}
                value[keys[1]] = action.payload.value
            }

            return { ...state, [key]: value }

        case Actions.Action_Model_ElementSimInfoPropertyUpdated:
            const newElement = state.elements.element.map((e: qbp.ElementSimulationInfoType) => {
                if (e.elementId === action.payload.id) {
                    if (action.payload.key === 'resourceId') {
                        let resourceIds = { ...e.resourceIds, resourceId: action.payload.value.toString() }

                        return { ...e, resourceIds: resourceIds }
                    } else {
                        return { ...e, [action.payload.key]: action.payload.value }
                    }
                } else return e
            })
            const newElements = { ...state.elements, element: newElement }
            return { ...state, elements: newElements }

        case Actions.Action_Model_SequenceFlowPropertyUpdated:
            let sequenceFlow = state.sequenceFlows.sequenceFlow.map((flow) => {
                if (flow.elementId === action.payload.id) {
                    return { ...flow, [action.payload.key]: action.payload.value }
                } else return flow
            })

            const sequenceFlows = { ...state.sequenceFlows, sequenceFlow: sequenceFlow }
            return { ...state, sequenceFlows: sequenceFlows }

        case Actions.Action_Model_AddResource:
            let resource = Helpers.createResource()
            const newAddedResources = state.resources.resource.concat(resource)
            return { ...state, resources: { ...state.resources, resource: newAddedResources } }

        case Actions.Action_Model_AddTimeTable:
            let tt = Helpers.createTimeTable()
            const newAddedTimetables = state.timetables.timetable.concat(tt)
            return { ...state, timetables: { ...state.timetables, timetable: newAddedTimetables } }

        case Actions.Action_Model_DeleteResource:
            const deletedResources = state.resources.resource.filter((v) => v.id != action.payload.id)
            return { ...state, resources: { ...state.resources, resource: deletedResources } }

        case Actions.Action_Model_DeleteTimeTable:
            const deletedTimeTables = state.timetables.timetable.filter((v) => v.id != action.payload.id)
            return { ...state, timetables: { ...state.timetables, timetable: deletedTimeTables } }

        case Actions.Action_Model_ResourcePropertyUpdated:
            const newResources = state.resources.resource.map((r) => {
                if (r.id == action.payload.id) return { ...r, [action.payload.key]: action.payload.value }

                return r
            })

            return { ...state, resources: { ...state.resources, resource: newResources } }

        case Actions.Action_Model_TimeTablePropertyUpdated:
            const newTimeTable = state.timetables.timetable.map((t) => {
                if (t.id == action.payload.id) {
                    let newTt = { ...t }

                    if (action.payload.subIndex >= 0) {
                        let newRules = t.rules.rule.map((r, rIndex) => {
                            if (rIndex === action.payload.subIndex) {
                                return { ...r, [action.payload.key]: action.payload.value }
                            }
                            return r
                        })
                        newTt.rules.rule = newRules
                    } else {
                        newTt = { ...newTt, [action.payload.key]: action.payload.value }
                    }

                    return newTt
                }

                return t
            })

            return { ...state, timetables: { ...state.timetables, timetable: newTimeTable } }

        default:
            return state
    }
}
