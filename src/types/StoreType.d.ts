import { Store } from 'redux'

import * as Types from '.'

export interface StoreType {
    application: Types.ApplicationType
    modelSimInfo: Types.ProcessSimulationInfoType
    simulation: Types.SimulationType
}
