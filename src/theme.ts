import { createMuiTheme } from '@material-ui/core/styles'

export const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#1D2951'
        }
    },
    props: {
        MuiButtonBase: {
            disableRipple: true
        }
    }
})
