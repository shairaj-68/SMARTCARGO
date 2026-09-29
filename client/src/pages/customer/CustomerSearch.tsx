import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Package, Calendar, ArrowRight, ShieldCheck, Map } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { customerAPI } from '../../services/api';
import ContainerRecommendationPanel from '../../components/ai/ContainerRecommendationPanel';
import PriceIntelligenceWidget from '../../components/ai/PriceIntelligenceWidget';
import { getFeatureFlags } from '../../config/features';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="form-label">{label}</label>
    {children}
  </div>
);

export default function CustomerSearch() {
  const flags = getFeatureFlags();
  const [params, setParams] = useState({ origin: '', destination: '', minSpace: '' });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [bookForm, setBookForm] = useState({ requiredCBM: '', cargoWeight: '', cargoType: '', pickupAddress: '', deliveryAddress: '', specialInstructions: '' });
  const [bookingStatus, setBookingStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  // Load all initially or when empty
  useEffect(() => {
    if (!searched) handleSearch(new Event('submit') as any);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setSearched(true);
    try {
      // Build a plain query object — the api layer wraps this as ?key=val
      const q: Record<string, string> = {};
      if (params.origin)      q['origin']      = params.origin;
      if (params.destination) q['destination'] = params.destination;
      if (params.minSpace)    q['minCBM']      = params.minSpace;
      const res = await customerAPI.searchContainers(q);
      setResults(res.data.containers || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setBookingStatus('loading');
    try {
      await customerAPI.createBooking({ containerId: selected._id, logisticsCompanyId: selected.companyId?._id, ...bookForm, requiredCBM: Number(bookForm.requiredCBM) });
      setBookingStatus('success');
      setTimeout(() => { setSelected(null); setBookingStatus('idle'); setBookForm({ requiredCBM: '', cargoWeight: '', cargoType: '', pickupAddress: '', deliveryAddress: '', specialInstructions: '' }); }, 2000);
    } catch { setBookingStatus('error'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Search Containers" subtitle="Find available cargo space from verified carriers" breadcrumbs={[{ label: 'My Cargo' }, { label: 'Search' }]} />

      {flags.FEATURE_AI_RECOMMEND && (
        <div style={{ marginBottom: 24 }}>
          <ContainerRecommendationPanel />
        </div>
      )}

      {flags.FEATURE_PRICE_INTEL && (
        <div style={{ marginBottom: 24 }}>
          <PriceIntelligenceWidget />
        </div>
      )}

      {/* Filter Bar (Glassmorphism card) */}
      <div className="card" style={{ padding: 12, marginBottom: 32, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', gap: 12, flexWrap: 'wrap' }}>
          <div className="input-wrapper" style={{ flex: 1, minWidth: 200 }}>
            <MapPin size={18} className="input-icon-left" />
            <input type="text" value={params.origin} onChange={e => setParams({...params, origin: e.target.value})} placeholder="Origin (e.g. Shanghai)" className="input-field has-icon-left" />
          </div>
          <div className="input-wrapper" style={{ flex: 1, minWidth: 200 }}>
            <MapPin size={18} className="input-icon-left" />
            <input type="text" value={params.destination} onChange={e => setParams({...params, destination: e.target.value})} placeholder="Destination (e.g. Rotterdam)" className="input-field has-icon-left" />
          </div>
          <div className="input-wrapper" style={{ flex: 1, minWidth: 160 }}>
            <Package size={18} className="input-icon-left" />
            <input type="number" value={params.minSpace} onChange={e => setParams({...params, minSpace: e.target.value})} placeholder="CBM needed" className="input-field has-icon-left" min="1" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: 140, flexShrink: 0 }}>
            <Search size={16} /> Search
          </button>
        </form>
      </div>

      {/* Results */}
      <div>
        {loading ? (
          <div style={{ display: 'grid', gap: 16 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card card-p"><div className="skeleton h-20 w-full" /></div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div style={{ display: 'grid', gap: 16 }}>
            {results.map(c => (
              <div key={c._id} className="card" style={{ display: 'flex', padding: 24, gap: 24, alignItems: 'center' }}>
                {/* Route Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', padding: '4px 12px', borderRadius: 999 }}>
                      <ShieldCheck size={14} color="var(--brand)" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>{c.companyId?.companyName || 'Carrier'}</span>
                    </div>
                    <span className="badge badge-gray">{c.type}</span>
                    <span style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--text-3)' }}>{c.containerNumber}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>{c.originPort}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{c.originCountry}</p>
                    </div>
                    <div style={{ flex: 1, borderTop: '1.5px dashed var(--border)', position: 'relative', minWidth: 40, margin: '0 16px' }}>
                      <Map size={16} color="var(--text-4)" style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', background: 'var(--surface)' }} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>{c.destinationPort}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{c.destinationCountry}</p>
                    </div>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div style={{ width: 1, height: 80, background: 'var(--border)', flexShrink: 0 }} />

                {/* Details & Price */}
                <div style={{ width: 160, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={15} color="var(--text-4)" />
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{new Date(c.departureDate).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Package size={15} color="var(--text-4)" />
                    <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>{Number(c.availableSpace).toFixed(1)} CBM left</span>
                  </div>
                </div>

                {/* Action — fixed width, price clamped to 2dp */}
                <div style={{ width: 150, flexShrink: 0, textAlign: 'right', overflow: 'hidden' }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    ${Number(c.pricePerCBM).toFixed(2)}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 12 }}>per CBM</p>
                  <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => setSelected(c)}>Book Space</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Search} title="No containers found" description="Try adjusting your origin, destination, or space requirements." />
        )}
      </div>

      {/* Booking Modal */}
      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setBookingStatus('idle'); }} title="Book Container Space" size="lg"
        footer={bookingStatus !== 'success' ? <>
          <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
          <button form="book-form" type="submit" disabled={bookingStatus === 'loading'} className="btn btn-primary">{bookingStatus === 'loading' ? 'Processing…' : 'Submit Booking'}</button>
        </> : null}>
        
        {bookingStatus === 'success' ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShieldCheck size={32} color="var(--green)" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Booking Submitted!</h3>
            <p style={{ color: 'var(--text-3)' }}>The carrier will review your request shortly.</p>
          </div>
        ) : (
          <>
            {/* Route Summary */}
            {selected && (
              <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 'var(--r-md)', border: '1px solid var(--border)', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Route details</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
                    {selected.originPort} <ArrowRight size={14} color="var(--text-4)" /> {selected.destinationPort}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Rate</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>${selected.pricePerCBM} / CBM</p>
                </div>
              </div>
            )}
            
            {bookingStatus === 'error' && <div style={{ padding: 12, background: 'var(--red-bg)', color: 'var(--red-text)', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>Failed to submit booking. Please try again.</div>}

            <form id="book-form" onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <Field label={`Required Space (Max: ${selected?.availableSpace || 0})`}>
                  <input type="number" required max={selected?.availableSpace} min={selected?.minBooking || 1} value={bookForm.requiredCBM} onChange={e => setBookForm({...bookForm, requiredCBM: e.target.value})} className="input-field" placeholder="CBM" />
                </Field>
                <Field label="Cargo Weight (kg)">
                  <input type="number" required value={bookForm.cargoWeight} onChange={e => setBookForm({...bookForm, cargoWeight: e.target.value})} className="input-field" placeholder="e.g. 500" />
                </Field>
                <Field label="Cargo Type">
                  <input type="text" required value={bookForm.cargoType} onChange={e => setBookForm({...bookForm, cargoType: e.target.value})} className="input-field" placeholder="e.g. Electronics, Textiles" />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Origin Pickup Address"><input type="text" required value={bookForm.pickupAddress} onChange={e => setBookForm({...bookForm, pickupAddress: e.target.value})} className="input-field" placeholder="Warehouse address" /></Field>
                <Field label="Destination Delivery Address"><input type="text" required value={bookForm.deliveryAddress} onChange={e => setBookForm({...bookForm, deliveryAddress: e.target.value})} className="input-field" placeholder="Final delivery address" /></Field>
              </div>
              <Field label="Additional Notes (Optional)">
                <textarea value={bookForm.specialInstructions} onChange={e => setBookForm({...bookForm, specialInstructions: e.target.value})} className="textarea-field" rows={2} placeholder="Special handling instructions..." />
              </Field>

              {/* Total Estimate */}
              {bookForm.requiredCBM && selected && (
                <div style={{ padding: '16px 20px', background: 'var(--brand-muted)', borderRadius: 'var(--r-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand)' }}>Estimated Total</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--brand)', letterSpacing: '-.02em' }}>${(Number(bookForm.requiredCBM) * selected.pricePerCBM).toLocaleString()}</span>
                </div>
              )}
            </form>
          </>
        )}
      </Modal>
    </motion.div>
  );
}
