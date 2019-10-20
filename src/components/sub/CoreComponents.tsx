import * as React from 'react'
import Button from 'react-toolbox/lib/button';
import Checkbox from 'react-toolbox/lib/checkbox';
import Dropdown from 'react-toolbox/lib/dropdown';
import Input from 'react-toolbox/lib/input';
import DatePicker from 'react-toolbox/lib/date_picker';
import TimePicker from 'react-toolbox/lib/time_picker';
import Tooltip from 'react-toolbox/lib/tooltip';
import { ValidateMe, Validate } from '../../model-components/Validator'
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';

import * as Actions from '../../actions/ActionType'
import { store } from '../../store'

export const TooltipButton = onlyUpdateForKeys([])(Tooltip(Button))
export const TooltipCheckbox = onlyUpdateForKeys(['checked', 'error', 'disabled'])(Tooltip(Checkbox))
export const TooltipDropdown = onlyUpdateForKeys(['value', 'error', 'source', 'required'])(Tooltip(Dropdown))
export const TooltipInput = onlyUpdateForKeys(['value', 'error', 'required'])(Tooltip(Input))
export const TooltipDatePicker = onlyUpdateForKeys(['value', 'error'])(Tooltip(DatePicker));
export const TooltipTimePicker = onlyUpdateForKeys(['value', 'error'])(Tooltip(TimePicker));


const timeUnits = [
    { value: "seconds", label: "Seconds"},
    { value: "minutes", label: "Minutes"},
    { value: "hours", label: "Hours"},
    { value: "days", label: "Days"},
];

export const TimeUnitDropdown = (props) =>
    <ValidatedDropdown {...props}
        source={timeUnits}
        tooltip="Time unit for the values"
        label="Time unit"
    />;

export const floatLeftInputStyle =
{
    'float': 'left',
    'maxWidth': '110px',
    'marginLeft': '4px',
    'marginRight': '4px'
};

export const width100Style = {'width': '100%'};

type OnChanged = ((value: string) => void);
type ValidateCb = ((valu: string) => string);

interface ValidateProps {
    InputType: "Input" | "Dropdown",
    elementKey?: string;
    validators?: Array<ValidateCb>;
    value: string;
    onValidated?: OnChanged;
    onChange?: OnChanged;
}

interface ValidateState {
    error?: string;
    validators: Array<ValidateCb>;
}

export function ValidatedInput(props: any) {
    return <ValidatedComponent {...props} InputType="Input" />;
}

export function ValidatedDropdown(props: any) {
    return <ValidatedComponent {...props} InputType="Dropdown" />;
}

export abstract class ValidateMeComponent<P, S> extends React.PureComponent<P, S>
    implements ValidateMe  {

    public abstract getElementId(): string;
    public abstract validate(): string;

    public componentDidMount() {
        store.dispatch({
            type: Actions.Action_Validator_Register,
            payload: { validateMe: this }
        });
    }

    public componentWillUnmount() {
        store.dispatch({
            type: Actions.Action_Validator_UnRegister,
            payload: { validateMe: this }
        });
    }

    public getComponent(): React.Component<any, any> {
        return this;
    }
}

class ValidatedComponent
    extends ValidateMeComponent<ValidateProps & any, ValidateState>
    implements ValidateMe  {

    private _value: string;
    private _focused: boolean = false;
    private _changeDispatched: boolean = true;

    constructor(props: ValidateProps & any) {
        super(props);

        let validators = new Array<ValidateCb>();
        if (props.required) {
            validators.push(Validate.required);
        }
        if (props.type === 'number') {
            validators.push(Validate.numeric);
        }

        if (props.validators) {
            props.validators.forEach(v => validators.push(v));
        }

        this._value = props.value;
        this.state = { validators: validators };
    }

    componentDidUpdate(prevProps: ValidateProps) {
        if (prevProps !== this.props) {
            this.validate();
        }
    }

    public getValue(): string {
        return this._value;
    }

    private setValue = (v: string) => {
        this._changeDispatched = false;
        this._value = v;
        this.forceUpdate();

        if (!this._focused) {
            this.dispatchValue();
        }
    }

    public getElementId(): string {
        return this.props.elementKey;
    }

    public validate(): string {
        for (let i = 0; i < this.state.validators.length; ++i) {
            const errorStr = this.state.validators[i](this._value);
            if (!!errorStr) {
                this.setState({ error: errorStr});
                return errorStr;
            }
        }

        if (this.state.error) {
            this.setState({...this.state, error: undefined});
        }

        this.dispatchValue();

        return '';
    }

    private dispatchValue() {
        if (this._changeDispatched)
            return;

        this._changeDispatched = true;

        const isValid = !this.validate();

        if (isValid && this.props.onValidated) {
            this.props.onValidated(this._value);
        }

        if (this.props.onChange) {
            this.props.onChange(this._value);
        }
    }

    private onBlur = () => {
        this.dispatchValue();
        this._focused = false;
    }

    private onFocus = () => {
        this._focused = true;
    }

    render() {
        const { elementKey, error, onBlur, onChange, value, onValidated, validators, source, InputType,
            ...passThroughProps } = this.props;

        switch (InputType) {
            case 'Dropdown':
                if (!!this.props.tooltip) {
                    return <TooltipDropdown
                        {...passThroughProps}
                        error={this.state.error || error}
                        onBlur={this.onBlur}
                        onFocus={this.onFocus}
                        onChange={this.setValue}
                        source={source}
                        value={this._value}
                        allowBlank={!passThroughProps.required}
                    />
                }
                else {
                    return <Dropdown
                        {...passThroughProps}
                        error={this.state.error || error}
                        onBlur={this.onBlur}
                        onFocus={this.onFocus}
                        onChange={this.setValue}
                        source={source}
                        value={this._value}
                        allowBlank={!passThroughProps.required}
                    />
                }
        }

        if (!!this.props.tooltip) {
            return <TooltipInput
                {...passThroughProps}
                error={this.state.error || error}
                onBlur={this.onBlur}
                onFocus={this.onFocus}
                onChange={this.setValue}
                value={this._value}
            />
        }

        return <Input
                {...passThroughProps}
                error={this.state.error || error}
                onBlur={this.onBlur}
                onFocus={this.onFocus}
                onChange={this.setValue}
                value={this._value}
            />
    }

}