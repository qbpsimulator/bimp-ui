import { Dispatch, Store } from 'redux'

import * as Types from '../types'

import * as Actions from './ApplicationAction'

export const DefaultDispatchToProps = (dispatch: Dispatch): Types.DispatchProps => ({
    dispatch: dispatch,
    dispatchModelSimInfoChange: (key: string, value: Types.SimInfoValueType) => {
        dispatch(Actions.updateModelSimInfo(key, value))
    },
    dispatchElementSimInfoChange: (elementId: string, key: string, value: Types.SimInfoValueType) => {
        dispatch(Actions.updateElementSimInfo(elementId, key, value))
    }
})
