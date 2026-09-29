import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';

export default function AdminRevenue() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Revenue" subtitle="Platform commission and revenue analytics" breadcrumbs={[{ label: 'Admin' }, { label: 'Revenue' }]} />
      <div className="table-wrap">
        <EmptyState icon={TrendingUp} title="Revenue Analytics" description="Detailed revenue charts, commission breakdowns, and financial reports will be displayed here." />
      </div>
    </motion.div>
  );
}
