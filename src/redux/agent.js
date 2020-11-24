import * as ActionTypes from './actionTypes'

const initial = {
    isReady: false,
    isLogin: false,
    isLoading: false,
    errMess: null,
    reasons: []
}

export const agent = (state = initial, action) => {
    switch (action.type) {
        default:
            return state
        case ActionTypes.AGENT_LOADING:
            return {...state, isLoading: true}
        case ActionTypes.QLOGIN_FAILED:
            return {...state, isLoading: false, errMess: action.payload}
        case ActionTypes.QLOGIN_SUCCESS:
            return {...state, isLoading: false, isLogin: true}
        case ActionTypes.QLOGOUT_FAILED:
            return {...state, isLoading: false, errMess: action.payload}
        case ActionTypes.QLOGOUT_SUCCESS:
            return {...state, isLoading: false, isLogin: false}
        case ActionTypes.READY_FAILED:
            return {...state, isReady: false, isLoading: false, errMess: action.payload}
        case ActionTypes.READY_SUCCESS:
            return {...state, isReady: true, isLoading: false, errMess: null}
        case ActionTypes.NOTREADY_FAILED:
            return {...state, isReady: true, isLoading: false, errMess: action.payload}
        case ActionTypes.NOTREADY_SUCCESS:
            return {...state, isReady: false, isLoading: false, errMess: null}
        case ActionTypes.REASON_SUCCESS:
            return {...state, reasons: action.payload, isLoading: false, errMess: null}
        case ActionTypes.REASON_FAILED:
            return {...state, reasons: [], errMess: action.payload, isLoading: false}

    }
}