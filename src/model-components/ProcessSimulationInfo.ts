import * as Types from '../types'
import BPMNParser from './BPMNParser'
import { Utils } from './Utils'
import { Helpers } from './Helpers'

export class ProcessSimulationInfo {
    private static readonly DEFAULT_RESOURCE_ID = 'QBP_DEFAULT_RESOURCE'
    private static readonly SERVICE_RESOURCE_ID = 'QBP_SERVICE_RESOURCE_ID'
    private static DEFAULT_TIMETABLE_ID = 'QBP_DEFAULT_TIMETABLE'
    private static readonly DEFAULT_247_TIMETABLE_ID = 'QBP_247_TIMETABLE'

    public static createAndInit(parser: BPMNParser): Types.ProcessSimulationInfoType {
        const baseType = {} as Types.ProcessSimulationInfoType
        const d = new Date()
        let simInfo = {
            ...baseType,
            id: Utils.Guid(),
            currency: 'EUR',
            startDateTime: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0, 0, 0),
            arrivalRateDistribution: Helpers.createDistributionInfo(),
            elements: { ...baseType.elements, element: [] },
            resources: { ...baseType.resources, resource: [] },
            sequenceFlows: { ...baseType.sequenceFlows, sequenceFlow: [] },
            timetables: { ...baseType.timetables, timetable: [] }
        }

        simInfo.arrivalRateDistribution.type = 'FIXED'
        this.ensureDefaults(simInfo, parser)

        return simInfo
    }

    // merges resources and timetables from all simulation infos, keeps everything else from first sim info in the array
    public static createMergedSimInfo(simInfos: Array<Types.ProcessSimulationInfoType>): Types.ProcessSimulationInfoType {
        let existingResources = new Map<string, Types.Resource>()
        let existingTimetables = new Map<string, Types.TimeTable>()

        simInfos.forEach((s) => {
            s.resources.resource.forEach((r) => existingResources.set(r.id, r))
            s.timetables.timetable.forEach((t) => existingTimetables.set(t.id, t))
        })

        let simInfo = simInfos[0]
        simInfo.resources.resource = Array.from(existingResources.values())
        simInfo.timetables.timetable = Array.from(existingTimetables.values())
        return simInfo
    }

    public static createSimInfoWithDefaultsFromAnother(
        base: Types.ProcessSimulationInfoType,
        current: Types.ProcessSimulationInfoType
    ): Types.ProcessSimulationInfoType {
        return { ...base, elements: current.elements, sequenceFlows: current.sequenceFlows }
    }

    public static ensureDefaults(simInfo: Types.ProcessSimulationInfoType, parser: BPMNParser) {
        this.ensureTypes(simInfo)
        this.ensureTimetables(simInfo)
        this.ensureResources(simInfo, parser)
        this.ensureCatchEvents(simInfo, parser.getCatchEvents())
        this.ensureGateways(simInfo, parser.getGateways())
        this.ensureTasks(simInfo, parser)
        if (!simInfo.statsOptions) {
            simInfo.statsOptions = {}
        }
    }

    private static ensureTypes(simInfo: Types.ProcessSimulationInfoType) {
        // parser may not parse empty arrays correctly
        if (!Array.isArray(simInfo.timetables.timetable)) {
            simInfo.timetables.timetable = []
        }
        if (!Array.isArray(simInfo.resources.resource)) {
            simInfo.resources.resource = []
        }
        if (!Array.isArray(simInfo.elements.element)) {
            simInfo.elements.element = []
        }
        if (!Array.isArray(simInfo.sequenceFlows.sequenceFlow)) {
            simInfo.sequenceFlows.sequenceFlow = []
        }
    }

    private static ensureTimetables(simInfo: Types.ProcessSimulationInfoType) {
        let timetables = simInfo.timetables.timetable
        const hasTimetable = (id: string) => {
            return !!timetables.find((r) => r.id === id)
        }

        const hasDefaultTimetable = () => {
            const timeTable = timetables.find((r) => r.default)
            if (!!timeTable) {
                this.DEFAULT_TIMETABLE_ID = timeTable.id
            }
            return !!timeTable
        }

        const baseTimetable = {} as Types.TimeTable
        const baseRule = {} as Types.TimeTableRule

        if (!hasDefaultTimetable()) {
            const t = {
                ...baseTimetable,
                id: this.DEFAULT_TIMETABLE_ID,
                default: true,
                name: 'Default',
                rules: { ...baseTimetable.rules, rule: [] }
            }

            const rule = {
                ...baseRule,
                fromWeekDay: 'MONDAY',
                fromTime: '09:00:00.000+00:00',
                toWeekDay: 'FRIDAY',
                toTime: '17:00:00.000+00:00'
            }

            t.rules.rule.push(rule)
            timetables.push(t)
        }

        if (!hasTimetable(this.DEFAULT_247_TIMETABLE_ID)) {
            const t = {
                ...baseTimetable,
                id: this.DEFAULT_247_TIMETABLE_ID,
                default: false,
                name: '24/7',
                rules: { ...baseTimetable.rules, rule: [] }
            }

            const rule = {
                ...baseRule,
                fromWeekDay: 'MONDAY',
                fromTime: '00:00:00.000+00:00',
                toWeekDay: 'SUNDAY',
                toTime: '23:59:59.999+00:00'
            }

            t.rules.rule.push(rule)
            timetables.push(t)
        }
    }

    private static ensureResources(simInfo: Types.ProcessSimulationInfoType, parser: BPMNParser) {
        let resources = simInfo.resources.resource
        const existingResources = new Set<string>(resources.map((r) => r.id))

        const hasResource = (id: string) => {
            return existingResources.has(id)
        }

        // add resources from lanes
        parser.getLanes().forEach((lane) => {
            if (hasResource(lane.id)) return

            const baseResource = {} as Types.Resource
            const r = {
                ...baseResource,
                id: lane.id,
                name: lane.name ? lane.name : 'Lane ' + lane.id,
                timetableId: this.DEFAULT_TIMETABLE_ID
            }

            resources.push(r)
        })

        // ensure we have at least one resource
        if (resources.length === 0) {
            const baseResource = {} as Types.Resource
            const r = {
                ...baseResource,
                id: this.DEFAULT_RESOURCE_ID,
                name: 'Default Resource',
                timetableId: this.DEFAULT_TIMETABLE_ID,
                totalAmount: 1
            }

            resources.push(r)
        }

        let serviceTaskCount = 0
        parser.getTasks().forEach((t) => (t.nodeName === 'serviceTask' || t.nodeName === 'scriptTask' ? ++serviceTaskCount : 0))
        if (serviceTaskCount > 0 && !hasResource(this.SERVICE_RESOURCE_ID)) {
            const baseResource = {} as Types.Resource
            const r = {
                ...baseResource,
                id: this.SERVICE_RESOURCE_ID,
                name: 'Automated Service',
                timetableId: this.DEFAULT_247_TIMETABLE_ID,
                totalAmount: serviceTaskCount,
                costPerHour: 0
            }

            resources.push(r)
        }
    }

    private static ensureCatchEvents(simInfo: Types.ProcessSimulationInfoType, catchEvents: Array<Types.CatchEventType>) {
        const existingElements = new Set<string>(simInfo.elements.element.map((e) => e.elementId))

        catchEvents.forEach((e) => {
            if (existingElements.has(e.id)) return

            const baseElement = {} as Types.ElementSimulationInfoType
            const element = { ...baseElement, id: Utils.Guid(), elementId: e.id, durationDistribution: Helpers.createDistributionInfo() }
            element.durationDistribution.type = 'FIXED'
            simInfo.elements.element.push(element)
        })
    }

    private static ensureTasks(simInfo: Types.ProcessSimulationInfoType, parser: BPMNParser) {
        const existingElements = new Map<string, Types.ElementSimulationInfoType>()
        simInfo.elements.element.forEach((e) => {
            existingElements.set(e.elementId, e)
        })

        const isTaskOrParentTaskInLane = (lane: Types.LaneType, task: Types.TaskType) => {
            return (
                !!task &&
                (lane.elementIds.has(task.id) || (!!task.parentId && isTaskOrParentTaskInLane(lane, parser.getTasks().get(task.parentId))))
            )
        }

        const getDefaultResourceId = (task: Types.TaskType): string => {
            const lane = parser.getLanes().find((l) => isTaskOrParentTaskInLane(l, task))

            if (lane) {
                return lane.id
            }

            return this.DEFAULT_RESOURCE_ID
        }

        parser.getTasks().forEach((t) => {
            if (existingElements.has(t.id)) return

            const baseElement = {} as Types.ElementSimulationInfoType
            const element = {
                ...baseElement,
                id: Utils.Guid(),
                elementId: t.id,
                resourceIds: {
                    ...baseElement.resourceIds,
                    resourceId:
                        t.nodeName === 'serviceTask' || t.nodeName === 'scriptTask' ? this.SERVICE_RESOURCE_ID : getDefaultResourceId(t)
                },
                durationDistribution: Helpers.createDistributionInfo()
            }
            element.durationDistribution.type = 'FIXED'
            simInfo.elements.element.push(element)
            existingElements.set(element.elementId, element)
        })
    }

    private static ensureGateways(simInfo: Types.ProcessSimulationInfoType, gateways: Array<Types.GatewayType>) {
        const existingElements = new Set<string>(simInfo.sequenceFlows.sequenceFlow.map((e) => e.elementId))

        gateways.forEach((g) => {
            g.sequenceFlows.forEach((sf, index) => {
                if (existingElements.has(sf.id)) return

                const baseElement = {} as Types.SequenceFlowSimulationInfoType
                let element = { ...baseElement, elementId: sf.id, executionProbability: g.isInclusive ? 1.0 : 1.0 / g.sequenceFlows.length }
                if (g.isInclusive && index === g.sequenceFlows.length - 1) {
                    element.executionProbability = 1.0 - (g.sequenceFlows.length - 1) * element.executionProbability
                }

                simInfo.sequenceFlows.sequenceFlow.push(element)
            })
        })
    }
}
