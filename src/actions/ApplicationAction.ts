import * as Actions from './ActionType'
import BPMNParser from '../model-components/BPMNParser'
import { ValidateMe } from '../model-components/Validator'

import * as Types from '../types'
import * as qbpapi from '../../xmlns/www.qbp-simulator.com/ApiSchema201212'
import { ProcessSimulationInfo } from '../model-components/ProcessSimulationInfo'
import RequestHandler from '../model-components/RequestHandler'
import BPMNUpdater from '../model-components/BPMNUpdater'

import { store } from '../store'

export interface ApplicationPayload {
    page?: string
    parser?: BPMNParser
    parsers?: Array<BPMNParser>
    validateMe?: ValidateMe
    initialFiles?: Array<Types.FileDefinition>
    config?: Types.Config
}

export interface ItemsLoadedPayload<T> {
    items: Array<T>
}
export interface TasksLoadedPayload<T> {
    items: Map<string, T>
}
export interface ModelSimInfoLoadedPayload {
    data: Types.ProcessSimulationInfoType
}

export interface ModelSimInfoPropertyUpdatePayload {
    key: string
    value: Types.SimInfoValueType
}

export interface ElementSimInfoPropertyUpdatePayload {
    id: string
    key: string
    value: Types.SimInfoValueType
}

export interface ElementSimInfoSubPropertyUpdatePayload extends ElementSimInfoPropertyUpdatePayload {
    id: string
    subIndex: number
    key: string
    value: Types.SimInfoValueType
}

export interface ItemIdPayload {
    id: string
}

export function setNewPage(page: string): Actions.Action<ApplicationPayload> {
    return {
        type: Actions.Action_Application_SetPage,
        payload: {
            page: page
        }
    }
}

export function setActiveParser(parser: BPMNParser): Actions.Action<ApplicationPayload> {
    const currentParser = store.getState().application.activeParser
    if (currentParser) {
        // update current parser, store current model data
        const activeSimInfo = store.getState().modelSimInfo
        currentParser.updateQbpSimulationInfo(activeSimInfo)

        // prepare next parser, update main data from current model sim info
        const combinedSimInfo = ProcessSimulationInfo.createSimInfoWithDefaultsFromAnother(activeSimInfo, parser.getQbpSimulationInfo())
        parser.updateQbpSimulationInfo(combinedSimInfo)
    }

    // set simulate as task for callActivites which reference processes that do not exist
    parser.getCallActivities().forEach((ca) => {
        if (!store.getState().application.allProcessIds.has(ca.calledElement)) {
            const element = parser.getQbpSimulationInfo().elements.element.find((e) => e.elementId === ca.id)
            element.simulateAsTask = true
        }
    })

    return {
        type: Actions.Action_Application_SetActiveParser,
        payload: {
            parser: parser
        }
    }
}

export function setParsers(parsers: Array<BPMNParser>): Actions.Action<ApplicationPayload> {
    parsers[0].updateQbpSimulationInfo(ProcessSimulationInfo.createMergedSimInfo(parsers.map((p) => p.getQbpSimulationInfo())))

    return {
        type: Actions.Action_Application_SetAllParsers,
        payload: {
            parsers: parsers
        }
    }
}

export function loadTasks(items: Map<string, Types.TaskType>): Actions.Action<TasksLoadedPayload<Types.TaskType>> {
    return {
        type: Actions.Action_Parser_TasksLoaded,
        payload: {
            items: items
        }
    }
}

export function loadCatchEvents(items: Array<Types.CatchEventType>): Actions.Action<ItemsLoadedPayload<Types.CatchEventType>> {
    return {
        type: Actions.Action_Parser_CatchEventsLoaded,
        payload: {
            items: items
        }
    }
}

export function loadGateways(items: Array<Types.GatewayType>): Actions.Action<ItemsLoadedPayload<Types.GatewayType>> {
    return {
        type: Actions.Action_Parser_GatewaysLoaded,
        payload: {
            items: items
        }
    }
}

export function loadModelSimInfo(simInfo: Types.ProcessSimulationInfoType): Actions.Action<ModelSimInfoLoadedPayload> {
    return {
        type: Actions.Action_Parser_ModelSimInfoLoaded,
        payload: {
            data: simInfo
        }
    }
}

export function updateModelSimInfo(key: string, value: Types.SimInfoValueType): Actions.Action<ModelSimInfoPropertyUpdatePayload> {
    return {
        type: Actions.Action_Model_SimInfoPropertyUpdated,
        payload: {
            key: key,
            value: value
        }
    }
}

export function updateElementSimInfo(
    elementId: string,
    key: string,
    value: Types.SimInfoValueType
): Actions.Action<ElementSimInfoPropertyUpdatePayload> {
    return {
        type: Actions.Action_Model_ElementSimInfoPropertyUpdated,
        payload: {
            id: elementId,
            key: key,
            value: value
        }
    }
}

export function updateSequenceFlowSimInfo(
    elementId: string,
    key: string,
    value: Types.SimInfoValueType
): Actions.Action<ElementSimInfoPropertyUpdatePayload> {
    return {
        type: Actions.Action_Model_SequenceFlowPropertyUpdated,
        payload: {
            id: elementId,
            key: key,
            value: value
        }
    }
}

export function addResource(): Actions.Action<any> {
    return {
        type: Actions.Action_Model_AddResource,
        payload: {}
    }
}

export function deleteResource(id: string): Actions.Action<ItemIdPayload> {
    return {
        type: Actions.Action_Model_DeleteResource,
        payload: {
            id: id
        }
    }
}

export function updateResourceProperty(
    resourceId: string,
    key: string,
    value: Types.SimInfoValueType
): Actions.Action<ElementSimInfoPropertyUpdatePayload> {
    return {
        type: Actions.Action_Model_ResourcePropertyUpdated,
        payload: {
            id: resourceId,
            key: key,
            value: value
        }
    }
}

export function addTimeTable(): Actions.Action<any> {
    return {
        type: Actions.Action_Model_AddTimeTable,
        payload: {}
    }
}

export function deleteTimeTable(id: string): Actions.Action<ItemIdPayload> {
    return {
        type: Actions.Action_Model_DeleteTimeTable,
        payload: {
            id: id
        }
    }
}

export function updateTimeTableProperty(
    timeTableId: string,
    ruleIndex: number,
    key: string,
    value: Types.SimInfoValueType
): Actions.Action<ElementSimInfoSubPropertyUpdatePayload> {
    return {
        type: Actions.Action_Model_TimeTablePropertyUpdated,
        payload: {
            id: timeTableId,
            subIndex: ruleIndex,
            key: key,
            value: value
        }
    }
}

export function loadSimulationResults(loadedResults: qbpapi.ResultsType) {
    return {
        type: 'SIMULATION_RESULTS_LOADED',
        payload: loadedResults
    }
}

export function init(config: Types.Config, initialFiles: Array<Types.FileDefinition>) {
    return {
        type: Actions.Action_Application_Init,
        payload: {
            config: config,
            initialFiles: initialFiles
        }
    }
}

export function startSimulation(mxmlLog: boolean) {
    const state = store.getState()
    if (state.application.page !== 'scenario') store.dispatch(setNewPage('scenario'))

    const validator = state.application.validator
    const isValid = !validator || validator.validateAll()

    if (isValid) {
        state.application.activeParser.updateQbpSimulationInfo(state.modelSimInfo)

        const bpmnDocs = []
        const parsers = state.application.parsers
        parsers.forEach((parser) => {
            const updater = new BPMNUpdater(parser)
            bpmnDocs.push(updater.getUpdatedDocumentAsString(parser.getQbpSimulationInfo(), null))
        })

        var rq = new RequestHandler()
        rq.startSimulation(bpmnDocs, mxmlLog)
    } else {
        throw new Error('There is a problem with simulation scenario')
    }

    return {
        type: Actions.Action_Application_StartSimulation
    }
}
