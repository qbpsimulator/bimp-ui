import { SimulationStatusType, ResultsType } from '../../xmlns/www.qbp-simulator.com/ApiSchema201212'

export interface SimulationType {
    readonly id?: string
    readonly pending: boolean
    readonly status?: SimulationStatusType
    readonly error?: any
    readonly results?: ResultsType
    readonly mxmlRequested?: boolean
}
