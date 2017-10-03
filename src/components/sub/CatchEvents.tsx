import * as React from 'react'
import * as Types from '../../types'

import { DurationDistribution } from './DurationDistribution'
import { Helpers } from '../../model-components/Helpers'
import { width100Style } from './CoreComponents'


interface Props extends Types.DispatchProps {
    catchEvents: Array<Types.CatchEventType>,
    elements: Types.ProcessSimulationInfoTypeElementsType
}

interface State {
}

const initialState: State = {
}

export class CatchEvents extends React.PureComponent<Props, State> {

    constructor (props: Props) {
        super(props);

        this.state = initialState;
    }

    onElementDurationDistributionChange(elementId: string, value: Types.DistributionInfo) {
        this.props.dispatchElementSimInfoChange(elementId, 'durationDistribution', value);
    }

    render() {
        const catchEvents = this.props.catchEvents.map((catchEvent: Types.CatchEventType) => {
            const elementInfo = this.props.elements.element.find((item: Types.ElementSimulationInfoType) => item.elementId === catchEvent.id);
            return (
                <div className="catchEvent" key={catchEvent.id} style={width100Style} id={catchEvent.id}>
                    <table style={width100Style}>
                        <tbody>
                            <tr className="first-row">
                                <td><span className="__name model-data">{Helpers.s(catchEvent.name)}</span></td>
                            </tr>
                            <tr id="durationDistribution">
                                <td>
                                    <div>Duration:</div>
                                    <DurationDistribution
                                        showHistogram={true}
                                        distributionInfo={elementInfo.durationDistribution}
                                        onChange={(di: Types.DistributionInfo) => this.onElementDurationDistributionChange(catchEvent.id, di)}
                                        label="Distribution"
                                        tooltip="Distribution of the duration"
                                        elementKey={catchEvent.id}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        });

        if (!catchEvents.length)
            return null;

        return (
            <div>
                <h2 className="toggle-trigger intermediateCatchEvent">Intermediate events</h2>
                <div className="toggle-div intermediateCatchEvent">
                    <div className="catchEvents">
                        {catchEvents}
                    </div>
                </div>
            </div>
        );
    }
}
