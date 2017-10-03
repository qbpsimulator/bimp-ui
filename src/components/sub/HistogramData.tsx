import * as React from 'react'
import Input from 'react-toolbox/lib/input';
import Tooltip from 'react-toolbox/lib/tooltip';

const TooltipInput = Tooltip(Input);

import * as qbp from '../../../xmlns/www.qbp-simulator.com/Schema201212'

import { Helpers } from '../../model-components/Helpers'
import { DurationDistribution } from './DurationDistribution'
import { DistributionInfo } from '../../types'

interface Props {
    histogramBins: qbp.DistributionInfoHistogramDataBinsType;
    onChange: (value: qbp.DistributionInfoHistogramDataBinsType) => void;
    elementKey: string;
}

const floatLeft = {
    float: 'left'
}

export default class HistogramData extends React.PureComponent<Props, undefined> {

    private currentHistogramBins: qbp.DistributionInfoHistogramDataBinsType;
    private strProbabilities: Array<string> = [];


    constructor (props: Props) {
        super(props);

        this.currentHistogramBins = props.histogramBins;
        this.strProbabilities = this.currentHistogramBins.histogramData.map(e => (Math.round(e.probability * 10000.0) / 100.0) + '');
    }

    private onDataProbabilityChanged = (index: number, strVal: string) => {
        let floatVal = parseFloat(strVal);

        if (typeof(floatVal) !== 'number')
            floatVal = 0;

        floatVal /= 100.0;

        this.strProbabilities = this.strProbabilities.map((v, i) => index === i ? strVal : v)


        this.updateHistogramDataValue(index, 'probability', floatVal);
    }

    private onDataDurationDistributionChange = (index: number, di: qbp.DistributionInfo) => {
        this.updateHistogramDataValue(index, 'distribution', di);
    };

    private updateHistogramDataValue(index: number, name: string, value: number | qbp.DistributionInfo) {
        this.currentHistogramBins = {...this.currentHistogramBins,
            histogramData: this.currentHistogramBins.histogramData.map((data, i) => {
                if (i === index) {
                    return {...data,
                        [name]: value
                    }
                }

                return data;
            })
        }

        this.props.onChange(this.currentHistogramBins);
    }

    private onRemoveLineClick = (index: number) => {
        this.currentHistogramBins = {...this.currentHistogramBins,
            histogramData: this.currentHistogramBins.histogramData.filter((e, i) => i !== index)
        };

        this.strProbabilities = this.strProbabilities.filter((e, i) => i !== index);

        this.props.onChange(this.currentHistogramBins);
    }

    private onAddLineClick = () => {
        const newItem = Helpers.createDistributionHistogramBin(0);

        this.currentHistogramBins = {...this.currentHistogramBins,
            histogramData: this.currentHistogramBins.histogramData.concat(newItem)
        }

        this.strProbabilities.push('');
        this.props.onChange(this.currentHistogramBins);
    }

    private getHistogramSumText(): string {
        let sum = 0.0;
        this.currentHistogramBins.histogramData.forEach(data => {
            sum += data.probability;
        });

        let text = "= " + Math.round(sum * 10000.0) / 100.0 + "%";
        if (sum != 1) {
            text += ". Sum of all probabilities must be 100!";
        }

        return text;
    }

    render() {
        const rules = this.currentHistogramBins.histogramData.map((value: qbp.DistributionHistogramBin, index: number) => {
            return (
                <tr className="histogram-data-row" key={index}>
                    <td>
                        <div style={Object.assign(floatLeft, {'maxWidth': '100px'})}>
                            <TooltipInput
                                type="number"
                                onChange={v => this.onDataProbabilityChanged(index, v)}
                                value={this.strProbabilities[index]}
                                tooltip="Probability from 0 - 100% to take distribution from the line"
                                label="Probability"
                            />
                        </div>
                    </td>
                    <td>
                        <DurationDistribution
                            showHistogram={false}
                            distributionInfo={value.distribution}
                            onChange={(di: qbp.DistributionInfo) => this.onDataDurationDistributionChange(index, di)}
                            label="Distribution"
                            tooltip="Distribution of the values"
                            elementKey={this.props.elementKey}
                        />
                    </td>
                    <td>
                        {index > 0 && <a className="trigger remove" onClick={() => this.onRemoveLineClick(index)} href="javascript:void(0)" title="Remove line">X</a>}
                    </td>
                </tr>
            );
        });

        return (
            <div className="histogram-data-div" id='data-input'>
                <table className="histogram-data-table">
                    <tbody>
                        <tr>
                            <td><a className="trigger addHx" onClick={() => this.onAddLineClick()} href="javascript:void(0)" title="Add new line">Add</a></td>
                            <td/>
                            <td/>
                        </tr>
                        <tr>
                            <td><span className="col-title">Probability (0-100)</span></td>
                            <td><span className="col-title">Distribution</span></td>
                            <td/>
                        </tr>
                        {rules}
                    </tbody>
                </table>
                <div className="col-title histogram-error-span">{this.getHistogramSumText()}</div>
            </div>
        );
    }
}
