import { combineReducers, Reducer } from 'redux'

import { StoreType } from '../types/StoreType'

import { ApplicationReducer } from './ApplicationReducer'
import { ModelSimInfoReducer } from './ModelSimInfoReducer'
import { SimulationReducer } from './SimulationReducer'

export const reducer: Reducer<StoreType> = combineReducers<StoreType>({
    application: ApplicationReducer,
    modelSimInfo: ModelSimInfoReducer,
    simulation: SimulationReducer
})
