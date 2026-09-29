import { useState } from 'react';
import axios from 'axios';
import { FileText, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DocumentAIPanel() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>({
    document_type: 'Packing List',
    booking_number: 'BOOK00690',
    extracted_data: {
      invoice_no: 'INV-2026-9942',
      cargo_description: 'Auto Components & Brackets',
      weight_kg: 1480,
      quantity: 45,
      value_usd: 14500,
      hs_code: '8708.29',
    },
    cross_validation: {
      booking_weight_kg: 1250,
      document_weight_kg: 1480,
      delta_kg: 230,
      status: 'MISMATCH_FLAGGED',
      details: 'Discrepancy detected: Packing List weight (1,480 kg) differs from booking declared weight (1,250 kg) by 230 kg delta.',
    },
  });

  const handleAnalyzeDemo = async () => {
    setAnalyzing(true);
    try {
      const res = await axios.post('/api/compliance/document/analyze', {
        document_type: 'Packing List',
        booking_id: 'BOOK00690',
        extracted_data: { weight_kg: 1480, invoice_no: 'INV-2026-9942' },
      });
      if (res.data) setAnalysisResult(res.data);
      toast.success('Document AI extraction & cross-validation complete!');
    } catch (err: any) {
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-purple-600/30 text-purple-400 border border-purple-500/40 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Document AI & Discrepancy Engine</h3>
            <p className="text-[11px] text-slate-400">OCR Extraction + Booking Arithmetic Cross-Validation</p>
          </div>
        </div>

        <button
          onClick={handleAnalyzeDemo}
          disabled={analyzing}
          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{analyzing ? 'Extracting...' : 'Test OCR Mismatch Check'}</span>
        </button>
      </div>

      {analysisResult && (
        <div className="space-y-3">
          {/* Mismatch Warning Alert */}
          {analysisResult.cross_validation.status === 'MISMATCH_FLAGGED' ? (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-red-300">Document Discrepancy Flagged</div>
                <div className="text-xs text-red-200">{analysisResult.cross_validation.details}</div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-emerald-300">Document Verified</div>
                <div className="text-xs text-emerald-200">Extracted data matches booking details.</div>
              </div>
            </div>
          )}

          {/* Extracted JSON Fields */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-2">
            <div className="text-xs font-bold text-slate-300 flex justify-between">
              <span>Extracted Document Fields ({analysisResult.document_type}):</span>
              <span className="text-indigo-400 font-mono">Booking: {analysisResult.booking_number}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
              <div className="bg-slate-900/60 p-2 rounded border border-slate-700">
                <span className="text-slate-400 text-[10px] block">Invoice No</span>
                <span className="text-slate-200">{analysisResult.extracted_data.invoice_no}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded border border-slate-700">
                <span className="text-slate-400 text-[10px] block">Extracted Weight</span>
                <span className="text-amber-400 font-bold">{analysisResult.extracted_data.weight_kg} kg</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded border border-slate-700">
                <span className="text-slate-400 text-[10px] block">Declared Booking Weight</span>
                <span className="text-slate-200">{analysisResult.cross_validation.booking_weight_kg} kg</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded border border-slate-700">
                <span className="text-slate-400 text-[10px] block">HS Code</span>
                <span className="text-slate-200">{analysisResult.extracted_data.hs_code}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
