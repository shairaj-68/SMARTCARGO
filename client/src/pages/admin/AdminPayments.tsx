import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';

export default function AdminPayments() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Payments" subtitle="All platform payment transactions" breadcrumbs={[{ label: 'Admin' }, { label: 'Payments' }]} />
      <div className="table-wrap">
        <EmptyState icon={CreditCard} title="Payment History" description="Payment transactions across all customers and carriers will be listed here with filtering, export, and reconciliation tools." />
      </div>
    </motion.div>
  );
}
