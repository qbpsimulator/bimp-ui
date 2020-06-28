export default class QBPSerializer {
    private _typeInfos: Map<string, any> = new Map<string, any>()
    private _elementInfos: Map<string, any> = new Map<string, any>()

    constructor(jsonixTypes: any) {
        jsonixTypes.typeInfos.forEach((typeInfo) => {
            this._typeInfos['.' + typeInfo.localName] = typeInfo
        })

        jsonixTypes.elementInfos.forEach((elementInfo) => {
            this._elementInfos[elementInfo.elementName] = elementInfo
        })
    }

    private getTypeInfo(typeId: any): any {
        let typeInfo = this._typeInfos[typeId]
        if (!typeInfo) throw new Error('Type not found in Jsonix definition: ' + typeId)

        if (typeInfo.baseTypeInfo) {
            const baseTypeInfo = this.getTypeInfo(typeInfo.baseTypeInfo)
            return { ...typeInfo, propertyInfos: baseTypeInfo.propertyInfos }
        }

        return typeInfo
    }

    public serializeToDomElement(rootDocument: Object, prefix: string, namespaceURI: string): Element {
        let doc: Document = null

        const isPrimitiveType = (typeId: string) => !typeId || typeId.charAt(0) !== '.'

        function writePrimitiveContent(element: Element, val: any) {
            if (typeof val === 'string' && val.startsWith('<![CDATA[') && val.endsWith(']]>')) {
                let cdatas = val.substring(9, val.length - 3).split(']]><![CDATA[')
                cdatas.forEach((cdata) => {
                    var cdataNode = doc.createCDATASection(cdata)
                    element.appendChild(cdataNode)
                })
            } else {
                element.textContent = (val + '').trim()
            }
        }

        const writePropInfo = (currentElement: Element, jsonData: any, propInfo: any): Element => {
            let createdElement: Element = null

            let dataName = propInfo.elementName ? propInfo.elementName : propInfo.name
            if (propInfo.type === 'attribute') {
                // needed for some incosistency
                if (dataName === '_default') dataName = 'default'

                let val = jsonData[dataName]
                if (typeof val === 'undefined') return

                if (val instanceof Date) {
                    val = val.toJSON()
                }

                if (typeof val !== 'object') {
                    currentElement.setAttribute(dataName, val)
                }
            }
            // if we have a type info which is not a primitive type nor collection
            else if ((propInfo.typeInfo && !isPrimitiveType(propInfo.typeInfo)) || propInfo.collection) {
                if (typeof jsonData[dataName] === 'undefined') return null

                const elementsToPopulate =
                    propInfo.collection && jsonData[dataName] && jsonData[dataName].length > 0
                        ? jsonData[dataName]
                        : new Array(jsonData[dataName])

                elementsToPopulate.forEach((data) => {
                    if (!data) return null

                    if (!doc) {
                        doc = document.implementation.createDocument(namespaceURI, prefix + dataName, null)
                        createdElement = doc.documentElement
                    } else {
                        createdElement = doc.createElementNS(namespaceURI, prefix + dataName)
                    }

                    if (currentElement) {
                        currentElement.appendChild(createdElement)
                    }

                    if (isPrimitiveType(propInfo.typeInfo)) {
                        writePrimitiveContent(createdElement, data)
                    } else {
                        const typeInfo = this.getTypeInfo(propInfo.typeInfo)
                        typeInfo.propertyInfos.forEach((propInfo) => {
                            writePropInfo(createdElement, data, propInfo)
                        })
                    }
                })
            }
            // primitive types
            else {
                const val = jsonData[dataName]
                if (typeof val === 'undefined') return null

                if (typeof val === 'object' && !val) return null

                let node = doc.createElementNS(namespaceURI, prefix + dataName)
                writePrimitiveContent(node, val)

                currentElement.appendChild(node)
            }

            return createdElement
        }

        for (let elementName in rootDocument) {
            let typeInfo = this._elementInfos[elementName]

            let element = writePropInfo(null, rootDocument, typeInfo)
            return element
        }

        return null
    }
}
