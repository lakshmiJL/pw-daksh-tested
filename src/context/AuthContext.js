import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  PhoneAuthProvider,
  signInWithCredential,
  OAuthProvider
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { auth, db, firebaseConfig } from '../services/firebase/firebaseConfig';
import { getDoc, setDoc, doc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isVendor, setIsVendor] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // For OTP verification
  const recaptchaVerifier = useRef(null);

  // Google OAuth setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '741920079969-shfcjka54slncmjhetb0m023b0fgn168.apps.googleusercontent.com',
    iosClientId: '741920079969-o56gu4c5cur60ctfcgp2cpb75ld2sgjp.apps.googleusercontent.com',
    androidClientId: '741920079969-h8dkjg7qsdf0mtgfcors4qrhf5v3i5no.apps.googleusercontent.com'
  });

  // ✅ FIX: Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignIn(authentication);
    }
  }, [response]);

  // Helper function to handle Google sign-in
  const handleGoogleSignIn = async (authentication) => {
    try {
      const credential = GoogleAuthProvider.credential(authentication.idToken);
      const userCredential = await signInWithCredential(auth, credential);
      
      // Create or update user document
      const ref = doc(db, 'users', userCredential.user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          role: 'customer',
          createdAt: new Date(),
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL
        });
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  // Email/Password Sign Up
  const signUp = async (email, password, role = 'customer') => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: role,
      createdAt: new Date()
    });
    return res;
  };

  // Email/Password Login
  const logIn = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const user = res.user;
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setIsVendor(docSnap.data().role === 'vendor');
    }
    return res;
  };

  // Logout
  const logOut = () => {
    return signOut(auth);
  };

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setIsVendor(docSnap.data().role === 'vendor');
          }
        }
        setCurrentUser(user);
      } catch (e) {
        console.error('Auth State Change Error:', e);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // ✅ FIX: Simplified Google Login
  const googleLogin = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google Login Error:', error);
      throw error;
    }
  };

  // ✅ FIXED: Apple Login with better error handling
  const appleLogin = async () => {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign In is only available on iOS devices');
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      const provider = new OAuthProvider('apple.com');
      const authCredential = provider.credential({
        idToken: credential.identityToken,
      });

      const userCredential = await signInWithCredential(auth, authCredential);

      // Create user document if new user
      const ref = doc(db, 'users', userCredential.user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          role: 'customer',
          createdAt: new Date(),
          email: credential.email || userCredential.user.email,
          displayName: credential.fullName
            ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
            : null
        });
      }
    } catch (e) {
      if (e.code === 'ERR_CANCELED') {
        // User canceled - don't throw error
        return;
      }
      console.error('Apple Login Error:', e);
      throw e;
    }
  };

  // ✅ FIXED: Send OTP using FirebaseRecaptchaVerifierModal
  const sendOTP = async (phoneNumber) => {
    try {
      // Validate phone number format
      if (!phoneNumber.startsWith('+')) {
        throw new Error('Phone number must include country code (e.g., +91)');
      }
      if (phoneNumber.length < 10) {
        throw new Error('Please enter a valid phone number');
      }

      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current
      );
      
      return verificationId;
    } catch (err) {
      console.error('Send OTP Error:', err);
      throw err;
    }
  };

  // ✅ FIXED: Verify OTP and create user document
  const verifyOTP = async (verificationId, code) => {
    try {
      // Validate OTP length
      if (code.length !== 6) {
        throw new Error('OTP must be 6 digits');
      }

      const credential = PhoneAuthProvider.credential(verificationId, code);
      const userCredential = await signInWithCredential(auth, credential);

      // Create user document if new user
      const ref = doc(db, 'users', userCredential.user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          role: 'customer',
          createdAt: new Date(),
          phoneNumber: userCredential.user.phoneNumber
        });
      }

      return userCredential;
    } catch (err) {
      console.error('Verify OTP Error:', err);
      throw err;
    }
  };

  const value = {
    currentUser,
    signUp,
    logIn,
    logOut,
    setIsVendor,
    isVendor,
    googleLogin,
    appleLogin,
    sendOTP,
    verifyOTP
  };

  return (
    <AuthContext.Provider value={value}>
      {/* reCAPTCHA Modal for Phone Auth */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification={true}
      />
      
      {/* ✅ FIX: Render children only once */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}