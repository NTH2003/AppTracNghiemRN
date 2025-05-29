import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const registerUser = async (email, password, username, role = 'user') => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await firestore().collection('users').doc(user.uid).set({
      username,
      email,
      role,
      createdAt: new Date().toISOString()
    });

    return user;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData) {
      throw new Error('User data not found');
    }

    // Ensure we have the latest data
    const updatedUserData = {
      ...user,
      ...userData,
      lastLogin: new Date().toISOString()
    };

    // Update last login time
    await firestore().collection('users').doc(user.uid).update({
      lastLogin: updatedUserData.lastLogin
    });

    return updatedUserData;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth().onAuthStateChanged(
      async (user) => {
        if (user) {
          try {
            const userDoc = await firestore().collection('users').doc(user.uid).get();
            const userData = userDoc.data();
            
            if (!userData) {
              resolve(null);
              return;
            }

            // Ensure we have the latest data
            const updatedUserData = {
              ...user,
              ...userData,
              lastLogin: new Date().toISOString()
            };

            // Update last login time
            await firestore().collection('users').doc(user.uid).update({
              lastLogin: updatedUserData.lastLogin
            });

            resolve(updatedUserData);
          } catch (error) {
            console.error('Error fetching user data:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
        unsubscribe();
      },
      (error) => {
        reject(error);
      }
    );
  });
}; 