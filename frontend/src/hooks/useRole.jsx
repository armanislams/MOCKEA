import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth"
import useAxiosSecure from "./useAxiosSecure";
import { toast } from "react-toastify";

export const useRole=()=>{
    const {user, loading: authLoading}= useAuth();
    const axiosSecure = useAxiosSecure()

    const { isLoading: roleLoading, data: role = null, isError, error } = useQuery({
    queryKey: ["user-role", user?.email],
    enabled: !authLoading && !!user?.email,
    queryFn: async () => {
      try {
        const res = await axiosSecure.get(`/user/${user.email}/role`);
        return res.data?.role || null;
        
      } catch (error) {
        if(error.response?.status === 404){
          toast.error('Something went wrong , please Login or Register again')
        }
        // If there's no response, it likely means the server is down / network error
        if (!error?.response) {
          toast.error("Internal Server Error");
        }
        console.log(error);
        
        throw error;
      }
    },
  });

  return {
    roleLoading: authLoading || roleLoading,
    role,
    isError,
    error,
  };
};