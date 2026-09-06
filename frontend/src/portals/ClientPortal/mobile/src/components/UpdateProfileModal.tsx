import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
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
import { ApiService } from '../services/api';
import { UserProfile } from '../types';

interface UpdateProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onProfileUpdated: () => void;
}

export const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({
  visible,
  onClose,
  profile,
  onProfileUpdated,
}) => {
  const { colors, isDark } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [employer, setEmployer] = useState('');
  const [occupation, setOccupation] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      const parts = (profile.name || '').split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setPhone(profile.phone || '');
      setAddress(profile.physicalAddress || '');
      setBankDetails(profile.bankDetails || '');
    }
  }, [profile, visible]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      Alert.alert('Required Fields', 'First name, last name, and mobile number are required.');
      return;
    }

    setSaving(true);
    try {
      await ApiService.updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobile: phone.trim(),
        physicalAddress: address.trim(),
        bankDetails: bankDetails.trim(),
        employer: employer.trim(),
        occupation: occupation.trim(),
        emergencyContactName: emergencyName.trim(),
        emergencyContactPhone: emergencyPhone.trim(),
      });
      Alert.alert('Profile Updated', 'Your profile details have been saved and synchronized.');
      onProfileUpdated();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.headerIconCircle, { backgroundColor: colors.primaryAlpha }]}>
                <DocumentTextIcon color={colors.primary} size={18} />
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Update Profile Details</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Keep your statutory contact and payout details current
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Personal Details */}
            <Text style={[styles.sectionHeading, { color: colors.primary }]}>PERSONAL INFORMATION</Text>
            
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>First Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.hoverBackground, color: colors.text, borderColor: colors.inputBorder }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="e.g. Sipho"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Last Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.hoverBackground, color: colors.text, borderColor: colors.inputBorder }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="e.g. Dlamini"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Primary Mobile Phone *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.hoverBackground, color: colors.text, borderColor: colors.inputBorder }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. 082 123 4567"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />

            {/* Address */}
            <Text style={[styles.sectionHeading, { color: colors.primary, marginTop: 16 }]}>RESIDENTIAL ADDRESS</Text>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Physical Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.hoverBackground, color: colors.text, borderColor: colors.inputBorder }]}
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. 12 Rivonia Road, Sandton"
              placeholderTextColor={colors.textMuted}
            />

            {/* Banking */}
            <Text style={[styles.sectionHeading, { color: colors.primary, marginTop: 16 }]}>CLAIM PAYOUT BANK ACCOUNT</Text>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Bank Name & Account Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.hoverBackground, color: colors.text, borderColor: colors.inputBorder }]}
              value={bankDetails}
              onChangeText={setBankDetails}
              placeholder="e.g. FNB Cheque - 62849102941"
              placeholderTextColor={colors.textMuted}
            />

            {/* Emergency */}
            <Text style={[styles.sectionHeading, { color: colors.primary, marginTop: 16 }]}>EMERGENCY CONTACT</Text>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Contact Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.hoverBackground, color: colors.text, borderColor: colors.inputBorder }]}
              value={emergencyName}
              onChangeText={setEmergencyName}
              placeholder="e.g. Nomvula Dlamini"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Contact Phone</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.hoverBackground, color: colors.text, borderColor: colors.inputBorder }]}
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
              placeholder="e.g. 083 987 6543"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />

            {/* Employment */}
            <Text style={[styles.sectionHeading, { color: colors.primary, marginTop: 16 }]}>EMPLOYMENT</Text>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Employer / Company</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.hoverBackground, color: colors.text, borderColor: colors.inputBorder }]}
              value={employer}
              onChangeText={setEmployer}
              placeholder="e.g. Corporate Standard Bank"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Occupation / Role</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.hoverBackground, color: colors.text, borderColor: colors.inputBorder }]}
              value={occupation}
              onChangeText={setOccupation}
              placeholder="e.g. Software Specialist"
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.footerSpacing} />
          </ScrollView>

          {/* Action Button */}
          <View style={[styles.footerBar, { borderTopColor: colors.divider }]}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save & Update Profile</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  formScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  footerSpacing: {
    height: 24,
  },
  footerBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
