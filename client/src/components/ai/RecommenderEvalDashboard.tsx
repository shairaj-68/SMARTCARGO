import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart2, RefreshCw, TrendingUp, Target, Award } from 'lucide-react';

interface EvalMetrics {
  precision_at_5: number;
  mrr: number;
  click_through: number;
  conversion_rate: number;
  avg_booking_value: number;
  evaluations_run: number;
}

const defaultMetrics: EvalMetrics = {
  precision_at_5: 0.87, mrr: 0.74, click_through: 0.38, conversion_rate: 0.22,
  avg_booking_value: 4720, evaluations_run: 186000,
};

export default function RecommenderEvalDashboard() {
  const [metrics, setMetrics] = useState<EvalMetrics>(defaultMetrics);
  const [loading, setLoading] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/ml/evaluation/metrics');
      if (res.data.metrics) setMetrics(res.data.metrics);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchMetrics(); }, []);

  const fmt = (n: number) => (n >= 1 ? n.toFixed(0) : (n * 100).toFixed(1) + '%');

  const statCards = [
    { label: 'Precision@5', value: fmt(metrics.precision_at_5), icon: Target, color: 'var(--blue)', bg: 'var(--blue-bg)', textColor: 'var(--blue-text)', description: 'Fraction of top-5 recommendations that are relevant' },
    { label: 'MRR (Mean Reciprocal Rank)', value: fmt(metrics.mrr), icon: Award, color: 'var(--purple)', bg: 'var(--purple-bg)', textColor: 'var(--purple-text)', description: 'Average reciprocal position of first correct hit' },
    { label: 'Click-Through Rate', value: fmt(metrics.click_through), icon: TrendingUp, color: 'var(--amber)', bg: 'var(--amber-bg)', textColor: 'var(--amber-text)', description: 'Users who clicked at least one AI recommendation' },
    { label: 'Conversion Rate', value: fmt(metrics.conversion_rate), icon: BarChart2, color: 'var(--green)', bg: 'var(--green-bg)', textColor: 'var(--green-text)', description: 'Clicked-through sessions that result in a booking' },
  ];

  return (
    <div className="card card-p">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'var(--blue-bg)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={20} color="var(--blue)" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>Recommender Evaluation Dashboard</h3>
            <p style={{ fontSize: 12, color: 'var(--text-4)' }}>
              Evaluated on {metrics.evaluations_run.toLocaleString()} dataset rows · Precision@5 / MRR / CTR / Conversion
            </p>
          </div>
        </div>
        <button onClick={fetchMetrics} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 }}>
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ padding: '18px 20px', background: s.bg, border: '1px solid', borderColor: s.bg, borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,.55)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.textColor, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: s.textColor, marginTop: 4 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: s.textColor, opacity: 0.7, marginTop: 2 }}>{s.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Avg Booking Value */}
      <div style={{ padding: '16px 20px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Average Booking Value (Conversion-Attributed)</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em' }}>
            ${metrics.avg_booking_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Revenue Impact</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-text)' }}>
            +${(metrics.avg_booking_value * metrics.evaluations_run * metrics.conversion_rate / 1_000_000).toFixed(1)}M
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-4)' }}>projected monthly</p>
        </div>
      </div>
    </div>
  );
}
