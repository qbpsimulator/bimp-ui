import * as Primitive from '../xml-primitives'

// Source files:
// http://localhost:8888/qbp-simulator/QBPSchema.xsd

interface BaseType {
    _namespace: string
}
/** Defines a histogram distribution bin for distributions of type HISTOGRAM */
interface _DistributionHistogramBin extends BaseType {
    /** Probability from 0 to 100 for the distribution from
     * this histogram bin to be used. Sum of "probability" values of items in parent collection must be equal to 100. */
    probability: number
    /** Distribution to be used for this histogram bin */
    distribution: DistributionInfo
}
export interface DistributionHistogramBin extends _DistributionHistogramBin {
    constructor: { new (): DistributionHistogramBin }
}
export var DistributionHistogramBin: { new (): DistributionHistogramBin }

/** Distribution info type is used to define durations of
 * elements following given distributions. All values are
 * in seconds. */
interface _DistributionInfo extends BaseType {
    /** For distributions: uniform - minimum value;
     * exponential - mean, will be used to calculate 1/mean
     * for exponential distribution; gamma - variance;
     * triangular - minimum at "a" parameter; lognormal -
     * variance; */
    arg1?: number
    /** For distributions: uniform - maximum value;
     * triangular - maximum at "b" parameter; */
    arg2?: number
    /** For fixed, normal, gamma, triangular and lognormal
     * distributions. Mean, mode, or fixed value */
    mean?: number
    /** Distribution type */
    type: DistributionType
    /** List of histogram bins to define distributions
     * with probabilities. Used if distribution type is
     * HISTOGRAM. Sum of probabilities in items must be
     * equal to 100. */
    histogramDataBins?: DistributionInfoHistogramDataBinsType
    /** Does not actually specify time unit - values must be given always in seconds. This is only for user interfaces to store the user selection. */
    timeUnit?: TimeUnitType
}
export interface DistributionInfo extends _DistributionInfo {
    constructor: { new (): DistributionInfo }
}
export var DistributionInfo: { new (): DistributionInfo }

interface _DistributionInfoHistogramDataBinsType extends BaseType {
    /** Histogram bin definition */
    histogramData: DistributionHistogramBin[]
}
interface DistributionInfoHistogramDataBinsType extends _DistributionInfoHistogramDataBinsType {
    constructor: { new (): DistributionInfoHistogramDataBinsType }
}

export type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days'
export type TimeUnitType = TimeUnit /* & {
		"#text": ("seconds" | "minutes" | "hours" | "days");
}*/

// type DistributionInfoTimeUnitType = ("seconds" | "minutes" | "hours" | "days");
// interface _DistributionInfoTimeUnitType extends Primitive._string { content: DistributionInfoTimeUnitType; }

/** Distributions that are supported for durations. */
export type DistributionType = 'FIXED' | 'EXPONENTIAL' | 'GAMMA' | 'LOGNORMAL' | 'NORMAL' | 'TRIANGULAR' | 'UNIFORM' | 'HISTOGRAM'
interface _DistributionType extends Primitive._string {
    content: DistributionType
}

/** Simulation information for elements */
interface _ElementSimulationInfoType extends BaseType {
    /** Cost threshold. Default is 0. Additional statistics
     * will be calculated for elements whose cost exceeds
     * the threshold. */
    costThreshold?: number
    /** Duration threshold in seconds. Default is 0.
     * Additional statistics will be calculated for
     * elements whose duration exceeds the threshold. */
    durationThreshold?: number
    /** Element ID from the BPMN file for which this object
     * is related to. */
    elementId: string
    /** Fixed, one time cost, to run the element */
    fixedCost: number
    /** ID of the element, unique */
    id?: string
    /** If set for sub-processes, then child elements of sub-process will not be simulated. Duration will be determined from the sub-process distribution. */
    simulateAsTask: boolean
    /** Duration of the element in seconds */
    durationDistribution: DistributionInfo
    /** Does not actually specify time unit - values must be given always in seconds. This is only for user interfaces to store the user selection. */
    durationThresholdTimeUnit?: TimeUnitType
    /** List of resources that can be used to handle the
     * element. One supported. Required for tasks. */
    resourceIds: ElementSimulationInfoTypeResourceIdsType
}
export interface ElementSimulationInfoType extends _ElementSimulationInfoType {
    constructor: { new (): ElementSimulationInfoType }
}
export var ElementSimulationInfoType: { new (): ElementSimulationInfoType }

// type ElementSimulationInfoTypeDurationThresholdTimeUnitType = ("seconds" | "minutes" | "hours" | "days");
// interface _ElementSimulationInfoTypeDurationThresholdTimeUnitType extends Primitive._string { content: ElementSimulationInfoTypeDurationThresholdTimeUnitType; }

interface _ElementSimulationInfoTypeResourceIdsType extends BaseType {
    /** ID of the resource */
    resourceId: string
}
interface ElementSimulationInfoTypeResourceIdsType extends _ElementSimulationInfoTypeResourceIdsType {
    constructor: { new (): ElementSimulationInfoTypeResourceIdsType }
}

/** List of all available resources in the simulation that
 * can be assigned to tasks */
interface _ProcessSimulationInfoType extends BaseType {
    /** Currency to be used when reporting simulation cost
     * statistics */
    currency?: string
    /** Unique id */
    id?: string
    /** ID of the process in BPMN file */
    processId?: string
    /** Total number of business process instances to run */
    processInstances: number
    /** Date and time for the simulation clock when
     * simulation has started */
    startDateTime: Date
    version: number
    /** Distribution of interval between two process
     * instances in seconds */
    arrivalRateDistribution: DistributionInfo
    /** List of all simulation info objects for all
     * elements */
    elements?: ProcessSimulationInfoTypeElementsType
    /** List of all resources that can be assigned to
     * tasks */
    resources?: ProcessSimulationInfoTypeResourcesType
    /** List of sequence flow simulation information */
    sequenceFlows?: ProcessSimulationInfoTypeSequenceFlowsType
    /** List of all time tables that can be defined for
     * resources and process arrival rate. */
    timetables?: ProcessSimulationInfoTypeTimetablesType

    statsOptions?: {
        trimStartProcessInstances?: number
        trimEndProcessInstances?: number
    }
}
export interface ProcessSimulationInfoType extends _ProcessSimulationInfoType {
    constructor: { new (): ProcessSimulationInfoType }
}
export var ProcessSimulationInfoType: { new (): ProcessSimulationInfoType }

interface _ProcessSimulationInfoType_2 extends _ProcessSimulationInfoType {}
interface ProcessSimulationInfoType_2 extends _ProcessSimulationInfoType_2 {
    constructor: { new (): ProcessSimulationInfoType_2 }
}

interface _ProcessSimulationInfoTypeElementsType extends BaseType {
    element: ElementSimulationInfoType[]
}
interface ProcessSimulationInfoTypeElementsType extends _ProcessSimulationInfoTypeElementsType {
    constructor: { new (): ProcessSimulationInfoTypeElementsType }
}

type ProcessSimulationInfoTypeProcessInstancesType = number
type _ProcessSimulationInfoTypeProcessInstancesType = Primitive._number

interface _ProcessSimulationInfoTypeResourcesType extends BaseType {
    resource: Resource[]
}
interface ProcessSimulationInfoTypeResourcesType extends _ProcessSimulationInfoTypeResourcesType {
    constructor: { new (): ProcessSimulationInfoTypeResourcesType }
}

interface _ProcessSimulationInfoTypeSequenceFlowsType extends BaseType {
    sequenceFlow: SequenceFlowSimulationInfoType[]
}
interface ProcessSimulationInfoTypeSequenceFlowsType extends _ProcessSimulationInfoTypeSequenceFlowsType {
    constructor: { new (): ProcessSimulationInfoTypeSequenceFlowsType }
}

interface _ProcessSimulationInfoTypeTimetablesType extends BaseType {
    timetable: TimeTable[]
}
interface ProcessSimulationInfoTypeTimetablesType extends _ProcessSimulationInfoTypeTimetablesType {
    constructor: { new (): ProcessSimulationInfoTypeTimetablesType }
}

/** A resouce that can be assigned to tasks */
interface _Resource extends BaseType {
    /** Cost per hour for the resource. Used to calculate activity costs depending on duration. */
    costPerHour: number
    /** Unique Id of the resource */
    id: string
    /** Name of the resource */
    name: string
    /** Id of the time table that defines workdays and time for the resource */
    timetableId: string
    /** Total number of available resources of this type */
    totalAmount: number
}
export interface Resource extends _Resource {
    constructor: { new (): Resource }
}
export var Resource: { new (): Resource }

type ResourceTotalAmountType = number
type _ResourceTotalAmountType = Primitive._number

/** Sequence flow simulation information */
interface _SequenceFlowSimulationInfoType extends BaseType {
    /** Id of the sequence flow element in BPMN file */
    elementId: string
    /** Probaility of executing the sequence flow. Used for XOR and OR gateways. Double value from 0 to 1. */
    executionProbability: number
}
export interface SequenceFlowSimulationInfoType extends _SequenceFlowSimulationInfoType {
    constructor: { new (): SequenceFlowSimulationInfoType }
}
export var SequenceFlowSimulationInfoType: { new (): SequenceFlowSimulationInfoType }

type SequenceFlowSimulationInfoTypeExecutionProbabilityType = number
type _SequenceFlowSimulationInfoTypeExecutionProbabilityType = Primitive._number

/** Time table is a set of rules to define work or other
 * periods during a week when something happens in the
 * business process. E.g. when resources are working or
 * when new process instances are started. */
interface _TimeTable extends BaseType {
    /** Set true if the process instance arrival rate uses
     * this time table */
    default: boolean
    /** Unique Id of the time table */
    id: string
    /** Friendly name of the time table */
    name?: string
    /** List of time table rules */
    rules: TimeTableRulesType
}
export interface TimeTable extends _TimeTable {
    constructor: { new (): TimeTable }
}
export var TimeTable: { new (): TimeTable }

/** A rule in a time table */
interface _TimeTableRule extends BaseType {
    /** Begin time of the rule, included */
    fromTime: string
    /** Day when the rule applies. */
    fromWeekDay: WeekDay
    /** End time of the rule, excluded */
    toTime: string
    /** Day until this time table rule applies */
    toWeekDay?: WeekDay
}
export interface TimeTableRule extends _TimeTableRule {
    constructor: { new (): TimeTableRule }
}
export var TimeTableRule: { new (): TimeTableRule }

interface _TimeTableRulesType extends BaseType {
    /** TIme table rule */
    rule: TimeTableRule[]
}
interface TimeTableRulesType extends _TimeTableRulesType {
    constructor: { new (): TimeTableRulesType }
}

/** Weekdays used to define TimeTableRule */
export type WeekDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
interface _WeekDay extends Primitive._string {
    content: WeekDay
}

export interface document extends BaseType {
    /** Root node that contains simulation information/scenario */
    processSimulationInfo: ProcessSimulationInfoType_2
}
export var document: document
