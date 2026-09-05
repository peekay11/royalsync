import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { CustomInput } from '../components/CustomInput';
import { ApiService } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import {
  IdCardIcon,
  PhoneIcon,
  MailIcon,
  LockIcon,
  ShieldIcon,
  UserIcon,
  CheckmarkIcon,
} from '../components/GrommetIcons';

interface RegisterScreenProps {
  onDone: () => void;
  onLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onDone, onLogin }) => {
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    phone: '',
    email: '',
    password: '',
    confirm: '',
    role: 'Client',
  });
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!form.firstName || !form.lastName || !form.idNumber || !form.phone) {
      setError('Please fill in all your personal details.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await ApiService.register({
        ...form,
        mobile: form.phone
      });
      setLoading(false);
      onLogin(); // Auto-login handles redirect inside App.tsx usually, or they login with OTP next
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={onLogin} activeOpacity={0.8}>
          <Text style={[styles.backText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressArea}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Register Profile</Text>
        </View>
      </View>

      <View style={styles.formContent}>
        <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>Personal details</Text>

          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <CustomInput
                label="First Name"
                placeholder="First name"
                value={form.firstName}
                onChangeText={v => updateField('firstName', v)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomInput
                label="Last Name"
                placeholder="Dlamini"
                value={form.lastName}
                onChangeText={v => updateField('lastName', v)}
              />
            </View>
          </View>

          <CustomInput
            label="SA ID Number"
            placeholder="Government ID or passport number"
            value={form.idNumber}
            onChangeText={v => updateField('idNumber', v)}
            keyboardType="numeric"
            icon={<IdCardIcon color={colors.textMuted} size={18} />}
          />

          <CustomInput
            label="Mobile Number"
            placeholder="+27 71 234 5678"
            value={form.phone}
            onChangeText={v => updateField('phone', v)}
            keyboardType="phone-pad"
            icon={<PhoneIcon color={colors.textMuted} size={18} />}
          />

          <Text style={[styles.roleLabel, { color: colors.textMuted }]}>I AM A</Text>
          <View style={styles.roleGrid}>
            <View
              style={[
                styles.roleCard,
                {
                  backgroundColor: colors.primaryAlpha,
                  borderColor: colors.primary,
                },
              ]}
            >
              <View style={styles.roleIconBox}>
                <UserIcon color={colors.primary} size={20} />
              </View>
              <Text style={[styles.roleCardText, { color: colors.primary, fontWeight: '800' }]}>Client</Text>
            </View>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}>
              <Text style={[styles.errorText, { color: colors.primary }]}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }, loading && styles.primaryBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryBtnText}>Create Account</Text>}
          </TouchableOpacity>
        </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>Already have an account? </Text>
        <TouchableOpacity onPress={onLogin}>
          <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressArea: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  progressBarTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  formContent: {
    flex: 1,
  },
  stepSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 8,
    marginTop: 4,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  roleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 13,
  },
  roleIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCardText: {
    fontSize: 13,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginVertical: 14,
  },
  termsCheckBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  errorBox: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
  },
  primaryBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
