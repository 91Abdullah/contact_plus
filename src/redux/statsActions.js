import * as ActionTypes from "./actionTypes"
import apiClient from "../services/apiClient"
import {agentStatus, cookieRoute} from "../shared/baseUrl";

export const fetchStatus = () => dispatch => {
    dispatch(statusLoading())
    apiClient.get(cookieRoute).then(response => {
        apiClient.post(agentStatus)
            .then(response => {
                if(response.status === 200)
                    dispatch(statusSuccess(response.data.data))
                else
                    console.log(response)
            }).catch(error => dispatch(statusFailed(error.response.data)))
    })
}

export const statusLoading = () => ({
    type: ActionTypes.STATUS_LOADING
})

export const statusSuccess = data => ({
    type: ActionTypes.STATUS_SUCCESS,
    payload: data
})

export const statusFailed = (error) => ({
    type: ActionTypes.STATUS_FAILED,
    payload: error
})