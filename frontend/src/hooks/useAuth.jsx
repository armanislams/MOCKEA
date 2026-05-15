import { use } from 'react';
import { AuthContext } from '../context/Provider/AuthContext';

const useAuth = () => {
    const authInfo = use(AuthContext)
    return authInfo
};

export default useAuth;