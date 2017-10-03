import * as React from 'react'
import { ValidatedInput, ValidatedDropdown } from './CoreComponents'
import { Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib/table';
import Tooltip from 'react-toolbox/lib/tooltip';

import * as Actions from '../../actions'
import * as Types from '../../types'

import TimePicker from 'react-toolbox/lib/time_picker';
import { Helpers } from '../../model-components/Helpers'

const TooltipCell = Tooltip(TableCell);

const weekdaySource = [
    { value: 'MONDAY', label: 'Monday'},
    { value: 'TUESDAY', label: 'Tuesday'},
    { value: 'WEDNESDAY', label: 'Wednesday'},
    { value: 'THURSDAY', label: 'Thursday'},
    { value: 'FRIDAY', label: 'Friday'},
    { value: 'SATURDAY', label: 'Saturday'},
    { value: 'SUNDAY', label: 'Sunday'}];

const DaysDropdown = (props) =>
    <ValidatedDropdown
        {...props}
        source={weekdaySource}
        required
    />

interface Props extends Types.DispatchProps {
    timetables: Types.ProcessSimulationInfoTypeTimetablesType
}

interface State {
}

const initialState: State = {
}

export class TimeTables extends React.PureComponent<Props, State> {

    constructor (props: Props) {
        super(props);

        this.state = initialState;
    }

    onInputChange = (timetableId: string, ruleIndex: number, name: string, value: string) => {
        this.props.dispatch(Actions.updateTimeTableProperty(timetableId, ruleIndex, name, value));
    };

    onTimeChange = (timetableId: string, ruleIndex: number, fieldName: string, date: Date) => {
        this.props.dispatch(Actions.updateTimeTableProperty(timetableId, ruleIndex, fieldName, Helpers.fromTime(date)));
    };

    render(): any {
        const alignCenterStyle = {'textAlign': 'center'};

        const timeTables = this.props.timetables.timetable.map((timeTable: Types.TimeTable) => {
            const ttLabelText = timeTable.id === "QBP_247_TIMETABLE" ?
                '24/7 is a special timetable that makes associated resource always available.' :
                'Default timetable cannot be deleted. Process instances are created according to the timetable and by default all resources are using the timetable.';

            const isDefault = Helpers.isDefaultTimeTable(timeTable);
            return timeTable.rules.rule.map((rule, rIndex) => {
                return (
                    <TableRow key={timeTable.id + rIndex}>
                        {isDefault ?
                            <TooltipCell tooltip={ttLabelText}>
                                {Helpers.getTimeTableName(timeTable)}
                            </TooltipCell>
                            :
                            <TableCell>
                                <ValidatedInput
                                    value={Helpers.getTimeTableName(timeTable)}
                                    required
                                    onChange={(v) => this.onInputChange(timeTable.id, -1, 'name', v)}
                                    type="text"
                                    hint="required"
                                />
                            </TableCell>
                        }
                        <TableCell>
                            <DaysDropdown
                                value={Helpers.s(rule.fromWeekDay)}
                                onChange={(v) => this.onInputChange(timeTable.id, rIndex, 'fromWeekDay', v) }
                                hint="required"
                            />
                        </TableCell>
                        <TableCell>
                            <DaysDropdown
                                value={Helpers.s(rule.toWeekDay)}
                                onChange={(v) => this.onInputChange(timeTable.id, rIndex, 'toWeekDay', v) }
                                hint="required"
                            />
                        </TableCell>
                        <TableCell>
                            <div className='TimePicker'>
                                <TimePicker
                                    onChange={(date: Date) => this.onInputChange(timeTable.id, rIndex, 'fromTime', Helpers.fromTime(date))}
                                    value={Helpers.toTime(rule.fromTime)}
                                />
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className='TimePicker'>
                                <TimePicker
                                    onChange={(date: Date) => this.onInputChange(timeTable.id, rIndex, 'toTime', Helpers.fromTime(date))}
                                    value={Helpers.toTime(rule.toTime)}
                                />
                            </div>
                        </TableCell>
                        <TableCell style={alignCenterStyle}>
                            {!isDefault &&<a className="trigger remove" title="Remove timetable"
                                onClick={() => this.props.dispatch(Actions.deleteTimeTable(timeTable.id))}>X</a>}
                        </TableCell>
                    </TableRow>
                )
            });
        });


        return (
            <div>
                <h2 className="toggle-trigger">
                    Timetables / Work schedules
                    <a className="trigger add" title="Add new timetable" onClick={() => this.props.dispatch(Actions.addTimeTable())}>Add</a>
                </h2>
                <div className="toggle-div">
                    <div className="timetables">
                        <Table selectable={false} style={{ marginTop: 0 }}>
                            <TableHead>
                                <TooltipCell tooltip="Name of the timetable">
                                    Name
                                </TooltipCell>
                                <TooltipCell tooltip="First day of the week when worker is available">
                                    Begin day
                                </TooltipCell>
                                <TooltipCell tooltip="Last day of the week when worker is available">
                                    End day
                                </TooltipCell>
                                <TooltipCell tooltip="Time in a day when resource becomes available. HH:MM">
                                    Begin time
                                </TooltipCell>
                                <TooltipCell tooltip="Time in a day when resource becomes unavailable. HH:MM">
                                    End time
                                </TooltipCell>
                                <TableCell style={alignCenterStyle}>Remove</TableCell>
                            </TableHead>
                            {timeTables}
                        </Table>
                    </div>
                </div>
            </div>
        );
    }
}
