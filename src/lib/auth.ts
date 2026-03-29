import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  userType: 'student' | 'investor' | 'founder' | 'job-seeker' | 'trader' | 'professional' | 'general';
  interests: string[];
  preferredLanguage: string;
  preferredFormat: 'text' | 'video' | 'audio';
  createdAt: string;
  likedArticles: string[];
  savedArticles: string[];
  interestedTopics: string[];
  notInterestedTopics: string[];
}

// Sign up with email
export const signUp = async (
  email: string,
  password: string,
  username: string,
  userType: UserProfile['userType'],
  interests: string[],
  preferredLanguage: string = 'English',
  preferredFormat: 'text' | 'video' | 'audio' = 'text'
): Promise<UserProfile> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userProfile: UserProfile = {
      uid: user.uid,
      email,
      username,
      userType,
      interests,
      preferredLanguage,
      preferredFormat,
      createdAt: new Date().toISOString(),
      likedArticles: [],
      savedArticles: [],
      interestedTopics: interests,
      notInterestedTopics: [],
    };

    // Save user profile to Firestore
    await setDoc(doc(db, 'users', user.uid), userProfile);

    return userProfile;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create account');
  }
};

// Sign in with email
export const signIn = async (email: string, password: string): Promise<UserProfile> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user profile from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      throw new Error('User profile not found');
    }

    return userDocSnap.data() as UserProfile;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in');
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserProfile> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user profile exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // Create default profile for new Google users
      const defaultProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        username: user.displayName || 'User',
        userType: 'general',
        interests: [],
        preferredLanguage: 'English',
        preferredFormat: 'text',
        createdAt: new Date().toISOString(),
        likedArticles: [],
        savedArticles: [],
        interestedTopics: [],
        notInterestedTopics: [],
      };

      await setDoc(userDocRef, defaultProfile);
      return defaultProfile;
    }

    return userDocSnap.data() as UserProfile;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out');
  }
};

// Get current user
export const getCurrentUser = (): Promise<UserProfile | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            resolve(userDocSnap.data() as UserProfile);
          } else {
            resolve(null);
          }
        } catch (error) {
          reject(error);
        }
      } else {
        resolve(null);
      }
      unsubscribe();
    });
  });
};

// Update user preferences
export const updateUserPreferences = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, updates);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update preferences');
  }
};

// Like article
export const likeArticle = async (uid: string, articleId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const user = userDocSnap.data() as UserProfile;
      const likedArticles = user.likedArticles || [];
      
      if (!likedArticles.includes(articleId)) {
        likedArticles.push(articleId);
        await updateDoc(userDocRef, { likedArticles });
      }
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to like article');
  }
};

// Save article
export const saveArticle = async (uid: string, articleId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const user = userDocSnap.data() as UserProfile;
      const savedArticles = user.savedArticles || [];
      
      if (!savedArticles.includes(articleId)) {
        savedArticles.push(articleId);
        await updateDoc(userDocRef, { savedArticles });
      }
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to save article');
  }
};

// Mark topic as interested
export const markInterestedTopic = async (uid: string, topic: string): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const user = userDocSnap.data() as UserProfile;
      const interestedTopics = user.interestedTopics || [];
      
      if (!interestedTopics.includes(topic)) {
        interestedTopics.push(topic);
        await updateDoc(userDocRef, { interestedTopics });
      }
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to mark interested topic');
  }
};

// Mark topic as not interested
export const markNotInterestedTopic = async (uid: string, topic: string): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const user = userDocSnap.data() as UserProfile;
      const notInterestedTopics = user.notInterestedTopics || [];
      
      if (!notInterestedTopics.includes(topic)) {
        notInterestedTopics.push(topic);
        await updateDoc(userDocRef, { notInterestedTopics });
      }
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to mark not interested topic');
  }
};
