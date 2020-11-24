import axios from 'axios';
import {baseUrl} from "../shared/baseUrl";

const apiClient = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
    headers: {
        'Accept': 'application/json'
    }
});

export default apiClient;