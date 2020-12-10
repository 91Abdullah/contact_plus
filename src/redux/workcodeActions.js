import * as ActionTypes from "./actionTypes"
import apiClient from "../services/apiClient"
import {cookieRoute, getWorkcodes} from "../shared/baseUrl";

export const fetchWorkcodes = () => dispatch => {
    apiClient.get(cookieRoute).then(() => {
        apiClient.get(getWorkcodes).then(response => {
            if(response.status === 200)
                dispatch(getWorkcodeSuccess(response.data))
            else
                dispatch(getWorkcodeFailed("Work codes Fetch failed"))
        }).catch(error => dispatch(getWorkcodeFailed(error.response)))
    })
}

export const loading = () => ({
    type: ActionTypes.WORKCODE_LOADING
})

export const getWorkcodeSuccess = (workcodes) => ({
    type: ActionTypes.GETWORKCODE_SUCCESS,
    payload: workcodes
})

export const getWorkcodeFailed = (error) => ({
    type: ActionTypes.GETWORKCODE_FAILED,
    payload: error
})