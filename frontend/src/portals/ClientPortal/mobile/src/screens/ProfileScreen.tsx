import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Linking,
} from 'react-native';
import { UserProfile } from '../types';
import { ApiService } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import {
  PhoneIcon,
  GlobeIcon,
  DocumentTextIcon,
  CheckmarkIcon,
  SunIcon,
  MoonIcon,
  MailIcon,
  CreditCardIcon,
  AlertIcon,
} from '../components/GrommetIcons';
import { RoyalSquareLogo } from '../components/RoyalSquareLogo';
import { NoticeOfAppointmentModal } from '../components/NoticeOfAppointmentModal';
import { ClientServiceAgreementModal } from '../components/ClientServiceAgreementModal';
import { DocumentExpiryNotificationModal } from '../components/DocumentExpiryNotificationModal';
import { UpdateProfileModal } from '../components/UpdateProfileModal';
import { MobileLegalPrivacyModal } from '../components/MobileLegalPrivacyModal';

interface ProfileScreenProps {
  onSignOut: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onSignOut }) => {
  const { colors, isDark, setTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mandateVisible, setMandateVisible] = useState(false);
  const [agreementVisible, setAgreementVisible] = useState(false);
  const [expiryModalVisible, setExpiryModalVisible] = useState(false);
  const [updateProfileVisible, setUpdateProfileVisible] = useState(false);
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState<'POPIA' | 'GDPR' | 'HYBRID_EU'>('POPIA');

  const fetchProfile = async () => {
    try {
      const data = await ApiService.getUserProfile();
      setProfile(data);
    } catch (e) {
      console.log('Failed to fetch profile', e);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleCallAdvisor = () => {
    if (profile?.assignedAdvisor?.phone) {
      Linking.openURL(`tel:${profile.assignedAdvisor.phone}`);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Policyholder Avatar & Title */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatarBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarInitials}>{profile?.initials || ''}</Text>
        </View>

        <Text style={[styles.clientName, { color: colors.text }]}>{profile?.name || ''}</Text>
        {profile?.idNumber && <Text style={[styles.clientIdNum, { color: colors.textSecondary }]}>SA ID: {profile.idNumber}</Text>}

        <View
          style={[
            styles.verifiedBadge,
            {
              backgroundColor: colors.primaryAlpha,
              borderColor: colors.primaryBorder,
            },
          ]}
        >
          <Text style={[styles.verifiedText, { color: colors.primary }]}>
            ● KYC Verified Policyholder
          </Text>
        </View>

        {/* Big Update Profile Details Button */}
        <TouchableOpacity
          style={[
            styles.updateProfileHeaderBtn,
            {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => setUpdateProfileVisible(true)}
          activeOpacity={0.85}
        >
          <DocumentTextIcon color="#ffffff" size={16} />
          <Text style={styles.updateProfileHeaderBtnText}>Update Profile Details</Text>
        </TouchableOpacity>
      </View>

      {/* 3-column stats bar */}
      <View style={styles.statsRow}>
        <View
          style={[
            styles.statBox,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.statVal, { color: colors.gold }]}>{profile?.totalNetWorthFormatted || 'R 0.00'}</Text>
          <Text style={[styles.statLbl, { color: colors.textMuted }]}>Net Worth</Text>
        </View>
        <View
          style={[
            styles.statBox,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.statVal, { color: colors.gold }]}>{profile?.activePoliciesCount || 0}</Text>
          <Text style={[styles.statLbl, { color: colors.textMuted }]}>Policies</Text>
        </View>
        <View
          style={[
            styles.statBox,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.statVal, { color: colors.gold }]}>{profile?.goalCompletionRate || 0}%</Text>
          <Text style={[styles.statLbl, { color: colors.textMuted }]}>Goals Met</Text>
        </View>
      </View>

      {/* Assigned Financial Adviser Banner */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ASSIGNED FINANCIAL ADVISER</Text>
      </View>
      <View
        style={[
          styles.advisorCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.advisorTopRow}>
          <View style={[styles.advisorAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.advisorAvatarText}>{profile?.assignedAdvisor?.initials || 'N/A'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.advisorName, { color: colors.text }]}>{profile?.assignedAdvisor?.name || 'Unassigned Advisor'}</Text>
            <Text style={[styles.advisorTitle, { color: colors.textSecondary }]}>{profile?.assignedAdvisor?.title || 'Financial Planner'}</Text>
            <Text style={[styles.advisorFsp, { color: colors.gold }]}>{profile?.assignedAdvisor?.fspNumber || 'FSP Pending'}</Text>
          </View>
        </View>

        <View style={styles.advisorContactRow}>
          <TouchableOpacity
            style={[styles.advisorBtn, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}
            onPress={handleCallAdvisor}
          >
            <PhoneIcon color={colors.primary} size={15} />
            <Text style={[styles.advisorBtnText, { color: colors.primary }]}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.advisorBtn, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}
            onPress={() => Linking.openURL(`mailto:${profile?.assignedAdvisor?.email}`)}
          >
            <MailIcon color={colors.primary} size={15} />
            <Text style={[styles.advisorBtnText, { color: colors.primary }]}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.advisorBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() => setMandateVisible(true)}
          >
            <Text style={[styles.advisorBtnText, { color: '#ffffff' }]}>Mandate</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Statutory Mandates & Legal Agreements Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>STATUTORY MANDATES & AGREEMENTS</Text>
      </View>

      {/* 1. Client Service Agreement (FAIS Licence 29370) */}
      <TouchableOpacity
        style={[
          styles.appointmentBanner,
          {
            backgroundColor: colors.card,
          },
        ]}
        onPress={() => setAgreementVisible(true)}
        activeOpacity={0.85}
      >
        <View style={[styles.appointmentIconBox, { backgroundColor: colors.primaryAlpha }]}>
          <DocumentTextIcon color={colors.primary} size={22} />
        </View>
        <View style={styles.appointmentInfo}>
          <View style={styles.appointmentTitleRow}>
            <Text style={[styles.appointmentTitle, { color: colors.text }]}>Client Service Agreement</Text>
            <View style={[styles.digitalActivePill, { backgroundColor: colors.successAlpha }]}>
              <Text style={[styles.digitalActiveText, { color: colors.success }]}>FAIS LICENCE 29370</Text>
            </View>
          </View>
          <Text style={[styles.appointmentDate, { color: colors.textSecondary }]}>
            Scope of Services · Personal & Corporate · Remuneration Schedule
          </Text>
          <Text style={[styles.appointmentFee, { color: colors.gold }]}>
            Reg No: 2009/022911/07 · FSP Capped Commission (3.00%)
          </Text>
        </View>
        <Text style={[styles.viewMandateArrow, { color: colors.primary }]}>→</Text>
      </TouchableOpacity>

      {/* 2. Notice of Appointment as Financial Advisor */}
      <TouchableOpacity
        style={[
          styles.appointmentBanner,
          {
            backgroundColor: colors.card,
          },
        ]}
        onPress={() => setMandateVisible(true)}
        activeOpacity={0.85}
      >
        <View style={[styles.appointmentIconBox, { backgroundColor: colors.primaryAlpha }]}>
          <DocumentTextIcon color={colors.primary} size={22} />
        </View>
        <View style={styles.appointmentInfo}>
          <View style={styles.appointmentTitleRow}>
            <Text style={[styles.appointmentTitle, { color: colors.text }]}>Notice of Appointment as Advisor</Text>
            <View style={[styles.digitalActivePill, { backgroundColor: colors.successAlpha }]}>
              <Text style={[styles.digitalActiveText, { color: colors.success }]}>ACTIVE MANDATE</Text>
            </View>
          </View>
          <Text style={[styles.appointmentDate, { color: colors.textSecondary }]}>
            Royal Square Financial (Pty) Ltd · QINISO THULANI NTULI
          </Text>
          <Text style={[styles.appointmentFee, { color: colors.gold }]}>
            Authorized Fee Schedule: 1.50% upfront · 1.00% ongoing
          </Text>
        </View>
        <Text style={[styles.viewMandateArrow, { color: colors.primary }]}>→</Text>
      </TouchableOpacity>

      {/* 3. Document Expiry & SMS/Email Notification Manager */}
      <TouchableOpacity
        style={[
          styles.appointmentBanner,
          {
            backgroundColor: colors.card,
          },
        ]}
        onPress={() => setExpiryModalVisible(true)}
        activeOpacity={0.85}
      >
        <View style={[styles.appointmentIconBox, { backgroundColor: colors.primaryAlpha }]}>
          <PhoneIcon color={colors.primary} size={20} />
        </View>
        <View style={styles.appointmentInfo}>
          <View style={styles.appointmentTitleRow}>
            <Text style={[styles.appointmentTitle, { color: colors.text }]}>Document Expiry & Alerts</Text>
            <View style={[styles.digitalActivePill, { backgroundColor: colors.primaryAlpha }]}>
              <Text style={[styles.digitalActiveText, { color: colors.primary }]}>SMS & EMAIL ACTIVE</Text>
            </View>
          </View>
          <Text style={[styles.appointmentDate, { color: colors.textSecondary }]}>
            Automated alerts for Driving Licence, FICA & Policy renewals
          </Text>
          <Text style={[styles.appointmentFee, { color: colors.gold }]}>
            Endpoints: SMS ({profile?.phone || 'Not configured'}) · Email ({profile?.email || 'Not configured'})
          </Text>
        </View>
        <Text style={[styles.viewMandateArrow, { color: colors.primary }]}>→</Text>
      </TouchableOpacity>

      {/* 4. Legal & Privacy Policy Framework (POPIA / EU GDPR Accord) */}
      <TouchableOpacity
        style={[
          styles.appointmentBanner,
          {
            backgroundColor: colors.card,
            borderColor: colors.primary,
          },
        ]}
        onPress={() => setLegalModalVisible(true)}
        activeOpacity={0.85}
      >
        <View style={[styles.appointmentIconBox, { backgroundColor: colors.primaryAlpha }]}>
          <GlobeIcon color={colors.primary} size={22} />
        </View>
        <View style={styles.appointmentInfo}>
          <View style={styles.appointmentTitleRow}>
            <Text style={[styles.appointmentTitle, { color: colors.text }]}>Legal & Data Privacy Policy</Text>
            <View style={[styles.digitalActivePill, { backgroundColor: colors.successAlpha }]}>
              <Text style={[styles.digitalActiveText, { color: colors.success }]}>
                {privacyPolicy === 'GDPR' ? 'EU GDPR ACTIVE' : (privacyPolicy === 'HYBRID_EU' ? 'DUAL ACCORD ACTIVE' : 'POPIA ACTIVE')}
              </Text>
            </View>
          </View>
          <Text style={[styles.appointmentDate, { color: colors.textSecondary }]}>
            Click to switch or update data protection framework (POPIA ⟷ EU GDPR)
          </Text>
          <Text style={[styles.appointmentFee, { color: colors.primary }]}>
            Accompany EU Residents · Cross-Border Standard Contractual Clauses (SCC)
          </Text>
        </View>
        <Text style={[styles.viewMandateArrow, { color: colors.primary }]}>→</Text>
      </TouchableOpacity>

      {/* Theme / Appearance Selection Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>APPEARANCE & THEME</Text>
      </View>
      <View style={styles.themeSelectorRow}>
        <TouchableOpacity
          style={[
            styles.themeOptionCard,
            {
              backgroundColor: isDark ? colors.hoverBackground : colors.card,
            },
          ]}
          onPress={() => setTheme('dark')}
          activeOpacity={0.8}
        >
          <View style={[styles.themeIconCircle, { backgroundColor: '#222222' }]}>
            <MoonIcon color={isDark ? colors.primary : '#888888'} size={20} />
          </View>
          <Text style={[styles.themeOptionTitle, { color: colors.text }]}>Dark Mode</Text>
          <Text style={[styles.themeOptionSub, { color: colors.textMuted }]}>OLED & low light</Text>
          {isDark ? (
            <View style={[styles.activeThemePill, { backgroundColor: colors.primary }]}>
              <CheckmarkIcon color="#ffffff" size={12} strokeWidth={3} />
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.themeOptionCard,
            {
              backgroundColor: !isDark ? colors.hoverBackground : colors.card,
            },
          ]}
          onPress={() => setTheme('light')}
          activeOpacity={0.8}
        >
          <View style={[styles.themeIconCircle, { backgroundColor: '#f0f2f5' }]}>
            <SunIcon color={!isDark ? colors.primary : '#888888'} size={20} />
          </View>
          <Text style={[styles.themeOptionTitle, { color: colors.text }]}>Light Mode</Text>
          <Text style={[styles.themeOptionSub, { color: colors.textMuted }]}>High daylight clarity</Text>
          {!isDark ? (
            <View style={[styles.activeThemePill, { backgroundColor: colors.primary }]}>
              <CheckmarkIcon color="#ffffff" size={12} strokeWidth={3} />
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {/* Policyholder Personal & Payout Info */}
      <View style={[styles.sectionHeader, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>PERSONAL & PAYOUT DETAILS</Text>
        <TouchableOpacity
          onPress={() => setUpdateProfileVisible(true)}
          style={[styles.editPillBtn, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}
        >
          <Text style={[styles.editPillText, { color: colors.primary }]}>Edit Details</Text>
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.detailsCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        {[
          {
            renderIcon: () => <MailIcon color={colors.primary} size={18} />,
            label: 'Email',
            value: profile?.email || 'Not configured',
          },
          {
            renderIcon: () => <PhoneIcon color={colors.primary} size={18} />,
            label: 'Mobile',
            value: profile?.phone || 'Not configured',
          },
          {
            renderIcon: () => <GlobeIcon color={colors.primary} size={18} />,
            label: 'Residential Address',
            value: profile?.physicalAddress || 'Sandton, Johannesburg',
          },
          {
            renderIcon: () => <CreditCardIcon color={colors.primary} size={18} />,
            label: 'Claim Payout Account',
            value: profile?.bankDetails || 'FNB Cheque (••• 4912)',
          },
        ].map((item, idx, arr) => (
          <View
            key={idx}
            style={[
              styles.detailItem,
              idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.divider },
            ]}
          >
            <View style={styles.detailIconBox}>{item.renderIcon()}</View>
            <View style={styles.detailInfo}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{item.label}</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        style={[
          styles.signOutBtn,
          {
            backgroundColor: colors.primaryAlpha,
            borderColor: colors.primaryBorder,
          },
        ]}
        onPress={onSignOut}
      >
        <Text style={[styles.signOutText, { color: colors.primary }]}>Sign Out</Text>
      </TouchableOpacity>

      {/* Watermark brand footer */}
      <View style={styles.brandFooter}>
        <RoyalSquareLogo size={22} secondaryColor={isDark ? '#888888' : '#666666'} />
        <Text style={[styles.footerBrandText, { color: colors.textMuted }]}>ROYAL SQUARE FINANCIAL</Text>
      </View>

      {/* Update Profile Modal */}
      <UpdateProfileModal
        visible={updateProfileVisible}
        onClose={() => setUpdateProfileVisible(false)}
        profile={profile}
        onProfileUpdated={fetchProfile}
      />

      {/* Notice of Appointment Modal */}
      <NoticeOfAppointmentModal
        visible={mandateVisible}
        onClose={() => setMandateVisible(false)}
        clientName={profile?.name}
        idNumber={profile?.idNumber}
        email={profile?.email}
        phone={profile?.phone}
        address={profile?.physicalAddress}
      />

      {/* Client Service Agreement Modal */}
      <ClientServiceAgreementModal
        visible={agreementVisible}
        onClose={() => setAgreementVisible(false)}
        clientName={profile?.name}
        idNumber={profile?.idNumber}
      />

      {/* Document Expiry & SMS/Email Notification Manager Modal */}
      <DocumentExpiryNotificationModal
        visible={expiryModalVisible}
        onClose={() => setExpiryModalVisible(false)}
        clientName={profile?.name}
        clientPhone={profile?.phone}
        clientEmail={profile?.email}
      />

      {/* Legal & Privacy Framework Modal */}
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
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatarBadge: {
    width: 80,
    height: 80,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitials: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
  },
  clientName: {
    fontSize: 20,
    fontWeight: '800',
  },
  clientIdNum: {
    fontSize: 12,
    marginTop: 4,
  },
  verifiedBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: 10,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLbl: {
    fontSize: 10,
    marginTop: 4,
  },
  sectionHeader: {
    marginTop: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  advisorCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  advisorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  advisorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisorAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  advisorName: {
    fontSize: 15,
    fontWeight: '700',
  },
  advisorTitle: {
    fontSize: 12,
    marginTop: 1,
  },
  advisorFsp: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  advisorContactRow: {
    flexDirection: 'row',
    gap: 8,
  },
  advisorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 9,
  },
  advisorBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  appointmentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  appointmentIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  appointmentTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  digitalActivePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  digitalActiveText: {
    fontSize: 9,
    fontWeight: '800',
  },
  appointmentDate: {
    fontSize: 11,
    marginTop: 2,
  },
  appointmentFee: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
  },
  viewMandateArrow: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 4,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  themeOptionCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    position: 'relative',
  },
  themeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  themeOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  themeOptionSub: {
    fontSize: 10,
    marginTop: 2,
  },
  activeThemePill: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  detailIconBox: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  signOutBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
  },
  brandFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    opacity: 0.6,
  },
  footerBrandText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  updateProfileHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#e11d48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  updateProfileHeaderBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  editPillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  editPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
