import * as React from 'react'

import { TooltipDropdown } from './CoreComponents'

interface Props {
    value: string
    onChange: (value: string) => void
}

const currencies = ['EUR', 'USD', 'CAD', 'GBP', 'CHF', 'NZD', 'AUD', 'JPY']
const listSource = currencies.map((curr) => {
    return { value: curr, label: curr }
})

export class CurrencyList extends React.PureComponent<Props, undefined> {
    constructor(props: Props) {
        super(props)
    }

    private onChange = (value: string) => {
        this.props.onChange(value)
    }

    public render() {
        return (
            <TooltipDropdown
                label="Currency"
                value={this.props.value}
                onChange={(e) => this.onChange(e.target.value as string)}
                source={listSource}
                tooltip="Currency is information only. Used in the simulation results page."
                required
            />
        )
    }
}
