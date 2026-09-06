import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import {
  CarIcon,
  ShieldIcon,
  CheckmarkIcon,
  DocumentTextIcon,
  PhoneIcon,
  CalendarIcon,
} from './GrommetIcons';
import { CompanyLogo } from './CompanyLogo';

interface ClaimLifecycleModalProps {
  visible: boolean;
  claim: any;
  onClose: () => void;
  onRefresh?: () => void;
}

const LIFECYCLE_STAGES = [
  { step: 1, title: 'Handler', desc: 'Insurer claim # & handler assigned' },
  { step: 2, title: 'Assessment', desc: 'Vehicle assessment scheduled' },
  { step: 3, title: 'Report', desc: 'Report submitted to broker & insurer' },
  { step: 4, title: 'Quotes', desc: 'Repair quotes received' },
  { step: 5, title: 'Authority', desc: 'Insurer authorises repairs' },
  { step: 6, title: 'Drop-off', desc: 'Client picks workshop check-in date' },
  { step: 7, title: 'Car Hire', desc: 'Avis courtesy car arranged' },
  { step: 8, title: 'Workshop', desc: 'Weekly repair progress updates' },
  { step: 9, title: 'Collection', desc: 'Vehicle collection & car hire return' },
  { step: 10, title: 'Closeout', desc: 'Review & transaction closed' },
];

export const ClaimLifecycleModal: React.FC<ClaimLifecycleModalProps> = ({
  visible,
  claim,
  onClose,
  onRefresh,
}) => {
  const { colors, isDark } = useTheme();
  const [submitting, setSubmitting] = useState(false);
  const [activeForm, setActiveForm] = useState<'none' | 'assessment' | 'dropoff' | 'review'>('none');

  // Assessment date state
  const [assessmentDate, setAssessmentDate] = useState('2026-09-08');
  const [assessmentTime, setAssessmentTime] = useState('10:00 AM');

  // Drop-off state
  const [dropOffDate, setDropOffDate] = useState('2026-09-10');
  const [dropOffTime, setDropOffTime] = useState('08:00 AM');

  // Review state
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('Outstanding repair turnaround and seamless Avis courtesy car swap.');

  if (!claim) return null;

  const currentStep = claim.currentStageIndex || 1;
  const isClosed = claim.stage10_claimClosed;

  const handleUpdateStage = async (targetStage: number, extraPayload: any, successTitle: string) => {
    setSubmitting(true);
    try {
      const BASE_URL = 'https://royalsync-api.pasekamabitsela22.workers.dev/api';
      const res = await fetch(`${BASE_URL}/claims/${claim.id}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStageIndex: targetStage,
          ...extraPayload,
        }),
      });
      if (!res.ok) throw new Error('Failed to update claim stage');
      Alert.alert('Success', successTitle);
      setActiveForm('none');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseClaim = async () => {
    setSubmitting(true);
    try {
      const BASE_URL = 'https://royalsync-api.pasekamabitsela22.workers.dev/api';
      const res = await fetch(`${BASE_URL}/claims/${claim.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          reviewComment,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      Alert.alert('Claim Closed', 'Thank you! Your feedback has been recorded and the claim is officially closed.');
      setActiveForm('none');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: isDark ? '#262626' : '#e5e7eb' }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.headerTopRow}>
                <CompanyLogo name={claim.insurer} size={28} />
                <View style={[styles.statusPill, { backgroundColor: isClosed ? colors.successAlpha : colors.primaryAlpha }]}>
                  <Text style={[styles.statusPillText, { color: isClosed ? colors.success : colors.primary }]}>
                    {isClosed ? '✓ SETTLED & CLOSED' : `STAGE ${currentStep} OF 10`}
                  </Text>
                </View>
              </View>
              <Text style={[styles.refTitle, { color: colors.text }]}>{claim.reference}</Text>
              <Text style={[styles.vehicleSub, { color: colors.textSecondary }]}>
                {claim.vehicle || claim.type} · Insurer Claim #{claim.stage1_insurerClaimNumber || 'Pending'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: colors.primary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Stepper Horizontal Scroll */}
          <View style={[styles.stepperScrollContainer, { borderBottomColor: isDark ? '#262626' : '#f0f0f0' }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepperContent}>
              {LIFECYCLE_STAGES.map(s => {
                const isPassed = currentStep > s.step || isClosed;
                const isCurrent = currentStep === s.step && !isClosed;
                return (
                  <View
                    key={s.step}
                    style={[
                      styles.stepCard,
                      {
                        backgroundColor: isCurrent ? colors.hoverBackground : isPassed ? colors.successAlpha : colors.card,
                        borderColor: isCurrent ? colors.primary : isPassed ? colors.success : colors.cardBorder,
                      },
                    ]}
                  >
                    <View style={styles.stepNumRow}>
                      <View
                        style={[
                          styles.stepNumCircle,
                          {
                            backgroundColor: isCurrent ? colors.primary : isPassed ? colors.success : isDark ? '#333' : '#e5e7eb',
                          },
                        ]}
                      >
                        <Text style={styles.stepNumText}>{isPassed ? '✓' : s.step}</Text>
                      </View>
                      <Text style={[styles.stepStatusBadge, { color: isCurrent ? colors.primary : isPassed ? colors.success : colors.textMuted }]}>
                        {isPassed ? 'DONE' : isCurrent ? 'ACTIVE' : 'NEXT'}
                      </Text>
                    </View>
                    <Text style={[styles.stepTitle, { color: colors.text }]}>{s.title}</Text>
                    <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>{s.desc}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* Content Body */}
          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* STAGE 1: HANDLER ASSIGNED */}
            <View style={[styles.stageSection, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', borderColor: colors.cardBorder }]}>
              <View style={styles.stageSectionHeader}>
                <Text style={[styles.stageBadge, { backgroundColor: colors.primaryAlpha, color: colors.primary }]}>Stage 1</Text>
                <Text style={[styles.stageHeading, { color: colors.text }]}>Insurer Claim # & Handler</Text>
                <Text style={[styles.stageCheck, { color: colors.success }]}>✓ Verified</Text>
              </View>
              <Text style={[styles.stageSub, { color: colors.textSecondary }]}>
                Claim registered with {claim.insurer} central desk.
              </Text>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Claim Number:</Text>
                <Text style={[styles.infoVal, { color: colors.primary }]}>{claim.stage1_insurerClaimNumber || 'SAN-CLM-881924'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Claims Handler:</Text>
                <Text style={[styles.infoVal, { color: colors.text }]}>{claim.stage1_claimsHandlerName || 'Lindiwe Khumalo'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Direct Contact:</Text>
                <Text style={[styles.infoVal, { color: colors.gold }]}>{claim.stage1_claimsHandlerPhone || '+27 11 928 4000'}</Text>
              </View>
            </View>

            {/* STAGE 2: ASSESSMENT */}
            <View style={[styles.stageSection, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', borderColor: colors.cardBorder }]}>
              <View style={styles.stageSectionHeader}>
                <Text style={[styles.stageBadge, { backgroundColor: colors.primaryAlpha, color: colors.primary }]}>Stage 2</Text>
                <Text style={[styles.stageHeading, { color: colors.text }]}>Vehicle Assessment</Text>
                <Text style={[styles.stageCheck, { color: colors.success }]}>
                  {claim.stage2_assessmentStatus === 'completed' ? '✓ Completed' : 'Booked'}
                </Text>
              </View>
              <Text style={[styles.stageSub, { color: colors.textSecondary }]}>
                {claim.stage2_assessmentCentre || 'Santam Drive-In Assessment Centre, 14 Sandton Dr'}
              </Text>
              <Text style={[styles.infoVal, { color: colors.text, marginTop: 4 }]}>
                Scheduled: {claim.stage2_assessmentDate || '2026-08-30'} at {claim.stage2_assessmentTime || '10:30 AM'}
              </Text>
              {activeForm !== 'assessment' ? (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.hoverBackground, borderColor: colors.cardBorder }]}
                  onPress={() => setActiveForm('assessment')}
                >
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>Reschedule Assessment Date</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.inlineForm}>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
                    value={assessmentDate}
                    onChangeText={setAssessmentDate}
                    placeholder="YYYY-MM-DD"
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
                    value={assessmentTime}
                    onChangeText={setAssessmentTime}
                    placeholder="HH:MM AM/PM"
                  />
                  <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                    disabled={submitting}
                    onPress={() =>
                      handleUpdateStage(
                        2,
                        {
                          stage2_assessmentDate: assessmentDate,
                          stage2_assessmentTime: assessmentTime,
                          stage2_assessmentStatus: 'booked',
                        },
                        'Assessment booking updated.'
                      )
                    }
                  >
                    <Text style={styles.submitBtnText}>{submitting ? 'Saving...' : 'Confirm Date'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* STAGE 3: ASSESSMENT REPORT */}
            <View style={[styles.stageSection, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', borderColor: colors.cardBorder }]}>
              <View style={styles.stageSectionHeader}>
                <Text style={[styles.stageBadge, { backgroundColor: colors.primaryAlpha, color: colors.primary }]}>Stage 3</Text>
                <Text style={[styles.stageHeading, { color: colors.text }]}>Report to Insurer & Broker</Text>
                <Text style={[styles.stageCheck, { color: colors.success }]}>✓ Received</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Damage Assessed:</Text>
                <Text style={[styles.infoVal, { color: colors.gold }]}>{claim.stage3_damageAssessedAmount || 'R 48,500.00'}</Text>
              </View>
              <Text style={[styles.stageSub, { color: colors.textSecondary, marginTop: 4 }]}>
                Scope: {claim.stage3_damageScope || 'Rear bumper cover replacement, tailgate repair, parking sensor alignment.'}
              </Text>
            </View>

            {/* STAGE 4: REPAIR QUOTES */}
            <View style={[styles.stageSection, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', borderColor: colors.cardBorder }]}>
              <View style={styles.stageSectionHeader}>
                <Text style={[styles.stageBadge, { backgroundColor: colors.primaryAlpha, color: colors.primary }]}>Stage 4</Text>
                <Text style={[styles.stageHeading, { color: colors.text }]}>Repair Quotes</Text>
                <Text style={[styles.stageCheck, { color: colors.success }]}>✓ Approved</Text>
              </View>
              <Text style={[styles.stageSub, { color: colors.textSecondary }]}>
                Selected Repairer: Precision Auto Body Sandton (SAMBRA Major Structural)
              </Text>
            </View>

            {/* STAGE 5: REPAIRS AUTHORISED */}
            <View style={[styles.stageSection, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', borderColor: colors.cardBorder }]}>
              <View style={styles.stageSectionHeader}>
                <Text style={[styles.stageBadge, { backgroundColor: colors.primaryAlpha, color: colors.primary }]}>Stage 5</Text>
                <Text style={[styles.stageHeading, { color: colors.text }]}>Insurer Authorisation</Text>
                <Text style={[styles.stageCheck, { color: colors.success }]}>✓ Authorised</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Authority Number:</Text>
                <Text style={[styles.infoVal, { color: colors.primary }]}>{claim.stage5_repairAuthorisationNumber || 'AUTH-SAN-2026-9021'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Authorised Amount:</Text>
                <Text style={[styles.infoVal, { color: colors.gold }]}>{claim.stage5_authorisedAmount || 'R 48,500.00'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Basic Excess:</Text>
                <Text style={[styles.infoVal, { color: colors.success }]}>R 3,500.00 (Waiver Applied)</Text>
              </View>
            </View>

            {/* STAGE 6: VEHICLE DROP-OFF DATE */}
            <View style={[styles.stageSection, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', borderColor: colors.cardBorder }]}>
              <View style={styles.stageSectionHeader}>
                <Text style={[styles.stageBadge, { backgroundColor: colors.primaryAlpha, color: colors.primary }]}>Stage 6</Text>
                <Text style={[styles.stageHeading, { color: colors.text }]}>Vehicle Drop-Off Date</Text>
                <Text style={[styles.stageCheck, { color: colors.success }]}>
                  {claim.stage6_dropOffConfirmed ? '✓ Scheduled' : 'Pick Date'}
                </Text>
              </View>
              <Text style={[styles.infoVal, { color: colors.text }]}>
                Check-in: {claim.stage6_dropOffDate || '2026-09-04'} at {claim.stage6_dropOffTime || '08:00 AM'}
              </Text>
              <Text style={[styles.stageSub, { color: colors.textSecondary, marginTop: 2 }]}>
                Repairer: {claim.stage6_repairerAddress || 'Precision Auto Body, 5 Daisy St, Sandown, Sandton'}
              </Text>
              {activeForm !== 'dropoff' ? (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.hoverBackground, borderColor: colors.cardBorder }]}
                  onPress={() => setActiveForm('dropoff')}
                >
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>Change Drop-Off Date</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.inlineForm}>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
                    value={dropOffDate}
                    onChangeText={setDropOffDate}
                    placeholder="YYYY-MM-DD"
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
                    value={dropOffTime}
                    onChangeText={setDropOffTime}
                    placeholder="HH:MM AM"
                  />
                  <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                    disabled={submitting}
                    onPress={() =>
                      handleUpdateStage(
                        7,
                        {
                          stage6_dropOffDate: dropOffDate,
                          stage6_dropOffTime: dropOffTime,
                          stage6_dropOffConfirmed: true,
                          stage7_carHirePickupDate: `${dropOffDate} ${dropOffTime}`,
                          stage7_carHireStatus: 'active_rental',
                        },
                        'Drop-off date scheduled and Avis courtesy car coordinated.'
                      )
                    }
                  >
                    <Text style={styles.submitBtnText}>{submitting ? 'Saving...' : 'Confirm Check-in Date'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* STAGE 7: CAR HIRE ARRANGED */}
            <View style={[styles.stageSection, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', borderColor: colors.cardBorder }]}>
              <View style={styles.stageSectionHeader}>
                <Text style={[styles.stageBadge, { backgroundColor: colors.primaryAlpha, color: colors.primary }]}>Stage 7</Text>
                <Text style={[styles.stageHeading, { color: colors.text }]}>Car Hire & Delivery</Text>
                <Text style={[styles.stageCheck, { color: colors.success }]}>✓ Arranged</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Company:</Text>
                <Text style={[styles.infoVal, { color: colors.text }]}>{claim.stage7_carHireCompany || 'Avis Rent a Car'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Voucher #:</Text>
                <Text style={[styles.infoVal, { color: colors.primary }]}>{claim.stage7_carHireVoucher || 'AVIS-RS-992014'}</Text>
              </View>
              <Text style={[styles.stageSub, { color: colors.textSecondary, marginTop: 4 }]}>
                Vehicle delivered directly to repairer for instant swap when dropping off your car.
              </Text>
            </View>

            {/* STAGE 8: WEEKLY WORKSHOP UPDATES */}
            <View style={[styles.stageSection, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', borderColor: colors.cardBorder }]}>
              <View style={styles.stageSectionHeader}>
                <Text style={[styles.stageBadge, { backgroundColor: colors.primaryAlpha, color: colors.primary }]}>Stage 8</Text>
                <Text style={[styles.stageHeading, { color: colors.text }]}>Weekly Repair Updates</Text>
                <Text style={[styles.stageCheck, { color: colors.primary }]}>{claim.stage8_repairProgressPercent || 75}% Complete</Text>
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${claim.stage8_repairProgressPercent || 75}%`, backgroundColor: colors.primary }]} />
              </View>

              <View style={styles.timelineList}>
                {(claim.stage8_weeklyUpdates || [
                  { week: 'Week 1', stage: 'Vehicle Ingest & Stripping', details: 'Tailgate and bumper stripped. OEM parts arrived.', status: 'completed' },
                  { week: 'Week 2', stage: 'Panel Beating & Metal Alignment', details: 'Tailgate skin aligned on electronic jig. Primer applied.', status: 'completed' },
                  { week: 'Week 3', stage: 'Spray Booth & Clear Coat', details: 'Robotic color match applied in downdraft booth.', status: 'completed' },
                  { week: 'Week 4', stage: 'Assembly & 50-Point Quality Polish', details: 'Reassembly and sensor diagnostics.', status: 'in_progress' },
                ]).map((u: any, idx: number) => (
                  <View key={idx} style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { backgroundColor: u.status === 'completed' ? colors.success : colors.primary }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.timelineStage, { color: colors.text }]}>{u.stage}</Text>
                      <Text style={[styles.timelineDetails, { color: colors.textSecondary }]}>{u.details}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* STAGE 9: COLLECTION & CAR HIRE RETURN */}
            <View style={[styles.stageSection, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', borderColor: colors.cardBorder }]}>
              <View style={styles.stageSectionHeader}>
                <Text style={[styles.stageBadge, { backgroundColor: colors.primaryAlpha, color: colors.primary }]}>Stage 9</Text>
                <Text style={[styles.stageHeading, { color: colors.text }]}>Collection & Car Return</Text>
                <Text style={[styles.stageCheck, { color: colors.success }]}>Ready</Text>
              </View>
              <Text style={[styles.infoVal, { color: colors.text }]}>
                Ready Date: {claim.stage9_readyForCollectionDate || '2026-09-11 15:00'}
              </Text>
              <Text style={[styles.stageSub, { color: colors.textSecondary, marginTop: 4 }]}>
                Hand back Avis rental car key at the repairer reception desk upon vehicle collection.
              </Text>
            </View>

            {/* STAGE 10: CLIENT REVIEW & CLAIM CLOSEOUT */}
            <View style={[styles.stageSection, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', borderColor: colors.cardBorder }]}>
              <View style={styles.stageSectionHeader}>
                <Text style={[styles.stageBadge, { backgroundColor: colors.primaryAlpha, color: colors.primary }]}>Stage 10</Text>
                <Text style={[styles.stageHeading, { color: colors.text }]}>Review & Close Transaction</Text>
                <Text style={[styles.stageCheck, { color: isClosed ? colors.success : colors.gold }]}>
                  {isClosed ? '✓ Closed' : 'Pending Review'}
                </Text>
              </View>

              {isClosed ? (
                <View style={[styles.closedBox, { backgroundColor: colors.successAlpha, borderColor: colors.success }]}>
                  <Text style={[styles.ratingStars, { color: colors.gold }]}>{'★'.repeat(claim.stage10_rating || 5)}</Text>
                  <Text style={[styles.closedReviewText, { color: colors.text }]}>"{claim.stage10_reviewComment}"</Text>
                  <Text style={[styles.closedFooter, { color: colors.success }]}>✓ Transaction Closed & Archived</Text>
                </View>
              ) : activeForm !== 'review' ? (
                <TouchableOpacity
                  style={[styles.closeClaimBtn, { backgroundColor: colors.success }]}
                  onPress={() => setActiveForm('review')}
                >
                  <Text style={styles.closeClaimBtnText}>★ Write Review & Close Claim</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.inlineForm}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Rating (1 to 5 Stars):</Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <TouchableOpacity key={s} onPress={() => setRating(s)}>
                        <Text style={[styles.starBtn, { color: s <= rating ? colors.gold : colors.textMuted }]}>★</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={[styles.input, { height: 70, color: colors.text, borderColor: colors.cardBorder }]}
                    multiline
                    value={reviewComment}
                    onChangeText={setReviewComment}
                    placeholder="Your feedback on repair quality, car hire, and communication..."
                  />
                  <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: colors.success }]}
                    disabled={submitting}
                    onPress={handleCloseClaim}
                  >
                    <Text style={styles.submitBtnText}>{submitting ? 'Closing...' : 'Submit & Close Claim'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  refTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  vehicleSub: {
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepperScrollContainer: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  stepperContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  stepCard: {
    width: 130,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  stepNumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stepNumCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  stepStatusBadge: {
    fontSize: 8,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  stepDesc: {
    fontSize: 9,
    lineHeight: 12,
    marginTop: 2,
  },
  scrollBody: {
    padding: 20,
    gap: 14,
    paddingBottom: 40,
  },
  stageSection: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  stageSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stageBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: '800',
  },
  stageHeading: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginLeft: 8,
  },
  stageCheck: {
    fontSize: 11,
    fontWeight: '700',
  },
  stageSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  infoLabel: {
    fontSize: 11,
  },
  infoVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtn: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inlineForm: {
    marginTop: 10,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
  },
  submitBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
  },
  timelineList: {
    marginTop: 8,
    gap: 8,
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  timelineStage: {
    fontSize: 11,
    fontWeight: '700',
  },
  timelineDetails: {
    fontSize: 10,
  },
  closeClaimBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeClaimBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  closedBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
  },
  ratingStars: {
    fontSize: 16,
    letterSpacing: 2,
    marginBottom: 4,
  },
  closedReviewText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  closedFooter: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  starBtn: {
    fontSize: 22,
  },
});
