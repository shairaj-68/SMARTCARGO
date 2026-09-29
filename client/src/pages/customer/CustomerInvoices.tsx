import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Printer } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { paymentAPI } from '../../services/api';
import EmptyState from '../../components/EmptyState';
import { TableRowSkeleton } from '../../components/SkeletonLoader';
import Modal from '../../components/Modal';

export default function CustomerInvoices() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);

  useEffect(() => {
    paymentAPI.getMyPayments()
      .then(res => {
        // We'll use completed payments as generated invoices
        setPayments(res.data.payments?.filter((p: any) => p.status === 'completed') || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Invoices"
        subtitle="Billing statements and receipts for your cargo bookings"
        breadcrumbs={[{ label: 'My Cargo' }, { label: 'Invoices' }]}
      />

      <div className="card">
        <div className="table-wrap" style={{ border: 'none', borderRadius: 'var(--r-lg)' }}>
          <table className="table-pro">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Date</th>
                <th>Booking Ref</th>
                <th>Total ($)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton rows={4} />
              ) : payments.length > 0 ? (
                payments.map(p => (
                  <tr key={p._id}>
                    <td className="td-primary" style={{ fontFamily: 'monospace', fontSize: 13 }}>INV-{p.transactionId?.substring(0, 8).toUpperCase() || p._id.substring(0, 8).toUpperCase()}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td><span style={{ fontSize: 13, fontWeight: 600 }}>{p.bookingId?.bookingNumber || '—'}</span></td>
                    <td style={{ fontWeight: 700 }}>${p.totalAmount}</td>
                    <td><span className="badge badge-green">Paid</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-xs" style={{ background: 'var(--brand-muted)', color: 'var(--brand)', border: 'none' }} onClick={() => setViewInvoice(p)}>
                          View Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '60px 0' }}>
                    <EmptyState icon={FileText} title="No invoices found" description="Generated invoices will appear here after booking payments." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!viewInvoice} onClose={() => setViewInvoice(null)} title="Invoice Details" size="md"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setViewInvoice(null)}>Close</button>
          <button className="btn btn-primary" onClick={() => window.print()}><Printer size={16} /> Print</button>
        </>}>
        
        {viewInvoice && (
          <div style={{ padding: 24, background: '#fff', border: '1px solid var(--border)', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border)', paddingBottom: 20, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--brand)', letterSpacing: '-.02em', marginBottom: 4 }}>LCL Marketplace</h2>
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>123 Logistics Way, Suite 400<br/>San Francisco, CA 94105</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ fontSize: 20, fontWeight: 300, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>INVOICE</h3>
                <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace' }}>INV-{viewInvoice.transactionId?.substring(0, 8).toUpperCase()}</p>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>Date: {new Date(viewInvoice.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Billed To</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{(viewInvoice.customerId as any)?.name || 'Customer'}</p>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{(viewInvoice.customerId as any)?.email}</p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, color: 'var(--text-4)', textTransform: 'uppercase' }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 12, color: 'var(--text-4)', textTransform: 'uppercase' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '16px 0', fontSize: 14, color: 'var(--text-2)' }}>Container Booking ({viewInvoice.bookingId?.bookingNumber})</td>
                  <td style={{ padding: '16px 0', fontSize: 14, color: 'var(--text-1)', textAlign: 'right', fontWeight: 600 }}>${viewInvoice.amount}</td>
                </tr>
                <tr>
                  <td style={{ padding: '16px 0', fontSize: 14, color: 'var(--text-2)' }}>Platform Commission (5%)</td>
                  <td style={{ padding: '16px 0', fontSize: 14, color: 'var(--text-1)', textAlign: 'right', fontWeight: 600 }}>${viewInvoice.commission}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 0', fontSize: 14, color: 'var(--text-2)' }}>Tax (GST)</td>
                  <td style={{ padding: '16px 0', fontSize: 14, color: 'var(--text-1)', textAlign: 'right', fontWeight: 600 }}>${viewInvoice.gst}</td>
                </tr>
                <tr>
                  <td style={{ padding: '24px 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Total</td>
                  <td style={{ padding: '24px 0 8px', fontSize: 24, fontWeight: 800, color: 'var(--brand)', textAlign: 'right' }}>${viewInvoice.totalAmount}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ background: 'var(--green-bg)', padding: 12, borderRadius: 6, textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--green-text)' }}>PAID IN FULL</p>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
