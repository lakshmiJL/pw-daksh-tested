import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView
} from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context'; 
import CustomInput from '../../components/common/CustomInput';
import { useAuth } from '../../context/AuthContext';
import * as AppleAuthentication from 'expo-apple-authentication';

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOTPMode, setIsOTPMode] = useState(false);
  const [phone, setPhone] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otp, setOtp] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('customer');

  const { signUp, logIn, googleLogin, appleLogin, sendOTP, verifyOTP } = useAuth();

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      if (isOTPMode) {
        if (!confirmationResult) {
          const confirmation = await sendOTP(phone);
          setConfirmationResult(confirmation);
          Alert.alert('OTP Sent', 'Please enter the OTP received.');
        } else {
          await verifyOTP(confirmationResult, otp);
        }
      } else {
        if (isLoginMode) {
          await logIn(email, password);
        } else {
          await signUp(email, password, role);
        }
      }
    } catch (error) {
      Alert.alert("Authentication Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* EXCLUSIVITY LOGIC: Using a ternary operator ensures only ONE screen 
            renders at a time, fixing the "double screen" issue.
        */}
        {isOTPMode ? (
          /* --- PHONE OTP UI --- */
          <View style={styles.formContainer}>
            <Text style={styles.title}>Login with OTP</Text>
            
            {!confirmationResult ? (
              <TextInput
                placeholder="Phone Number (+91...)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={styles.input}
                placeholderTextColor="#999"
              />
            ) : (
              <TextInput
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                style={styles.input}
                placeholderTextColor="#999"
              />
            )}

            <TouchableOpacity style={styles.mainButton} onPress={handleAuth} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.mainButtonText}>
                  {confirmationResult ? 'Verify OTP' : 'Send OTP'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setIsOTPMode(false); setConfirmationResult(null); }}>
              <Text style={styles.switchText}>Back to Email Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* --- EMAIL & SOCIAL UI --- */
          <View style={styles.formContainer}>
            <Text style={styles.title}>
              {isLoginMode ? "Welcome Back!" : "Create Account"}
            </Text>

            <CustomInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <CustomInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />

            {!isLoginMode && (
              <View style={styles.roleContainer}>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.roleButton, role === 'customer' && styles.activeRole]}
                    onPress={() => setRole('customer')}>
                    <Text style={role === 'customer' ? styles.activeText : styles.roleText}>Customer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleButton, role === 'vendor' && styles.activeRole]}
                    onPress={() => setRole('vendor')}>
                    <Text style={role === 'vendor' ? styles.activeText : styles.roleText}>Vendor</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.mainButton} onPress={handleAuth} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.mainButtonText}>{isLoginMode ? 'Login' : 'Sign Up'}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.googleButton} onPress={googleLogin}>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                style={styles.appleButton}
                onPress={appleLogin}
              />
            )}

            <TouchableOpacity style={styles.switchButton} onPress={() => setIsLoginMode(prev => !prev)}>
              <Text style={styles.switchText}>
                {isLoginMode ? "Need an account? Sign Up" : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchButton} onPress={() => setIsOTPMode(true)}>
              <Text style={styles.switchText}>Login with Phone OTP</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  formContainer: { width: '100%', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  input: {
    width: '100%',
    maxWidth: 300,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333'
  },
  mainButton: { backgroundColor: '#007AFF', width: '100%', maxWidth: 300, padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  mainButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  roleContainer: { marginVertical: 15, width: '100%', maxWidth: 300 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  roleButton: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, width: '48%', alignItems: 'center' },
  activeRole: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  roleText: { color: '#333' },
  activeText: { color: '#fff', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#ddd', width: '80%', marginVertical: 20 },
  googleButton: { backgroundColor: '#DB4437', width: '100%', maxWidth: 300, padding: 15, borderRadius: 30, alignItems: 'center' },
  googleText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  appleButton: { width: '100%', maxWidth: 300, height: 50, marginTop: 10 },
  switchButton: { marginTop: 15 },
  switchText: { color: '#007AFF', fontSize: 14 }
});
