import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Policy, UserProfile } from '../types';
import { ApiService } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import {
  SearchIcon,
  ShieldIcon,
  DocumentTextIcon,
  CheckmarkIcon,
} from '../components/GrommetIcons';
import { CompanyLogo } from '../components/CompanyLogo';

const CATEGORIES = ['All', 'Investments', 'Medical', 'Short-Term', 'Life & Risk'];

const COVER_OPTIONS = [
  {
    type: 'Comprehensive Motor Vehicle',
    tag: 'MOTOR',
    insurer: 'Santam',
    defaultSum: '350000',
    estPremium: '1450',
    desc: 'Accidental, theft, third-party and 24/7 roadside assist.',
  },
  {
    type: 'Life Cover & Dread Disease',
    tag: 'LIFE',
    insurer: 'Discovery Life',
    defaultSum: '3000000',
    estPremium: '1850',
    desc: 'Lump-sum payout for dependents with dread disease rider.',
  },
  {
    type: 'Building & Home Contents',
    tag: 'PROPERTY',
    insurer: 'Hollard',
    defaultSum: '1500000',
    estPremium: '980',
    desc: 'Fire, burst geyser, storm damage and burglary protection.',
  },
  {
    type: 'Medical Aid & Gap Cover',
    tag: 'MEDICAL',
    insurer: 'Discovery Health',
    defaultSum: '1000000',
    estPremium: '2400',
    desc: 'In-hospital tariff shortfall and specialist co-payment cover.',
  },
  {
    type: 'Family Funeral Plan',
    tag: 'FUNERAL',
    insurer: 'Old Mutual',
    defaultSum: '80000',
    estPremium: '380',
    desc: 'Guaranteed 24-48h burial payout with repatriation benefits.',
  },
  {
    type: 'Retirement Annuity & Wealth Builder',
    tag: 'INVEST',
    insurer: 'Sanlam',
    defaultSum: '500000',
    estPremium: '2000',
    desc: 'Tax-deductible monthly wealth accumulation portfolio.',
  },
];

const INSURERS = [
  'Let Adviser Compare Quotes',
  'Santam',
  'Discovery Life',
  'Old Mutual',
  'Sanlam',
  'Momentum',
  'Hollard',
  'FNB Insurance',
];

export const PortfolioScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Add Policy / Request Modal
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedCover, setSelectedCover] = useState(COVER_OPTIONS[0]);
  const [selectedInsurer, setSelectedInsurer] = useState('Let Adviser Compare Quotes');
  const [coverAmount, setCoverAmount] = useState(COVER_OPTIONS[0].defaultSum);
  const [budgetPremium, setBudgetPremium] = useState(COVER_OPTIONS[0].estPremium);
  const [requestNotes, setRequestNotes] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const fetchPolicies = async () => {
    try {
      const [pols, userProf] = await Promise.all([
        ApiService.getPolicies(selectedCategory),
        ApiService.getUserProfile().catch(() => null),
      ]);
      setPolicies(pols || []);
      setProfile(userProf);
    } catch (e) {
      console.log('Failed to fetch policies', e);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPolicies();
    setRefreshing(false);
  };

  const handleSelectCoverOption = (opt: typeof COVER_OPTIONS[0]) => {
    setSelectedCover(opt);
    setCoverAmount(opt.defaultSum);
    setBudgetPremium(opt.estPremium);
  };

  const handleSubmitPolicyRequest = async () => {
    setSubmittingRequest(true);
    try {
      await ApiService.requestPolicyCover({
        productType: selectedCover.type,
        insurerName: selectedInsurer,
        premium: budgetPremium,
        sumAssured: coverAmount,
        notes: requestNotes,
      });

      Alert.alert(
        'Quote Request Received',
        `Your request for ${selectedCover.type} has been submitted. A Royal Square adviser will compile the best market comparison quotes for you.`
      );
      setAddModalVisible(false);
      setRequestNotes('');
      fetchPolicies();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to submit policy request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const filteredPolicies = policies.filter(p => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(query) ||
      p.provider?.toLowerCase().includes(query) ||
      p.policyNumber?.toLowerCase().includes(query)
    );
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d92820" />
      }
    >
      {/* Screen Title & Top Row */}
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.screenTitle, { color: colors.text }]}>My Insurance Policies</Text>
          <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
            {policies.length} Active covers underwritten with accredited partners
          </Text>
        </View>

        <TouchableOpacity
          style={styles.newPolicyBtn}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.newPolicyBtnText}>+ Add Cover</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
      >
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catChip,
                {
                  backgroundColor: isActive ? '#d92820' : colors.card,
                  borderColor: isActive ? '#d92820' : (isDark ? '#262626' : '#f0f0f0'),
                },
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.catChipText,
                  {
                    color: isActive ? '#ffffff' : colors.textSecondary,
                    fontWeight: isActive ? '800' : '600',
                  },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Search Input Bar */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.card,
            borderColor: isDark ? '#262626' : '#e5e7eb',
          },
        ]}
      >
        <View style={styles.searchIconBox}>
          <SearchIcon color={colors.textMuted} size={16} />
        </View>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search policy number, underwriter, or type…"
          placeholderTextColor={colors.textSubtle}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Policies List */}
      <View style={styles.policyList}>
        {filteredPolicies.map(p => {
          const isExpanded = expandedId === p.id;
          return (
            <View key={p.id} style={styles.policyCardContainer}>
              <TouchableOpacity
                style={[
                  styles.policyCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isExpanded ? '#d92820' : (isDark ? '#262626' : '#f0f0f0'),
                  },
                ]}
                onPress={() => setExpandedId(isExpanded ? null : p.id)}
                activeOpacity={0.85}
              >
                {/* Underwriter Logo */}
                <CompanyLogo name={p.provider} size={40} />

                {/* Policy Main Details */}
                <View style={styles.policyInfo}>
                  <Text style={[styles.policyTitle, { color: colors.text }]}>{p.title}</Text>
                  <Text style={[styles.policyMeta, { color: colors.textSecondary }]}>
                    {p.provider} · <Text style={{ color: '#d92820', fontWeight: '700' }}>{p.policyNumber}</Text>
                  </Text>
                  <Text style={[styles.categoryTag, { color: colors.textMuted }]}>{p.category}</Text>
                </View>

                {/* Premium / Value */}
                <View style={styles.valContainer}>
                  <Text style={styles.mainVal}>
                    {p.coverAmount || p.fundValue || (p.monthlyPremium ? `R ${p.monthlyPremium}` : 'Active')}
                  </Text>
                  <Text style={[styles.premiumSub, { color: colors.textMuted }]}>
                    {p.monthlyPremium ? `${p.monthlyPremium}/mo` : 'Recurring'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Accordion detail pane */}
              {isExpanded && (
                <View
                  style={[
                    styles.expandedPane,
                    {
                      backgroundColor: isDark ? '#141414' : '#f9fafb',
                      borderColor: isDark ? '#262626' : '#f0f0f0',
                    },
                  ]}
                >
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailHeading, { color: colors.textMuted }]}>COVER SUMMARY</Text>
                    <Text style={[styles.detailBody, { color: colors.text }]}>
                      {p.coverDetails || `Active ${p.title} schedule underwritten by ${p.provider}. Includes 24/7 emergency broker assistance.`}
                    </Text>
                  </View>

                  {p.inceptionDate ? (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailHeading, { color: colors.textMuted }]}>INCEPTION DATE</Text>
                      <Text style={[styles.detailBody, { color: colors.text }]}>{p.inceptionDate}</Text>
                    </View>
                  ) : null}

                  {/* Actions */}
                  <View style={styles.expandedActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: colors.card,
                          borderColor: isDark ? '#333' : '#e5e7eb',
                        },
                      ]}
                      onPress={() => Alert.alert('Policy Schedule', `Policy Schedule for ${p.policyNumber} is active and verified in the Document Vault.`)}
                    >
                      <DocumentTextIcon color={colors.textSecondary} size={14} />
                      <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>
                        Policy Schedule
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: '#fee2e2',
                          borderColor: '#fca5a5',
                        },
                      ]}
                      onPress={() => setAddModalVisible(true)}
                    >
                      <Text style={[styles.actionBtnText, { color: '#d92820' }]}>
                        + Add Additional Cover
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {filteredPolicies.length === 0 && (
          <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: isDark ? '#262626' : '#f0f0f0' }]}>
            <ShieldIcon color="#9ca3af" size={36} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Policies in this Filter</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              Request another policy or quote to extend your protection.
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => setAddModalVisible(true)}
            >
              <Text style={styles.emptyAddText}>+ Request New Policy</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ─── REQUEST / ADD POLICY MODAL ──────────────────────────────────── */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: isDark ? '#262626' : '#f0f0f0' }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Request New Insurance Cover</Text>
                <Text style={[styles.modalSub, { color: colors.textMuted }]}>
                  Royal Square advisers will negotiate the best premium quotes.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={[styles.modalCloseText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              {/* Step 1: Select Cover Product */}
              <Text style={[styles.modalSectionLabel, { color: colors.textMuted }]}>1. SELECT INSURANCE COVER</Text>
              <View style={styles.coverGrid}>
                {COVER_OPTIONS.map(opt => {
                  const isSelected = selectedCover.type === opt.type;
                  return (
                    <TouchableOpacity
                      key={opt.type}
                      style={[
                        styles.coverCard,
                        {
                          backgroundColor: isSelected ? (isDark ? '#2a1414' : '#fef2f2') : (isDark ? '#1a1a1a' : '#f9fafb'),
                          borderColor: isSelected ? '#d92820' : (isDark ? '#333' : '#e5e7eb'),
                        },
                      ]}
                      onPress={() => handleSelectCoverOption(opt)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.coverCardTop}>
                        <View style={[styles.coverTagPill, { backgroundColor: isSelected ? '#d92820' : (isDark ? '#333' : '#e5e7eb') }]}>
                          <Text style={[styles.coverTagText, { color: isSelected ? '#ffffff' : colors.textMuted }]}>
                            {opt.tag}
                          </Text>
                        </View>
                        <Text style={styles.coverEstText}>Est. R {opt.estPremium}/mo</Text>
                      </View>
                      <Text style={[styles.coverTitle, { color: colors.text }]} numberOfLines={1}>
                        {opt.type}
                      </Text>
                      <Text style={[styles.coverDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                        {opt.desc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Step 2: Preferred Insurer */}
              <Text style={[styles.modalSectionLabel, { color: colors.textMuted, marginTop: 14 }]}>
                2. PREFERRED UNDERWRITER
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.insurerScroll}>
                {INSURERS.map(ins => {
                  const isSelected = selectedInsurer === ins;
                  return (
                    <TouchableOpacity
                      key={ins}
                      style={[
                        styles.insurerChip,
                        {
                          backgroundColor: isSelected ? '#d92820' : (isDark ? '#1a1a1a' : '#f9fafb'),
                          borderColor: isSelected ? '#d92820' : (isDark ? '#333' : '#e5e7eb'),
                        },
                      ]}
                      onPress={() => setSelectedInsurer(ins)}
                    >
                      <Text style={[styles.insurerChipText, { color: isSelected ? '#ffffff' : colors.text }]}>
                        {ins}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Step 3: Sum Assured & Budget */}
              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>SUM ASSURED (ZAR)</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', color: colors.text, borderColor: isDark ? '#333' : '#e5e7eb' }]}
                    keyboardType="numeric"
                    value={coverAmount}
                    onChangeText={setCoverAmount}
                    placeholder="e.g. 500000"
                    placeholderTextColor={colors.textSubtle}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>EST. BUDGET (ZAR/MO)</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', color: colors.text, borderColor: isDark ? '#333' : '#e5e7eb' }]}
                    keyboardType="numeric"
                    value={budgetPremium}
                    onChangeText={setBudgetPremium}
                    placeholder="e.g. 1200"
                    placeholderTextColor={colors.textSubtle}
                  />
                </View>
              </View>

              {/* Step 4: Asset Details */}
              <View style={{ marginTop: 10 }}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>ASSET DETAILS / SPECIFIC NOTES</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', color: colors.text, borderColor: isDark ? '#333' : '#e5e7eb' }]}
                  multiline
                  numberOfLines={2}
                  value={requestNotes}
                  onChangeText={setRequestNotes}
                  placeholder="e.g. 2024 VW Golf 8 GTI, property address, or beneficiaries..."
                  placeholderTextColor={colors.textSubtle}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSubmitPolicyRequest}
                disabled={submittingRequest}
              >
                {submittingRequest ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit Policy Quote Request ✓</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  newPolicyBtn: {
    backgroundColor: '#d92820',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  newPolicyBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  categoriesRow: {
    gap: 8,
    paddingBottom: 14,
  },
  catChip: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  catChipText: {
    fontSize: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 16,
  },
  searchIconBox: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  policyList: {
    gap: 10,
  },
  policyCardContainer: {
    marginBottom: 2,
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    gap: 10,
  },
  policyInfo: {
    flex: 1,
  },
  policyTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  policyMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  categoryTag: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  valContainer: {
    alignItems: 'flex-end',
  },
  mainVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#d92820',
  },
  premiumSub: {
    fontSize: 10,
    marginTop: 2,
  },
  expandedPane: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    padding: 14,
    marginTop: -4,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailHeading: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  detailBody: {
    fontSize: 11,
    lineHeight: 15,
  },
  expandedActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  emptySub: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  emptyAddBtn: {
    backgroundColor: '#d92820',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
  },
  emptyAddText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 11,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalBody: {
    padding: 18,
    paddingBottom: 32,
  },
  modalSectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  coverGrid: {
    gap: 8,
  },
  coverCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 10,
  },
  coverCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  coverTagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverTagText: {
    fontSize: 8,
    fontWeight: '800',
  },
  coverEstText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d92820',
  },
  coverTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  coverDesc: {
    fontSize: 10,
    lineHeight: 13,
    marginTop: 1,
  },
  insurerScroll: {
    gap: 6,
  },
  insurerChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  insurerChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
  },
  modalTextArea: {
    minHeight: 50,
    textAlignVertical: 'top',
  },
  modalSubmitBtn: {
    backgroundColor: '#d92820',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalSubmitText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
