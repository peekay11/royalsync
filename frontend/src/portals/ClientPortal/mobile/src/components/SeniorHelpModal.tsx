import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { RoyalSquareLogo } from './RoyalSquareLogo';
import {
  PhoneIcon,
  ChatIcon,
  ShieldIcon,
  AlertIcon,
  DocumentTextIcon,
  CheckmarkIcon,
  CarIcon,
} from './GrommetIcons';

interface SeniorHelpModalProps {
  visible: boolean;
  onClose: () => void;
  advisorName?: string;
  advisorPhone?: string;
  onOpenClaims?: () => void;
  onOpenPolicies?: () => void;
}

export const SeniorHelpModal: React.FC<SeniorHelpModalProps> = ({
  visible,
  onClose,
  advisorName = 'Qiniso Thulani Ntuli',
  advisorPhone = '+27 82 456 7890',
  onOpenClaims,
  onOpenPolicies,
}) => {
  const { colors, isDark, easyMode, toggleEasyMode, scaleFont } = useTheme();

  const handlePhoneCall = (number: string) => {
    const url = `tel:${number.replace(/\s+/g, '')}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Phone Call', `Dialling ${number}...`);
        }
      })
      .catch(() => {
        Alert.alert('Phone Call', `Dialling ${number}...`);
      });
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Hello Qiniso, I am contacting you from the Royal Square App for assistance with my policies.`);
    const url = `https://wa.me/27824567890?text=${text}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('WhatsApp Support', 'Opening WhatsApp chat with Advisor...');
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Top Header */}
        <View style={[styles.header, { backgroundColor: colors.backgroundElevated, borderBottomColor: colors.divider }]}>
          <View style={styles.headerLeft}>
            <RoyalSquareLogo size={32} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.headerTitle, { color: colors.text, fontSize: scaleFont(15) }]}>
                SENIOR & EASY ASSIST
              </Text>
              <Text style={[styles.headerSub, { color: colors.gold, fontSize: scaleFont(11) }]}>
                We are always here to help you
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[styles.closeBtnText, { color: colors.text, fontSize: scaleFont(16) }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Easy View Mode Switcher Card */}
          <View
            style={[
              styles.modeCard,
              {
                backgroundColor: easyMode ? colors.primaryAlpha : colors.card,
                borderColor: easyMode ? colors.primary : colors.cardBorder,
              },
            ]}
          >
            <View style={styles.modeCardHeader}>
              <View style={[styles.modeIconBox, { backgroundColor: colors.primary }]}>
                <ShieldIcon color="#ffffff" size={22} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modeCardTitle, { color: colors.text, fontSize: scaleFont(15) }]}>
                  Large Text & Easy View Mode
                </Text>
                <Text style={[styles.modeCardSub, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>
                  {easyMode
                    ? 'Large text and simplified buttons are currently ON.'
                    : 'Turn on for larger text, bigger buttons, and high contrast.'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.modeToggleBtn,
                {
                  backgroundColor: easyMode ? colors.primary : colors.card,
                  borderColor: easyMode ? colors.primary : colors.cardBorder,
                },
              ]}
              onPress={toggleEasyMode}
              activeOpacity={0.8}
            >
              <Text style={[styles.modeToggleBtnText, { color: easyMode ? '#ffffff' : colors.text, fontSize: scaleFont(14) }]}>
                {easyMode ? 'Large Text is Enabled (Tap to switch to standard)' : 'Enable Large Text & Easy Mode'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Section: Call Human Advisor */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
            TALK TO A PERSON (NO AUTOMATION)
          </Text>

          <View style={[styles.advisorHelpCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.advisorRow}>
              <View style={[styles.advisorAvatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.advisorAvatarText}>QTN</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.advisorRole, { color: colors.gold, fontSize: scaleFont(10) }]}>
                  YOUR DEDICATED FINANCIAL ADVISOR
                </Text>
                <Text style={[styles.advisorName, { color: colors.text, fontSize: scaleFont(16) }]}>
                  {advisorName}
                </Text>
                <Text style={[styles.advisorPhone, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>
                  FAIS Licensed (FSP 49291) · {advisorPhone}
                </Text>
              </View>
            </View>

            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.callBtn, { backgroundColor: '#10b981' }]}
                onPress={() => handlePhoneCall(advisorPhone)}
                activeOpacity={0.85}
              >
                <PhoneIcon color="#ffffff" size={20} />
                <Text style={[styles.callBtnText, { fontSize: scaleFont(14) }]}>Call Advisor Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.whatsappBtn, { backgroundColor: '#25D366' }]}
                onPress={handleWhatsApp}
                activeOpacity={0.85}
              >
                <ChatIcon color="#ffffff" size={20} />
                <Text style={[styles.callBtnText, { fontSize: scaleFont(14) }]}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: 24/7 Emergency Assistance */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
            24/7 EMERGENCY & ACCIDENT HOTLINES
          </Text>

          <TouchableOpacity
            style={[styles.emergencyCard, { backgroundColor: '#7f1d1d', borderColor: '#ef4444' }]}
            onPress={() => handlePhoneCall('0860 222 222')}
            activeOpacity={0.85}
          >
            <View style={styles.emergencyIconBox}>
              <CarIcon color="#ffffff" size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.emergencyTitle, { fontSize: scaleFont(15) }]}>
                24/7 Roadside Towing & Breakdown
              </Text>
              <Text style={[styles.emergencySub, { fontSize: scaleFont(12) }]}>
                Tap to dial emergency assist (0860 222 222)
              </Text>
            </View>
            <Text style={styles.arrowBig}>→</Text>
          </TouchableOpacity>

          {/* Section: Simple Guide for Seniors */}
          <Text style={[styles.sectionTitle, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
            HOW TO USE THIS APP (STEP-BY-STEP)
          </Text>

          <View style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.guideStep}>
              <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.guideStepTitle, { color: colors.text, fontSize: scaleFont(14) }]}>
                  View Your Monthly Insurance & Savings
                </Text>
                <Text style={[styles.guideStepDesc, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>
                  Tap "Policies" at the bottom of the screen to see all your Sanlam, Old Mutual, and Santam cover with values.
                </Text>
              </View>
            </View>

            <View style={[styles.guideDivider, { backgroundColor: colors.divider }]} />

            <View style={styles.guideStep}>
              <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.guideStepTitle, { color: colors.text, fontSize: scaleFont(14) }]}>
                  Report a Car Accident or Claim
                </Text>
                <Text style={[styles.guideStepDesc, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>
                  Tap "Claims" at the bottom. Choose your insurer, answer 2 simple questions, and take a photo of damage.
                </Text>
              </View>
            </View>

            <View style={[styles.guideDivider, { backgroundColor: colors.divider }]} />

            <View style={styles.guideStep}>
              <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.guideStepTitle, { color: colors.text, fontSize: scaleFont(14) }]}>
                  Tax & Official Documents
                </Text>
                <Text style={[styles.guideStepDesc, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>
                  Your SARS IT3b and Policy schedules are stored safely under your "Profile" tab.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statutoryBox}>
            <ShieldIcon color={colors.gold} size={16} />
            <Text style={[styles.statutoryText, { color: colors.textMuted, fontSize: scaleFont(10) }]}>
              Royal Square Financial is an authorized Financial Services Provider (FSP No. 49291). If you ever need personal guidance, our advisory team is always ready to visit or speak with you directly.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerSub: {
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modeCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  modeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  modeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeCardTitle: {
    fontWeight: '800',
  },
  modeCardSub: {
    marginTop: 3,
    lineHeight: 17,
  },
  modeToggleBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeToggleBtnText: {
    fontWeight: '800',
  },
  sectionTitle: {
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  advisorHelpCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
  },
  advisorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  advisorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisorAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  advisorRole: {
    fontWeight: '800',
    letterSpacing: 1,
  },
  advisorName: {
    fontWeight: '800',
    marginTop: 2,
  },
  advisorPhone: {
    marginTop: 2,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  callBtnText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    marginBottom: 24,
  },
  emergencyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#991b1b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: {
    color: '#ffffff',
    fontWeight: '800',
  },
  emergencySub: {
    color: '#fecaca',
    marginTop: 3,
  },
  arrowBig: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  guideCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  guideStep: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  stepNumberBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  guideStepTitle: {
    fontWeight: '800',
    marginBottom: 4,
  },
  guideStepDesc: {
    lineHeight: 18,
  },
  guideDivider: {
    height: 1,
    marginVertical: 14,
  },
  statutoryBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  statutoryText: {
    flex: 1,
    lineHeight: 15,
  },
});
