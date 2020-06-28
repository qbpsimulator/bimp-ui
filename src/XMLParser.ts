import * as parser from 'fast-xml-parser'
// import * as he from "he";
const TEXT_NODE_NAME = '#text'

const options: parser.X2jOptionsOptional = {
    attributeNamePrefix: '',
    // attrNodeName: "attr", //default is 'false'
    textNodeName: TEXT_NODE_NAME,
    ignoreAttributes: false,
    ignoreNameSpace: true,
    allowBooleanAttributes: true,
    parseNodeValue: true,
    parseAttributeValue: true
    // trimValues: true,
    // cdataTagName: "__cdata", //default is 'false'
    // cdataPositionChar: "\\c",
    // localeRange: "", //To support non english character in tag/attribute values.
    // parseTrueNumberOnly: false,
    // attrValueProcessor: a => he.decode(a, {isAttributeValue: true}),//default is a=>a
    // tagValueProcessor : a => he.decode(a) //default is a=>a
}

export function parse<T = any>(xmlData: string): T {
    const parsed = parser.parse(xmlData, options)
    sanitize(parsed)
    return parsed
}

export async function parseAsync<T = any>(xmlData: string): Promise<T> {
    return parse(xmlData)
}

function sanitize(obj: object) {
    if (!obj || typeof obj !== 'object') return

    Object.keys(obj).forEach((key) => {
        if (textValueKeys.has(key)) {
            const textVal = obj[key][TEXT_NODE_NAME]
            if (textVal) {
                obj[key] = textVal
            }
        }
        if (key === 'startDateTime') {
            obj[key] = new Date(obj[key])
        } else if (ensureArrays.has(key) && !Array.isArray(obj[key])) {
            if (obj[key]) {
                obj[key] = [obj[key]]
            }
        }

        sanitize(obj[key])
    })
}

const ensureArrays = new Set(['element', 'histogramData', 'modelData', 'resource', 'timetable', 'rule', 'sequenceFlow', 'value'])

const textValueKeys = new Set(['resourceId', 'timeUnit'])
