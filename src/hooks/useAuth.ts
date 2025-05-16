import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { getUserInfo } from '../utils/helpers';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(true);
      if (currentUser) {
        const userInfo = getUserInfo(currentUser.email);
        if (userInfo) {
          setUser(userInfo);
        } else {
          // If not an allowed user, sign them out
          signOut(auth).catch(err => console.error(err));
          setUser(null);
          setError('Unauthorized user. Only specific users can access this app.');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const userInfo = getUserInfo(result.user.email);
      
      if (!userInfo) {
        await signOut(auth);
        setError('Unauthorized user. Only specific users can access this app.');
      }
    } catch (err) {
      console.error('Error signing in: ', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error signing out: ', err);
      setError(err.message);
    }
  };

  return { user, loading, error, signIn, signOut: signOutUser };
};

export default useAuth;