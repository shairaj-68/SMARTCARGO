import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';

export default function AdminBookings() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="All Bookings"
        subtitle="Platform-wide booking management"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Bookings' }]}
      />
      <div className="table-wrap">
        <EmptyState
          icon={Package}
          title="Bookings Overview"
          description="A full bookings table with filtering and export will appear here. Connect the admin bookings API endpoint to populate this view."
        />
      </div>
    </motion.div>
  );
}
