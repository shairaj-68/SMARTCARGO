import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { customerAPI } from '../../services/api';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { TableRowSkeleton } from '../../components/SkeletonLoader';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'communication', 'pricing', 'pickup', 'packaging', 
  'deliveryTime', 'professionalism', 'documentation', 
  'cargoHandling', 'support'
];

export default function CustomerReviews() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState<any | null>(null);
  
  const [reviewForm, setReviewForm] = useState({ 
    overallRating: 5, 
    comment: '',
    categories: CATEGORIES.reduce((acc, cat) => ({...acc, [cat]: 5}), {})
  });

  const [tab, setTab] = useState('Pending');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await customerAPI.getMyBookings();
      // Only completed or delivered bookings can be reviewed
      const bks = res.data.bookings?.filter((b: any) => b.status === 'completed' || b.status === 'delivered') || [];
      setBookings(bks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryRating = (cat: string, rating: number) => {
    setReviewForm({
      ...reviewForm,
      categories: { ...reviewForm.categories, [cat]: rating }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReviewModal) return;
    try {
      await customerAPI.addReview({
        companyId: showReviewModal.companyId?._id,
        bookingId: showReviewModal._id,
        direction: 'customer_to_company',
        overallRating: reviewForm.overallRating,
        categories: reviewForm.categories,
        comment: reviewForm.comment,
      });
      toast.success('Review submitted successfully');
      setBookings(bookings.filter(b => b._id !== showReviewModal._id));
      setShowReviewModal(null);
    } catch (err) { 
      toast.error('Failed to submit review'); 
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Trust & Reputation"
        subtitle="Share your experiences and build trust in the community."
        breadcrumbs={[{ label: 'My Cargo' }, { label: 'Reviews' }]}
      />

      <div className="tab-list" style={{ marginBottom: 24 }}>
        {['Pending', 'My Reviews'].map(t => (
          <button key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Pending' ? (
        <div className="card">
          <div className="table-wrap" style={{ border: 'none', borderRadius: 'var(--r-lg)' }}>
            <table className="table-pro">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Carrier</th>
                  <th>Route</th>
                  <th>Completed On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableRowSkeleton rows={3} />
                ) : bookings.length > 0 ? (
                  bookings.map(b => (
                    <tr key={b._id}>
                      <td className="td-primary" style={{ fontFamily: 'monospace', fontSize: 13 }}>{b.bookingNumber}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={16} color="var(--brand)" />
                          </div>
                          <span style={{ fontWeight: 600 }}>{b.companyId?.companyName || 'Carrier'}</span>
                        </div>
                      </td>
                      <td><span style={{ fontSize: 13 }}>{b.containerId?.originPort} → {b.containerId?.destinationPort}</span></td>
                      <td>{new Date(b.updatedAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowReviewModal(b)}>
                          Write Review
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '60px 0' }}>
                      <EmptyState icon={Star} title="You're all caught up" description="You have no pending reviews for completed shipments." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '60px 0' }}>
          <EmptyState icon={MessageSquare} title="No Reviews Yet" description="You haven't written any reviews yet." />
        </div>
      )}

      <Modal isOpen={!!showReviewModal} onClose={() => setShowReviewModal(null)} title={`Review ${showReviewModal?.companyId?.companyName}`} size="lg"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowReviewModal(null)}>Cancel</button>
          <button form="review-form" type="submit" className="btn btn-primary">Publish Review</button>
        </>}>
        
        {showReviewModal && (
          <form id="review-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '10px 0' }}>
            
            <div style={{ textAlign: 'center', padding: '24px', background: 'var(--surface-2)', borderRadius: 'var(--r-lg)' }}>
              <div style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 600, marginBottom: 12, letterSpacing: '0.05em' }}>OVERALL EXPERIENCE</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} key={star} type="button" className="btn-icon" style={{ padding: 12, background: 'var(--surface-1)' }} onClick={() => setReviewForm({...reviewForm, overallRating: star})}>
                    <Star size={40} fill={star <= reviewForm.overallRating ? '#fbbf24' : 'none'} color={star <= reviewForm.overallRating ? '#fbbf24' : 'var(--border)'} />
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Rate specific categories</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                {CATEGORIES.map(cat => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                    <span style={{ fontSize: 13, textTransform: 'capitalize', fontWeight: 500 }}>{cat.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => handleCategoryRating(cat, star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                          <Star size={16} fill={star <= (reviewForm.categories as any)[cat] ? '#fbbf24' : 'none'} color={star <= (reviewForm.categories as any)[cat] ? '#fbbf24' : 'var(--border)'} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Detailed Feedback</label>
              <textarea 
                value={reviewForm.comment} 
                onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} 
                className="textarea-field" 
                rows={5} 
                placeholder="Share your experience. What went well? What could be improved?" 
                style={{ fontSize: 14, padding: 16 }}
              />
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>Your review helps other users make informed decisions.</p>
            </div>
          </form>
        )}
      </Modal>
    </motion.div>
  );
}
