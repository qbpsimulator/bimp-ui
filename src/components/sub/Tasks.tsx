import * as React from 'react'
import * as Types from '../../types'
import * as Actions from '../../actions'
import { Helpers } from '../../model-components/Helpers'

import { DurationDistribution } from './DurationDistribution'
import { ValidatedDropdown, ValidatedInput, TimeUnitDropdown, TooltipCheckbox, floatLeftInputStyle, width100Style } from './CoreComponents'

interface Props extends Types.DispatchProps {
    elements: Types.ProcessSimulationInfoTypeElementsType
    tasks: Map<string, Types.TaskType>
    resources: Types.ProcessSimulationInfoTypeResourcesType
    processIds: Set<string>
    currency: string
}

interface State {
    resourcesSource: Array<any>
}

const initialState: State = {
    resourcesSource: []
}

interface TaskProps extends Types.DispatchProps {
    task: Types.TaskType
    elementInfo: Types.ElementSimulationInfoType
    resourceSource: any
    currency: string
    processIds: Set<string>
}

class Task extends React.PureComponent<TaskProps, undefined> {
    onElementDurationDistributionChange(elementId: string, value: Types.DistributionInfo) {
        this.props.dispatchElementSimInfoChange(elementId, 'durationDistribution', value)
    }

    onInputChange = (taskId: string, name: string, value: string | number) => {
        this.props.dispatch(Actions.updateElementSimInfo(taskId, name, value))
    }

    render() {
        const { task, elementInfo } = this.props

        return (
            <div className="box" key={task.id} id={task.id}>
                <p className="subtitle is-size-6 has-text-weight-semibold">{task.name}</p>
                {task.hasChildren && (
                    <div className="columns">
                        <div className="column is-narrow">
                            <TooltipCheckbox
                                checked={Helpers.b(elementInfo.simulateAsTask)}
                                disabled={!!task.calledElement && !this.props.processIds.has(task.calledElement)}
                                label="Simulate as task, ignore child elements"
                                onChange={(e, checked) => this.onInputChange(task.id, 'simulateAsTask', checked ? 1 : 0)}
                                tooltip="If checked for a sub-process which contains child elements, then only specified sub-process duration will be used"
                                color="primary"
                            />
                        </div>
                    </div>
                )}
                {(!task.hasChildren || Helpers.b(elementInfo.simulateAsTask)) && (
                    <div className="columns">
                        <div className="column is-3">
                            <ValidatedDropdown
                                value={elementInfo.resourceIds.resourceId}
                                onChange={(v) => this.onInputChange(task.id, 'resourceId', v)}
                                source={this.props.resourceSource}
                                label="Resource"
                                tooltip="Resource / worker for the task"
                                required
                                elementKey={task.id}
                            />
                        </div>
                    </div>
                )}
                {(!task.hasChildren || Helpers.b(elementInfo.simulateAsTask)) && (
                    <>
                        <p className="subtitle is-size-6">Duration</p>
                        <div className="columns">
                            <div className="column">
                                <DurationDistribution
                                    showHistogram={true}
                                    distributionInfo={elementInfo.durationDistribution}
                                    onChange={(di: Types.DistributionInfo) => this.onElementDurationDistributionChange(task.id, di)}
                                    label="Distribution"
                                    tooltip="Distribution of duration"
                                    elementKey={task.id}
                                />
                            </div>
                        </div>
                    </>
                )}
                <p className="subtitle is-size-6">Fixed cost and thresholds</p>
                <div className="columns is-vcentered">
                    <div className="column">
                        <ValidatedInput
                            type="numeric"
                            value={Helpers.s(elementInfo.fixedCost)}
                            onChange={(v) => this.onInputChange(task.id, 'fixedCost', parseFloat(v))}
                            label={`Fixed cost`}
                            tooltip="Fixed cost of task. For decimal place, point should be used."
                            elementKey={task.id}
                        />
                    </div>
                    <div className="column">
                        <ValidatedInput
                            type="numeric"
                            value={Helpers.s(elementInfo.costThreshold)}
                            onChange={(v) => this.onInputChange(task.id, 'costThreshold', parseFloat(v))}
                            label={`Cost threshold`}
                            tooltip="If set, then additional statistics will be generated for the tasks exceeding threshold value. Includes fixed cost. For decimal place, point should be used."
                            elementKey={task.id}
                        />
                    </div>
                    <div className="column">
                        <ValidatedInput
                            type="numeric"
                            value={Helpers.s(elementInfo.durationThreshold)}
                            onChange={(v) => this.onInputChange(task.id, 'durationThreshold', parseFloat(v))}
                            label="Duration threshold"
                            tooltip="If set, then additional statistics will be generated for the tasks exceeding threshold value. For decimal place, point should be used."
                            elementKey={task.id}
                        />
                    </div>
                    <div className="column">
                        <TimeUnitDropdown
                            value={Helpers.s(elementInfo.durationThresholdTimeUnit)}
                            onChange={(v) => this.onInputChange(task.id, 'durationThresholdTimeUnit', v)}
                            required={!!Helpers.n(elementInfo.durationThreshold)}
                            elementKey={task.id}
                            fullWidth
                        />
                    </div>
                </div>
            </div>
        )
    }
}

export class Tasks extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = initialState
    }

    static getDerivedStateFromProps(nextProps: Props) {
        return {
            resourcesSource: nextProps.resources.resource.map((resource: Types.Resource) => ({
                value: resource.id,
                label: Helpers.s(resource.name)
            }))
        }
    }

    render() {
        const tasks = this.props.elements.element.map((elementInfo) => {
            const task = this.props.tasks.get(elementInfo.elementId)
            if (!task) return null

            return (
                <Task
                    key={task.id}
                    task={task}
                    elementInfo={elementInfo}
                    resourceSource={this.state.resourcesSource}
                    currency={this.props.currency}
                    dispatch={this.props.dispatch}
                    dispatchElementSimInfoChange={this.props.dispatchElementSimInfoChange}
                    processIds={this.props.processIds}
                />
            )
        })

        if (!tasks.length) return null

        return (
            <div className="box">
                <p className="subtitle">Tasks</p>
                <div className="tasks">{tasks}</div>
            </div>
        )
    }
}
