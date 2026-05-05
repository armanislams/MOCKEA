import axios from 'axios';
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_local_url
  // baseURL: import.meta.env.VITE_live_url,
});
const useAxios = () => {
    return axiosInstance
};

export default useAxios;