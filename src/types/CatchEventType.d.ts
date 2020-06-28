export interface CatchEventType {
    readonly id: string
    readonly name: string
    readonly nodeName: string
}

export interface CatchEventsType extends Array<CatchEventType> {}
