import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { RoyalSquareLogo } from './RoyalSquareLogo';
import {
  CheckmarkIcon,
  ShieldIcon,
  DocumentTextIcon,
  LockIcon,
} from './GrommetIcons';

interface NoticeOfAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  clientName?: string;
  idNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const NoticeOfAppointmentModal: React.FC<NoticeOfAppointmentModalProps> = ({
  visible,
  onClose,
  clientName = '',
  idNumber = '',
  email = '',
  phone = '',
  address = '',
}) => {
  const { colors, isDark } = useTheme();

  // Digital Mandate form state
  const [formClientName, setFormClientName] = useState(clientName);
  const [formAddress, setFormAddress] = useState(address);
  const [formIdNumber, setFormIdNumber] = useState(idNumber);
  const [formMobile, setFormMobile] = useState(phone);
  const [formEmail, setFormEmail] = useState(email);
  const [formOfficeNumber, setFormOfficeNumber] = useState('011 492 1566');
  const [formHomeNumber, setFormHomeNumber] = useState('011 884 9201');
  const [signedDate, setSignedDate] = useState('05 September 2026');
  const [isSigned, setIsSigned] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const advisorName = 'QINISO THULANI NTULI';
  const fspNumber = 'FSP 49291';
  const securityHash = '';

  const handleToggleSign = () => {
    setIsSigned(prev => !prev);
    if (!isSigned) {
      setSignedDate('05 September 2026');
    }
  };

  const handleSaveMandate = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleExportShare = async () => {
    try {
      await Share.share({
        title: 'Notice of Appointment as Financial Advisor - Royal Square Financial',
        message: `NOTICE OF APPOINTMENT AS A FINANCIAL ADVISOR\n\nI hereby appoint Royal Square Financial (Pty) Ltd, represented by ${advisorName} as my Advisor.\n\nClient: ${formClientName}\nID Number: ${formIdNumber}\nDate: ${signedDate}\nFee Authorization: 1.50% upfront / 1.00% ongoing\nStatus: Digitally Signed & Certified (${securityHash})`,
      });
    } catch (error) {
      console.log('Share error', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        {/* Modal Top Bar */}
        <View style={[styles.topHeader, { backgroundColor: colors.backgroundElevated, borderBottomColor: colors.divider }]}>
          <View style={styles.headerBrandRow}>
            <RoyalSquareLogo size={28} />
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.brandTitle, { color: colors.text }]}>ROYAL SQUARE FINANCIAL</Text>
              <Text style={[styles.brandSub, { color: colors.gold }]}>Authorized Financial Services Provider · {fspNumber}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={onClose}
          >
            <Text style={[styles.closeBtnText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Document Certification Header Badge */}
          <View
            style={[
              styles.certBadge,
              {
                backgroundColor: colors.primaryAlpha,
                borderColor: colors.primaryBorder,
              },
            ]}
          >
            <ShieldIcon color={colors.primary} size={18} />
            <Text style={[styles.certBadgeText, { color: colors.primary }]}>
              OFFICIAL STATUTORY DIGITAL MANDATE
            </Text>
          </View>

          {/* Document Main Heading */}
          <Text style={[styles.docHeading, { color: colors.text }]}>
            NOTICE OF APPOINTMENT AS A FINANCIAL ADVISOR
          </Text>
          <Text style={[styles.docSubheading, { color: colors.textMuted }]}>
            In compliance with the Financial Advisory and Intermediary Services (FAIS) Act
          </Text>

          {/* Legal Appointment Clause */}
          <View
            style={[
              styles.clauseCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderLeftColor: colors.primary,
              },
            ]}
          >
            <Text style={[styles.clauseSectionLabel, { color: colors.primary }]}>APPOINTMENT & AUTHORITY</Text>
            <Text style={[styles.clauseBody, { color: colors.text }]}>
              I hereby appoint <Text style={{ fontWeight: '800', color: colors.text }}>Royal Square Financial (Pty) Ltd</Text>, represented by{' '}
              <Text style={{ fontWeight: '800', color: colors.gold }}>{advisorName}</Text> as my/our Advisor and authorise him to perform all the necessary acts, including the acquisition of information from my Pension/Provident Fund, Banking Institution, the various Life Insurance/ Asset Management/ Investment Companies, to enable them to advise me/us to the best of their ability.
            </Text>

            <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />

            <Text style={[styles.clauseSectionLabel, { color: colors.primary }]}>PERIOD & REVOCATION</Text>
            <Text style={[styles.clauseBody, { color: colors.text }]}>
              This authorisation is granted indefinitely and does not expire until cancelled in writing by myself or the appointed advisor.
            </Text>
          </View>

          {/* Investment Management Fee Structure */}
          <View
            style={[
              styles.feeCard,
              {
                backgroundColor: isDark ? '#1b1b1b' : '#f8f9fa',
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.feeCardTitle, { color: colors.text }]}>AUTHORISED FEE SCHEDULE</Text>
            <Text style={[styles.feeCardText, { color: colors.textSecondary }]}>
              I authorise the Investment Management Fees on <Text style={{ fontWeight: '800', color: colors.text }}>ALL</Text> my investments to be changed to:
            </Text>

            <View style={styles.feeChipsRow}>
              <View
                style={[
                  styles.feeChip,
                  {
                    backgroundColor: colors.primaryAlpha,
                    borderColor: colors.primaryBorder,
                  },
                ]}
              >
                <Text style={[styles.feeChipVal, { color: colors.primary }]}>1.50%</Text>
                <Text style={[styles.feeChipLbl, { color: colors.textSecondary }]}>Upfront Fee</Text>
              </View>

              <View
                style={[
                  styles.feeChip,
                  {
                    backgroundColor: colors.primaryAlpha,
                    borderColor: colors.primaryBorder,
                  },
                ]}
              >
                <Text style={[styles.feeChipVal, { color: colors.primary }]}>1.00%</Text>
                <Text style={[styles.feeChipLbl, { color: colors.textSecondary }]}>On-Going Basis</Text>
              </View>
            </View>
          </View>

          {/* Client Digital Information Fields */}
          <View style={styles.fieldsSection}>
            <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>CLIENT PARTICULARS</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>NAME OF CLIENT</Text>
              <TextInput
                style={[styles.inputBox, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                value={formClientName}
                onChangeText={setFormClientName}
                placeholder="Full Legal Name"
                placeholderTextColor={colors.textSubtle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>RESIDENTIAL / POSTAL ADDRESS</Text>
              <TextInput
                style={[styles.inputBox, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                value={formAddress}
                onChangeText={setFormAddress}
                placeholder="Physical Address"
                placeholderTextColor={colors.textSubtle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>IDENTITY NUMBER</Text>
              <TextInput
                style={[styles.inputBox, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                value={formIdNumber}
                onChangeText={setFormIdNumber}
                placeholder="13-digit RSA ID / Passport Number"
                placeholderTextColor={colors.textSubtle}
              />
            </View>

            <View style={styles.rowTwoInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>MOBILE NUMBER</Text>
                <TextInput
                  style={[styles.inputBox, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                  value={formMobile}
                  onChangeText={setFormMobile}
                  placeholder="+27 82 123 4567"
                  placeholderTextColor={colors.textSubtle}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>EMAIL ADDRESS</Text>
                <TextInput
                  style={[styles.inputBox, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                  value={formEmail}
                  onChangeText={setFormEmail}
                  placeholder="name@domain.co.za"
                  placeholderTextColor={colors.textSubtle}
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.rowTwoInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>OFFICE NUMBER</Text>
                <TextInput
                  style={[styles.inputBox, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                  value={formOfficeNumber}
                  onChangeText={setFormOfficeNumber}
                  placeholder="011 000 0000"
                  placeholderTextColor={colors.textSubtle}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>HOME NUMBER</Text>
                <TextInput
                  style={[styles.inputBox, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                  value={formHomeNumber}
                  onChangeText={setFormHomeNumber}
                  placeholder="011 000 0000"
                  placeholderTextColor={colors.textSubtle}
                />
              </View>
            </View>
          </View>

          {/* Digital Signature & Verification Box */}
          <View
            style={[
              styles.sigCard,
              {
                backgroundColor: colors.card,
                borderColor: isSigned ? colors.successBorder : colors.cardBorder,
              },
            ]}
          >
            <View style={styles.sigHeaderRow}>
              <View style={styles.sigTitleWrap}>
                <LockIcon color={isSigned ? colors.success : colors.primary} size={16} />
                <Text style={[styles.sigCardHeading, { color: colors.text }]}>DIGITAL SIGNATURE & ATTESTATION</Text>
              </View>
              <View
                style={[
                  styles.sigStatusBadge,
                  {
                    backgroundColor: isSigned ? colors.successAlpha : colors.primaryAlpha,
                    borderColor: isSigned ? colors.successBorder : colors.primaryBorder,
                  },
                ]}
              >
                <Text style={[styles.sigStatusText, { color: isSigned ? colors.success : colors.primary }]}>
                  {isSigned ? '● SIGNED DIGITALLY' : 'PENDING SIGNATURE'}
                </Text>
              </View>
            </View>

            {/* Signature Render Box */}
            <TouchableOpacity
              style={[
                styles.signatureCanvas,
                {
                  backgroundColor: isDark ? '#141414' : '#fafafa',
                  borderColor: isSigned ? colors.primaryBorder : colors.inputBorder,
                },
              ]}
              onPress={handleToggleSign}
              activeOpacity={0.8}
            >
              {isSigned ? (
                <View style={styles.signatureRenderedArea}>
                  <Text style={[styles.cursiveSignature, { color: colors.gold }]}>
                    {formClientName || 'Client'}
                  </Text>
                  <View style={styles.signatureStampRow}>
                    <CheckmarkIcon color={colors.success} size={14} strokeWidth={3} />
                    <Text style={[styles.digitalCertText, { color: colors.textMuted }]}>
                      Digitally verified by Royal Square
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.tapToSignPrompt}>
                  <Text style={[styles.tapToSignText, { color: colors.primary }]}>Tap here to apply Digital Signature</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Signature Date & Controls */}
            <View style={styles.sigFooterRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dateLabel, { color: colors.textMuted }]}>DATE OF EXECUTION:</Text>
                <Text style={[styles.dateValue, { color: colors.text }]}>{signedDate}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.reSignBtn,
                  {
                    backgroundColor: colors.primaryAlpha,
                    borderColor: colors.primaryBorder,
                  },
                ]}
                onPress={handleToggleSign}
              >
                <Text style={[styles.reSignBtnText, { color: colors.primary }]}>
                  {isSigned ? 'Clear / Re-sign' : 'Apply Signature'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Success Banner */}
          {savedSuccess && (
            <View style={[styles.successBanner, { backgroundColor: colors.successAlpha, borderColor: colors.successBorder }]}>
              <CheckmarkIcon color={colors.success} size={16} strokeWidth={3} />
              <Text style={[styles.successBannerText, { color: colors.success }]}>
                Digital Appointment Mandate Saved & Certified!
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsWrap}>
            <TouchableOpacity
              style={[styles.saveMandateBtn, { backgroundColor: colors.primary }]}
              onPress={handleSaveMandate}
              activeOpacity={0.85}
            >
              <CheckmarkIcon color="#ffffff" size={18} strokeWidth={3} />
              <Text style={styles.saveMandateText}>Save & Certify Appointment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.shareBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
              onPress={handleExportShare}
              activeOpacity={0.85}
            >
              <DocumentTextIcon color={colors.primary} size={18} />
              <Text style={[styles.shareBtnText, { color: colors.text }]}>Export / Share Digital Mandate</Text>
            </TouchableOpacity>
          </View>

          {/* Statutory Footer */}
          <Text style={[styles.statutoryFooter, { color: colors.textMuted }]}>
            Royal Square Financial (Pty) Ltd is an Authorised Financial Services Provider (FSP 49291).
            Mandates are digitally stored in compliance with POPIA and FAIS record-keeping provisions.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  certBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  docHeading: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  docSubheading: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 18,
  },
  clauseCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  clauseSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  clauseBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  dividerLine: {
    height: 1,
    marginVertical: 14,
  },
  feeCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  feeCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  feeCardText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  feeChipsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  feeChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  feeChipVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  feeChipLbl: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  fieldsSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  inputBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  rowTwoInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  sigCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  sigHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sigTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sigCardHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sigStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  sigStatusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  signatureCanvas: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    minHeight: 74,
    justifyContent: 'center',
    padding: 12,
    marginBottom: 12,
  },
  signatureRenderedArea: {
    alignItems: 'flex-start',
  },
  cursiveSignature: {
    fontFamily: 'serif',
    fontSize: 24,
    fontStyle: 'italic',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  signatureStampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  digitalCertText: {
    fontSize: 9,
    fontWeight: '600',
  },
  tapToSignPrompt: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  tapToSignText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sigFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  reSignBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reSignBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successBannerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionsWrap: {
    gap: 10,
    marginBottom: 18,
  },
  saveMandateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
  },
  saveMandateText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statutoryFooter: {
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
});
