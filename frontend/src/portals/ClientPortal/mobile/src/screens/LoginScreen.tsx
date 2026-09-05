import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { CustomInput } from '../components/CustomInput';
import { ApiService } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { MailIcon, LockIcon, ShieldIcon, AlertIcon } from '../components/GrommetIcons';
import { RoyalSquareLogo } from '../components/RoyalSquareLogo';

interface LoginScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await ApiService.login(email.trim(), password);
      setLoading(false);
      onLogin();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <RoyalSquareLogo size={62} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Policyholder Sign In</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Enter your email and password to access your portfolio</Text>
      </View>

      <View style={styles.formArea}>
        <CustomInput
          label="Email Address"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          icon={<MailIcon color={colors.primary} size={18} />}
        />

        <CustomInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          icon={<LockIcon color={colors.primary} size={18} />}
        />

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}>
            <AlertIcon color={colors.primary} size={16} />
            <Text style={[styles.errorText, { color: colors.primary }]}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }, loading && styles.submitButtonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.securityNoticeRow}>
        <ShieldIcon color={colors.gold} size={14} />
        <Text style={[styles.securityNoticeText, { color: colors.textMuted }]}>256-bit encrypted authentication · Authorized FSP No. 49291</Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>Don't have an account? </Text>
        <TouchableOpacity onPress={onRegister}>
          <Text style={[styles.registerLink, { color: colors.primary }]}>Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24, justifyContent: 'space-between' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 6, textAlign: 'center', paddingHorizontal: 20 },
  formArea: { flex: 1 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, padding: 12, marginBottom: 14, borderWidth: 1 },
  errorText: { flex: 1, fontSize: 13, fontWeight: '600' },
  submitButton: { borderRadius: 16, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 14 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  securityNoticeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginVertical: 14 },
  securityNoticeText: { fontSize: 11, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8 },
  footerText: { fontSize: 14 },
  registerLink: { fontSize: 14, fontWeight: '700' },
});
