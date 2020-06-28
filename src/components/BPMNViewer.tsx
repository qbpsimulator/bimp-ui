import * as React from 'react'

import { Helpers } from '../model-components/Helpers'
import * as Types from '../types'

import { openAndFocusElementInOpenerWindow } from './BPMNViewerPage'
import * as qbpapi from '../../xmlns/www.qbp-simulator.com/ApiSchema201212'

import Viewer from 'bpmn-js/lib/Viewer'
import { CustomBPMNRendererModule, getHeatMapColorforValue } from '../bpmn/CustomBPMNRenderer'
import { HeatmapLegend } from './sub/HeatmapLegend'

export type HeatmapType = 'waiting' | 'count' | 'cost' | 'duration'

export interface BPMNViewerProps {
    app: Types.ApplicationType
    modelSimInfo: Types.ProcessSimulationInfoType
    simulation: Types.SimulationType
    heatmapType?: HeatmapType
}

interface State {}

function wihtoutProcessId(id: string) {
    const p = id.lastIndexOf('.')
    return p > 0 ? id.substr(p + 1) : id
}

export class BPMNViewer extends React.PureComponent<BPMNViewerProps, State> {
    private _container: HTMLDivElement
    private _bpmnViewer = null
    private elementCache = new Map<string, qbpapi.ElementKPIType>()

    constructor(props: BPMNViewerProps) {
        super(props)

        this.calculateMaxHeat(props.heatmapType)
    }

    state: State = {}

    componentDidMount() {
        this.cacheElementStats()
        this.initViewer()
    }

    componentWillUpdate(nextProps: BPMNViewerProps) {
        if (nextProps.heatmapType !== this.props.heatmapType) {
            this.calculateMaxHeat(nextProps.heatmapType)
        }
    }

    componentDidUpdate(prevProps: BPMNViewerProps) {
        if (prevProps.heatmapType !== this.props.heatmapType) {
            this.initViewer()
        }
    }

    private initViewer() {
        this._bpmnViewer = new Viewer({
            container: this._container,
            additionalModules: [CustomBPMNRendererModule(this.getHeatRatioForElement)]
        })
        this._bpmnViewer.importXML(this.props.app.activeParser.getFileContents(), (err) => {
            if (err) {
                console.log('error rendering', err)
            } else {
                this.handleResize()
                // this.initHeatmap();
                this.applyNoSimInfoColorMarkers()
                this.hookBpmnEvents()
                console.log('BPMN viewer opened')
            }
        })

        const onWindowSizeChanged = () => {
            this.handleResize()
        }

        window.addEventListener('resize', onWindowSizeChanged, true)
    }

    private handleResize() {
        const canvas = this._bpmnViewer.get('canvas')
        canvas.zoom('fit-viewport')
    }

    private applyNoSimInfoColorMarkers() {
        const canvas = this._bpmnViewer.get('canvas')
        const parser = this.props.app.activeParser
        const validator = this.props.app.validator

        const marker = (validateOk: boolean, hasAnySimInfo: boolean) =>
            validateOk && hasAnySimInfo ? 'with-simulation-info' : validateOk ? 'without-simulation-info' : 'simulation-info-error'

        let sfElementsById = {}
        this.props.modelSimInfo.sequenceFlows.sequenceFlow.forEach((element) => {
            sfElementsById[element.elementId] = element
        })

        this.props.modelSimInfo.elements.element.forEach((element) => {
            canvas.addMarker(
                element.elementId,
                marker(!validator.validateElement(element.elementId), Helpers.elementHasAnySimulationInfo(element))
            )
        })

        this.props.app.activeParser.getGateways().forEach((gateway) => {
            let gateWayOk = true
            gateway.sequenceFlows.forEach((sequenceFlow) => {
                const element = sfElementsById[sequenceFlow.id]
                const elementOk = !!element && Helpers.sequenceFlowHasAnySimulationInfo(element)
                gateWayOk = gateWayOk && elementOk
                canvas.addMarker(element.elementId, marker(!validator.validateElement(element.elementId), elementOk))
            })

            canvas.addMarker(gateway.id, marker(!validator.validateElement(gateway.id), gateWayOk))
        })
    }

    private hookBpmnEvents() {
        const eventBus = this._bpmnViewer.get('eventBus')
        const overlays = this._bpmnViewer.get('overlays')

        const events = ['element.hover', 'element.out', 'element.click']

        const openerHasElement = (elementId: string) => {
            try {
                return !!window.opener && !!window.opener.document.getElementById(elementId)
            } catch (err) {
                return false
            }
        }

        events.forEach((event) => {
            eventBus.on(event, (e) => {
                // e.element = the model element
                // e.gfx = the graphical element

                switch (event) {
                    case 'element.hover':
                        {
                            e.gfx.style.cursor = openerHasElement(e.element.id) ? 'pointer' : 'initial'

                            if (!this.props.heatmapType) return

                            const content = this.getOverlayForElement(e.element.id)
                            if (content) {
                                overlays.add(e.element.id, {
                                    position: {
                                        bottom: 0,
                                        right: 0
                                    },
                                    html: content
                                })
                            }
                        }
                        break
                    case 'element.out':
                        {
                            e.gfx.style.cursor = 'initial'

                            if (!this.props.heatmapType) return

                            if (this.getOverlayForElement(e.element.id)) overlays.remove({ element: e.element.id })
                        }
                        break
                    case 'element.click': {
                        try {
                            if (openerHasElement(e.element.id)) {
                                openAndFocusElementInOpenerWindow(e.element.id)
                            }
                        } catch (err) {
                            console.error('error', err)
                        }
                    }
                }
            })
        })
    }

    private setContainer = (container: HTMLDivElement) => {
        this._container = container
    }

    cacheElementStats() {
        this.elementCache.clear()
        if (!this.props.simulation.results) {
            return
        }

        if (!this.props.simulation.results.Results.elements && !this.props.simulation.results.Results.elements.element) return

        const elements = this.props.simulation.results.Results.elements.element || []
        elements.forEach((el) => {
            this.elementCache.set(wihtoutProcessId(el.id), el)
        })
    }

    private getElementSimulationStats(elementOrId: any) {
        if (!this.props.simulation.results) return null

        var element = null
        var elements = this.props.simulation.results.Results.elements
        if (typeof elementOrId === 'object') {
            element = elementOrId
        } else if (elements && elements.element) {
            return this.elementCache.get(elementOrId)
        }
        return element
    }

    private getStatsObjectForElement = (elementOrId: any, heatmapType: HeatmapType): Partial<qbpapi.StatsValueType> => {
        const element = this.getElementSimulationStats(elementOrId)

        if (element) {
            if (heatmapType == 'count') return { average: parseInt(element.count) } as any
            if (heatmapType == 'cost') return element.cost
            if (heatmapType == 'duration') return element.duration
            if (heatmapType == 'waiting') return element.waitingTime
        }

        return null
    }

    private getAverageForElement = (elementOrId: any, heatmapType: HeatmapType): number | undefined => {
        const obj = this.getStatsObjectForElement(elementOrId, heatmapType)

        if (obj) {
            return obj.average
        }

        return undefined
    }

    private getHeatRatioForElement = (elementOrId: any): number | undefined => {
        const heat = this.getAverageForElement(elementOrId, this.props.heatmapType)
        if (typeof heat == 'undefined') {
            return undefined
        }

        return heat / this.maxHeatValue
    }

    private maxHeatValue: number = 0
    private calculateMaxHeat(heatmapType: HeatmapType) {
        if (!this.props.simulation.results) {
            return
        }

        if (!heatmapType) {
            return
        }

        this.maxHeatValue = 0
        const elements = this.props.simulation.results.Results.elements
        if (elements && heatmapType) {
            // Process elements from BIMP results
            elements.element.forEach((element) => {
                // Read the KPI from results
                const value = this.getAverageForElement(element, heatmapType)
                if (typeof value === 'undefined') {
                    return
                }
                // Save the maximum value
                this.maxHeatValue = Math.max(this.maxHeatValue, value)
            })
        }
    }

    private formatHeatmapValue(value: number): string {
        if (this.props.heatmapType == 'count') return value + ''
        if (this.props.heatmapType == 'cost') return Helpers.formatCost(value, this.props.modelSimInfo.currency)
        if (this.props.heatmapType == 'duration') return Helpers.formatDuration(value, true)
        if (this.props.heatmapType == 'waiting') return Helpers.formatDuration(value, true)

        return ''
    }

    private getOverlayForElement(elementId: string) {
        const heat = this.getStatsObjectForElement(elementId, this.props.heatmapType)
        if (!heat) return null

        const lines = []

        const addLine = function (data: string) {
            lines.push(`<div class="bimp-heatmap-overlay-value">${data}</div>`)
        }

        if (this.props.heatmapType == 'count') addLine(this.formatHeatmapValue(heat.average))
        else {
            addLine('Average: ' + this.formatHeatmapValue(heat.average))
            addLine('Min: ' + this.formatHeatmapValue(heat.min))
            addLine('Max: ' + this.formatHeatmapValue(heat.max))
        }

        return `
        <div class="bimp-heatmap-overlay-container">
            <div class="bimp-heatmap-overlay">
                ${lines.join('')}
            </div>
        </div>`
    }

    shouldComponentUpdate(nextProps: BPMNViewerProps, state: State) {
        return nextProps.heatmapType !== this.props.heatmapType
    }

    render() {
        return (
            <div className="bpmn-viewer-root" key={Math.random()}>
                <div id="bpmn-viewer" ref={this.setContainer} />
                {this.maxHeatValue !== undefined && this.props.heatmapType && (
                    <HeatmapLegend
                        key={this.props.heatmapType}
                        getItem={(value: number) => ({
                            color: getHeatMapColorforValue(value),
                            value: this.formatHeatmapValue(Math.round(this.maxHeatValue * value))
                        })}
                    />
                )}
            </div>
        )
    }
}
