import { Store, Dispatch } from 'redux'

import { StoreType } from './StoreType'

import { DistributionInfo, SimInfoValueType } from '.'

export type KeyValueChangedEvent = (key: string, value: SimInfoValueType) => void
export type ElementKeyValueChangedEvent = (elementId: string, key: string, value: SimInfoValueType) => void

export interface DispatchProps {
    dispatch?: Dispatch
    dispatchModelSimInfoChange?: KeyValueChangedEvent
    dispatchElementSimInfoChange?: ElementKeyValueChangedEvent
}
