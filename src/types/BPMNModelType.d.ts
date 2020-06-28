import * as Types from '.'

export interface BPMNModelType {
    readonly tasks: Types.TasksType
    readonly gateways: Types.GatewaysType
    readonly catchEvents: Types.CatchEventsType
}
