import * as React from 'react'
import * as Types from '../../types'

import { DurationDistribution } from './DurationDistribution'
import { Helpers } from '../../model-components/Helpers'

interface Props extends Types.DispatchProps {
    catchEvents: Array<Types.CatchEventType>
    elements: Types.ProcessSimulationInfoTypeElementsType
}

interface State {}

const initialState: State = {}

export class CatchEvents extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = initialState
    }

    onElementDurationDistributionChange(elementId: string, value: Types.DistributionInfo) {
        this.props.dispatchElementSimInfoChange(elementId, 'durationDistribution', value)
    }

    render() {
        const catchEvents = this.props.catchEvents.map((catchEvent: Types.CatchEventType) => {
            const elementInfo = this.props.elements.element.find(
                (item: Types.ElementSimulationInfoType) => item.elementId === catchEvent.id
            )
            return (
                <div className="box" key={catchEvent.id} id={catchEvent.id}>
                    <p className="subtitle is-size-6 has-text-weight-semibold">{Helpers.s(catchEvent.name)}</p>
                    <div className="columns is-vcentered">
                        <div className="column is-narrow">Duration:</div>
                        <div className="column">
                            <DurationDistribution
                                showHistogram={true}
                                distributionInfo={elementInfo.durationDistribution}
                                onChange={(di: Types.DistributionInfo) => this.onElementDurationDistributionChange(catchEvent.id, di)}
                                label="Distribution"
                                tooltip="Distribution of the duration"
                                elementKey={catchEvent.id}
                            />
                        </div>
                    </div>
                </div>
            )
        })

        if (!catchEvents.length) return null

        return (
            <div className="box">
                <p className="subtitle">Intermediate Catch and Boundary Events</p>
                {catchEvents}
            </div>
        )
    }
}
