import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import { BarChart3, TrendingUp, Package, Users } from 'lucide-react';
import { logisticsAPI } from '../../services/api';
import { StatCardSkeleton } from '../../components/SkeletonLoader';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function LogisticsAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logisticsAPI.getDashboard()
      .then(res => {
        setStats(res.data.stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Gross Revenue ($)',
        data: [12000, 19000, 15000, 22000, 28000, (stats?.revenue || 35000)],
        borderColor: '#111827',
        backgroundColor: 'rgba(17, 24, 39, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const cbmData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'CBM Sold',
        data: [120, 150, 180, (stats?.totalCBM || 210)],
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        padding: 12,
        titleFont: { size: 13, family: 'Inter' },
        bodyFont: { size: 14, weight: 'bold', family: 'Inter' },
        displayColors: false,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Inter' }, color: '#6b7280' } },
      y: { border: { display: false }, grid: { color: '#f3f4f6' }, ticks: { font: { family: 'Inter' }, color: '#6b7280' } }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Analytics & Reports"
        subtitle="Insights into your business performance and container utilization"
        breadcrumbs={[{ label: 'Operations' }, { label: 'Analytics' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <div className="card card-p">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)' }}>Total Revenue</p>
                <div style={{ background: 'var(--brand-muted)', padding: 8, borderRadius: 8 }}><TrendingUp size={16} color="var(--brand)" /></div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--text-1)' }}>${(stats?.revenue || 0).toLocaleString()}</p>
              <p style={{ fontSize: 13, color: 'var(--green-text)', fontWeight: 600, marginTop: 8 }}>+12.5% <span style={{ color: 'var(--text-4)', fontWeight: 400 }}>from last month</span></p>
            </div>
            
            <div className="card card-p">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)' }}>Space Sold</p>
                <div style={{ background: 'var(--brand-muted)', padding: 8, borderRadius: 8 }}><Package size={16} color="var(--brand)" /></div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--text-1)' }}>{stats?.totalCBM || 0} <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-4)' }}>CBM</span></p>
              <p style={{ fontSize: 13, color: 'var(--green-text)', fontWeight: 600, marginTop: 8 }}>+8.2% <span style={{ color: 'var(--text-4)', fontWeight: 400 }}>from last month</span></p>
            </div>
            
            <div className="card card-p">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)' }}>Active Bookings</p>
                <div style={{ background: 'var(--brand-muted)', padding: 8, borderRadius: 8 }}><BarChart3 size={16} color="var(--brand)" /></div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--text-1)' }}>{stats?.activeBookings || 0}</p>
              <p style={{ fontSize: 13, color: 'var(--text-4)', marginTop: 8 }}>Across {stats?.activeContainers || 0} containers</p>
            </div>

            <div className="card card-p">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)' }}>Unique Customers</p>
                <div style={{ background: 'var(--brand-muted)', padding: 8, borderRadius: 8 }}><Users size={16} color="var(--brand)" /></div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--text-1)' }}>142</p>
              <p style={{ fontSize: 13, color: 'var(--green-text)', fontWeight: 600, marginTop: 8 }}>+24 <span style={{ color: 'var(--text-4)', fontWeight: 400 }}>new this month</span></p>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div className="card card-p">
          <h3 className="section-title">Revenue Growth</h3>
          <div style={{ height: 300, marginTop: 24 }}>
            <Line data={revenueData} options={chartOptions as any} />
          </div>
        </div>
        
        <div className="card card-p">
          <h3 className="section-title">CBM Sold This Month</h3>
          <div style={{ height: 300, marginTop: 24 }}>
            <Bar data={cbmData} options={chartOptions as any} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
