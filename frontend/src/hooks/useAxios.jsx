import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

const useAxios = () => {
    return axiosInstance
};

export default useAxios;