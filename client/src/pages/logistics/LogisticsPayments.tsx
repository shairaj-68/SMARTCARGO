import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowUpRight } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { paymentAPI } from '../../services/api';
import EmptyState from '../../components/EmptyState';
import { TableRowSkeleton } from '../../components/SkeletonLoader';

export default function LogisticsPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentAPI.getMyPayments()
      .then(res => {
        setPayments(res.data.payments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalEarnings = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalCommission = payments.reduce((sum, p) => sum + (p.commission || 0), 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Payouts & Earnings"
        subtitle="Manage your incoming payments and platform commissions"
        breadcrumbs={[{ label: 'Financials' }, { label: 'Payments' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div className="card card-p" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpRight size={24} color="var(--green-text)" />
          </div>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>Net Earnings</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)' }}>${totalEarnings.toLocaleString()}</p>
          </div>
        </div>
        <div className="card card-p" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: 'var(--red-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={24} color="var(--red-text)" />
          </div>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>Platform Fees Paid</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)' }}>${totalCommission.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Incoming Transactions</h3>
        </div>
        <div className="table-wrap" style={{ border: 'none', borderRadius: '0 0 var(--r-lg) var(--r-lg)' }}>
          <table className="table-pro">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Booking Ref</th>
                <th>Gross ($)</th>
                <th>Platform Fee</th>
                <th>Net Earnings</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton rows={5} />
              ) : payments.length > 0 ? (
                payments.map(p => (
                  <tr key={p._id}>
                    <td className="td-primary" style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.transactionId}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td><span style={{ fontSize: 13, fontWeight: 600 }}>{p.bookingId?.bookingNumber || '—'}</span></td>
                    <td>${p.totalAmount}</td>
                    <td style={{ color: 'var(--red-text)' }}>-${p.commission}</td>
                    <td style={{ fontWeight: 700, color: 'var(--green-text)' }}>+${p.amount}</td>
                    <td>
                      <span className={`badge ${p.status === 'completed' ? 'badge-green' : p.status === 'pending' ? 'badge-amber' : 'badge-red'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '60px 0' }}>
                    <EmptyState icon={CreditCard} title="No earnings yet" description="You haven't received any payments from customers." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
