import * as React from 'react'
import * as Actions from '../../actions'
import * as Types from '../../types'
import { Helpers } from '../../model-components/Helpers'
import { ValidatedInput, width100Style } from './CoreComponents'
import { ValidateMe } from '../../model-components/Validator'

const width200Style = {'width': '200px'};

interface Props extends Types.DispatchProps {
    gateways: Array<Types.GatewayType>;
    sequenceFlows: Array<Types.SequenceFlowSimulationInfoType>;
}

interface GatewayProps extends Types.DispatchProps {
    gateway: Types.GatewayType;
    sequenceFlows: Array<Types.SequenceFlowSimulationInfoType>;
}

interface SequenceFlowProps extends Types.DispatchProps {
    flow: Types.SequenceFlowType;
    gatewayId: string;
    elementInfo: Types.SequenceFlowSimulationInfoType;
    gatewayValidator: (value: string) => void;
}

class SequenceFlow extends React.PureComponent<SequenceFlowProps, undefined> {

    private _inputRef: any;

    constructor(props: SequenceFlowProps) {
        super(props);
    }

    private onExecutionProbabilityChange = (id: string, value: string, oldData: Types.SequenceFlowSimulationInfoType) => {
        const newVal = parseFloat(value) / 100;
        if (oldData.executionProbability == newVal)
            return;

        this.props.dispatch(Actions.updateSequenceFlowSimInfo(id, 'executionProbability', newVal));
    };

    private setInputRef = (element: ValidateMe) => {
        this._inputRef = element;
    }

    public invalidate() {
        if (this._inputRef) {
            this._inputRef.validate();
        }
    }

    public getStringValue() {
        return this._inputRef.getValue();
    }

    public render() {
        const { flow, elementInfo } = this.props;
        const probabilityStr = (Math.round(elementInfo.executionProbability * 10000) / 100) + '';

        return (
            <tr>
                <td colSpan={2}>
                    <table id={flow.id}>
                        <tbody>
                            <tr>
                                <td className="first-column" style={width200Style}>
                                    <span className="model-data" title="The next step after this gateway.">{flow.targetName}</span>
                                </td>
                                <td className="second-column">
                                    <div>
                                        <ValidatedInput
                                            ref={this.setInputRef}
                                            required
                                            type="number"
                                            value={probabilityStr}
                                            onChange={v => this.onExecutionProbabilityChange(flow.id, v, elementInfo)}
                                            tooltip="The probability of executing this step next (0 - 100)"
                                            hint="%"
                                            label='Probability'
                                            validators={[this.props.gatewayValidator]}
                                            elementKey={this.props.gatewayId}
                                        />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        );
    }
}

class Gateway extends React.PureComponent<GatewayProps, undefined> {

    private _sequenceFlows = new Array<SequenceFlow>();

    private _isInvalidating = false;
    private validateGatewaySum = (value: string) => {
        if (this.props.gateway.isInclusive)
            return '';

        let sum = 0;
        this._sequenceFlows.forEach(flow => {
            sum += parseFloat(flow.getStringValue());
        });

        const errorStr = Math.round(sum) == 100 ? '' : 'Sum of exclusive gateway probabilities must be equal to 100%';

        // invalidate all other gateways as well
        if (!this._isInvalidating) {
            this._isInvalidating = true;
            this._sequenceFlows.forEach(flow => flow.invalidate());
            this._isInvalidating = false;
        }

        return errorStr;
    };

    private setSequenceFlowRef = (element: SequenceFlow) => {
        this._sequenceFlows.push(element);
    }

    public render() {
        const { gateway, sequenceFlows } = this.props;
            const flows = gateway.sequenceFlows.map(flow => {
                return <SequenceFlow
                    key={flow.id}
                    ref={this.setSequenceFlowRef}
                    flow={flow}
                    elementInfo={sequenceFlows.find(sf => sf.elementId === flow.id)}
                    dispatch={this.props.dispatch}
                    gatewayValidator={this.validateGatewaySum}
                    gatewayId={this.props.gateway.id}
                />
            });
            return (
                <div className="gateway" style={width100Style} id={gateway.id}>
                    <table style={width100Style}>
                        <tbody>
                            <tr className="first-row">
                                <td colSpan={2}>
                                    <span className="model-data">{ gateway.isInclusive ? "Inclusive gateway (OR)" : "Exclusive gateway (XOR)" }: </span>
                                    <span className="model-data">{gateway.name}</span>
                                </td>
                            </tr>
                            {flows}
                        </tbody>
                    </table>
                </div>
            );
    }
}

interface SequenceFlowSimulationInfoTypeMap {
    [key: string]: Types.SequenceFlowSimulationInfoType;
}

export class Gateways extends React.PureComponent<Props, undefined> {

    private _cacheMap: SequenceFlowSimulationInfoTypeMap = {};

    constructor(props: Props) {
        super(props);
        this.updateCache(props);
    }

    componentWillUpdate(nextProps: Props, nextState: undefined) {
        if (nextProps.sequenceFlows !== this.props.sequenceFlows)
            this.updateCache(nextProps)
    }

    private updateCache(props: Props) {
        props.sequenceFlows.forEach(flow => {
            this._cacheMap[flow.elementId] = flow;
        });
    }

    public render() {
        const gateways = this.props.gateways.map((gateway: Types.GatewayType) => {
            return <Gateway
                key={gateway.id}
                gateway={gateway}
                sequenceFlows={gateway.sequenceFlows.map(flow => this._cacheMap[flow.id])}
                dispatch={this.props.dispatch}
            />
        })

        if (!gateways.length)
            return null;

        return (
            <div>
                <h2 className="toggle-trigger">Gateways</h2>
                <div className="toggle-div">
                    <div className="gateways">
                        {gateways}
                    </div>
                </div>
            </div>
        );
    }

}
