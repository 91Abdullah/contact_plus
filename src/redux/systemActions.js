import * as ActionTypes from './actionTypes'
import apiClient from "../services/apiClient";
import {cookieRoute, getSystem} from "../shared/baseUrl";

export const getSettings = () => dispatch => {
    dispatch(loading())
    apiClient.get(cookieRoute).then(response => {
        apiClient.get(getSystem).then(response => {
            //console.log(response)
            if(response.status === 200)
                dispatch(settingSuccess(response.data.data))
            else
                console.log(response)
        }).catch(error => dispatch(settingFailed(error.response.data)))
    })
}

export const loading = () => ({
    type: ActionTypes.SYSTEM_LOADING
})

export const settingSuccess = (setting) => ({
    type: ActionTypes.SYSTEM_SUCCESS,
    payload: setting
})

export const settingFailed = (error) => ({
    type: ActionTypes.SYSTEM_FAILED,
    payload: error
})