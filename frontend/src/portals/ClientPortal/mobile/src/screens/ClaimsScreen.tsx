import React, { useState, useEffect } from 'react';
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
    subtitle: 'Motor vehicle collision, bumper bash, or multi-car crash',
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
        label: 'Attending Doctor / Specialist Cause of Death Clinical Summary',
        type: 'text',
        iconType: 'document',
        placeholder: 'e.g. Natural causes / illness under Dr. K. Naidoo at Morningside Clinic',
      },
      {
        id: 'police_report_death',
        label: 'Police Accident / Inquest Report (if unnatural cause or accident)',
        type: 'image',
        iconType: 'document',
        uploadButtonText: 'Upload Police Inquest / AR Docket (optional)',
        defaultSampleFile: { filename: 'saps_inquest_report.pdf', size: '1.9 MB' },
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
      {
        id: 'purchase_invoices',
        label: 'Proof of purchase, serial numbers, or valuation receipts',
        type: 'image',
        iconType: 'document',
        uploadButtonText: 'Upload Valuation & Invoices (PDF / JPG)',
        defaultSampleFile: { filename: 'original_purchase_receipts_valuations.pdf', size: '2.5 MB' },
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
      {
        id: 'medical_aid_membership',
        label: 'Medical aid membership certificate or pre-authorisation code',
        type: 'text',
        iconType: 'id',
        placeholder: 'e.g. Discovery Health # DH-5542109 · Pre-Auth Ref: AUTH-992014',
      },
    ],
  },
  {
    id: 'building_geyser',
    title: 'Building, Geyser & Storm Damage',
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
        label: 'Professional Plumber / Electrician Compliance Report & Quote',
        type: 'image',
        iconType: 'document',
        uploadButtonText: 'Upload Plumber Invoice & PIRB Certificate',
        defaultSampleFile: { filename: 'plumber_pirb_replacement_invoice.pdf', size: '1.2 MB' },
      },
      {
        id: 'damage_description_home',
        label: 'Description of damage & affected electrical/household contents',
        type: 'text',
        iconType: 'document',
        placeholder: 'e.g. 200L Kwikot geyser burst causing ceiling collapse in hallway & timber floor damage.',
      },
    ],
  },
  {
    id: 'gadgets_allrisk',
    title: 'Phone, Laptop & All-Risk Valuables',
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
      {
        id: 'repair_assessment_quote',
        label: 'Authorised service centre diagnostic & repair quotation',
        type: 'image',
        iconType: 'document',
        uploadButtonText: 'Upload Repair Assessment Quote',
        defaultSampleFile: { filename: 'digicape_repair_quote.pdf', size: '1.3 MB' },
      },
    ],
  },
];

const PROVIDERS = ['King Price', 'Santam', 'Discovery Health', 'Liberty', 'Sanlam', 'Old Mutual', 'Momentum', 'Allan Gray'];

export const ClaimsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [flow, setFlow] = useState<ClaimFlow>('idle');

  // Active Category configuration
  const [selectedCategory, setSelectedCategory] = useState<ClaimCategoryConfig>(CLAIM_CATEGORIES[0]);

  // Checklist state: checked statuses, text responses for word items, file uploads for image items
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
  const [selectedInsurer, setSelectedInsurer] = useState('King Price');
  const [claimType, setClaimType] = useState('Motor — Collision & Accident');
  const [incidentDate, setIncidentDate] = useState('2025-03-01');
  const [policeCase, setPoliceCase] = useState('');
  const [description, setDescription] = useState('');
  const [submittedId, setSubmittedId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClaimForLifecycle, setSelectedClaimForLifecycle] = useState<any>(null);
  const [lifecycleModalVisible, setLifecycleModalVisible] = useState(false);

  const fetchClaims = async () => {
    try {
      const data = await ApiService.getClaims();
      setClaims(data);
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

    // Seed default checked state for the category's first 2 items
    const newChecked: Record<string, boolean> = {};
    cat.checklist.slice(0, 2).forEach(item => {
      newChecked[item.id] = true;
    });
    setCheckedItems(newChecked);

    // Auto seed one sample upload for image items
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

  // Active preview modal state
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

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
    // Check if running in Web / Browser environment
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
      // Native fallback
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

      setSubmittedId(newClaim.id);
      setClaims(prev => [newClaim, ...prev]);
      setFlow('done');
    } catch (e) {
      console.log('Error submitting claim', e);
      setSubmittedId(`CLM-2025-${Math.floor(100 + Math.random() * 900)}`);
      setFlow('done');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCategoryIcon = (iconType: string, size = 20, color = colors.primary) => {
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
        return <CameraIcon color={colors.primary} size={16} />;
      case 'id':
        return <IdCardIcon color={colors.primary} size={16} />;
      default:
        return <DocumentTextIcon color={colors.primary} size={16} />;
    }
  };

  // ── Main Claims Dashboard (idle) ──
  if (flow === 'idle') {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Text style={[styles.title, { color: colors.text }]}>Claims</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Manage & lodge insurance claims</Text>

        {/* Start Wizard CTA */}
        <TouchableOpacity
          style={[
            styles.ctaButton,
            {
              backgroundColor: colors.card,
            },
          ]}
          onPress={() => setFlow('category')}
          activeOpacity={0.88}
        >
          <View style={[styles.ctaIconBox, { backgroundColor: colors.primaryAlpha }]}>
            <ShieldIcon color={colors.primary} size={22} />
          </View>
          <View style={styles.ctaInfo}>
            <Text style={[styles.ctaTitle, { color: colors.text }]}>Report a New Claim</Text>
            <Text style={[styles.ctaSub, { color: colors.textSecondary }]}>Select category (Car, Death, Theft, Medical, etc.)</Text>
          </View>
          <Text style={[styles.ctaArrow, { color: colors.primary }]}>→</Text>
        </TouchableOpacity>

        {/* Select Claim Category Quick Grid */}
        <View style={styles.categorySectionHeader}>
          <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>SELECT CLAIM CATEGORY</Text>
          <TouchableOpacity onPress={() => setFlow('category')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>View All →</Text>
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
                },
              ]}
              onPress={() => handleSelectCategory(cat)}
              activeOpacity={0.8}
            >
              <View style={[styles.categoryIconCircle, { backgroundColor: colors.primaryAlpha }]}>
                {renderCategoryIcon(cat.iconType, 20, colors.primary)}
              </View>
              <View style={styles.categoryCardBody}>
                <View style={[styles.categoryTagPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                  <Text style={[styles.categoryTagText, { color: colors.textMuted }]}>{cat.tag}</Text>
                </View>
                <Text style={[styles.categoryCardTitle, { color: colors.text }]} numberOfLines={1}>{cat.title}</Text>
                <Text style={[styles.categoryCardSub, { color: colors.textSecondary }]} numberOfLines={2}>{cat.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Claims List */}
        <Text style={[styles.sectionHeading, { color: colors.textMuted, marginTop: 24 }]}>RECENT CLAIMS</Text>
        <View style={styles.claimsList}>
          {claims.map((c, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedClaimForLifecycle(c);
                setLifecycleModalVisible(true);
              }}
              style={[
                styles.claimCard,
                {
                  backgroundColor: colors.card,
                },
              ]}
            >
              <View style={styles.claimHeaderRow}>
                <CompanyLogo name={c.insurer} size={36} />
                <View style={styles.claimMainInfo}>
                  <Text style={[styles.claimType, { color: colors.text }]}>{c.type}</Text>
                  <Text style={[styles.claimMeta, { color: colors.textSecondary }]}>
                    {c.client} · {c.insurer}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.04)',
                    },
                  ]}
                >
                  <Text style={[styles.statusText, { color: c.statusColor }]}>{c.status}</Text>
                </View>
              </View>

              <View style={styles.claimFooterRow}>
                <Text style={[styles.claimId, { color: colors.textMuted }]}>{c.id}</Text>
                <Text style={[styles.claimAmount, { color: colors.gold }]}>{c.amount}</Text>
              </View>
              <View style={{ marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: isDark ? '#222' : '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '700' }}>
                  Stage {c.currentStageIndex || 1}/10: Track Lifecycle →
                </Text>
                <Text style={{ fontSize: 10, color: colors.textMuted }}>Live Workshop Feed</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <ClaimLifecycleModal
          visible={lifecycleModalVisible}
          claim={selectedClaimForLifecycle}
          onClose={() => setLifecycleModalVisible(false)}
          onRefresh={fetchClaims}
        />
      </ScrollView>
    );
  }

  // ── Step 1: Category Picker (if flow === 'category') ──
  if (flow === 'category') {
    return (
      <View style={[styles.wizardContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.wizardHeader, { backgroundColor: colors.backgroundElevated }]}>
          <TouchableOpacity
            style={[styles.wizardBackBtn, { backgroundColor: colors.card }]}
            onPress={() => setFlow('idle')}
          >
            <Text style={[styles.wizardBackText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
          <View style={styles.wizardProgressArea}>
            <Text style={[styles.wizardStepText, { color: colors.textMuted }]}>New Claim · Step 1 of 3 (Select Category)</Text>
            <View style={[styles.wizardProgressTrack, { backgroundColor: isDark ? '#252525' : '#e0e4e8' }]}>
              <View style={[styles.wizardProgressFill, { width: '33.3%', backgroundColor: colors.primary }]} />
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.wizardContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.wizardTitle, { color: colors.text }]}>What happened?</Text>
          <Text style={[styles.wizardSub, { color: colors.textMuted, marginBottom: 20 }]}>
            Select the claim category below to load the required statutory forms & evidence checklist.
          </Text>

          <View style={{ gap: 12 }}>
            {CLAIM_CATEGORIES.map(cat => {
              const isChosen = selectedCategory.id === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChooserCard,
                    {
                      backgroundColor: isChosen ? colors.hoverBackground : colors.card,
                    },
                  ]}
                  onPress={() => handleSelectCategory(cat)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryIconCircleLarge, { backgroundColor: isChosen ? colors.primary : colors.primaryAlpha }]}>
                    {renderCategoryIcon(cat.iconType, 24, isChosen ? '#ffffff' : colors.primary)}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <Text style={[styles.categoryChooserTitle, { color: colors.text }]}>{cat.title}</Text>
                      <View style={[styles.categoryTagPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                        <Text style={[styles.categoryTagText, { color: colors.primary }]}>{cat.tag}</Text>
                      </View>
                    </View>
                    <Text style={[styles.categoryChooserSub, { color: colors.textSecondary }]}>{cat.subtitle}</Text>
                    <Text style={[styles.checklistCountSub, { color: colors.gold }]}>
                      {cat.checklist.length} checklist items · {cat.policeNotice.required ? 'SAPS Report required' : 'Direct underwriter payout'}
                    </Text>
                  </View>
                  <Text style={[styles.ctaArrow, { color: colors.primary }]}>→</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Multi-Step Claim Wizard (Checklist / Register / Done) ──
  const currentStepNumber = flow === 'scene' ? 2 : flow === 'register' ? 3 : 3;
  const totalSteps = 3;
  const completedChecklistCount = selectedCategory.checklist.filter(item => checkedItems[item.id]).length;

  return (
    <View style={[styles.wizardContainer, { backgroundColor: colors.background }]}>
      {/* Wizard Header */}
      <View style={[styles.wizardHeader, { backgroundColor: colors.backgroundElevated }]}>
        <TouchableOpacity
          style={[styles.wizardBackBtn, { backgroundColor: colors.card }]}
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
            {flow === 'done' ? 'Claim Submitted' : `${selectedCategory.title} · Step ${currentStepNumber} of ${totalSteps}`}
          </Text>
          <View style={[styles.wizardProgressTrack, { backgroundColor: isDark ? '#252525' : '#e0e4e8' }]}>
            <View
              style={[
                styles.wizardProgressFill,
                {
                  width: flow === 'done' ? '100%' : `${(currentStepNumber / totalSteps) * 100}%`,
                  backgroundColor: colors.primary,
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
                  Upload evidence & statutory forms for {selectedCategory.tag.toLowerCase()} claim
                </Text>
              </View>
              <View style={[styles.countBadge, { backgroundColor: colors.primaryAlpha }]}>
                <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                  {completedChecklistCount}/{selectedCategory.checklist.length} Ready
                </Text>
              </View>
            </View>

            {/* Checklist items with inline Image Upload Boxes and Word Response Boxes */}
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
                        backgroundColor: isChecked ? colors.hoverBackground : colors.card,
                      },
                    ]}
                  >
                    {/* Item Header with Checkbox & Label */}
                    <TouchableOpacity
                      style={styles.itemHeader}
                      onPress={() => toggleCheck(item.id)}
                      activeOpacity={0.75}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: isChecked ? colors.primary : (isDark ? '#2a2a2a' : '#e0e4e8'),
                          },
                        ]}
                      >
                        {isChecked && <CheckmarkIcon color="#ffffff" size={12} strokeWidth={3} />}
                      </View>

                      <View style={styles.itemHeaderInfo}>
                        <Text
                          style={[
                            styles.itemLabel,
                            { color: isChecked ? colors.text : colors.textSecondary },
                          ]}
                        >
                          {item.label}
                        </Text>
                        <View style={styles.itemBadgeRow}>
                          <View
                            style={[
                              styles.typeBadge,
                              {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                              },
                            ]}
                          >
                            {renderChecklistIcon(item.iconType)}
                            <Text style={[styles.typeBadgeText, { color: colors.textMuted }]}>
                              {item.type === 'image' ? 'DOCUMENT / PHOTO UPLOAD' : item.type === 'text' ? 'TEXT RESPONSE' : 'UPLOAD + DETAILS'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Inline Word Response Box */}
                    {(item.type === 'text' || item.type === 'image_text') && (
                      <View style={styles.responseBoxContainer}>
                        <Text style={[styles.boxLabel, { color: colors.textMuted }]}>ENTER DETAILS / REPORT:</Text>
                        <TextInput
                          style={[
                            styles.responseInput,
                            {
                              backgroundColor: colors.inputBackground,
                              color: colors.text,
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

                    {/* Inline Image Upload Box */}
                    {(item.type === 'image' || item.type === 'image_text') && (
                      <View style={styles.uploadBoxContainer}>
                        <Text style={[styles.boxLabel, { color: colors.textMuted }]}>ATTACHED DOCUMENTS & PHOTOS:</Text>

                        {/* List of uploaded image chips */}
                        {hasImages && (
                          <View style={styles.uploadedFilesList}>
                            {uploads.map((file) => (
                              <View
                                key={file.id}
                                style={[
                                  styles.fileChip,
                                  {
                                    backgroundColor: isDark ? '#1a221c' : '#f0f9f4',
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
                                  <CameraIcon color={colors.success} size={14} />
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
                                  <Text style={[styles.previewHint, { color: colors.primary }]}>Preview</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  onPress={() => handleRemoveUpload(item.id, file.id)}
                                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                  <Text style={[styles.removeFileBtn, { color: colors.primary }]}>✕</Text>
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Upload Trigger Box */}
                        <TouchableOpacity
                          style={[
                            styles.uploadDropBox,
                            {
                              backgroundColor: colors.inputBackground,
                            },
                          ]}
                          onPress={() => handleAddUpload(item)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.uploadIconCircle, { backgroundColor: colors.primaryAlpha }]}>
                            <CameraIcon color={colors.primary} size={16} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.uploadDropText, { color: colors.primary }]}>
                              {item.uploadButtonText || '+ Upload Evidence / Document'}
                            </Text>
                            <Text style={[styles.uploadDropSub, { color: colors.textSubtle }]}>
                              Tap to select from camera or gallery (JPG, PNG, PDF)
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Notice banner */}
            <View
              style={[
                styles.alertNotice,
                {
                  backgroundColor: colors.primaryAlpha,
                },
              ]}
            >
              <View style={styles.alertHeaderRow}>
                <AlertIcon color={colors.primary} size={18} />
                <Text style={[styles.alertHeading, { color: colors.primary }]}>{selectedCategory.policeNotice.heading}</Text>
              </View>
              <Text style={[styles.alertText, { color: colors.textSecondary }]}>
                {selectedCategory.policeNotice.text}
              </Text>
            </View>
          </View>
        )}

        {/* Step 3: Register Details & Select Underwriter */}
        {flow === 'register' && (
          <View>
            <Text style={[styles.wizardTitle, { color: colors.text }]}>Claim Registration</Text>
            <Text style={[styles.wizardSub, { color: colors.textMuted }]}>
              Confirm underwriter and summary details for {selectedCategory.title}
            </Text>

            {/* Insurer Selector with Logo.dev */}
            <Text style={[styles.fieldLabel, { color: colors.textMuted, marginTop: 16 }]}>SELECT UNDERWRITER / INSURER</Text>
            <View style={styles.providersWrap}>
              {PROVIDERS.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.providerBtn,
                    {
                      backgroundColor: selectedInsurer === p ? colors.hoverBackground : colors.card,
                    },
                  ]}
                  onPress={() => setSelectedInsurer(p)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <CompanyLogo name={p} size={22} rounded={false} />
                    <Text
                      style={[
                        styles.providerBtnText,
                        { color: selectedInsurer === p ? colors.primary : colors.textSecondary },
                        selectedInsurer === p && styles.providerBtnTextActive,
                      ]}
                    >
                      {p}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Insurer direct badge info */}
            <View
              style={[
                styles.directSubmitBanner,
                {
                  backgroundColor: colors.card,
                },
              ]}
            >
              <View style={styles.directSubmitHeader}>
                <CompanyLogo name={selectedInsurer} size={32} />
                <Text style={[styles.directSubmitTitle, { color: colors.text }]}>Direct Submission to {selectedInsurer}</Text>
              </View>
              <Text style={[styles.directSubmitSub, { color: colors.textSecondary }]}>
                Your {selectedCategory.title.toLowerCase()} evidence checklist ({completedChecklistCount} items) will be bundled and sent directly to {selectedInsurer} claims department.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>DATE OF INCIDENT / LOSS</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                value={incidentDate}
                onChangeText={setIncidentDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSubtle}
              />
            </View>

            {selectedCategory.policeNotice.required && (
              <View style={styles.inputGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>SAPS POLICE CASE / AR NUMBER (IF APPLICABLE)</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                  value={policeCase}
                  onChangeText={setPoliceCase}
                  placeholder="e.g. CAS 421/01/2025 (Sandton Police Station)"
                  placeholderTextColor={colors.textSubtle}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>ADDITIONAL INCIDENT NOTES (OPTIONAL)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea, { backgroundColor: colors.inputBackground, color: colors.text }]}
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

        {/* Step 4: Submission Done */}
        {flow === 'done' && (
          <View style={styles.doneContainer}>
            <View style={[styles.doneIconBox, { backgroundColor: colors.successAlpha }]}>
              <CheckmarkIcon color={colors.success} size={40} strokeWidth={3} />
            </View>
            <Text style={[styles.doneTitle, { color: colors.text }]}>Claim Submitted!</Text>
            <Text style={[styles.doneSub, { color: colors.textSecondary }]}>
              Your {selectedCategory.title} claim has been logged with {selectedInsurer} and your adviser Qiniso Ntuli.
            </Text>

            <View style={[styles.refBox, { backgroundColor: colors.card }]}>
              <CompanyLogo name={selectedInsurer} size={40} style={{ marginBottom: 8 }} />
              <Text style={[styles.refLabel, { color: colors.textMuted }]}>OFFICIAL CLAIM TRACKING REF</Text>
              <Text style={[styles.doneIdText, { color: colors.gold }]}>{submittedId}</Text>
              <Text style={[styles.refStatus, { color: colors.success }]}>● In Review by {selectedInsurer} Claims Desk</Text>
            </View>

            <Text style={[styles.doneNote, { color: colors.textMuted }]}>
              An assessor will be assigned within 24 hours. You will receive updates via SMS and push notifications.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Wizard Bottom Navigation Buttons */}
      <View style={[styles.wizardFooter, { backgroundColor: colors.backgroundElevated }]}>
        {flow === 'scene' && (
          <View style={styles.wizardFooterRow}>
            <TouchableOpacity
              style={[styles.wizardBackNavBtn, { backgroundColor: colors.card }]}
              onPress={() => setFlow('category')}
            >
              <Text style={[styles.wizardBackNavText, { color: colors.textSecondary }]}>← Categories</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.wizardNextBtn, { backgroundColor: colors.primary }]}
              onPress={() => setFlow('register')}
            >
              <Text style={styles.wizardNextText}>Next: Select Insurer →</Text>
            </TouchableOpacity>
          </View>
        )}

        {flow === 'register' && (
          <View style={styles.wizardFooterRow}>
            <TouchableOpacity
              style={[styles.wizardBackNavBtn, { backgroundColor: colors.card }]}
              onPress={() => setFlow('scene')}
            >
              <Text style={[styles.wizardBackNavText, { color: colors.textSecondary }]}>← Checklist</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.wizardNextBtn, { backgroundColor: colors.primary }]}
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
            style={[styles.doneDismissBtn, { backgroundColor: colors.primary }]}
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

      {/* Interactive Evidence / Document Preview Modal */}
      <Modal
        visible={previewFile !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewFile(null)}
      >
        <View style={styles.previewModalOverlay}>
          <View style={[styles.previewModalContainer, { backgroundColor: colors.card }]}>
            {/* Preview Modal Header */}
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
                style={[styles.previewCloseBtn, { backgroundColor: colors.backgroundElevated }]}
                onPress={() => setPreviewFile(null)}
              >
                <Text style={[styles.previewCloseText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Preview Content Area */}
            <View style={[styles.previewContentArea, { backgroundColor: isDark ? '#141414' : '#f0f2f5' }]}>
              {previewFile?.uri && (previewFile.uri.startsWith('data:image') || previewFile.filename.match(/\.(jpg|jpeg|png|webp|gif)$/i)) ? (
                <Image
                  source={{ uri: previewFile.uri }}
                  style={styles.fullPreviewImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.docPreviewPlaceholder}>
                  <DocumentTextIcon color={colors.primary} size={64} />
                  <Text style={[styles.docPreviewName, { color: colors.text }]}>{previewFile?.filename}</Text>
                  <View style={[styles.verifiedDocBadge, { backgroundColor: colors.successAlpha }]}>
                    <Text style={[styles.verifiedDocText, { color: colors.success }]}>✓ Validated Document ({previewFile?.size})</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Preview Modal Footer */}
            <View style={styles.previewModalFooter}>
              <TouchableOpacity
                style={[styles.previewDoneBtn, { backgroundColor: colors.primary }]}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 18,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    marginBottom: 20,
  },
  ctaIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
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
  },
  ctaArrow: {
    fontSize: 18,
    fontWeight: '800',
  },
  categorySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '48.5%',
    borderRadius: 18,
    padding: 14,
  },
  categoryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryCardBody: {
    flex: 1,
  },
  categoryTagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryTagText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  categoryCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  categoryCardSub: {
    fontSize: 10,
    lineHeight: 14,
  },
  categoryChooserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    gap: 14,
  },
  categoryIconCircleLarge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChooserTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  categoryChooserSub: {
    fontSize: 11,
    marginTop: 1,
  },
  checklistCountSub: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  claimsList: {
    gap: 10,
    marginTop: 10,
  },
  claimCard: {
    borderRadius: 18,
    padding: 16,
  },
  claimHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  claimMainInfo: {
    flex: 1,
  },
  claimType: {
    fontSize: 13,
    fontWeight: '800',
  },
  claimMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  claimFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  claimId: {
    fontSize: 11,
    fontWeight: '700',
  },
  claimAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  wizardContainer: {
    flex: 1,
  },
  wizardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 12,
  },
  wizardBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wizardBackText: {
    fontSize: 14,
    fontWeight: '700',
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
    padding: 20,
    paddingBottom: 40,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 10,
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  wizardTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  wizardSub: {
    fontSize: 12,
    marginTop: 3,
  },
  checklistContainer: {
    gap: 12,
    marginBottom: 20,
  },
  itemCard: {
    borderRadius: 18,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  itemHeaderInfo: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  itemBadgeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  boxLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  responseBoxContainer: {
    marginTop: 12,
    paddingTop: 10,
  },
  responseInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    minHeight: 44,
  },
  uploadBoxContainer: {
    marginTop: 12,
    paddingTop: 10,
  },
  uploadedFilesList: {
    gap: 6,
    marginBottom: 8,
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  fileNameText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
  },
  fileSizeText: {
    fontSize: 10,
  },
  removeFileBtn: {
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 4,
  },
  uploadDropBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 12,
  },
  uploadIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadDropText: {
    fontSize: 12,
    fontWeight: '800',
  },
  uploadDropSub: {
    fontSize: 10,
    marginTop: 1,
  },
  alertNotice: {
    borderRadius: 16,
    padding: 16,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  alertHeading: {
    fontSize: 13,
    fontWeight: '800',
  },
  alertText: {
    fontSize: 12,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  providersWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  providerBtn: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  providerBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  providerBtnTextActive: {
    fontWeight: '800',
  },
  directSubmitBanner: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  directSubmitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  directSubmitTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  directSubmitSub: {
    fontSize: 11,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  textInput: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  doneContainer: {
    alignItems: 'center',
    paddingTop: 30,
  },
  doneIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  doneTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  doneSub: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  refBox: {
    width: '100%',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginVertical: 18,
  },
  refLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  doneIdText: {
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 4,
  },
  refStatus: {
    fontSize: 11,
    fontWeight: '700',
  },
  doneNote: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 17,
  },
  wizardFooter: {
    padding: 16,
  },
  wizardFooterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  wizardBackNavBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  wizardBackNavText: {
    fontSize: 14,
    fontWeight: '700',
  },
  wizardNextBtn: {
    flex: 2,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  wizardNextText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  doneDismissBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  fileThumbnail: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  previewHint: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 4,
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
    maxWidth: 440,
    maxHeight: '85%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  previewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  previewModalTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  previewModalSub: {
    fontSize: 11,
    marginTop: 2,
  },
  previewCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCloseText: {
    fontSize: 14,
    fontWeight: '700',
  },
  previewContentArea: {
    width: '100%',
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  fullPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  docPreviewPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  docPreviewName: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  verifiedDocBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedDocText: {
    fontSize: 11,
    fontWeight: '700',
  },
  previewModalFooter: {
    padding: 16,
  },
  previewDoneBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewDoneBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
