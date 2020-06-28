import * as React from 'react'

import { TooltipInput } from '../sub/CoreComponents'

import * as qbp from '../../../xmlns/www.qbp-simulator.com/Schema201212'

import { Helpers } from '../../model-components/Helpers'
import { DurationDistribution } from './DurationDistribution'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'

interface Props {
    histogramBins: qbp.DistributionInfoHistogramDataBinsType
    onChange: (value: qbp.DistributionInfoHistogramDataBinsType) => void
    elementKey: string
}

export default class HistogramData extends React.PureComponent<Props, undefined> {
    private currentHistogramBins: qbp.DistributionInfoHistogramDataBinsType
    private strProbabilities: Array<string> = []

    constructor(props: Props) {
        super(props)

        this.currentHistogramBins = props.histogramBins
        this.strProbabilities = this.currentHistogramBins.histogramData.map((e) => Math.round(e.probability * 10000.0) / 100.0 + '')
    }

    private onDataProbabilityChanged = (index: number, strVal: string) => {
        let floatVal = parseFloat(strVal)

        if (typeof floatVal !== 'number') floatVal = 0

        floatVal /= 100.0

        this.strProbabilities = this.strProbabilities.map((v, i) => (index === i ? strVal : v))

        this.updateHistogramDataValue(index, 'probability', floatVal)
    }

    private onDataDurationDistributionChange = (index: number, di: qbp.DistributionInfo) => {
        this.updateHistogramDataValue(index, 'distribution', di)
    }

    private updateHistogramDataValue(index: number, name: string, value: number | qbp.DistributionInfo) {
        this.currentHistogramBins = {
            ...this.currentHistogramBins,
            histogramData: this.currentHistogramBins.histogramData.map((data, i) => {
                if (i === index) {
                    return { ...data, [name]: value }
                }

                return data
            })
        }

        this.props.onChange(this.currentHistogramBins)
    }

    private onRemoveLineClick = (index: number) => {
        this.currentHistogramBins = {
            ...this.currentHistogramBins,
            histogramData: this.currentHistogramBins.histogramData.filter((e, i) => i !== index)
        }

        this.strProbabilities = this.strProbabilities.filter((e, i) => i !== index)

        this.props.onChange(this.currentHistogramBins)
    }

    private onAddLineClick = () => {
        const newItem = Helpers.createDistributionHistogramBin(0)

        this.currentHistogramBins = { ...this.currentHistogramBins, histogramData: this.currentHistogramBins.histogramData.concat(newItem) }

        this.strProbabilities.push('')
        this.props.onChange(this.currentHistogramBins)
    }

    private getHistogramSumText(): string {
        let sum = 0.0
        this.currentHistogramBins.histogramData.forEach((data) => {
            sum += data.probability
        })

        let text = '= ' + Math.round(sum * 10000.0) / 100.0 + '%'
        if (sum != 1) {
            text += '. Sum of all probabilities must be 100!'
        }

        return text
    }

    render() {
        const rules = this.currentHistogramBins.histogramData.map((value: qbp.DistributionHistogramBin, index: number) => {
            return (
                <tr className="histogram-data-row" key={index}>
                    <td>
                        <TooltipInput
                            type="number"
                            onChange={(e) => this.onDataProbabilityChanged(index, e.target.value as string)}
                            value={this.strProbabilities[index]}
                            tooltip="Probability from 0 - 100% to take distribution from the line"
                            label="Probability"
                        />
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
                    <td className="pt-5">
                        {index > 0 && (
                            <IconButton color="primary" size="small" title="Remove line" onClick={() => this.onRemoveLineClick(index)}>
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </td>
                </tr>
            )
        })

        return (
            <div className="content">
                <table className="histogram-data-table">
                    <tbody>
                        <tr>
                            <td>Probability</td>
                            <td>Distribution</td>
                            <td />
                        </tr>
                        {rules}
                        <tr>
                            <td>
                                <IconButton color="primary" title="Add new line" onClick={this.onAddLineClick}>
                                    <AddIcon />
                                </IconButton>
                            </td>
                            <td />
                            <td />
                        </tr>
                    </tbody>
                </table>
                <div>{this.getHistogramSumText()}</div>
            </div>
        )
    }
}
