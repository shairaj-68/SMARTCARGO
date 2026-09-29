import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, XCircle, CreditCard, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { TableRowSkeleton } from '../../components/SkeletonLoader';
import { customerAPI, paymentAPI } from '../../services/api';
import Modal from '../../components/Modal';
import { StripePaymentForm } from '../../components/PaymentForms';

const statusBadge: Record<string, string> = {
  pending:       'badge badge-amber',
  accepted:      'badge badge-green',
  counter_offer: 'badge badge-blue',
  cancelled:     'badge badge-red',
  confirmed:     'badge badge-purple',
  in_transit:    'badge badge-blue',
  delivered:     'badge badge-green',
};

const TABS = ['All', 'Active', 'Pending', 'Completed', 'Cancelled'];

export default function CustomerBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('All');
  
  // Payment modal state
  const [showPayment, setShowPayment] = useState<any | null>(null);
  const [payStatus, setPayStatus] = useState<'idle'|'loading'|'success'>('idle');
  const [paymentMethod, setPaymentMethod] = useState<'stripe'|'razorpay'>('stripe');
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    customerAPI.getMyBookings()
      .then((res) => { setBookings(res.data.bookings); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking request?')) return;
    await customerAPI.cancelBooking(id);
    setBookings(bookings.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
  };

  const handleInitiatePayment = async () => {
    if (!showPayment) return;
    setPayStatus('loading');
    try {
      const res = await paymentAPI.createOrder({ bookingId: showPayment._id, method: paymentMethod });
      
      if (paymentMethod === 'stripe') {
        setClientSecret(res.data.clientSecret);
        setPayStatus('idle');
      } else {
        // Guard: make sure the Razorpay checkout.js script has loaded
        if (typeof (window as any).Razorpay === 'undefined') {
          alert('Razorpay failed to load. Please refresh the page and try again.');
          setPayStatus('idle');
          return;
        }

        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (!razorpayKey || razorpayKey === 'rzp_test_placeholder') {
          alert('Razorpay key is not configured. Please contact support.');
          setPayStatus('idle');
          return;
        }

        // Razorpay
        const options = {
          key: razorpayKey,
          amount: Math.round(res.data.amount * 100), // paise
          currency: 'INR',
          name: 'LCL Marketplace',
          description: `Booking Payment — ${showPayment.bookingNumber || showPayment._id}`,
          order_id: res.data.order?.id,
          handler: async function (response: any) {
            setPayStatus('loading');
            try {
              await paymentAPI.verifyPayment({
                bookingId: showPayment._id,
                method: 'razorpay',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              handlePaymentSuccess();
            } catch (err: any) {
              alert(err?.response?.data?.message || 'Payment verification failed. Contact support.');
              setPayStatus('idle');
            }
          },
          modal: {
            ondismiss: () => { setPayStatus('idle'); }
          },
          theme: { color: '#202A36' },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          alert(`Payment failed: ${response.error?.description || 'Unknown error'}`);
          setPayStatus('idle');
        });
        rzp.open();
        setPayStatus('idle');
      }
    } catch (err: any) {
      setPayStatus('idle');
      alert(err?.response?.data?.message || 'Failed to create payment order. Please try again.');
    }
  };


  const handlePaymentSuccess = () => {
    setPayStatus('success');
    setBookings(bookings.map(b => b._id === showPayment._id ? { ...b, status: 'confirmed' } : b));
    setTimeout(() => { setShowPayment(null); setPayStatus('idle'); setClientSecret(''); }, 2000);
  };

  const filtered = bookings.filter(b => {
    if (tab === 'All') return true;
    if (tab === 'Active') return ['accepted', 'confirmed', 'in_transit'].includes(b.status);
    if (tab === 'Pending') return ['pending', 'counter_offer'].includes(b.status);
    if (tab === 'Completed') return b.status === 'delivered';
    if (tab === 'Cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="My Bookings"
        subtitle={`${bookings.length} total bookings across all states`}
        breadcrumbs={[{ label: 'My Cargo' }, { label: 'Bookings' }]}
      />

      <div className="tab-list" style={{ marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="table-pro">
          <thead>
            <tr>
              <th>Booking Ref</th>
              <th>Carrier</th>
              <th>Route</th>
              <th>Cargo</th>
              <th>Total ($)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <TableRowSkeleton rows={6} />
              : filtered.map(booking => (
                <tr key={booking._id}>
                  <td className="td-primary" style={{ fontFamily: 'monospace', fontSize: 13 }}>{booking.bookingNumber}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar avatar-sm" style={{ borderRadius: 6, fontSize: 10, width: 24, height: 24 }}>
                        {booking.logisticsCompanyId?.companyName?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{booking.logisticsCompanyId?.companyName || 'Carrier'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 12 }}>{(booking.containerId as any)?.originPort || '—'}</span>
                    <span style={{ color: 'var(--text-4)', margin: '0 4px' }}><ChevronRight size={10} style={{ display: 'inline' }} /></span>
                    <span style={{ fontSize: 12 }}>{(booking.containerId as any)?.destinationPort || '—'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{booking.requiredCBM} CBM</span>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{booking.cargoType}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    ${booking.totalAmount || (booking.requiredCBM * ((booking.containerId as any)?.pricePerCBM || 0))}
                  </td>
                  <td><span className={statusBadge[booking.status] || 'badge badge-gray'}>{booking.status?.replace('_', ' ')}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {booking.status === 'accepted' && (
                        <button className="btn btn-xs" style={{ background: 'var(--brand-muted)', color: 'var(--brand)', border: 'none', gap: 4 }} onClick={() => setShowPayment(booking)}>
                          <CreditCard size={12} /> Pay Now
                        </button>
                      )}
                      {['pending', 'counter_offer'].includes(booking.status) && (
                        <button className="btn btn-xs" style={{ background: 'var(--red-bg)', color: 'var(--red-text)', border: 'none', gap: 4 }} onClick={() => handleCancel(booking._id)}>
                          <XCircle size={12} /> Cancel
                        </button>
                      )}
                      {!['pending', 'counter_offer', 'accepted'].includes(booking.status) && (
                         <span style={{ fontSize: 12, color: 'var(--text-4)' }}>—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <EmptyState icon={Package} title="No bookings found" description={`You don't have any ${tab.toLowerCase()} bookings.`} />
        )}
      </div>

      {/* Payment Modal */}
      <Modal isOpen={!!showPayment} onClose={() => { setShowPayment(null); setPayStatus('idle'); setClientSecret(''); }} title="Complete Payment" size="sm"
        footer={payStatus !== 'success' && !clientSecret ? <>
          <button className="btn btn-secondary" onClick={() => { setShowPayment(null); setClientSecret(''); }}>Cancel</button>
          <button onClick={handleInitiatePayment} disabled={payStatus === 'loading'} className="btn btn-primary">{payStatus === 'loading' ? 'Processing…' : 'Proceed to Pay'}</button>
        </> : null}>
        
        {payStatus === 'success' ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CreditCard size={32} color="var(--green)" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Payment Successful</h3>
            <p style={{ color: 'var(--text-3)' }}>Your booking is now confirmed.</p>
          </div>
        ) : clientSecret ? (
          <StripePaymentForm 
            clientSecret={clientSecret} 
            bookingId={showPayment._id} 
            onSuccess={handlePaymentSuccess}
            onError={(msg: string) => { alert(msg); setClientSecret(''); }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#f8f9fb', padding: 16, borderRadius: 'var(--r-md)', border: '1px solid var(--border)', textAlign: 'center', marginBottom: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600 }}>Amount Due</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em' }}>
                ${showPayment?.totalAmount || (showPayment?.requiredCBM * (showPayment?.containerId?.pricePerCBM || 0))}
              </p>
            </div>
            <div>
              <label className="form-label">Select Payment Gateway</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} className="input-field">
                <option value="stripe">Credit/Debit Card (Stripe)</option>
                <option value="razorpay">Netbanking/UPI (Razorpay)</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
