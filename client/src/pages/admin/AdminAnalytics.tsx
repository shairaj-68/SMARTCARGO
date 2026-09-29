import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';

export default function AdminAnalytics() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Analytics" subtitle="Deep platform insights and trends" breadcrumbs={[{ label: 'Admin' }, { label: 'Analytics' }]} />
      <div className="table-wrap">
        <EmptyState icon={BarChart3} title="Analytics Dashboard" description="Advanced analytics including route performance, carrier rankings, customer retention, and growth metrics will be available here." />
      </div>
    </motion.div>
  );
}
