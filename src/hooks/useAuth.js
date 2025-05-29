import { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { getCurrentUser } from '../services/auth.service';
import { USER_ROLES } from '../constants';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  return {
    user,
    loading,
    isAdmin,
  };
}; 