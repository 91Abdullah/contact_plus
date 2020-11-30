import axios from 'axios';
import {baseUrl} from "../shared/baseUrl";

const apiClient = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

export default apiClient;