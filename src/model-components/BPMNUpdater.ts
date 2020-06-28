import * as qbp from '../../xmlns/www.qbp-simulator.com/Schema201212'
import * as qbpapi from '../../xmlns/www.qbp-simulator.com/ApiSchema201212'

import BPMNParser from './BPMNParser'
import QBPSerializer from './QBPSerializer'
import xmlbeautify from 'xml-beautifier'

import * as qbpJsonixTypes from '../../xmlns/QBP'
import * as qbpApiJsonixTypes from '../../xmlns/QBPApi'

export default class BPMNUpdater {
    private originalParser: BPMNParser

    constructor(originalParser: BPMNParser) {
        this.originalParser = originalParser
    }

    public getUpdatedXmlString(simInfo: qbp.ProcessSimulationInfoType): string {
        const serializer = new QBPSerializer(qbpJsonixTypes.QBP)

        const element = this.createProcessSimulationInfoElement(simInfo)

        if (process.env.NODE_ENV !== 'production') {
            console.log(element)
        }

        return xmlbeautify(new XMLSerializer().serializeToString(element))
    }

    private createProcessSimulationInfoElement(simInfo: qbp.ProcessSimulationInfoType): Element {
        const serializer = new QBPSerializer(qbpJsonixTypes.QBP)

        return serializer.serializeToDomElement(
            { processSimulationInfo: simInfo },
            this.originalParser.getBimpPrefix() + ':',
            BPMNParser.BIMP_URI
        )
    }

    private createSimulationResultsElement(results: qbpapi.ResultsType): Element {
        const serializer = new QBPSerializer(qbpApiJsonixTypes.QBPApi)

        return serializer.serializeToDomElement({ Results: results }, this.originalParser.getBimpApiPrefix() + ':', BPMNParser.BIMPAPI_URI)
    }

    public getUpdatedDocument(simInfo: qbp.ProcessSimulationInfoType, results: qbpapi.ResultsType): Document {
        let document = this.originalParser.getDocument()

        const simInfos = document.getElementsByTagNameNS(BPMNParser.BIMP_URI, BPMNParser.BIMP_MODEL_SIM_INFO_TAG)
        for (let i = simInfos.length - 1; i >= 0; --i) {
            simInfos[i].remove()
        }

        const simInfoElement = this.createProcessSimulationInfoElement(simInfo)
        document.documentElement.setAttribute('xmlns:' + simInfoElement.prefix, BPMNParser.BIMP_URI)
        document.documentElement.appendChild(simInfoElement)

        // and save results
        if (results) {
            const resultNodes = document.getElementsByTagNameNS(BPMNParser.BIMPAPI_URI, BPMNParser.BIMPAPI_RESULTS_TAG)
            for (let i = resultNodes.length - 1; i >= 0; --i) {
                resultNodes[i].remove()
            }

            const resultsElement = this.createSimulationResultsElement(results)
            document.documentElement.setAttribute('xmlns:' + resultsElement.prefix, BPMNParser.BIMPAPI_URI)
            document.documentElement.appendChild(resultsElement)
        }

        return document
    }

    public getUpdatedDocumentAsString(simInfo: qbp.ProcessSimulationInfoType, results: qbpapi.ResultsType): string {
        const doc = this.getUpdatedDocument(simInfo, results)

        return new XMLSerializer().serializeToString(doc)
    }
}
