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
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (k: keyof typeof form, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
  };

  const handleNextStep = () => {
    if (!form.firstName || !form.lastName || !form.idNumber || !form.phone) {
      setError('Please fill in all personal details.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleRegister = async () => {
    if (!form.email || !form.password || !agreed) {
      setError('Please provide email, password and agree to the terms.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await ApiService.register(form);
      setLoading(false);
      onDone();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={step === 2 ? () => setStep(1) : onLogin}
        >
          <Text style={[styles.backText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>

        <View style={styles.progressArea}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Create Account</Text>
          <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#252525' : '#e0e4e8' }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: step === 1 ? '50%' : '100%',
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Step 1: Personal Profile */}
      {step === 1 && (
        <View style={styles.formContent}>
          <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>Personal information</Text>

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
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={handleNextStep}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 2: Credentials */}
      {step === 2 && (
        <View style={styles.formContent}>
          <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>Account credentials</Text>

          <CustomInput
            label="Email Address"
            placeholder="you@example.com"
            value={form.email}
            onChangeText={v => updateField('email', v)}
            keyboardType="email-address"
            icon={<MailIcon color={colors.textMuted} size={18} />}
          />

          <CustomInput
            label="Password"
            placeholder="Create password"
            value={form.password}
            onChangeText={v => updateField('password', v)}
            secureTextEntry
            icon={<LockIcon color={colors.textMuted} size={18} />}
          />

          <CustomInput
            label="Confirm Password"
            placeholder="Repeat password"
            value={form.confirm}
            onChangeText={v => updateField('confirm', v)}
            secureTextEntry
            icon={<ShieldIcon color={colors.textMuted} size={18} />}
          />

          {/* Terms checkbox */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.termsCheckBox,
                {
                  borderColor: agreed ? colors.primary : colors.inputBorder,
                  backgroundColor: agreed ? colors.primary : 'transparent',
                },
              ]}
            >
              {agreed ? <CheckmarkIcon color="#ffffff" size={12} strokeWidth={3} /> : null}
            </View>
            <Text style={[styles.termsText, { color: colors.textSecondary }]}>
              I agree to the <Text style={{ color: colors.primary }}>Terms of Service</Text> and{' '}
              <Text style={{ color: colors.primary }}>Privacy Policy</Text> of Royal Square Financial.
            </Text>
          </TouchableOpacity>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}>
              <Text style={[styles.errorText, { color: colors.primary }]}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: colors.primary },
              (!agreed || loading) && styles.primaryBtnDisabled,
            ]}
            onPress={handleRegister}
            disabled={!agreed || loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

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
