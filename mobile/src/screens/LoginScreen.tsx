import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppBackground from '../components/AppBackground';
import { GoogleIcon } from '../components/AppSvgIcons';
import AuthField from '../components/AuthField';
import BrandMark from '../components/BrandMark';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { signIn, signInWithGoogle, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      await signIn(email, password);
    } catch (e) {
      setError('Unable to sign in.');
    }
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.logoWrap}>
            <BrandMark compact />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.title}>Sign in</Text>
            <View style={styles.accountRow}>
              <Text style={styles.accountText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.accountLink}>Register here!</Text>
            </TouchableOpacity>
          </View>

          <AuthField
            icon="email"
              label="Email"
              placeholder="Enter your email address"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <AuthField
              icon="lock"
              label="Password"
              placeholder="Enter your Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.link}>Forgot password?</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={isLoading}>
              <Text style={styles.buttonText}>{isLoading ? 'Login...' : 'Login'}</Text>
            </TouchableOpacity>

            <Text style={styles.continueText}>or continue with</Text>
            <TouchableOpacity style={styles.googleWrap} activeOpacity={0.85} onPress={signInWithGoogle}>
              <GoogleIcon size={30} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 34,
    paddingBottom: 28,
  },
  logoWrap: {
    alignSelf: 'flex-end',
    marginRight: 2,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 22,
  },
  formCard: {
    backgroundColor: 'rgba(18, 17, 38, 0.96)',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#242658',
    marginTop: 12,
  },
  accountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 26,
  },
  accountText: {
    color: '#ddd9ea',
    fontSize: 14,
  },
  accountLink: {
    color: '#6d5ff1',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#8c69f5',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  link: {
    color: '#7165f2',
    marginTop: 10,
    marginBottom: 8,
    fontSize: 14,
  },
  error: {
    color: '#f87171',
    marginTop: 4,
    textAlign: 'center',
  },
  continueText: {
    color: '#6c64d8',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
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
