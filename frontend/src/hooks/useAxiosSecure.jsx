import axios from 'axios';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import useAuth from './useAuth';
const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_local_url
  // baseURL: import.meta.env.VITE_live_url
});

const useAxiosSecure = () => {
  const { user } = useAuth()

  useEffect(() => {
    //intercept request
    const reqInterceptor = axiosSecure.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${user?.accessToken}`
      return config
    })

    ///interceptor response
    const resInterceptor = axiosSecure.interceptors.response.use((response) => {
     
      return response
    }, (error) => {
      // If there is no response, it likely means the request never reached the server (network error / server down)
      if (!error.response) {
        toast.error('Internal Server Error');
        return Promise.reject(error);
      }
      

      return Promise.reject(error);

    })

    return () => {
      axiosSecure.interceptors.request.eject(reqInterceptor);
      axiosSecure.interceptors.response.eject(resInterceptor);

    }

  }, [user])
  return axiosSecure;
};

export default useAxiosSecure;