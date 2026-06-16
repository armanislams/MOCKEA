import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

export default function useAdminQuery(queryKey, endpoint, dataKey, options = {}) {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const queryInfo = useQuery({
        queryKey,
        queryFn: async () => {
            const res = await axiosSecure.get(endpoint);
            return dataKey ? res.data[dataKey] : res.data;
        },
        staleTime: 120000, // default to 2 minutes
        ...options
    });

    return {
        ...queryInfo,
        queryClient
    };
}
