import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { TimerIcon, CheckmarkIcon, AlertIcon } from './GrommetIcons';

interface ClaimSlaTimerProps {
  submissionDate?: string | Date;
  isSettled?: boolean;
  compact?: boolean;
}

export const ClaimSlaTimer: React.FC<ClaimSlaTimerProps> = ({
  submissionDate,
  isSettled = false,
  compact = false,
}) => {
  const { colors, isDark } = useTheme();

  const [remainingMs, setRemainingMs] = useState<number>(0);
  const total48HoursMs = 48 * 60 * 60 * 1000;

  useEffect(() => {
    if (isSettled) return;

    const baseTime = submissionDate ? new Date(submissionDate).getTime() : Date.now() - 3600000 * 4; // default 4h ago
    const deadline = baseTime + total48HoursMs;

    const updateTimer = () => {
      const now = Date.now();
      const diff = deadline - now;
      setRemainingMs(Math.max(0, diff));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [submissionDate, isSettled]);

  if (isSettled) {
    return (
      <View
        style={[
          styles.settledBadge,
          {
            backgroundColor: isDark ? '#14301d' : '#dcfce7',
            borderColor: isDark ? '#1e4620' : '#86efac',
          },
        ]}
      >
        <CheckmarkIcon color="#16a34a" size={compact ? 13 : 15} />
        <Text style={[styles.settledText, { fontSize: compact ? 11 : 12 }]}>
          48-Hour SLA Guarantee Fulfilled (Claim Settled)
        </Text>
      </View>
    );
  }

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  const percentLeft = Math.min(100, Math.max(5, Math.round((remainingMs / total48HoursMs) * 100)));

  const isUrgent = hours < 12;
  const isWarning = hours >= 12 && hours < 24;

  const accentColor = isUrgent ? '#ef4444' : isWarning ? '#f59e0b' : '#3b82f6';
  const badgeBg = isUrgent
    ? (isDark ? '#2b1212' : '#fee2e2')
    : isWarning
    ? (isDark ? '#2b2112' : '#fef3c7')
    : (isDark ? '#101c2e' : '#eff6ff');

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: badgeBg, borderColor: accentColor }]}>
        <TimerIcon color={accentColor} size={13} />
        <Text style={[styles.compactLabel, { color: accentColor }]}>
          48h SLA: <Text style={styles.compactTime}>{pad(hours)}h {pad(minutes)}m {pad(seconds)}s</Text>
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.fullContainer,
        {
          backgroundColor: isDark ? '#191919' : '#ffffff',
          borderColor: isDark ? '#333' : '#e5e7eb',
        },
      ]}
    >
      {/* Top Banner Row */}
      <View style={styles.topRow}>
        <View style={styles.slaBadgeRow}>
          <View style={[styles.timerIconBox, { backgroundColor: badgeBg }]}>
            <TimerIcon color={accentColor} size={15} />
          </View>
          <View>
            <Text style={[styles.slaHeading, { color: colors.text }]}>
              48-Hour Fast-Track Underwriter SLA
            </Text>
            <Text style={[styles.slaSub, { color: colors.textMuted }]}>
              Assessor dispatch & repair authorization window
            </Text>
          </View>
        </View>

        <View style={[styles.statusPill, { backgroundColor: badgeBg }]}>
          <Text style={[styles.statusPillText, { color: accentColor }]}>
            {isUrgent ? 'URGENT' : isWarning ? 'PRIORITY' : 'ACTIVE'}
          </Text>
        </View>
      </View>

      {/* Digital Countdown Timer Display */}
      <View style={styles.countdownRow}>
        <View style={[styles.digitBox, { backgroundColor: isDark ? '#242424' : '#f1f5f9' }]}>
          <Text style={[styles.digitNum, { color: colors.text }]}>{pad(hours)}</Text>
          <Text style={styles.digitUnit}>HOURS</Text>
        </View>
        <Text style={[styles.colonSep, { color: accentColor }]}>:</Text>
        <View style={[styles.digitBox, { backgroundColor: isDark ? '#242424' : '#f1f5f9' }]}>
          <Text style={[styles.digitNum, { color: colors.text }]}>{pad(minutes)}</Text>
          <Text style={styles.digitUnit}>MINS</Text>
        </View>
        <Text style={[styles.colonSep, { color: accentColor }]}>:</Text>
        <View style={[styles.digitBox, { backgroundColor: isDark ? '#242424' : '#f1f5f9' }]}>
          <Text style={[styles.digitNum, { color: colors.text }]}>{pad(seconds)}</Text>
          <Text style={styles.digitUnit}>SECS</Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrackWrapper}>
        <View style={[styles.progressTrack, { backgroundColor: isDark ? '#262626' : '#f1f5f9' }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentLeft}%`,
                backgroundColor: accentColor,
              },
            ]}
          />
        </View>
        <View style={styles.progressInfoRow}>
          <Text style={[styles.progressInfoText, { color: colors.textMuted }]}>
            {percentLeft}% of 48-Hour Response Window Remaining
          </Text>
          <Text style={[styles.progressGuarantee, { color: accentColor }]}>
            Guaranteed Response
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  settledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
  },
  settledText: {
    color: '#16a34a',
    fontWeight: '700',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  compactLabel: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  compactTime: {
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  fullContainer: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginVertical: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  slaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  timerIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slaHeading: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  slaSub: {
    fontSize: 10,
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 4,
  },
  digitBox: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 54,
  },
  digitNum: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  digitUnit: {
    fontSize: 8,
    fontWeight: '700',
    color: '#9ca3af',
    marginTop: 1,
  },
  colonSep: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  progressTrackWrapper: {
    marginTop: 8,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressInfoText: {
    fontSize: 9.5,
  },
  progressGuarantee: {
    fontSize: 9.5,
    fontWeight: '700',
  },
});
