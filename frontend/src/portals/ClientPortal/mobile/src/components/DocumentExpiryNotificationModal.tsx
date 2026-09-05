import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { RoyalSquareLogo } from './RoyalSquareLogo';
import {
  CheckmarkIcon,
  AlertIcon,
  MailIcon,
  PhoneIcon,
  DocumentTextIcon,
  IdCardIcon,
  CarIcon,
  ShieldIcon,
  CalendarIcon,
} from './GrommetIcons';
import { ExpiringDocument, NotificationSettings } from '../types';

const INITIAL_DOCUMENTS: ExpiringDocument[] = [
  {
    id: 'doc-1',
    name: 'RSA Driving Licence Card',
    category: 'Identification',
    expiryDate: '23 September 2026',
    daysRemaining: 18,
    status: 'critical',
    issuer: 'Road Traffic Management Corporation (RTMC)',
    smsAlertEnabled: true,
    emailAlertEnabled: true,
    lastNotified: 'Today at 08:30',
    documentRef: 'DL-800101-ZA',
  },
  {
    id: 'doc-2',
    name: 'Vehicle Inspection & Tracker Certificate',
    category: 'Motor',
    expiryDate: '03 October 2026',
    daysRemaining: 28,
    status: 'warning',
    issuer: 'Santam Approved Fitment Centre',
    smsAlertEnabled: true,
    emailAlertEnabled: true,
    lastNotified: '01 Sep 2026',
    documentRef: 'STM-FIT-992314',
  },
  {
    id: 'doc-3',
    name: 'FICA Proof of Residential Address',
    category: 'Compliance',
    expiryDate: '17 October 2026',
    daysRemaining: 42,
    status: 'warning',
    issuer: 'City of Johannesburg Rates Account',
    smsAlertEnabled: true,
    emailAlertEnabled: true,
    lastNotified: 'Pending 30-day window',
    documentRef: 'FICA-UTIL-2026-Q3',
  },
  {
    id: 'doc-4',
    name: 'FAIS Annual Advisory Mandate Review',
    category: 'Advisory Mandate',
    expiryDate: '04 November 2026',
    daysRemaining: 60,
    status: 'valid',
    issuer: 'Royal Square Financial (FSP 49291)',
    smsAlertEnabled: true,
    emailAlertEnabled: true,
    lastNotified: 'Pending 30-day window',
    documentRef: 'RSF-MANDATE-49291',
  },
  {
    id: 'doc-5',
    name: 'SARS IT3b / Tax Directive Certificate',
    category: 'Tax & SARS',
    expiryDate: '28 February 2027',
    daysRemaining: 176,
    status: 'valid',
    issuer: 'South African Revenue Service',
    smsAlertEnabled: false,
    emailAlertEnabled: true,
    lastNotified: 'Not scheduled yet',
    documentRef: 'SARS-IT3B-2026-TAX',
  },
];

interface DocumentExpiryNotificationModalProps {
  visible: boolean;
  onClose: () => void;
  clientPhone?: string;
  clientEmail?: string;
  clientName?: string;
}

export const DocumentExpiryNotificationModal: React.FC<DocumentExpiryNotificationModalProps> = ({
  visible,
  onClose,
  clientPhone = '+27 82 123 4567',
  clientEmail = '',
  clientName = '',
}) => {
  const { colors, isDark } = useTheme();

  const [documents, setDocuments] = useState<ExpiringDocument[]>(INITIAL_DOCUMENTS);
  const [settings, setSettings] = useState<NotificationSettings>({
    smsEnabled: true,
    smsRecipient: clientPhone,
    emailEnabled: true,
    emailRecipient: clientEmail,
    pushEnabled: true,
    advanceDays: [30, 14, 7, 1],
  });

  const [activeTab, setActiveTab] = useState<'documents' | 'settings' | 'preview'>('documents');
  const [sendingAlert, setSendingAlert] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{ channel: string; message: string } | null>(null);
  const [renewingDocId, setRenewingDocId] = useState<string | null>(null);

  const criticalCount = documents.filter(d => d.status === 'critical').length;
  const warningCount = documents.filter(d => d.status === 'warning').length;

  const toggleDocAlert = (docId: string, channel: 'sms' | 'email') => {
    setDocuments(prev =>
      prev.map(d => {
        if (d.id === docId) {
          return {
            ...d,
            smsAlertEnabled: channel === 'sms' ? !d.smsAlertEnabled : d.smsAlertEnabled,
            emailAlertEnabled: channel === 'email' ? !d.emailAlertEnabled : d.emailAlertEnabled,
          };
        }
        return d;
      })
    );
  };

  const handleSimulateDispatch = (doc?: ExpiringDocument) => {
    const targetDoc = doc || documents.find(d => d.status === 'critical') || documents[0];
    setSendingAlert(true);
    setDispatchResult(null);

    setTimeout(() => {
      setSendingAlert(false);
      setDispatchResult({
        channel: 'SMS & Email',
        message: `Alert successfully delivered to SMS (${settings.smsRecipient}) and Email (${settings.emailRecipient}) for ${targetDoc.name}!`,
      });

      // Update last notified
      setDocuments(prev =>
        prev.map(d => (d.id === targetDoc.id ? { ...d, lastNotified: 'Just now (Delivered)' } : d))
      );
    }, 1200);
  };

  const handleRenewDocument = (docId: string) => {
    setRenewingDocId(docId);
    setTimeout(() => {
      setDocuments(prev =>
        prev.map(d => {
          if (d.id === docId) {
            return {
              ...d,
              expiryDate: '05 September 2027',
              daysRemaining: 365,
              status: 'valid',
              lastNotified: 'Renewed today',
            };
          }
          return d;
        })
      );
      setRenewingDocId(null);
    }, 1000);
  };

  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'Identification':
        return <IdCardIcon color={colors.primary} size={18} />;
      case 'Motor':
        return <CarIcon color={colors.primary} size={18} />;
      case 'Advisory Mandate':
        return <ShieldIcon color={colors.primary} size={18} />;
      case 'Tax & SARS':
        return <DocumentTextIcon color={colors.primary} size={18} />;
      default:
        return <CalendarIcon color={colors.primary} size={18} />;
    }
  };

  const renderStatusBadge = (status: string, days: number) => {
    if (status === 'critical') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}>
          <AlertIcon color={colors.primary} size={12} />
          <Text style={[styles.statusBadgeText, { color: colors.primary }]}>{days} DAYS (EXPIRING SOON)</Text>
        </View>
      );
    }
    if (status === 'warning') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: 'rgba(201,168,76,0.12)', borderColor: 'rgba(201,168,76,0.3)' }]}>
          <CalendarIcon color={colors.gold} size={12} />
          <Text style={[styles.statusBadgeText, { color: colors.gold }]}>{days} DAYS REMAINING</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, { backgroundColor: colors.successAlpha, borderColor: colors.successBorder }]}>
        <CheckmarkIcon color={colors.success} size={12} strokeWidth={3} />
        <Text style={[styles.statusBadgeText, { color: colors.success }]}>VALID ({days} DAYS)</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Top Navigation Header */}
        <View style={[styles.topHeader, { backgroundColor: colors.backgroundElevated, borderBottomColor: colors.divider }]}>
          <View style={styles.headerBrandRow}>
            <RoyalSquareLogo size={28} />
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.brandTitle, { color: colors.text }]}>DOCUMENT EXPIRY & ALERTS</Text>
              <Text style={[styles.brandSub, { color: colors.gold }]}>Automated SMS & Email Notification System</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={onClose}
          >
            <Text style={[styles.closeBtnText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation Pill Selector */}
        <View style={[styles.tabsRow, { borderBottomColor: colors.divider, backgroundColor: colors.backgroundElevated }]}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'documents' && { borderBottomColor: colors.primary, borderBottomWidth: 3 },
            ]}
            onPress={() => setActiveTab('documents')}
          >
            <Text style={[styles.tabBtnText, { color: activeTab === 'documents' ? colors.primary : colors.textMuted }]}>
              Documents ({documents.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'settings' && { borderBottomColor: colors.primary, borderBottomWidth: 3 },
            ]}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={[styles.tabBtnText, { color: activeTab === 'settings' ? colors.primary : colors.textMuted }]}>
              SMS & Email Setup
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'preview' && { borderBottomColor: colors.primary, borderBottomWidth: 3 },
            ]}
            onPress={() => setActiveTab('preview')}
          >
            <Text style={[styles.tabBtnText, { color: activeTab === 'preview' ? colors.primary : colors.textMuted }]}>
              Live Alert Previews
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Dispatch Toast Feedback */}
          {dispatchResult && (
            <View style={[styles.feedbackBanner, { backgroundColor: colors.successAlpha, borderColor: colors.successBorder }]}>
              <CheckmarkIcon color={colors.success} size={18} strokeWidth={3} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.feedbackTitle, { color: colors.success }]}>Notification Dispatched</Text>
                <Text style={[styles.feedbackMessage, { color: colors.textSecondary }]}>{dispatchResult.message}</Text>
              </View>
            </View>
          )}

          {/* TAB 1: Documents Expiry Matrix */}
          {activeTab === 'documents' && (
            <View>
              {/* Summary Metric Header */}
              <View style={styles.metricsSummaryRow}>
                <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.metricVal, { color: colors.text }]}>{documents.length}</Text>
                  <Text style={[styles.metricLbl, { color: colors.textMuted }]}>Tracked</Text>
                </View>

                <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.primaryBorder }]}>
                  <Text style={[styles.metricVal, { color: colors.primary }]}>{criticalCount}</Text>
                  <Text style={[styles.metricLbl, { color: colors.primary }]}>Urgent Expiry</Text>
                </View>

                <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: 'rgba(201,168,76,0.3)' }]}>
                  <Text style={[styles.metricVal, { color: colors.gold }]}>{warningCount}</Text>
                  <Text style={[styles.metricLbl, { color: colors.gold }]}>Due in 60d</Text>
                </View>
              </View>

              {/* Master Dispatch CTA Banner */}
              <View
                style={[
                  styles.masterActionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    borderLeftColor: colors.primary,
                  },
                ]}
              >
                <View style={styles.masterActionHeader}>
                  <View style={[styles.smsIconCircle, { backgroundColor: colors.primaryAlpha }]}>
                    <PhoneIcon color={colors.primary} size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.masterActionTitle, { color: colors.text }]}>Automated Expiry Monitor</Text>
                    <Text style={[styles.masterActionSub, { color: colors.textSecondary }]}>
                      Sends real-time SMS to <Text style={{ fontWeight: '700', color: colors.text }}>{settings.smsRecipient}</Text> and Email to <Text style={{ fontWeight: '700', color: colors.text }}>{settings.emailRecipient}</Text>
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.testDispatchBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handleSimulateDispatch()}
                  disabled={sendingAlert}
                  activeOpacity={0.85}
                >
                  {sendingAlert ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <PhoneIcon color="#ffffff" size={14} />
                      <Text style={styles.testDispatchText}>Send Expiry Alert Now (SMS & Email)</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Expiring Documents List */}
              <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>MONITORED COMPLIANCE DOCUMENTS</Text>
              <View style={styles.documentsList}>
                {documents.map((doc) => {
                  const isRenewing = renewingDocId === doc.id;

                  return (
                    <View
                      key={doc.id}
                      style={[
                        styles.docCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: doc.status === 'critical' ? colors.primaryBorder : colors.cardBorder,
                          borderLeftColor: doc.status === 'critical' ? colors.primary : colors.cardBorder,
                        },
                      ]}
                    >
                      {/* Top row: Category icon, Name & Status badge */}
                      <View style={styles.docHeaderRow}>
                        <View style={[styles.docIconCircle, { backgroundColor: colors.primaryAlpha }]}>
                          {renderCategoryIcon(doc.category)}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.docName, { color: colors.text }]}>{doc.name}</Text>
                          <Text style={[styles.docIssuer, { color: colors.textSecondary }]}>{doc.issuer}</Text>
                        </View>
                        {renderStatusBadge(doc.status, doc.daysRemaining)}
                      </View>

                      {/* Expiry Details & Progress Track */}
                      <View style={styles.docMetaRow}>
                        <View>
                          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>EXPIRY DATE</Text>
                          <Text style={[styles.metaValue, { color: colors.text }]}>{doc.expiryDate}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>LAST NOTIFIED</Text>
                          <Text style={[styles.metaValue, { color: colors.gold }]}>{doc.lastNotified}</Text>
                        </View>
                      </View>

                      {/* Expiry Progress Countdown Bar */}
                      <View style={[styles.progressTrack, { backgroundColor: isDark ? '#262626' : '#e5e8eb' }]}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.max(8, Math.min(100, (doc.daysRemaining / 365) * 100))}%`,
                              backgroundColor:
                                doc.status === 'critical'
                                  ? colors.primary
                                  : doc.status === 'warning'
                                  ? colors.gold
                                  : colors.success,
                            },
                          ]}
                        />
                      </View>

                      {/* Active Channels & Action Footer */}
                      <View style={[styles.docCardFooter, { borderTopColor: colors.divider }]}>
                        <View style={styles.channelToggles}>
                          {/* SMS Toggle */}
                          <TouchableOpacity
                            style={[
                              styles.channelPill,
                              {
                                backgroundColor: doc.smsAlertEnabled ? colors.primaryAlpha : (isDark ? '#222222' : '#f0f2f5'),
                                borderColor: doc.smsAlertEnabled ? colors.primaryBorder : colors.cardBorder,
                              },
                            ]}
                            onPress={() => toggleDocAlert(doc.id, 'sms')}
                          >
                            <PhoneIcon color={doc.smsAlertEnabled ? colors.primary : colors.textMuted} size={12} />
                            <Text style={[styles.channelPillText, { color: doc.smsAlertEnabled ? colors.primary : colors.textMuted }]}>
                              SMS {doc.smsAlertEnabled ? 'ON' : 'OFF'}
                            </Text>
                          </TouchableOpacity>

                          {/* Email Toggle */}
                          <TouchableOpacity
                            style={[
                              styles.channelPill,
                              {
                                backgroundColor: doc.emailAlertEnabled ? colors.primaryAlpha : (isDark ? '#222222' : '#f0f2f5'),
                                borderColor: doc.emailAlertEnabled ? colors.primaryBorder : colors.cardBorder,
                              },
                            ]}
                            onPress={() => toggleDocAlert(doc.id, 'email')}
                          >
                            <MailIcon color={doc.emailAlertEnabled ? colors.primary : colors.textMuted} size={12} />
                            <Text style={[styles.channelPillText, { color: doc.emailAlertEnabled ? colors.primary : colors.textMuted }]}>
                              EMAIL {doc.emailAlertEnabled ? 'ON' : 'OFF'}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* Renew / Quick Alert action buttons */}
                        <View style={styles.docActionsGroup}>
                          <TouchableOpacity
                            style={[styles.miniActionBtn, { backgroundColor: colors.cardHover, borderColor: colors.cardBorder }]}
                            onPress={() => handleSimulateDispatch(doc)}
                          >
                            <Text style={[styles.miniActionBtnText, { color: colors.primary }]}>Alert</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.miniActionBtn, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}
                            onPress={() => handleRenewDocument(doc.id)}
                            disabled={isRenewing}
                          >
                            {isRenewing ? (
                              <ActivityIndicator color={colors.primary} size="small" />
                            ) : (
                              <Text style={[styles.miniActionBtnText, { color: colors.primary, fontWeight: '800' }]}>
                                + Renew
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* TAB 2: SMS & Email Setup Settings */}
          {activeTab === 'settings' && (
            <View>
              <Text style={[styles.tabTitle, { color: colors.text }]}>Notification Channels & Rules</Text>
              <Text style={[styles.tabSub, { color: colors.textMuted }]}>
                Configure delivery endpoints and advance notice timing for document renewals
              </Text>

              {/* SMS Configuration Card */}
              <View style={[styles.configCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.configHeader}>
                  <View style={[styles.configIconBox, { backgroundColor: colors.primaryAlpha }]}>
                    <PhoneIcon color={colors.primary} size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.configTitle, { color: colors.text }]}>SMS Text Alerts</Text>
                    <Text style={[styles.configSub, { color: colors.textSecondary }]}>Immediate mobile notifications</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.toggleSwitch,
                      {
                        backgroundColor: settings.smsEnabled ? colors.primary : (isDark ? '#333333' : '#d0d4d9'),
                      },
                    ]}
                    onPress={() => setSettings(prev => ({ ...prev, smsEnabled: !prev.smsEnabled }))}
                  >
                    <View
                      style={[
                        styles.toggleKnob,
                        settings.smsEnabled ? styles.toggleKnobActive : styles.toggleKnobInactive,
                      ]}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrap}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>RECIPIENT MOBILE NUMBER</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                    value={settings.smsRecipient}
                    onChangeText={(txt) => setSettings(prev => ({ ...prev, smsRecipient: txt }))}
                    placeholder="+27 82 123 4567"
                    placeholderTextColor={colors.textSubtle}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Email Configuration Card */}
              <View style={[styles.configCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.configHeader}>
                  <View style={[styles.configIconBox, { backgroundColor: colors.primaryAlpha }]}>
                    <MailIcon color={colors.primary} size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.configTitle, { color: colors.text }]}>Email Notifications</Text>
                    <Text style={[styles.configSub, { color: colors.textSecondary }]}>Itemized renewal summaries with links</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.toggleSwitch,
                      {
                        backgroundColor: settings.emailEnabled ? colors.primary : (isDark ? '#333333' : '#d0d4d9'),
                      },
                    ]}
                    onPress={() => setSettings(prev => ({ ...prev, emailEnabled: !prev.emailEnabled }))}
                  >
                    <View
                      style={[
                        styles.toggleKnob,
                        settings.emailEnabled ? styles.toggleKnobActive : styles.toggleKnobInactive,
                      ]}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrap}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>RECIPIENT EMAIL ADDRESS</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                    value={settings.emailRecipient}
                    onChangeText={(txt) => setSettings(prev => ({ ...prev, emailRecipient: txt }))}
                    placeholder="client@domain.co.za"
                    placeholderTextColor={colors.textSubtle}
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Advance Timing Rules */}
              <View style={[styles.configCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.configTitle, { color: colors.text, marginBottom: 4 }]}>Advance Notice Frequency</Text>
                <Text style={[styles.configSub, { color: colors.textSecondary, marginBottom: 12 }]}>
                  Automated notifications trigger at the following countdown milestones:
                </Text>

                <View style={styles.advanceIntervalsGrid}>
                  {[
                    { days: 30, label: '30 Days Prior', desc: 'First early warning' },
                    { days: 14, label: '14 Days Prior', desc: 'Second reminder' },
                    { days: 7, label: '7 Days Prior', desc: 'Urgent action alert' },
                    { days: 1, label: '1 Day & Expiry', desc: 'Final critical alert' },
                  ].map((item) => (
                    <View
                      key={item.days}
                      style={[
                        styles.intervalItem,
                        {
                          backgroundColor: colors.primaryAlpha,
                          borderColor: colors.primaryBorder,
                        },
                      ]}
                    >
                      <CheckmarkIcon color={colors.primary} size={14} strokeWidth={3} />
                      <View>
                        <Text style={[styles.intervalLabel, { color: colors.text }]}>{item.label}</Text>
                        <Text style={[styles.intervalDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* TAB 3: Live SMS & Email Template Previews */}
          {activeTab === 'preview' && (
            <View>
              <Text style={[styles.tabTitle, { color: colors.text }]}>Notification Message Templates</Text>
              <Text style={[styles.tabSub, { color: colors.textMuted }]}>
                Preview exact text messages and email formatting delivered to the client
              </Text>

              {/* Live SMS Chat Bubble Preview */}
              <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>LIVE SMS NOTIFICATION PREVIEW</Text>
              <View style={[styles.smsPreviewBox, { backgroundColor: isDark ? '#1a1a1a' : '#f3f4f6', borderColor: colors.cardBorder }]}>
                <View style={styles.smsSenderRow}>
                  <Text style={[styles.smsSenderText, { color: colors.primary }]}>ROYAL SQUARE ALERT</Text>
                  <Text style={[styles.smsTimeText, { color: colors.textMuted }]}>Today 08:30</Text>
                </View>
                <View style={[styles.smsBubble, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.smsBubbleText, { color: colors.text }]}>
                    <Text style={{ fontWeight: '800' }}>[URGENT ACTION] </Text>
                    Dear {clientName}, your <Text style={{ fontWeight: '800', color: colors.primary }}>RSA Driving Licence Card</Text> expires in 18 days on 23 Sept 2026.
                    {'\n\n'}Please arrange renewal and upload certified copy on the Royal Square app to maintain short-term vehicle cover continuity.
                    {'\n\n'}Ref: DL-800101-ZA · Helpline: 011 492 1566
                  </Text>
                </View>
              </View>

              {/* Live Email Template Preview */}
              <Text style={[styles.sectionHeading, { color: colors.textMuted, marginTop: 20 }]}>LIVE HTML EMAIL NOTIFICATION PREVIEW</Text>
              <View style={[styles.emailPreviewCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                {/* Email Header Bar */}
                <View style={[styles.emailHeaderBar, { backgroundColor: colors.primary, borderTopLeftRadius: 14, borderTopRightRadius: 14 }]}>
                  <RoyalSquareLogo size={24} />
                  <Text style={styles.emailHeaderTitle}>Royal Square Financial Compliance</Text>
                </View>

                <View style={styles.emailContentBody}>
                  <Text style={[styles.emailSubject, { color: colors.text }]}>
                    Notice of Upcoming Document Expiry: RSA Driving Licence Card
                  </Text>
                  <Text style={[styles.emailDate, { color: colors.textMuted }]}>
                    Recipient: {settings.emailRecipient} · Date: 05 September 2026
                  </Text>

                  <View style={[styles.emailDivider, { backgroundColor: colors.divider }]} />

                  <Text style={[styles.emailBodyText, { color: colors.textSecondary }]}>
                    Dear {clientName},
                    {'\n\n'}This is an automated advisory notification that your <Text style={{ fontWeight: '800', color: colors.text }}>RSA Driving Licence Card</Text> is due to expire in <Text style={{ fontWeight: '800', color: colors.primary }}>18 days (23 September 2026)</Text>.
                    {'\n\n'}To prevent policy claim repudiation under your Santam Motor Vehicle Insurance cover, please ensure your licence card is renewed.
                  </Text>

                  <View style={[styles.emailCtaBox, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}>
                    <Text style={[styles.emailCtaLabel, { color: colors.primary }]}>Document Reference: DL-800101-ZA</Text>
                    <Text style={[styles.emailCtaSub, { color: colors.textSecondary }]}>Assigned Financial Adviser: QINISO THULANI NTULI (FSP 49291)</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Bottom Statutory Footer */}
          <Text style={[styles.statutoryFooter, { color: colors.textMuted }]}>
            Automated notifications operate under FAIS compliance mandates to safeguard policy validity and statutory compliance.
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
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 12,
  },
  tabBtn: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  feedbackMessage: {
    fontSize: 11,
    marginTop: 1,
  },
  metricsSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricLbl: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  masterActionCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  masterActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  smsIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterActionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  masterActionSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  testDispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
  },
  testDispatchText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  documentsList: {
    gap: 12,
  },
  docCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 16,
    padding: 14,
  },
  docHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  docIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    fontSize: 13,
    fontWeight: '800',
  },
  docIssuer: {
    fontSize: 11,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  docMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  docCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  channelToggles: {
    flexDirection: 'row',
    gap: 6,
  },
  channelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  channelPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  docActionsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  miniActionBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  miniActionBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  tabSub: {
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 17,
  },
  configCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  configIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  configTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  configSub: {
    fontSize: 11,
    marginTop: 1,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  toggleKnobInactive: {
    alignSelf: 'flex-start',
  },
  inputWrap: {
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  advanceIntervalsGrid: {
    gap: 8,
  },
  intervalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  intervalLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  intervalDesc: {
    fontSize: 10,
    marginTop: 1,
  },
  smsPreviewBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  smsSenderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  smsSenderText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  smsTimeText: {
    fontSize: 10,
  },
  smsBubble: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  smsBubbleText: {
    fontSize: 12,
    lineHeight: 18,
  },
  emailPreviewCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emailHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  emailHeaderTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  emailContentBody: {
    padding: 14,
  },
  emailSubject: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  emailDate: {
    fontSize: 10,
    marginBottom: 10,
  },
  emailDivider: {
    height: 1,
    marginBottom: 10,
  },
  emailBodyText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  emailCtaBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  emailCtaLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  emailCtaSub: {
    fontSize: 10,
    marginTop: 2,
  },
  statutoryFooter: {
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    paddingHorizontal: 12,
    marginTop: 20,
  },
});
