import * as React from 'react'

export class Validate {
    public static required = (v: string) => ((typeof v === 'string' && v !== '') || !!v ? '' : 'Value is required')
    public static numeric = (v: string) => (v === '' || !isNaN(parseFloat(v)) ? '' : 'Value must be numeric')

    public static min = (v: string, min: number) => (parseFloat(v) >= min ? '' : 'Minimum allowed value is ' + min)
    public static max = (v: string, max: number) => (parseFloat(v) <= max ? '' : 'Maximum allowed value is ' + max)
    public static between = (v: string, min: number, max: number) =>
        !Validate.min(v, min) && !Validate.max(v, max) ? '' : 'Value must be between ' + min + ' and ' + max
}

export interface ValidateMe {
    validate(): string
    getComponent(): React.Component<any, any>
    getElementId(): string
}

interface ValidateByElementId {
    [elementId: string]: Array<ValidateMe>
}

export class Validator {
    private _validateByElementId: ValidateByElementId = {}

    private _errors = new Array<string>()

    private getKey(validate: ValidateMe) {
        return validate.getElementId() || 'ALL'
    }

    public register(validate: ValidateMe) {
        const key = this.getKey(validate)

        if (!this._validateByElementId[key]) this._validateByElementId[key] = []

        this._validateByElementId[key].push(validate)
    }

    public unRegister(validate: ValidateMe) {
        const key = this.getKey(validate)

        if (this._validateByElementId[key]) {
            this._validateByElementId[key] = this._validateByElementId[key].filter((v) => v !== validate)
        }
    }

    public validateAll(): boolean {
        this._errors = []

        for (let key in this._validateByElementId) {
            const errorStr = this.validateElement(key)
            if (!!errorStr) {
                this._errors.push(errorStr)
            }
        }

        return this._errors.length === 0
    }

    public validateElement(elementKey: string): string {
        const validates = this._validateByElementId[elementKey]
        if (validates) {
            for (let i = 0; i < validates.length; ++i) {
                const validateMe = validates[i]
                const errorStr = validateMe.validate()

                if (!!errorStr) {
                    return errorStr
                }
            }
        }

        return ''
    }

    public getErrors(): Array<string> {
        return this._errors
    }
}
