import * as ActionTypes from "./actionTypes"
import axios from "axios"
import apiClient from "../services/apiClient"
import {agentLogin, agentLogout, agentNotReady, agentReady, cookieRoute, getReason, agentStatus} from "../shared/baseUrl";

axios.defaults.withCredentials = true

export const loginAgent = () => dispatch => {
    dispatch(loading())
    apiClient.get(cookieRoute).then(response => {
        apiClient.post(agentLogin)
            .then(response => {
                if(response.status === 200) {
                    dispatch(loginSuccess())
                    dispatch(getReasons())
                }
                else
                    console.log(response)
            }).catch(error => dispatch(loginFailed(error.response.data)))
    })
}

export const logoutAgent = () => dispatch => {
    dispatch(loading())
    apiClient.get(cookieRoute).then(response => {
        apiClient.post(agentLogout)
            .then(response => {
                if(response.status === 200)
                    dispatch(logoutSuccess())
                else
                    console.log(response)
            }).catch(error => dispatch(logoutFailed(error.response.data)))
    })
}


export const readyAgent = () => dispatch => {
    dispatch(loading())
    apiClient.get(cookieRoute).then(response => {
        apiClient.post(agentReady)
            .then(response => {
                if(response.status === 200) {
                    dispatch(readySuccess())
                }
                else
                    console.log(response)
            }).catch(error => dispatch(readyFailed(error.response.data)))
    })
}

export const notReadyAgent = (reason) => dispatch => {
    console.log(reason)
    dispatch(loading())
    apiClient.get(cookieRoute).then(response => {
        apiClient.post(agentNotReady, {
            reason
        }).then(response => {
            if(response.status === 200) {
                dispatch(notReadySuccess())
            }
            else
                console.log(response)

        }).catch(error => dispatch(notReadyFailed(error)))
    })
}

export const getReasons = () => dispatch => {
    dispatch(loading())
    apiClient.get(cookieRoute).then(response => {
        apiClient.get(getReason)
            .then(response => {
                if(response.status === 200)
                    dispatch(reasonSuccess(response.data.data))
                else
                    console.log(response)
            }).catch(error => dispatch(reasonFailed(error.response.data)))
    })
}

export const sendWorkcode = workcode => dispatch => {

}

export const loginSuccess = () => ({
    type: ActionTypes.QLOGIN_SUCCESS
})

export const loginFailed = (error) => ({
    type: ActionTypes.QLOGIN_FAILED,
    payload: error
})

export const logoutSuccess = () => ({
    type: ActionTypes.QLOGOUT_SUCCESS
})

export const logoutFailed = (error) => ({
    type: ActionTypes.QLOGOUT_FAILED,
    payload: error
})

export const notReadySuccess = () => ({
    type: ActionTypes.NOTREADY_SUCCESS
})

export const notReadyFailed = error => ({
    type: ActionTypes.NOTREADY_FAILED,
    payload: error
})

export const readyFailed = (error) => ({
    type: ActionTypes.READY_FAILED,
    payload: error
})

export const readySuccess = () => ({
    type: ActionTypes.READY_SUCCESS
})

export const reasonSuccess = data => ({
    type: ActionTypes.REASON_SUCCESS,
    payload: data
})

export const reasonFailed = (reason) => ({
    type: ActionTypes.READY_FAILED,
    error: reason
})

export const workcodeSuccess = () => ({
    type: ActionTypes.WORKCODE_SUCCESS
})

export const workcodeFailed = error => ({
    type: ActionTypes.WORKCODE_FAILED,
    payload: error
})

export const loading = () => ({
    type: ActionTypes.AGENT_LOADING
})