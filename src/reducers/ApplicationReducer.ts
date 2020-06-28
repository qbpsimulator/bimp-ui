import { Reducer } from 'redux'

import { ApplicationType } from '../types/ApplicationType'
import { Config } from '../types/Config'
import { Validator, ValidateMe } from '../model-components/Validator'
import BPMNParser from '../model-components/BPMNParser'
import * as Actions from '../actions'

const initialState: ApplicationType = {
    page: 'upload',
    parsers: null,
    validator: null,
    config: null,
    activeParser: null,
    allProcessIds: null
}

export const ApplicationReducer: Reducer<ApplicationType> = (
    state: ApplicationType = initialState,
    action: Actions.Action<Actions.ApplicationPayload>
): ApplicationType => {
    switch (action.type) {
        case Actions.Action_Application_Init: {
            return { ...initialState, config: action.payload.config, uploadedFileContents: action.payload.initialFiles }
        }

        case Actions.Action_Application_SetPage: {
            return { ...state, page: action.payload.page, validator: new Validator() }
        }

        case Actions.Action_Application_SetActiveParser:
            return { ...state, activeParser: action.payload.parser }

        case Actions.Action_Application_SetAllParsers:
            const allProcessIds = new Set<string>()
            action.payload.parsers.forEach((parser) => {
                parser.getProcessDefinitions().forEach((process) => {
                    allProcessIds.add(process.id)
                })
            })

            return {
                ...state,
                parsers: action.payload.parsers,
                allProcessIds: allProcessIds,
                activeParser: null,
                uploadedFileContents: undefined
            }
    }

    return state
}
