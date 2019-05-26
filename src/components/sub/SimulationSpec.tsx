import * as React from 'react'

import { ValidatedInput, TooltipDatePicker, TooltipTimePicker} from './CoreComponents'
import { Validate } from '../../model-components/Validator'

import { DispatchProps, ProcessSimulationInfoType, DistributionInfo } from '../../types'
import { Helpers } from '../../model-components/Helpers'

import { DurationDistribution } from './DurationDistribution'
import { CurrencyList } from './CurrencyList'

interface Props extends DispatchProps {
    modelSimInfo: ProcessSimulationInfoType,
    mxmlLog: boolean
}

interface State {
}

const initialState: State = {
}

export class SimulationSpec extends React.PureComponent<Props, State> {

    constructor (props: Props) {
        super(props);

        this.state = initialState;
    }

    onModelSimInfoChange = (name: string, value: string | number) => {
        this.props.dispatchModelSimInfoChange(name, value);
    }

    onDurationDistributionChange = (value: DistributionInfo) => {
        this.props.dispatchModelSimInfoChange('arrivalRateDistribution', value);
    }

    onDateTimeChange = (newValue: Date) => {
        this.props.dispatchModelSimInfoChange('startDateTime', newValue);
    }

    render(): any {
        let simInfo = this.props.modelSimInfo;

        return (
            <div>
                <h2 className="toggle-trigger">Process simulation specification</h2>
                    <div className="toggle-div">
                        <div className="modelSimInfo">
                        <table className="form">
                            <tbody>
                                <tr id="arrivalRateDistribution">
                                    <td colSpan={2}>
                                        <DurationDistribution
                                            showHistogram={true}
                                            distributionInfo={simInfo.arrivalRateDistribution}
                                            onChange={this.onDurationDistributionChange}
                                            label="Inter arrival time"
                                            tooltip="Inter arrival time specifies the interval between two new process instances."
                                            required
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <ValidatedInput type="number"
                                            label="Total number of process instances"
                                            tooltip="Specifies the number of how many process instances will be created during the simulation. Positive integer should be used."
                                            onChange={(v) => this.onModelSimInfoChange('processInstances', parseFloat(v))}
                                            value={Helpers.s(simInfo.processInstances)}
                                            validators={[(v) => Validate.between(v, 1, this.props.mxmlLog ? 10000 : 10000000000)]}
                                            required
                                        />
                                    </td>

                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <div className='StartDateTime'>
                                            <div className='DatePicker'>
                                                <TooltipDatePicker
                                                    locale='en'
                                                    label='Scenario start date'
                                                    onChange={this.onDateTimeChange}
                                                    value={simInfo.startDateTime}
                                                    sundayFirstDayOfWeek={false}
                                                    autoOk={true}
                                                    tooltip='Specify the date when the scenario will started'
                                                />
                                            </div>
                                            <div className='TimePicker'>
                                                <TooltipTimePicker
                                                    label='Start time'
                                                    onChange={this.onDateTimeChange}
                                                    value={simInfo.startDateTime}
                                                    tooltip='Specify the time when the scenario will started'
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <CurrencyList value={Helpers.s(this.props.modelSimInfo.currency)} onChange={value => this.onModelSimInfoChange('currency', value)}  />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}
