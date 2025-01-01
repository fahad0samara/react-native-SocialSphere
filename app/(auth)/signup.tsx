import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../../styles/theme';
import PageTransition from '../../components/PageTransition';
import Animated, {
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const buttonScale = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(loading ? 0.95 : 1),
      },
    ],
  }));

  return (
    <PageTransition>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign up to get started
          </Text>

          <View style={styles.form}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Animated.View style={buttonScale}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={handleSignup}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/login')}
            >
              <Text style={[styles.linkText, { color: colors.primary }]}>
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    ...typography.header,
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
