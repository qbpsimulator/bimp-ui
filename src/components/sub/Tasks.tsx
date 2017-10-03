import * as React from 'react'
import * as Types from '../../types'
import * as Actions from '../../actions'
import { Helpers } from '../../model-components/Helpers'

import { DurationDistribution } from './DurationDistribution'
import { ValidatedDropdown, ValidatedInput, TimeUnitDropdown, TooltipButton, TooltipCheckbox, floatLeftInputStyle, width100Style } from './CoreComponents'

interface Props extends Types.DispatchProps {
    elements: Types.ProcessSimulationInfoTypeElementsType
    tasks: Map<string, Types.TaskType>;
    resources: Types.ProcessSimulationInfoTypeResourcesType;
    processIds: Set<string>;
    currency: string;
}

interface State {
}

const initialState: State = {
}

const myFloatLeftStyle = {...floatLeftInputStyle, maxWidth: '160px'};
const headerChildDiv = {marginTop: '10px', marginLeft: '4px'}

interface TaskProps extends Types.DispatchProps {
    task: Types.TaskType;
    elementInfo: Types.ElementSimulationInfoType;
	resourceSource: any;
    currency: string;
    processIds: Set<string>;
}

const taskStyle = {...headerChildDiv, marginLeft: '6px', 'text-align': 'center'};

class Task extends React.PureComponent<TaskProps, undefined> {

    onElementDurationDistributionChange(elementId: string, value: Types.DistributionInfo) {
        this.props.dispatchElementSimInfoChange(elementId, 'durationDistribution', value);
    }

    onInputChange = (taskId: string, name: string, value: string | number) => {
        this.props.dispatch(Actions.updateElementSimInfo(taskId, name, value));
    };

    render() {
        const { task, elementInfo} = this.props;

        return (<div className="task" key={task.id} id={task.id}>
                <table style={width100Style}>
                    <tbody>
                        <tr className="first-row">
                            <td><div className="model-data" style={headerChildDiv}>{task.name}</div>
                                {task.hasChildren &&
                                    <div className="subprocess-info" style={taskStyle}>
                                         <TooltipCheckbox
                                            checked={Helpers.b(elementInfo.simulateAsTask)}
                                            disabled={!!task.calledElement && !this.props.processIds.has(task.calledElement)}
                                            label="Simulate as task, ignore child elements"
                                            onChange={v => this.onInputChange(task.id, 'simulateAsTask', v)}
                                            tooltip="If checked for a sub-process which contains child elements, then only specified sub-process duration will be used"
                                        />
                                    </div>
                                }
                            </td>
                        </tr>
                        {(!task.hasChildren || Helpers.b(elementInfo.simulateAsTask)) &&
                        <tr>
                            <td>
                                <div style={myFloatLeftStyle}>
                                    <ValidatedDropdown
                                        value={elementInfo.resourceIds.resourceId}
                                        onChange={v => this.onInputChange(task.id, 'resourceId', v) }
                                        source={this.props.resourceSource}
                                        label="Resource"
                                        tooltip="Resource / worker for the task"
                                        required
                                        elementKey={task.id}
                                    />
                                </div>
                            </td>
                        </tr>
                        }
                        {(!task.hasChildren || Helpers.b(elementInfo.simulateAsTask)) &&
                        <tr id="durationDistribution">
                            <td>
                                <div>
                                    Duration
                                </div>
                                <DurationDistribution
                                    showHistogram={true}
                                    distributionInfo={elementInfo.durationDistribution}
                                    onChange={(di: Types.DistributionInfo) => this.onElementDurationDistributionChange(task.id, di)}
                                    label="Distribution"
                                    tooltip="Distribution of duration"
                                    elementKey={task.id}
                                />
                            </td>
                        </tr>
                        }
                        <tr id="threshold">
                            <td>
                                <div>
                                    Fixed cost and thresholds
                                </div>
                                <div style={myFloatLeftStyle}>
                                    <ValidatedInput
                                        type="numeric"
                                        value={Helpers.s(elementInfo.fixedCost)}
                                        onChange={v => this.onInputChange(task.id, 'fixedCost', parseFloat(v))}
                                        label={`Fixed cost (${this.props.currency})`}
                                        tooltip="Fixed cost of task. For decimal place, point should be used."
                                        elementKey={task.id}
                                    />
                                </div>
                                <div style={myFloatLeftStyle}>
                                    <ValidatedInput type="numeric"
                                        value={Helpers.s(elementInfo.costThreshold)}
                                        onChange={v => this.onInputChange(task.id, 'costThreshold', parseFloat(v))}
                                        label={`Cost threshold (${this.props.currency})`}
                                        tooltip="If set, then additional statistics will be generated for the tasks exceeding threshold value. Includes fixed cost. For decimal place, point should be used."
                                        elementKey={task.id}
                                    />
                                </div>
                                <div style={myFloatLeftStyle}>
                                    <ValidatedInput
                                        type="numeric"
                                        value={Helpers.s(elementInfo.durationThreshold)}
                                        onChange={v => this.onInputChange(task.id, 'durationThreshold', parseFloat(v))}
                                        label='Duration threshold'
                                        tooltip="If set, then additional statistics will be generated for the tasks exceeding threshold value. For decimal place, point should be used."
                                        elementKey={task.id}
                                    />
                                </div>
                                <div style={myFloatLeftStyle}>
                                    <TimeUnitDropdown
                                        value={Helpers.s(elementInfo.durationThresholdTimeUnit)}
                                        onChange={v => this.onInputChange(task.id, 'durationThresholdTimeUnit', v)}
                                        required={!!Helpers.n(elementInfo.durationThreshold)}
                                        elementKey={task.id}
                                    />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>)
    }

}

export class Tasks extends React.PureComponent<Props, State> {
    private _resourcesSource: Array<any>;
    constructor (props: Props) {
        super(props);

        this.state = initialState;
        this.setResources(props);
    }

    private setResources(props: Props) {
        this._resourcesSource = props.resources.resource.map((resource: Types.Resource) => (
            {
                value: resource.id, label: Helpers.s(resource.name)
            }
        ));
    }

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.resources !== this.props.resources) {
            this.setResources(nextProps);
        }
    }

    render() {
        const tasks = this.props.elements.element.map(elementInfo => {
            const task = this.props.tasks.get(elementInfo.elementId);
            if (!task)
                return null;

            return (<Task
                key={task.id}
                task={task}
                elementInfo={elementInfo}
                resourceSource={this._resourcesSource}
                currency={this.props.currency}
                dispatch={this.props.dispatch}
                dispatchElementSimInfoChange={this.props.dispatchElementSimInfoChange}
                processIds={this.props.processIds}
            />)
        });

        if (!tasks.length)
            return null;

        return (
            <div>
                <h2 className="toggle-trigger">Tasks</h2>
                <div className="toggle-div">
                    <div className="tasks">
                        {tasks}
                    </div>
                </div>
            </div>
        );
    }
}
