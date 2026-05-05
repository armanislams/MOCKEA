import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { Navigate } from "react-router";
import { AuthContext } from "./AuthContext";
import auth from "../../firebase.config";


const googleProvider = new GoogleAuthProvider();



const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const register = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };
  const signIn = (email, password) => {
    setLoading(true);

    return signInWithEmailAndPassword(auth, email, password);
  };
  const logOut = () => {
    setLoading(true);
    return signOut(auth);
  };
  const updateUser = (profile) => {
    return updateProfile(auth.currentUser, profile);
  };
  const signInGoogle = () => {
    setLoading(true);

    return signInWithPopup(auth, googleProvider);
  };
  const resetPass = (email) => {
    setLoading(true);
    return sendPasswordResetEmail(auth, email);
  };
  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!user) {<Navigate to={"/login"} replace/>; }
      setUser(currentUser);
      setLoading(false);
      // (currentUser);
    });
    return () => {
      unSubscribe();
    };
  }, [user]);
  const authInfo = {
    register,
    signIn,
    logOut,
    signInGoogle,
    user,
    loading,
    updateUser,
    resetPass,
  };
  return <AuthContext value={authInfo}>{children}</AuthContext>;
};

export default AuthProvider;
