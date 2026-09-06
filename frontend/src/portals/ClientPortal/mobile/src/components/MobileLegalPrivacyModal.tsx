import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ShieldIcon, LockIcon, AlertIcon } from './GrommetIcons';
import { ApiService } from '../services/api';

interface MobileLegalPrivacyModalProps {
  visible: boolean;
  onClose: () => void;
  currentFramework?: 'POPIA' | 'GDPR' | 'HYBRID_EU';
  onUpdated?: (framework: 'POPIA' | 'GDPR' | 'HYBRID_EU') => void;
}

const EU_COUNTRIES = [
  'Germany',
  'France',
  'Netherlands',
  'Ireland',
  'Spain',
  'Italy',
  'Portugal',
  'Belgium',
  'Sweden',
  'Austria',
  'Denmark',
  'Other EU / EEA Member State'
];

export const MobileLegalPrivacyModal: React.FC<MobileLegalPrivacyModalProps> = ({
  visible,
  onClose,
  currentFramework = 'POPIA',
  onUpdated,
}) => {
  const { colors, isDark } = useTheme();
  const [selectedFramework, setSelectedFramework] = useState<'POPIA' | 'GDPR' | 'HYBRID_EU'>(currentFramework);
  const [selectedCountry, setSelectedCountry] = useState('Germany');
  const [crossBorderOptIn, setCrossBorderOptIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const handleApply = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      await ApiService.updatePrivacyFramework({
        framework: selectedFramework,
        crossBorderTransferOptIn: crossBorderOptIn,
        euCountry: selectedFramework !== 'POPIA' ? selectedCountry : undefined,
      });
      setLoading(false);
      setStatusMsg({ text: `Updated to ${selectedFramework === 'GDPR' ? 'EU GDPR (EU 2016/679)' : (selectedFramework === 'HYBRID_EU' ? 'Dual POPIA & EU Accord' : 'POPIA (Act 4 of 2013)')}!` });
      if (onUpdated) onUpdated(selectedFramework);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setLoading(false);
      setStatusMsg({ text: err.message || 'Failed to update policy', error: true });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.backgroundElevated || (isDark ? '#1e1a20' : '#ffffff'), borderColor: colors.divider }]}>
          {/* Top Bar */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primaryAlpha }]}>
                <ShieldIcon color={colors.primary} size={20} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Legal Privacy Policy</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>POPIA (ZA) ⟷ EU GDPR (Europe)</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.card }]}>
              <Text style={{ color: colors.textMuted, fontSize: 16, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
              Choose the legal data protection framework for your profile to accompany EU countries and international compliance requirements:
            </Text>

            {/* Framework 1: POPIA */}
            <TouchableOpacity
              style={[
                styles.frameworkCard,
                {
                  backgroundColor: selectedFramework === 'POPIA' ? (isDark ? '#2e1518' : '#fef2f2') : (isDark ? '#221e24' : '#f8fafc'),
                  borderColor: selectedFramework === 'POPIA' ? colors.primary : colors.divider,
                },
              ]}
              onPress={() => setSelectedFramework('POPIA')}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <View style={[styles.badgeBox, { backgroundColor: isDark ? '#37303c' : '#e2e8f0' }]}>
                  <Text style={[styles.badgeText, { color: isDark ? '#ffffff' : '#334155' }]}>ZA</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>POPIA (South Africa)</Text>
                  <Text style={[styles.cardSub, { color: colors.textMuted }]}>Protection of Personal Information Act (Act 4 of 2013)</Text>
                </View>
                {selectedFramework === 'POPIA' ? (
                  <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>✓</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
                Standard domestic policy covering South African FAIS financial advice and FICA identification rules.
              </Text>
            </TouchableOpacity>

            {/* Framework 2: EU GDPR */}
            <TouchableOpacity
              style={[
                styles.frameworkCard,
                {
                  backgroundColor: selectedFramework === 'GDPR' ? (isDark ? '#152238' : '#eff6ff') : (isDark ? '#221e24' : '#f8fafc'),
                  borderColor: selectedFramework === 'GDPR' ? '#2563eb' : colors.divider,
                },
              ]}
              onPress={() => setSelectedFramework('GDPR')}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <View style={[styles.badgeBox, { backgroundColor: isDark ? '#1e3a8a' : '#dbeafe' }]}>
                  <Text style={[styles.badgeText, { color: isDark ? '#93c5fd' : '#1e40af' }]}>EU</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>EU GDPR (Europe)</Text>
                    <View style={styles.euBadge}>
                      <Text style={styles.euBadgeText}>EU Expats & Residents</Text>
                    </View>
                  </View>
                  <Text style={[styles.cardSub, { color: colors.textMuted }]}>Regulation (EU) 2016/679</Text>
                </View>
                {selectedFramework === 'GDPR' ? (
                  <View style={[styles.checkCircle, { backgroundColor: '#2563eb' }]}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>✓</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
                Full European Union data rights: Right to Erasure ("Right to be Forgotten"), Data Portability, 72h breach alerts, and EU Representative.
              </Text>
            </TouchableOpacity>

            {/* Framework 3: Dual Accord */}
            <TouchableOpacity
              style={[
                styles.frameworkCard,
                {
                  backgroundColor: selectedFramework === 'HYBRID_EU' ? (isDark ? '#23152e' : '#faf5ff') : (isDark ? '#221e24' : '#f8fafc'),
                  borderColor: selectedFramework === 'HYBRID_EU' ? '#9333ea' : colors.divider,
                },
              ]}
              onPress={() => setSelectedFramework('HYBRID_EU')}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <View style={[styles.badgeBox, { backgroundColor: isDark ? '#4c1d95' : '#f3e8ff' }]}>
                  <Text style={[styles.badgeText, { color: isDark ? '#d8b4fe' : '#7e22ce' }]}>GL</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Dual Accord (POPIA + EU GDPR)</Text>
                  <Text style={[styles.cardSub, { color: colors.textMuted }]}>Transborder Dual Protection Accord</Text>
                </View>
                {selectedFramework === 'HYBRID_EU' ? (
                  <View style={[styles.checkCircle, { backgroundColor: '#9333ea' }]}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>✓</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
                Harmonized dual compliance pack for international policyholders with European citizenship and South African insurance.
              </Text>
            </TouchableOpacity>

            {/* EU Country Selector if EU selected */}
            {selectedFramework !== 'POPIA' ? (
              <View style={[styles.euDetailsBox, { backgroundColor: isDark ? '#141214' : '#f1f5f9', borderColor: colors.divider }]}>
                <Text style={[styles.euBoxTitle, { color: colors.text }]}>Accompanying European Country:</Text>
                <View style={styles.countriesRow}>
                  {EU_COUNTRIES.slice(0, 6).map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.countryChip,
                        {
                          backgroundColor: selectedCountry === c ? colors.primary : (isDark ? '#221e24' : '#ffffff'),
                          borderColor: selectedCountry === c ? colors.primary : colors.divider,
                        },
                      ]}
                      onPress={() => setSelectedCountry(c)}
                    >
                      <Text style={[styles.countryChipText, { color: selectedCountry === c ? '#ffffff' : colors.text }]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.sccBox}>
                  <Text style={[styles.sccText, { color: colors.textSecondary }]}>
                    Standard Contractual Clauses (SCC Article 46) active for encrypted cross-border insurance telemetry.
                  </Text>
                  <Text style={[styles.dpoText, { color: colors.textMuted }]}>
                    EU DPO Point of Contact: dpo-eu@royalsync.co.za
                  </Text>
                </View>
              </View>
            ) : null}

            {statusMsg ? (
              <View style={[styles.statusBanner, { backgroundColor: statusMsg.error ? '#fee2e2' : '#dcfce7' }]}>
                <Text style={{ color: statusMsg.error ? '#dc2626' : '#15803d', fontSize: 12, fontWeight: '700' }}>
                  {statusMsg.text}
                </Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.footerActions, { borderTopColor: colors.divider }]}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.divider }]} onPress={onClose}>
              <Text style={[styles.cancelText, { color: colors.textMuted }]}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleApply}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>
                  Apply {selectedFramework === 'GDPR' ? 'EU GDPR' : (selectedFramework === 'HYBRID_EU' ? 'Dual Accord' : 'POPIA')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    maxHeight: '88%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.15)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sectionDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  frameworkCard: {
    borderRadius: 18,
    borderWidth: 2,
    padding: 14,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  badgeBox: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardSub: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardBody: {
    fontSize: 11,
    lineHeight: 16,
    paddingLeft: 32,
  },
  euBadge: {
    backgroundColor: '#dbeafe',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  euBadgeText: {
    color: '#1e40af',
    fontSize: 9,
    fontWeight: '800',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  euDetailsBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  euBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  countriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  countryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  countryChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sccBox: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.15)',
    paddingTop: 8,
    marginTop: 4,
  },
  sccText: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
  dpoText: {
    fontSize: 10,
    marginTop: 4,
  },
  statusBanner: {
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
