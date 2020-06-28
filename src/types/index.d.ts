export * from './ApplicationType'
export * from './DispatchProps'
export * from './StoreType'
export * from './BPMNModelType'
export * from './Config'

export * from './CallActivityType'
export * from './CatchEventType'
export * from './GatewayType'
export * from './TaskType'
export * from './ProcessDefinitionType'
export * from './SequenceFlowType'
export * from './SimulationType'
export * from './LaneType'

export * from '../../xmlns/www.qbp-simulator.com/Schema201212'
import { DistributionInfo } from '../../xmlns/www.qbp-simulator.com/Schema201212'

export type SimInfoValueType = string | number | DistributionInfo | Date

export interface FileDefinition {
    readonly name: string
    readonly contents: string
}
