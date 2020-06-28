import { Action as ReduxAction } from 'redux'

export const Action_Application_Init = 'Application_Init'
export const Action_Application_SetPage = 'Application_SetPage'
export const Action_Application_SetActiveParser = 'Application_SetActiveParser'
export const Action_Application_SetAllParsers = 'Application_SetAllParsers'
export const Action_Application_StartSimulation = 'Application_StartSimulation'
export const Action_Parser_TasksLoaded = 'Parser_TasksLoaded'
export const Action_Parser_GatewaysLoaded = 'Parser_GatewaysLoade'
export const Action_Parser_CatchEventsLoaded = 'Parser_CatchEventsLoaded'
export const Action_Parser_ModelSimInfoLoaded = 'Parser_ModelSimInfoLoaded'
export const Action_Model_SimInfoPropertyUpdated = 'Model_SimInfoPropertyUpdated'
export const Action_Model_ElementSimInfoPropertyUpdated = 'Model_ElementSimInfoPropertyUpdated'
export const Action_Model_SequenceFlowPropertyUpdated = 'Model_SequenceFlowPropertyUpdated'
export const Action_Model_AddResource = 'Model_AddResource'
export const Action_Model_DeleteResource = 'Model_DeleteResource'
export const Action_Model_ResourcePropertyUpdated = 'Model_ResourcePropertyUpdated'
export const Action_Model_AddTimeTable = 'Model_AddTimeTable'
export const Action_Model_DeleteTimeTable = 'Model_DeleteTimeTable'
export const Action_Model_TimeTablePropertyUpdated = 'Model_TimeTablePropertyUpdated'

export interface Action<P> extends ReduxAction {
    type: any
    payload: P
}
