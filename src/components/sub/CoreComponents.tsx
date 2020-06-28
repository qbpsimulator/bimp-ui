import * as React from 'react'
import 'date-fns'
import Button, { ButtonProps } from '@material-ui/core/Button'
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select, { SelectProps } from '@material-ui/core/Select'
import TableCell, { TableCellProps } from '@material-ui/core/TableCell'
import TextField, { TextFieldProps } from '@material-ui/core/TextField'
import {
    MuiPickersUtilsProvider,
    KeyboardDateTimePicker,
    KeyboardDateTimePickerProps,
    KeyboardTimePicker,
    KeyboardTimePickerProps
} from '@material-ui/pickers'

import DateFnsUtils from '@date-io/date-fns'

import { ValidateMe, Validate } from '../../model-components/Validator'

import { store } from '../../store'
import FormHelperText from '@material-ui/core/FormHelperText'

export interface TooltipProps {
    tooltip: string
}

export interface TooltipButtonProps extends TooltipProps, ButtonProps {}
export const TooltipButton: React.ComponentType<TooltipButtonProps> = (props: TooltipButtonProps) => {
    const { tooltip, children, ...rest } = props
    return (
        <Button title={tooltip} {...rest}>
            {children}
        </Button>
    )
}

export interface TooltipCheckboxProps extends TooltipProps, CheckboxProps {
    label: string
}

export const TooltipCheckbox: React.ComponentType<TooltipCheckboxProps> = (props: TooltipCheckboxProps) => {
    const { tooltip, label, ...rest } = props
    return <FormControlLabel title={tooltip} control={<Checkbox {...rest} />} label={label} />
}

export interface TooltipDropdownProps extends TooltipProps, SelectProps {
    label?: string
    helperText?: string
    source: Array<{
        value: string
        label: string
    }>
}

export const TooltipDropdown: React.ComponentType<TooltipDropdownProps> = (props: TooltipDropdownProps) => {
    const { tooltip, label, source, fullWidth, error, helperText, ...rest } = props
    return (
        <FormControl fullWidth={fullWidth} title={tooltip} error={error}>
            <InputLabel>{label}</InputLabel>
            <Select fullWidth={fullWidth} {...rest}>
                {source.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                        {item.label}
                    </MenuItem>
                ))}
            </Select>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    )
}

export type TooltipInputProps = TooltipProps & TextFieldProps

export const TooltipInput: React.ComponentType<TooltipInputProps> = (props: TooltipInputProps) => {
    const { tooltip, ...rest } = props
    return <TextField title={tooltip} {...rest} />
}

export type TooltipDateTimePickerProps = TooltipProps & KeyboardDateTimePickerProps
export const TooltipDateTimePicker: React.ComponentType<TooltipDateTimePickerProps> = (props: TooltipDateTimePickerProps) => {
    const { tooltip, ...rest } = props
    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDateTimePicker variant="inline" title={tooltip} {...rest} />
        </MuiPickersUtilsProvider>
    )
}

export type TooltipTimePickerProps = TooltipProps & KeyboardTimePickerProps
export const TooltipTimePicker: React.ComponentType<TooltipTimePickerProps> = (props: TooltipTimePickerProps) => {
    const { tooltip, ...rest } = props
    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardTimePicker variant="inline" title={tooltip} {...rest} />
        </MuiPickersUtilsProvider>
    )
}

export type TooltipTableCellProps = TooltipProps & TableCellProps
export const TooltipTableCell: React.ComponentType<TooltipTableCellProps> = (props: TooltipTableCellProps) => {
    const { tooltip, ...rest } = props
    return <TableCell {...rest} title={tooltip} />
}

const timeUnits = [
    { value: 'seconds', label: 'Seconds' },
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' }
]

export const TimeUnitDropdown = (props) => (
    <ValidatedDropdown {...props} source={timeUnits} tooltip="Time unit for the values" label="Time unit" />
)

export const floatLeftInputStyle = {
    float: 'left' as any,
    maxWidth: '110px',
    marginLeft: '4px',
    marginRight: '4px'
}

export const width100Style = { width: '100%' }

type OnChanged = (value: string) => void
type ValidateCb = (valu: string) => string

interface ValidateProps {
    InputType: 'Input' | 'Dropdown'
    elementKey?: string
    validators?: Array<ValidateCb>
    value: string
    onValidated?: OnChanged
    onChange?: OnChanged
}

interface ValidateState {
    error?: string
    validators: Array<ValidateCb>
}

export function ValidatedInput(props: any) {
    return <ValidatedComponent {...props} InputType="Input" />
}

export function ValidatedDropdown(props: any) {
    return <ValidatedComponent {...props} InputType="Dropdown" />
}

export abstract class ValidateMeComponent<P, S> extends React.Component<P, S> implements ValidateMe {
    public abstract getElementId(): string
    public abstract validate(): string

    public componentDidMount() {
        const { validator } = store.getState().application
        if (validator) validator.register(this)
    }

    public componentWillUnmount() {
        const { validator } = store.getState().application
        if (validator) validator.unRegister(this)
    }

    shouldComponentUpdate(nextProps: P, nextState: S) {
        const changed =
            (nextProps && Object.keys(nextProps).some((k) => this.props[k] !== nextProps[k])) ||
            (nextState && Object.keys(nextState).some((k) => this.state[k] !== nextState[k]))

        return changed
    }

    public getComponent(): React.Component<any, any> {
        return this
    }
}

class ValidatedComponent extends ValidateMeComponent<ValidateProps & any, ValidateState> implements ValidateMe {
    private _value: string
    private _focused: boolean = false
    private _changeDispatched: boolean = true

    constructor(props: ValidateProps & any) {
        super(props)

        let validators = new Array<ValidateCb>()
        if (props.required) {
            validators.push(Validate.required)
        }
        if (props.type === 'number') {
            validators.push(Validate.numeric)
        }

        if (props.validators) {
            props.validators.forEach((v) => validators.push(v))
        }

        this._value = props.value
        this.state = { validators: validators }
    }

    componentDidUpdate(prevProps: ValidateProps) {
        if (prevProps !== this.props) {
            this.validate()
        }
    }

    public getValue(): string {
        return this._value
    }

    private setValue = (v: string) => {
        this._changeDispatched = false
        this._value = v
        this.forceUpdate()

        if (!this._focused || this.props.InputType === 'Dropdown') {
            this.dispatchValue()
        }
    }

    public getElementId(): string {
        return this.props.elementKey
    }

    public validate(): string {
        for (let i = 0; i < this.state.validators.length; ++i) {
            const errorStr = this.state.validators[i](this._value)
            if (!!errorStr) {
                this.setState({ error: errorStr })
                return errorStr
            }
        }

        if (this.state.error) {
            this.setState({ ...this.state, error: undefined })
        }

        this.dispatchValue()

        return ''
    }

    private dispatchValue() {
        if (this._changeDispatched) return

        this._changeDispatched = true

        const isValid = !this.validate()

        if (isValid && this.props.onValidated) {
            this.props.onValidated(this._value)
        }

        if (this.props.onChange) {
            this.props.onChange(this._value)
        }
    }

    private onBlur = () => {
        this.dispatchValue()
        this._focused = false
    }

    private onFocus = () => {
        this._focused = true
    }

    render() {
        const {
            elementKey,
            error,
            onBlur,
            onChange,
            value,
            onValidated,
            validators,
            source,
            InputType,
            tooltip,
            ...passThroughProps
        } = this.props

        switch (InputType) {
            case 'Dropdown':
                return (
                    <TooltipDropdown
                        {...passThroughProps}
                        tooltip={tooltip}
                        error={!!this.state.error || !!error}
                        helperText={this.state.error || error || undefined}
                        onBlur={this.onBlur}
                        onFocus={this.onFocus}
                        onChange={(e) => this.setValue(e.target.value as string)}
                        source={source}
                        value={this._value}
                    />
                )
        }

        if (!!this.props.tooltip) {
            return (
                <TooltipInput
                    {...passThroughProps}
                    tooltip={tooltip}
                    error={!!this.state.error || !!error}
                    helperText={this.state.error || error || undefined}
                    onBlur={this.onBlur}
                    onFocus={this.onFocus}
                    onChange={(e) => this.setValue(e.target.value as string)}
                    value={this._value}
                />
            )
        }

        return (
            <TextField
                {...passThroughProps}
                error={!!this.state.error || !!error}
                helperText={this.state.error || error || undefined}
                onBlur={this.onBlur}
                onFocus={this.onFocus}
                onChange={(e) => this.setValue(e.target.value as string)}
                value={this._value}
            />
        )
    }
}
