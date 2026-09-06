import { useState, useEffect, useMemo } from 'react';
import { ClipLoader } from 'react-spinners';
import { toast } from 'sonner';
import { 
  FiPlus, FiSearch, FiFilter, FiUser, FiPhone, FiMail, 
  FiShield, FiAlertCircle, FiFileText, FiTarget, 
  FiCheckCircle, FiClock, FiX, FiDownload, FiUpload, FiSend,
  FiEdit3, FiRefreshCw, FiCreditCard
} from 'react-icons/fi';
import { apiRequest } from '../../../lib/api';
import { CompanyLogo } from '../../../components/CompanyLogo';

interface ClientItem {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email?: string;
  idNumber?: string;
  kycStatus: 'verified' | 'pending' | 'in_review' | 'rejected' | string;
  riskProfile: 'Low' | 'Medium' | 'High' | string;
  assignedAdviserId?: string;
  createdAt: string;
  _count?: {
    policies?: number;
    claims?: number;
    documents?: number;
    goals?: number;
  };
}

interface ClientDetail extends ClientItem {
  policies: Array<{
    id: string;
    policyNumber: string;
    type: string;
    premium: number;
    sumAssured?: number;
    status: string;
    inceptionDate?: string;
    insurer?: {
      id: string;
      name: string;
      domain?: string;
    };
  }>;
  claims: Array<{
    id: string;
    reference: string;
    type: string;
    amount: number;
    status: string;
    incidentDate: string;
    description: string;
    createdAt: string;
  }>;
  goals: Array<{
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate?: string;
    contributionAmount?: number;
    contributionFrequency?: string;
    status?: string;
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    url?: string;
    createdAt: string;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    date: string;
    status: string;
    reference?: string;
  }>;
}

export const AdminClients = () => {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [kycFilter, setKycFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  // Active Client Detail
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientDetail, setClientDetail] = useState<ClientDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'claims' | 'goals' | 'documents' | 'message'>('overview');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
  const [showAddClaimModal, setShowAddClaimModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);

  // Insurers list for policy modal
  const [insurers, setInsurers] = useState<Array<{ id: string; name: string; domain?: string }>>([]);

  // Form states
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    idNumber: '',
    riskProfile: 'Medium',
    kycStatus: 'pending'
  });
  const [isSubmittingClient, setIsSubmittingClient] = useState(false);

  const [editClientData, setEditClientData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    idNumber: '',
    riskProfile: 'Medium',
    kycStatus: 'pending'
  });
  const [isUpdatingClient, setIsUpdatingClient] = useState(false);

  // Add Policy form
  const [newPolicy, setNewPolicy] = useState({
    insurerId: '',
    policyNumber: '',
    type: 'Life Cover',
    premium: '',
    sumAssured: '',
    status: 'active'
  });
  const [isSubmittingPolicy, setIsSubmittingPolicy] = useState(false);

  // Add Claim form
  const [newClaim, setNewClaim] = useState({
    type: 'Accident / Loss',
    amount: '',
    description: '',
    policyId: ''
  });
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  // Add Goal form
  const [newGoal, setNewGoal] = useState({
    name: 'Emergency Fund',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    contributionAmount: '500',
    contributionFrequency: 'Monthly'
  });
  const [isSubmittingGoal, setIsSubmittingGoal] = useState(false);

  // Upload Doc form
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docCategory, setDocCategory] = useState('KYC / ID');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Message form
  const [messageForm, setMessageForm] = useState({ title: '', body: '', channel: 'in_app' });
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const loadClients = async () => {
    try {
      const data = await apiRequest<ClientItem[]>('/crm/clients');
      setClients(data);
    } catch {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadInsurers = async () => {
    try {
      const data = await apiRequest<any[]>('/insurers');
      setInsurers(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadClients();
    loadInsurers();
  }, []);

  const fetchClientProfile = async (id: string) => {
    setSelectedClientId(id);
    setLoadingDetail(true);
    try {
      const detail = await apiRequest<ClientDetail>(`/crm/clients/${id}`);
      setClientDetail(detail);
      setEditClientData({
        firstName: detail.firstName || '',
        lastName: detail.lastName || '',
        mobile: detail.mobile || '',
        email: detail.email || '',
        idNumber: detail.idNumber || '',
        riskProfile: detail.riskProfile || 'Medium',
        kycStatus: detail.kycStatus || 'pending'
      });
    } catch {
      toast.error('Failed to load client profile');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleQuickKycChange = async (clientId: string, newStatus: string) => {
    try {
      await apiRequest(`/crm/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify({ kycStatus: newStatus })
      });
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, kycStatus: newStatus } : c));
      if (clientDetail && clientDetail.id === clientId) {
        setClientDetail({ ...clientDetail, kycStatus: newStatus });
      }
      toast.success(`KYC status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update KYC status');
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.firstName.trim() || !newClient.lastName.trim() || !newClient.mobile.trim()) {
      toast.error('First name, last name, and mobile are required');
      return;
    }
    setIsSubmittingClient(true);
    try {
      const created = await apiRequest<ClientItem>('/crm/clients', {
        method: 'POST',
        body: JSON.stringify(newClient)
      });
      setClients(prev => [created, ...prev]);
      setShowAddModal(false);
      setNewClient({
        firstName: '',
        lastName: '',
        mobile: '',
        email: '',
        idNumber: '',
        riskProfile: 'Medium',
        kycStatus: 'pending'
      });
      toast.success('Client registered successfully');
      fetchClientProfile(created.id);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create client');
    } finally {
      setIsSubmittingClient(false);
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientDetail) return;
    setIsUpdatingClient(true);
    try {
      await apiRequest<ClientDetail>(`/crm/clients/${clientDetail.id}`, {
        method: 'PUT',
        body: JSON.stringify(editClientData)
      });
      setClientDetail(prev => prev ? { ...prev, ...editClientData } : null);
      setClients(prev => prev.map(c => c.id === clientDetail.id ? { ...c, ...editClientData } : c));
      setShowEditModal(false);
      toast.success('Client information updated');
    } catch {
      toast.error('Failed to update client');
    } finally {
      setIsUpdatingClient(false);
    }
  };

  const handleAddPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientDetail) return;
    if (!newPolicy.policyNumber || !newPolicy.premium) {
      toast.error('Policy number and premium are required');
      return;
    }
    setIsSubmittingPolicy(true);
    try {
      await apiRequest('/policies', {
        method: 'POST',
        body: JSON.stringify({
          clientId: clientDetail.id,
          insurerId: newPolicy.insurerId || undefined,
          policyNumber: newPolicy.policyNumber,
          type: newPolicy.type,
          premium: newPolicy.premium,
          sumAssured: newPolicy.sumAssured || '0',
          status: newPolicy.status
        })
      });
      toast.success('Policy successfully linked to client');
      setShowAddPolicyModal(false);
      setNewPolicy({
        insurerId: '',
        policyNumber: '',
        type: 'Life Cover',
        premium: '',
        sumAssured: '',
        status: 'active'
      });
      fetchClientProfile(clientDetail.id);
      loadClients();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create policy');
    } finally {
      setIsSubmittingPolicy(false);
    }
  };

  const handleAddClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientDetail) return;
    if (!newClaim.description.trim()) {
      toast.error('Description is required');
      return;
    }
    setIsSubmittingClaim(true);
    try {
      await apiRequest('/claims', {
        method: 'POST',
        body: JSON.stringify({
          clientId: clientDetail.id,
          type: newClaim.type,
          amount: newClaim.amount || '0',
          description: newClaim.description,
          policyId: newClaim.policyId || undefined
        })
      });
      toast.success('Claim logged successfully');
      setShowAddClaimModal(false);
      setNewClaim({ type: 'Accident / Loss', amount: '', description: '', policyId: '' });
      fetchClientProfile(clientDetail.id);
      loadClients();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to file claim');
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientDetail) return;
    if (!newGoal.name || !newGoal.targetAmount) {
      toast.error('Goal name and target amount are required');
      return;
    }
    setIsSubmittingGoal(true);
    try {
      await apiRequest('/goals', {
        method: 'POST',
        body: JSON.stringify({
          clientId: clientDetail.id,
          name: newGoal.name,
          targetAmount: newGoal.targetAmount,
          currentAmount: newGoal.currentAmount || '0',
          targetDate: newGoal.targetDate || undefined,
          contributionAmount: newGoal.contributionAmount || undefined,
          contributionFrequency: newGoal.contributionFrequency || undefined
        })
      });
      toast.success('Goal created successfully');
      setShowAddGoalModal(false);
      setNewGoal({ name: 'Emergency Fund', targetAmount: '', currentAmount: '', targetDate: '', contributionAmount: '500', contributionFrequency: 'Monthly' });
      fetchClientProfile(clientDetail.id);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create goal');
    } finally {
      setIsSubmittingGoal(false);
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientDetail || !docFile) {
      toast.error('Please select a file to upload');
      return;
    }
    setIsUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', docFile);
      formData.append('category', docCategory);
      formData.append('clientId', clientDetail.id);

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      toast.success('Document uploaded and verified');
      setShowUploadDocModal(false);
      setDocFile(null);
      fetchClientProfile(clientDetail.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload document');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientDetail || !messageForm.title || !messageForm.body) {
      toast.error('Title and message body are required');
      return;
    }
    setIsSendingMessage(true);
    try {
      await apiRequest('/notifications', {
        method: 'POST',
        body: JSON.stringify({
          clientId: clientDetail.id,
          title: messageForm.title,
          body: messageForm.body,
          channel: messageForm.channel
        })
      });
      toast.success('Notification dispatched to client');
      setMessageForm({ title: '', body: '', channel: 'in_app' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || (
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.mobile.includes(q) ||
        (c.idNumber && c.idNumber.includes(q))
      );
      const matchKyc = kycFilter === 'all' || c.kycStatus === kycFilter;
      const matchRisk = riskFilter === 'all' || c.riskProfile === riskFilter;
      return matchSearch && matchKyc && matchRisk;
    });
  }, [clients, searchQuery, kycFilter, riskFilter]);

  // High-level Stats
  const totalCount = clients.length;
  const verifiedCount = clients.filter(c => c.kycStatus === 'verified').length;
  const pendingCount = clients.filter(c => c.kycStatus === 'pending' || c.kycStatus === 'in_review').length;
  const verifiedPercentage = totalCount ? Math.round((verifiedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4">
        <ClipLoader color="#d92820" size={40} />
        <p className="text-gray-500 text-sm font-medium">Loading client directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Header & Top Actions ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Client Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Comprehensive directory of policyholders, FICA compliance, active cover, and records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setRefreshing(true); loadClients(); }}
            disabled={refreshing}
            className="p-2.5 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            title="Refresh list"
          >
            <FiRefreshCw className={`text-base ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#d92820] hover:bg-[#b8201a] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <FiPlus className="text-lg" />
            Add New Client
          </button>
        </div>
      </div>

      {/* ─── Metric Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Clients</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</div>
            <span className="text-xs text-gray-500 mt-0.5 inline-block">Registered policyholders</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-[#d92820] flex items-center justify-center text-xl font-bold">
            <FiUser />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">FICA Verified</span>
            <div className="text-2xl font-bold text-green-700 mt-1">{verifiedCount}</div>
            <span className="text-xs text-green-600 font-medium mt-0.5 inline-block">{verifiedPercentage}% compliant</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-bold">
            <FiCheckCircle />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">KYC Pending</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</div>
            <span className="text-xs text-amber-600 font-medium mt-0.5 inline-block">Action required</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
            <FiClock />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Portfolio</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {clients.reduce((sum, c) => sum + (c._count?.policies || 0), 0)}
            </div>
            <span className="text-xs text-gray-500 mt-0.5 inline-block">Total active policies</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
            <FiShield />
          </div>
        </div>
      </div>

      {/* ─── Search & Filters Bar ────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            placeholder="Search by name, ID number, mobile, email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-fit">
            <FiFilter className="text-gray-400 text-sm" />
            <span className="text-xs font-medium text-gray-600">KYC:</span>
            <select
              value={kycFilter}
              onChange={e => setKycFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-2 font-medium focus:outline-none focus:border-red-500"
            >
              <option value="all">All KYC Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2 min-w-fit">
            <span className="text-xs font-medium text-gray-600">Risk:</span>
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-2 font-medium focus:outline-none focus:border-red-500"
            >
              <option value="all">All Risk Profiles</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Clients Table ───────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500">Client Info</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500">RSA ID / Passport</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500">Contact</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500">KYC Status</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500">Risk</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500 text-center">Portfolio</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <FiUser className="mx-auto text-3xl mb-2 opacity-40" />
                    No clients found matching your query.
                  </td>
                </tr>
              ) : (
                filteredClients.map(client => {
                  const initials = `${client.firstName?.[0] || ''}${client.lastName?.[0] || ''}`.toUpperCase() || 'CL';
                  return (
                    <tr key={client.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-100 text-[#d92820] font-bold text-xs flex items-center justify-center shrink-0 border border-red-200">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 hover:text-[#d92820] cursor-pointer" onClick={() => fetchClientProfile(client.id)}>
                              {client.firstName} {client.lastName}
                            </div>
                            <div className="text-xs text-gray-400">
                              Joined {new Date(client.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-gray-700">
                        {client.idNumber || <span className="text-gray-400 font-sans italic">Not provided</span>}
                      </td>

                      <td className="px-6 py-4 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                          <FiPhone className="text-gray-400 shrink-0" />
                          <span>{client.mobile}</span>
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <FiMail className="text-gray-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{client.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="inline-flex items-center">
                          <select
                            value={client.kycStatus}
                            onChange={e => handleQuickKycChange(client.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border cursor-pointer ${
                              client.kycStatus === 'verified'
                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                : client.kycStatus === 'in_review'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                : client.kycStatus === 'rejected'
                                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_review">In Review</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          client.riskProfile === 'Low' ? 'bg-green-50 text-green-700' :
                          client.riskProfile === 'High' ? 'bg-red-50 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {client.riskProfile || 'Medium'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700">
                          <span className="px-2 py-0.5 bg-gray-100 rounded-md" title="Policies">
                            🛡️ {client._count?.policies ?? 0}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded-md" title="Claims">
                            ⚡ {client._count?.claims ?? 0}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => fetchClientProfile(client.id)}
                            className="bg-red-50 hover:bg-red-100 text-[#d92820] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                          >
                            <FiUser className="text-sm" />
                            View Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Comprehensive Client Profile Modal / Drawer ─────────────────── */}
      {selectedClientId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-4xl bg-white min-h-screen shadow-2xl flex flex-col transform transition-all animate-in slide-in-from-right duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 border-b border-gray-700 shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-[#d92820] text-white font-bold text-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
                    {clientDetail ? `${clientDetail.firstName?.[0]}${clientDetail.lastName?.[0]}` : '...'}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">
                        {loadingDetail ? 'Loading Profile...' : `${clientDetail?.firstName} ${clientDetail?.lastName}`}
                      </h2>
                      {clientDetail && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          clientDetail.kycStatus === 'verified'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {clientDetail.kycStatus}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 mt-1.5">
                      <span>RSA ID: <strong className="text-white">{clientDetail?.idNumber || 'N/A'}</strong></span>
                      <span>•</span>
                      <span>Mobile: <strong className="text-white">{clientDetail?.mobile}</strong></span>
                      {clientDetail?.email && (
                        <>
                          <span>•</span>
                          <span>Email: <strong className="text-white">{clientDetail.email}</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { setSelectedClientId(null); setClientDetail(null); }}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              {/* Quick Profile Actions */}
              {clientDetail && (
                <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-700/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">KYC Status:</span>
                    <select
                      value={clientDetail.kycStatus}
                      onChange={e => handleQuickKycChange(clientDetail.id, e.target.value)}
                      className="bg-gray-800 text-xs font-medium text-white border border-gray-600 rounded-md px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_review">In Review</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="ml-2 text-xs text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5"
                    >
                      <FiEdit3 /> Edit Info
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddPolicyModal(true)}
                      className="bg-[#d92820] hover:bg-[#b8201a] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <FiPlus /> New Policy
                    </button>
                    <button
                      onClick={() => setShowAddClaimModal(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <FiPlus /> Log Claim
                    </button>
                    <button
                      onClick={() => setShowUploadDocModal(true)}
                      className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <FiUpload /> Upload FICA
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="bg-gray-100 border-b border-gray-200 px-6 flex items-center gap-2 shrink-0 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: <FiUser /> },
                { id: 'policies', label: `Policies (${clientDetail?.policies?.length || 0})`, icon: <FiShield /> },
                { id: 'claims', label: `Claims (${clientDetail?.claims?.length || 0})`, icon: <FiAlertCircle /> },
                { id: 'goals', label: `Financial Goals (${clientDetail?.goals?.length || 0})`, icon: <FiTarget /> },
                { id: 'documents', label: `FICA Documents (${clientDetail?.documents?.length || 0})`, icon: <FiFileText /> },
                { id: 'message', label: 'Send Notice', icon: <FiSend /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3.5 px-4 font-semibold text-xs flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#d92820] text-[#d92820] bg-white rounded-t-lg'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {loadingDetail ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <ClipLoader color="#d92820" size={36} />
                  <p className="text-xs text-gray-500 font-medium">Fetching client profile & portfolio...</p>
                </div>
              ) : !clientDetail ? (
                <div className="p-12 text-center text-gray-500">Failed to load client details.</div>
              ) : (
                <>
                  {/* ─── TAB 1: OVERVIEW ─────────────────────────────────── */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Financial Highlights */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                          <span className="text-xs font-semibold text-gray-400 uppercase">Active Policies</span>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            {clientDetail.policies.filter(p => p.status === 'active').length}
                          </div>
                          <span className="text-xs text-gray-500">Total: {clientDetail.policies.length}</span>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                          <span className="text-xs font-semibold text-gray-400 uppercase">Monthly Premium</span>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            R {clientDetail.policies
                              .filter(p => p.status === 'active')
                              .reduce((sum, p) => sum + (p.premium || 0), 0)
                              .toLocaleString()}
                          </div>
                          <span className="text-xs text-green-600 font-medium">Active recurring</span>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                          <span className="text-xs font-semibold text-gray-400 uppercase">Total Sum Assured</span>
                          <div className="text-2xl font-bold text-[#d92820] mt-1">
                            R {clientDetail.policies
                              .reduce((sum, p) => sum + (p.sumAssured || 0), 0)
                              .toLocaleString()}
                          </div>
                          <span className="text-xs text-gray-500">Total risk cover</span>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                          <span className="text-xs font-semibold text-gray-400 uppercase">Claims Logged</span>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            {clientDetail.claims.length}
                          </div>
                          <span className="text-xs text-gray-500">
                            {clientDetail.claims.filter(c => c.status === 'submitted' || c.status === 'under_assessment').length} pending
                          </span>
                        </div>
                      </div>

                      {/* Personal & KYC Info Card */}
                      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                            <FiUser className="text-[#d92820]" /> Personal & Compliance Record
                          </h3>
                          <button
                            onClick={() => setShowEditModal(true)}
                            className="text-xs font-semibold text-[#d92820] hover:underline"
                          >
                            Edit Information
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <span className="text-gray-400 font-medium">Full Legal Name</span>
                            <p className="text-gray-900 font-semibold text-sm">{clientDetail.firstName} {clientDetail.lastName}</p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-gray-400 font-medium">RSA ID / Passport</span>
                            <p className="text-gray-900 font-semibold font-mono">{clientDetail.idNumber || 'Not provided'}</p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-gray-400 font-medium">Mobile Phone</span>
                            <p className="text-gray-900 font-semibold">{clientDetail.mobile}</p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-gray-400 font-medium">Email Address</span>
                            <p className="text-gray-900 font-semibold">{clientDetail.email || 'No email on file'}</p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-gray-400 font-medium">Risk Profile</span>
                            <div>
                              <span className="px-2 py-0.5 bg-gray-100 font-semibold text-gray-800 rounded">
                                {clientDetail.riskProfile || 'Medium'}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-gray-400 font-medium">Registration Date</span>
                            <p className="text-gray-700 font-medium">{new Date(clientDetail.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Payment History */}
                      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                            <FiCreditCard className="text-green-600" /> Recent Premium Transactions
                          </h3>
                          <span className="text-xs text-gray-400">Last 12 settlements</span>
                        </div>

                        {clientDetail.payments.length === 0 ? (
                          <p className="text-xs text-gray-400 italic py-4 text-center">No payment transactions recorded yet.</p>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {clientDetail.payments.map(p => (
                              <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                                <div>
                                  <div className="font-semibold text-gray-800">R {p.amount.toLocaleString()}</div>
                                  <div className="text-gray-400">{new Date(p.date).toLocaleDateString()} • Ref: {p.reference || p.id.slice(-6)}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                  p.status === 'success' || p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {p.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ─── TAB 2: POLICIES ─────────────────────────────────── */}
                  {activeTab === 'policies' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-800">Linked Insurance Policies</h3>
                        <button
                          onClick={() => setShowAddPolicyModal(true)}
                          className="bg-[#d92820] hover:bg-[#b8201a] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <FiPlus /> Add Policy
                        </button>
                      </div>

                      {clientDetail.policies.length === 0 ? (
                        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                          <FiShield className="mx-auto text-4xl text-gray-300 mb-2" />
                          <p className="text-sm font-semibold text-gray-700">No policies linked yet</p>
                          <p className="text-xs text-gray-400 mt-1 mb-4">Add the client's insurance policies to track cover and premiums.</p>
                          <button
                            onClick={() => setShowAddPolicyModal(true)}
                            className="bg-[#d92820] text-white text-xs font-semibold px-4 py-2 rounded-lg"
                          >
                            Add First Policy
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {clientDetail.policies.map(policy => (
                            <div key={policy.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs hover:border-red-200 transition-colors">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <CompanyLogo name={policy.insurer?.name || 'Santam'} domain={policy.insurer?.domain} size={40} />
                                  <div>
                                    <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                      {policy.policyNumber}
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                        policy.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                      }`}>
                                        {policy.status}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {policy.type} • Provider: <strong>{policy.insurer?.name || 'Underwritten Partner'}</strong>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-6 text-right sm:text-right">
                                  <div>
                                    <div className="text-xs text-gray-400">Monthly Premium</div>
                                    <div className="text-sm font-bold text-gray-900">R {policy.premium.toLocaleString()}</div>
                                  </div>
                                  {policy.sumAssured ? (
                                    <div>
                                      <div className="text-xs text-gray-400">Sum Assured</div>
                                      <div className="text-sm font-bold text-[#d92820]">R {policy.sumAssured.toLocaleString()}</div>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── TAB 3: CLAIMS ───────────────────────────────────── */}
                  {activeTab === 'claims' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-800">Claims History</h3>
                        <button
                          onClick={() => setShowAddClaimModal(true)}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <FiPlus /> Log New Claim
                        </button>
                      </div>

                      {clientDetail.claims.length === 0 ? (
                        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                          <FiAlertCircle className="mx-auto text-4xl text-gray-300 mb-2" />
                          <p className="text-sm font-semibold text-gray-700">No claims submitted</p>
                          <p className="text-xs text-gray-400 mt-1 mb-4">This client currently has no open or past insurance claims.</p>
                          <button
                            onClick={() => setShowAddClaimModal(true)}
                            className="bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                          >
                            Log Incident Claim
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {clientDetail.claims.map(claim => (
                            <div key={claim.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                                    {claim.reference}
                                  </span>
                                  <span className="font-semibold text-sm text-gray-800">{claim.type}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-sm text-gray-900">R {claim.amount.toLocaleString()}</span>
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                    claim.status === 'approved' || claim.status === 'settled' ? 'bg-green-100 text-green-700' :
                                    claim.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                    {claim.status.replace(/_/g, ' ')}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">{claim.description}</p>
                              <div className="text-[11px] text-gray-400 mt-2">
                                Logged on {new Date(claim.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── TAB 4: GOALS ────────────────────────────────────── */}
                  {activeTab === 'goals' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-800">Financial & Savings Targets</h3>
                        <button
                          onClick={() => setShowAddGoalModal(true)}
                          className="bg-[#d92820] hover:bg-[#b8201a] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <FiPlus /> Add Goal
                        </button>
                      </div>

                      {clientDetail.goals.length === 0 ? (
                        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                          <FiTarget className="mx-auto text-4xl text-gray-300 mb-2" />
                          <p className="text-sm font-semibold text-gray-700">No goals set yet</p>
                          <p className="text-xs text-gray-400 mt-1 mb-4">Set financial targets to assist with wealth creation and advisory.</p>
                          <button
                            onClick={() => setShowAddGoalModal(true)}
                            className="bg-[#d92820] text-white text-xs font-semibold px-4 py-2 rounded-lg"
                          >
                            Create Financial Goal
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {clientDetail.goals.map(goal => {
                            const pct = goal.targetAmount ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
                            return (
                              <div key={goal.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-bold text-sm text-gray-900">{goal.name}</h4>
                                    {goal.targetDate && (
                                      <span className="text-[11px] text-gray-400">Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                  <span className="text-xs font-bold text-[#d92820]">{pct}%</span>
                                </div>

                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                  <div className="bg-[#d92820] h-full transition-all" style={{ width: `${pct}%` }} />
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-gray-500">Saved: <strong className="text-gray-900">R {goal.currentAmount.toLocaleString()}</strong></span>
                                  <span className="text-gray-500">Target: <strong className="text-gray-900">R {goal.targetAmount.toLocaleString()}</strong></span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── TAB 5: DOCUMENTS & FICA ─────────────────────────── */}
                  {activeTab === 'documents' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-800">FICA & Compliance Documents</h3>
                        <button
                          onClick={() => setShowUploadDocModal(true)}
                          className="bg-[#d92820] hover:bg-[#b8201a] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <FiUpload /> Upload Document
                        </button>
                      </div>

                      {clientDetail.documents.length === 0 ? (
                        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                          <FiFileText className="mx-auto text-4xl text-gray-300 mb-2" />
                          <p className="text-sm font-semibold text-gray-700">No documents on file</p>
                          <p className="text-xs text-gray-400 mt-1 mb-4">Upload ID copies, proof of address, or bank confirmations for FICA.</p>
                          <button
                            onClick={() => setShowUploadDocModal(true)}
                            className="bg-[#d92820] text-white text-xs font-semibold px-4 py-2 rounded-lg"
                          >
                            Upload FICA Document
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {clientDetail.documents.map(doc => (
                            <div key={doc.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-50 text-[#d92820] flex items-center justify-center text-lg">
                                  <FiFileText />
                                </div>
                                <div>
                                  <div className="font-semibold text-sm text-gray-900">{doc.name}</div>
                                  <div className="text-xs text-gray-400">
                                    Category: <strong>{doc.type}</strong> • Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-green-100 text-green-700">
                                  {doc.status}
                                </span>
                                <a
                                  href={`http://localhost:5000/api/documents/${doc.id}/download`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Download"
                                >
                                  <FiDownload className="text-base" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── TAB 6: NOTIFICATIONS & MESSAGING ────────────────── */}
                  {activeTab === 'message' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
                      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <FiSend className="text-[#d92820]" /> Send Direct Notification to Policyholder
                      </h3>
                      <p className="text-xs text-gray-500">
                        Dispatch an immediate in-app broadcast or SMS alert directly to {clientDetail.firstName}'s registered mobile app.
                      </p>

                      <form onSubmit={handleSendMessage} className="space-y-4 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Notification Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Policy Renewal Notice / FICA Request"
                            value={messageForm.title}
                            onChange={e => setMessageForm({ ...messageForm, title: e.target.value })}
                            className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Message Body</label>
                          <textarea
                            required
                            rows={4}
                            placeholder="Type your message to the client here..."
                            value={messageForm.body}
                            onChange={e => setMessageForm({ ...messageForm, body: e.target.value })}
                            className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isSendingMessage}
                            className="bg-[#d92820] hover:bg-[#b8201a] text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            {isSendingMessage ? <ClipLoader size={12} color="#fff" /> : <FiSend />}
                            Dispatch Notification
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD CLIENT MODAL ────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-gray-900">Register New Client</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newClient.firstName}
                    onChange={e => setNewClient({ ...newClient, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newClient.lastName}
                    onChange={e => setNewClient({ ...newClient, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mobile Phone (SA) *</label>
                <input
                  type="tel"
                  required
                  placeholder="082 123 4567"
                  value={newClient.mobile}
                  onChange={e => setNewClient({ ...newClient, mobile: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="client@gmail.com"
                  value={newClient.email}
                  onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">South African ID / Passport Number</label>
                <input
                  type="text"
                  maxLength={13}
                  placeholder="e.g. 9001015009087"
                  value={newClient.idNumber}
                  onChange={e => setNewClient({ ...newClient, idNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Risk Profile</label>
                  <select
                    value={newClient.riskProfile}
                    onChange={e => setNewClient({ ...newClient, riskProfile: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-medium"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Initial KYC Status</label>
                  <select
                    value={newClient.kycStatus}
                    onChange={e => setNewClient({ ...newClient, kycStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-medium"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_review">In Review</option>
                    <option value="verified">Verified</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClient}
                  className="bg-[#d92820] hover:bg-[#b8201a] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingClient ? <ClipLoader size={12} color="#fff" /> : <FiPlus />}
                  Register Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT CLIENT MODAL ────────────────────────────────────────────── */}
      {showEditModal && clientDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-gray-900">Edit Client Record</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleUpdateClient} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editClientData.firstName}
                    onChange={e => setEditClientData({ ...editClientData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editClientData.lastName}
                    onChange={e => setEditClientData({ ...editClientData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  value={editClientData.mobile}
                  onChange={e => setEditClientData({ ...editClientData, mobile: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editClientData.email}
                  onChange={e => setEditClientData({ ...editClientData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">RSA ID Number</label>
                <input
                  type="text"
                  value={editClientData.idNumber}
                  onChange={e => setEditClientData({ ...editClientData, idNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Risk Profile</label>
                  <select
                    value={editClientData.riskProfile}
                    onChange={e => setEditClientData({ ...editClientData, riskProfile: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-medium"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">KYC Status</label>
                  <select
                    value={editClientData.kycStatus}
                    onChange={e => setEditClientData({ ...editClientData, kycStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-medium"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_review">In Review</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingClient}
                  className="bg-[#d92820] hover:bg-[#b8201a] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {isUpdatingClient ? <ClipLoader size={12} color="#fff" /> : <FiEdit3 />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ADD POLICY MODAL ────────────────────────────────────────────── */}
      {showAddPolicyModal && clientDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-gray-900">Issue Policy for {clientDetail.firstName}</h3>
              <button onClick={() => setShowAddPolicyModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleAddPolicy} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Insurer / Provider</label>
                <select
                  value={newPolicy.insurerId}
                  onChange={e => setNewPolicy({ ...newPolicy, insurerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                >
                  <option value="">Select Insurer Provider</option>
                  {insurers.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Policy Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. POL-849204"
                  value={newPolicy.policyNumber}
                  onChange={e => setNewPolicy({ ...newPolicy, policyNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Product Category</label>
                <select
                  value={newPolicy.type}
                  onChange={e => setNewPolicy({ ...newPolicy, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                >
                  <option value="Life Cover">Life Cover</option>
                  <option value="Funeral Cover">Funeral Cover</option>
                  <option value="Medical Aid / Gap">Medical Aid / Gap</option>
                  <option value="Comprehensive Vehicle">Comprehensive Vehicle</option>
                  <option value="Building & Contents">Building & Contents</option>
                  <option value="Income Protection">Income Protection</option>
                  <option value="Retirement Annuity">Retirement Annuity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Monthly Premium (ZAR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 450"
                    value={newPolicy.premium}
                    onChange={e => setNewPolicy({ ...newPolicy, premium: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Sum Assured (ZAR)</label>
                  <input
                    type="number"
                    step="1000"
                    placeholder="e.g. 500000"
                    value={newPolicy.sumAssured}
                    onChange={e => setNewPolicy({ ...newPolicy, sumAssured: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddPolicyModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPolicy}
                  className="bg-[#d92820] hover:bg-[#b8201a] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingPolicy ? <ClipLoader size={12} color="#fff" /> : <FiShield />}
                  Create Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ADD CLAIM MODAL ─────────────────────────────────────────────── */}
      {showAddClaimModal && clientDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-gray-900">Log Claim for {clientDetail.firstName}</h3>
              <button onClick={() => setShowAddClaimModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleAddClaim} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Associated Policy (Optional)</label>
                <select
                  value={newClaim.policyId}
                  onChange={e => setNewClaim({ ...newClaim, policyId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                >
                  <option value="">General Claim (No specific policy)</option>
                  {clientDetail.policies.map(p => (
                    <option key={p.id} value={p.id}>{p.policyNumber} — {p.type}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Claim Incident Type</label>
                  <select
                    value={newClaim.type}
                    onChange={e => setNewClaim({ ...newClaim, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  >
                    <option value="Vehicle Accident">Vehicle Accident</option>
                    <option value="Theft / Loss">Theft / Loss</option>
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Funeral / Bereavement">Funeral / Bereavement</option>
                    <option value="Property Damage">Property Damage</option>
                    <option value="Accident / Loss">General Incident</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Claim Amount (ZAR)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 15000"
                    value={newClaim.amount}
                    onChange={e => setNewClaim({ ...newClaim, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Incident Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide details about what happened..."
                  value={newClaim.description}
                  onChange={e => setNewClaim({ ...newClaim, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddClaimModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClaim}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingClaim ? <ClipLoader size={12} color="#fff" /> : <FiAlertCircle />}
                  Log Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ADD GOAL MODAL ──────────────────────────────────────────────── */}
      {showAddGoalModal && clientDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-gray-900">Set Financial Target</h3>
              <button onClick={() => setShowAddGoalModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Goal Purpose / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Fund, Child Education"
                  value={newGoal.name}
                  onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Amount (ZAR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="50000"
                    value={newGoal.targetAmount}
                    onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Current Saved (ZAR)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newGoal.currentAmount}
                    onChange={e => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={e => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Monthly Contribution</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={newGoal.contributionAmount}
                    onChange={e => setNewGoal({ ...newGoal, contributionAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGoal}
                  className="bg-[#d92820] hover:bg-[#b8201a] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingGoal ? <ClipLoader size={12} color="#fff" /> : <FiTarget />}
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── UPLOAD DOCUMENT MODAL ───────────────────────────────────────── */}
      {showUploadDocModal && clientDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-gray-900">Upload FICA Document</h3>
              <button onClick={() => setShowUploadDocModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Document Category</label>
                <select
                  value={docCategory}
                  onChange={e => setDocCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-medium"
                >
                  <option value="KYC / ID">South African ID / Passport</option>
                  <option value="Proof of Address">Proof of Residence (Utility Bill)</option>
                  <option value="Bank Confirmation">Bank Account Confirmation</option>
                  <option value="Payslip / Income">Payslip / Proof of Income</option>
                  <option value="Policy Schedule">Policy Schedule / Annexure</option>
                  <option value="General">Other Official Document</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select File (PDF, PNG, JPG)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={e => setDocFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-[#d92820] hover:file:bg-red-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUploadDocModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingDoc || !docFile}
                  className="bg-[#d92820] hover:bg-[#b8201a] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploadingDoc ? <ClipLoader size={12} color="#fff" /> : <FiUpload />}
                  Upload & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
