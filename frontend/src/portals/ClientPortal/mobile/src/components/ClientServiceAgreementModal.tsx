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
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { RoyalSquareLogo } from './RoyalSquareLogo';
import {
  CheckmarkIcon,
  ShieldIcon,
  DocumentTextIcon,
  LockIcon,
} from './GrommetIcons';

export type ServiceChoice = 'YES' | 'NO' | 'N/A';

export interface ScopeItem {
  id: string;
  category: 'personal' | 'business' | 'other';
  title: string;
  description: string;
  defaultChoice: ServiceChoice;
}

const SCOPE_SERVICES: ScopeItem[] = [
  // PERSONAL (INDIVIDUALS)
  {
    id: 'p-1',
    category: 'personal',
    title: '1. Risk Cover – Personal Life Insurance Offering',
    description: 'Life Insurance including Death, Disability, Dread Disease, Retrenchment Cover, Income Protection, Funeral Cover, Child-Educator Benefits',
    defaultChoice: 'YES',
  },
  {
    id: 'p-2',
    category: 'personal',
    title: '2. Retirement Planning – Pre & Post-Retirement',
    description: 'Retirement Annuity, Living Annuity, Preservation Fund and Life Annuity, Government Employees Pension Fund (GEPF)',
    defaultChoice: 'YES',
  },
  {
    id: 'p-3',
    category: 'personal',
    title: '3. Medical Aid – Private Health Care Medical Aid',
    description: 'Gap Cover Insurance, Medical Insurance, Medical Aid',
    defaultChoice: 'YES',
  },
  {
    id: 'p-4',
    category: 'personal',
    title: '4. Short-Term Insurance – Personal Assets Insurance',
    description: 'Property/Building, Home Contents, Jewellery, Art & Antiques, Cars, Pleasure Crafts, Travel Insurance (Domestic & International), Ransom & Kidnapping',
    defaultChoice: 'YES',
  },
  {
    id: 'p-5',
    category: 'personal',
    title: '5. Investments – Personal Investment Portfolios',
    description: 'Unit Trusts, Endowments, Education Fund, Emergency Fund, Offshore Portfolios, Stokvels Investment, Personal Share Portfolio (JSE Listed Shares), Investment Clubs',
    defaultChoice: 'YES',
  },
  {
    id: 'p-6',
    category: 'personal',
    title: '6. Estate Planning – Fiduciary Services, Wills & Trusts',
    description: 'Inter-vivos Trusts, Testamentary Trusts, Wills, Estate Liquidity, Estate Tax',
    defaultChoice: 'YES',
  },

  // BUSINESS & CORPORATE
  {
    id: 'b-1',
    category: 'business',
    title: '1. Employee Benefits – Group Benefits',
    description: 'Group Life, Group Retirement Annuity, Pension/Provident Fund, Group Funeral Benefit, Group Medical Aid, Group Gap Cover',
    defaultChoice: 'NO',
  },
  {
    id: 'b-2',
    category: 'business',
    title: '2. Business Assurance – For Business Owners',
    description: 'Keyperson Insurance, Buy & Sell Agreement, Deferred Compensation Structuring, Contingent Liability Insurance, Business Overheads Insurance',
    defaultChoice: 'NO',
  },
  {
    id: 'b-3',
    category: 'business',
    title: '3. Short-Term Insurance – Commercial Asset Protection',
    description: 'Aviation, Marine, Goods-In-Transit, Engineering, Construction & Public Works, Transport, Liability, Special Risks, Cyber Risks, Plant, Premises, Fire & Business Interruption',
    defaultChoice: 'NO',
  },

  // OTHER SERVICES
  {
    id: 'o-1',
    category: 'other',
    title: '1. Non-Core Services – Personal / Individual',
    description: 'Budgeting & Cashflow Planning, Income Tax Returns, Ante-Nuptial Agreement, Real Estate & Property Services, Offshore Banking',
    defaultChoice: 'YES',
  },
];

interface ClientServiceAgreementModalProps {
  visible: boolean;
  onClose: () => void;
  clientName?: string;
  idNumber?: string;
}

export const ClientServiceAgreementModal: React.FC<ClientServiceAgreementModalProps> = ({
  visible,
  onClose,
  clientName = '',
  idNumber = '',
}) => {
  const { colors, isDark } = useTheme();

  const [formClientName, setFormClientName] = useState(clientName);
  const [formIdNumber, setFormIdNumber] = useState(idNumber);
  const [signedLocation, setSignedLocation] = useState('Sandton, Johannesburg');
  const [signedDate, setSignedDate] = useState('05 September 2026');
  const [isSigned, setIsSigned] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Scope of service selections (YES / NO / N/A)
  const [scopeChoices, setScopeChoices] = useState<Record<string, ServiceChoice>>(() => {
    const initial: Record<string, ServiceChoice> = {};
    SCOPE_SERVICES.forEach(s => {
      initial[s.id] = s.defaultChoice;
    });
    return initial;
  });

  const advisorName = 'QINISO THULANI NTULI';
  const registrationNo = '2009/022911/07';
  const faisLicenceNo = '29370';
  const securityHash = `RSF-AGREEMENT-SHA256-${faisLicenceNo}-${formIdNumber}`;

  const setChoice = (id: string, choice: ServiceChoice) => {
    setScopeChoices(prev => ({ ...prev, [id]: choice }));
  };

  const handleToggleSign = () => {
    setIsSigned(prev => !prev);
  };

  const handleSaveAgreement = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleExportShare = async () => {
    try {
      const selectedScope = SCOPE_SERVICES
        .filter(s => scopeChoices[s.id] === 'YES')
        .map(s => `• ${s.title}`)
        .join('\n');

      await Share.share({
        title: 'Client Service Agreement - Royal Square Financial',
        message: `CLIENT SERVICE AGREEMENT\nRoyal Square Financial (Pty) Ltd (Reg: ${registrationNo}, FAIS: ${faisLicenceNo})\n\nClient: ${formClientName}\nID: ${formIdNumber}\nSigned at: ${signedLocation} on ${signedDate}\n\nAgreed Services:\n${selectedScope}\n\nStatus: Digitally Signed & Certified (${securityHash})`,
      });
    } catch (e) {
      console.log('Share error', e);
    }
  };

  const activeServicesCount = Object.values(scopeChoices).filter(c => c === 'YES').length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        {/* Top Header */}
        <View style={[styles.topHeader, { backgroundColor: colors.backgroundElevated, borderBottomColor: colors.divider }]}>
          <View style={styles.headerBrandRow}>
            <RoyalSquareLogo size={28} />
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.brandTitle, { color: colors.text }]}>ROYAL SQUARE FINANCIAL</Text>
              <Text style={[styles.brandSub, { color: colors.gold }]}>FAIS Licence No. {faisLicenceNo} · Reg: {registrationNo}</Text>
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
          {/* Certificate Badge */}
          <View style={[styles.certBadge, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}>
            <ShieldIcon color={colors.primary} size={18} />
            <Text style={[styles.certBadgeText, { color: colors.primary }]}>
              STATUTORY FAIS CLIENT SERVICE AGREEMENT
            </Text>
          </View>

          {/* Agreement Title */}
          <Text style={[styles.docHeading, { color: colors.text }]}>
            CLIENT SERVICE AGREEMENT
          </Text>
          <Text style={[styles.docSubheading, { color: colors.textMuted }]}>
            Between ROYAL SQUARE FINANCIAL (PTY) LTD and the Client
          </Text>

          {/* Parties Identification Card */}
          <View
            style={[
              styles.partiesCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderLeftColor: colors.primary,
              },
            ]}
          >
            <Text style={[styles.cardTag, { color: colors.primary }]}>PARTIES TO THE AGREEMENT</Text>

            <View style={styles.partyBlock}>
              <Text style={[styles.partyRole, { color: colors.textMuted }]}>FINANCIAL SERVICES PROVIDER ('FSP')</Text>
              <Text style={[styles.partyName, { color: colors.text }]}>ROYAL SQUARE FINANCIAL (PTY) LTD</Text>
              <Text style={[styles.partyMeta, { color: colors.gold }]}>
                Reg No: {registrationNo} · FAIS Licence No: {faisLicenceNo}
              </Text>
              <Text style={[styles.partyMeta, { color: colors.textSecondary }]}>
                Represented by: {advisorName}
              </Text>
            </View>

            <View style={[styles.partyDivider, { backgroundColor: colors.divider }]} />

            <View style={styles.partyBlock}>
              <Text style={[styles.partyRole, { color: colors.textMuted }]}>THE CLIENT</Text>
              <View style={styles.clientFieldRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.fieldMiniLabel, { color: colors.textMuted }]}>CLIENT NAME</Text>
                  <TextInput
                    style={[styles.miniInput, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                    value={formClientName}
                    onChangeText={setFormClientName}
                    placeholder="Client Full Name"
                    placeholderTextColor={colors.textSubtle}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldMiniLabel, { color: colors.textMuted }]}>IDENTITY NUMBER</Text>
                  <TextInput
                    style={[styles.miniInput, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                    value={formIdNumber}
                    onChangeText={setFormIdNumber}
                    placeholder="RSA ID Number"
                    placeholderTextColor={colors.textSubtle}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Section 1 & 2: Appointment & Disclosures */}
          <View style={[styles.clauseCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.clauseNumTitle, { color: colors.text }]}>1. Appointment of FSP</Text>
            <Text style={[styles.clauseBodyText, { color: colors.textSecondary }]}>
              The client hereby appoints the FSP as a financial Advisor to render financial advice and or intermediary services as listed hereunder. This appointment is effective as of the date of signature of this agreement.
            </Text>

            <View style={[styles.innerDivider, { backgroundColor: colors.divider }]} />

            <Text style={[styles.clauseNumTitle, { color: colors.text }]}>2. Disclosures</Text>
            <Text style={[styles.clauseBodyText, { color: colors.textSecondary }]}>
              The Client acknowledges that a Contact Stage Disclosure letter, setting out the FSP's particulars as required by FAIS has been made available to him or her.
            </Text>
          </View>

          {/* Section 3: Scope of Services (Interactive Matrix) */}
          <View style={[styles.scopeSectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.scopeHeaderRow}>
              <View>
                <Text style={[styles.clauseNumTitle, { color: colors.text }]}>3. Scope of Services</Text>
                <Text style={[styles.scopeSub, { color: colors.textMuted }]}>
                  Select services authorized for recommendation and needs analysis
                </Text>
              </View>
              <View style={[styles.scopeCountBadge, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}>
                <Text style={[styles.scopeCountText, { color: colors.primary }]}>{activeServicesCount} Selected</Text>
              </View>
            </View>

            {/* Subheading: PERSONAL (INDIVIDUALS) */}
            <View style={[styles.categoryHeader, { backgroundColor: colors.primaryAlpha }]}>
              <Text style={[styles.categoryHeaderText, { color: colors.primary }]}>PERSONAL (INDIVIDUALS)</Text>
            </View>

            {SCOPE_SERVICES.filter(s => s.category === 'personal').map((item) => (
              <View key={item.id} style={[styles.serviceRow, { borderBottomColor: colors.divider }]}>
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.serviceDesc, { color: colors.textSecondary }]}>{item.description}</Text>
                </View>

                {/* Choice Pills: YES / NO / N/A */}
                <View style={styles.choiceGroup}>
                  {(['YES', 'NO', 'N/A'] as ServiceChoice[]).map((c) => {
                    const isSelected = scopeChoices[item.id] === c;
                    return (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.choiceBtn,
                          {
                            backgroundColor: isSelected
                              ? c === 'YES'
                                ? colors.primary
                                : isDark ? '#333333' : '#e2e6ea'
                              : 'transparent',
                            borderColor: isSelected ? colors.primary : colors.inputBorder,
                          },
                        ]}
                        onPress={() => setChoice(item.id, c)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.choiceBtnText,
                            {
                              color: isSelected
                                ? (c === 'YES' ? '#ffffff' : colors.text)
                                : colors.textMuted,
                              fontWeight: isSelected ? '800' : '600',
                            },
                          ]}
                        >
                          {c}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            {/* Subheading: BUSINESS & CORPORATE */}
            <View style={[styles.categoryHeader, { backgroundColor: colors.primaryAlpha, marginTop: 14 }]}>
              <Text style={[styles.categoryHeaderText, { color: colors.primary }]}>BUSINESS & CORPORATE</Text>
            </View>

            {SCOPE_SERVICES.filter(s => s.category === 'business').map((item) => (
              <View key={item.id} style={[styles.serviceRow, { borderBottomColor: colors.divider }]}>
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.serviceDesc, { color: colors.textSecondary }]}>{item.description}</Text>
                </View>

                <View style={styles.choiceGroup}>
                  {(['YES', 'NO', 'N/A'] as ServiceChoice[]).map((c) => {
                    const isSelected = scopeChoices[item.id] === c;
                    return (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.choiceBtn,
                          {
                            backgroundColor: isSelected
                              ? c === 'YES'
                                ? colors.primary
                                : isDark ? '#333333' : '#e2e6ea'
                              : 'transparent',
                            borderColor: isSelected ? colors.primary : colors.inputBorder,
                          },
                        ]}
                        onPress={() => setChoice(item.id, c)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.choiceBtnText,
                            {
                              color: isSelected
                                ? (c === 'YES' ? '#ffffff' : colors.text)
                                : colors.textMuted,
                              fontWeight: isSelected ? '800' : '600',
                            },
                          ]}
                        >
                          {c}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            {/* Subheading: OTHER SERVICES */}
            <View style={[styles.categoryHeader, { backgroundColor: colors.primaryAlpha, marginTop: 14 }]}>
              <Text style={[styles.categoryHeaderText, { color: colors.primary }]}>OTHER SERVICES</Text>
            </View>

            {SCOPE_SERVICES.filter(s => s.category === 'other').map((item) => (
              <View key={item.id} style={[styles.serviceRow, { borderBottomColor: colors.divider, borderBottomWidth: 0 }]}>
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.serviceDesc, { color: colors.textSecondary }]}>{item.description}</Text>
                </View>

                <View style={styles.choiceGroup}>
                  {(['YES', 'NO', 'N/A'] as ServiceChoice[]).map((c) => {
                    const isSelected = scopeChoices[item.id] === c;
                    return (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.choiceBtn,
                          {
                            backgroundColor: isSelected
                              ? c === 'YES'
                                ? colors.primary
                                : isDark ? '#333333' : '#e2e6ea'
                              : 'transparent',
                            borderColor: isSelected ? colors.primary : colors.inputBorder,
                          },
                        ]}
                        onPress={() => setChoice(item.id, c)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.choiceBtnText,
                            {
                              color: isSelected
                                ? (c === 'YES' ? '#ffffff' : colors.text)
                                : colors.textMuted,
                              fontWeight: isSelected ? '800' : '600',
                            },
                          ]}
                        >
                          {c}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            <Text style={[styles.referralNote, { color: colors.textMuted }]}>
              Should the client require advice and /or services not provided by the FSP, the FSP will endeavour to refer the client as appropriate e.g. accountant; lawyer.
            </Text>
          </View>

          {/* Section 4, 5, 6, 7 & 8: Legal Clauses */}
          <View style={[styles.clauseCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.clauseNumTitle, { color: colors.text }]}>4. Authorisation to Access Information</Text>
            <Text style={[styles.clauseBodyText, { color: colors.textSecondary }]}>
              The client consents that the FSP may access any of the client’s financial information from relevant product providers and third parties to enable the FSP to assess the client’s financial affairs and to adequately and professionally render a financial planning service, including a proper needs analysis.
            </Text>

            <View style={[styles.innerDivider, { backgroundColor: colors.divider }]} />

            <Text style={[styles.clauseNumTitle, { color: colors.text }]}>5. Client Confidentiality</Text>
            <Text style={[styles.clauseBodyText, { color: colors.textSecondary }]}>
              The FSP acknowledges that all information provided by the Client will be kept confidential and only disclosed to third parties with written consent, subject to statutory Compliance Officer review and court/legal obligations.
            </Text>

            <View style={[styles.innerDivider, { backgroundColor: colors.divider }]} />

            <Text style={[styles.clauseNumTitle, { color: colors.text }]}>6. Representative</Text>
            <Text style={[styles.clauseBodyText, { color: colors.textSecondary }]}>
              The Client agrees that allocated representatives appointed by the FSP shall render the service on behalf of the FSP. If the Client requests reassignment, the FSP shall allocate another representative in consultation with the Client.
            </Text>

            <View style={[styles.innerDivider, { backgroundColor: colors.divider }]} />

            <Text style={[styles.clauseNumTitle, { color: colors.text }]}>7. FSP's Obligations</Text>
            <Text style={[styles.clauseBodyText, { color: colors.textSecondary }]}>
              The FSP undertakes to act honestly, fairly, and with due skill, care, and diligence. The FSP shall have no authority to enter into contractual obligations, incur liability, or effect portfolio switches without prior written consent.
            </Text>

            <View style={[styles.innerDivider, { backgroundColor: colors.divider }]} />

            <Text style={[styles.clauseNumTitle, { color: colors.text }]}>8. Client's Obligations</Text>
            <Text style={[styles.clauseBodyText, { color: colors.textSecondary }]}>
              The Client agrees to furnish required information within a reasonable period, disclose all material facts accurately, and promptly notify the FSP of any changes in financial situation or objectives.
            </Text>
          </View>

          {/* Section 9: Remuneration Schedule */}
          <View
            style={[
              styles.remunerationCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderLeftColor: colors.primary,
              },
            ]}
          >
            <Text style={[styles.clauseNumTitle, { color: colors.text }]}>9. Remuneration & Fee Structure</Text>

            {/* 9.1 Commission */}
            <View style={styles.feeSubBlock}>
              <Text style={[styles.feeSubTitle, { color: colors.primary }]}>9.1 Commission (FSCA Regulated)</Text>
              <Text style={[styles.clauseBodyText, { color: colors.textSecondary }]}>
                Payment from product providers for introduction of the Client to financial products. Commission on Insurance Products is regulated and set by the Financial Sector Conduct Authority (FSCA).
              </Text>
            </View>

            {/* 9.2 Asset-Based Fee */}
            <View style={styles.feeSubBlock}>
              <Text style={[styles.feeSubTitle, { color: colors.primary }]}>9.2 Asset-Based Fee (Investment Portfolios)</Text>
              <Text style={[styles.clauseBodyText, { color: colors.textSecondary }]}>
                Initial and ongoing fee expressed as a percentage of assets invested. Royal Square Financial has capped commission on investment business at <Text style={{ fontWeight: '800', color: colors.gold }}>3.00%</Text> for all new business.
              </Text>
            </View>

            {/* 9.3 Time-based Fee */}
            <View style={styles.feeSubBlock}>
              <Text style={[styles.feeSubTitle, { color: colors.primary }]}>9.3 Time-Based Consultation & Retainer</Text>
              <Text style={[styles.clauseBodyText, { color: colors.textSecondary }]}>
                Consultation fees: <Text style={{ fontWeight: '800', color: colors.text }}>R1,500 ex. VAT / hour</Text>.
              </Text>

              <View style={[styles.timeScheduleGrid, { backgroundColor: isDark ? '#181818' : '#f5f7f9', borderColor: colors.cardBorder }]}>
                <View style={styles.timeScheduleRow}>
                  <Text style={[styles.timeTaskText, { color: colors.text }]}>• Mandatory Annual Client Review</Text>
                  <Text style={[styles.timeHoursText, { color: colors.gold }]}>1 hour</Text>
                </View>
                <View style={styles.timeScheduleRow}>
                  <Text style={[styles.timeTaskText, { color: colors.text }]}>• Financial Needs Analysis & Report</Text>
                  <Text style={[styles.timeHoursText, { color: colors.gold }]}>3 hours (min)</Text>
                </View>
                <View style={styles.timeScheduleRow}>
                  <Text style={[styles.timeTaskText, { color: colors.text }]}>• Financial Plan Implementation</Text>
                  <Text style={[styles.timeHoursText, { color: colors.gold }]}>2 hours (min)</Text>
                </View>
                <View style={styles.timeScheduleRow}>
                  <Text style={[styles.timeTaskText, { color: colors.text }]}>• Ad-hoc Consultation</Text>
                  <Text style={[styles.timeHoursText, { color: colors.gold }]}>1 hour</Text>
                </View>
              </View>

              <View style={[styles.retainerBox, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}>
                <Text style={[styles.retainerTitle, { color: colors.primary }]}>MONTHLY ADVICE RETAINER OPTION</Text>
                <Text style={[styles.retainerText, { color: colors.textSecondary }]}>
                  <Text style={{ fontWeight: '800', color: colors.text }}>R500 ex. VAT / month</Text> fixed debit order allowing consultations throughout the year as needed (12-Month Minimum Term).
                </Text>
              </View>
            </View>
          </View>

          {/* Section 10 & 11: Termination & Review */}
          <View style={[styles.clauseCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.clauseNumTitle, { color: colors.text }]}>10. Termination</Text>
            <Text style={[styles.clauseBodyText, { color: colors.textSecondary }]}>
              The FSP's appointment shall remain in force until terminated by either Party on giving the other Party <Text style={{ fontWeight: '800', color: colors.text }}>30 days' written notice</Text> of termination without requiring reasons.
            </Text>

            <View style={[styles.innerDivider, { backgroundColor: colors.divider }]} />

            <Text style={[styles.clauseNumTitle, { color: colors.text }]}>11. Review</Text>
            <Text style={[styles.clauseBodyText, { color: colors.textSecondary }]}>
              The parties agree that the financial planning for the client shall be reviewed annually, unless specifically requested earlier by the client.
            </Text>
          </View>

          {/* Execution & Dual Signatures Box */}
          <View
            style={[
              styles.executionCard,
              {
                backgroundColor: colors.card,
                borderColor: isSigned ? colors.successBorder : colors.cardBorder,
              },
            ]}
          >
            <View style={styles.execHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <LockIcon color={isSigned ? colors.success : colors.primary} size={16} />
                <Text style={[styles.execHeading, { color: colors.text }]}>EXECUTION & DIGITAL SIGNATURES</Text>
              </View>
              <View style={[styles.sigStatusBadge, { backgroundColor: isSigned ? colors.successAlpha : colors.primaryAlpha, borderColor: isSigned ? colors.successBorder : colors.primaryBorder }]}>
                <Text style={[styles.sigStatusText, { color: isSigned ? colors.success : colors.primary }]}>
                  {isSigned ? '● DIGITALLY ATTESTED' : 'PENDING SIGNATURE'}
                </Text>
              </View>
            </View>

            {/* Execution Location & Date Inputs */}
            <View style={styles.execLocationRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.fieldMiniLabel, { color: colors.textMuted }]}>SIGNED AT (LOCATION)</Text>
                <TextInput
                  style={[styles.miniInput, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                  value={signedLocation}
                  onChangeText={setSignedLocation}
                  placeholder="e.g. Sandton, Johannesburg"
                  placeholderTextColor={colors.textSubtle}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldMiniLabel, { color: colors.textMuted }]}>DATE OF EXECUTION</Text>
                <TextInput
                  style={[styles.miniInput, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                  value={signedDate}
                  onChangeText={setSignedDate}
                  placeholder="05 September 2026"
                  placeholderTextColor={colors.textSubtle}
                />
              </View>
            </View>

            {/* Dual Signature Blocks: Client & Advisor */}
            <View style={styles.dualSignaturesRow}>
              {/* Client Signature */}
              <TouchableOpacity
                style={[
                  styles.sigBox,
                  {
                    backgroundColor: isDark ? '#141414' : '#fafafa',
                    borderColor: isSigned ? colors.primaryBorder : colors.inputBorder,
                  },
                ]}
                onPress={handleToggleSign}
                activeOpacity={0.8}
              >
                <Text style={[styles.sigBoxLabel, { color: colors.textMuted }]}>CLIENT SIGNATURE</Text>
                {isSigned ? (
                  <View>
                    <Text style={[styles.cursiveText, { color: colors.gold }]}>{formClientName}</Text>
                    <View style={styles.stampRow}>
                      <CheckmarkIcon color={colors.success} size={12} strokeWidth={3} />
                      <Text style={[styles.stampText, { color: colors.textMuted }]}>Digitally Signed</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={[styles.signPrompt, { color: colors.primary }]}>Tap to Sign</Text>
                )}
              </TouchableOpacity>

              {/* Advisor Signature */}
              <View
                style={[
                  styles.sigBox,
                  {
                    backgroundColor: isDark ? '#141414' : '#fafafa',
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <Text style={[styles.sigBoxLabel, { color: colors.textMuted }]}>ADVISOR SIGNATURE</Text>
                <Text style={[styles.cursiveText, { color: colors.primary }]}>{advisorName}</Text>
                <View style={styles.stampRow}>
                  <CheckmarkIcon color={colors.primary} size={12} strokeWidth={3} />
                  <Text style={[styles.stampText, { color: colors.gold }]}>FSP 29370 Mandated</Text>
                </View>
              </View>
            </View>

            {/* Security Hash Stamp */}
            <Text style={[styles.securityHashText, { color: colors.textMuted }]}>
              Certificate Verification Hash: {securityHash}
            </Text>
          </View>

          {/* Success Banner */}
          {savedSuccess && (
            <View style={[styles.successBanner, { backgroundColor: colors.successAlpha, borderColor: colors.successBorder }]}>
              <CheckmarkIcon color={colors.success} size={16} strokeWidth={3} />
              <Text style={[styles.successBannerText, { color: colors.success }]}>
                Client Service Agreement Certified & Recorded!
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsWrap}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSaveAgreement}
              activeOpacity={0.85}
            >
              <CheckmarkIcon color="#ffffff" size={18} strokeWidth={3} />
              <Text style={styles.saveBtnText}>Save & Certify Agreement</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={handleExportShare}
              activeOpacity={0.85}
            >
              <DocumentTextIcon color={colors.primary} size={18} />
              <Text style={[styles.shareBtnText, { color: colors.text }]}>Export / Share Agreement</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.statutoryFooter, { color: colors.textMuted }]}>
            Royal Square Financial (Pty) Ltd · Reg No: 2009/022911/07 · FAIS Licence Number 29370.
            This agreement is governed by the laws of the Republic of South Africa.
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
  partiesCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  partyBlock: {
    gap: 3,
  },
  partyRole: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  partyName: {
    fontSize: 14,
    fontWeight: '800',
  },
  partyMeta: {
    fontSize: 11,
    fontWeight: '600',
  },
  partyDivider: {
    height: 1,
    marginVertical: 12,
  },
  clientFieldRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  fieldMiniLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  miniInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
  },
  clauseCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  clauseNumTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  clauseBodyText: {
    fontSize: 12,
    lineHeight: 18,
  },
  innerDivider: {
    height: 1,
    marginVertical: 12,
  },
  scopeSectionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  scopeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  scopeSub: {
    fontSize: 11,
    marginTop: 2,
  },
  scopeCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  scopeCountText: {
    fontSize: 10,
    fontWeight: '800',
  },
  categoryHeader: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  categoryHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  serviceRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  serviceInfo: {
    gap: 2,
  },
  serviceTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  serviceDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  choiceGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  choiceBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  choiceBtnText: {
    fontSize: 11,
  },
  referralNote: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 14,
    fontStyle: 'italic',
  },
  remunerationCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  feeSubBlock: {
    marginTop: 10,
    gap: 4,
  },
  feeSubTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  timeScheduleGrid: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
    gap: 6,
  },
  timeScheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeTaskText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timeHoursText: {
    fontSize: 11,
    fontWeight: '800',
  },
  retainerBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    gap: 2,
  },
  retainerTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  retainerText: {
    fontSize: 11,
    lineHeight: 16,
  },
  executionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  execHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  execHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
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
  },
  execLocationRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dualSignaturesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  sigBox: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 10,
    minHeight: 80,
    justifyContent: 'space-between',
  },
  sigBoxLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cursiveText: {
    fontFamily: 'serif',
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '700',
    marginVertical: 4,
  },
  stampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stampText: {
    fontSize: 9,
    fontWeight: '600',
  },
  signPrompt: {
    fontSize: 12,
    fontWeight: '700',
    marginVertical: 10,
  },
  securityHashText: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 4,
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
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
  },
  saveBtnText: {
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
