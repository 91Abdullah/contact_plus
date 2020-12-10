import * as ActionTypes from "./actionTypes"
import axios from "axios"
import apiClient from "../services/apiClient"
import {
    agentLogin,
    agentLogout,
    agentNotReady,
    agentReady,
    cookieRoute,
    getReason,
    agentStatus,
    isAgentReady, agentChannel, submitWorkcode, submitOutboudWorkCode
} from "../shared/baseUrl";

axios.defaults.withCredentials = true

export const loginAgent = () => dispatch => {
    dispatch(loading())
    apiClient.get(cookieRoute).then(response => {
        apiClient.post(agentLogin)
            .then(response => {
                if(response.status === 200) {
                    console.log(response)
                    dispatch(loginSuccess(response.data?.data?.message))
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

export const isReadyAgent = () => dispatch => {
    dispatch(loading())
    apiClient.get(cookieRoute).then(() => {
        apiClient.post(isAgentReady).then(response => {
            if(response.status === 200)
                dispatch(isAgentReadySuccess(response.data))
            else
                dispatch(isAgentReadyFailed('Failed to fetch agent status'))
        }).catch(error => dispatch(isAgentReadyFailed(error.data.message)))
    })
}

export const readyAgent = (reason?) => dispatch => {
    dispatch(loading())
    apiClient.get(cookieRoute).then(response => {
        apiClient.post(agentReady, {
            reason
        })
            .then(response => {
                if(response.status === 200) {
                    console.log(response)
                    dispatch(readySuccess(response.data.data?.message))
                    dispatch(isReadyAgent())
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
                dispatch(isReadyAgent())
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
                    dispatch(reasonSuccess(response.data))
                else
                    console.log(response)
            }).catch(error => dispatch(reasonFailed(error.response.data)))
    })
}

export const getChannel = () => dispatch => {
    apiClient.get(cookieRoute).then(response => {
        apiClient.post(agentChannel)
            .then(response => {
                if(response.status === 200)
                    dispatch(getChannelSuccess(response.data))
            }).catch(error => dispatch(getChannelFailed(error.response.data)))
    })
}

export const sendWorkcode = (code, channel) => dispatch => {
    dispatch(notReadyAgent("ACW_START"))
    apiClient.get(cookieRoute).then(response => {
        apiClient.post(submitWorkcode, {
            code,
            channel
        }).then(response => {
            dispatch(submitWorkcodeSuccess(response.data))
            dispatch(readyAgent("ACW_END"))
        }).catch(error => dispatch(submitWorkcodeFailed(error.response.data)))
    })
}

export const sendOutboundWorkCode = (code, channel) => dispatch => {
    apiClient.get(cookieRoute).then(() => {
        apiClient.post(submitOutboudWorkCode, {
            code,
            channel
        }).then(response => {
            dispatch(outboundWorkCodeSuccess(response.data))
        }).catch(error => dispatch(outboundWorkCodeFailed(error.response.data)))
    })
}

export const outboundWorkCodeSuccess = message => ({
    type: ActionTypes.OUTBOUND_WORKCODE_SUCCESS,
    payload: message
})

export const outboundWorkCodeFailed = error => ({
    type: ActionTypes.OUTBOUND_WORKCODE_FAILED,
    payload: error
})

export const getChannelSuccess = channel => ({
    type: ActionTypes.GETCHANNEL_SUCCESS,
    payload: channel
})

export const getChannelFailed = error => ({
    type: ActionTypes.GETCHANNEL_FAILED,
    payload: error
})

export const submitWorkcodeSuccess = message => ({
    type: ActionTypes.SUBMITWORKCODE_SUCCESS,
    payload: message
})

export const submitWorkcodeFailed = error => ({
    type: ActionTypes.SUBMITWORKCODE_FAILED,
    payload: error
})

export const isAgentReadySuccess = status => ({
    type: ActionTypes.ISREADY_SUCCESS,
    payload: status
})

export const isAgentReadyFailed = error => ({
    type: ActionTypes.ISREADY_FAILED,
    payload: error
})

export const loginSuccess = (message) => ({
    type: ActionTypes.QLOGIN_SUCCESS,
    payload: message
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

export const readySuccess = (message) => ({
    type: ActionTypes.READY_SUCCESS,
    payload: message
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