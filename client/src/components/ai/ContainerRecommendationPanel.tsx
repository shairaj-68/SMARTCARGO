import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Sparkles, Search, ShieldCheck, ArrowRight, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface SubScores {
  route: number;
  cbm_fit: number;
  price: number;
  departure: number;
  transit: number;
  rating: number;
  reliability: number;
}

interface ContainerRecommendation {
  container_id: string;
  match_score: number;
  sub_scores: SubScores;
  available_cbm: number;
  price_per_cbm: number;
  departure_date: string;
  eta: string;
  provider: { id: string; name: string; rating: number };
  explanation: string[];
}

interface FunnelData {
  searched: number;
  route_match: number;
  date_match: number;
  capacity_match: number;
  cargo_compatible: number;
  recommended: number;
}

const scoreColor = (score: number) => {
  if (score >= 90) return 'var(--green-text)';
  if (score >= 75) return 'var(--amber-text)';
  return 'var(--red-text)';
};

export default function ContainerRecommendationPanel() {
  const [nlQuery, setNlQuery] = useState('I want to ship 7 CBM of auto components from Chennai to Hamburg around October 20, lowest cost');
  const [loading, setLoading] = useState(false);
  const [intentData, setIntentData] = useState<any>(null);
  const [funnel, setFunnel] = useState<FunnelData | null>({
    searched: 5000, route_match: 143, date_match: 61, capacity_match: 38, cargo_compatible: 21, recommended: 12,
  });
  const [results, setResults] = useState<ContainerRecommendation[]>([
    {
      container_id: 'CONT00041', match_score: 96,
      sub_scores: { route: 100, cbm_fit: 86, price: 91, departure: 92, transit: 78, rating: 94, reliability: 88 },
      available_cbm: 9.8, price_per_cbm: 77.5, departure_date: '2026-10-21', eta: '2026-11-12',
      provider: { id: 'LOG007', name: 'OceanBridge Logistics', rating: 4.7 },
      explanation: [
        'Optimal space fit: 9.8 CBM available vs 7.0 CBM required.',
        'High reliability provider (94/100) with proven on-time delivery record.',
        'Direct lane match from Chennai (INMAA) to Hamburg (DEHAM).',
      ],
    },
    {
      container_id: 'CONT00108', match_score: 91,
      sub_scores: { route: 100, cbm_fit: 80, price: 85, departure: 95, transit: 82, rating: 90, reliability: 86 },
      available_cbm: 14.2, price_per_cbm: 82.0, departure_date: '2026-10-19', eta: '2026-11-10',
      provider: { id: 'LOG012', name: 'GlobalExpress Freight', rating: 4.5 },
      explanation: [
        'Departs Oct 19 — within your 7-day flexibility window.',
        '14.2 CBM available provides extra buffer for last-minute cargo.',
      ],
    },
  ]);

  const [expandedId, setExpandedId] = useState<string | null>('CONT00041');
  const [validationModal, setValidationModal] = useState<any>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);

  const handleNLSearch = async () => {
    if (!nlQuery.trim()) return;
    setLoading(true);
    try {
      const parseRes = await axios.post('/api/assistant/parse', { query: nlQuery });
      const intent = parseRes.data.intent;
      setIntentData(intent);
      const recRes = await axios.post('/api/ml/recommend/containers', {
        origin_port_id: intent.origin || 'INMAA',
        destination_port_id: intent.destination || 'DEHAM',
        cargo_type: intent.cargo_type || 'Auto Components',
        required_cbm: intent.cbm || 7,
        weight_kg: intent.weight_kg || 2450,
        preferred_departure: intent.departure_window?.from || '2026-10-20',
        priority: intent.priority || 'cost',
      });
      if (recRes.data.funnel) setFunnel(recRes.data.funnel);
      if (recRes.data.results?.length) setResults(recRes.data.results);
      toast.success('AI match search complete!');
    } catch {
      toast.error('Using deterministic fallback');
    } finally {
      setLoading(false);
    }
  };

  const handleBookCheck = async (cont: ContainerRecommendation) => {
    setValidatingId(cont.container_id);
    try {
      const cbmVal = intentData?.cbm || 7;
      const weightVal = intentData?.weight_kg || 2450;
      const res = await axios.post('/api/ml/validate/booking', {
        container_id: cont.container_id,
        required_cbm: cbmVal,
        weight_kg: weightVal,
        price_per_cbm: cont.price_per_cbm,
        departure_date: cont.departure_date,
        pickup_date: intentData?.departure_window?.from || cont.departure_date,
        cargo_type: intentData?.cargo_type || 'Auto Components',
        available_cbm: cont.available_cbm,
      });
      setValidationModal({ container: cont, validation: res.data });
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'Validation engine error';
      toast.error(`Validation error: ${errMsg}`);
    } finally {
      setValidatingId(null);
    }
  };

  return (
    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'var(--brand-muted)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color="var(--brand)" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>
              SmartCargo AI Container Match Engine
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-4)' }}>
              3-stage ML scoring: Route 30% · CBM Fit 20% · Price 15% · Proximity 15% · Transit 10%
            </p>
          </div>
        </div>
        <span className="badge badge-brand">AI Model v2 Active</span>
      </div>

      {/* NL Search Bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div className="input-wrapper" style={{ flex: 1 }}>
          <Search size={18} className="input-icon-left" />
          <input
            type="text"
            className="input-field has-icon-left"
            placeholder="Type your search (e.g. '7 CBM auto components Chennai to Hamburg Oct 20')"
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNLSearch()}
          />
        </div>
        <button onClick={handleNLSearch} disabled={loading} className="btn btn-primary" style={{ gap: 8, flexShrink: 0, width: 140 }}>
          {loading
            ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            : <Sparkles size={16} />}
          {loading ? 'Analyzing...' : 'AI Search'}
        </button>
      </div>



      {/* Funnel Visualizer */}
      {funnel && (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px 18px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Stage 1 Hard Filter Funnel</span>
            <span className="badge badge-green">{funnel.recommended} Matched Containers</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
            {[
              { label: 'Searched',    val: funnel.searched.toLocaleString(), color: 'var(--text-2)' },
              { label: 'Route Match', val: funnel.route_match, color: 'var(--blue)' },
              { label: 'Date Match',  val: funnel.date_match, color: 'var(--purple)' },
              { label: 'Capacity',    val: funnel.capacity_match, color: 'var(--amber)' },
              { label: 'Compatible',  val: funnel.cargo_compatible, color: 'var(--red)' },
              { label: 'Ranked Top',  val: funnel.recommended, color: 'var(--green)' },
            ].map((s) => (
              <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, color: s.color, fontSize: 15 }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Container Result Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {results.map((cont) => {
          const isExpanded = expandedId === cont.container_id;
          return (
            <div key={cont.container_id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}>
              {/* Card Row */}
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                {/* ID + Match Badge */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>{cont.container_id}</span>
                    <span className="badge badge-green">{cont.match_score}% Match</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
                    {cont.provider.name} · ⭐ {cont.provider.rating}
                  </div>
                </div>

                {/* Space, Price, Date */}
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', flexShrink: 0 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 2 }}>Available Space</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>{cont.available_cbm} CBM</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 2 }}>Rate</div>
                    <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 14 }}>${Number(cont.price_per_cbm).toFixed(2)}/CBM</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 2 }}>Departure</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>{cont.departure_date}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 2 }}>ETA</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-2)', fontSize: 14 }}>{cont.eta}</div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : cont.container_id)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: 6 }}
                  >
                    Why this match?
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button
                    onClick={() => handleBookCheck(cont)}
                    className="btn btn-primary btn-sm"
                    style={{ gap: 6 }}
                    disabled={validatingId === cont.container_id}
                  >
                    {validatingId === cont.container_id ? (
                      <>
                        <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                        Validating...
                      </>
                    ) : (
                      <>
                        Book & Validate <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{ padding: '16px 20px', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
                  {/* Sub-scores */}
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                    7-Component Score Breakdown
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 16 }}>
                    {(Object.entries(cont.sub_scores) as [string, number][]).map(([key, val]) => (
                      <div key={key} style={{ textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '8px 6px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-4)', marginBottom: 4, textTransform: 'capitalize' }}>{key.replace('_', ' ')}</div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: scoreColor(val) }}>{val}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-4)' }}>/100</div>
                      </div>
                    ))}
                  </div>

                  {/* LLM Explanation */}
                  <div style={{ padding: '12px 16px', background: 'var(--brand-muted)', border: '1px solid var(--brand-ring)', borderRadius: 'var(--r-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Sparkles size={13} color="var(--brand)" />
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                        AI Match Explanation (Grounded)
                      </span>
                    </div>
                    <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {cont.explanation.map((bullet, idx) => (
                        <li key={idx} style={{ fontSize: 13, color: 'var(--text-2)' }}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Validation Modal */}
      {validationModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={20} color="var(--brand)" />
                <h4 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>Booking Validation AI</h4>
              </div>
              <button onClick={() => setValidationModal(null)} className="btn-icon"><XCircle size={18} /></button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>{validationModal.validation.summary}</p>

            {validationModal.validation.blocks?.length > 0 && (
              <div style={{ padding: 14, background: 'var(--red-bg)', border: '1px solid #fecaca', borderRadius: 'var(--r-md)', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <XCircle size={15} color="var(--red)" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red-text)' }}>Blocking Errors</span>
                </div>
                {validationModal.validation.blocks.map((b: any, idx: number) => (
                  <p key={idx} style={{ fontSize: 12, color: 'var(--red-text)', fontFamily: 'monospace', marginTop: 4 }}>• {b.message}</p>
                ))}
              </div>
            )}

            {validationModal.validation.warnings?.length > 0 && (
              <div style={{ padding: 14, background: 'var(--amber-bg)', border: '1px solid #fde68a', borderRadius: 'var(--r-md)', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <AlertTriangle size={15} color="var(--amber)" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber-text)' }}>Warnings</span>
                </div>
                {validationModal.validation.warnings.map((w: any, idx: number) => (
                  <p key={idx} style={{ fontSize: 12, color: 'var(--amber-text)', fontFamily: 'monospace', marginTop: 4 }}>• {w.message}</p>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
              <button onClick={() => setValidationModal(null)} className="btn btn-secondary btn-sm">Close</button>
              {validationModal.validation.valid && (
                <button onClick={() => { toast.success(`Booking confirmed for ${validationModal.container.container_id}!`); setValidationModal(null); }} className="btn btn-primary btn-sm">
                  Proceed to Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
