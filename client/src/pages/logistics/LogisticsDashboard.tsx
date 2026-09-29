import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, Package, CreditCard, TrendingUp, Star, Ship, Plus, ArrowRight } from 'lucide-react';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { StatCardSkeleton } from '../../components/SkeletonLoader';
import { logisticsAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useRedux';

export default function LogisticsDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAppSelector((state: any) => state.auth);
  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  useEffect(() => {
    logisticsAPI.getDashboard()
      .then((res) => { setStats(res.data.stats); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { title: 'Total Containers',  value: stats.totalContainers   || 0, icon: <Container size={20} /> },
    { title: 'Active Containers', value: stats.activeContainers  || 0, icon: <Ship size={20} /> },
    { title: 'Total Revenue',     value: stats.totalRevenue      || 0, icon: <CreditCard size={20} />, prefix: '$' },
    { title: 'Current Bookings',  value: stats.currentBookings   || 0, icon: <Package size={20} /> },
    { title: 'Avg Utilization',   value: `${stats.averageUtilization || 0}%`, icon: <TrendingUp size={20} /> },
    { title: 'Customer Rating',   value: stats.customerRating?.toFixed(1) || 'N/A', icon: <Star size={20} /> },
  ] : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] || 'there'}!`}
        subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
        breadcrumbs={[{ label: 'Carrier Portal' }, { label: 'Dashboard' }]}
        actions={
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" onClick={() => {
              logisticsAPI.seedData().then(() => window.location.reload());
            }}>Seed Data</button>
            <Link to="/logistics/containers" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <Plus size={16} /> Add Container
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
          : cards.map(card => <StatCard key={card.title} {...card} />)}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {[
          { to: '/logistics/containers', icon: Container, label: 'Manage Containers', desc: 'Add, edit and track your containers' },
          { to: '/logistics/bookings',   icon: Package,   label: 'Booking Requests',  desc: 'Review and respond to incoming bookings' },
        ].map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none' }}>
            <div className="card card-p" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color="var(--brand)" />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{label}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>{desc}</p>
                </div>
              </div>
              <ArrowRight size={16} color="var(--text-4)" />
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
