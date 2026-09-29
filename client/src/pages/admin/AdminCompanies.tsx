import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Building2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { TableRowSkeleton } from '../../components/SkeletonLoader';
import { adminAPI } from '../../services/api';

const statusBadge: Record<string, string> = {
  verified: 'badge badge-green',
  pending:  'badge badge-amber',
  rejected: 'badge badge-red',
};

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAllCompanies()
      .then((res) => { setCompanies(res.data.companies); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const verifyCompany = async (id: string, status: string) => {
    await adminAPI.verifyCompany(id, { verificationStatus: status });
    setCompanies(companies.map(c => c._id === id ? { ...c, verificationStatus: status } : c));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Logistics Companies"
        subtitle={`${companies.length} registered carrier companies`}
        breadcrumbs={[{ label: 'Admin' }, { label: 'Companies' }]}
      />

      <div className="table-wrap">
        <table className="table-pro">
          <thead>
            <tr>
              <th>Company</th>
              <th>Owner</th>
              <th>Registration No.</th>
              <th>Rating</th>
              <th>Verification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <TableRowSkeleton rows={6} />
              : companies.map(company => (
                <tr key={company._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm" style={{ borderRadius: 6 }}>{company.companyName?.charAt(0).toUpperCase()}</div>
                      <span className="td-primary">{company.companyName}</span>
                    </div>
                  </td>
                  <td>{(company.userId as any)?.name || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{company.registrationNumber || '—'}</td>
                  <td>
                    {company.rating
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                          <span style={{ color: '#f59e0b' }}>★</span> {company.rating.toFixed(1)}
                        </span>
                      : <span style={{ color: 'var(--text-4)' }}>—</span>}
                  </td>
                  <td>
                    <span className={statusBadge[company.verificationStatus] || 'badge badge-gray'}>
                      {company.verificationStatus || 'pending'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-xs"
                        style={{ background: 'var(--green-bg)', color: 'var(--green-text)', border: 'none', gap: 4 }}
                        onClick={() => verifyCompany(company._id, 'verified')}>
                        <CheckCircle size={12} /> Verify
                      </button>
                      <button className="btn btn-xs"
                        style={{ background: 'var(--red-bg)', color: 'var(--red-text)', border: 'none', gap: 4 }}
                        onClick={() => verifyCompany(company._id, 'rejected')}>
                        <XCircle size={12} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && companies.length === 0 && (
          <EmptyState icon={Building2} title="No companies yet" description="Logistics companies will appear here after registration." />
        )}
      </div>
    </motion.div>
  );
}
