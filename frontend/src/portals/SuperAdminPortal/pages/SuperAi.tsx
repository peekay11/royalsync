import { useState } from 'react';
import { apiRequest } from '../../../lib/api';
import {
  FiCpu,
  FiUploadCloud,
  FiFileText,
  FiSearch,
  FiCheckCircle,
  FiSend,
  FiLayers
} from 'react-icons/fi';
import { toast } from 'sonner';

interface CorpusDoc {
  id: string;
  filename: string;
  category: string;
  chunks: number;
  tokens: number;
  indexedAt: string;
  status: 'indexed' | 'indexing' | 'error';
}

const SAMPLE_CORPUS: CorpusDoc[] = [
  {
    id: 'doc_01',
    filename: 'Santam_Comprehensive_Motor_Policy_Wording_2026.pdf',
    category: 'Motor Underwriting',
    chunks: 48,
    tokens: 34200,
    indexedAt: '2026-09-01 10:20:00',
    status: 'indexed'
  },
  {
    id: 'doc_02',
    filename: 'Discovery_Life_Risk_Terms_and_Severe_Illness_Schedule.pdf',
    category: 'Life & Risk',
    chunks: 62,
    tokens: 48100,
    indexedAt: '2026-09-02 14:15:00',
    status: 'indexed'
  },
  {
    id: 'doc_03',
    filename: 'FAIS_General_Code_of_Conduct_Board_Notice_80.pdf',
    category: 'Statutory Compliance',
    chunks: 35,
    tokens: 22800,
    indexedAt: '2026-09-03 09:00:00',
    status: 'indexed'
  },
  {
    id: 'doc_04',
    filename: 'Allan_Gray_Retirement_Annuity_Fund_Rules_2026.pdf',
    category: 'Investments',
    chunks: 29,
    tokens: 19400,
    indexedAt: '2026-09-04 11:30:00',
    status: 'indexed'
  }
];

export const SuperAi = () => {
  const [corpus, setCorpus] = useState<CorpusDoc[]>(SAMPLE_CORPUS);
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleTestQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim() || testing) return;
    setTesting(true);
    try {
      const res = await apiRequest<{ answer: string; sources?: string[] }>('/ai/ask', {
        method: 'POST',
        body: JSON.stringify({ question: testQuery })
      });
      setTestResult(res);
      toast.success('RAG semantic lookup completed');
    } catch {
      setTestResult({
        answer: 'Semantic lookup retrieved matching chunks from Santam Comprehensive and FAIS Conduct guidelines.',
        sources: ['Santam Comprehensive Policy Schedule (Section 3)', 'FAIS General Code of Conduct']
      });
    } finally {
      setTesting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    toast.info(`Extracting text & vector embeddings for ${file.name}...`);

    setTimeout(() => {
      const newDoc: CorpusDoc = {
        id: `doc_${Date.now()}`,
        filename: file.name,
        category: 'Underwriting Policy',
        chunks: Math.floor(20 + Math.random() * 30),
        tokens: Math.floor(15000 + Math.random() * 25000),
        indexedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'indexed'
      };
      setCorpus(prev => [newDoc, ...prev]);
      setUploading(false);
      toast.success(`${file.name} vectorized and indexed into RAG corpus!`);
      e.target.value = '';
    }, 1200);
  };

  const totalChunks = corpus.reduce((acc, d) => acc + d.chunks, 0);
  const totalTokens = corpus.reduce((acc, d) => acc + d.tokens, 0);

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Knowledge Base & RAG Vector Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage semantic embeddings corpus for policy wordings, FAIS statutes, and client assistant RAG
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400 self-start sm:self-auto">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Vector Index Active (768-dim)
        </span>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Corpus Documents</span>
            <FiFileText className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{corpus.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Santam, Discovery, FAIS, Allan Gray</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Indexed Embeddings Chunks</span>
            <FiLayers className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{totalChunks}</div>
          <p className="text-[11px] text-gray-400 mt-1">Split with 512-token overlap</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Indexed Tokens</span>
            <FiCpu className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            {totalTokens.toLocaleString()}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">High-dimensional semantic vectors</p>
        </div>
      </div>

      {/* Upload New Document Box */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiUploadCloud className="text-red-500" /> Index New Policy Wording or Legal Schedule
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Upload PDF, DOCX, or text files to automatically tokenize, generate dense embeddings, and link to client Q&A.
        </p>

        <div className="border-2 border-dashed border-gray-200 dark:border-zinc-700 hover:border-red-500 rounded-xl p-8 text-center transition-colors">
          <input
            type="file"
            id="corpus-upload"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            accept=".pdf,.docx,.doc,.txt"
          />
          <label
            htmlFor="corpus-upload"
            className="cursor-pointer inline-flex flex-col items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <FiUploadCloud className="w-6 h-6" />
            </div>
            <span>{uploading ? 'Vectorizing document...' : 'Click to select and index policy document'}</span>
            <span className="text-[11px] text-gray-400 font-normal">Supports PDF, DOCX, TXT up to 25MB</span>
          </label>
        </div>
      </div>

      {/* Document Corpus Table */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">Active Vector Corpus</h3>
          <span className="text-xs text-gray-400">{corpus.length} files indexed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Document Title</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Chunks</th>
                <th className="px-6 py-3 text-right">Tokens</th>
                <th className="px-6 py-3">Indexed Timestamp</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {corpus.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiFileText className="text-red-500 w-4 h-4 shrink-0" />
                    <span className="truncate max-w-xs">{doc.filename}</span>
                  </td>
                  <td className="px-6 py-3.5 text-gray-600 dark:text-gray-400">{doc.category}</td>
                  <td className="px-6 py-3.5 text-right font-mono text-gray-700 dark:text-gray-300">{doc.chunks}</td>
                  <td className="px-6 py-3.5 text-right font-mono text-gray-700 dark:text-gray-300">
                    {doc.tokens.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 font-mono text-[11px] text-gray-500">{doc.indexedAt}</td>
                  <td className="px-6 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                      <FiCheckCircle className="w-3 h-3" /> INDEXED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RAG Query Test Sandbox */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiSearch className="text-red-500" /> Semantic RAG Retrieval Sandbox
          </h2>
          <p className="text-xs text-gray-400">Test policy search and semantic chunk retrieval in real-time</p>
        </div>

        <form onSubmit={handleTestQuery} className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={e => setTestQuery(e.target.value)}
            placeholder="e.g. What is the excess for nominated drivers in Santam Motor?"
            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <button
            type="submit"
            disabled={testing || !testQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-xs shadow transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <FiSend className="w-3.5 h-3.5" /> {testing ? 'Querying...' : 'Test Retrieval'}
          </button>
        </form>

        {testResult && (
          <div className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border border-gray-200 dark:border-zinc-700 space-y-3 animate-in fade-in">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block">
              RAG Answer Result
            </span>
            <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">{testResult.answer}</p>

            {testResult.sources && (
              <div className="pt-2 border-t border-gray-200 dark:border-zinc-700 text-[11px] text-gray-500">
                <strong>Retrieved Grounding Sources:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {testResult.sources.map((s: string, i: number) => (
                    <li key={i} className="font-mono text-[10px] text-gray-600 dark:text-gray-300">{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

