import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'

const HIGH_PRIORITY = 1500
class CustomBPMNRenderer extends BaseRenderer {
    bpmnRenderer: any
    static $inject = ['eventBus', 'bpmnRenderer']

    static getElementData: (id: string) => number | undefined

    constructor(eventBus, bpmnRenderer) {
        super(eventBus, HIGH_PRIORITY)

        this.bpmnRenderer = bpmnRenderer
    }

    canRender(element) {
        return !element.labelTarget
    }

    drawShape(parentNode, element) {
        const shape = this.bpmnRenderer.drawShape(parentNode, element)
        const heatData = CustomBPMNRenderer.getElementData(element.id)
        if (typeof heatData !== 'undefined') {
            // shape.style.stroke = getHeatMapColorforValue(heatData);
            shape.style.fill = getHeatMapColorforValue(heatData)
        }

        return shape
    }

    getShapePath(shape) {
        return this.bpmnRenderer.getShapePath(shape)
    }
}

export function getHeatMapColorforValue(value: number) {
    const h = 0.1 + (1 - value) * 100
    return 'hsl(' + h + ', 100%, 60%)'
}

export const CustomBPMNRendererModule = (getElementData: (id: string) => number) => {
    CustomBPMNRenderer.getElementData = getElementData
    return {
        __init__: ['customRenderer'],
        customRenderer: ['type', CustomBPMNRenderer]
    }
}
