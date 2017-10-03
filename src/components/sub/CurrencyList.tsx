import * as React from 'react'

import Dropdown from 'react-toolbox/lib/dropdown';
import Tooltip from 'react-toolbox/lib/tooltip';

const TooltipDropdown = Tooltip(Dropdown)

interface Props {
    value: string;
    onChange: (value: string) => void;
}

const currencies = ['EUR', 'USD', 'CAD', 'GBP', 'CHF', 'NZD', 'AUD', 'JPY'];
const listSource = currencies.map(curr => { return { value: curr, label: curr}});

export class CurrencyList extends React.PureComponent<Props, undefined> {

    constructor (props: Props) {
        super(props);
    }

    private onChange = (value: string) => {
        this.props.onChange(value);

    }

    shouldComponentUpdate(nextProps: Props, nextState: undefined) {
        return nextProps.value !== this.props.value;
    }

    public render() {
        return <TooltipDropdown
                    label="Currency"
                    value={this.props.value}
                    onChange={this.onChange}
                    source={listSource}
                    tooltip="Currency is information only. Used in the simulation results page."
                    required
                />
    }
}
