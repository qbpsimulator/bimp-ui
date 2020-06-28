import * as Types from '../types'

import { Utils } from './Utils'

export class Helpers {
    public static getTimeTableName(timeTable: Types.TimeTable): string {
        if (typeof timeTable.name === 'string') {
            return timeTable.name
        }

        switch (timeTable.id) {
            case 'DEFAULT_TIMETABLE':
                return 'Default timetable'
            case 'QBP_DEFAULT_TIMETABLE':
                return 'Default timetable'
            case 'QBP_247_TIMETABLE':
                return '24/7'
        }

        return 'N/A (' + timeTable.id + ')'
    }

    public static isDefaultTimeTable(timeTable: Types.TimeTable): boolean {
        switch (timeTable.id) {
            case 'DEFAULT_TIMETABLE':
                return true
            case 'QBP_DEFAULT_TIMETABLE':
                return true
            case 'QBP_247_TIMETABLE':
                return true
        }

        return false
    }

    public static createResource(): Types.Resource {
        return {
            id: Utils.Guid(),
            costPerHour: 0,
            name: '',
            timetableId: '',
            totalAmount: 1
        } as Types.Resource
    }

    public static createTimeTable(): Types.TimeTable {
        let rule = {
            fromTime: '09:00:00',
            toTime: '17:00:00'
        } as Types.TimeTableRule
        rule.fromWeekDay = 'MONDAY'
        rule.toWeekDay = 'FRIDAY'

        let timetable = ({
            id: Utils.Guid(),
            default: false,
            costPerHour: 0,
            name: '',
            timetableId: '',
            totalAmount: 1
        } as any) as Types.TimeTable

        const rules = { ...timetable.rules, rule: [rule] }
        timetable.rules = rules
        return timetable
    }

    public static createDistributionInfo(): Types.DistributionInfo {
        let elem = {} as Types.DistributionInfo
        elem.arg1 = 0
        elem.arg2 = 0
        elem.mean = 0
        elem.timeUnit = 'seconds'
        elem.type = 'FIXED'

        return elem
    }

    public static createDistributionHistogramBin(probability: number) {
        let item = {} as Types.DistributionHistogramBin

        item.distribution = Helpers.createDistributionInfo()
        item.probability = probability

        return item
    }

    public static createDefaultHistogramDataBins(): Types.DistributionInfoHistogramDataBinsType {
        const di = {} as Types.DistributionInfo
        let item = { ...di.histogramDataBins, histogramData: [this.createDistributionHistogramBin(1)] }

        return item
    }

    static fromTime(input: Date): string {
        let s = ''

        if (input.getHours() < 10) s += '0'
        s += input.getHours() + ':'
        if (input.getMinutes() < 10) s += '0'
        s += input.getMinutes()

        s += ':00.000+00:00'
        return s
    }

    static toTime(input: string): Date {
        const t = input.split(':')
        return new Date(2000, 1, 1, parseInt(t[0]), parseInt(t[1]), 0)
    }

    public static s(input: any): string {
        if (input instanceof Object || input === undefined) return ''

        if (typeof input == 'number') {
            if (isNaN(input)) {
                return ''
            }
            return (Math.round(input * 100) / 100).toString()
        }

        return input
    }

    public static b(input: any): boolean {
        return input === true || input === 1
    }

    public static n(input: any): number {
        if (typeof input === 'number') return input

        return NaN
    }

    public static f(input: any): number {
        const value = parseFloat(input)
        if (isNaN(value)) {
            return undefined
        }
        if (typeof input === 'number') {
            return input
        }

        return value
    }

    public static formatDuration(seconds: number | object, shortFormat: boolean = true): string {
        if (typeof seconds === 'object') return '0 s'

        const units = shortFormat ? ['s', 'm', 'h', 'd', 'w'] : ['second', 'minute', 'hour', 'day', 'week']

        const div = [1, 60, 60, 24, 7]
        let i = 0
        for (i = 0; i < units.length; i++, seconds /= div[i]) {
            if (i >= units.length - 1 || seconds / div[i + 1] < 1) break
        }

        let val = Math.round(seconds * 10) / 10
        return val + ' ' + units[i] + (!shortFormat && val != 1 ? 's' : '')
    }

    public static formatCost(cost: number | object, currency: string = ''): string {
        const costVal = typeof cost === 'object' ? '0' : Math.round(cost * 10) / 10

        return costVal + (currency ? ' ' + currency : '')
    }

    public static formatNumber(numValue: number | object): string {
        return typeof numValue === 'object' ? '' : Math.round(numValue * 10) / 10 + ''
    }

    public static ensureNumber(numValue: number | object) {
        return typeof numValue === 'object' ? 0 : numValue
    }

    public static elementHasAnySimulationInfo(element: Types.ElementSimulationInfoType): boolean {
        if (element.hasOwnProperty('durationDistribution')) {
            const v = element.durationDistribution

            const hasDuration =
                this.n(v.mean) ||
                this.n(v.arg1) ||
                this.n(v.arg2) ||
                (v.hasOwnProperty('histogramDataBins') &&
                    v.histogramDataBins.hasOwnProperty('histogramData') &&
                    v.histogramDataBins.histogramData.length > 0)

            if (hasDuration) return true
        }

        if (this.n(element.fixedCost) || this.n(element.costThreshold) || this.n(element.durationThreshold)) return true

        return false
    }

    public static sequenceFlowHasAnySimulationInfo(element: Types.SequenceFlowSimulationInfoType): boolean {
        return !!this.n(element.executionProbability)
    }
}
