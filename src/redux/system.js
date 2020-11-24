import * as ActionTypes from './actionTypes'

const initial = {
    settings: null,
    errMess: null,
    isLoading: false
}

export const system = (state = initial, action) => {
    switch (action.type) {
        default:
            return state
        case ActionTypes.SYSTEM_LOADING:
            return {...state, isLoading: true}
        case ActionTypes.SYSTEM_SUCCESS:
            return {...state, settings: action.payload, isLoading: false, errMess: null}
        case ActionTypes.SYSTEM_FAILED:
            return {...state, isLoading: false, errMess: action.payload}
    }
}