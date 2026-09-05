import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { RoyalSquareLogo } from './RoyalSquareLogo';
import { AppNotification, Screen } from '../types';
import {
  CarIcon,
  ShieldIcon,
  DocumentTextIcon,
  AlertIcon,
  CheckmarkIcon,
  CalendarIcon,
} from './GrommetIcons';

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    category: 'claim',
    title: 'Claim Update: Santam Motor CLM-2025-001',
    message: 'Assessor inspection report approved. Settlement authorization of R 45,000 in progress.',
    timestamp: '10 mins ago',
    read: false,
    actionScreen: 'claims',
    badgeText: 'CLAIM IN PROGRESS',
    urgent: true,
  },
  {
    id: 'notif-2',
    category: 'document',
    title: 'Compliance Alert: Driving Licence Expiry',
    message: 'Your RSA Driving Licence Card expires in 18 days on 23 Sept 2026. Please renew to keep motor cover valid.',
    timestamp: '2 hours ago',
    read: false,
    badgeText: 'EXPIRING IN 18d',
    urgent: true,
  },
  {
    id: 'notif-3',
    category: 'policy',
    title: 'Sanlam Balanced RA Portfolio Growth',
    message: 'Quarterly valuation update: +4.2% YTD growth recorded. Fund value now R 1,420,000.',
    timestamp: 'Yesterday',
    read: false,
    actionScreen: 'portfolio',
    badgeText: '+4.2% YTD',
  },
  {
    id: 'notif-4',
    category: 'advisory',
    title: 'Adviser Notice from Qiniso T. Ntuli',
    message: 'Your 2025 SARS IT3b Tax Certificate is ready for download in your documents vault.',
    timestamp: '2 days ago',
    read: true,
    actionScreen: 'profile',
    badgeText: 'TAX CERTIFICATE',
  },
];

interface NotificationCenterModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onSelectNotification: (notif: AppNotification) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  visible,
  onClose,
  notifications,
  onMarkAllRead,
  onSelectNotification,
}) => {
  const { colors, isDark } = useTheme();
  const [filterCategory, setFilterCategory] = useState<'all' | 'claim' | 'document' | 'policy'>('all');

  const filtered = filterCategory === 'all'
    ? notifications
    : notifications.filter(n => n.category === filterCategory);

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'claim':
        return <CarIcon color={colors.primary} size={18} />;
      case 'policy':
        return <ShieldIcon color={colors.gold} size={18} />;
      case 'document':
        return <AlertIcon color={colors.primary} size={18} />;
      default:
        return <DocumentTextIcon color={colors.primary} size={18} />;
    }
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
        <View style={[styles.topHeader, { backgroundColor: colors.backgroundElevated, borderBottomColor: colors.divider }]}>
          <View style={styles.headerBrandRow}>
            <RoyalSquareLogo size={28} />
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.brandTitle, { color: colors.text }]}>NOTIFICATIONS & UPDATES</Text>
              <Text style={[styles.brandSub, { color: colors.gold }]}>
                {unreadCount > 0 ? `${unreadCount} unread policy & claim updates` : 'All updates up to date'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={onClose}
          >
            <Text style={[styles.closeBtnText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills & Controls Row */}
        <View style={[styles.filterRow, { backgroundColor: colors.backgroundElevated, borderBottomColor: colors.divider }]}>
          <View style={{ flexDirection: 'row', gap: 6, flex: 1 }}>
            {(['all', 'claim', 'document', 'policy'] as const).map((cat) => {
              const isSelected = filterCategory === cat;
              const label = cat === 'all' ? 'All' : cat === 'claim' ? 'Claims' : cat === 'document' ? 'Documents' : 'Policies';
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.cardBorder,
                    },
                  ]}
                  onPress={() => setFilterCategory(cat)}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      { color: isSelected ? '#ffffff' : colors.textSecondary, fontWeight: isSelected ? '800' : '600' },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity onPress={onMarkAllRead} style={styles.markReadBtn}>
              <Text style={[styles.markReadText, { color: colors.gold }]}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <CheckmarkIcon color={colors.success} size={32} strokeWidth={3} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Updates in this Category</Text>
              <Text style={[styles.emptySub, { color: colors.textMuted }]}>
                You will receive real-time push notifications when updates occur.
              </Text>
            </View>
          ) : (
            <View style={styles.notifList}>
              {filtered.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.notifCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: !item.read ? colors.primaryBorder : colors.cardBorder,
                      borderLeftColor: !item.read ? colors.primary : colors.cardBorder,
                    },
                  ]}
                  onPress={() => onSelectNotification(item)}
                  activeOpacity={0.85}
                >
                  <View style={styles.notifHeaderRow}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.primaryAlpha }]}>
                      {renderCategoryIcon(item.category)}
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={styles.titleBadgeRow}>
                        <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                      </View>
                      <Text style={[styles.notifTime, { color: colors.textMuted }]}>{item.timestamp}</Text>
                    </View>
                  </View>

                  <Text style={[styles.notifMessage, { color: colors.textSecondary }]}>
                    {item.message}
                  </Text>

                  <View style={[styles.notifFooter, { borderTopColor: colors.divider }]}>
                    {item.badgeText && (
                      <View style={[styles.statusBadge, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}>
                        <Text style={[styles.statusBadgeText, { color: colors.primary }]}>{item.badgeText}</Text>
                      </View>
                    )}
                    <Text style={[styles.openLinkText, { color: colors.primary }]}>View Details →</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.statutoryFooter, { color: colors.textMuted }]}>
            Push notifications notify policyholders instantaneously on claim assessments, FICA renewals, and statutory compliance under FAIS FSP 49291.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  brandSub: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  markReadBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  markReadText: {
    fontSize: 11,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
  },
  filterPillText: {
    fontSize: 11,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  notifList: {
    gap: 12,
  },
  notifCard: {
    borderRadius: 18,
    padding: 16,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  notifTime: {
    fontSize: 10,
    marginTop: 1,
  },
  notifMessage: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  notifFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  openLinkText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statutoryFooter: {
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    paddingHorizontal: 12,
    marginTop: 20,
  },
});
