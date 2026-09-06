export type AppStage = 'splash' | 'onboard' | 'login' | 'register' | 'app';
export type Screen = 'home' | 'portfolio' | 'goals' | 'claims' | 'profile';
export type ClaimFlow = 'idle' | 'category' | 'scene' | 'register' | 'done';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  idNumber?: string;
  phone?: string;
  role: 'Client' | 'Adviser';
}

export interface AssignedAdvisor {
  name: string;
  title: string;
  fspNumber: string;
  phone: string;
  email: string;
  office: string;
  initials: string;
  appointmentStatus: string;
  appointmentDate: string;
}

export interface Policy {
  id: string;
  title: string;
  provider: string;
  policyNumber: string;
  category: 'Investments' | 'Medical' | 'Short-Term' | 'Life & Risk';
  fundValue?: string;
  coverAmount?: string;
  monthlyPremium: string;
  status: 'Active' | 'Under Review' | 'Lapsed';
  inceptionDate: string;
  beneficiaries?: string;
  coverDetails?: string;
  history?: number[];
}

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  idNumber: string;
  email: string;
  phone: string;
  physicalAddress: string;
  bankDetails: string;
  kycStatus: 'Verified' | 'Pending';
  memberSince: string;
  totalNetWorth: number;
  totalNetWorthFormatted: string;
  totalMonthlyPremium: string;
  totalCoverFormatted: string;
  activePoliciesCount: number;
  goalCompletionRate: number;
  assignedAdvisor: AssignedAdvisor;
}

export interface Goal {
  id: string;
  label: string;
  current: number;
  target: number;
  deadline: string;
  color: string;
}

export interface Claim {
  id: string;
  type: string;
  client: string;
  insurer: string;
  status: 'Submitted' | 'In Progress' | 'Settled' | 'Action Required' | string;
  amount: string;
  statusColor: string;
  incidentDate?: string;
  policeCaseNo?: string;
  driver?: string;
  description?: string;
  checkedItems?: string[];
  documents?: string[];
  currentStageIndex?: number;
  reference?: string;
  vehicle?: string;
  stage1_insurerClaimNumber?: string;
  stage1_claimsHandlerName?: string;
  stage1_claimsHandlerPhone?: string;
  stage1_claimsHandlerEmail?: string;
  stage2_assessmentCentre?: string;
  stage2_assessmentDate?: string;
  stage2_assessmentTime?: string;
  stage2_assessmentStatus?: string;
  stage3_damageAssessedAmount?: string;
  stage3_damageScope?: string;
  stage5_repairAuthorisationNumber?: string;
  stage5_authorisedAmount?: string;
  stage5_excessAmount?: string;
  stage6_dropOffDate?: string;
  stage6_dropOffTime?: string;
  stage6_dropOffConfirmed?: boolean;
  stage7_carHireCompany?: string;
  stage7_carHireVoucher?: string;
  stage7_carHireStatus?: string;
  stage8_repairProgressPercent?: number;
  stage8_weeklyUpdates?: any[];
  stage9_readyForCollectionDate?: string;
  stage10_rating?: number;
  stage10_reviewComment?: string;
  stage10_claimClosed?: boolean;
}

export interface Reminder {
  id: string;
  icon: string;
  label: string;
  sub: string;
  urgent: boolean;
}

export interface ExpiringDocument {
  id: string;
  name: string;
  category: 'Compliance' | 'Motor' | 'Identification' | 'Tax & SARS' | 'Advisory Mandate';
  expiryDate: string;
  daysRemaining: number;
  status: 'critical' | 'warning' | 'valid' | 'expired';
  issuer: string;
  smsAlertEnabled: boolean;
  emailAlertEnabled: boolean;
  lastNotified?: string;
  documentRef?: string;
}

export interface NotificationSettings {
  smsEnabled: boolean;
  smsRecipient: string;
  emailEnabled: boolean;
  emailRecipient: string;
  pushEnabled: boolean;
  advanceDays: number[];
}

export interface AppNotification {
  id: string;
  category: 'claim' | 'policy' | 'document' | 'advisory' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionScreen?: Screen;
  badgeText?: string;
  urgent?: boolean;
}

export interface AdvisorProfile extends AssignedAdvisor {
  aumFormatted?: string;
  clientsCount?: number;
  productsCount?: number;
  website?: string;
  feeUpfront?: string;
  feeOngoing?: string;
}


