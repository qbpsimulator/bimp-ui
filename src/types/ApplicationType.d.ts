import BPMNParser from '../model-components/BPMNParser'
import { Validator } from '../model-components/Validator'
import { Config } from './Config'
import { FileDefinition } from '.'

export interface ApplicationType {
    readonly page: string
    readonly parsers: Array<BPMNParser>
    readonly validator: Validator
    readonly config: Config
    readonly activeParser: BPMNParser
    readonly allProcessIds: Set<string>
    readonly uploadedFileContents?: Array<FileDefinition>
}
