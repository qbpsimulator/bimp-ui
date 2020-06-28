import xmlbeautify from 'xml-beautifier'
import axios, { AxiosResponse } from 'axios'
import * as FileSaver from 'file-saver'

import { store } from '../store'

import * as qbpapi from '../../xmlns/www.qbp-simulator.com/ApiSchema201212'
import * as jsonixAPI from '../../xmlns/QBPApi'

import BPMNParser from './BPMNParser'
import QBPSerializer from './QBPSerializer'
import { parseAsync } from '../XMLParser'

export default class RequestHandler {
    private _requestURL: string

    private static _lastBpmnDocsData: Array<string>

    public static getLastRequestData() {
        return this._lastBpmnDocsData
    }

    constructor() {
        this._requestURL = this.getBaseUrl()

        axios.defaults.baseURL = this._requestURL
        axios.defaults.withCredentials = true
    }

    private getBaseUrl(): string {
        const config = store.getState().application.config
        let str = config.protocol
        str += config.host + config.url
        return str
    }

    private async ensureToken() {
        const config = store.getState().application.config

        if (config.jwtAuth) {
            const token = config.jwtAuth.token
            axios.defaults.headers = {
                Authorization: 'Bearer ' + token
            }
        } else if (config.basicAuth) {
            axios.defaults.headers = {
                Authorization: 'Basic ' + btoa(config.basicAuth.username + ':' + config.basicAuth.password)
            }
        }
    }

    public async startSimulation(modelData: Array<string>, generateMxml: boolean) {
        RequestHandler._lastBpmnDocsData = modelData

        modelData = modelData.map((s) => '<![CDATA[' + s.replace(/]]>/gi, ']]]]><![CDATA[>') + ']]>')

        let request = {
            modelData: modelData,
            generateMXML: generateMxml,
            version: 1
        }

        const serializer = new QBPSerializer(jsonixAPI.QBPApi)
        let req = serializer.serializeToDomElement({ StartSimulationRequest: request }, '', BPMNParser.BIMPAPI_URI)

        const reqData = new XMLSerializer().serializeToString(req)
        if (process.env.NODE_ENV !== 'production') {
            console.log(xmlbeautify(reqData))
        }

        await this.ensureToken()

        store
            .dispatch<any>({
                type: 'START_SIMULATION',
                payload: axios({
                    method: 'post',
                    data: reqData,
                    headers: {
                        'Content-Type': 'application/xml; charset=utf-8'
                    }
                }),
                meta: {
                    generateMxml: generateMxml
                }
            })
            .then((response) => {
                store.dispatch({
                    type: 'START_SIMULATION_PARSE',
                    payload: parseAsync<qbpapi.document>(response.value.data)
                })
            })
    }

    public getSimulationStatus(simulationId: string) {
        return store
            .dispatch<any>({
                type: 'SIMULATION_STATUS',
                payload: axios({
                    url: simulationId,
                    method: 'get'
                })
            })
            .then((response) => {
                return store.dispatch({
                    type: 'SIMULATION_STATUS_PARSE',
                    payload: parseAsync<qbpapi.document>(response.value.data)
                })
            })
    }

    public getSimulationResults(simulationId: string) {
        store
            .dispatch<any>({
                type: 'SIMULATION_RESULTS',
                payload: axios({
                    url: simulationId + '/Results',
                    method: 'get'
                })
            })
            .then((response) => {
                store.dispatch({
                    type: 'SIMULATION_RESULTS_PARSE',
                    payload: parseAsync<qbpapi.document>(response.value.data)
                })
            })
    }

    public async downloadSimulationResultsMxml(simulationId: string) {
        const response = await axios({
            url: simulationId + '/MXML',
            method: 'get',
            responseType: 'blob'
        })

        this.initiateFileDownload(response, 'simulation_logs.mxml.gz')
    }

    public async downloadSimulationResultsCsv(simulationId: string) {
        const response = await axios({
            url: simulationId + '/CSV',
            method: 'get',
            responseType: 'blob'
        })

        this.initiateFileDownload(response, 'simulation_results.csv')
    }

    private initiateFileDownload(response: AxiosResponse, fileName: string) {
        FileSaver.saveAs(new Blob([response.data]), fileName)
    }
}
