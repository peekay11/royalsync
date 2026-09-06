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
  const [expandedWealth, setExpandedWealth] = useState(false);

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

      {/* Net Worth & Portfolio Hero Card (Click to Expand Breakdown) */}
      <View
        style={[
          styles.aumCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            borderWidth: 1,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setExpandedWealth(prev => !prev)}
          style={styles.aumHeaderTouchable}
        >
          <View style={styles.aumTitleRow}>
            <Text style={[styles.aumLabel, { color: colors.textMuted, fontSize: scaleFont(10) }]}>
              TOTAL PORTFOLIO & WEALTH VALUE
            </Text>
            <View
              style={[
                styles.expandPillBadge,
                {
                  backgroundColor: expandedWealth ? colors.primary : colors.primaryAlpha,
                  borderColor: colors.primaryBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.expandPillText,
                  {
                    color: expandedWealth ? '#ffffff' : colors.primary,
                    fontSize: scaleFont(10),
                  },
                ]}
              >
                {expandedWealth ? 'Hide Breakdown ✕' : 'Click to expand breakdown ↓'}
              </Text>
            </View>
          </View>

          <Text style={[styles.aumValue, { color: colors.text, fontSize: scaleFont(30) }]}>
            {profile?.totalNetWorthFormatted || 'R 2.84M'}
          </Text>

          <View style={styles.aumBadgeRow}>
            <View style={[styles.growthBadge, { backgroundColor: colors.successAlpha }]}>
              <Text style={[styles.growthText, { color: colors.success, fontSize: scaleFont(11) }]}>
                +4.2% YTD
              </Text>
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
            <Text style={[styles.sparkLabelText, { color: colors.primary, fontWeight: '700', fontSize: scaleFont(10) }]}>
              Dec (Current)
            </Text>
          </View>
        </TouchableOpacity>

        {/* EXPANDED BREAKDOWN ACCORDION */}
        {expandedWealth && (
          <View style={[styles.wealthBreakdownContainer, { borderTopColor: colors.divider }]}>
            <View style={styles.breakdownHeaderRow}>
              <Text style={[styles.breakdownHeading, { color: colors.text }]}>
                WHAT MAKES UP THIS VALUATION
              </Text>
              <Text style={[styles.breakdownSubhead, { color: colors.gold }]}>
                Verified FAIS 29370
              </Text>
            </View>

            {/* Asset Allocation Multi-Bar */}
            <View style={styles.allocationSection}>
              <Text style={[styles.allocationTitle, { color: colors.textSecondary, fontSize: scaleFont(10) }]}>
                ASSET CLASS ALLOCATION
              </Text>
              <View style={styles.multiProgressBar}>
                <View style={[styles.progressSegment, { width: '42%', backgroundColor: '#e11d48' }]} />
                <View style={[styles.progressSegment, { width: '30%', backgroundColor: '#f59e0b' }]} />
                <View style={[styles.progressSegment, { width: '15%', backgroundColor: '#10b981' }]} />
                <View style={[styles.progressSegment, { width: '13%', backgroundColor: '#6366f1' }]} />
              </View>
              <View style={styles.allocationLegendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#e11d48' }]} />
                  <Text style={[styles.legendText, { color: colors.textMuted }]}>Equities 42%</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                  <Text style={[styles.legendText, { color: colors.textMuted }]}>Fixed Income 30%</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                  <Text style={[styles.legendText, { color: colors.textMuted }]}>Property 15%</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#6366f1' }]} />
                  <Text style={[styles.legendText, { color: colors.textMuted }]}>Cash 13%</Text>
                </View>
              </View>
            </View>

            {/* Constituents Group 1: Retirement */}
            <View style={[styles.breakdownGroupCard, { backgroundColor: colors.hoverBackground, borderColor: colors.cardBorder }]}>
              <View style={styles.groupHeaderRow}>
                <Text style={[styles.groupTitle, { color: colors.text }]}>1. Retirement & Preservation</Text>
                <Text style={[styles.groupVal, { color: colors.gold }]}>R 1,390,000 (48.9%)</Text>
              </View>
              <View style={styles.groupItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.groupItemName, { color: colors.text }]}>Sanlam Glacier Retirement Annuity</Text>
                  <Text style={[styles.groupItemRef, { color: colors.textMuted }]}>Ref: RA-781920 · Section 10C Shielded</Text>
                </View>
                <Text style={[styles.groupItemVal, { color: colors.text }]}>R 850,000</Text>
              </View>
              <View style={[styles.groupItemRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.groupItemName, { color: colors.text }]}>Old Mutual SuperFund Preservation</Text>
                  <Text style={[styles.groupItemRef, { color: colors.textMuted }]}>Ref: PRF-449102 · Vested Capital</Text>
                </View>
                <Text style={[styles.groupItemVal, { color: colors.text }]}>R 540,000</Text>
              </View>
            </View>

            {/* Constituents Group 2: Unit Trusts & Money Market */}
            <View style={[styles.breakdownGroupCard, { backgroundColor: colors.hoverBackground, borderColor: colors.cardBorder }]}>
              <View style={styles.groupHeaderRow}>
                <Text style={[styles.groupTitle, { color: colors.text }]}>2. Liquid Investments & Funds</Text>
                <Text style={[styles.groupVal, { color: colors.gold }]}>R 1,100,000 (38.7%)</Text>
              </View>
              <View style={styles.groupItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.groupItemName, { color: colors.text }]}>Ninety One High Income Fund</Text>
                  <Text style={[styles.groupItemRef, { color: colors.textMuted }]}>Ref: UT-901844 · Monthly Yield</Text>
                </View>
                <Text style={[styles.groupItemVal, { color: colors.text }]}>R 680,000</Text>
              </View>
              <View style={[styles.groupItemRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.groupItemName, { color: colors.text }]}>Allan Gray Money Market Fund</Text>
                  <Text style={[styles.groupItemRef, { color: colors.textMuted }]}>Ref: MM-339102 · T+1 Immediate</Text>
                </View>
                <Text style={[styles.groupItemVal, { color: colors.text }]}>R 420,000</Text>
              </View>
            </View>

            {/* Constituents Group 3: Offshore */}
            <View style={[styles.breakdownGroupCard, { backgroundColor: colors.hoverBackground, borderColor: colors.cardBorder }]}>
              <View style={styles.groupHeaderRow}>
                <Text style={[styles.groupTitle, { color: colors.text }]}>3. Offshore & Global Capital</Text>
                <Text style={[styles.groupVal, { color: colors.gold }]}>R 350,000 (12.4%)</Text>
              </View>
              <View style={styles.groupItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.groupItemName, { color: colors.text }]}>Coronation Global Optimum Growth</Text>
                  <Text style={[styles.groupItemRef, { color: colors.textMuted }]}>Ref: OFF-110294 · Hard Currency</Text>
                </View>
                <Text style={[styles.groupItemVal, { color: colors.text }]}>R 350,000</Text>
              </View>
            </View>

            {/* Constituents Group 4: Risk Protection & Cover */}
            <View style={[styles.breakdownGroupCard, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}>
              <View style={styles.groupHeaderRow}>
                <Text style={[styles.groupTitle, { color: colors.primary }]}>4. Insured Protection Assets</Text>
                <Text style={[styles.groupVal, { color: colors.primary }]}>R 3,350,000 Total Cover</Text>
              </View>
              <View style={styles.groupItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.groupItemName, { color: colors.text }]}>Discovery Life Comprehensive</Text>
                  <Text style={[styles.groupItemRef, { color: colors.textMuted }]}>Life & Disability · R 3,200/mo</Text>
                </View>
                <Text style={[styles.groupItemVal, { color: colors.text }]}>R 2,500,000</Text>
              </View>
              <View style={[styles.groupItemRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.groupItemName, { color: colors.text }]}>Santam Comprehensive Asset Cover</Text>
                  <Text style={[styles.groupItemRef, { color: colors.textMuted }]}>Vehicle & Home · R 1,850/mo</Text>
                </View>
                <Text style={[styles.groupItemVal, { color: colors.text }]}>R 850,000</Text>
              </View>
            </View>

            {/* Collapse button */}
            <TouchableOpacity
              onPress={() => setExpandedWealth(false)}
              style={[styles.collapseBtn, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}
            >
              <Text style={[styles.collapseBtnText, { color: colors.primary }]}>▲ Close Portfolio Breakdown</Text>
            </TouchableOpacity>
          </View>
        )}
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
  aumHeaderTouchable: {
    width: '100%',
  },
  aumTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  expandPillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  expandPillText: {
    fontWeight: '700',
  },
  wealthBreakdownContainer: {
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    gap: 12,
  },
  breakdownHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  breakdownSubhead: {
    fontSize: 10,
    fontWeight: '700',
  },
  allocationSection: {
    marginBottom: 6,
  },
  allocationTitle: {
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  multiProgressBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressSegment: {
    height: '100%',
  },
  allocationLegendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  breakdownGroupCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.15)',
    paddingBottom: 6,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  groupVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  groupItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  groupItemName: {
    fontSize: 11,
    fontWeight: '600',
  },
  groupItemRef: {
    fontSize: 9,
    marginTop: 1,
  },
  groupItemVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  collapseBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 4,
  },
  collapseBtnText: {
    fontSize: 12,
    fontWeight: '700',
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
