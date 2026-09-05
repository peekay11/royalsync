import React, { useState, useEffect } from 'react';
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
  LockIcon,
  SunIcon,
  MoonIcon,
  IdCardIcon,
  GlobeIcon,
  PhoneIcon,
  CheckmarkIcon,
  ShieldIcon,
  AlertIcon,
} from '../components/GrommetIcons';
import { RoyalSquareLogo } from '../components/RoyalSquareLogo';
import { SeniorHelpModal } from '../components/SeniorHelpModal';

interface LoginScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

type IdType = 'rsa_id' | 'passport';
type AuthMethod = 'pin' | 'otp';
type LoginStep = 'enter_id' | 'enter_auth';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister }) => {
  const { colors, isDark, toggleTheme, scaleFont, easyMode } = useTheme();

  // Multi-step progressive flow
  const [step, setStep] = useState<LoginStep>('enter_id');
  const [idType, setIdType] = useState<IdType>('rsa_id');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('pin');
  const [seniorHelpVisible, setSeniorHelpVisible] = useState(false);

  // Input credentials
  const [idNumber, setIdNumber] = useState('');
  const [passportNumber, setPassportNumber] = useState('A09884210');
  const [pin, setPin] = useState('49291');
  const [otp, setOtp] = useState('');

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState('+27 82 ••• 4567');
  const [resendTimer, setResendTimer] = useState(0);

  // Loading & Error Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const activeIdString = idType === 'rsa_id' ? idNumber.trim() : passportNumber.trim();

  // Step 1: Validate ID / Passport and move to Step 2
  const handleProceedToAuth = () => {
    if (!activeIdString) {
      setError(idType === 'rsa_id' ? 'Please enter your 13-digit RSA ID Number.' : 'Please enter your Passport Number.');
      return;
    }

    if (idType === 'rsa_id' && activeIdString.length < 13) {
      setError('A valid RSA ID Number must be 13 digits.');
      return;
    }

    setError('');
    setStep('enter_auth');
  };

  // Send OTP
  const handleSendOtp = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await ApiService.sendLoginOtp(activeIdString);
      setLoading(false);
      setOtpSent(true);
      setMaskedPhone(res.maskedPhone);
      setResendTimer(30);
    } catch (err: any) {
      setLoading(false);
      setError('Unable to send OTP. Please verify your ID or try again.');
    }
  };

  // Final Step 2 Submission (PIN or OTP)
  const handleFinalSignIn = async () => {
    if (authMethod === 'pin') {
      if (!pin || pin.length < 4) {
        setError('Please enter your 4-6 digit Security PIN.');
        return;
      }
    } else {
      if (!otp || otp.length < 4) {
        setError('Please enter the 6-digit OTP code received via SMS.');
        return;
      }
    }

    setError('');
    setLoading(true);

    try {
      await ApiService.loginWithId({
        idType,
        idNumber: activeIdString,
        authMethod,
        code: authMethod === 'pin' ? pin : otp,
      });
      setLoading(false);
      onLogin();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header Navigation */}
      <View style={styles.topBar}>
        {step === 'enter_auth' ? (
          <TouchableOpacity
            style={[styles.backStepBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => {
              setStep('enter_id');
              setError('');
            }}
          >
            <Text style={[styles.backStepText, { color: colors.text, fontSize: scaleFont(12) }]}>← Change ID</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            style={[
              styles.seniorAssistPill,
              {
                backgroundColor: easyMode ? colors.primary : colors.card,
                borderColor: easyMode ? colors.primary : colors.cardBorder,
              },
            ]}
            onPress={() => setSeniorHelpVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.seniorAssistText, { color: easyMode ? '#ffffff' : colors.text, fontSize: scaleFont(11) }]}>
              {easyMode ? 'Easy View: ON' : 'Need Help?'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            {isDark ? (
              <SunIcon color={colors.gold} size={16} />
            ) : (
              <MoonIcon color={colors.primary} size={16} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Brand Logo & Screen Titles */}
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <RoyalSquareLogo size={62} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          {step === 'enter_id' ? 'Policyholder Sign In' : 'Verify Your Identity'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {step === 'enter_id'
            ? 'Enter your RSA ID or Passport to access your portfolio'
            : 'Authenticate using your Security PIN or SMS OTP'}
        </Text>
      </View>

      {/* ── STEP 1: ENTER ID NUMBER OR PASSPORT ── */}
      {step === 'enter_id' && (
        <View style={styles.formArea}>
          {/* Identity Type Switcher */}
          <Text style={[styles.inputGroupHeading, { color: colors.textMuted }]}>SELECT IDENTIFICATION TYPE</Text>
          <View style={styles.idTypeRow}>
            <TouchableOpacity
              style={[
                styles.idTypeBtn,
                {
                  backgroundColor: idType === 'rsa_id' ? colors.primaryAlpha : colors.card,
                  borderColor: idType === 'rsa_id' ? colors.primary : colors.cardBorder,
                },
              ]}
              onPress={() => {
                setIdType('rsa_id');
                setError('');
              }}
              activeOpacity={0.8}
            >
              <IdCardIcon color={idType === 'rsa_id' ? colors.primary : colors.textSecondary} size={16} />
              <Text
                style={[
                  styles.idTypeBtnText,
                  { color: idType === 'rsa_id' ? colors.primary : colors.textSecondary },
                  idType === 'rsa_id' && styles.idTypeBtnTextActive,
                ]}
              >
                RSA ID Number
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.idTypeBtn,
                {
                  backgroundColor: idType === 'passport' ? colors.primaryAlpha : colors.card,
                  borderColor: idType === 'passport' ? colors.primary : colors.cardBorder,
                },
              ]}
              onPress={() => {
                setIdType('passport');
                setError('');
              }}
              activeOpacity={0.8}
            >
              <GlobeIcon color={idType === 'passport' ? colors.primary : colors.textSecondary} size={16} />
              <Text
                style={[
                  styles.idTypeBtnText,
                  { color: idType === 'passport' ? colors.primary : colors.textSecondary },
                  idType === 'passport' && styles.idTypeBtnTextActive,
                ]}
              >
                Passport Number
              </Text>
            </TouchableOpacity>
          </View>

          {/* Single Focused Identity Input */}
          {idType === 'rsa_id' ? (
            <CustomInput
              label="13-Digit RSA ID Number"
              placeholder="Government ID or passport number"
              value={idNumber}
              onChangeText={setIdNumber}
              keyboardType="numeric"
              maxLength={13}
              icon={<IdCardIcon color={colors.primary} size={18} />}
            />
          ) : (
            <CustomInput
              label="International Passport Number"
              placeholder="e.g. A09884210"
              value={passportNumber}
              onChangeText={setPassportNumber}
              autoCapitalize="characters"
              icon={<GlobeIcon color={colors.primary} size={18} />}
            />
          )}

          {/* Error notice */}
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}>
              <AlertIcon color={colors.primary} size={16} />
              <Text style={[styles.errorText, { color: colors.primary }]}>{error}</Text>
            </View>
          ) : null}

          {/* Continue Action Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleProceedToAuth}
            activeOpacity={0.88}
          >
            <Text style={styles.submitButtonText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── STEP 2: AUTHENTICATE WITH PIN OR OTP ── */}
      {step === 'enter_auth' && (
        <View style={styles.formArea}>
          {/* Recognized Policyholder Card */}
          <View
            style={[
              styles.policyholderCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderLeftColor: colors.primary,
              },
            ]}
          >
            <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarInitials}>SD</Text>
            </View>
            <View style={{ flex: 1 }}>
                      <Text style={[styles.policyholderName, { color: colors.text }]}>Policyholder</Text>
              <Text style={[styles.policyholderMeta, { color: colors.textSecondary }]}>
                {idType === 'rsa_id' ? 'RSA ID' : 'Passport'}: {activeIdString}
              </Text>
            </View>
            <View style={[styles.verifiedPill, { backgroundColor: colors.successAlpha, borderColor: colors.successBorder }]}>
              <CheckmarkIcon color={colors.success} size={12} strokeWidth={3} />
              <Text style={[styles.verifiedPillText, { color: colors.success }]}>Verified</Text>
            </View>
          </View>

          {/* Auth Method Selector Tabs: PIN vs. OTP */}
          <View style={[styles.authTabsWrap, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <TouchableOpacity
              style={[
                styles.authTab,
                authMethod === 'pin' && [styles.authTabActive, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }],
              ]}
              onPress={() => {
                setAuthMethod('pin');
                setError('');
              }}
              activeOpacity={0.8}
            >
              <LockIcon color={authMethod === 'pin' ? colors.primary : colors.textMuted} size={16} />
              <Text
                style={[
                  styles.authTabText,
                  { color: authMethod === 'pin' ? colors.primary : colors.textMuted },
                  authMethod === 'pin' && styles.authTabTextActive,
                ]}
              >
                Security PIN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.authTab,
                authMethod === 'otp' && [styles.authTabActive, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }],
              ]}
              onPress={() => {
                setAuthMethod('otp');
                setError('');
              }}
              activeOpacity={0.8}
            >
              <PhoneIcon color={authMethod === 'otp' ? colors.primary : colors.textMuted} size={16} />
              <Text
                style={[
                  styles.authTabText,
                  { color: authMethod === 'otp' ? colors.primary : colors.textMuted },
                  authMethod === 'otp' && styles.authTabTextActive,
                ]}
              >
                One-Time PIN (OTP)
              </Text>
            </TouchableOpacity>
          </View>

          {/* PIN FORM */}
          {authMethod === 'pin' && (
            <View>
              <CustomInput
                label="Enter Security PIN"
                placeholder="•••••"
                value={pin}
                onChangeText={setPin}
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
                icon={<LockIcon color={colors.primary} size={18} />}
              />

              <TouchableOpacity style={styles.forgotBtn} onPress={() => setAuthMethod('otp')}>
                <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot PIN? Sign in with SMS OTP →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* OTP FORM */}
          {authMethod === 'otp' && (
            <View style={styles.otpSection}>
              {!otpSent ? (
                <View style={[styles.otpRequestBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.otpRequestTitle, { color: colors.text }]}>One-Time Verification Code</Text>
                  <Text style={[styles.otpRequestSub, { color: colors.textSecondary }]}>
                    We will send a 6-digit OTP code to your registered phone ({maskedPhone}).
                  </Text>

                  <TouchableOpacity
                    style={[styles.sendOtpBtn, { backgroundColor: colors.primary }]}
                    onPress={handleSendOtp}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <>
                        <PhoneIcon color="#ffffff" size={16} />
                        <Text style={styles.sendOtpBtnText}>Send OTP via SMS</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={[styles.otpSentBanner, { backgroundColor: colors.successAlpha, borderColor: colors.successBorder }]}>
                    <CheckmarkIcon color={colors.success} size={16} strokeWidth={3} />
                    <Text style={[styles.otpSentBannerText, { color: colors.success }]}>
                      OTP Sent to {maskedPhone}
                    </Text>
                  </View>

                  <CustomInput
                    label="Enter 6-Digit OTP Code"
                    placeholder="e.g. 492918"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="numeric"
                    maxLength={6}
                    icon={<PhoneIcon color={colors.primary} size={18} />}
                  />

                  <View style={styles.otpControlsRow}>
                    <TouchableOpacity onPress={handleSendOtp} disabled={resendTimer > 0 || loading}>
                      <Text style={[styles.resendText, { color: resendTimer > 0 ? colors.textMuted : colors.primary }]}>
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Error notice */}
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}>
              <AlertIcon color={colors.primary} size={16} />
              <Text style={[styles.errorText, { color: colors.primary }]}>{error}</Text>
            </View>
          ) : null}

          {/* Sign In Button */}
          {(authMethod === 'pin' || (authMethod === 'otp' && otpSent)) && (
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }, loading && styles.submitButtonDisabled]}
              onPress={handleFinalSignIn}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {authMethod === 'pin' ? 'Sign In with PIN' : 'Verify & Sign In'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Security & FAIS Compliance Guarantee */}
      <View style={styles.securityNoticeRow}>
        <ShieldIcon color={colors.gold} size={14} />
        <Text style={[styles.securityNoticeText, { color: colors.textMuted, fontSize: scaleFont(10) }]}>
          256-bit encrypted authentication · Authorized FSP No. 49291
        </Text>
      </View>

      {/* Senior Help Quick Link */}
      <TouchableOpacity
        style={[styles.seniorLoginHelpBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        onPress={() => setSeniorHelpVisible(true)}
        activeOpacity={0.8}
      >
        <PhoneIcon color={colors.primary} size={16} />
        <Text style={[styles.seniorLoginHelpText, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>
          Need Assistance Signing In? <Text style={{ color: colors.primary, fontWeight: '700' }}>Tap for Advisor Help</Text>
        </Text>
      </TouchableOpacity>

      {/* Footer Register Link */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted, fontSize: scaleFont(13) }]}>Don't have an account? </Text>
        <TouchableOpacity onPress={onRegister}>
          <Text style={[styles.registerLink, { color: colors.primary, fontSize: scaleFont(13) }]}>Register</Text>
        </TouchableOpacity>
      </View>

      {/* Senior Help & Easy View Modal */}
      <SeniorHelpModal
        visible={seniorHelpVisible}
        onClose={() => setSeniorHelpVisible(false)}
        advisorName="Qiniso Thulani Ntuli"
        advisorPhone="+27 82 456 7890"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backStepBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  backStepText: {
    fontSize: 12,
    fontWeight: '700',
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seniorAssistPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  seniorAssistText: {
    fontWeight: '800',
  },
  seniorLoginHelpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  seniorLoginHelpText: {
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 3,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formArea: {
    flex: 1,
  },
  inputGroupHeading: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  idTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  idTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 11,
  },
  idTypeBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  idTypeBtnTextActive: {
    fontWeight: '800',
  },
  policyholderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  policyholderName: {
    fontSize: 14,
    fontWeight: '800',
  },
  policyholderMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  authTabsWrap: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  authTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  authTabActive: {
  },
  authTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  authTabTextActive: {
    fontWeight: '800',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700',
  },
  otpSection: {
    marginBottom: 14,
  },
  otpRequestBox: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  otpRequestTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  otpRequestSub: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 14,
  },
  sendOtpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 12,
  },
  sendOtpBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  otpSentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  otpSentBannerText: {
    fontSize: 11,
    fontWeight: '700',
  },
  otpControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  autofillLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  resendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  securityNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 14,
  },
  securityNoticeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 13,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
