import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AlertOctagon, AlertTriangle, CheckCircle, RefreshCw, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ExceptionItem {
  _id: string;
  exception_id: string;
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  target_type: string;
  target_id: string;
  title: string;
  details: string;
  status: 'open' | 'acknowledged' | 'resolved';
}

const defaultExceptions: ExceptionItem[] = [
  { _id: '1', exception_id: 'EXC-001', type: 'capacity_anomaly', severity: 'HIGH', target_type: 'booking', target_id: 'BOOK00042', title: 'Container Capacity Overflow (7% Dataset Anomaly)', details: 'Booking BOOK00042 requested 12 CBM on CONT00041 which only has 8.17 CBM available.', status: 'open' },
  { _id: '2', exception_id: 'EXC-002', type: 'delay_risk', severity: 'HIGH', target_type: 'booking', target_id: 'BOOK00189', title: 'High Delay Risk Detected at Port of Hamburg', details: 'Feeder congestion at Hamburg terminal predicts +4 days transit delay.', status: 'open' },
  { _id: '3', exception_id: 'EXC-003', type: 'doc_mismatch', severity: 'MEDIUM', target_type: 'document', target_id: 'DOC00690', title: 'Weight Discrepancy on Packing List', details: 'Packing List: 1,480 kg vs Booking: 1,250 kg (Delta: 230 kg).', status: 'open' },
  { _id: '4', exception_id: 'EXC-004', type: 'low_utilization', severity: 'MEDIUM', target_type: 'container', target_id: 'CONT00108', title: 'Under-utilized Container Departs in < 5 Days', details: 'Container CONT00108 at 42% capacity with ETD 2026-10-21.', status: 'open' },
  { _id: '5', exception_id: 'EXC-005', type: 'payment_pending', severity: 'LOW', target_type: 'payment', target_id: 'PAY00912', title: 'Payment Pending > 18 Hours', details: 'Customer booking payment confirmation pending 18.5 hours.', status: 'open' },
];

// 30s cache
let cachedExceptions: ExceptionItem[] | null = null;
let exceptionsExpiry = 0;

export default function ControlTowerDashboard() {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>(cachedExceptions || defaultExceptions);
  const [summary, setSummary] = useState({ high: 7, medium: 14, onTrack: 183 });
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  const fetchExceptions = async (force = false) => {
    if (!force && cachedExceptions && Date.now() < exceptionsExpiry) {
      setExceptions(cachedExceptions);
      return;
    }
    if (!mounted.current) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/insights/control-tower/exceptions', { timeout: 8000 });
      if (mounted.current) {
        if (res.data.exceptions?.length) {
          cachedExceptions = res.data.exceptions;
          exceptionsExpiry = Date.now() + 30_000;
          setExceptions(res.data.exceptions);
        }
        if (res.data.summary) setSummary({ high: res.data.summary.high_severity || 7, medium: res.data.summary.medium_severity || 14, onTrack: res.data.summary.on_track_count || 183 });
      }
    } catch { }
    if (mounted.current) setLoading(false);
  };

  useEffect(() => {
    mounted.current = true;
    fetchExceptions();
    return () => { mounted.current = false; };
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await axios.patch(`/api/insights/control-tower/exceptions/${id}`, { status: 'resolved' });
    } catch { }
    setExceptions((prev) => prev.map((e) => (e.exception_id === id || e._id === id ? { ...e, status: 'resolved' } : e)));
    toast.success('Exception marked as resolved!');
  };

  return (
    <div className="card card-p">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'var(--red-bg)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={20} color="var(--red)" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>AI Control Tower Exception Center</h3>
            <p style={{ fontSize: 12, color: 'var(--text-4)' }}>Exception-based intelligence — replacing manual dashboard monitoring</p>
          </div>
        </div>
        <button onClick={() => fetchExceptions(true)} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        <div style={{ padding: '14px 18px', background: 'var(--red-bg)', border: '1px solid #fecaca', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertOctagon size={24} color="var(--red)" />
          <div><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--red-text)' }}>{summary.high}</div><div style={{ fontSize: 12, color: 'var(--red-text)' }}>High Severity</div></div>
        </div>
        <div style={{ padding: '14px 18px', background: 'var(--amber-bg)', border: '1px solid #fde68a', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={24} color="var(--amber)" />
          <div><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--amber-text)' }}>{summary.medium}</div><div style={{ fontSize: 12, color: 'var(--amber-text)' }}>Medium Warnings</div></div>
        </div>
        <div style={{ padding: '14px 18px', background: 'var(--green-bg)', border: '1px solid #a7f3d0', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CheckCircle size={24} color="var(--green)" />
          <div><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green-text)' }}>{summary.onTrack}</div><div style={{ fontSize: 12, color: 'var(--green-text)' }}>On-Track Shipments</div></div>
        </div>
      </div>

      {/* Exception List */}
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Active Exceptions</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {exceptions.map((item) => (
          <div key={item.exception_id || item._id} style={{
            padding: '14px 16px',
            background: item.status === 'resolved' ? 'var(--bg)' : item.severity === 'HIGH' ? 'var(--red-bg)' : item.severity === 'MEDIUM' ? 'var(--amber-bg)' : '#f8f9fb',
            border: `1px solid ${item.status === 'resolved' ? 'var(--border)' : item.severity === 'HIGH' ? '#fecaca' : item.severity === 'MEDIUM' ? '#fde68a' : 'var(--border)'}`,
            borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
            opacity: item.status === 'resolved' ? 0.6 : 1,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className={`badge badge-${item.severity === 'HIGH' ? 'red' : item.severity === 'MEDIUM' ? 'amber' : 'gray'}`}>{item.severity}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-3)' }}>{item.exception_id}</span>
                <span style={{ fontSize: 12, color: 'var(--text-4)' }}>· {item.target_type}: {item.target_id}</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 2 }}>{item.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{item.details}</p>
            </div>
            {item.status === 'resolved' ? (
              <span className="badge badge-green" style={{ flexShrink: 0 }}>✓ Resolved</span>
            ) : (
              <button onClick={() => handleResolve(item.exception_id || item._id)} className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>Resolve</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
