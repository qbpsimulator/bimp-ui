import * as React from 'react'
import * as Actions from '../../actions'
import * as Types from '../../types'
import { ValidatedInput } from './CoreComponents'

interface Props extends Types.DispatchProps {
    gateways: Array<Types.GatewayType>
    sequenceFlows: Array<Types.SequenceFlowSimulationInfoType>
}

interface GatewayProps extends Types.DispatchProps {
    gateway: Types.GatewayType
    sequenceFlows: Array<Types.SequenceFlowSimulationInfoType>
}

interface SequenceFlowProps extends Types.DispatchProps {
    flow: Types.SequenceFlowType
    gatewayId: string
    elementInfo: Types.SequenceFlowSimulationInfoType
    gatewayValidator: (value: string) => void
}

class SequenceFlow extends React.PureComponent<SequenceFlowProps, undefined> {
    constructor(props: SequenceFlowProps) {
        super(props)
    }

    private onExecutionProbabilityChange = (id: string, value: string, oldData: Types.SequenceFlowSimulationInfoType) => {
        const newVal = parseFloat(value) / 100
        if (oldData.executionProbability == newVal) return

        this.props.dispatch(Actions.updateSequenceFlowSimInfo(id, 'executionProbability', newVal))
    }

    public render() {
        const { flow, elementInfo } = this.props
        const probabilityStr = Math.round(elementInfo.executionProbability * 10000) / 100 + ''

        return (
            <div className="columns is-vcentered" id={flow.id}>
                <div className="column is-3" title="The next step after this gateway.">
                    {flow.targetName}
                </div>
                <div className="column is-3">
                    <ValidatedInput
                        required
                        type="number"
                        value={probabilityStr}
                        onChange={(v) => this.onExecutionProbabilityChange(flow.id, v, elementInfo)}
                        tooltip="The probability of executing this step next (0 - 100)"
                        hint="%"
                        label="Probability"
                        validators={[this.props.gatewayValidator]}
                        elementKey={this.props.gatewayId}
                    />
                </div>
            </div>
        )
    }
}

class Gateway extends React.PureComponent<GatewayProps, undefined> {
    public render() {
        const validateGatewaySum = (value: string) => {
            if (this.props.gateway.isInclusive) return ''

            let sum = 0
            const { sequenceFlows } = this.props
            sequenceFlows.forEach((flow) => {
                sum += flow.executionProbability * 100
            })

            const errorStr = Math.round(sum) == 100 ? '' : 'Sum of exclusive gateway probabilities must be equal to 100%'

            return errorStr
        }

        const { gateway, sequenceFlows } = this.props
        const flows = gateway.sequenceFlows.map((flow) => {
            return (
                <SequenceFlow
                    key={flow.id}
                    flow={flow}
                    elementInfo={sequenceFlows.find((sf) => sf.elementId === flow.id)}
                    dispatch={this.props.dispatch}
                    gatewayValidator={validateGatewaySum}
                    gatewayId={this.props.gateway.id}
                />
            )
        })
        return (
            <div className="box gateway" id={gateway.id}>
                <p className="subtitle is-size-6 has-text-weight-semibold">{gateway.name || 'N/A'}</p>
                <p className="subtitle is-size-7 has-text-weight-normal">
                    Type: {gateway.isInclusive ? 'Inclusive (OR)' : 'Exclusive (XOR)'}
                </p>

                {flows}
            </div>
        )
    }
}

interface SequenceFlowSimulationInfoTypeMap {
    [key: string]: Types.SequenceFlowSimulationInfoType
}

export class Gateways extends React.PureComponent<Props, SequenceFlowSimulationInfoTypeMap> {
    state: SequenceFlowSimulationInfoTypeMap = {}

    static getDerivedStateFromProps(nextProps: Props) {
        const state: SequenceFlowSimulationInfoTypeMap = {}
        nextProps.sequenceFlows.forEach((flow) => {
            state[flow.elementId] = flow
        })
        return state
    }

    public render() {
        const gateways = this.props.gateways.map((gateway: Types.GatewayType) => {
            return (
                <Gateway
                    key={gateway.id}
                    gateway={gateway}
                    sequenceFlows={gateway.sequenceFlows.map((flow) => this.state[flow.id])}
                    dispatch={this.props.dispatch}
                />
            )
        })

        if (!gateways.length) return null

        return (
            <div className="box">
                <p className="subtitle">Gateways</p>
                <div className="gateways">{gateways}</div>
            </div>
        )
    }
}
