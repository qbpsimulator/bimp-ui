import * as Primitive from '../xml-primitives'

// Source files:
// http://localhost:8888/qbp-simulator/ApiSchema201212.xsd

interface BaseType {
    _namespace: string
}
/** KPI/simulation results of an element */
interface _ElementKPIType extends BaseType {
    /** ID of the element */
    id: string
    /** Element name */
    name: string
    /** Cost stats */
    cost: StatsValueType
    /** Cost over threshold stats */
    costOverThreshold: StatsValueType
    /** Count of completed elements */
    count: number
    /** Duration stats */
    duration: StatsValueType
    /** Duration over threshold stats (in seconds) */
    durationOverThreshold: StatsValueType
    /** Idle time (resources not working, activity started but not completed) */
    idleTime: StatsValueType
    /** Waiting time stats */
    waitingTime: StatsValueType
}
export interface ElementKPIType extends _ElementKPIType {
    constructor: { new (): ElementKPIType }
}
export var ElementKPIType: { new (): ElementKPIType }

/** Defines a histogram */
interface _HistogramDataType extends BaseType {
    /** Bin width for histogram */
    binWidth: number
    /** Maximum value */
    max: number
    /** Minimum value */
    min: number
    /** Values for each bin */
    values: HistogramDataTypeValuesType
}
export interface HistogramDataType extends _HistogramDataType {
    constructor: { new (): HistogramDataType }
}
export var HistogramDataType: { new (): HistogramDataType }

/** Double value */
interface _HistogramDataTypeValuesType extends BaseType {
    /** value */
    value?: number[]
}
interface HistogramDataTypeValuesType extends _HistogramDataTypeValuesType {
    constructor: { new (): HistogramDataTypeValuesType }
}

/** Process simulation results/KPIs */
interface _ProcessKPIType extends BaseType {
    /** Average cost of a process instance */
    averageCost?: number
    /** Average cycle time of a process instance in seconds */
    averageCycleTime?: number
    /** Average duration of a process instance in seconds */
    averageDuration?: number
    /** Maximum cost of a process instance */
    maxCost?: number
    /** Maximum cycle time of a process instance in seconds */
    maxCycleTime?: number
    /** Maximum duration of a process instance in seconds */
    maxDuration?: number
    /** Minimum cost of a process instance */
    minCost?: number
    /** Minimum cycle time of a process instance in seconds */
    minCycleTime?: number
    /** Minimum duration of a process instance in seconds */
    minDuration?: number
    /** Number of completed process instances */
    processInstances?: number
    /** Summed cost of a process instances */
    totalCost?: number
    /** Summed cycle time of a process instances in seconds */
    totalCycleTime?: number
}
export interface ProcessKPIType extends _ProcessKPIType {
    constructor: { new (): ProcessKPIType }
}
export var ProcessKPIType: { new (): ProcessKPIType }

/** KPI/statistics of a resource */
interface _ResourceKPIType extends BaseType {
    /** Resource Id */
    id: string
    /** Utilization, from 0 to 1 */
    utilization: number
}
export interface ResourceKPIType extends _ResourceKPIType {
    constructor: { new (): ResourceKPIType }
}
export var ResourceKPIType: { new (): ResourceKPIType }

/** Results of the simulation. Includes KPI stats and common data for charts */
interface _ResultsType extends BaseType {
    /** Costs histogram data */
    CostsData?: HistogramDataType
    /** Duration histogram data */
    CycleTimesData?: HistogramDataType
    /** Durations in timetable histogram data */
    CycleTimesInTimetableData?: HistogramDataType
    /** Basic KPI stats */
    Results: SimulationKPIType
    /** Waiting times histogram data */
    WaitingTimesData?: HistogramDataType
}
export interface ResultsType extends _ResultsType {
    constructor: { new (): ResultsType }
}
export var ResultsType: { new (): ResultsType }

/** Results of the simulation. Includes KPI stats and common data for charts */
interface _ResultsType_2 extends _ResultsType {
    /** API version */
    version?: number
}
interface ResultsType_2 extends _ResultsType_2 {
    constructor: { new (): ResultsType_2 }
}

/** Simulation error string */
export type SimulationError = 'INVALID_INPUT' | 'SIMULATION_ERROR' | 'IO_ERROR'
interface _SimulationError extends Primitive._string {
    content: SimulationError
}

/** Simulation histogram data response type */
interface _SimulationHistogramResponseType extends _HistogramDataType {
    /** API version */
    version?: number
}
interface SimulationHistogramResponseType extends _SimulationHistogramResponseType {
    constructor: { new (): SimulationHistogramResponseType }
}

interface _SimulationKPIResponseType extends _SimulationKPIType {}
interface SimulationKPIResponseType extends _SimulationKPIResponseType {
    constructor: { new (): SimulationKPIResponseType }
}

interface _SimulationKPIType extends BaseType {
    /** API version */
    version?: number
    /** List of elements for which KPIs were calculated in a simulation */
    elements: SimulationKPITypeElementsType
    /** Overall business process simulation results */
    process: ProcessKPIType
    /** List of resource KPIs from the simulation */
    resources: SimulationKPITypeResourcesType
}
export interface SimulationKPIType extends _SimulationKPIType {
    constructor: { new (): SimulationKPIType }
}
export var SimulationKPIType: { new (): SimulationKPIType }

interface _SimulationKPITypeElementsType extends BaseType {
    element?: ElementKPIType[]
}
interface SimulationKPITypeElementsType extends _SimulationKPITypeElementsType {
    constructor: { new (): SimulationKPITypeElementsType }
}

interface _SimulationKPITypeResourcesType extends BaseType {
    resource?: ResourceKPIType[]
}
interface SimulationKPITypeResourcesType extends _SimulationKPITypeResourcesType {
    constructor: { new (): SimulationKPITypeResourcesType }
}

/** Simulator stats response type */
interface _SimulationSimulatorStatsResponseType extends _SimulationSimulatorStatsType {
    /** API version */
    version?: number
}
interface SimulationSimulatorStatsResponseType extends _SimulationSimulatorStatsResponseType {
    constructor: { new (): SimulationSimulatorStatsResponseType }
}

/** Simulation performance statistics */
interface _SimulationSimulatorStatsType extends BaseType {
    /** Number of completed elements */
    completed: number
    /** Number of enabled elements */
    enabled: number
    /** Simulation end timestamp */
    endTime: number
    /** Number of processed elements by simulation engine */
    processedElements: number
    /** Number of started elements */
    started: number
    /** Simulation start timestamp */
    startTime: number
}
export interface SimulationSimulatorStatsType extends _SimulationSimulatorStatsType {
    constructor: { new (): SimulationSimulatorStatsType }
}
export var SimulationSimulatorStatsType: { new (): SimulationSimulatorStatsType }

/** Simulation status enum */
export type SimulationStatus = 'QUEUED' | 'RUNNING' | 'FAILED' | 'FINALIZING' | 'COMPLETED'
interface _SimulationStatus extends Primitive._string {
    content: SimulationStatus
}

/** Simulation status response type */
interface _SimulationStatusResponseType extends BaseType {
    /** API version */
    version?: number
    /** Simulation status */
    status: SimulationStatusType
}
interface SimulationStatusResponseType extends _SimulationStatusResponseType {
    constructor: { new (): SimulationStatusResponseType }
}

/** Simulation status type */
interface _SimulationStatusType extends BaseType {
    completed: number
    errorCode?: SimulationError
    status: SimulationStatus
    total: number
    errorMessage?: string
    errorDetails?: string
}
export interface SimulationStatusType extends _SimulationStatusType {
    constructor: { new (): SimulationStatusType }
}
export var SimulationStatusType: { new (): SimulationStatusType }

/** Start simulation request type */
interface _StartSimulationRequestType extends BaseType {
    /** Whether to generate MXML log */
    generateMXML?: boolean
    /** API version */
    version?: number
    /** BPMN file content that contains embedded simulation information. Define as a XML CDATA string. */
    modelData: string[]
}
interface StartSimulationRequestType extends _StartSimulationRequestType {
    constructor: { new (): StartSimulationRequestType }
}

/** Response for start simulation request type */
interface _StartSimulationResponseType extends BaseType {
    /** ID of the simulation */
    id: string
    /** API version */
    version?: number
    /** Simulation status */
    status: SimulationStatusType
}
interface StartSimulationResponseType extends _StartSimulationResponseType {
    constructor: { new (): StartSimulationResponseType }
}

/** Statistics of a KPI */
interface _StatsValueType extends BaseType {
    /** Average */
    average: number
    /** Maximum */
    max: number
    /** Minimum */
    min: number
}
export interface StatsValueType extends _StatsValueType {
    constructor: { new (): StatsValueType }
}
export var StatsValueType: { new (): StatsValueType }

export interface document extends BaseType {
    /** Results of the simulation. Includes KPI stats and common data for charts */
    Results: ResultsType_2
    /** Response containing data to create a histogram of given value series */
    SimulationHistogramResponse: SimulationHistogramResponseType
    /** Response for simulation results/KPI request */
    SimulationKPIResponse: SimulationKPIResponseType
    /** Simulator performance/stats related information response */
    SimulationSimulatorStatsResponse: SimulationSimulatorStatsResponseType
    /** Response for SimulationStatus request */
    SimulationStatusResponse: SimulationStatusResponseType
    /** Request to start a simulation */
    StartSimulationRequest: StartSimulationRequestType
    /** Response for StartSimulationRequest */
    StartSimulationResponse: StartSimulationResponseType
}
export var document: document
