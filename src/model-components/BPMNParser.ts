import * as qbp from '../../xmlns/www.qbp-simulator.com/Schema201212'
import * as qbpapi from '../../xmlns/www.qbp-simulator.com/ApiSchema201212'

import { Utils } from './Utils'
import { ProcessSimulationInfo } from './ProcessSimulationInfo'

import { CallActivityType, CatchEventType, LaneType, GatewayType, ProcessDefinitionType, SequenceFlowType, TaskType } from '../types'

import BPMNDocumentConverter from './BPMNDocumentConverter'
import { parse } from '../XMLParser'

export default class BPMNParser {
    public static readonly BIMP_URI = 'http://www.qbp-simulator.com/Schema201212'
    public static readonly BIMP_MODEL_SIM_INFO_TAG = 'processSimulationInfo'
    public static readonly BIMP_DEFAULT_PREFIX = 'qbp'

    public static readonly BIMPAPI_URI = 'http://www.qbp-simulator.com/ApiSchema201212'
    public static readonly BIMPAPI_RESULTS_TAG = 'Results'
    public static readonly BIMPAPI_DEFAULT_PREFIX = 'qbpapi'

    private _parsedSimInfo: qbp.ProcessSimulationInfoType
    private _updatedSimInfo: qbp.ProcessSimulationInfoType
    private _parsedResults: qbpapi.ResultsType

    private _file: File
    private _document: Document
    private _fileContents: string
    private _fileName: string

    private _bimpPrefix: string
    private _bimpApiPrefix: string

    private _tasks: Map<string, TaskType>
    private _gateways: Array<GatewayType>
    private _catchEvents: Array<CatchEventType>
    private _callActivities: Array<CallActivityType>
    private _processDefinitions: Array<ProcessDefinitionType>
    private _lanes: Array<LaneType>

    constructor(file: File | string, fileName: string = undefined) {
        if (file instanceof File) {
            this._file = file
        } else {
            this._fileContents = file
            this._fileName = fileName
        }
    }

    public parse(): Promise<boolean> {
        this._parsedSimInfo = null
        return new Promise<boolean>((resolve: any, reject: any) => {
            Utils.getFileContent(this._file || this._fileContents)
                .then((fileContent: string) => {
                    try {
                        this._fileContents = fileContent
                        this._document = Utils.parseXml(fileContent)
                        this.readDocument()

                        let qbpSimInfoXmlString = ''

                        const simInfoElements = this._document.documentElement.getElementsByTagNameNS(
                            BPMNParser.BIMP_URI,
                            BPMNParser.BIMP_MODEL_SIM_INFO_TAG
                        )
                        if (simInfoElements.length > 0) {
                            qbpSimInfoXmlString = new XMLSerializer().serializeToString(simInfoElements[0])
                        }

                        if (qbpSimInfoXmlString) {
                            // append xml node for parser
                            try {
                                const doc = parse<qbp.document>(qbpSimInfoXmlString)
                                ProcessSimulationInfo.ensureDefaults(doc.processSimulationInfo, this)
                                this._parsedSimInfo = doc.processSimulationInfo

                                if (process.env.NODE_ENV !== 'production') {
                                    console.log('sim info', doc)
                                }

                                // check if we have results stored in the file as well
                                const resultElements = this._document.documentElement.getElementsByTagNameNS(
                                    BPMNParser.BIMPAPI_URI,
                                    BPMNParser.BIMPAPI_RESULTS_TAG
                                )
                                if (resultElements.length > 0) {
                                    const resultsXmlString = new XMLSerializer().serializeToString(resultElements[0])
                                    try {
                                        const resultsDoc = parse<qbpapi.document>(resultsXmlString)
                                        this._parsedResults = resultsDoc.Results
                                        if (process.env.NODE_ENV !== 'production') {
                                            console.log('results', resultsDoc)
                                        }
                                        resolve()
                                    } catch (err) {
                                        console.error(err)
                                        reject(err)
                                    }
                                } else {
                                    resolve()
                                }
                            } catch (err) {
                                console.error(err)
                                reject(err)
                            }
                        } else {
                            resolve()
                        }
                    } catch (err) {
                        console.error(err)
                        reject(err)
                    }
                })
                .catch((err: Error) => {
                    console.error(err)
                    reject(err)
                })
        })
    }

    public getBimpPrefix(): string {
        return this._bimpPrefix
    }

    public getBimpApiPrefix(): string {
        return this._bimpApiPrefix
    }

    public getDocument(): Document {
        return this._document
    }

    public getFileName(): string {
        return this._fileName ? this._fileName : this._file.name
    }

    public getFileContents(): string {
        return this._fileContents
    }

    public getQbpSimulationInfo(): qbp.ProcessSimulationInfoType {
        if (this._updatedSimInfo) {
            return this._updatedSimInfo
        }

        if (!this._parsedSimInfo) {
            this._parsedSimInfo = ProcessSimulationInfo.createAndInit(this)
        }

        return this._parsedSimInfo
    }

    public updateQbpSimulationInfo(simInfo: qbp.ProcessSimulationInfoType) {
        this._updatedSimInfo = simInfo
    }

    public getQbpSimulationResults(): qbpapi.ResultsType {
        return this._parsedResults
    }

    public getTasks(): Map<string, TaskType> {
        return this._tasks
    }

    public getGateways(): Array<GatewayType> {
        return this._gateways
    }

    public getCatchEvents(): Array<CatchEventType> {
        return this._catchEvents
    }

    public getLanes(): Array<LaneType> {
        return this._lanes
    }

    public getCallActivities(): Array<CallActivityType> {
        return this._callActivities
    }

    public getProcessDefinitions(): Array<ProcessDefinitionType> {
        return this._processDefinitions
    }

    public getElementById(id: string) {
        return this._document.getElementById(id)
    }

    private readDocument(): boolean {
        let docElement = this._document.documentElement
        let existingPrefix = docElement.lookupPrefix(BPMNParser.BIMP_URI)
        let existingApiPrefix = docElement.lookupPrefix(BPMNParser.BIMPAPI_RESULTS_TAG)

        this._bimpPrefix = existingPrefix ? existingPrefix : BPMNParser.BIMP_DEFAULT_PREFIX
        this._bimpApiPrefix = existingApiPrefix ? existingApiPrefix : BPMNParser.BIMPAPI_DEFAULT_PREFIX

        if (this._document.querySelector('definitions') == null) {
            throw new Error('BPMN 2.0 definitions not found. Please check the BPMN file, which could be malformed.')
        }

        if (docElement.querySelector('process') == null) {
            throw new Error('BPMN 2.0 process not found. Please check the BPMN file.')
        }

        if (docElement.querySelector('startEvent') == null) {
            throw new Error('Start event not found. Please add a BPMN start event to the BPMN model.')
        }

        let processes = docElement.querySelectorAll('process')
        const processNodesList = Array.prototype.slice.call(processes)
        processNodesList.forEach((element: Element) => {
            if (BPMNParser.isDefaultBPMNElement(element) && element.querySelector('startEvent') == null) {
                throw new Error('BPMN contains one or more processes which do not have a start event.')
            }
        })

        this.readProcessDefinitions()
        this.readTasks()
        this.readIntermediateCatchEvents()
        this.readGateways()
        this.readLanes()
        this.readCallActivities()

        BPMNDocumentConverter.updateDocument(this._document)

        return true
    }

    private readTasks(): boolean {
        this._tasks = new Map<string, TaskType>()
        let documentElement = this._document.documentElement
        const nodes = documentElement.querySelectorAll(
            'task, manualTask, userTask, scriptTask, serviceTask, sendTask, receiveTask, subProcess, adHocSubProcess, callActivity'
        )
        const list = Array.prototype.slice.call(nodes).sort(BPMNParser.compareByParentIdAndNameFunc)

        list.forEach((element: Element) => {
            if (!BPMNParser.isDefaultBPMNElement(element)) return

            let hasChildren =
                element.localName == 'callActivity' ||
                (['subProcess', 'adHocSubProcess'].indexOf(element.localName) >= 0 && element.querySelector('outgoing') != null)

            const parentId = element.parentElement ? element.parentElement.getAttribute('id') : undefined

            this._tasks.set(element.getAttribute('id'), {
                id: element.getAttribute('id'),
                name: BPMNParser.getElementFriendlyName(element),
                nodeName: element.localName,
                hasChildren: hasChildren,
                calledElement: element.localName == 'callActivity' ? element.getAttribute('calledElement') : undefined,
                parentId: parentId
            })
        })

        return true
    }

    private readIntermediateCatchEvents(): boolean {
        this._catchEvents = []
        let documentElement = this._document.documentElement
        const nodes = documentElement.querySelectorAll('intermediateCatchEvent, boundaryEvent')
        const list = Array.prototype.slice.call(nodes).sort(BPMNParser.compareByParentIdAndNameFunc)

        list.forEach((element: Element) => {
            if (!BPMNParser.isDefaultBPMNElement(element)) return

            this._catchEvents.push({
                id: element.getAttribute('id'),
                name: BPMNParser.getElementFriendlyName(element),
                nodeName: element.localName
            })
        })

        return true
    }

    private readGateways(): boolean {
        this._gateways = []
        let documentElement = this._document.documentElement
        const nodes = documentElement.querySelectorAll('exclusiveGateway, inclusiveGateway')
        const list = Array.prototype.slice.call(nodes).sort(BPMNParser.compareByParentIdAndNameFunc)

        list.forEach((gateway: Element) => {
            if (!BPMNParser.isDefaultBPMNElement(gateway)) return

            let sequenceElements = this.getSequenceFlowsFromElement(gateway)
            if (sequenceElements.length <= 1) return

            let sequenceFlows = sequenceElements
                .map(
                    (sequenceFlow: Element): SequenceFlowType => {
                        const sourceRef = sequenceFlow.getAttribute('sourceRef')
                        const targetRef = sequenceFlow.getAttribute('targetRef')
                        if (!targetRef) return null

                        const target = this._document.getElementById(targetRef)
                        if (!target) return null

                        let targetName = target ? target.getAttribute('name') : ''
                        if (!targetName) {
                            targetName = sequenceFlow.getAttribute('name')
                        }

                        if (!targetName) targetName = 'N/A'
                        else {
                            targetName = targetName.trim()
                        }

                        return {
                            id: sequenceFlow.getAttribute('id'),
                            targetId: targetRef,
                            targetName: targetName
                        }
                    }
                )
                .filter((e) => e != null)

            let gatewayName = gateway.getAttribute('name')
            if (gatewayName) {
                gatewayName = BPMNParser.getElementFriendlyName(gateway)
            }

            this._gateways.push({
                id: gateway.getAttribute('id'),
                name: gatewayName,
                sequenceFlows: sequenceFlows,
                isInclusive: gateway.localName == 'inclusiveGateway'
            })
        })

        return true
    }

    private readLanes() {
        this._lanes = []
        let documentElement = this._document.documentElement
        const lanes = documentElement.querySelectorAll('lane')
        for (let i = 0; i < lanes.length; i++) {
            const lane = lanes.item(i)
            if (!BPMNParser.isDefaultBPMNElement(lane)) continue

            const elementRefs = lane.querySelectorAll('flowNodeRef, flowElementRef')
            let elementIds = new Set<string>()
            for (let j = 0; j < elementRefs.length; j++) {
                const nodeRef = elementRefs.item(j)
                elementIds.add(nodeRef.textContent.trim())
            }

            this._lanes.push({
                id: lane.getAttribute('id'),
                name: lane.getAttribute('name'),
                elementIds: elementIds
            })
        }
    }

    private readProcessDefinitions() {
        const documentElement = this._document.documentElement
        const processes = documentElement.querySelectorAll('process')

        this._processDefinitions = []
        for (let i = 0; i < processes.length; i++) {
            const process = processes.item(i)
            if (!BPMNParser.isDefaultBPMNElement(process)) continue

            this._processDefinitions.push({
                id: process.getAttribute('id')
            })
        }
    }

    private readCallActivities() {
        const documentElement = this._document.documentElement
        const activities = documentElement.querySelectorAll('callActivity')

        this._callActivities = []
        for (let i = 0; i < activities.length; i++) {
            const activity = activities.item(i)
            if (!BPMNParser.isDefaultBPMNElement(activity)) continue

            this._callActivities.push({
                id: activity.getAttribute('id'),
                name: activity.getAttribute('name'),
                calledElement: activity.getAttribute('calledElement')
            })
        }
    }

    private getSequenceFlowsFromElement(element: Element): Array<Element> {
        let outgoing = element.querySelectorAll('outgoing')
        if (outgoing.length > 0) {
            return Array.prototype.slice
                .call(outgoing)
                .map((textElement: Element) => this._document.getElementById(textElement.textContent.trim()))
        } else if (element.querySelector('incoming') != null) {
            return []
        }

        let id = element.getAttribute('id').trim()
        let nodes = this._document.querySelectorAll('sequenceFlow[sourceRef=' + id + ']')
        return Array.prototype.slice.call(nodes)
    }

    private static getParentSubProcessName(element: Element): string {
        if (['subProcess', 'adHocSubProcess'].indexOf(element.parentElement.localName) >= 0) {
            return 'Sub-Process: ' + (element.parentElement.getAttribute('name') ? element.parentElement.getAttribute('name') : 'N/A')
        }

        return ''
    }

    private static getElementFriendlyName(element: Element): string {
        const isSubProcess = ['subProcess', 'adHocSubProcess'].indexOf(element.localName) >= 0
        let baseName = (isSubProcess ? 'Sub-Process: ' : '') + (element.getAttribute('name') ? element.getAttribute('name') : 'N/A')
        const isParentSubProcess = ['subProcess', 'adHocSubProcess'].indexOf((element.parentNode as Element).localName) >= 0
        if (isParentSubProcess) {
            baseName += ' (' + BPMNParser.getParentSubProcessName(element) + ')'
        }

        return baseName
    }

    private static compareByParentIdAndNameFunc = (a: Element, b: Element): number => {
        const aParentId = a.parentElement.getAttribute('id')
        const bParentId = b.parentElement.getAttribute('id')

        if (aParentId < bParentId) return -1
        if (aParentId > bParentId) return 1

        if (a.getAttribute('name') < b.getAttribute('name')) return -1
        if (a.getAttribute('name') > b.getAttribute('name')) return 1

        return 0
    }

    private static isDefaultBPMNElement(element: Element): boolean {
        return element.namespaceURI.indexOf('http://www.omg.org/') > -1
    }
}
