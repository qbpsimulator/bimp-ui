import * as React from 'react'
import { Chart } from 'react-google-charts'
import CircularProgress from '@material-ui/core/CircularProgress'

import * as Types from '../types'
import * as qbpapi from '../../xmlns/www.qbp-simulator.com/ApiSchema201212'

import { Helpers } from '../model-components/Helpers'

interface Props extends Types.DispatchProps {
    simulation: Types.SimulationType
    resources: Types.ProcessSimulationInfoTypeResourcesType
    currency: string
}

interface State {}

export default class SimulationResultsPage extends React.Component<Props, State> {
    render(): any {
        const results = this.props.simulation.results
        const kpis = results.Results

        const tasks = kpis.elements.element.map((task) => {
            if (typeof task.duration.max === 'object' || !task.duration.max) return null

            return (
                <tr className="taskData" key={task.id}>
                    <td className="_name">{task.name}</td>
                    <td className="count">{Helpers.formatNumber(task.count)}</td>
                    <td className="min-waitingTime">{Helpers.formatDuration(task.waitingTime.min)}</td>
                    <td className="average-waitingTime">{Helpers.formatDuration(task.waitingTime.average)}</td>
                    <td className="max-waitingTime">{Helpers.formatDuration(task.waitingTime.max)}</td>
                    <td className="min-duration">{Helpers.formatDuration(task.duration.min)}</td>
                    <td className="average-duration">{Helpers.formatDuration(task.duration.average)}</td>
                    <td className="max-duration">{Helpers.formatDuration(task.duration.max)}</td>
                    <td className="min-durationOverThreshold">{Helpers.formatDuration(task.durationOverThreshold.min)}</td>
                    <td className="average-durationOverThreshold">{Helpers.formatDuration(task.durationOverThreshold.average)}</td>
                    <td className="max-durationOverThreshold">{Helpers.formatDuration(task.durationOverThreshold.max)}</td>
                    <td className="min-cost">{Helpers.formatCost(task.cost.min)}</td>
                    <td className="average-cost">{Helpers.formatCost(task.cost.average)}</td>
                    <td className="max-cost">{Helpers.formatCost(task.cost.max)}</td>
                    <td className="min-costOverThreshold">{Helpers.formatCost(task.costOverThreshold.min)}</td>
                    <td className="average-costOverThreshold">{Helpers.formatCost(task.costOverThreshold.average)}</td>
                    <td className="max-costOverThreshold">{Helpers.formatCost(task.costOverThreshold.max)}</td>
                </tr>
            )
        })

        return (
            <div className="container">
                <p className="title">Simulation Results</p>
                <div className="box">
                    <div className="content">
                        <p className="subtitle">General information</p>
                        <table>
                            <tbody>
                                <tr>
                                    <td>
                                        <span className="has-text-weight-semibold">Completed process instances </span>{' '}
                                        <span className="processInstances" />
                                        {Helpers.formatNumber(kpis.process.processInstances)}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <span className="has-text-weight-semibold">Total cost </span> <span className="totalCost" />
                                        {Helpers.formatCost(kpis.process.totalCost, this.props.currency)}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <span className="has-text-weight-semibold">Total simulation time </span>{' '}
                                        <span className="totalCycleTime" />
                                        {Helpers.formatDuration(kpis.process.totalCycleTime, false)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="content">
                        <p className="subtitle">Charts</p>
                        <div className="tile is-parent" style={{ flexWrap: 'wrap' }}>
                            <div id="duration-chart-div" className="tile is-child">
                                {this.createBarChart(
                                    {
                                        title: 'Process cycle times including off-timetable hours',
                                        'vAxis.title': '# of processes'
                                    },
                                    results.CycleTimesData,
                                    'duration-chart'
                                )}
                            </div>
                            <div id="duration-in-timetable-chart-div" className="tile is-child">
                                {this.createBarChart(
                                    {
                                        title: 'Process cycle times excluding off-timetable hours',
                                        'vAxis.title': '# of processes'
                                    },
                                    results.CycleTimesInTimetableData,
                                    'duration-in-timetable-chart'
                                )}
                            </div>
                            <div id="waiting-time-chart-div" className="tile is-child">
                                {this.createBarChart(
                                    {
                                        title: 'Process waiting times',
                                        'vAxis.title': '# of processes'
                                    },
                                    results.WaitingTimesData,
                                    'waiting-time-chart'
                                )}
                            </div>
                            <div id="cost-chart-div" className="tile is-child">
                                {this.createBarChart(
                                    {
                                        title: 'Process costs (' + this.props.currency + ')',
                                        'vAxis.title': '# of processes',
                                        'hAxis.title': 'Cost (' + this.props.currency + ')'
                                    },
                                    results.CostsData,
                                    'cost-chart',
                                    false
                                )}
                            </div>
                            <div id="resources-chart-div" className="tile is-child">
                                {this.createResourceUtilizationChart(results.Results, 'resources-chart')}
                            </div>
                        </div>
                    </div>
                    <div className="content">
                        <p className="subtitle">Scenario Statistics</p>
                        <table className="scenario-kpi-table">
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td>Minimum</td>
                                    <td>Maximum</td>
                                    <td>Average</td>
                                </tr>
                                <tr>
                                    <td>Process instance cycle times including off-timetable hours</td>
                                    <td>{Helpers.formatDuration(kpis.process.minCycleTime, false)}</td>
                                    <td>{Helpers.formatDuration(kpis.process.maxCycleTime, false)}</td>
                                    <td>{Helpers.formatDuration(kpis.process.averageCycleTime, false)}</td>
                                </tr>
                                <tr>
                                    <td>Process instance cycle times excluding off-timetable hours</td>
                                    <td>{Helpers.formatDuration(kpis.process.minDuration, false)}</td>
                                    <td>{Helpers.formatDuration(kpis.process.maxDuration, false)}</td>
                                    <td>{Helpers.formatDuration(kpis.process.averageDuration, false)}</td>
                                </tr>
                                <tr>
                                    <td>Process instance costs</td>
                                    <td>{Helpers.formatCost(kpis.process.minCost, this.props.currency)}</td>
                                    <td>{Helpers.formatCost(kpis.process.maxCost, this.props.currency)}</td>
                                    <td>{Helpers.formatCost(kpis.process.averageCost, this.props.currency)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div id="result-table" className="box content">
                    <p className="subtitle">Activity Durations, Costs, Waiting times, Deviations from Thresholds</p>
                    <table className="task-kpi-table">
                        <tbody>
                            <tr>
                                <th>Name</th>
                                <th></th>
                                <th colSpan={3}>Waiting time</th>
                                <th colSpan={3}>Duration</th>
                                <th colSpan={3}>Duration over threshold</th>
                                <th colSpan={3}>Cost</th>
                                <th colSpan={3}>Cost over threshold</th>
                            </tr>
                            <tr>
                                <td></td>
                                <td>Count</td>
                                <td>Min</td>
                                <td>Avg</td>
                                <td>Max</td>
                                <td>Min</td>
                                <td>Avg</td>
                                <td>Max</td>
                                <td>Min</td>
                                <td>Avg</td>
                                <td>Max</td>
                                <td>Min</td>
                                <td>Avg</td>
                                <td>Max</td>
                                <td>Min</td>
                                <td>Avg</td>
                                <td>Max</td>
                            </tr>
                            {tasks}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    private createBarChart(options: any, data: qbpapi.HistogramDataType, id: string, formatTime: boolean = true): Chart {
        if (!data) return <CircularProgress />

        let defaultOptions = {
            legend: 'none',
            'hAxis.textStyle': {
                fontSize: 10
            },
            'hAxis.slantedText': false,
            'chartArea.left': 1,
            'chartArea.top': 1,
            colors: ['#1D2951', '#1D2951'],
            titleTextStyle: {
                color: '#5f5851'
            }
        }
        const finalOptions = Object.assign({}, defaultOptions, options)

        const columns = [
            {
                type: 'string',
                label: 'Interval'
            },
            {
                type: 'number',
                label: 'Count'
            }
        ]
        const rows = this.getRows(data, formatTime)

        return (
            <Chart chartType="BarChart" options={finalOptions} graph_id={id} height="250px" width="460px" columns={columns} rows={rows} />
        )
    }

    private getRows(data: qbpapi.HistogramDataType, formatTime: boolean = true): Array<any> {
        data.min = Helpers.ensureNumber(data.min)
        data.binWidth = Helpers.ensureNumber(data.binWidth)

        let numRows
        for (numRows = data.values.value.length; numRows > 0; numRows--) {
            if (Helpers.ensureNumber(data.values.value[numRows - 1]) != 0) break
        }

        let rowData = []
        for (var j = 0; j < numRows; ++j) {
            const fromVal = Math.max(0, Math.round((data.min + j * data.binWidth) * 10) / 10)
            const toVal = Math.round((data.min + (j + 1) * data.binWidth) * 10) / 10

            const from = formatTime ? Helpers.formatDuration(fromVal) : fromVal + ''
            const to = formatTime ? Helpers.formatDuration(toVal) : toVal + ''

            rowData.push([from + ' - ' + to, Helpers.ensureNumber(data.values.value[j])])
        }

        return rowData
    }

    private createResourceUtilizationChart(kpiData: qbpapi.SimulationKPIType, id: string): Chart {
        if (!kpiData) return null

        const defaultOptions = {
            legend: 'none',
            'hAxis.textStyle': {
                fontSize: 10
            },
            'hAxis.slantedText': false,
            'chartArea.left': 1,
            'chartArea.top': 1,
            colors: ['#1D2951', '#1D2951'],
            titleTextStyle: {
                color: '#5f5851'
            },
            title: 'Resource utilization %',
            'vAxis.title': '# of processes'
        }

        const columns = [
            {
                type: 'string',
                label: 'Resource'
            },
            {
                type: 'number',
                label: '% of time occupied'
            }
        ]

        let rows = []
        kpiData.resources.resource.forEach((resource) => {
            let resourceData = this.props.resources.resource.find((r) => r.id === resource.id)
            rows.push([
                resourceData ? resourceData.name : 'Resource ' + resource.id,
                Math.round(Helpers.ensureNumber(resource.utilization) * 10000) / 100
            ])
        })

        return (
            <Chart chartType="BarChart" options={defaultOptions} graph_id={id} height="250px" width="460px" columns={columns} rows={rows} />
        )
    }
}
