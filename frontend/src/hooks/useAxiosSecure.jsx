import axios from 'axios';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import useAuth from './useAuth';
import { API_BASE_URL } from '../utils/apiConfig';

const axiosSecure = axios.create({
  baseURL: API_BASE_URL
});

const useAxiosSecure = () => {
  const { user, logOut } = useAuth()

  useEffect(() => {
    //intercept request
    const reqInterceptor = axiosSecure.interceptors.request.use((config) => {
      
      config.headers.Authorization = `Bearer ${user?.accessToken}`
      return config
    })

    ///interceptor response
    const resInterceptor = axiosSecure.interceptors.response.use((response) => {
     
      return response
    }, async (error) => {
      // If there is no response, it likely means the request never reached the server (network error / server down)
      if (!error.response) {
        toast.error('Internal Server Error');
        return Promise.reject(error);
      }
      
      const { status } = error.response;
      if (status === 401 || status === 403) {
        try {
          await logOut();
        } catch (logoutError) {
          console.error("Logout failed during interceptor", logoutError);
        }
        window.location.href = "/auth/login";
      }

      return Promise.reject(error);

    })

    return () => {
      axiosSecure.interceptors.request.eject(reqInterceptor);
      axiosSecure.interceptors.response.eject(resInterceptor);

    }

  }, [user, logOut])
  return axiosSecure;
};

export default useAxiosSecure;