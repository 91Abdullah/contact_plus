import * as ActionTypes from "./actionTypes"

const initialState = {
    loggedIn: sessionStorage.getItem('loggedIn') === "true" || false,
    isLoading: false,
    user: null,
}

export const user = (state = initialState, action) => {
    switch (action.type) {
        default:
            return state
        case ActionTypes.LOGIN_LOADING:
            return {...state, isLoading: true}
        case ActionTypes.LOGIN_FAILED:
            return {...state, isLoading: false, errMess: action.payload}
        case ActionTypes.LOGIN_SUCCESS:
            return {...state, isLoading: false, loggedIn: action.payload, errMess: null}
        case ActionTypes.LOGOUT_SUCCESS:
            return {...state, isLoading: false, loggedIn: false, errMess: action.payload, user: null}
        case ActionTypes.USER_SUCCESS:
            return {...state, isLoading: false, user: action.payload, errMess: null}
        case ActionTypes.USER_FAILED:
            return {...state, errMess: action.payload}
    }
}