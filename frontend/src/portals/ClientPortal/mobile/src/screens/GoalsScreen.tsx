import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Goal } from '../types';
import { ApiService } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export const GoalsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [summary, setSummary] = useState({
    totalCurrent: 0,
    totalTarget: 0,
    overallPercentage: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchGoals = async () => {
    try {
      const data = await ApiService.getGoals();
      setGoals(data.goals);
      setSummary(data.summary);
    } catch (e) {
      console.log('Failed to fetch goals', e);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGoals();
    setRefreshing(false);
  };

  const formatCurrency = (n: number) => {
    if (n >= 1_000_000) return `R ${(n / 1_000_000).toFixed(2)}M`;
    return `R ${(n / 1_000).toFixed(0)}K`;
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
      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>Goal Tracker</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Across all wealth portfolios</Text>

      {/* Aggregated Progress Banner */}
      <View
        style={[
          styles.overallCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        {/* Progress Ring / Percentage Box */}
        <View
          style={[
            styles.ringBox,
            {
              borderColor: colors.primary,
              backgroundColor: isDark ? '#1a0505' : 'rgba(192, 24, 26, 0.08)',
            },
          ]}
        >
          <Text style={[styles.percentageText, { color: colors.text }]}>{summary.overallPercentage}%</Text>
          <Text style={[styles.achievedLabel, { color: colors.textMuted }]}>Achieved</Text>
        </View>

        <View style={styles.summaryInfo}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Combined Progress</Text>
          <Text style={[styles.summaryCurrent, { color: colors.gold }]}>{formatCurrency(summary.totalCurrent)}</Text>
          <Text style={[styles.summaryTarget, { color: colors.textMuted }]}>of {formatCurrency(summary.totalTarget)} target</Text>
        </View>
      </View>

      {/* Goal Items List */}
      <View style={styles.goalList}>
        {goals.map(g => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          return (
            <View
              key={g.id}
              style={[
                styles.goalCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View style={styles.goalHeaderRow}>
                <View>
                  <Text style={[styles.goalLabel, { color: colors.text }]}>{g.label}</Text>
                  <Text style={[styles.goalDeadline, { color: colors.textMuted }]}>Target {g.deadline}</Text>
                </View>

                <View
                  style={[
                    styles.pctBadge,
                    {
                      borderColor: g.color,
                      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.04)',
                    },
                  ]}
                >
                  <Text style={[styles.pctBadgeText, { color: g.color }]}>{pct}%</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={[styles.progressTrack, { backgroundColor: isDark ? '#222222' : '#e5e8ec' }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${pct}%`, backgroundColor: g.color },
                  ]}
                />
              </View>

              {/* Values */}
              <View style={styles.valuesRow}>
                <Text style={[styles.currentVal, { color: colors.gold }]}>{formatCurrency(g.current)}</Text>
                <Text style={[styles.targetVal, { color: colors.textSubtle }]}>{formatCurrency(g.target)}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Add a Goal Button */}
      <TouchableOpacity
        style={[
          styles.addGoalBtn,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <Text style={[styles.addGoalText, { color: colors.textMuted }]}>+ Add a Wealth Goal</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 20,
  },
  overallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 20,
    gap: 20,
    marginBottom: 20,
  },
  ringBox: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '800',
  },
  achievedLabel: {
    fontSize: 9,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
  },
  summaryCurrent: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  summaryTarget: {
    fontSize: 11,
    marginTop: 2,
  },
  goalList: {
    gap: 12,
  },
  goalCard: {
    borderRadius: 20,
    padding: 16,
  },
  goalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  goalDeadline: {
    fontSize: 11,
    marginTop: 2,
  },
  pctBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pctBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  valuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  targetVal: {
    fontSize: 12,
  },
  addGoalBtn: {
    marginTop: 18,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addGoalText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
