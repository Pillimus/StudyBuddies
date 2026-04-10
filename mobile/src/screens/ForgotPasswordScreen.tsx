import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppBackground from '../components/AppBackground';
import AuthField from '../components/AuthField';
import BrandMark from '../components/BrandMark';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPasswordScreen({ navigation }: any) {
  const { sendPasswordReset, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    await sendPasswordReset(email);
    setMessage('If this email exists, a reset link was sent.');
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
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive reset instructions.</Text>

            <AuthField
              icon="email"
              label="Email"
              placeholder="Enter your email address"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {message ? <Text style={styles.message}>{message}</Text> : null}

            <TouchableOpacity style={styles.primaryButton} onPress={handleReset} disabled={isLoading}>
              <Text style={styles.buttonText}>{isLoading ? 'Sending...' : 'Send reset link'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Back to Sign In</Text>
          </TouchableOpacity>
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
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#98a0bc',
    marginBottom: 20,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: 'rgba(18, 17, 38, 0.96)',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#242658',
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: '#8c69f5',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  link: {
    color: '#7165f2',
    marginTop: 22,
    textAlign: 'center',
    fontWeight: '600',
  },
  message: {
    color: '#a3e635',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
});
