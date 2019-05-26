import * as React from 'react'
import { Chart } from 'react-google-charts';
import ProgressBar from 'react-toolbox/lib/progress_bar';

import * as Types from '../types'
import * as qbpapi from '../../xmlns/www.qbp-simulator.com/ApiSchema201212';


import { Helpers } from '../model-components/Helpers'

interface Props extends Types.DispatchProps {
    simulation: Types.SimulationType;
    resources: Types.ProcessSimulationInfoTypeResourcesType;
    currency: string;
}

interface State {
}

const initialState: State = {
}

export default class SimulationResultsPage extends React.Component<Props, State> {

    render(): any {
        const results = this.props.simulation.results;
        const kpis = results.Results;

        const tasks = kpis.elements.element.map(task => {
            if (typeof(task.duration.max) === 'object' || !task.duration.max)
                return null;

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
            );
        });

        return (<div>
        <h2>Simulation Results</h2>
        <div className="results-general-block">
            <div className="results-box results-general">
                <h3>General information</h3>
                <table>
                    <tbody>
                        <tr>
                            <td><span className="col-title">Completed process instances </span> <span className="processInstances"/>{Helpers.formatNumber(kpis.process.processInstances)}</td>
                        </tr>
                        <tr>
                            <td><span className="col-title">Total cost </span> <span className="totalCost"/>{Helpers.formatCost(kpis.process.totalCost, this.props.currency)}</td>
                        </tr>
                        <tr>
                            <td><span className="col-title">Total simulation time </span> <span className="totalCycleTime"/>{Helpers.formatDuration(kpis.process.totalCycleTime, false)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="results-box">
                <h3>Charts</h3>
                <div className="charts">
                <div id="duration-chart-div" className="chart">
                    {this.createBarChart(
                        {
                            'title': 'Process cycle times including off-timetable hours',
                            'vAxis.title': '# of processes'
                        },
                        results.CycleTimesData,
                        'duration-chart')
                    }
                </div>
                <div id="duration-in-timetable-chart-div" className="chart">
                  {this.createBarChart(
                        {
                            'title': 'Process cycle times excluding off-timetable hours',
                            'vAxis.title': '# of processes'
                        },
                        results.CycleTimesInTimetableData,
                        'duration-in-timetable-chart')
                    }
                </div>
                <div id="waiting-time-chart-div" className="chart">
                    {this.createBarChart(
                        {
                            'title': 'Process waiting times',
                            'vAxis.title': '# of processes',
                        },
                        results.WaitingTimesData,
                        'waiting-time-chart')
                    }
                </div>
                <div id="cost-chart-div" className="chart">
                    {this.createBarChart(
                        {
                            'title': 'Process costs (' + this.props.currency + ')',
                            'vAxis.title': '# of processes',
                            'hAxis.title': 'Cost (' + this.props.currency + ')',
                        },
                        results.CostsData,
                        'cost-chart',
                        false)
                    }
                </div>
                <div id="resources-chart-div" className="chart">
                    {this.createResourceUtilizationChart(results.Results, 'resources-chart')}
                </div>
                </div>
            </div>
            <div id="results">
                <div className="results-box">
                    <h3>Process instance cycle times including off-timetable hours</h3>
                    <table>
                        <tbody>
                            <tr>
                                <td><span className="col-title">Minimum cycle time </span> <span className="minCycleTime"/>{Helpers.formatDuration(kpis.process.minCycleTime, false)}</td>
                                <td><span className="col-title">Maximum cycle time </span> <span className="maxCycleTime"/>{Helpers.formatDuration(kpis.process.maxCycleTime, false)}</td>
                                <td><span className="col-title">Average cycle time </span> <span className="averageCycleTime"/>{Helpers.formatDuration(kpis.process.averageCycleTime, false)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="results-box">
                    <h3>Process instance cycle times excluding off-timetable hours</h3>
                    <table>
                        <tbody>
                            <tr>
                                <td><span className="col-title">Minimum cycle time </span> <span className="minDuration"/>{Helpers.formatDuration(kpis.process.minDuration, false)}</td>
                                <td><span className="col-title">Maximum cycle time </span> <span className="maxDuration"/>{Helpers.formatDuration(kpis.process.maxDuration, false)}</td>
                                <td><span className="col-title">Average cycle time </span> <span className="averageDuration"/>{Helpers.formatDuration(kpis.process.averageDuration, false)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="results-box">
                    <h3>Process instance costs</h3>
                    <table>
                        <tbody>
                            <tr>
                                <td><span className="col-title">Minimum process cost </span> <span className="minCost"/>{Helpers.formatCost(kpis.process.minCost, this.props.currency)}</td>
                                <td><span className="col-title">Maximum process cost </span> <span className="maxCost"/>{Helpers.formatCost(kpis.process.maxCost, this.props.currency)}</td>
                                <td><span className="col-title">Average cost </span> <span className="averageCost"/>{Helpers.formatCost(kpis.process.averageCost, this.props.currency)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div id="result-table" className="results-box">
            <h3>Activity durations, costs, waiting times, deviations from thresholds</h3>
            <table className="task-kpi-table">
                <tbody>
                    <tr>
                        <td colSpan={2}></td>
                        <td colSpan={3} className="col-group-title"><span className="waitingTimeTitle col-title">Waiting time</span></td>
                        <td colSpan={3} className="col-group-title"><span className="durationTitle col-title">Duration</span></td>
                        <td colSpan={3} className="col-group-title"><span className="durationDeviationTitle col-title">Duration over threshold</span></td>
                        <td colSpan={3} className="col-group-title"><span className="costTitle col-title">Cost</span></td>
                        <td colSpan={3} className="col-group-title"><span className="costDeviationTitle col-title">Cost over threshold</span></td>
                    </tr>
                    <tr>
                        <td><span className="col-title">Name</span></td>
                        <td><span className="col-title">Count</span></td>
                        <td><span className="waitingTimeTitle col-title">Min</span></td>
                        <td><span className="waitingTimeTitle col-title">Avg</span></td>
                        <td><span className="waitingTimeTitle col-title">Max</span></td>
                        <td><span className="durationTitle col-title">Min</span></td>
                        <td><span className="durationTitle col-title">Avg</span></td>
                        <td><span className="durationTitle col-title">Max</span></td>
                        <td><span className="durationDeviationTitle col-title">Min</span></td>
                        <td><span className="durationDeviationTitle col-title">Avg</span></td>
                        <td><span className="durationDeviationTitle col-title">Max</span></td>
                        <td><span className="costTitle col-title">Min</span></td>
                        <td><span className="costTitle col-title">Avg</span></td>
                        <td><span className="costTitle col-title">Max</span></td>
                        <td><span className="costDeviationTitle col-title">Min</span></td>
                        <td><span className="costDeviationTitle col-title">Avg</span></td>
                        <td><span className="costDeviationTitle col-title">Max</span></td>
                    </tr>
                    {tasks}
                </tbody>
            </table>
        </div>
    </div>);
    }

    private createBarChart(options: any, data: qbpapi.HistogramDataType, id: string, formatTime: boolean = true): Chart {
        if (!data)
            return (<ProgressBar
                type='circular'
                mode='indeterminate'
            />);

        let defaultOptions = {
            'legend': 'none',
            'hAxis.textStyle': {
                'fontSize': 10
            },
            'hAxis.slantedText': false,
            'chartArea.left': 1,
            'chartArea.top': 1,
            'colors': ['#3f51b5', '#3f51b5'],
            'titleTextStyle': {
                'color': '#5f5851'
            }
        };
        const finalOptions = Object.assign({}, defaultOptions, options);

        const columns = [
            {
                type: 'string',
                label: 'Interval',
            },
            {
                type: 'number',
                label: 'Count',
            }
        ];
        const rows = this.getRows(data, formatTime);

        return (
            <Chart
                chartType="BarChart"
                options={finalOptions}
                graph_id={id}
                height='250px'
                width='460px'
                columns={columns}
                rows={rows}
            />
        );
    }

    private getRows(data: qbpapi.HistogramDataType, formatTime: boolean = true): Array<any> {
        data.min = Helpers.ensureNumber(data.min);
        data.binWidth = Helpers.ensureNumber(data.binWidth);

        let numRows;
        for (numRows = data.values.value.length; numRows > 0; numRows--) {
            if (Helpers.ensureNumber(data.values.value[numRows - 1]) != 0)
                break;
        }

        let rowData = [];
        for (var j = 0; j < numRows; ++j) {
            const fromVal = Math.max(0, Math.round((data.min + j * data.binWidth) * 10) / 10);
            const toVal = Math.round((data.min + (j + 1) * data.binWidth) * 10) / 10;

            const from = (formatTime) ? Helpers.formatDuration(fromVal) : fromVal + '';
            const to = (formatTime) ? Helpers.formatDuration(toVal) : toVal + '';

            rowData.push([
                from + " - " + to,
                Helpers.ensureNumber(data.values.value[j])
            ]);
        }


        return rowData;
    }

    private createResourceUtilizationChart(kpiData: qbpapi.SimulationKPIType, id: string): Chart {
        if (!kpiData)
            return null;

        const defaultOptions = {
            'legend': 'none',
            'hAxis.textStyle': {
                'fontSize': 10
            },
            'hAxis.slantedText': false,
            'chartArea.left': 1,
            'chartArea.top': 1,
            'colors': ['#3f51b5', '#3f51b5'],
            'titleTextStyle': {
                'color': '#5f5851'
            },
            'title': 'Resource utilization %',
            'vAxis.title': '# of processes',
        };

        const columns = [
            {
                type: 'string',
                label: 'Resource',
            },
            {
                type: 'number',
                label: '% of time occupied',
            }
        ];

        let rows = [];
        kpiData.resources.resource.forEach(resource => {
            let resourceData = this.props.resources.resource.find((r) => r.id === resource.id);
            rows.push([
                (resourceData ? resourceData.name : 'Resource ' + resource.id),
                Math.round(Helpers.ensureNumber(resource.utilization) * 10000) / 100
            ]);
        });

        return (
            <Chart
                chartType="BarChart"
                options={defaultOptions}
                graph_id={id}
                height='250px'
                width='460px'
                columns={columns}
                rows={rows}
            />
        );
    }
}