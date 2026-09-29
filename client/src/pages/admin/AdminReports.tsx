import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';

export default function AdminReports() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Reports" subtitle="Generate and export platform reports" breadcrumbs={[{ label: 'Admin' }, { label: 'Reports' }]} />
      <div className="table-wrap">
        <EmptyState icon={FileText} title="Reports Center" description="Generate booking summaries, revenue reports, user activity logs and carrier performance reports with custom date ranges." />
      </div>
    </motion.div>
  );
}
