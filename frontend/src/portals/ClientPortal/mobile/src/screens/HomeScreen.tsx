import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Reminder, UserProfile, Policy } from '../types';
import { ApiService } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import {
  NotificationIcon,
  CarIcon,
  TargetIcon,
  ShieldIcon,
  DocumentTextIcon,
  IdCardIcon,
  CalendarIcon,
  CakeIcon,
  SunIcon,
  MoonIcon,
  PhoneIcon,
} from '../components/GrommetIcons';
import { RoyalSquareLogo } from '../components/RoyalSquareLogo';
import { DocumentExpiryNotificationModal } from '../components/DocumentExpiryNotificationModal';
import { CompanyLogo } from '../components/CompanyLogo';
import { SeniorHelpModal } from '../components/SeniorHelpModal';
import { HoverableCard } from '../components/HoverableCard';

interface HomeScreenProps {
  onNavigateToClaims: () => void;
  onNavigateToGoals: () => void;
  onNavigateToPortfolio: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToClaims,
  onNavigateToGoals,
  onNavigateToPortfolio,
  onOpenNotifications,
  unreadNotificationsCount = 2,
}) => {
  const { colors, isDark, toggleTheme, easyMode, toggleEasyMode, scaleFont } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expiryModalVisible, setExpiryModalVisible] = useState(false);
  const [seniorHelpModalVisible, setSeniorHelpModalVisible] = useState(false);

  const chartBars = [65, 72, 68, 78, 74, 82, 79, 86, 83, 91, 88, 100];

  const activeInsurers = Array.from(new Set(policies.map(p => p.provider))).map(providerName => {
    const providerPolicies = policies.filter(p => p.provider === providerName);
    const categories = providerPolicies.map(p => p.category).join(' · ');
    return {
      name: providerName,
      policiesCount: providerPolicies.length,
      categories,
    };
  });

  const loadData = async () => {
    try {
      const [userProf, userPols, rems] = await Promise.all([
        ApiService.getUserProfile(),
        ApiService.getPolicies(),
        ApiService.getReminders(),
      ]);
      setProfile(userProf);
      setPolicies(userPols);
      setReminders(rems);
    } catch (e) {
      console.log('Error loading home data', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderReminderIcon = (iconType: string, label: string) => {
    if (label.toLowerCase().includes('licence') || iconType.includes('id')) {
      return <IdCardIcon color={colors.gold} size={18} />;
    }
    if (label.toLowerCase().includes('birthday')) {
      return <CakeIcon color={colors.primaryLight} size={18} />;
    }
    if (label.toLowerCase().includes('review') || label.toLowerCase().includes('meeting')) {
      return <CalendarIcon color={colors.textSecondary} size={18} />;
    }
    return <DocumentTextIcon color={colors.primaryLight} size={18} />;
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
      {/* ── TOP APP HEADER: BRAND & CONTROLS BAR ── */}
      <View style={styles.topBrandBar}>
        <View style={styles.brandLeftGroup}>
          <RoyalSquareLogo size={32} />
          <View style={{ marginLeft: 8 }}>
            <Text style={[styles.brandNameText, { color: colors.text }]}>ROYAL SQUARE</Text>
            <Text style={[styles.brandSubText, { color: colors.gold }]}>FINANCIAL SERVICES</Text>
          </View>
        </View>

        <View style={styles.headerIcons}>
          {/* Senior / Easy Mode Help Button */}
          <TouchableOpacity
            style={[
              styles.seniorAssistPill,
              {
                backgroundColor: easyMode ? colors.hoverBackground : colors.card,
                borderColor: easyMode ? colors.hoverBorder : colors.cardBorder,
              },
            ]}
            onPress={() => setSeniorHelpModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.seniorAssistText, { color: easyMode ? colors.primary : colors.text, fontSize: scaleFont(11) }]}>
              {easyMode ? 'Easy View: ON' : 'Easy Assist'}
            </Text>
          </TouchableOpacity>

          {/* Theme Mode Switcher */}
          <TouchableOpacity
            style={[
              styles.iconCircle,
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

          {/* Interactive Notifications Bell with Badge */}
          <TouchableOpacity
            style={[
              styles.iconCircle,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                position: 'relative',
              },
            ]}
            onPress={onOpenNotifications}
            activeOpacity={0.7}
          >
            <NotificationIcon color={unreadNotificationsCount > 0 ? colors.primary : colors.textSecondary} size={16} />
            {unreadNotificationsCount > 0 && (
              <View style={[styles.notifBadgeCircle, { backgroundColor: colors.primary }]}>
                <Text style={styles.notifBadgeCount}>{unreadNotificationsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── CLIENT GREETING & STATUS ROW (FULL BREATHING ROOM) ── */}
      <View style={styles.greetingContainer}>
        <Text style={[styles.greetingText, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
          Good morning,
        </Text>
        <Text style={[styles.clientName, { color: colors.text, fontSize: scaleFont(24) }]}>
          {profile?.name || 'Client'}
        </Text>
        <View style={styles.memberBadge}>
          <Text style={[styles.memberBadgeText, { color: colors.gold, fontSize: scaleFont(11) }]}>
            ● {profile?.kycStatus || 'KYC pending'}{profile?.memberSince ? ` · Member since ${profile.memberSince}` : ''}
          </Text>
        </View>
      </View>

      {/* Senior & Easy Assist Callout Bar */}
      <HoverableCard
        style={styles.seniorCalloutBox}
        onPress={() => setSeniorHelpModalVisible(true)}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.seniorCalloutTitle, { color: colors.text, fontSize: scaleFont(13) }]}>
            Need Help or Prefer to Talk?
          </Text>
          <Text style={[styles.seniorCalloutSub, { color: colors.textSecondary, fontSize: scaleFont(11) }]}>
            Speak to Advisor Qiniso Ntuli or enable Large Text mode.
          </Text>
        </View>

        <View style={[styles.seniorCalloutBtn, { backgroundColor: colors.hoverBackground }]}>
          <PhoneIcon color={colors.primary} size={14} />
          <Text style={[styles.seniorCalloutBtnText, { color: colors.primary, fontSize: scaleFont(11) }]}>Get Help</Text>
        </View>
      </HoverableCard>

      {/* Net Worth & Portfolio Hero Card */}
      <View
        style={[
          styles.aumCard,
          {
            backgroundColor: colors.card,
          },
        ]}
      >
        <Text style={[styles.aumLabel, { color: colors.textMuted, fontSize: scaleFont(10) }]}>TOTAL PORTFOLIO & WEALTH VALUE</Text>
        <Text style={[styles.aumValue, { color: colors.text, fontSize: scaleFont(30) }]}>{profile?.totalNetWorthFormatted || 'R 2.84M'}</Text>

        <View style={styles.aumBadgeRow}>
          <View style={[styles.growthBadge, { backgroundColor: colors.successAlpha }]}>
            <Text style={[styles.growthText, { color: colors.success, fontSize: scaleFont(11) }]}>+4.2% YTD</Text>
          </View>
          <Text style={[styles.clientsCountText, { color: colors.textSecondary, fontSize: scaleFont(11) }]}>
            {policies.length} Active Policies · {profile?.totalMonthlyPremium || 'R 6,450'}/mo
          </Text>
        </View>

        {/* 12-month performance sparkline */}
        <View style={styles.sparklineContainer}>
          {chartBars.map((h, i) => (
            <View
              key={i}
              style={[
                styles.sparkBar,
                {
                  height: `${h}%`,
                  backgroundColor: i === chartBars.length - 1 ? colors.primary : isDark ? '#262626' : '#e2e6ea',
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.sparkLabels}>
          <Text style={[styles.sparkLabelText, { color: colors.textSubtle, fontSize: scaleFont(10) }]}>Jan</Text>
          <Text style={[styles.sparkLabelText, { color: colors.primary, fontWeight: '700', fontSize: scaleFont(10) }]}>Dec (Current)</Text>
        </View>
      </View>

      {/* Quick Actions (Hoverable Soft Red Glow) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted, fontSize: scaleFont(11) }]}>QUICK ACTIONS</Text>
        <View style={styles.actionGrid}>
          <HoverableCard
            style={[styles.actionCard, easyMode && styles.actionCardLarge]}
            onPress={onNavigateToClaims}
          >
            <View style={[styles.actionIconBox, { backgroundColor: colors.primaryAlpha }]}>
              <CarIcon color={colors.primary} size={easyMode ? 24 : 20} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text, fontSize: scaleFont(13) }]}>Report a Claim</Text>
            <Text style={[styles.actionSub, { color: colors.textSecondary, fontSize: scaleFont(11) }]}>Accident or loss</Text>
          </HoverableCard>

          <HoverableCard
            style={[styles.actionCard, easyMode && styles.actionCardLarge]}
            onPress={onNavigateToPortfolio}
          >
            <View style={[styles.actionIconBox, { backgroundColor: colors.primaryAlpha }]}>
              <ShieldIcon color={colors.primary} size={easyMode ? 24 : 20} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text, fontSize: scaleFont(13) }]}>My Policies</Text>
            <Text style={[styles.actionSub, { color: colors.textSecondary, fontSize: scaleFont(11) }]}>View & download</Text>
          </HoverableCard>

          <HoverableCard
            style={[styles.actionCard, easyMode && styles.actionCardLarge]}
            onPress={onNavigateToGoals}
          >
            <View style={[styles.actionIconBox, { backgroundColor: colors.primaryAlpha }]}>
              <TargetIcon color={colors.primary} size={easyMode ? 24 : 20} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text, fontSize: scaleFont(13) }]}>Wealth Goals</Text>
            <Text style={[styles.actionSub, { color: colors.textSecondary, fontSize: scaleFont(11) }]}>Track progress</Text>
          </HoverableCard>

          <HoverableCard
            style={[styles.actionCard, easyMode && styles.actionCardLarge]}
            onPress={onNavigateToPortfolio}
          >
            <View style={[styles.actionIconBox, { backgroundColor: colors.primaryAlpha }]}>
              <DocumentTextIcon color={colors.primary} size={easyMode ? 24 : 20} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text, fontSize: scaleFont(13) }]}>Tax IT3b Doc</Text>
            <Text style={[styles.actionSub, { color: colors.textSecondary, fontSize: scaleFont(11) }]}>SARS certificate</Text>
          </HoverableCard>
        </View>
      </View>

      {/* Insured With Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>INSURED WITH</Text>
          <Text style={[styles.pendingBadge, { color: colors.primary }]}>{activeInsurers.length} Underwriters</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.insurersScroll}
        >
          {activeInsurers.map((ins, idx) => (
            <HoverableCard
              key={idx}
              style={styles.insurerCard}
              onPress={onNavigateToPortfolio}
            >
              <View style={styles.insurerTopRow}>
                <CompanyLogo name={ins.name} size={38} />
                <View style={[styles.insurerBadge, { backgroundColor: colors.successAlpha }]}>
                  <Text style={[styles.insurerBadgeText, { color: colors.success }]}>● Active Cover</Text>
                </View>
              </View>

              <Text style={[styles.insurerName, { color: colors.text }]}>{ins.name}</Text>
              <Text style={[styles.insurerCategory, { color: colors.textSecondary }]}>{ins.categories}</Text>

              <View style={[styles.insurerFooter, { borderTopColor: isDark ? '#262626' : colors.divider }]}>
                <Text style={[styles.insurerCount, { color: colors.gold }]}>
                  {ins.policiesCount} {ins.policiesCount === 1 ? 'Policy' : 'Policies'}
                </Text>
                <Text style={[styles.insurerLink, { color: colors.primary }]}>View →</Text>
              </View>
            </HoverableCard>
          ))}
        </ScrollView>
      </View>

      {/* Upcoming Tasks & Compliance */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ALERTS & ACTION ITEMS</Text>
          <TouchableOpacity onPress={() => setExpiryModalVisible(true)}>
            <Text style={[styles.pendingBadge, { color: colors.primary }]}>Manage SMS & Email Alerts →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.remindersList}>
          {reminders.map((r, i) => (
            <HoverableCard
              key={i}
              style={[
                styles.reminderCard,
                r.urgent && { backgroundColor: colors.hoverBackground },
              ]}
              onPress={() => setExpiryModalVisible(true)}
            >
              <View
                style={[
                  styles.reminderIconBox,
                  {
                    backgroundColor: isDark ? '#222222' : '#f0f2f5',
                  },
                ]}
              >
                {renderReminderIcon(r.icon, r.label)}
              </View>
              <View style={styles.reminderInfo}>
                <Text style={[styles.reminderLabel, { color: colors.text }]}>{r.label}</Text>
                <Text style={[styles.reminderSub, { color: colors.textMuted }]}>{r.sub}</Text>
              </View>
              {r.urgent ? <View style={[styles.urgentDot, { backgroundColor: colors.primary }]} /> : null}
            </HoverableCard>
          ))}
        </View>
      </View>

      {/* Document Expiry & SMS/Email Notification Manager Modal */}
      <DocumentExpiryNotificationModal
        visible={expiryModalVisible}
        onClose={() => setExpiryModalVisible(false)}
        clientName={profile?.name}
        clientPhone={profile?.phone}
        clientEmail={profile?.email}
      />

      {/* Senior & Easy Assist Modal */}
      <SeniorHelpModal
        visible={seniorHelpModalVisible}
        onClose={() => setSeniorHelpModalVisible(false)}
        advisorName="Qiniso Thulani Ntuli"
        advisorPhone="+27 82 456 7890"
        onOpenClaims={onNavigateToClaims}
        onOpenPolicies={onNavigateToPortfolio}
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
  topBrandBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
  },
  brandLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandNameText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  brandSubText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginTop: 1,
  },
  greetingContainer: {
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  greetingText: {
    fontWeight: '500',
  },
  clientName: {
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  memberBadge: {
    marginTop: 4,
  },
  memberBadgeText: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeCircle: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notifBadgeCount: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  aumCard: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
  },
  aumLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  aumValue: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 6,
  },
  aumBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  growthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  growthText: {
    fontSize: 11,
    fontWeight: '700',
  },
  clientsCountText: {
    fontSize: 11,
  },
  sparklineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 36,
    gap: 4,
    marginTop: 18,
  },
  sparkBar: {
    flex: 1,
    borderRadius: 4,
  },
  sparkLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sparkLabelText: {
    fontSize: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 12,
  },
  pendingBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionSub: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  remindersList: {
    gap: 8,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  reminderIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  reminderSub: {
    fontSize: 11,
    marginTop: 2,
  },
  insurersScroll: {
    gap: 12,
    paddingRight: 8,
  },
  insurerCard: {
    width: 210,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
  },
  insurerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insurerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insurerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  insurerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  insurerName: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },
  insurerCategory: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 14,
  },
  insurerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  insurerCount: {
    fontSize: 11,
    fontWeight: '700',
  },
  insurerLink: {
    fontSize: 11,
    fontWeight: '700',
  },
  urgentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  seniorAssistPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  seniorAssistText: {
    fontWeight: '700',
  },
  seniorCalloutBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
  seniorCalloutTitle: {
    fontWeight: '800',
  },
  seniorCalloutSub: {
    marginTop: 2,
    lineHeight: 16,
  },
  seniorCalloutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  seniorCalloutBtnText: {
    fontWeight: '800',
  },
  actionCardLarge: {
    width: '48%',
    padding: 18,
    minHeight: 120,
    justifyContent: 'center',
  },
});
