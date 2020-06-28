import { Dispatch, Store } from 'redux'

import { StoreType } from '../types'

import * as SimulationActors from './Simulation'

interface ActorType {
    (e: StoreType, dispatch: Dispatch): void
}

export default function initStoreActors(store: Store<StoreType>) {
    const actors = [SimulationActors.fetchSimulationKPIsActor, SimulationActors.fetchSimulationHistogramDataActor]

    var acting = false
    store.subscribe(() => {
        // Ensure that any action dispatched by actors do not result in a new
        // actor run, allowing actors to dispatch with impunity.
        if (!acting) {
            acting = true
            actors.forEach((actor) => actor(store.getState(), store.dispatch))
            acting = false
        }
    })
}
