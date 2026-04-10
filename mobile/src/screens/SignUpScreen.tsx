import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppBackground from '../components/AppBackground';
import { GoogleIcon } from '../components/AppSvgIcons';
import AuthField from '../components/AuthField';
import BrandMark from '../components/BrandMark';
import { useAuth } from '../contexts/AuthContext';

export default function SignUpScreen({ navigation }: any) {
  const { signUp, signInWithGoogle, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignUp = async () => {
    setError('');
    setMessage('');
    if (!email || !password || !firstName || !lastName || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await signUp(email, password, firstName, lastName);
      setMessage('Account created. Check your email to verify, then sign in.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to create account.');
    }
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.logoWrap}>
            <BrandMark compact />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.title}>Sign up</Text>
            <View style={styles.accountRow}>
              <Text style={styles.accountText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.accountLink}>Sign in here!</Text>
              </TouchableOpacity>
            </View>

            <AuthField icon="user" label="First Name" placeholder="Enter your first name" value={firstName} onChangeText={setFirstName} />
            <AuthField icon="user" label="Last Name" placeholder="Enter your last name" value={lastName} onChangeText={setLastName} />
            <AuthField
              icon="email"
              label="Email"
              placeholder="Enter your email address"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <AuthField icon="lock" label="Password" placeholder="Enter your password" secureTextEntry value={password} onChangeText={setPassword} />
            <AuthField icon="lock" label="Confirm Password" placeholder="Confirm your password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {message ? <Text style={styles.message}>{message}</Text> : null}

            <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp} disabled={isLoading}>
              <Text style={styles.buttonText}>{isLoading ? 'Sign up...' : 'Sign up'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.googleWrap}
              activeOpacity={0.85}
              onPress={async () => {
                try {
                  setError('');
                  await signInWithGoogle();
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Google sign-in is unavailable.');
                }
              }}
            >
              <GoogleIcon size={30} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 34, paddingBottom: 28 },
  logoWrap: { alignSelf: 'flex-end', marginRight: 2 },
  title: { color: '#fff', fontSize: 32, fontWeight: '800', marginBottom: 18 },
  formCard: {
    backgroundColor: 'rgba(18, 17, 38, 0.96)',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#242658',
    marginTop: 12,
  },
  accountRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  accountText: { color: '#ddd9ea', fontSize: 14 },
  accountLink: { color: '#6d5ff1', fontSize: 14, fontWeight: '600' },
  primaryButton: {
    backgroundColor: '#8c69f5',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: { color: '#fff', fontWeight: '500', fontSize: 16 },
  error: { color: '#f87171', marginTop: 4, textAlign: 'center' },
  message: { color: '#9fe870', marginTop: 4, textAlign: 'center', lineHeight: 20 },
  googleWrap: {
    alignSelf: 'center',
    marginTop: 18,
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
  },
});
