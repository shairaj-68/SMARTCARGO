import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Clock, ShieldCheck, ArrowRight, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { StatCardSkeleton, TableRowSkeleton } from '../../components/SkeletonLoader';

import { customerAPI } from '../../services/api';
import { useAppSelector } from '../../hooks/useRedux';

export default function CustomerDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAppSelector((state: any) => state.auth);
  const navigate = useNavigate();

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  useEffect(() => {
    customerAPI.getDashboard()
      .then((res) => {
        setStats(res.data.stats);
        setRecentBookings(res.data.stats.recentBookings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { title: 'Active Bookings',   value: stats.activeBookings || 0, icon: <Package size={20} /> },
    { title: 'In Transit',        value: stats.inTransit || 0,      icon: <Truck size={20} /> },
    { title: 'Completed',         value: stats.completed || 0,      icon: <ShieldCheck size={20} /> },
    { title: 'Pending Approval',  value: stats.pending || 0,        icon: <Clock size={20} /> },
  ] : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] || 'there'}!`}
        subtitle="Track your active shipments and explore new cargo space"
        breadcrumbs={[{ label: 'My Cargo' }, { label: 'Dashboard' }]}
        actions={
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" onClick={() => {
              customerAPI.seedData().then(() => window.location.reload());
            }}>Seed Data</button>
            <button className="btn btn-primary" onClick={() => navigate('/customer/search')}>
              <Search size={16} /> Find Space
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : cards.map(card => <StatCard key={card.title} {...card} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Recent Bookings Table */}
        <div className="card">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Recent Bookings</h3>
            <Link to="/customer/bookings" style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand)', textDecoration: 'none' }}>View all →</Link>
          </div>
          <div className="table-wrap" style={{ border: 'none', borderRadius: '0 0 var(--r-lg) var(--r-lg)', boxShadow: 'none' }}>
            <table className="table-pro">
              <thead>
                <tr>
                  <th>Booking #</th>
                  <th>Route</th>
                  <th>CBM</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <TableRowSkeleton rows={3} />
                  : recentBookings.length > 0
                    ? recentBookings.map(b => (
                        <tr key={b._id}>
                          <td className="td-primary" style={{ fontFamily: 'monospace', fontSize: 12 }}>{b.bookingNumber}</td>
                          <td>
                            <span style={{ fontSize: 13 }}>{(b.containerId as any)?.originPort || '—'}</span>
                            <span style={{ color: 'var(--text-4)', margin: '0 4px' }}>→</span>
                            <span style={{ fontSize: 13 }}>{(b.containerId as any)?.destinationPort || '—'}</span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{b.requiredCBM}</td>
                          <td><span className={`badge ${b.status === 'confirmed' ? 'badge-purple' : b.status === 'pending' ? 'badge-amber' : b.status === 'accepted' ? 'badge-green' : 'badge-gray'}`}>{b.status?.replace('_', ' ')}</span></td>
                        </tr>
                      ))
                    : (
                      <tr>
                        <td colSpan={4} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-3)' }}>
                          No recent bookings. <Link to="/customer/search" style={{ color: 'var(--brand)' }}>Book a container.</Link>
                        </td>
                      </tr>
                    )
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Search Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)', color: '#fff', border: 'none', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 32, flex: 1 }}>
            <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Search size={24} color="#fff" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, letterSpacing: '-.02em' }}>Need cargo space?</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', lineHeight: 1.6, marginBottom: 24 }}>
              Search hundreds of verified carriers instantly. Compare rates and book only the CBM you need.
            </p>
          </div>
          <div style={{ padding: 24, borderTop: '1px solid rgba(255,255,255,.1)' }}>
            <button className="btn" style={{ width: '100%', background: '#fff', color: 'var(--brand)', height: 48, fontSize: 15 }} onClick={() => navigate('/customer/search')}>
              Start Search <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
