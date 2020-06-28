import * as React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

import LinearProgress from '@material-ui/core/LinearProgress'

import * as Types from '../../types'

import { Utils } from '../../model-components/Utils'

interface Props {
    simulation: Types.SimulationType
    errorStackApiKey: string
    lastModelData: Array<string>
}

interface State {
    active: boolean
    errorSent: boolean
}

export default class SimulationStatusDialog extends React.PureComponent<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            active: false,
            errorSent: false
        }
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        // show if simulation was started
        if (!prevState.active && nextProps.simulation && nextProps.simulation.pending)
            return { ...prevState, active: true, errorSent: false }
        // or if simulation completed, then get rid of dialog
        else if (
            prevState.active &&
            !!nextProps.simulation &&
            !!nextProps.simulation.status &&
            nextProps.simulation.status.status == 'COMPLETED'
        )
            return { ...prevState, active: false }

        return null
    }

    handleToggle = () => {
        if (this.isRunning()) return

        this.setState({ active: !this.state.active })
    }

    handleSendBugReport = () => {
        if (!this.props.errorStackApiKey) return

        const simulation = this.props.simulation
        const error =
            !!simulation && !!simulation.status && typeof simulation.status.errorCode === 'string' ? simulation.status.errorCode : 'Unknown'

        this.props.lastModelData.forEach((modelData) => {
            Utils.ReportErrorStackError(this.props.errorStackApiKey, 'simulation', modelData, error)
                .then(() => {
                    this.setState({ ...this.state, errorSent: true })
                })
                .catch(() => {
                    this.setState({ ...this.state, errorSent: true })
                })
        })
    }

    isRunning = (): boolean => {
        const simulation = this.props.simulation
        if (!!simulation && simulation.pending) return true

        const isError = !!simulation.error || (!!simulation.status && typeof simulation.status.errorCode === 'string')
        return (
            !isError &&
            !!simulation &&
            (simulation.pending || (!!simulation.status && simulation.status.status != 'COMPLETED' && simulation.status.status != 'FAILED'))
        )
    }

    render() {
        const simulation = this.props.simulation
        if (!simulation) return null

        const isError = !!simulation.error || (!!simulation.status && typeof simulation.status.errorCode === 'string')
        let actions = []

        let infoText = ''
        if (isError && !!this.props.errorStackApiKey) {
            if (this.state.errorSent) {
                infoText = 'Error report sent. Thank you!'
            } else {
                actions.push({ label: 'Send bug report', onClick: this.handleSendBugReport })
                infoText =
                    'If you think you have found a bug, then please click "Send bug report" button below to send your .bpmn file with simulation scenario for investigation. '
            }
        }

        if (!this.isRunning()) actions.push({ label: 'Close', onClick: this.handleToggle })

        let detailsText = ''
        let statusText = 'Simulation '
        if (isError) {
            statusText += 'FAILED. '

            if (typeof simulation.error === 'object' && !!simulation.error) {
                statusText += 'Error: ' + simulation.error.message
                if (simulation.error.message == 'Network Error') {
                    infoText += 'Please ensure you have a valid access token.'
                }
                detailsText = simulation.error.stack
            }

            if (!!simulation.status) {
                if (!!simulation.status.errorCode) statusText += 'Error: ' + simulation.status.errorCode

                if (!!simulation.status.errorMessage) detailsText = simulation.status.errorMessage

                if (!!simulation.status.errorDetails) detailsText += ' (' + simulation.status.errorDetails + ')'
            }
        } else if (this.isRunning()) {
            statusText += (!!simulation.status ? simulation.status.status : 'RUNNING') + ' ...'
        }

        return (
            <div>
                <Dialog
                    fullWidth
                    open={this.state.active}
                    onClose={this.handleToggle}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Simulation status</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{statusText}</DialogContentText>
                        <DialogContentText id="alert-dialog-description">{infoText}</DialogContentText>
                        {detailsText && (
                            <>
                                <DialogContentText>Details:</DialogContentText>
                                <DialogContentText>{detailsText}</DialogContentText>
                            </>
                        )}
                        {this.isRunning() && <LinearProgress />}
                    </DialogContent>
                    <DialogActions>
                        {actions.map((item) => (
                            <Button key={item.label} onClick={item.onClick} color="primary">
                                {item.label}
                            </Button>
                        ))}
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}
