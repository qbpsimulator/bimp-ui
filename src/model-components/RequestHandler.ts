import * as xmlbeautify from 'xml-beautifier';
import axios from 'axios';

import { store } from '../store'

import * as qbpapi from '../../xmlns/www.qbp-simulator.com/ApiSchema201212'
import * as jsonixAPI from '../../xmlns/QBPApi'

import BPMNParser from './BPMNParser'
import QBPSerializer from './QBPSerializer'
import { parseAsync } from '../XMLParser';


export default class RequestHandler {
    private _authToken: string;
    private _requestURL: string;

    private static _lastBpmnDocsData: Array<string>;

    public static getLastRequestData() {
        return this._lastBpmnDocsData;
    }

    constructor() {
        this._requestURL = this.getBaseUrl();
        this._authToken = store.getState().application.config.authtoken;

        axios.defaults.baseURL = this._requestURL;
    }

    private getBaseUrl(includeAuthToken: boolean = false): string {
        const config = store.getState().application.config;
        let str = config.protocol
        if (includeAuthToken) {
            str += atob(config.authtoken) + "@";
        }
        str += config.host + config.url;
        return str;
    }

    public startSimulation(modelData: Array<string>, generateMxml: boolean) {
        RequestHandler._lastBpmnDocsData = modelData;

        modelData = modelData.map(s =>
            '<![CDATA[' + s.replace(/]]>/gi, ']]]]><![CDATA[>') + ']]>');

        let request = {
            'modelData': modelData,
            'generateMXML': generateMxml,
            'version': 1,
        };

        const serializer = new QBPSerializer(jsonixAPI.QBPApi);
        let req = serializer.serializeToDomElement({ StartSimulationRequest: request }, '', BPMNParser.BIMPAPI_URI);

        const reqData = new XMLSerializer().serializeToString(req);
        if (process.env.NODE_ENV !== 'production') {
            console.log(xmlbeautify(reqData));
        }

        store.dispatch<any>({
            type: "START_SIMULATION",
            payload: axios({
                method: 'post',
                data: reqData,
                headers: {
                    'Authorization': 'Basic ' + this._authToken,
                    'Content-Type': 'application/xml; charset=utf-8'
                }
            }),
            meta: {
                generateMxml: generateMxml
            }
        })
        .then(response => {

            store.dispatch({
                type: "START_SIMULATION_PARSE",
                payload: parseAsync<qbpapi.document>(response.value.data)
            });
        });
    }

    public getSimulationStatus(simulationId: string) {
        store.dispatch<any>({
            type: "SIMULATION_STATUS",
            payload: axios({
                url: '/' + simulationId,
                method: 'get',
                headers: {
                    'Authorization': 'Basic ' + this._authToken,
                }
            })
        })
        .then(response => {
            store.dispatch({
                type: "SIMULATION_STATUS_PARSE",
                payload: parseAsync<qbpapi.document>(response.value.data)
            });
        });
    }

    public getSimulationKPIs(simulationId: string) {
        store.dispatch<any>({
            type: "SIMULATION_KPI",
            payload: axios({
                url: '/' + simulationId + '/KPI',
                method: 'get',
                headers: {
                    'Authorization': 'Basic ' + this._authToken,
                }
            })
        })
        .then(response => {
            store.dispatch({
                type: "SIMULATION_KPI_PARSE",
                payload: parseAsync<qbpapi.document>(response.value.data)
            });
        });
    }

    public getProcessDurations(simulationId: string) {
        store.dispatch<any>({
            type: "SIMULATION_PROCESS_DURATION",
            payload: axios({
                url: '/' + simulationId + '/Distribution/ProcessDuration?bars=10',
                method: 'get',
                headers: {
                    'Authorization': 'Basic ' + this._authToken,
                }
            })
        })
        .then(response => {
            store.dispatch({
                type: "SIMULATION_PROCESS_DURATION_PARSE",
                payload: parseAsync<qbpapi.document>(response.value.data)
            });
        });
    }

    public getProcessCycleTimes(simulationId: string) {
        store.dispatch<any>({
            type: "SIMULATION_PROCESS_CYCLETIME",
            payload: axios({
                url: '/' + simulationId + '/Distribution/CycleTime?bars=10',
                method: 'get',
                headers: {
                    'Authorization': 'Basic ' + this._authToken,
                }
            })
        })
        .then(response => {
            store.dispatch({
                type: "SIMULATION_PROCESS_CYCLETIME_PARSE",
                payload: parseAsync<qbpapi.document>(response.value.data)
            });
        });
    }

    public getProcessWaitingTimes(simulationId: string) {
        store.dispatch<any>({
            type: "SIMULATION_PROCESS_WAITINGTIME",
            payload: axios({
                url: '/' + simulationId + '/Distribution/ProcessWaitingTime?bars=10',
                method: 'get',
                headers: {
                    'Authorization': 'Basic ' + this._authToken,
                }
            })
        })
        .then(response => {
            store.dispatch({
                type: "SIMULATION_PROCESS_WAITINGTIME_PARSE",
                payload: parseAsync<qbpapi.document>(response.value.data)
            });
        });
    }

    public getProcessCosts(simulationId: string) {
        store.dispatch<any>({
            type: "SIMULATION_PROCESS_COST",
            payload: axios({
                url: '/' + simulationId + '/Distribution/ProcessCost?bars=10',
                method: 'get',
                headers: {
                    'Authorization': 'Basic ' + this._authToken,
                }
            })
        })
        .then(response => {
            store.dispatch({
                type: "SIMULATION_PROCESS_COST_PARSE",
                payload: parseAsync<qbpapi.document>(response.value.data)
            });
        });
    }

    public downloadSimulationResultsMxml(simulationId: string) {
        window.open(this.getBaseUrl(true) + '/' + simulationId + '/MXML', '_blank');
    }

    public downloadSimulationResultsCsv(simulationId: string) {
        window.open(this.getBaseUrl(true) + '/' + simulationId + '/CSV', '_blank');
    }
}