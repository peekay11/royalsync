import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { CustomInput } from '../components/CustomInput';
import { ApiService } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { LockIcon, ShieldIcon, AlertIcon } from '../components/GrommetIcons';
import { RoyalSquareLogo } from '../components/RoyalSquareLogo';
import { MobileLegalPrivacyModal } from '../components/MobileLegalPrivacyModal';

interface LoginScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister }) => {
  const { colors, isDark } = useTheme();

  const [idNumber, setIdNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState<'POPIA' | 'GDPR' | 'HYBRID_EU'>('POPIA');

  const handleSignIn = async () => {
    if (!idNumber || !otp) {
      setError('Please enter your ID Number and OTP code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await ApiService.loginWithId({ idType: 'rsa_id', idNumber, authMethod: 'otp', code: otp });
      setLoading(false);
      onLogin();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication failed. Please check your OTP.');
    }
  };

  const handleSendOtp = async () => {
    if (!idNumber) {
      setError('Please enter your ID Number first.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await ApiService.sendOtp(idNumber);
      setOtpSent(true);
      setSuccessMsg(res.message || 'OTP sent successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <RoyalSquareLogo size={62} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Policyholder Sign In</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Enter your ID number and one-time PIN to access your portfolio</Text>
        
        {/* Visible Legal & Privacy Switcher Badge at Top of Login */}
        <TouchableOpacity
          style={[styles.legalPolicyPill, { backgroundColor: isDark ? '#1e1a20' : '#f8fafc', borderColor: colors.divider }]}
          onPress={() => setLegalModalVisible(true)}
          activeOpacity={0.8}
        >
          <ShieldIcon color={colors.primary} size={14} />
          <Text style={[styles.legalPolicyText, { color: colors.text }]}>
            Data Policy: <Text style={{ fontWeight: '800', color: colors.primary }}>{privacyPolicy === 'GDPR' ? 'EU GDPR (EU)' : (privacyPolicy === 'HYBRID_EU' ? 'Dual Accord (POPIA + GDPR)' : 'POPIA (SA)')}</Text>
          </Text>
          <Text style={[styles.legalPolicyChange, { color: colors.primary }]}>· Switch Framework ▾</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formArea}>
        <CustomInput
          label="RSA ID Number"
          placeholder="Enter your 13-digit ID"
          value={idNumber}
          onChangeText={setIdNumber}
          keyboardType="numeric"
          icon={<LockIcon color={colors.primary} size={18} />}
        />

        {otpSent && (
          <CustomInput
            label="OTP Code (Hint: 123456)"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            icon={<ShieldIcon color={colors.primary} size={18} />}
          />
        )}

        {!otpSent && (
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.primary }]}
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Send OTP via SMS</Text>}
          </TouchableOpacity>
        )}

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}>
            <AlertIcon color={colors.primary} size={16} />
            <Text style={[styles.errorText, { color: colors.primary }]}>{error}</Text>
          </View>
        ) : null}

        {successMsg ? (
          <View style={[styles.errorBox, { backgroundColor: '#e6f4ea', borderColor: '#34a853' }]}>
            <ShieldIcon color="#34a853" size={16} />
            <Text style={[styles.errorText, { color: '#34a853' }]}>{successMsg}</Text>
          </View>
        ) : null}

        {otpSent && (
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
        )}
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

      {/* Interactive Mobile Legal Policy Modal */}
      <MobileLegalPrivacyModal
        visible={legalModalVisible}
        onClose={() => setLegalModalVisible(false)}
        currentFramework={privacyPolicy}
        onUpdated={setPrivacyPolicy}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 50, paddingBottom: 24, justifyContent: 'space-between' },
  header: { alignItems: 'center', marginBottom: 16 },
  logoWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },
  legalPolicyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 12,
  },
  legalPolicyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  legalPolicyChange: {
    fontSize: 11,
    fontWeight: '800',
  },
  formArea: { flex: 1, marginTop: 4 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, padding: 12, marginBottom: 14, borderWidth: 1 },
  errorText: { flex: 1, fontSize: 13, fontWeight: '600' },
  submitButton: { borderRadius: 16, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 14 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  secondaryButton: { borderRadius: 16, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 14, borderWidth: 1 },
  secondaryButtonText: { fontSize: 15, fontWeight: '700' },
  securityNoticeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginVertical: 14 },
  securityNoticeText: { fontSize: 11, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8 },
  footerText: { fontSize: 14 },
  registerLink: { fontSize: 14, fontWeight: '700' },
});

