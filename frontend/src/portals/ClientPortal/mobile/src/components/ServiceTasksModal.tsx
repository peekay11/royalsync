import React, { useState, useEffect } from 'react';
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
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ApiService } from '../services/api';
import {
  DocumentTextIcon,
  ShieldIcon,
  CalendarIcon,
  UserIcon,
  IdCardIcon,
} from './GrommetIcons';

interface ServiceTasksModalProps {
  visible: boolean;
  onClose: () => void;
  onTaskSubmitted?: () => void;
}

type TaskType =
  | 'menu'
  | 'change_of_address'
  | 'change_of_bank_details'
  | 'request_policy_document'
  | 'request_border_letter'
  | 'request_irp5'
  | 'request_consultation'
  | 'client_financial_statement'
  | 'view_history';

export const ServiceTasksModal: React.FC<ServiceTasksModalProps> = ({
  visible,
  onClose,
  onTaskSubmitted,
}) => {
  const { colors, isDark } = useTheme();
  const [activeScreen, setActiveScreen] = useState<TaskType>('menu');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pastRequests, setPastRequests] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Address form
  const [addressLine1, setAddressLine1] = useState('');
  const [suburb, setSuburb] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('Gauteng');
  const [postalCode, setPostalCode] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('Immediate');

  // Bank details form
  const [bankName, setBankName] = useState('Standard Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('Cheque');
  const [branchCode, setBranchCode] = useState('051001');
  const [accountHolder, setAccountHolder] = useState('');

  // Policy doc form
  const [policyDocType, setPolicyDocType] = useState('Schedule & Certificate of Cover');
  const [policyNumber, setPolicyNumber] = useState('');
  const [docNotes, setDocNotes] = useState('');

  // Border letter form
  const [vehicleReg, setVehicleReg] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('Mozambique');
  const [departureDate, setDepartureDate] = useState('2026-09-15');
  const [returnDate, setReturnDate] = useState('2026-09-25');
  const [driverName, setDriverName] = useState('');

  // IRP5 / IT3b form
  const [taxYear, setTaxYear] = useState('2025/2026');
  const [institution, setInstitution] = useState('Sanlam Glacier');
  const [certificateType, setCertificateType] = useState('IRP5 / IT3(a) & IT3(b)');

  // Consultation form
  const [consultType, setConsultType] = useState('Portfolio & Risk Strategy Review');
  const [consultDate, setConsultDate] = useState('2026-09-12');
  const [consultTime, setConsultTime] = useState('10:00 AM');
  const [consultFormat, setConsultFormat] = useState('Video Call (Microsoft Teams)');
  const [consultAgenda, setConsultAgenda] = useState('');

  // Financial statement form
  const [salaryIncome, setSalaryIncome] = useState('65000');
  const [businessIncome, setBusinessIncome] = useState('15000');
  const [investIncome, setInvestIncome] = useState('5500');
  const [bondMortgage, setBondMortgage] = useState('18000');
  const [vehicleFinance, setVehicleFinance] = useState('8500');
  const [livingExpenses, setLivingExpenses] = useState('22000');
  const [primaryPropertyVal, setPrimaryPropertyVal] = useState('2800000');
  const [vehiclesVal, setVehiclesVal] = useState('750000');
  const [investmentsVal, setInvestmentsVal] = useState('1450000');
  const [mortgageDebt, setMortgageDebt] = useState('1400000');
  const [vehicleDebt, setVehicleDebt] = useState('280000');
  const [otherDebt, setOtherDebt] = useState('45000');

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await ApiService.getServiceRequests();
      setPastRequests(data || []);
    } catch {
      setPastRequests([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setActiveScreen('menu');
      setSuccessMsg(null);
      fetchHistory();
    }
  }, [visible]);

  const handleSubmit = async (type: string, title: string, payload: any) => {
    setSubmitting(true);
    try {
      const res = await ApiService.createServiceRequest({
        request_type: type,
        title,
        payload,
      });
      setSuccessMsg(res.message || 'Service request processed successfully and recorded in real-time.');
      fetchHistory();
      if (onTaskSubmitted) onTaskSubmitted();
      setTimeout(() => {
        setSuccessMsg(null);
        setActiveScreen('menu');
      }, 2500);
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Failed to submit service request');
    } finally {
      setSubmitting(false);
    }
  };

  const menuItems = [
    {
      id: 'change_of_address',
      title: 'Change of Address',
      sub: 'Update residential, postal, & FICA proof of address',
      tag: 'FAIS / FICA Compliant',
      icon: '🏠',
    },
    {
      id: 'change_of_bank_details',
      title: 'Change of Bank Details',
      sub: 'Update debit order & claims payout mandate',
      tag: 'Direct Banking Sync',
      icon: '💳',
    },
    {
      id: 'request_policy_document',
      title: 'Request Policy Document',
      sub: 'Download policy schedules, endorsements & pack',
      tag: 'Instant Certificate',
      icon: '📄',
    },
    {
      id: 'request_border_letter',
      title: 'Request Border Letter',
      sub: 'Cross-border SADC vehicle travel insurance certificate',
      tag: 'Customs Ready',
      icon: '🚗',
    },
    {
      id: 'request_irp5',
      title: 'Request IRP5 / IT3 Tax Pack',
      sub: 'SARS tax certificate for RA & endowments',
      tag: 'eFiling Compliant',
      icon: '📑',
    },
    {
      id: 'request_consultation',
      title: 'Request a Consultation',
      sub: 'Book one-on-one session with your certified adviser',
      tag: 'Direct Calendar',
      icon: '🤝',
    },
    {
      id: 'client_financial_statement',
      title: 'Balance Sheet & Income Statement',
      sub: 'Comprehensive net worth, asset & cashflow statement',
      tag: 'Wealth Analytics',
      icon: '📊',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: isDark ? '#262626' : '#e5e7eb' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>
                {activeScreen === 'menu' ? 'Service Tasks & Requests' : 'Royal Sync Service Hub'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {activeScreen === 'menu'
                  ? 'Execute real-time client tasks and administrative actions'
                  : `Active Request: ${activeScreen.replace(/_/g, ' ').toUpperCase()}`}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={activeScreen === 'menu' ? onClose : () => setActiveScreen('menu')}>
              <Text style={[styles.closeBtnText, { color: colors.primary }]}>{activeScreen === 'menu' ? '✕' : '← Back'}</Text>
            </TouchableOpacity>
          </View>

          {/* Success Banner */}
          {successMsg && (
            <View style={[styles.successBanner, { backgroundColor: colors.successAlpha, borderColor: colors.success }]}>
              <Text style={[styles.successText, { color: colors.success }]}>✓ {successMsg}</Text>
            </View>
          )}

          {/* Body Content */}
          <ScrollView contentContainerStyle={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {activeScreen === 'menu' && (
              <View>
                <View style={styles.historyBtnRow}>
                  <TouchableOpacity
                    style={[styles.historyPill, { backgroundColor: colors.hoverBackground, borderColor: colors.cardBorder }]}
                    onPress={() => setActiveScreen('view_history')}
                  >
                    <Text style={[styles.historyPillText, { color: colors.primary }]}>
                      📋 View My Request History ({pastRequests.length})
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.tasksGrid}>
                  {menuItems.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.taskCard, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', borderColor: colors.cardBorder }]}
                      onPress={() => setActiveScreen(item.id as TaskType)}
                    >
                      <View style={styles.taskCardTop}>
                        <Text style={styles.taskIcon}>{item.icon}</Text>
                        <View style={[styles.tagBadge, { backgroundColor: colors.primaryAlpha }]}>
                          <Text style={[styles.tagText, { color: colors.primary }]}>{item.tag}</Text>
                        </View>
                      </View>
                      <Text style={[styles.taskTitle, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[styles.taskDesc, { color: colors.textSecondary }]}>{item.sub}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* TASK 1: CHANGE OF ADDRESS */}
            {activeScreen === 'change_of_address' && (
              <View style={styles.formContainer}>
                <Text style={[styles.formHeader, { color: colors.text }]}>Change of Residential & Postal Address</Text>
                <Text style={[styles.formSub, { color: colors.textSecondary }]}>
                  Updates will synchronize across your insurance schedule and policy records immediately.
                </Text>

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Street Address</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                  placeholder="e.g. 14 Sovereign Crest, Sandhurst"
                  placeholderTextColor={colors.textMuted}
                  value={addressLine1}
                  onChangeText={setAddressLine1}
                />

                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Suburb</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                      placeholder="e.g. Sandton"
                      placeholderTextColor={colors.textMuted}
                      value={suburb}
                      onChangeText={setSuburb}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>City</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                      placeholder="e.g. Johannesburg"
                      placeholderTextColor={colors.textMuted}
                      value={city}
                      onChangeText={setCity}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Province</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                      placeholder="Gauteng"
                      placeholderTextColor={colors.textMuted}
                      value={province}
                      onChangeText={setProvince}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Postal Code</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                      placeholder="2196"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={postalCode}
                      onChangeText={setPostalCode}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  disabled={submitting || !addressLine1}
                  onPress={() =>
                    handleSubmit('change_of_address', 'Change of Address Request', {
                      addressLine1,
                      suburb,
                      city,
                      province,
                      postalCode,
                      effectiveDate,
                    })
                  }
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Confirm & Update Address</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* TASK 2: CHANGE OF BANK DETAILS */}
            {activeScreen === 'change_of_bank_details' && (
              <View style={styles.formContainer}>
                <Text style={[styles.formHeader, { color: colors.text }]}>Change of Banking Details</Text>
                <Text style={[styles.formSub, { color: colors.textSecondary }]}>
                  Updates debit order deduction and claims payout mandates.
                </Text>

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Bank Name</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                  value={bankName}
                  onChangeText={setBankName}
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Account Number</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                  placeholder="e.g. 10189472910"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                />

                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Account Type</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                      value={accountType}
                      onChangeText={setAccountType}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Branch Code</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                      value={branchCode}
                      onChangeText={setBranchCode}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Account Holder Name</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                  placeholder="Full name matching ID"
                  placeholderTextColor={colors.textMuted}
                  value={accountHolder}
                  onChangeText={setAccountHolder}
                />

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  disabled={submitting || !accountNumber}
                  onPress={() =>
                    handleSubmit('change_of_bank_details', 'Change of Bank Details Request', {
                      bankName,
                      accountNumber,
                      accountType,
                      branchCode,
                      accountHolder,
                    })
                  }
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Bank Mandate</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* TASK 3: REQUEST POLICY DOCUMENT */}
            {activeScreen === 'request_policy_document' && (
              <View style={styles.formContainer}>
                <Text style={[styles.formHeader, { color: colors.text }]}>Request Policy Document / Schedule</Text>
                <Text style={[styles.formSub, { color: colors.textSecondary }]}>
                  Request official underwriter policy wordings, schedules, or confirmation of cover.
                </Text>

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Document Type</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                  value={policyDocType}
                  onChangeText={setPolicyDocType}
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Policy Number (Optional)</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                  placeholder="e.g. POL-SAN-883019 (leave blank for all)"
                  placeholderTextColor={colors.textMuted}
                  value={policyNumber}
                  onChangeText={setPolicyNumber}
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Specific Requirements / Notes</Text>
                <TextInput
                  style={[styles.input, { height: 80, color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                  placeholder="e.g. Please include latest endorsement for home contents"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  value={docNotes}
                  onChangeText={setDocNotes}
                />

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  disabled={submitting}
                  onPress={() =>
                    handleSubmit('request_policy_document', `Policy Doc: ${policyDocType}`, {
                      documentType: policyDocType,
                      policyNumber: policyNumber || 'All Active Policies',
                      notes: docNotes,
                    })
                  }
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Document Request</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* TASK 4: REQUEST BORDER LETTER */}
            {activeScreen === 'request_border_letter' && (
              <View style={styles.formContainer}>
                <Text style={[styles.formHeader, { color: colors.text }]}>Cross-Border Vehicle Travel Letter</Text>
                <Text style={[styles.formSub, { color: colors.textSecondary }]}>
                  Official letter confirming comprehensive insurance cover across SADC borders (e.g. Botswana, Mozambique, Zimbabwe, Namibia, Eswatini).
                </Text>

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Vehicle Registration</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                  placeholder="e.g. JH 88 GP"
                  placeholderTextColor={colors.textMuted}
                  value={vehicleReg}
                  onChangeText={setVehicleReg}
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Destination Country</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                  value={destinationCountry}
                  onChangeText={setDestinationCountry}
                />

                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Departure Date</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                      value={departureDate}
                      onChangeText={setDepartureDate}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Return Date</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                      value={returnDate}
                      onChangeText={setReturnDate}
                    />
                  </View>
                </View>

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Designated Driver Name</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                  placeholder="Full name as on driving licence"
                  placeholderTextColor={colors.textMuted}
                  value={driverName}
                  onChangeText={setDriverName}
                />

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  disabled={submitting || !vehicleReg}
                  onPress={() =>
                    handleSubmit('request_border_letter', `Border Letter - ${destinationCountry}`, {
                      vehicleReg,
                      destinationCountry,
                      departureDate,
                      returnDate,
                      driverName,
                    })
                  }
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Generate Border Letter</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* TASK 5: REQUEST IRP5 / IT3 */}
            {activeScreen === 'request_irp5' && (
              <View style={styles.formContainer}>
                <Text style={[styles.formHeader, { color: colors.text }]}>Request SARS IRP5 / IT3 Tax Pack</Text>
                <Text style={[styles.formSub, { color: colors.textSecondary }]}>
                  Request tax deduction and interest/dividend certificates from Glacier, Allan Gray, Ninety One, Old Mutual, etc.
                </Text>

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Tax Assessment Year</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                  value={taxYear}
                  onChangeText={setTaxYear}
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Investment Institution</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                  value={institution}
                  onChangeText={setInstitution}
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Certificate Type</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                  value={certificateType}
                  onChangeText={setCertificateType}
                />

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  disabled={submitting}
                  onPress={() =>
                    handleSubmit('request_irp5', `Tax Pack: ${taxYear} (${institution})`, {
                      taxYear,
                      institution,
                      certificateType,
                    })
                  }
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Request Tax Pack</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* TASK 6: REQUEST CONSULTATION */}
            {activeScreen === 'request_consultation' && (
              <View style={styles.formContainer}>
                <Text style={[styles.formHeader, { color: colors.text }]}>Book Adviser Consultation</Text>
                <Text style={[styles.formSub, { color: colors.textSecondary }]}>
                  Schedule a private session with your accredited CFP® financial planner.
                </Text>

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Consultation Topic</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                  value={consultType}
                  onChangeText={setConsultType}
                />

                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Preferred Date</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                      value={consultDate}
                      onChangeText={setConsultDate}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Preferred Time</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                      value={consultTime}
                      onChangeText={setConsultTime}
                    />
                  </View>
                </View>

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Meeting Format</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                  value={consultFormat}
                  onChangeText={setConsultFormat}
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Discussion Points / Agenda</Text>
                <TextInput
                  style={[styles.input, { height: 80, color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                  placeholder="e.g. Retirement projection, estate planning, offshore diversification"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  value={consultAgenda}
                  onChangeText={setConsultAgenda}
                />

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  disabled={submitting}
                  onPress={() =>
                    handleSubmit('request_consultation', `Adviser Session: ${consultType}`, {
                      consultType,
                      consultDate,
                      consultTime,
                      consultFormat,
                      agenda: consultAgenda,
                    })
                  }
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Confirm Consultation Request</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* TASK 7: BALANCE SHEET & INCOME STATEMENT */}
            {activeScreen === 'client_financial_statement' && (
              <View style={styles.formContainer}>
                <Text style={[styles.formHeader, { color: colors.text }]}>Balance Sheet & Income Statement</Text>
                <Text style={[styles.formSub, { color: colors.textSecondary }]}>
                  Comprehensive financial overview calculating net worth, debt-to-asset ratio, and monthly disposable surplus.
                </Text>

                {/* Net worth summary card */}
                {(() => {
                  const totalAssets =
                    (parseFloat(primaryPropertyVal) || 0) +
                    (parseFloat(vehiclesVal) || 0) +
                    (parseFloat(investmentsVal) || 0);
                  const totalLiabilities =
                    (parseFloat(mortgageDebt) || 0) +
                    (parseFloat(vehicleDebt) || 0) +
                    (parseFloat(otherDebt) || 0);
                  const netWorth = totalAssets - totalLiabilities;
                  const totalIncome =
                    (parseFloat(salaryIncome) || 0) +
                    (parseFloat(businessIncome) || 0) +
                    (parseFloat(investIncome) || 0);
                  const totalExpenses =
                    (parseFloat(bondMortgage) || 0) +
                    (parseFloat(vehicleFinance) || 0) +
                    (parseFloat(livingExpenses) || 0);
                  const surplus = totalIncome - totalExpenses;

                  return (
                    <View style={[styles.calcCard, { backgroundColor: colors.hoverBackground, borderColor: colors.cardBorder }]}>
                      <View style={styles.calcRow}>
                        <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Estimated Net Worth:</Text>
                        <Text style={[styles.calcVal, { color: colors.gold }]}>
                          R {netWorth.toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.calcRow}>
                        <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Monthly Net Surplus:</Text>
                        <Text style={[styles.calcVal, { color: colors.success }]}>
                          +R {surplus.toLocaleString()}/mo
                        </Text>
                      </View>
                    </View>
                  );
                })()}

                <Text style={[styles.sectionDivider, { color: colors.primary }]}>1. MONTHLY INCOME (ZAR)</Text>
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Salary / Remuneration</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                      keyboardType="numeric"
                      value={salaryIncome}
                      onChangeText={setSalaryIncome}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Business / Dividend</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                      keyboardType="numeric"
                      value={businessIncome}
                      onChangeText={setBusinessIncome}
                    />
                  </View>
                </View>

                <Text style={[styles.sectionDivider, { color: colors.primary }]}>2. ASSETS & INVESTMENTS (ZAR)</Text>
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Primary Property Value</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                      keyboardType="numeric"
                      value={primaryPropertyVal}
                      onChangeText={setPrimaryPropertyVal}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Investments & Portfolio</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                      keyboardType="numeric"
                      value={investmentsVal}
                      onChangeText={setInvestmentsVal}
                    />
                  </View>
                </View>

                <Text style={[styles.sectionDivider, { color: colors.primary }]}>3. LIABILITIES & DEBT (ZAR)</Text>
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mortgage Balance</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                      keyboardType="numeric"
                      value={mortgageDebt}
                      onChangeText={setMortgageDebt}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Vehicle Finance Balance</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: isDark ? '#141414' : '#fff' }]}
                      keyboardType="numeric"
                      value={vehicleDebt}
                      onChangeText={setVehicleDebt}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  disabled={submitting}
                  onPress={() => {
                    const totalAssets =
                      (parseFloat(primaryPropertyVal) || 0) +
                      (parseFloat(vehiclesVal) || 0) +
                      (parseFloat(investmentsVal) || 0);
                    const totalLiabilities =
                      (parseFloat(mortgageDebt) || 0) +
                      (parseFloat(vehicleDebt) || 0) +
                      (parseFloat(otherDebt) || 0);
                    const netWorth = totalAssets - totalLiabilities;
                    const totalIncome =
                      (parseFloat(salaryIncome) || 0) +
                      (parseFloat(businessIncome) || 0) +
                      (parseFloat(investIncome) || 0);
                    const totalExpenses =
                      (parseFloat(bondMortgage) || 0) +
                      (parseFloat(vehicleFinance) || 0) +
                      (parseFloat(livingExpenses) || 0);

                    handleSubmit('client_financial_statement', 'Client Balance Sheet & Financial Statement', {
                      salaryIncome,
                      businessIncome,
                      investIncome,
                      totalMonthlyIncome: totalIncome,
                      totalMonthlyExpenses: totalExpenses,
                      monthlySurplus: totalIncome - totalExpenses,
                      primaryPropertyVal,
                      vehiclesVal,
                      investmentsVal,
                      totalAssets,
                      mortgageDebt,
                      vehicleDebt,
                      otherDebt,
                      totalLiabilities,
                      netWorth,
                    });
                  }}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Save & Generate Verified Statement</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* SCREEN: VIEW HISTORY */}
            {activeScreen === 'view_history' && (
              <View style={styles.formContainer}>
                <Text style={[styles.formHeader, { color: colors.text }]}>My Service Requests & Tasks</Text>
                <Text style={[styles.formSub, { color: colors.textSecondary }]}>
                  Live status tracking for requests submitted to Royal Square Financial Services.
                </Text>

                {loadingHistory ? (
                  <ActivityIndicator style={{ marginVertical: 20 }} color={colors.primary} />
                ) : pastRequests.length === 0 ? (
                  <View style={[styles.emptyBox, { borderColor: colors.cardBorder }]}>
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>No service requests logged yet.</Text>
                  </View>
                ) : (
                  pastRequests.map((req, idx) => (
                    <View
                      key={req.id || idx}
                      style={[styles.historyCard, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', borderColor: colors.cardBorder }]}
                    >
                      <View style={styles.historyCardHeader}>
                        <Text style={[styles.historyRef, { color: colors.gold }]}>
                          {req.reference_id || `SR-2026-${String(idx + 1).padStart(4, '0')}`}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                req.status === 'completed' || req.status === 'approved'
                                  ? colors.successAlpha
                                  : colors.primaryAlpha,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color:
                                  req.status === 'completed' || req.status === 'approved'
                                    ? colors.success
                                    : colors.primary,
                              },
                            ]}
                          >
                            {(req.status || 'in_progress').toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.historyTitle, { color: colors.text }]}>{req.title}</Text>
                      <Text style={[styles.historyDate, { color: colors.textMuted }]}>
                        Submitted: {new Date(req.created_at || Date.now()).toLocaleDateString()}
                      </Text>
                      {req.resolution_notes ? (
                        <Text style={[styles.historyNotes, { color: colors.textSecondary }]}>
                          Adviser Note: {req.resolution_notes}
                        </Text>
                      ) : null}
                    </View>
                  ))
                )}
              </View>
            )}
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
  sheetContainer: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  successBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  successText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  bodyScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  historyBtnRow: {
    marginBottom: 16,
    alignItems: 'center',
  },
  historyPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  historyPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tasksGrid: {
    gap: 12,
  },
  taskCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  taskCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskIcon: {
    fontSize: 22,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  taskDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  formContainer: {
    paddingBottom: 20,
  },
  formHeader: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  formSub: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
  },
  submitBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  calcCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 12,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  calcLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  calcVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionDivider: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 4,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
  },
  historyCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyRef: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 11,
  },
  historyNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
  },
});
