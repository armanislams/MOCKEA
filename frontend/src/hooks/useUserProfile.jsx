import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

/**
 * useUserProfile
 * Fetches and caches the full authenticated user profile (including targetExam).
 * Returns { userData, isLoading, refetch }.
 */
const useUserProfile = () => {
    const { user: authUser } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: userData, isLoading, refetch } = useQuery({
        queryKey: ["user-profile", authUser?.email],
        queryFn: async () => {
            const { data } = await axiosSecure.get(`/user/${authUser?.email}`);
            return data?.user || null;
        },
        enabled: !!authUser?.email,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return { userData, isLoading, refetch };
};

export default useUserProfile;
