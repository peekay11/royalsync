import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Policy, UserProfile } from '../types';
import { ApiService } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import {
  SearchIcon,
  ShieldIcon,
  DocumentTextIcon,
  CarIcon,
  CheckmarkIcon,
} from '../components/GrommetIcons';
import { CompanyLogo } from '../components/CompanyLogo';

const CATEGORIES = ['All', 'Investments', 'Medical', 'Short-Term', 'Life & Risk'];

export const PortfolioScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPolicies = async () => {
    try {
      const [pols, userProf] = await Promise.all([
        ApiService.getPolicies(selectedCategory),
        ApiService.getUserProfile(),
      ]);
      setPolicies(pols);
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

  const filteredPolicies = policies.filter(p => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      p.provider.toLowerCase().includes(query) ||
      p.policyNumber.toLowerCase().includes(query)
    );
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Screen Title */}
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.screenTitle, { color: colors.text }]}>My Policies</Text>
          <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
            {profile?.totalMonthlyPremium || 'R 6,450'}/month across {policies.length} covers
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.newPolicyBtn,
            {
              backgroundColor: colors.primaryAlpha,
              borderColor: colors.primaryBorder,
            },
          ]}
        >
          <Text style={[styles.newPolicyBtnText, { color: colors.primary }]}>+ Add Cover</Text>
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
                  backgroundColor: isActive ? colors.hoverBackground : colors.card,
                  borderColor: isActive ? colors.hoverBorder : colors.cardBorder,
                },
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.catChipText,
                  {
                    color: isActive ? colors.primary : colors.textSecondary,
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
            backgroundColor: colors.inputBackground,
            borderColor: search ? colors.hoverBorder : colors.inputBorder,
          },
        ]}
      >
        <View style={styles.searchIconBox}>
          <SearchIcon color={colors.textMuted} size={16} />
        </View>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search policy number, underwriter or plan…"
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
                    backgroundColor: isExpanded ? colors.hoverBackground : colors.card,
                    borderColor: isExpanded ? colors.hoverBorder : colors.cardBorder,
                  },
                ]}
                onPress={() => setExpandedId(isExpanded ? null : p.id)}
                activeOpacity={0.85}
              >
                {/* Company Logo from Logo.dev */}
                <CompanyLogo name={p.provider} size={42} />

                {/* Policy Main Details */}
                <View style={styles.policyInfo}>
                  <Text style={[styles.policyTitle, { color: colors.text }]}>{p.title}</Text>
                  <Text style={[styles.policyMeta, { color: colors.textSecondary }]}>
                    {p.provider} · <Text style={{ color: colors.primary }}>{p.policyNumber}</Text>
                  </Text>
                  <Text style={[styles.categoryTag, { color: colors.textMuted }]}>{p.category}</Text>
                </View>

                {/* Premium / Value */}
                <View style={styles.valContainer}>
                  <Text style={[styles.mainVal, { color: colors.gold }]}>
                    {p.fundValue || p.coverAmount || p.monthlyPremium}
                  </Text>
                  <Text style={[styles.premiumSub, { color: colors.textMuted }]}>
                    {p.monthlyPremium}/mo
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Accordion detail pane */}
              {isExpanded && (
                <View
                  style={[
                    styles.expandedPane,
                    {
                      backgroundColor: isDark ? '#161616' : '#f9fafb',
                      borderColor: colors.cardBorder,
                    },
                  ]}
                >
                  {p.coverDetails ? (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailHeading, { color: colors.textMuted }]}>COVER SUMMARY</Text>
                      <Text style={[styles.detailBody, { color: colors.text }]}>{p.coverDetails}</Text>
                    </View>
                  ) : null}

                  {p.beneficiaries ? (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailHeading, { color: colors.textMuted }]}>BENEFICIARIES</Text>
                      <Text style={[styles.detailBody, { color: colors.text }]}>{p.beneficiaries}</Text>
                    </View>
                  ) : null}

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailHeading, { color: colors.textMuted }]}>INCEPTION DATE</Text>
                    <Text style={[styles.detailBody, { color: colors.text }]}>{p.inceptionDate}</Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.expandedActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.cardBorder,
                        },
                      ]}
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
                          backgroundColor: colors.primaryAlpha,
                          borderColor: colors.primaryBorder,
                        },
                      ]}
                    >
                      <Text style={[styles.actionBtnText, { color: colors.primary }]}>
                        Manage / Top Up
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  newPolicyBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  newPolicyBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoriesRow: {
    gap: 8,
    paddingBottom: 14,
  },
  catChip: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  catChipTextActive: {
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 18,
  },
  searchIconBox: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  policyList: {
    gap: 10,
  },
  policyCardContainer: {
    marginBottom: 4,
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyInfo: {
    flex: 1,
  },
  policyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  policyMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  categoryTag: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: '600',
  },
  valContainer: {
    alignItems: 'flex-end',
  },
  mainVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  premiumSub: {
    fontSize: 11,
    marginTop: 2,
  },
  expandedPane: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 16,
    marginTop: -4,
  },
  detailRow: {
    marginBottom: 10,
  },
  detailHeading: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  detailBody: {
    fontSize: 12,
    lineHeight: 17,
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
    borderRadius: 12,
    paddingVertical: 9,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
