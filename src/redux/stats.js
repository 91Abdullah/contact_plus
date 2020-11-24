import * as ActionTypes from './actionTypes'

const initial = {
    isLoading: false,
    errMess: null,
    status: []
}

export const stats = (state = initial, action) => {
    switch (action.type) {
        case ActionTypes.STATUS_LOADING:
            return {...state, isLoading: true}
        case ActionTypes.STATUS_FAILED:
            return {...state, isLoading: false, errMess: action.payload}
        case ActionTypes.STATUS_SUCCESS:
            return {...state, errMess: null, isLoading: false, status: action.payload}
        default:
            return {...state}
    }
}