import BPMNParser from './BPMNParser'

export default class BPMNDocumentConverter {
    public static updateDocument(document: Document) {
        BPMNDocumentConverter.convertResultsInDocument(document)
    }

    private static convertResultsInDocument(document: Document) {
        const docElement = document.documentElement
        const simInfoElements = docElement.getElementsByTagNameNS(BPMNParser.BIMP_URI, BPMNParser.BIMP_MODEL_SIM_INFO_TAG)
        if (simInfoElements.length > 0) {
            const simInfo = simInfoElements[0]
            const resultElements = simInfo.getElementsByTagName('results')
            if (resultElements.length == 0) return

            const createChildAndAppendChildenFrom = (element: Element, childName: string, sources: HTMLCollectionOf<Element>) => {
                const newElem = document.createElementNS(BPMNParser.BIMPAPI_URI, childName)

                if (sources.length > 0) {
                    const source = sources[0]
                    for (let i = source.children.length - 1; i >= 0; --i) {
                        newElem.appendChild(source.children[i])
                    }
                }

                element.appendChild(newElem)
            }

            // Root results node
            const newResultsElem = document.createElementNS(BPMNParser.BIMPAPI_URI, BPMNParser.BIMPAPI_RESULTS_TAG)
            createChildAndAppendChildenFrom(newResultsElem, 'Results', resultElements)

            const chartDataElements = simInfo.getElementsByTagName('chartData')
            if (chartDataElements.length > 0) {
                const chartData = chartDataElements[0]
                createChildAndAppendChildenFrom(newResultsElem, 'CycleTimesData', chartData.getElementsByTagName('drawDurationsChartData'))
                createChildAndAppendChildenFrom(
                    newResultsElem,
                    'CycleTimesInTimetableData',
                    chartData.getElementsByTagName('drawDurationsChartInTimetableData')
                )
                createChildAndAppendChildenFrom(
                    newResultsElem,
                    'WaitingTimesData',
                    chartData.getElementsByTagName('drawWaitingTimesChartData')
                )
                createChildAndAppendChildenFrom(newResultsElem, 'CostsData', chartData.getElementsByTagName('drawCostsChartData'))
            }

            // remove legacy nodes
            for (let i = chartDataElements.length - 1; i >= 0; --i) {
                chartDataElements[i].remove()
            }
            for (let i = resultElements.length - 1; i >= 0; --i) {
                resultElements[i].remove()
            }

            docElement.appendChild(newResultsElem)
        }
    }
}
