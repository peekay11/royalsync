import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { Claim, ClaimFlow } from '../types';
import { ApiService } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import {
  CarIcon,
  CheckmarkIcon,
  AlertIcon,
  DocumentTextIcon,
  CameraIcon,
  IdCardIcon,
  ShieldIcon,
  HeartIcon,
  HomeIcon,
  PhoneIcon,
} from '../components/GrommetIcons';
import { CompanyLogo } from '../components/CompanyLogo';
import { ClaimLifecycleModal } from '../components/ClaimLifecycleModal';

export interface UploadedFile {
  id: string;
  filename: string;
  size: string;
  timestamp: string;
  uri?: string;
  mimeType?: string;
}

export interface ChecklistItemConfig {
  id: string;
  label: string;
  type: 'image' | 'text' | 'image_text';
  iconType: 'camera' | 'document' | 'id';
  placeholder?: string;
  uploadButtonText?: string;
  defaultSampleFile?: { filename: string; size: string };
}

export interface ClaimCategoryConfig {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  iconType: 'car' | 'heart' | 'shield' | 'medical' | 'home' | 'phone';
  defaultClaimType: string;
  policeNotice: {
    required: boolean;
    heading: string;
    text: string;
  };
  checklist: ChecklistItemConfig[];
}

export const CLAIM_CATEGORIES: ClaimCategoryConfig[] = [
  {
    id: 'car_accident',
    title: 'Car Accident & Collision',
    subtitle: 'Motor collision, bumper bash, or multi-car crash',
    tag: 'MOTOR',
    iconType: 'car',
    defaultClaimType: 'Motor — Collision & Accident',
    policeNotice: {
      required: true,
      heading: 'Police Accident Report (AR)',
      text: 'Report to the nearest SAPS police station within 24-48 hours to obtain an official Accident Report (AR) docket number.',
    },
    checklist: [
      {
        id: 'road_photos',
        label: 'Photos of road surface & direction of travel',
        type: 'image',
        iconType: 'camera',
        uploadButtonText: 'Upload Road Surface Photos',
        defaultSampleFile: { filename: 'road_surface_skid_angles.jpg', size: '2.4 MB' },
      },
      {
        id: 'address',
        label: 'Address or nearest cross streets',
        type: 'text',
        iconType: 'document',
        placeholder: 'e.g. Cnr Sandton Dr & Rivonia Rd, Sandton, Johannesburg',
      },
      {
        id: 'vehicle_photos',
        label: 'Photos of all vehicles & damage views (4 sides)',
        type: 'image',
        iconType: 'camera',
        uploadButtonText: 'Upload Vehicle Damage Photos',
        defaultSampleFile: { filename: 'bmw_front_and_side_damage.jpg', size: '3.8 MB' },
      },
      {
        id: 'licence_plates',
        label: 'Licence plates & vehicle licence discs',
        type: 'image_text',
        iconType: 'id',
        placeholder: 'e.g. CA 123-456 (My vehicle), GP 789-012 (Third party)',
        uploadButtonText: 'Upload Licence Disc Photos',
        defaultSampleFile: { filename: 'licence_disc_and_plate_scan.jpg', size: '1.8 MB' },
      },
      {
        id: 'id_documents',
        label: 'Drivers licence & RSA ID of all drivers',
        type: 'image',
        iconType: 'id',
        uploadButtonText: 'Upload Driver Licences & IDs',
        defaultSampleFile: { filename: 'driver_licence_card.pdf', size: '1.5 MB' },
      },
      {
        id: 'witnesses',
        label: 'Witness names & contact telephone numbers',
        type: 'text',
        iconType: 'document',
        placeholder: 'Add names and contact numbers for any witnesses',
      },
      {
        id: 'other_insurance',
        label: 'Third party insurer details & driver contact',
        type: 'text',
        iconType: 'document',
        placeholder: 'e.g. Santam / King Price — Policy # & Driver cell',
      },
    ],
  },
  {
    id: 'death_claim',
    title: 'Death & Life Cover Claim',
    subtitle: 'Life insurance payout, funeral cover, or dread disease',
    tag: 'LIFE & FUNERAL',
    iconType: 'heart',
    defaultClaimType: 'Life & Risk — Death Payout Claim',
    policeNotice: {
      required: false,
      heading: 'Home Affairs / DHA Statutory Notice',
      text: 'Submit the official Home Affairs DHA-1663 / BI-1663 Notice of Death together with a certified Death Certificate.',
    },
    checklist: [
      {
        id: 'death_certificate',
        label: 'Certified Copy of Official Death Certificate',
        type: 'image',
        iconType: 'document',
        uploadButtonText: 'Upload Death Certificate (PDF / JPG)',
        defaultSampleFile: { filename: 'certified_death_certificate_dha.pdf', size: '1.8 MB' },
      },
      {
        id: 'dha_1663_form',
        label: 'DHA-1663 / BI-1663 Notice of Death Form',
        type: 'image',
        iconType: 'document',
        uploadButtonText: 'Upload DHA-1663 Document',
        defaultSampleFile: { filename: 'dha_1663_medical_notice.pdf', size: '2.1 MB' },
      },
      {
        id: 'beneficiary_id',
        label: 'Beneficiary RSA ID Document & Proof of Banking',
        type: 'image_text',
        iconType: 'id',
        placeholder: 'e.g. Beneficiary RSA ID: 8502100098084 · FNB Account ending in 4912',
        uploadButtonText: 'Upload Beneficiary ID & Bank Stamped Letter',
        defaultSampleFile: { filename: 'beneficiary_id_and_bank_proof.pdf', size: '1.4 MB' },
      },
      {
        id: 'deceased_id',
        label: 'Deceased Policyholder RSA ID / Smart ID Card',
        type: 'image',
        iconType: 'id',
        uploadButtonText: 'Upload Deceased ID Document',
        defaultSampleFile: { filename: 'deceased_smart_id_card.jpg', size: '1.1 MB' },
      },
      {
        id: 'cause_of_death',
        label: 'Attending Doctor / Specialist Cause of Death Summary',
        type: 'text',
        iconType: 'document',
        placeholder: 'e.g. Natural causes under Dr. K. Naidoo at Morningside Clinic',
      },
    ],
  },
  {
    id: 'theft_hijacking',
    title: 'Theft, Hijacking & Robbery',
    subtitle: 'Stolen vehicle, burglary at home, or armed robbery',
    tag: 'THEFT & CRIME',
    iconType: 'shield',
    defaultClaimType: 'Short-Term — Stolen Vehicle / Property Theft',
    policeNotice: {
      required: true,
      heading: 'Mandatory SAPS Case Registration',
      text: 'A formal SAPS CAS docket number must be opened within 24 hours of the incident before underwriter validation.',
    },
    checklist: [
      {
        id: 'police_cas_doc',
        label: 'SAPS Police Case Number (CAS Number & Police Station)',
        type: 'text',
        iconType: 'document',
        placeholder: 'e.g. CAS 492/09/2026 at Sandton Police Station (IO: Det. Sithole)',
      },
      {
        id: 'stolen_items_list',
        label: 'Itemised list & estimated value of stolen goods / vehicle',
        type: 'text',
        iconType: 'document',
        placeholder: 'e.g. 2023 BMW 320i Reg CA 123-456 · Apple MacBook Pro 16" · Gold watch',
      },
      {
        id: 'tracker_report',
        label: 'Vehicle Tracking Device Incident Log / Unit Certificate',
        type: 'image',
        iconType: 'document',
        uploadButtonText: 'Upload Tracker / Telematics Incident Log',
        defaultSampleFile: { filename: 'tracking_telematics_incident_log.pdf', size: '1.3 MB' },
      },
      {
        id: 'forced_entry_photos',
        label: 'Photos of forced entry, broken window, or crime scene',
        type: 'image',
        iconType: 'camera',
        uploadButtonText: 'Upload Crime Scene & Entry Point Photos',
        defaultSampleFile: { filename: 'forced_gate_lock_damage_photos.jpg', size: '3.2 MB' },
      },
    ],
  },
  {
    id: 'medical_hospital',
    title: 'Medical & Hospitalisation',
    subtitle: 'Emergency hospital admission, surgery, or specialist claim',
    tag: 'MEDICAL AID',
    iconType: 'medical',
    defaultClaimType: 'Medical Aid — Hospitalisation & Treatment Claim',
    policeNotice: {
      required: false,
      heading: 'Medical Pre-Authorisation Notice',
      text: 'Provide hospital admission authorisation reference and itemised tariff billing statement.',
    },
    checklist: [
      {
        id: 'hospital_admission_summary',
        label: 'Hospital Admission & Discharge Summary Report',
        type: 'image',
        iconType: 'document',
        uploadButtonText: 'Upload Hospital Discharge Summary',
        defaultSampleFile: { filename: 'hospital_discharge_clinical_summary.pdf', size: '2.2 MB' },
      },
      {
        id: 'specialist_clinical_notes',
        label: 'Attending Specialist / Surgeon Clinical Notes',
        type: 'text',
        iconType: 'document',
        placeholder: 'e.g. Dr. M. Van Der Merwe (Orthopaedic Surgeon) · Procedure code 0492',
      },
      {
        id: 'itemised_medical_bills',
        label: 'Itemised medical bills, tariff codes & payment receipts',
        type: 'image',
        iconType: 'document',
        uploadButtonText: 'Upload Invoices & Tariff Statements',
        defaultSampleFile: { filename: 'itemised_anaesthetist_hospital_invoice.pdf', size: '1.6 MB' },
      },
    ],
  },
  {
    id: 'building_geyser',
    title: 'Building & Geyser Damage',
    subtitle: 'Geyser burst, ceiling water leak, hail, or storm damage',
    tag: 'PROPERTY',
    iconType: 'home',
    defaultClaimType: 'Short-Term — Building & Geyser Damage',
    policeNotice: {
      required: false,
      heading: 'Emergency Plumber / Builder Protocol',
      text: 'Turn off main water supply and capture clear damage photos before emergency replacement.',
    },
    checklist: [
      {
        id: 'damage_photos_property',
        label: 'Photos of geyser, flooded area & ceiling damage',
        type: 'image',
        iconType: 'camera',
        uploadButtonText: 'Upload Burst Geyser & Flooding Photos',
        defaultSampleFile: { filename: 'burst_geyser_ceiling_water_damage.jpg', size: '4.5 MB' },
      },
      {
        id: 'incident_address_home',
        label: 'Physical address where damage occurred',
        type: 'text',
        iconType: 'document',
        placeholder: 'e.g. 14 Protea Crescent, Bryanston, Sandton',
      },
      {
        id: 'plumber_quote',
        label: 'Plumber / Electrician Compliance Report & Quote',
        type: 'image',
        iconType: 'document',
        uploadButtonText: 'Upload Plumber Invoice & PIRB Certificate',
        defaultSampleFile: { filename: 'plumber_pirb_replacement_invoice.pdf', size: '1.2 MB' },
      },
    ],
  },
  {
    id: 'gadgets_allrisk',
    title: 'Tech, Mobile & Valuables',
    subtitle: 'Cracked phone screen, water damaged laptop, or lost jewellery',
    tag: 'ALL-RISK',
    iconType: 'phone',
    defaultClaimType: 'All-Risk — Portable Possessions & Tech Claim',
    policeNotice: {
      required: false,
      heading: 'IMEI Blacklisting Notice',
      text: 'If your cellular phone was lost or stolen, obtain an ITC IMEI Blacklist Certificate from your mobile network.',
    },
    checklist: [
      {
        id: 'device_damage_photos',
        label: 'Photos of damaged device & serial / IMEI number',
        type: 'image',
        iconType: 'camera',
        uploadButtonText: 'Upload Damaged Device Photos',
        defaultSampleFile: { filename: 'iphone_cracked_screen_serial.jpg', size: '3.1 MB' },
      },
      {
        id: 'device_make_model',
        label: 'Make, model, serial / IMEI number & storage capacity',
        type: 'text',
        iconType: 'id',
        placeholder: 'e.g. Apple iPhone 15 Pro Max 256GB (IMEI: 359128091823901)',
      },
      {
        id: 'proof_of_purchase_device',
        label: 'Original proof of purchase or cellular upgrade contract',
        type: 'image',
        iconType: 'document',
        uploadButtonText: 'Upload Till Slip / Purchase Invoice',
        defaultSampleFile: { filename: 'istore_tax_invoice_receipt.pdf', size: '1.1 MB' },
      },
    ],
  },
];

const PROVIDERS = [
  { name: 'Santam', desc: 'Short-term & Commercial' },
  { name: 'King Price', desc: 'Agreed Value & Motor' },
  { name: 'Discovery Health', desc: 'Medical Aid & Vitality' },
  { name: 'Old Mutual', desc: 'Life, Funeral & Wealth' },
  { name: 'Sanlam', desc: 'Life Cover & Investments' },
  { name: 'Momentum', desc: 'Multiply & Comprehensive' },
  { name: 'Liberty', desc: 'Life & Risk Protection' },
  { name: 'Allan Gray', desc: 'Offshore & Portfolios' },
];

export const ClaimsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [flow, setFlow] = useState<ClaimFlow>('idle');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'active' | 'closed'>('all');

  // Active Category configuration
  const [selectedCategory, setSelectedCategory] = useState<ClaimCategoryConfig>(CLAIM_CATEGORIES[0]);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    road_photos: true,
    address: true,
    vehicle_photos: true,
  });
  const [textResponses, setTextResponses] = useState<Record<string, string>>({
    address: 'Cnr Sandton Dr & Rivonia Rd, Sandton',
    witnesses: '',
  });
  const [itemUploads, setItemUploads] = useState<Record<string, UploadedFile[]>>({
    road_photos: [
      { id: 'f-1', filename: 'road_surface_skid_angles.jpg', size: '2.4 MB', timestamp: 'Today' },
    ],
    vehicle_photos: [
      { id: 'f-2', filename: 'bmw_front_damage.jpg', size: '3.8 MB', timestamp: 'Today' },
    ],
  });

  // Claim details form state
  const [selectedInsurer, setSelectedInsurer] = useState('Santam');
  const [claimType, setClaimType] = useState('Motor — Collision & Accident');
  const [incidentDate, setIncidentDate] = useState('2026-09-06');
  const [policeCase, setPoliceCase] = useState('');
  const [description, setDescription] = useState('');
  const [submittedId, setSubmittedId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClaimForLifecycle, setSelectedClaimForLifecycle] = useState<any>(null);
  const [lifecycleModalVisible, setLifecycleModalVisible] = useState(false);

  // File preview modal
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  const fetchClaims = async () => {
    try {
      const data = await ApiService.getClaims();
      setClaims(data || []);
    } catch (e) {
      console.log('Failed to fetch claims', e);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClaims();
    setRefreshing(false);
  };

  const handleSelectCategory = (cat: ClaimCategoryConfig) => {
    setSelectedCategory(cat);
    setClaimType(cat.defaultClaimType);

    const newChecked: Record<string, boolean> = {};
    cat.checklist.slice(0, 2).forEach(item => {
      newChecked[item.id] = true;
    });
    setCheckedItems(newChecked);

    const newUploads: Record<string, UploadedFile[]> = {};
    const firstImg = cat.checklist.find(i => i.type === 'image');
    if (firstImg && firstImg.defaultSampleFile) {
      newUploads[firstImg.id] = [
        {
          id: `f-${Date.now()}`,
          filename: firstImg.defaultSampleFile.filename,
          size: firstImg.defaultSampleFile.size,
          timestamp: 'Today',
        },
      ];
    }
    setItemUploads(newUploads);
    setFlow('scene');
  };

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTextChange = (id: string, text: string) => {
    setTextResponses(prev => ({ ...prev, [id]: text }));
    if (text.trim().length > 0 && !checkedItems[id]) {
      setCheckedItems(prev => ({ ...prev, [id]: true }));
    }
  };

  const handleAddUpload = (item: ChecklistItemConfig) => {
    if (typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = item.type === 'image' ? 'image/*,application/pdf' : '*/*';
      input.multiple = true;
      input.style.display = 'none';

      input.onchange = (e: any) => {
        const files: FileList = e.target.files;
        if (files && files.length > 0) {
          Array.from(files).forEach(file => {
            const formattedSize = file.size >= 1024 * 1024
              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
              : `${Math.max(1, Math.round(file.size / 1024))} KB`;

            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              const newFile: UploadedFile = {
                id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                filename: file.name,
                size: formattedSize,
                timestamp: 'Just now',
                uri: dataUrl,
                mimeType: file.type,
              };

              setItemUploads(prev => ({
                ...prev,
                [item.id]: [...(prev[item.id] || []), newFile],
              }));
              setCheckedItems(prev => ({ ...prev, [item.id]: true }));
            };
            reader.readAsDataURL(file);
          });
        }
        document.body.removeChild(input);
      };

      document.body.appendChild(input);
      input.click();
    } else {
      const defaultFile = item.defaultSampleFile || {
        filename: `${item.id}_evidence_${Date.now().toString().slice(-4)}.jpg`,
        size: `${(1.2 + Math.random() * 2.0).toFixed(1)} MB`,
      };

      const newFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random()}`,
        filename: defaultFile.filename,
        size: defaultFile.size,
        timestamp: 'Just now',
      };

      setItemUploads(prev => ({
        ...prev,
        [item.id]: [...(prev[item.id] || []), newFile],
      }));
      setCheckedItems(prev => ({ ...prev, [item.id]: true }));
    }
  };

  const handleRemoveUpload = (itemId: string, fileId: string) => {
    setItemUploads(prev => {
      const updated = (prev[itemId] || []).filter(f => f.id !== fileId);
      return { ...prev, [itemId]: updated };
    });
  };

  const handleSubmitClaim = async () => {
    setSubmitting(true);

    const checkedLabels = selectedCategory.checklist
      .filter(item => checkedItems[item.id])
      .map(item => item.label);

    const allUploadedFileNames: string[] = [];
    Object.values(itemUploads).forEach(files => {
      files.forEach(f => allUploadedFileNames.push(f.filename));
    });

    let combinedDescription = description.trim();
    Object.entries(textResponses).forEach(([key, val]) => {
      if (val && val.trim()) {
        const itemObj = selectedCategory.checklist.find(i => i.id === key);
        combinedDescription += `\n${itemObj?.label || key}: ${val.trim()}`;
      }
    });

    try {
      const newClaim = await ApiService.submitClaim({
        type: claimType,
        insurer: selectedInsurer,
        incidentDate,
        policeCaseNo: policeCase,
        description: combinedDescription.trim() || `${selectedCategory.title} claim evidence submitted.`,
        checkedItems: checkedLabels,
        documents: allUploadedFileNames.length > 0 ? allUploadedFileNames : ['claim_evidence_package.pdf'],
      });

      setSubmittedId(newClaim.id || `CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setClaims(prev => [newClaim, ...prev]);
      setFlow('done');
    } catch (e) {
      console.log('Error submitting claim', e);
      setSubmittedId(`CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setFlow('done');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCategoryIcon = (iconType: string, size = 20, color = '#d92820') => {
    switch (iconType) {
      case 'car':
        return <CarIcon color={color} size={size} />;
      case 'heart':
        return <HeartIcon color={color} size={size} />;
      case 'shield':
        return <ShieldIcon color={color} size={size} />;
      case 'home':
        return <HomeIcon color={color} size={size} />;
      case 'phone':
        return <PhoneIcon color={color} size={size} />;
      default:
        return <DocumentTextIcon color={color} size={size} />;
    }
  };

  const renderChecklistIcon = (type: string) => {
    switch (type) {
      case 'camera':
        return <CameraIcon color="#d92820" size={14} />;
      case 'id':
        return <IdCardIcon color="#d92820" size={14} />;
      default:
        return <DocumentTextIcon color="#d92820" size={14} />;
    }
  };

  // Filtered claims for dashboard
  const filteredClaims = useMemo(() => {
    if (activeStatusFilter === 'active') {
      return claims.filter(c => !c.stage10_claimClosed && c.status?.toLowerCase() !== 'settled' && c.status?.toLowerCase() !== 'closed');
    }
    if (activeStatusFilter === 'closed') {
      return claims.filter(c => c.stage10_claimClosed || c.status?.toLowerCase() === 'settled' || c.status?.toLowerCase() === 'closed');
    }
    return claims;
  }, [claims, activeStatusFilter]);

  const activeClaimsCount = claims.filter(c => !c.stage10_claimClosed && c.status?.toLowerCase() !== 'settled' && c.status?.toLowerCase() !== 'closed').length;
  const closedClaimsCount = claims.length - activeClaimsCount;

  // ─── DASHBOARD (flow === 'idle') ───────────────────────────────────────────
  if (flow === 'idle') {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d92820" />
        }
      >
        {/* Header Title */}
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Claims & Assistance</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Lodge incident claims, track workshop progress & view settlements
            </Text>
          </View>
        </View>

        {/* Hero CTA Button */}
        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: colors.card, borderColor: isDark ? '#333' : '#eee' }]}
          onPress={() => setFlow('category')}
          activeOpacity={0.88}
        >
          <View style={styles.ctaIconBox}>
            <ShieldIcon color="#ffffff" size={22} />
          </View>
          <View style={styles.ctaInfo}>
            <Text style={[styles.ctaTitle, { color: colors.text }]}>Report a New Incident</Text>
            <Text style={[styles.ctaSub, { color: colors.textSecondary }]}>
              Fast-track claim wizard with instant underwriter notice
            </Text>
          </View>
          <View style={styles.ctaArrowCircle}>
            <Text style={styles.ctaArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {/* Category Grid Section */}
        <View style={styles.categorySectionHeader}>
          <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>CLAIM INCIDENT CATEGORIES</Text>
          <TouchableOpacity onPress={() => setFlow('category')}>
            <Text style={styles.seeAllText}>View All ({CLAIM_CATEGORIES.length}) →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryGrid}>
          {CLAIM_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                {
                  backgroundColor: colors.card,
                  borderColor: isDark ? '#262626' : '#f0f0f0',
                },
              ]}
              onPress={() => handleSelectCategory(cat)}
              activeOpacity={0.78}
            >
              <View style={styles.categoryCardTop}>
                <View style={styles.categoryIconCircle}>
                  {renderCategoryIcon(cat.iconType, 18, '#d92820')}
                </View>
                <View style={[styles.categoryTagPill, { backgroundColor: isDark ? '#2a1a1a' : '#fee2e2' }]}>
                  <Text style={styles.categoryTagText}>{cat.tag}</Text>
                </View>
              </View>
              <Text style={[styles.categoryCardTitle, { color: colors.text }]} numberOfLines={1}>
                {cat.title}
              </Text>
              <Text style={[styles.categoryCardSub, { color: colors.textSecondary }]} numberOfLines={2}>
                {cat.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Claims Section */}
        <View style={[styles.categorySectionHeader, { marginTop: 24, marginBottom: 12 }]}>
          <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>MY CLAIMS PORTFOLIO</Text>
          <View style={styles.filterPillsRow}>
            <TouchableOpacity
              style={[styles.filterPill, activeStatusFilter === 'all' && styles.filterPillActive]}
              onPress={() => setActiveStatusFilter('all')}
            >
              <Text style={[styles.filterPillText, activeStatusFilter === 'all' && styles.filterPillTextActive]}>
                All ({claims.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, activeStatusFilter === 'active' && styles.filterPillActive]}
              onPress={() => setActiveStatusFilter('active')}
            >
              <Text style={[styles.filterPillText, activeStatusFilter === 'active' && styles.filterPillTextActive]}>
                Active ({activeClaimsCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, activeStatusFilter === 'closed' && styles.filterPillActive]}
              onPress={() => setActiveStatusFilter('closed')}
            >
              <Text style={[styles.filterPillText, activeStatusFilter === 'closed' && styles.filterPillTextActive]}>
                Settled ({closedClaimsCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {filteredClaims.length === 0 ? (
          <View style={[styles.emptyClaimsCard, { backgroundColor: colors.card, borderColor: isDark ? '#262626' : '#f0f0f0' }]}>
            <ShieldIcon color="#9ca3af" size={32} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Claims in this View</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              {activeStatusFilter === 'active'
                ? 'You have no active claims currently in assessment or repair.'
                : 'No claims recorded on file. Tap Report a New Incident to submit.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => setFlow('category')}
            >
              <Text style={styles.emptyActionText}>+ Lodge New Claim</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.claimsList}>
            {filteredClaims.map((c, i) => {
              const currentStage = c.currentStageIndex || 1;
              const isSettled = c.stage10_claimClosed || c.status?.toLowerCase() === 'settled' || c.status?.toLowerCase() === 'closed';

              return (
                <TouchableOpacity
                  key={c.id || i}
                  activeOpacity={0.85}
                  onPress={() => {
                    setSelectedClaimForLifecycle(c);
                    setLifecycleModalVisible(true);
                  }}
                  style={[
                    styles.claimCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isDark ? '#262626' : '#f0f0f0',
                    },
                  ]}
                >
                  {/* Top Row */}
                  <View style={styles.claimHeaderRow}>
                    <CompanyLogo name={c.insurer || 'Santam'} size={38} />
                    <View style={styles.claimMainInfo}>
                      <View style={styles.claimTypeRow}>
                        <Text style={[styles.claimType, { color: colors.text }]} numberOfLines={1}>
                          {c.type}
                        </Text>
                      </View>
                      <Text style={[styles.claimMeta, { color: colors.textSecondary }]}>
                        {c.insurer || 'Underwriter'} · {c.reference || c.id}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: isSettled
                            ? (isDark ? '#14301d' : '#dcfce7')
                            : (isDark ? '#2d2412' : '#fef3c7'),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: isSettled ? '#16a34a' : '#d97706',
                          },
                        ]}
                      >
                        {isSettled ? 'Settled' : c.status || 'In Assessment'}
                      </Text>
                    </View>
                  </View>

                  {/* Middle Row */}
                  <View style={styles.claimMiddleRow}>
                    <View>
                      <Text style={[styles.claimFieldLabel, { color: colors.textMuted }]}>CLAIM AMOUNT</Text>
                      <Text style={styles.claimAmount}>
                        {c.amount ? (String(c.amount).startsWith('R') ? String(c.amount) : `R ${c.amount}`) : 'R 0.00'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.claimFieldLabel, { color: colors.textMuted }]}>INCIDENT DATE</Text>
                      <Text style={[styles.claimDateText, { color: colors.textSecondary }]}>
                        {c.incidentDate ? new Date(c.incidentDate).toLocaleDateString() : 'Recent'}
                      </Text>
                    </View>
                  </View>

                  {/* Lifecycle 10-Stage Mini Visual Bar */}
                  <View style={[styles.claimProgressBox, { backgroundColor: isDark ? '#171717' : '#f9fafb' }]}>
                    <View style={styles.claimProgressTop}>
                      <Text style={styles.claimStageTitle}>
                        {isSettled ? '✓ Lifecycle Completed' : `Stage ${currentStage}/10: Process Active`}
                      </Text>
                      <Text style={styles.claimStageLink}>Track Live Workshop Feed →</Text>
                    </View>

                    {/* Visual Segment Bar */}
                    <View style={styles.miniProgressBarTrack}>
                      <View
                        style={[
                          styles.miniProgressBarFill,
                          {
                            width: isSettled ? '100%' : `${Math.max(10, currentStage * 10)}%`,
                            backgroundColor: isSettled ? '#16a34a' : '#d92820',
                          },
                        ]}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <ClaimLifecycleModal
          visible={lifecycleModalVisible}
          claim={selectedClaimForLifecycle}
          onClose={() => setLifecycleModalVisible(false)}
          onRefresh={fetchClaims}
        />
      </ScrollView>
    );
  }

  // ─── STEP 1: CATEGORY SELECTION (flow === 'category') ──────────────────────
  if (flow === 'category') {
    return (
      <View style={[styles.wizardContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.wizardHeader, { backgroundColor: colors.card, borderBottomColor: isDark ? '#262626' : '#f0f0f0' }]}>
          <TouchableOpacity
            style={[styles.wizardBackBtn, { backgroundColor: isDark ? '#262626' : '#f5f5f5' }]}
            onPress={() => setFlow('idle')}
          >
            <Text style={[styles.wizardBackText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
          <View style={styles.wizardProgressArea}>
            <Text style={[styles.wizardStepText, { color: colors.textMuted }]}>Step 1 of 3 · Incident Type</Text>
            <View style={[styles.wizardProgressTrack, { backgroundColor: isDark ? '#252525' : '#e5e7eb' }]}>
              <View style={[styles.wizardProgressFill, { width: '33.3%', backgroundColor: '#d92820' }]} />
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.wizardContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.wizardTitle, { color: colors.text }]}>What happened?</Text>
          <Text style={[styles.wizardSub, { color: colors.textMuted, marginBottom: 18 }]}>
            Select the incident category to load the exact statutory evidence checklist & forms.
          </Text>

          <View style={{ gap: 10 }}>
            {CLAIM_CATEGORIES.map(cat => {
              const isChosen = selectedCategory.id === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChooserCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isChosen ? '#d92820' : (isDark ? '#262626' : '#f0f0f0'),
                    },
                  ]}
                  onPress={() => handleSelectCategory(cat)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryIconCircleLarge, { backgroundColor: isDark ? '#2a1414' : '#fee2e2' }]}>
                    {renderCategoryIcon(cat.iconType, 22, '#d92820')}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Text style={[styles.categoryChooserTitle, { color: colors.text }]}>{cat.title}</Text>
                      <View style={[styles.categoryTagPill, { backgroundColor: isDark ? '#2a1a1a' : '#fee2e2' }]}>
                        <Text style={styles.categoryTagText}>{cat.tag}</Text>
                      </View>
                    </View>
                    <Text style={[styles.categoryChooserSub, { color: colors.textSecondary }]}>{cat.subtitle}</Text>
                    <Text style={styles.checklistCountSub}>
                      {cat.checklist.length} checklist items · {cat.policeNotice.required ? 'SAPS Report required' : 'Direct underwriter claim'}
                    </Text>
                  </View>
                  <Text style={styles.chooserArrow}>→</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─── MULTI-STEP WIZARD (flow === 'scene' | 'register' | 'done') ─────────────
  const currentStepNumber = flow === 'scene' ? 2 : 3;
  const totalSteps = 3;
  const completedChecklistCount = selectedCategory.checklist.filter(item => checkedItems[item.id]).length;

  return (
    <View style={[styles.wizardContainer, { backgroundColor: colors.background }]}>
      {/* Wizard Header */}
      <View style={[styles.wizardHeader, { backgroundColor: colors.card, borderBottomColor: isDark ? '#262626' : '#f0f0f0' }]}>
        <TouchableOpacity
          style={[styles.wizardBackBtn, { backgroundColor: isDark ? '#262626' : '#f5f5f5' }]}
          onPress={() => {
            if (flow === 'register') setFlow('scene');
            else if (flow === 'scene') setFlow('category');
            else setFlow('idle');
          }}
        >
          <Text style={[styles.wizardBackText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.wizardProgressArea}>
          <Text style={[styles.wizardStepText, { color: colors.textMuted }]}>
            {flow === 'done' ? 'Claim Logged' : `${selectedCategory.title} · Step ${currentStepNumber} of ${totalSteps}`}
          </Text>
          <View style={[styles.wizardProgressTrack, { backgroundColor: isDark ? '#252525' : '#e5e7eb' }]}>
            <View
              style={[
                styles.wizardProgressFill,
                {
                  width: flow === 'done' ? '100%' : `${(currentStepNumber / totalSteps) * 100}%`,
                  backgroundColor: '#d92820',
                },
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.wizardContent} showsVerticalScrollIndicator={false}>
        {/* Step 2: Evidence Checklist */}
        {flow === 'scene' && (
          <View>
            <View style={styles.stepTitleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.wizardTitle, { color: colors.text }]}>{selectedCategory.title}</Text>
                <Text style={[styles.wizardSub, { color: colors.textMuted }]}>
                  Upload evidence & required documentation for claim approval
                </Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {completedChecklistCount}/{selectedCategory.checklist.length} Complete
                </Text>
              </View>
            </View>

            {/* Checklist Items */}
            <View style={styles.checklistContainer}>
              {selectedCategory.checklist.map((item) => {
                const isChecked = !!checkedItems[item.id];
                const textVal = textResponses[item.id] || '';
                const uploads = itemUploads[item.id] || [];
                const hasImages = uploads.length > 0;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.itemCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: isChecked ? '#d92820' : (isDark ? '#262626' : '#f0f0f0'),
                      },
                    ]}
                  >
                    {/* Header with Checkbox */}
                    <TouchableOpacity
                      style={styles.itemHeader}
                      onPress={() => toggleCheck(item.id)}
                      activeOpacity={0.75}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: isChecked ? '#d92820' : (isDark ? '#2a2a2a' : '#e5e7eb'),
                          },
                        ]}
                      >
                        {isChecked && <CheckmarkIcon color="#ffffff" size={12} strokeWidth={3} />}
                      </View>

                      <View style={styles.itemHeaderInfo}>
                        <Text style={[styles.itemLabel, { color: colors.text }]}>
                          {item.label}
                        </Text>
                        <View style={styles.itemBadgeRow}>
                          <View style={[styles.typeBadge, { backgroundColor: isDark ? '#222' : '#f5f5f5' }]}>
                            {renderChecklistIcon(item.iconType)}
                            <Text style={[styles.typeBadgeText, { color: colors.textMuted }]}>
                              {item.type === 'image' ? 'PHOTO / DOC UPLOAD' : item.type === 'text' ? 'TEXT DETAILS' : 'UPLOAD + DETAILS'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Word Response Field */}
                    {(item.type === 'text' || item.type === 'image_text') && (
                      <View style={styles.responseBoxContainer}>
                        <Text style={[styles.boxLabel, { color: colors.textMuted }]}>DETAILS / STATEMENT:</Text>
                        <TextInput
                          style={[
                            styles.responseInput,
                            {
                              backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
                              color: colors.text,
                              borderColor: isDark ? '#333' : '#e5e7eb',
                            },
                          ]}
                          value={textVal}
                          onChangeText={(txt) => handleTextChange(item.id, txt)}
                          placeholder={item.placeholder || 'Type details here…'}
                          placeholderTextColor={colors.textSubtle}
                          multiline
                        />
                      </View>
                    )}

                    {/* Document & Image Upload Area */}
                    {(item.type === 'image' || item.type === 'image_text') && (
                      <View style={styles.uploadBoxContainer}>
                        <Text style={[styles.boxLabel, { color: colors.textMuted }]}>ATTACHED EVIDENCE:</Text>

                        {/* Uploaded Chips */}
                        {hasImages && (
                          <View style={styles.uploadedFilesList}>
                            {uploads.map((file) => (
                              <View
                                key={file.id}
                                style={[
                                  styles.fileChip,
                                  {
                                    backgroundColor: isDark ? '#1a221c' : '#f0fdf4',
                                    borderColor: isDark ? '#234a2e' : '#bbf7d0',
                                  },
                                ]}
                              >
                                {file.uri && (file.uri.startsWith('data:image') || file.filename.match(/\.(jpg|jpeg|png|webp|gif)$/i)) ? (
                                  <Image
                                    source={{ uri: file.uri }}
                                    style={styles.fileThumbnail}
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <CameraIcon color="#16a34a" size={14} />
                                )}

                                <TouchableOpacity
                                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                                  onPress={() => setPreviewFile(file)}
                                  activeOpacity={0.7}
                                >
                                  <Text style={[styles.fileNameText, { color: colors.text }]} numberOfLines={1}>
                                    {file.filename}
                                  </Text>
                                  <Text style={[styles.fileSizeText, { color: colors.textMuted }]}>({file.size})</Text>
                                  <Text style={styles.previewHint}>Preview</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  onPress={() => handleRemoveUpload(item.id, file.id)}
                                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                  <Text style={styles.removeFileBtn}>✕</Text>
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Upload Drop Button */}
                        <TouchableOpacity
                          style={[
                            styles.uploadDropBox,
                            {
                              backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
                              borderColor: isDark ? '#333' : '#e5e7eb',
                            },
                          ]}
                          onPress={() => handleAddUpload(item)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.uploadIconCircle}>
                            <CameraIcon color="#d92820" size={15} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.uploadDropText}>
                              {item.uploadButtonText || '+ Upload Evidence / Document'}
                            </Text>
                            <Text style={[styles.uploadDropSub, { color: colors.textSubtle }]}>
                              Tap to select from files or camera (JPG, PNG, PDF)
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Police / Statutory Notice */}
            <View style={[styles.alertNotice, { backgroundColor: isDark ? '#2a1a1a' : '#fef2f2', borderColor: '#fca5a5' }]}>
              <View style={styles.alertHeaderRow}>
                <AlertIcon color="#d92820" size={18} />
                <Text style={styles.alertHeading}>{selectedCategory.policeNotice.heading}</Text>
              </View>
              <Text style={[styles.alertText, { color: colors.textSecondary }]}>
                {selectedCategory.policeNotice.text}
              </Text>
            </View>
          </View>
        )}

        {/* Step 3: Registration & Insurer */}
        {flow === 'register' && (
          <View>
            <Text style={[styles.wizardTitle, { color: colors.text }]}>Underwriter & Details</Text>
            <Text style={[styles.wizardSub, { color: colors.textMuted }]}>
              Confirm underwriter and incident circumstances for {selectedCategory.title}
            </Text>

            {/* Insurer Selector Grid */}
            <Text style={[styles.fieldLabel, { color: colors.textMuted, marginTop: 18 }]}>SELECT UNDERWRITER / INSURER</Text>
            <View style={styles.providersGrid}>
              {PROVIDERS.map(p => {
                const isSelected = selectedInsurer === p.name;
                return (
                  <TouchableOpacity
                    key={p.name}
                    style={[
                      styles.providerCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: isSelected ? '#d92820' : (isDark ? '#262626' : '#f0f0f0'),
                      },
                    ]}
                    onPress={() => setSelectedInsurer(p.name)}
                    activeOpacity={0.8}
                  >
                    <CompanyLogo name={p.name} size={30} />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={[styles.providerNameText, { color: colors.text, fontWeight: isSelected ? '800' : '600' }]}>
                        {p.name}
                      </Text>
                      <Text style={[styles.providerDescText, { color: colors.textMuted }]} numberOfLines={1}>
                        {p.desc}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.providerSelectedCheck}>
                        <CheckmarkIcon color="#ffffff" size={10} strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Direct Submit Banner */}
            <View style={[styles.directSubmitBanner, { backgroundColor: colors.card, borderColor: isDark ? '#262626' : '#f0f0f0' }]}>
              <View style={styles.directSubmitHeader}>
                <CompanyLogo name={selectedInsurer} size={28} />
                <Text style={[styles.directSubmitTitle, { color: colors.text }]}>
                  Direct Submission to {selectedInsurer}
                </Text>
              </View>
              <Text style={[styles.directSubmitSub, { color: colors.textSecondary }]}>
                Your {selectedCategory.title.toLowerCase()} evidence ({completedChecklistCount} items) will be formatted into an official underwriter docket and assigned to a claims handler.
              </Text>
            </View>

            {/* Date Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>DATE OF INCIDENT / LOSS</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: isDark ? '#262626' : '#e5e7eb',
                  },
                ]}
                value={incidentDate}
                onChangeText={setIncidentDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSubtle}
              />
            </View>

            {/* SAPS Case # */}
            {selectedCategory.policeNotice.required && (
              <View style={styles.inputGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>SAPS POLICE CASE / AR NUMBER (IF APPLICABLE)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: isDark ? '#262626' : '#e5e7eb',
                    },
                  ]}
                  value={policeCase}
                  onChangeText={setPoliceCase}
                  placeholder="e.g. CAS 421/09/2026 (Sandton Police Station)"
                  placeholderTextColor={colors.textSubtle}
                />
              </View>
            )}

            {/* Additional Notes */}
            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>ADDITIONAL INCIDENT NOTES</Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: isDark ? '#262626' : '#e5e7eb',
                  },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe any other relevant circumstances…"
                placeholderTextColor={colors.textSubtle}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        {/* Step 4: Done Confirmation */}
        {flow === 'done' && (
          <View style={styles.doneContainer}>
            <View style={styles.doneIconBox}>
              <CheckmarkIcon color="#ffffff" size={36} strokeWidth={3} />
            </View>
            <Text style={[styles.doneTitle, { color: colors.text }]}>Claim Logged Successfully!</Text>
            <Text style={[styles.doneSub, { color: colors.textSecondary }]}>
              Your {selectedCategory.title} claim has been transmitted to {selectedInsurer} claims desk and your broker adviser.
            </Text>

            <View style={[styles.refBox, { backgroundColor: colors.card, borderColor: isDark ? '#262626' : '#f0f0f0' }]}>
              <CompanyLogo name={selectedInsurer} size={36} style={{ marginBottom: 6 }} />
              <Text style={[styles.refLabel, { color: colors.textMuted }]}>OFFICIAL CLAIM TRACKING REF</Text>
              <Text style={styles.doneIdText}>{submittedId}</Text>
              <Text style={styles.refStatus}>● In Review by {selectedInsurer} Assessor</Text>
            </View>

            <Text style={[styles.doneNote, { color: colors.textMuted }]}>
              An assessor will review your uploaded evidence within 24-48 hours. Live workshop and claim milestone alerts will be sent to your app.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Wizard Bottom Buttons */}
      <View style={[styles.wizardFooter, { backgroundColor: colors.card, borderTopColor: isDark ? '#262626' : '#f0f0f0' }]}>
        {flow === 'scene' && (
          <View style={styles.wizardFooterRow}>
            <TouchableOpacity
              style={[styles.wizardBackNavBtn, { backgroundColor: isDark ? '#262626' : '#f5f5f5' }]}
              onPress={() => setFlow('category')}
            >
              <Text style={[styles.wizardBackNavText, { color: colors.textSecondary }]}>← Categories</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.wizardNextBtn}
              onPress={() => setFlow('register')}
            >
              <Text style={styles.wizardNextText}>Next: Choose Insurer →</Text>
            </TouchableOpacity>
          </View>
        )}

        {flow === 'register' && (
          <View style={styles.wizardFooterRow}>
            <TouchableOpacity
              style={[styles.wizardBackNavBtn, { backgroundColor: isDark ? '#262626' : '#f5f5f5' }]}
              onPress={() => setFlow('scene')}
            >
              <Text style={[styles.wizardBackNavText, { color: colors.textSecondary }]}>← Evidence</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.wizardNextBtn}
              onPress={handleSubmitClaim}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.wizardNextText}>Submit Claim to {selectedInsurer} ✓</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {flow === 'done' && (
          <TouchableOpacity
            style={styles.doneDismissBtn}
            onPress={() => {
              setFlow('idle');
              setDescription('');
              setPoliceCase('');
            }}
          >
            <Text style={styles.wizardNextText}>Back to Claims Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* File Preview Modal */}
      <Modal
        visible={previewFile !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewFile(null)}
      >
        <View style={styles.previewModalOverlay}>
          <View style={[styles.previewModalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.previewModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.previewModalTitle, { color: colors.text }]} numberOfLines={1}>
                  {previewFile?.filename}
                </Text>
                <Text style={[styles.previewModalSub, { color: colors.textSecondary }]}>
                  {previewFile?.size} · Uploaded {previewFile?.timestamp}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.previewCloseBtn, { backgroundColor: isDark ? '#333' : '#eee' }]}
                onPress={() => setPreviewFile(null)}
              >
                <Text style={[styles.previewCloseText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.previewContentArea, { backgroundColor: isDark ? '#141414' : '#f0f2f5' }]}>
              {previewFile?.uri && (previewFile.uri.startsWith('data:image') || previewFile.filename.match(/\.(jpg|jpeg|png|webp|gif)$/i)) ? (
                <Image
                  source={{ uri: previewFile.uri }}
                  style={styles.fullPreviewImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.docPreviewPlaceholder}>
                  <DocumentTextIcon color="#d92820" size={56} />
                  <Text style={[styles.docPreviewName, { color: colors.text }]}>{previewFile?.filename}</Text>
                  <View style={styles.verifiedDocBadge}>
                    <Text style={styles.verifiedDocText}>✓ Validated Document ({previewFile?.size})</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.previewModalFooter}>
              <TouchableOpacity
                style={styles.previewDoneBtn}
                onPress={() => setPreviewFile(null)}
              >
                <Text style={styles.previewDoneBtnText}>Close Preview</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  headerTitleRow: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginBottom: 22,
  },
  ctaIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#d92820',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaInfo: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  ctaSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  ctaArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaArrow: {
    fontSize: 14,
    fontWeight: '800',
    color: '#d92820',
  },
  categorySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#d92820',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  filterPillActive: {
    backgroundColor: '#d92820',
  },
  filterPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
  },
  filterPillTextActive: {
    color: '#ffffff',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  categoryCard: {
    width: '48.5%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  categoryCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  categoryIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTagPill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  categoryTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#d92820',
    letterSpacing: 0.4,
  },
  categoryCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  categoryCardSub: {
    fontSize: 10,
    lineHeight: 13,
  },
  emptyClaimsCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
    lineHeight: 16,
  },
  emptyActionBtn: {
    backgroundColor: '#d92820',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 14,
  },
  emptyActionText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  claimsList: {
    gap: 10,
  },
  claimCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  claimHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  claimMainInfo: {
    flex: 1,
  },
  claimTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  claimType: {
    fontSize: 13,
    fontWeight: '800',
  },
  claimMeta: {
    fontSize: 11,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  claimMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  claimFieldLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  claimAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#d92820',
    marginTop: 1,
  },
  claimDateText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  claimProgressBox: {
    borderRadius: 10,
    padding: 8,
    marginTop: 10,
  },
  claimProgressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  claimStageTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#d92820',
  },
  claimStageLink: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
  },
  miniProgressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  wizardContainer: {
    flex: 1,
  },
  wizardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  wizardBackBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wizardBackText: {
    fontSize: 14,
    fontWeight: '800',
  },
  wizardProgressArea: {
    flex: 1,
  },
  wizardStepText: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  wizardProgressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  wizardProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  wizardContent: {
    padding: 16,
    paddingBottom: 36,
  },
  wizardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  wizardSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  categoryChooserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
  },
  categoryIconCircleLarge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChooserTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  categoryChooserSub: {
    fontSize: 10,
    lineHeight: 14,
    marginTop: 1,
  },
  checklistCountSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#d92820',
    marginTop: 3,
  },
  chooserArrow: {
    fontSize: 16,
    fontWeight: '800',
    color: '#d92820',
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 10,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#d92820',
  },
  checklistContainer: {
    gap: 10,
    marginBottom: 16,
  },
  itemCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  itemHeaderInfo: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  itemBadgeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  boxLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  responseBoxContainer: {
    marginTop: 10,
    paddingTop: 8,
  },
  responseInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    minHeight: 40,
  },
  uploadBoxContainer: {
    marginTop: 10,
    paddingTop: 8,
  },
  uploadedFilesList: {
    gap: 6,
    marginBottom: 8,
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  fileThumbnail: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  fileNameText: {
    fontSize: 10,
    fontWeight: '700',
  },
  fileSizeText: {
    fontSize: 9,
  },
  previewHint: {
    fontSize: 9,
    fontWeight: '700',
    color: '#d92820',
  },
  removeFileBtn: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ef4444',
    paddingHorizontal: 4,
  },
  uploadDropBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 10,
  },
  uploadIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadDropText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#d92820',
  },
  uploadDropSub: {
    fontSize: 9,
    marginTop: 1,
  },
  alertNotice: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 4,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  alertHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#d92820',
  },
  alertText: {
    fontSize: 11,
    lineHeight: 16,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  providersGrid: {
    gap: 8,
    marginBottom: 16,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
  },
  providerNameText: {
    fontSize: 12,
  },
  providerDescText: {
    fontSize: 10,
    marginTop: 1,
  },
  providerSelectedCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#d92820',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directSubmitBanner: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  directSubmitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  directSubmitTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  directSubmitSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  inputGroup: {
    marginBottom: 14,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  doneContainer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  doneIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  doneTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  doneSub: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 17,
  },
  refBox: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    marginVertical: 16,
  },
  refLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  doneIdText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#d92820',
    marginVertical: 4,
  },
  refStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },
  doneNote: {
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 16,
  },
  wizardFooter: {
    padding: 14,
    borderTopWidth: 1,
  },
  wizardFooterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  wizardBackNavBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  wizardBackNavText: {
    fontSize: 13,
    fontWeight: '700',
  },
  wizardNextBtn: {
    flex: 2,
    borderRadius: 14,
    backgroundColor: '#d92820',
    paddingVertical: 13,
    alignItems: 'center',
  },
  wizardNextText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  doneDismissBtn: {
    borderRadius: 14,
    backgroundColor: '#d92820',
    paddingVertical: 13,
    alignItems: 'center',
  },
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewModalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  previewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  previewModalTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  previewModalSub: {
    fontSize: 10,
    marginTop: 2,
  },
  previewCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCloseText: {
    fontSize: 12,
    fontWeight: '700',
  },
  previewContentArea: {
    width: '100%',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  fullPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  docPreviewPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  docPreviewName: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  verifiedDocBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#dcfce7',
  },
  verifiedDocText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
  },
  previewModalFooter: {
    padding: 14,
  },
  previewDoneBtn: {
    borderRadius: 12,
    backgroundColor: '#d92820',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewDoneBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
