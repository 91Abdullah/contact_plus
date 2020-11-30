import * as ActionTypes from "./actionTypes"
import axios from "axios"
import {cookieRoute, login, logout, user} from "../shared/baseUrl";
import apiClient from "../services/apiClient"
import {allowedUsers} from "../config/user";

export const loginUser = (username, password) => (dispatch) => {
    dispatch(loading())
    apiClient.get('/sanctum/csrf-cookie').then(response => {
        // Login...
        apiClient.post(login, {
            username: username,
            password: password
        }).then(response => {
            console.log(response)
            if(response.status === 200) {
                dispatch(loginSuccess())
                apiClient.get(user).then(response => {
                    //console.log(response)
                    if(response.status === 200 && allowedUsers.indexOf(response.data.type) !== -1) {
                        sessionStorage.setItem('loggedIn', true)
                        dispatch(loginSuccess())
                        dispatch(userSuccess(response.data))
                    } else dispatch(logoutUser(true))
                }).catch(error => {
                    console.log(error)
                })
            } else if (response.status === 302) {
                console.log(response)
            }
        }).catch(error => dispatch(logoutUser()))
    })
}

export const logoutUser = (message = false) => (dispatch) => {
    dispatch(loading())
    apiClient.post(logout).then(response => {
        //console.log(response)
        dispatch(logoutSuccess(message));
        sessionStorage.removeItem('loggedIn');
    })
}

export const getUser = () => dispatch => {
    dispatch(loading())
    apiClient.get(cookieRoute).then((res) => {
        apiClient.get(user).then(response => {
            if(response.status === 200 && allowedUsers.indexOf(response.data.type) !== -1) {
                //sessionStorage.setItem('loggedIn', true)
                dispatch(userSuccess(response.data))
            } else {
                dispatch(logoutUser(true))
            }
        }).catch(error => {
            if(error.response.status === 401) {
                dispatch(logoutUser())
            } else {
                dispatch(userFailed(error.response.data))
            }
        })
    })
}

export const loading = () => ({
    type: ActionTypes.LOGIN_LOADING
})

export const loginSuccess = () => ({
    type: ActionTypes.LOGIN_SUCCESS,
    payload: true
})

export const loginFailed = (message) => ({
    type: ActionTypes.LOGIN_FAILED,
    payload: message
})

export const logoutSuccess = (error = false) => ({
    type: ActionTypes.LOGOUT_SUCCESS,
    payload: error
})

export const userSuccess = (user) => ({
    type: ActionTypes.USER_SUCCESS,
    payload: user
})

export const userFailed = (error) => ({
    type: ActionTypes.USER_FAILED,
    payload: error
})