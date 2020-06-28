import * as React from 'react'

import { ValidatedInput, TooltipDateTimePicker, TooltipCheckbox } from './CoreComponents'
import { Validate } from '../../model-components/Validator'

import { DispatchProps, ProcessSimulationInfoType, DistributionInfo } from '../../types'
import { Helpers } from '../../model-components/Helpers'

import { DurationDistribution } from './DurationDistribution'
import { CurrencyList } from './CurrencyList'

interface Props extends DispatchProps {
    modelSimInfo: ProcessSimulationInfoType
    mxmlLog: boolean
}

interface State {
    trimStatsSame: boolean
}

const initialState: State = {
    trimStatsSame: true
}

export class SimulationSpec extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props)
        const { modelSimInfo } = props

        this.state = {
            ...initialState,
            trimStatsSame:
                modelSimInfo.statsOptions &&
                modelSimInfo.statsOptions.trimStartProcessInstances === modelSimInfo.statsOptions.trimEndProcessInstances
        }
    }

    onModelSimInfoChange = (name: string, value: string | number) => {
        this.props.dispatchModelSimInfoChange(name, value)
    }

    onDurationDistributionChange = (value: DistributionInfo) => {
        this.props.dispatchModelSimInfoChange('arrivalRateDistribution', value)
    }

    onDateTimeChange = (newValue: Date) => {
        this.props.dispatchModelSimInfoChange('startDateTime', newValue)
    }

    render(): any {
        let simInfo = this.props.modelSimInfo

        return (
            <div className="box">
                <p className="subtitle">Scenario Specification</p>
                <div className="columns">
                    <div className="column">
                        <DurationDistribution
                            showHistogram={true}
                            distributionInfo={simInfo.arrivalRateDistribution}
                            onChange={this.onDurationDistributionChange}
                            label="Inter arrival time"
                            tooltip="Inter arrival time specifies the interval between two new process instances."
                            required
                        />
                    </div>
                </div>
                <div className="columns">
                    <div className="column">
                        <ValidatedInput
                            type="number"
                            label="Total number of process instances"
                            tooltip="Specifies the number of how many process instances will be created during the simulation. Positive integer should be used."
                            onChange={(v) => this.onModelSimInfoChange('processInstances', parseFloat(v))}
                            value={Helpers.s(simInfo.processInstances)}
                            validators={[(v) => Validate.between(v, 1, this.props.mxmlLog ? 10000 : 10000000000)]}
                            required
                            fullWidth
                        />
                    </div>
                    <div className="column is-narrow">
                        <ValidatedInput
                            type="number"
                            label="% to exclude from stats"
                            tooltip="Specifies the percentage of process instance performance stats to exclude from the start and the end of the simulation scenario. Use to exclude statistics from process instances when simulation scenario is 'warming up' or 'cooling down'."
                            onChange={(v) => this.handleTrimInfoChange('statsOptions.trimStartProcessInstances', v)}
                            value={Helpers.s(simInfo.statsOptions.trimStartProcessInstances * 100)}
                            validators={[(v) => v && Validate.between(v, 0, 40)]}
                            fullWidth
                        />
                    </div>
                    {!this.state.trimStatsSame && (
                        <div className="column is-narrow">
                            <ValidatedInput
                                type="number"
                                label="% to exclude at the end"
                                tooltip="Specifies the percentage of process instance performance stats to exclude at the end of the simulation scenario."
                                onChange={(v) => this.handleTrimInfoChange('statsOptions.trimEndProcessInstances', v)}
                                value={Helpers.s(simInfo.statsOptions.trimEndProcessInstances * 100)}
                                validators={[(v) => v && Validate.between(v, 0, 40)]}
                                fullWidth
                            />
                        </div>
                    )}
                    <div className="column is-narrow is-flex pb-0">
                        <TooltipCheckbox
                            checked={this.state.trimStatsSame}
                            disabled={Helpers.s(simInfo.statsOptions.trimStartProcessInstances) === ''}
                            label="Use the same % for tail"
                            onChange={this.handleTrimSameChange}
                            tooltip="If checked, then the same percentage of process instance performance stats is excluded at the end of the scenario."
                            color="primary"
                        />
                    </div>
                </div>
                <div className="columns">
                    <div className="column">
                        <TooltipDateTimePicker
                            ampm={false}
                            label="Scenario start date and time"
                            onChange={this.onDateTimeChange}
                            value={simInfo.startDateTime.toISOString()}
                            tooltip="Specify the date when the scenario will started"
                        />
                    </div>
                </div>
                <div className="columns">
                    <div className="column">
                        <CurrencyList
                            value={Helpers.s(this.props.modelSimInfo.currency)}
                            onChange={(value) => this.onModelSimInfoChange('currency', value)}
                        />
                    </div>
                </div>
            </div>
        )
    }

    private handleTrimSameChange = () => {
        if (this.state.trimStatsSame) {
            const fromVal = (this.props.modelSimInfo.statsOptions && this.props.modelSimInfo.statsOptions.trimStartProcessInstances) || 0
            this.onModelSimInfoChange('statsOptions.toProcessInstance', fromVal)
        }

        this.setState((state) => ({ ...state, trimStatsSame: !state.trimStatsSame }))
    }

    private handleTrimInfoChange = (field: string, value: any) => {
        const { trimStatsSame } = this.state

        const val = Helpers.f(parseFloat(value) / 100)
        this.onModelSimInfoChange(field, val)

        if (trimStatsSame) {
            const otherField =
                field === 'statsOptions.trimEndProcessInstances'
                    ? 'statsOptions.trimStartProcessInstances'
                    : 'statsOptions.trimEndProcessInstances'
            this.onModelSimInfoChange(otherField, val)
        }
    }
}
