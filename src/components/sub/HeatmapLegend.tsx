import * as React from 'react'

const LINE_COUNT = 10

interface Item {
    value: string
    color: string
}

interface Props {
    getItem: (val: number) => Item
}

export class HeatmapLegend extends React.Component<Props> {
    render() {
        const lines = []
        for (let i = 0; i < LINE_COUNT; i++) {
            const item = this.props.getItem(i / (LINE_COUNT - 1))
            lines.push(
                <tr key={i}>
                    <td className="legend-color" style={{ backgroundColor: item.color }}>
                        &nbsp;
                    </td>
                    <td className="legend-value">{item.value}</td>
                </tr>
            )
        }

        return (
            <div className="heatmap-legend">
                <h3>Legend</h3>
                <table>
                    <tbody>
                        <tr>
                            <th className="legend-color">Color</th>
                            <th className="legend-value">Value</th>
                        </tr>
                        {lines}
                    </tbody>
                </table>
            </div>
        )
    }
}
