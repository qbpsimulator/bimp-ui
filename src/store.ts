import { createStore, Store, applyMiddleware, compose } from 'redux'
import promiseMiddleware from 'redux-promise-middleware'
import logger from 'redux-logger'

import { reducer } from './reducers'

import { StoreType } from './types/StoreType'

import InitStoreActors from './actors'

declare var window

function createBimpStore(): Store<StoreType> {
    let parentStore
    try {
        parentStore = (window.opener && window.opener.store) || undefined
    } catch (e) {
        console.warn('Got exception with window opener', e)
    }

    const composeStoreWithMiddleware = applyMiddleware(promiseMiddleware, logger)(createStore)

    const preloadedState = parentStore ? parentStore.getState() : undefined
    const newStore = composeStoreWithMiddleware<StoreType>(reducer, preloadedState)
    window.store = newStore
    InitStoreActors(newStore)

    return newStore
}

export const store: Store<StoreType> = createBimpStore()
