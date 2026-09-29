import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Plus, LifeBuoy } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';

const faqs = [
  { q: "How do I track my shipment?", a: "You can track your shipment using the booking reference number on the Tracking page or your dashboard." },
  { q: "What happens if my container is delayed?", a: "In case of carrier delays, you will receive real-time notifications. Compensation depends on the carrier's specific terms." },
  { q: "How are payments processed?", a: "Payments are processed securely via Stripe. The funds are held in escrow until the cargo is loaded." },
  { q: "Can I cancel a confirmed booking?", a: "Cancellations are subject to the carrier's policy. Generally, bookings cancelled 7 days prior to departure incur no fees." },
];

export default function CustomerSupport() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showTicket, setShowTicket] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'booking', description: '' });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTickets([{ _id: Date.now().toString(), status: 'open', ...ticketForm, createdAt: new Date() }, ...tickets]);
    setShowTicket(false);
    setTicketForm({ subject: '', category: 'booking', description: '' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Help & Support"
        subtitle="Find answers or contact our support team"
        breadcrumbs={[{ label: 'My Cargo' }, { label: 'Support' }]}
        actions={
          <button className="btn btn-primary" onClick={() => setShowTicket(true)}>
            <Plus size={16} /> Open Ticket
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Support Tickets */}
        <div className="card">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h3 className="section-title" style={{ margin: 0 }}>My Support Tickets</h3>
          </div>
          {tickets.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {tickets.map((t, i) => (
                <div key={t._id} style={{ padding: '20px 24px', borderBottom: i === tickets.length - 1 ? 'none' : '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>{t.subject}</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>{t.description.substring(0, 100)}...</p>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{t.category}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-4)' }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`badge ${t.status === 'open' ? 'badge-amber' : 'badge-green'}`}>{t.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '60px 0' }}>
              <EmptyState icon={LifeBuoy} title="No active tickets" description="You have no open support requests." />
            </div>
          )}
        </div>

        {/* FAQs */}
        <div>
          <h3 className="section-title" style={{ marginBottom: 16 }}>Frequently Asked Questions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((faq, i) => (
              <div key={i} className="card card-p" style={{ cursor: 'pointer', transition: 'all .2s' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{faq.q}</h4>
                  <ChevronDown size={16} color="var(--text-4)" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                </div>
                {openFaq === i && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 12, lineHeight: 1.6 }}>
                    {faq.a}
                  </motion.p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={showTicket} onClose={() => setShowTicket(false)} title="Open Support Ticket" size="sm"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowTicket(false)}>Cancel</button>
          <button form="ticket-form" type="submit" className="btn btn-primary">Submit Ticket</button>
        </>}>
        
        <form id="ticket-form" onSubmit={handleTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="form-label">Subject</label>
            <input type="text" required value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} className="input-field" placeholder="Brief description of the issue" />
          </div>
          <div>
            <label className="form-label">Category</label>
            <select value={ticketForm.category} onChange={e => setTicketForm({...ticketForm, category: e.target.value})} className="input-field">
              <option value="booking">Booking Issue</option>
              <option value="payment">Payment/Billing</option>
              <option value="tracking">Tracking/Delivery</option>
              <option value="dispute">File a Dispute</option>
            </select>
          </div>
          <div>
            <label className="form-label">Detailed Description</label>
            <textarea required value={ticketForm.description} onChange={e => setTicketForm({...ticketForm, description: e.target.value})} className="textarea-field" rows={4} placeholder="Please provide as much detail as possible..." />
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
