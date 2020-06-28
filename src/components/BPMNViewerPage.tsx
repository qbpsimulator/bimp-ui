import * as React from 'react'
import { connect } from 'react-redux'

import * as Types from '../types'
import { store } from '../store'

import { BPMNViewer, BPMNViewerProps, HeatmapType } from './BPMNViewer'
import { TooltipDropdown } from './sub/CoreComponents'

const BIMP_MAIN_WINDOW_NAME = 'BIMP-MAIN-WINDOW'

import './BPMNViewerPage.sass'

function openNewWindow(targetName: string = '_blank', url: string): Window {
    window.name = BIMP_MAIN_WINDOW_NAME
    return window.open(url, targetName, 'width=1000, location=no, menubar=no, status=no, resizable=yes, toolbar=no, scrollbars=yes')
}

export function openBpmnViewer(targetName: string = '_blank'): Window {
    const linkPrefix = store.getState().application.config.linkPrefix || ''

    return openNewWindow(targetName, linkPrefix + 'bpmnViewer')
}

export function openHeatmapViewer(targetName: string = '_blank'): Window {
    const linkPrefix = store.getState().application.config.linkPrefix || ''
    return openNewWindow(targetName, linkPrefix + 'heatmapViewer')
}

export function openAndFocusElementInOpenerWindow(elementId: string) {
    const w = window.open('', BIMP_MAIN_WINDOW_NAME)
    const element = w.document.getElementById(elementId)
    if (element) {
        element.scrollIntoView(true)
    }
}

const heatmapTypes = [
    { value: 'waiting', label: 'Waiting times' },
    { value: 'count', label: 'Counts' },
    { value: 'cost', label: 'Costs' },
    { value: 'duration', label: 'Durations' },
    { value: '', label: 'None' }
]

interface Props {
    readonly showHeatmap?: boolean
}

interface State {
    readonly heatmapType?: HeatmapType
}

const mapStateToProps = (state: Types.StoreType, props: Props) => ({
    app: state.application,
    modelSimInfo: state.modelSimInfo,
    simulation: state.simulation
})

class BPMNViewerPage extends React.PureComponent<BPMNViewerProps & Props, State> {
    private _bpmnContent: string = ''

    constructor(props: BPMNViewerProps & Props) {
        super(props)

        this.state = { heatmapType: props.showHeatmap ? 'waiting' : undefined }

        const parser = props.app.activeParser
        if (parser) {
            this._bpmnContent = parser.getFileContents()
        }
    }

    private onHeatmapTypeChanged = (value: HeatmapType) => {
        this.setState({ ...this.state, heatmapType: value })
    }

    render() {
        const { showHeatmap, ...props } = this.props
        return (
            <div id="bpmn-viewer-parent">
                <div id="bpmn-viewer-container" className="content section">
                    <div id="bpmn-viewer-heatmap-header">
                        <h2>{showHeatmap ? 'Heatmap' : 'BPMN Viewer'}</h2>
                        {showHeatmap && (
                            <div className="columns is-vcentered">
                                <div className="column is-narrow">
                                    <p className="subtitle">Heatmap based on</p>
                                </div>
                                <div className="column is-2">
                                    <TooltipDropdown
                                        fullWidth
                                        source={heatmapTypes}
                                        value={this.state.heatmapType}
                                        onChange={(e) => this.onHeatmapTypeChanged(e.target.value as HeatmapType)}
                                        tooltip="Select based on which results to show the heatmap"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <BPMNViewer {...props} heatmapType={this.state.heatmapType} />
                </div>
            </div>
        )
    }
}

export default connect(mapStateToProps)(BPMNViewerPage)
