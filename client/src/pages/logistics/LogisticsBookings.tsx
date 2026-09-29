import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, MessageSquare, Package } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { TableRowSkeleton } from '../../components/SkeletonLoader';
import { logisticsAPI } from '../../services/api';

const statusBadge: Record<string, string> = {
  pending:       'badge badge-amber',
  accepted:      'badge badge-green',
  counter_offer: 'badge badge-blue',
  cancelled:     'badge badge-red',
  confirmed:     'badge badge-purple',
  in_transit:    'badge badge-blue',
  delivered:     'badge badge-green',
};

const TABS = ['All', 'Pending', 'Accepted', 'Counter', 'Cancelled'];

export default function LogisticsBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('All');
  const [showCounter, setShowCounter] = useState<string | null>(null);
  const [counterForm, setCounterForm] = useState({ pricePerCBM: '', pickupDate: '', conditions: '' });

  useEffect(() => {
    logisticsAPI.getBookingRequests()
      .then((res) => { setBookings(res.data.bookings); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleAccept = async (id: string) => {
    await logisticsAPI.acceptBooking(id);
    setBookings(bookings.map(b => b._id === id ? { ...b, status: 'accepted' } : b));
  };
  const handleReject = async (id: string) => {
    await logisticsAPI.rejectBooking(id);
    setBookings(bookings.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
  };
  const handleCounter = async () => {
    if (!showCounter) return;
    await logisticsAPI.counterOffer(showCounter, counterForm);
    setBookings(bookings.map(b => b._id === showCounter ? { ...b, status: 'counter_offer' } : b));
    setShowCounter(null);
  };

  const filtered = bookings.filter(b => {
    if (tab === 'All') return true;
    if (tab === 'Pending') return b.status === 'pending';
    if (tab === 'Accepted') return ['accepted', 'confirmed'].includes(b.status);
    if (tab === 'Counter') return b.status === 'counter_offer';
    if (tab === 'Cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Booking Requests"
        subtitle={`${bookings.length} total requests`}
        breadcrumbs={[{ label: 'Carrier Portal' }, { label: 'Bookings' }]}
      />

      {/* Status tabs */}
      <div className="tab-list" style={{ marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
            {t === 'Pending' && bookings.filter(b => b.status === 'pending').length > 0 &&
              <span style={{ marginLeft: 6, background: 'var(--brand)', color: '#fff', borderRadius: 999, fontSize: 10, padding: '1px 6px', fontWeight: 700 }}>
                {bookings.filter(b => b.status === 'pending').length}
              </span>
            }
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="table-pro">
          <thead>
            <tr>
              <th>Booking #</th>
              <th>Customer</th>
              <th>Container</th>
              <th>CBM</th>
              <th>Cargo</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <TableRowSkeleton rows={6} />
              : filtered.map(booking => (
                <tr key={booking._id}>
                  <td className="td-primary" style={{ fontFamily: 'monospace', fontSize: 12 }}>{booking.bookingNumber}</td>
                  <td>{(booking.customerId as any)?.name || '—'}</td>
                  <td style={{ fontSize: 13 }}>{(booking.containerId as any)?.containerNumber || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{booking.requiredCBM} CBM</td>
                  <td>{booking.cargoType}</td>
                  <td><span className={statusBadge[booking.status] || 'badge badge-gray'}>{booking.status?.replace('_', ' ')}</span></td>
                  <td>
                    {booking.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-xs" style={{ background: 'var(--green-bg)', color: 'var(--green-text)', border: 'none', gap: 4 }} onClick={() => handleAccept(booking._id)}>
                          <CheckCircle size={12} /> Accept
                        </button>
                        <button className="btn btn-xs" style={{ background: 'var(--red-bg)', color: 'var(--red-text)', border: 'none', gap: 4 }} onClick={() => handleReject(booking._id)}>
                          <XCircle size={12} /> Reject
                        </button>
                        <button className="btn btn-xs" style={{ background: 'var(--blue-bg)', color: 'var(--blue-text)', border: 'none', gap: 4 }} onClick={() => setShowCounter(booking._id)}>
                          <MessageSquare size={12} /> Counter
                        </button>
                      </div>
                    ) : <span style={{ fontSize: 12, color: 'var(--text-4)' }}>—</span>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <EmptyState icon={Package} title="No bookings found" description={`No ${tab.toLowerCase()} booking requests at this time.`} />
        )}
      </div>

      {/* Counter offer modal */}
      <Modal isOpen={!!showCounter} onClose={() => setShowCounter(null)} title="Send Counter Offer" size="sm"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowCounter(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCounter}>Send Offer</button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div><label className="form-label">Price Per CBM ($)</label><input type="number" value={counterForm.pricePerCBM} onChange={e => setCounterForm({ ...counterForm, pricePerCBM: e.target.value })} className="input-field" /></div>
          <div><label className="form-label">Pickup Date</label><input type="date" value={counterForm.pickupDate} onChange={e => setCounterForm({ ...counterForm, pickupDate: e.target.value })} className="input-field" /></div>
          <div><label className="form-label">Conditions / Notes</label><textarea value={counterForm.conditions} onChange={e => setCounterForm({ ...counterForm, conditions: e.target.value })} className="textarea-field" rows={3} /></div>
        </div>
      </Modal>
    </motion.div>
  );
}
