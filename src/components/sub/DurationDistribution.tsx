import * as React from 'react'

import Dialog from 'react-toolbox/lib/dialog';
import HistogramData from './HistogramData'
import { TimeUnitDropdown, TooltipButton, ValidatedDropdown, ValidatedInput, ValidateMeComponent } from './CoreComponents'
import { Helpers } from '../../model-components/Helpers'

import { DistributionInfo, DistributionInfoHistogramDataBinsType, TimeUnitType, DistributionType} from '../../types'

interface Props {
    showHistogram: boolean,
    distributionInfo: DistributionInfo
    onChange?: (value: DistributionInfo) => void;
    label: string;
    tooltip: string;
    required?: boolean;
    elementKey?: string;
}

interface State {
    arg1: string;
	arg2: string;
	mean: string;
	type: DistributionType;
	timeUnit: TimeUnitType;
    histogramOpened: boolean;
}

const fieldInformation: { } = {
    FIXED: {
        mean: 'to'
    },
    NORMAL: {
        mean: 'Mean',
        arg1: 'Std deviation'
    },
    EXPONENTIAL: {
        arg1: 'Mean'
    },
    UNIFORM: {
        arg1: 'between',
        arg2: 'and'
    },
    LOGNORMAL: {
        mean: 'Mean',
        arg1: 'Variance'
    },
    GAMMA: {
        mean: 'Mean',
        arg1: 'Variance'
    },
    TRIANGULAR: {
        mean: 'Mode (c)',
        arg1: 'Minimum (a)',
        arg2: 'Maximum (b)',
    },
    HISTOGRAM: {}
};

const distributionTypes = [
    { value: "FIXED", label: "Fixed"},
    { value: "NORMAL", label: "Normal"},
    { value: "EXPONENTIAL", label: "Exponential"},
    { value: "UNIFORM", label: "Uniform"},
    { value: "TRIANGULAR", label: "Triangular"},
    { value: "LOGNORMAL", label: "Log-Normal"},
    { value: "GAMMA", label: "Gamma"},
    { value: "HISTOGRAM", label: "Histogram"}
];

export class DurationDistribution extends ValidateMeComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = DurationDistribution.getDerivedStateFromProps(props, {} as any)
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        const { arg1, arg2, mean, type, timeUnit } = nextProps.distributionInfo;
        return {...prevState,
            arg1: DurationDistribution.fromSeconds(arg1, timeUnit),
            arg2: DurationDistribution.fromSeconds(arg2, timeUnit),
            mean: DurationDistribution.fromSeconds(mean, timeUnit),
            type,
            timeUnit
        };
    }

    componentWillReceiveProps(nextProps: Props) {
        this.setState(DurationDistribution.getDerivedStateFromProps(nextProps, this.state));
    }

    public getElementId(): string {
        return this.props.elementKey;
    }

    public validate(): string {
        const di = this.props.distributionInfo;

        let errorStr = undefined;
        if (di.type === 'HISTOGRAM') {
            // validate histogram
            let sum = 0;
            if (di.histogramDataBins)
                di.histogramDataBins.histogramData.forEach(data => sum += data.probability);
            errorStr = sum == 1 ? '' : 'Sum of all probabilities must be 100';
        }

        return errorStr;
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        return nextProps.distributionInfo !== this.props.distributionInfo ||
            this.state.histogramOpened !== nextState.histogramOpened;
    }

    onChange = (name: string, value: string) => {
        if (!this.props.onChange)
            return;

        this.setState({...this.state,
            [name]: value
            },
        () => {
            const { arg1, arg2, mean, type, timeUnit } = this.state;
            const newDi: DistributionInfo = {
                ...this.props.distributionInfo,
                arg1: DurationDistribution.toSeconds(parseFloat(arg1), timeUnit),
                arg2: DurationDistribution.toSeconds(parseFloat(arg2), timeUnit),
                mean: DurationDistribution.toSeconds(parseFloat(mean), timeUnit),
                type,
                timeUnit
            };

            this.props.onChange(newDi);
        });
    };


    private onHistogramDataChange = (value: DistributionInfoHistogramDataBinsType) => {
        if (!this.props.onChange)
            return;

        const newModelState = {
            ...this.props.distributionInfo,
            histogramDataBins: value
        };

        this.props.onChange(newModelState);
    }

    private static toSeconds(x: number, timeUnit: TimeUnitType): number {
        switch (timeUnit) {
            case 'seconds':
                return x;
            case 'minutes':
                return x * 60;
            case 'hours':
                return x * 60 * 60;
            case 'days':
                return x * 60 * 60 * 24;
        }

        return x;
    }

    private static fromSeconds(x: number, timeUnit: TimeUnitType): string {
        switch (timeUnit) {
            case 'minutes':
                x = Math.round(100 * x / 60) / 100;
                break;
            case 'hours':
                x = Math.round(100 * x / (60 * 60))/ 100;
                break;
            case 'days':
                x = Math.round(100 * x / (60 * 60 * 24)) / 100;
                break;
        }

        return x !== 0 ? x + '' : '';
    }

    private childDivStyle = {
        'float': 'left',
        'maxWidth': '110px',
        'marginLeft': '4px',
        'marginRight': '4px'
    };

    render() {
        const di = this.state;
        const errorStr = this.validate();

        return (
            <div className="distribution-div">
                <div style={this.childDivStyle}>
                    <ValidatedDropdown
                        value={di.type}
                        onChange={(v) => this.onChange('type', v)}
                        source={distributionTypes.filter(v => v.value !== 'HISTOGRAM' || this.props.showHistogram)}
                        tooltip={this.props.tooltip}
                        label={this.props.label}
                        required={this.props.required}
                        elementKey={this.props.elementKey}
                        error={errorStr}
                    />
                </div>
                {!!fieldInformation[di.type].mean &&
                    <div style={this.childDivStyle}>
                        <ValidatedInput type="number"
                            value={di.mean}
                            onChange={v => this.onChange('mean', v)}
                            required={this.props.required}
                            label={fieldInformation[di.type].mean}
                            elementKey={this.props.elementKey}
                        />
                    </div>}
                {!!fieldInformation[di.type].arg1 &&
                    <div style={this.childDivStyle}>
                        <ValidatedInput type="number"
                            value={di.arg1}
                            onChange={v => this.onChange('arg1', v)}
                            required={this.props.required}
                            label={fieldInformation[di.type].arg1}
                        />
                    </div>}
                {!!fieldInformation[di.type].arg2 &&
                    <div style={this.childDivStyle}>
                        <ValidatedInput type="number"
                            value={di.arg2}
                            onChange={v => this.onChange('arg2', v)}
                            required={this.props.required}
                            label={fieldInformation[di.type].arg2}
                        />
                    </div>}
                {di.type === 'HISTOGRAM' &&
                    <div style={Object.assign({}, this.childDivStyle, {'marginTop': '18px'})}>
                        <TooltipButton
                            tooltip="Open histogram data table to specify complex distribution using histogram"
                            label="Open histogram"
                            onMouseUp={this.onToggleHistogramDialog}
                            flat primary
                            />
                        </div>}
                {di.type !== 'HISTOGRAM' &&
                    <div style={this.childDivStyle}>
                        <TimeUnitDropdown
                            value={di.timeUnit}
                            onChange={(v) => this.onChange('timeUnit', v)}
                            required={this.props.required}
                            elementKey={this.props.elementKey}
                        />
                    </div>}
                {this.state.histogramOpened &&
                    <Dialog
                        actions={[
                            { label: 'Close', onClick: this.onToggleHistogramDialog }
                        ]}
                        active={true}
                        onEscKeyDown={this.onToggleHistogramDialog}
                        title='Histogram distribution'
                        style={{width: 'auto'}}>
                        <HistogramData
                            histogramBins={this.props.distributionInfo.histogramDataBins}
                            onChange={this.onHistogramDataChange}
                            elementKey={this.props.elementKey} />
                    </Dialog>
                }
            </div>
        );
    }

    private onToggleHistogramDialog = () => {
        const di = this.props.distributionInfo;
        if (!di.hasOwnProperty('histogramDataBins')) {
            const newModelState = {
                ...di,
                histogramDataBins: Helpers.createDefaultHistogramDataBins()
            };

            if (this.props.onChange)
                this.props.onChange(newModelState);
        }

        this.setState({...this.state,
            histogramOpened: !this.state.histogramOpened
        });
    }
}
