export interface TaskType {
    readonly id: string
    readonly name: string
    readonly nodeName: string
    readonly hasChildren: boolean
    readonly calledElement?: string
    readonly parentId?: string
}

export interface TasksType extends Map<string, TaskType> {}
