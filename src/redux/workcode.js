import * as ActionTypes from "./actionTypes"

const initial = {
    workcodes: [],
    isLoading: false,
    errMess: null
}

export const workcode = (state = initial, action) => {
    switch (action.type) {
        default:
            return state
        case ActionTypes.GETWORKCODE_LOADING:
            return {...state, isLoading: true}
        case ActionTypes.GETWORKCODE_SUCCESS:
            return {...state, workcodes: action.payload, isLoading: false}
        case ActionTypes.GETWORKCODE_FAILED:
            return {...state, errMess: action.payload}
    }
}