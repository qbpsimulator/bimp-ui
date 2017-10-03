import { createStore, Store, applyMiddleware, compose } from 'redux'
import promiseMiddleware from 'redux-promise-middleware';
import logger from 'redux-logger'

import { reducer } from './reducers'

import { StoreType } from "./types/StoreType"

import InitStoreActors from "./actors"

declare var window;

function getOrCreateStore(): Store<StoreType> {
    let existingStore;
    try {
        existingStore = window.opener ? window.opener.store : undefined;
    }
    catch (e) {
        console.warn('Got exception with window opener', e);
    }

    if (!existingStore) {
        existingStore = createStore<StoreType>(
            reducer,
            compose(
                (process.env.NODE_ENV === 'production') ?
                    applyMiddleware(promiseMiddleware()) :
                    applyMiddleware(promiseMiddleware(), logger)
            ));
        window.store = existingStore;
        InitStoreActors(existingStore);
    }


    return existingStore;
}

export const store: Store<StoreType> = getOrCreateStore();