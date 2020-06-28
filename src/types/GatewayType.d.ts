import { SequenceFlowType } from './SequenceFlowType'

export interface GatewayType {
    readonly id: string
    readonly name: string
    readonly sequenceFlows: Array<SequenceFlowType>
    readonly isInclusive: boolean
}

export interface GatewaysType extends Array<GatewayType> {}
