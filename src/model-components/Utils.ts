import axios from 'axios'

export class Utils {
    public static getFileContent(file: File | string): Promise<string> {
        return new Promise<string>((resolve: any, reject: any) => {
            try {
                if (typeof file === 'string') {
                    resolve(file)
                    return
                }

                var reader = new FileReader()
                reader.readAsText(file as File)
                reader.onloadend = (e: ProgressEvent) => {
                    try {
                        resolve(reader.result)
                        //bimp.file.readTextToDocument(e.target.result);
                    } catch (err) {
                        console.log(err)
                        reject(err)
                    }
                }
            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }

    public static parseXml(text: string): Document {
        let domParser = new DOMParser()
        return domParser.parseFromString(text, 'text/xml')
    }

    public static parseQbpNode(bigXml: string): string {
        const startStr = '<qbp:processSimulationInfo'
        const endStr = '</qbp:processSimulationInfo>'

        const start = bigXml.lastIndexOf(startStr)
        if (start < 0) return ''

        const end = bigXml.indexOf(endStr, start)
        if (end < start) return ''

        return bigXml.substr(start, end + endStr.length - start)
    }

    public static Guid() {
        const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
        return 'qbp_' + (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
    }

    public static ReportErrorStackError(apiKey: string, component: string, bpmnContent: string, message: string) {
        const url = 'https:' == document.location.protocol ? 'https://errorstack.appspot.com/submit' : 'http://www.errorstack.com/submit'
        return axios.post(url, 'bpmn=' + encodeURIComponent(bpmnContent), {
            params: {
                _s: apiKey,
                _r: 'json',
                Msg: message,
                Platform: navigator.platform,
                UserAgent: navigator.userAgent,
                Component: component
            },
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            },
            data: {}
        })
    }
}
