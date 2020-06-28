import * as React from 'react'
import { ValidatedInput, ValidatedDropdown, TooltipTableCell, TooltipTimePicker } from './CoreComponents'
import IconButton from '@material-ui/core/IconButton'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'

import * as Actions from '../../actions'
import * as Types from '../../types'

import { Helpers } from '../../model-components/Helpers'

const weekdaySource = [
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' },
    { value: 'SUNDAY', label: 'Sunday' }
]

const DaysDropdown = (props) => <ValidatedDropdown {...props} source={weekdaySource} required />

interface Props extends Types.DispatchProps {
    timetables: Types.ProcessSimulationInfoTypeTimetablesType
}

interface State {}

const initialState: State = {}

export class TimeTables extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = initialState
    }

    onInputChange = (timetableId: string, ruleIndex: number, name: string, value: string) => {
        this.props.dispatch(Actions.updateTimeTableProperty(timetableId, ruleIndex, name, value))
    }

    onTimeChange = (timetableId: string, ruleIndex: number, fieldName: string, date: Date) => {
        this.props.dispatch(Actions.updateTimeTableProperty(timetableId, ruleIndex, fieldName, Helpers.fromTime(date)))
    }

    render(): any {
        const alignCenterStyle = { textAlign: 'center' as any }

        const timeTables = this.props.timetables.timetable.map((timeTable: Types.TimeTable) => {
            const ttLabelText =
                timeTable.id === 'QBP_247_TIMETABLE'
                    ? '24/7 is a special timetable that makes associated resource always available.'
                    : 'Default timetable cannot be deleted. Process instances are created according to the timetable and by default all resources are using the timetable.'

            const isDefault = Helpers.isDefaultTimeTable(timeTable)
            return timeTable.rules.rule.map((rule, rIndex) => {
                return (
                    <TableRow key={timeTable.id + rIndex}>
                        {isDefault ? (
                            <TooltipTableCell tooltip={ttLabelText} valign="middle">
                                {Helpers.getTimeTableName(timeTable)}
                            </TooltipTableCell>
                        ) : (
                            <TableCell>
                                <ValidatedInput
                                    value={Helpers.getTimeTableName(timeTable)}
                                    required
                                    onChange={(v) => this.onInputChange(timeTable.id, -1, 'name', v)}
                                    type="text"
                                    hint="required"
                                    label=" "
                                />
                            </TableCell>
                        )}
                        <TableCell>
                            <DaysDropdown
                                value={Helpers.s(rule.fromWeekDay)}
                                onChange={(v) => this.onInputChange(timeTable.id, rIndex, 'fromWeekDay', v)}
                                hint="required"
                                label=" "
                            />
                        </TableCell>
                        <TableCell>
                            <DaysDropdown
                                value={Helpers.s(rule.toWeekDay)}
                                onChange={(v) => this.onInputChange(timeTable.id, rIndex, 'toWeekDay', v)}
                                hint="required"
                                label=" "
                            />
                        </TableCell>
                        <TableCell>
                            <div className="TimePicker">
                                <TooltipTimePicker
                                    ampm={false}
                                    tooltip="Begin time"
                                    onChange={(date: Date) => this.onInputChange(timeTable.id, rIndex, 'fromTime', Helpers.fromTime(date))}
                                    value={Helpers.toTime(rule.fromTime)}
                                    label=" "
                                />
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="TimePicker">
                                <TooltipTimePicker
                                    ampm={false}
                                    tooltip="End time"
                                    onChange={(date: Date) => this.onInputChange(timeTable.id, rIndex, 'toTime', Helpers.fromTime(date))}
                                    value={Helpers.toTime(rule.toTime)}
                                    label=" "
                                />
                            </div>
                        </TableCell>
                        <TableCell style={alignCenterStyle}>
                            {!isDefault && (
                                <IconButton
                                    color="primary"
                                    size="small"
                                    title="Remove timetable"
                                    onClick={() => this.props.dispatch(Actions.deleteTimeTable(timeTable.id))}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </TableCell>
                    </TableRow>
                )
            })
        })

        return (
            <div className="box">
                <p className="subtitle">
                    Timetables / Work schedules
                    <IconButton color="primary" title="Add a new timetable" onClick={() => this.props.dispatch(Actions.addTimeTable())}>
                        <AddIcon />
                    </IconButton>
                </p>
                <div className="timetables">
                    <Table style={{ marginTop: 0 }}>
                        <TableHead>
                            <TableRow>
                                <TooltipTableCell tooltip="Name of the timetable">Name</TooltipTableCell>
                                <TooltipTableCell tooltip="First day of the week when worker is available">Begin day</TooltipTableCell>
                                <TooltipTableCell tooltip="Last day of the week when worker is available">End day</TooltipTableCell>
                                <TooltipTableCell tooltip="Time in a day when resource becomes available. HH:MM">
                                    Begin time
                                </TooltipTableCell>
                                <TooltipTableCell tooltip="Time in a day when resource becomes unavailable. HH:MM">
                                    End time
                                </TooltipTableCell>
                                <TableCell style={alignCenterStyle}>Remove</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{timeTables}</TableBody>
                    </Table>
                </div>
            </div>
        )
    }
}
