import { createSelector } from 'reselect'

import * as Types from './types'

const getAllElements = (state: Types.StoreType) => state.modelSimInfo.elements
const getTasks = (state: Types.StoreType) => state.application.activeParser.getTasks()

export interface TaskSelector {
    element: Types.ElementSimulationInfoType
    task: Types.TaskType
}

export interface GatewaySelector {
    bpmnGateway: Types.GatewayType
    sequenceFlows: Array<Types.SequenceFlowSimulationInfoType>
}

export interface TasksSelectorType extends Array<Types.ElementSimulationInfoType> {}

export const getTasksSelector = createSelector(
    [getAllElements, getTasks],
    (elements, tasks): TasksSelectorType => {
        return elements.element.filter((element) => tasks.has(element.elementId))
    }
)
