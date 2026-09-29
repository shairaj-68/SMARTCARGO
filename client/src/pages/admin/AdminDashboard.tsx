import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Container, Package, CreditCard, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { StatCardSkeleton } from '../../components/SkeletonLoader';
import { adminAPI } from '../../services/api';

import ControlTowerDashboard from '../../components/ai/ControlTowerDashboard';
import RecommenderEvalDashboard from '../../components/ai/RecommenderEvalDashboard';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then((res) => { setStats(res.data.stats); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { title: 'Total Users',          value: stats.totalUsers        || 0, icon: <Users size={20} /> },
    { title: 'Logistics Companies',  value: stats.totalCompanies    || 0, icon: <Building2 size={20} /> },
    { title: 'Active Containers',    value: stats.activeContainers  || 0, icon: <Container size={20} /> },
    { title: 'Platform Revenue',     value: stats.revenue           || 0, icon: <CreditCard size={20} />, prefix: '$' },
    { title: 'Booked Containers',    value: stats.bookedContainers  || 0, icon: <Package size={20} /> },
    { title: 'Pending Bookings',     value: stats.pendingBookings   || 0, icon: <AlertTriangle size={20} /> },
    { title: 'Commission Earned',    value: stats.commissionEarned  || 0, icon: <TrendingUp size={20} />, prefix: '$' },
    { title: 'Completed Shipments',  value: stats.completedShipments|| 0, icon: <CheckCircle size={20} /> },
  ] : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <PageHeader
        title="Admin Control Center & Analytics"
        subtitle="AI Control Tower exceptions, recommender metrics, and platform overview"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]}
      />

      {/* AI Control Tower Section */}
      <ControlTowerDashboard />

      {/* Recommender Evaluation Section (Section E) */}
      <RecommenderEvalDashboard />

      {/* Stat cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card card-p">
          <h3 className="section-title">Booking Trends</h3>
          <div style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
              {[40, 65, 50, 80, 70, 90, 75, 95, 85, 100, 88, 72].map((h, i) => (
                <div key={i} style={{ width: 22, height: `${h}%`, background: i === 11 ? 'var(--brand)' : 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px 4px 0 0', transition: 'height .3s' }} />
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-4)' }}>Monthly bookings — last 12 months</p>
          </div>
        </div>

        <div className="card card-p">
          <h3 className="section-title">Revenue Overview</h3>
          <div style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
              {[30, 55, 45, 70, 60, 80, 65, 85, 75, 90, 78, 95].map((h, i) => (
                <div key={i} style={{ width: 22, height: `${h}%`, background: i % 2 === 0 ? 'rgba(32,42,54,.12)' : 'var(--brand)', borderRadius: '4px 4px 0 0' }} />
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-4)' }}>Revenue trend — last 12 months</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
