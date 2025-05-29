import firestore from '@react-native-firebase/firestore';

export const getQuizzes = async (topicId = null) => {
  try {
    let q;
    if (topicId) {
      q = firestore().collection('quizzes').where('topicId', '==', topicId);
    } else {
      q = firestore().collection('quizzes');
    }
    
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

export const getQuizById = async (quizId) => {
  try {
    const docRef = firestore().collection('quizzes').doc(quizId);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const submitQuizResult = async (userId, quizId, result) => {
  try {
    const resultRef = await firestore().collection('quizResults').add({
      userId,
      quizId,
      ...result,
      submittedAt: new Date().toISOString()
    });
    return resultRef.id;
  } catch (error) {
    throw error;
  }
};

export const getUserQuizResults = async (userId) => {
  try {
    const q = firestore().collection('quizResults').where('userId', '==', userId).orderBy('submittedAt', 'desc');
    
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

export const getTopics = async () => {
  try {
    const querySnapshot = await firestore().collection('topics').get();
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const doc = await firestore().collection('users').doc(userId).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (userId, data) => {
  try {
    await firestore().collection('users').doc(userId).update(data);
  } catch (error) {
    throw error;
  }
}; 