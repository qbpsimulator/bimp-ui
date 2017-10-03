import * as React from 'react'

import BPMNParser from '../model-components/BPMNParser'
import { Helpers } from '../model-components/Helpers'
import * as Types from '../types'

import { openAndFocusElementInOpenerWindow } from './BPMNViewerPage'
import * as qbpapi from '../../xmlns/www.qbp-simulator.com/ApiSchema201212';


const BpmnJs = require('bpmn-js');
const Heatmap = require('heatmap.js')

export type HeatmapType = 'waiting' | 'count' | 'cost' | 'duration';

export interface BPMNViewerProps {
    app: Types.ApplicationType;
    modelSimInfo: Types.ProcessSimulationInfoType,
    simulation: Types.SimulationType;
    heatmapType?: HeatmapType;
}

function wihtoutProcessId(id: string) {
    const p = id.lastIndexOf('.');
    return p > 0 ? id.substr(p + 1) : id;
}

export class BPMNViewer extends React.PureComponent<BPMNViewerProps, undefined> {

    private _container: HTMLDivElement;
    private _bpmnViewer = null;
    private _heatmap: any;
    private _viewerLoaded: boolean = false;

    private onWindowSizeChanged = () => {
        this.handleResize();
    };

    componentDidMount() {
        this._bpmnViewer = new BpmnJs({ container: this._container });
        this._bpmnViewer.importXML(this.props.app.activeParser.getFileContents(), (err) => {
            if (err) {
                console.log('error rendering', err);
            } else {
                this._viewerLoaded = true;
                this.handleResize();
                this.initHeatmap();
                this.applyNoSimInfoColorMarkers();
                this.hookBpmnEvents();
                console.log('BPMN viewer opened');
            }
        });

        window.addEventListener('resize', this.onWindowSizeChanged, true);
    }

    private handleResize() {
        const canvas = this._bpmnViewer.get("canvas");
        canvas.zoom("fit-viewport");

        this.configureHeatmapSize();
        this.generateHeatmapData();
    }

    private applyNoSimInfoColorMarkers() {
        const canvas = this._bpmnViewer.get("canvas");
        const parser = this.props.app.activeParser;
        const validator = this.props.app.validator;

        const marker = (validateOk: boolean, hasAnySimInfo: boolean) => validateOk && hasAnySimInfo ? 'with-simulation-info' :
            (validateOk ? 'without-simulation-info' : 'simulation-info-error');

        let sfElementsById = {};
        this.props.modelSimInfo.sequenceFlows.sequenceFlow.forEach(element => {
            sfElementsById[element.elementId] = element;
        });

        this.props.modelSimInfo.elements.element.forEach(element => {
            canvas.addMarker(element.elementId, marker(
                !validator.validateElement(element.elementId),
                Helpers.elementHasAnySimulationInfo(element)));
        });

        this.props.app.activeParser.getGateways().forEach(gateway => {
            let gateWayOk = true;
            gateway.sequenceFlows.forEach(sequenceFlow => {
                const element = sfElementsById[sequenceFlow.id];
                const elementOk = !!element && Helpers.sequenceFlowHasAnySimulationInfo(element);
                gateWayOk = gateWayOk && elementOk;
                canvas.addMarker(element.elementId, marker(
                    !validator.validateElement(element.elementId),
                    elementOk));
            });

            canvas.addMarker(gateway.id, marker(
                !validator.validateElement(gateway.id),
                gateWayOk));
        })
    }

    private hookBpmnEvents() {
        const eventBus = this._bpmnViewer.get("eventBus");
        const overlays = this._bpmnViewer.get("overlays");

        const events = [
            'element.hover',
            'element.out',
            'element.click'
        ];

        const openerHasElement = (elementId: string) => {
            try {
                return !!window.opener && !!window.opener.document.getElementById(elementId);
            }
            catch (err) {
                return false;
            }
        };

        events.forEach(event => {
            eventBus.on(event, (e) => {
                // e.element = the model element
                // e.gfx = the graphical element

                switch (event) {
                    case 'element.hover': {
                        e.gfx.style.cursor = openerHasElement(e.element.id) ? "pointer" : "initial";

                        if (!this.props.heatmapType)
                            return;

                        const content = this.getOverlayForElement(e.element.id);
                        if (content) {
                            overlays.add(e.element.id, {
                                position: {
                                    bottom: 0,
                                    right: 0
                                },
                                html: content
                            });
                        }
                    }
                    break;
                    case 'element.out': {
                        e.gfx.style.cursor = "initial";

                        if (!this.props.heatmapType)
                            return;

                        if (this.getOverlayForElement(e.element.id))
                           overlays.remove({ element: e.element.id });
                    }
                    break;
                    case 'element.click': {
                        try {
                            if (openerHasElement(e.element.id)) {
                                openAndFocusElementInOpenerWindow(e.element.id);
                            }
                        }
                        catch (err) {
                            console.error("error", err);
                        }
                    }
                }
            });
        });
    }

    private setContainer = (container: HTMLDivElement) => {
        this._container = container;
    }

    private _heatmapContainer: Element;
    private initHeatmap() {
        if (this.props.heatmapType === undefined)
            return;

        if (!this._heatmap) {
            //  Create heatmap

            this._heatmapContainer = document.getElementsByClassName('djs-overlay-container').item(0);

            this._heatmap = Heatmap.create({
                container: this._heatmapContainer
            });
        }

        this.configureHeatmapSize();
        this.generateHeatmapData();
    }

    private configureHeatmapSize() {
        if (!this._heatmap)
            return;

        const canvas = this._bpmnViewer.get("canvas");
        const viewport = canvas.viewbox();

        this._heatmap.configure({
            container: this._heatmapContainer,
            width:  viewport.width + viewport.x,
            height: viewport.height + viewport.y
        });
    }

    private getElementSimulationStats(elementOrId: any) {
        var element = null;
        var elements = this.props.simulation.results.Results.elements;
        if (typeof elementOrId === "object") {
            element = elementOrId;
        }
        else if (elements && elements.element) {
            for (var i = 0; i < elements.element.length; ++i) {
                const el = elements.element[i];
                if (wihtoutProcessId(el.id) === elementOrId) {
                    element = el;
                    break;
                }
            }
        }
        return element;
    }

    private getHeatForElement(elementOrId: any): number | qbpapi.StatsValueType   {
        const element = this.getElementSimulationStats(elementOrId);

        if (element) {
            if (this.props.heatmapType == "count")
                return parseInt(element.count);
            if (this.props.heatmapType == "cost")
                return element.cost;
            if (this.props.heatmapType == "duration")
                return element.duration;
            if (this.props.heatmapType == "waiting")
                return element.waitingTime;
        }

        return -1;
    }

    private generateHeatmapData() {
        if (!this._heatmap)
            return;

        if (!this.props.simulation || !this.props.simulation.results)
           return;

        var heatmapData = [];
        var maxVal = 0;

        const elements = this.props.simulation.results.Results.elements;
        const heatmapType = this.props.heatmapType;
        if (elements && heatmapType) {
            const elementRegistry = this._bpmnViewer.get('elementRegistry');
            // Process elements from BIMP results
            elements.element.forEach((element) => {
                // Get shape for element ID
                var shape = elementRegistry.get(wihtoutProcessId(element.id));
                if (!shape)
                    return;

                // Read the KPI from results
                var value = this.getHeatForElement(element);
                if (typeof(value) == 'object') {
                    value = (value as qbpapi.StatsValueType).average;
                }

                // Save the maximum value
                if (value > maxVal)
                    maxVal = value;

                var overlayRadius = shape.height / 1.5;

                // Add data to heatmap
                heatmapData.push({
                    x: shape.x + shape.width / 2,
                    y: shape.y + shape.height / 2,
                    value: value,
                    radius: overlayRadius
                });

                // Add heat to incoming sequence flow from this element if it's not a gateway.
                // If element is gateway then heat for incoming flow is defined by the heat of the previous element.
                var isGateway = shape.incoming.length > 1;
                var step = 4;
                var pointRadius = 6;

                if (heatmapType == "count") {
                    shape.incoming.forEach((flowElement) => {
                        if (!flowElement.waypoints)
                            return;

                        if (isGateway) {
                            var source = flowElement.source;
                            value = this.getHeatForElement(source.id);
                        }

                        for (var i = 1; i < flowElement.waypoints.length; ++i) {
                            var x  = flowElement.waypoints[i].x - flowElement.waypoints[i-1].x;
                            var y  = flowElement.waypoints[i].y - flowElement.waypoints[i-1].y;

                            var c = Math.sqrt(x * x + y * y);
                            var pointCount = Math.round(c / step) + 1;

                            var dx = x / pointCount;
                            var dy = y / pointCount;

                            for (var j = (i == 1 ? 0 : 1); j <= pointCount; ++j) {
                                var linePoint =
                                {
                                    x: flowElement.waypoints[i-1].x + j * dx,
                                    y: flowElement.waypoints[i-1].y + j * dy,
                                    value: value,
                                    radius: pointRadius
                                };
                                heatmapData.push(linePoint);
                            }
                        }
                    });
                }
            });
        }

        this._heatmap.setData({
            max: maxVal * 1.05,
            data: heatmapData
        });
    }

    private formatHeatmapValue(value: number): string {
        if (this.props.heatmapType == "count")
            return value + '';
        if (this.props.heatmapType == "cost")
            return Helpers.formatCost(value, this.props.modelSimInfo.currency);
        if (this.props.heatmapType == "duration")
            return Helpers.formatDuration(value, true);
        if (this.props.heatmapType == "waiting")
            return Helpers.formatDuration(value, true);

        return '';
    }

    private getOverlayForElement(elementId: string) {
        const heat = this.getHeatForElement(elementId);
        if (typeof(heat) == 'number' && heat < 0)
            return null;

        const lines = [];

        const addLine = function(data: string) {
            lines.push(`<div class="bimp-heatmap-overlay-value">${data}</div>`);
        };

        if (this.props.heatmapType == 'count')
            addLine(this.formatHeatmapValue(heat as number));
        else {
            const heatStats = heat as qbpapi.StatsValueType;
            addLine('Average: ' + this.formatHeatmapValue(heatStats.average));
            addLine('Min: ' + this.formatHeatmapValue(heatStats.min));
            addLine('Max: ' + this.formatHeatmapValue(heatStats.max));
        }

        return `
        <div class="bimp-heatmap-overlay-container">
            <div class="bimp-heatmap-overlay">
                ${lines.join('')}
            </div>
        </div>`;
    }

    shouldComponentUpdate(nextProps: BPMNViewerProps, state: undefined) {
        return nextProps.heatmapType !== this.props.heatmapType;
    }

    render() {
        if (this._viewerLoaded) {
            this.initHeatmap();
        }
        return <div
            id='bpmn-viewer'
            ref={this.setContainer}
        />
    }
}
