import * as React from 'react'
import { ValidatedDropdown, ValidatedInput, ValidateMeComponent } from './CoreComponents'

import { Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib/table';
import Tooltip from 'react-toolbox/lib/tooltip';

import * as Types from '../../types'
import * as Actions from '../../actions'

import { Helpers } from '../../model-components/Helpers'
import { Validate } from '../../model-components/Validator'

const TooltipCell = Tooltip(TableCell);

interface Props extends Types.DispatchProps {
	resources: Types.ProcessSimulationInfoTypeResourcesType;
	timetables: Types.ProcessSimulationInfoTypeTimetablesType;
}

interface State {
}

const initialState: State = {
}

export class Resources extends ValidateMeComponent<Props, State> {

    constructor (props: Props) {
        super(props);

        this.state = initialState;
    }

    public getElementId(): string {
        return undefined;
    }

    public validate(): string {
        const errorStr = Validate.between(this.props.resources.resource.length + '', 1, 100);

        if (!!errorStr) {
            return 'Total number of different resources must be between 1 and 100.';
        }

        return '';
    }

    onResourceInputChange = (resourceId: string, name: string, value: string | number) => {
        this.props.dispatch(Actions.updateResourceProperty(resourceId, name, value));
    };

    render() {
        const timetableSource = this.props.timetables.timetable.map((tt: Types.TimeTable) =>
            ({ value: tt.id, label: Helpers.getTimeTableName(tt)})
        );

        const TimetableDropdown = (props) =>
            <ValidatedDropdown
                {...props}
                source={timetableSource}
                required
            />

        const alignCenterStyle = {'textAlign': 'center'};

        const resources = this.props.resources.resource.map((resource: Types.Resource) => {
            return (
                <TableRow key={resource.id}>
                    <TableCell>
                        <ValidatedInput
                            value={Helpers.s(resource.name)}
                            required
                            onChange={(v) => this.onResourceInputChange(resource.id, 'name', v) }
                            type="text"
                            hint="required"
                        />
                    </TableCell>
                    <TableCell>
                        <ValidatedInput
                            value={Helpers.s(resource.totalAmount)}
                            required
                            onChange={(v) => this.onResourceInputChange(resource.id, 'totalAmount', parseFloat(v)) }
                            type="number"
                            hint="required"
                            validators={[v => Validate.between(v, 0, 1000)]}
                        />
                    </TableCell>
                    <TableCell>
                        <ValidatedInput
                            value={Helpers.s(resource.costPerHour)}
                            onChange={(v) => this.onResourceInputChange(resource.id, 'costPerHour', parseFloat(v)) }
                            type="number"
                        />
                    </TableCell>
                    <TableCell>
                        <TimetableDropdown
                            value={resource.timetableId}
                            onChange={(v) => this.onResourceInputChange(resource.id, 'timetableId', v)}
                            hint="required"
                            required
                        />
                    </TableCell>
                    <TableCell style={alignCenterStyle}>
                        <a className="trigger remove"
                            title="Remove resource"
                            onClick={() => this.props.dispatch(Actions.deleteResource(resource.id))}>X</a>
                    </TableCell>
                </TableRow>
            );
        });

       return (
            <div>
                <h2 className="toggle-trigger">
                    Resources
                    <a onClick={() => this.props.dispatch(Actions.addResource())} className="trigger add" title="Add new resource">Add</a>
                </h2>
                <div className="toggle-div">
                    <div className="resources">
                        <Table selectable={false} style={{ marginTop: 0 }}>
                            <TableHead>
                                <TooltipCell tooltip="Name of the resource">
                                    Name
                                </TooltipCell>
                                <TooltipCell tooltip="Amount of the resources in the scenario">
                                    # of Resources
                                </TooltipCell>
                                <TooltipCell tooltip="Cost of the resource, per hour">
                                    Cost per Hour
                                </TooltipCell>
                                <TooltipCell
                                    tooltip="Timetable / work schedule to define when resource is available to complete tasks">
                                    Timetable
                                </TooltipCell>
                                <TableCell style={alignCenterStyle}>Remove</TableCell>
                            </TableHead>
                            {resources}
                        </Table>
                    </div>
                </div>
            </div>
        );
    }
}
