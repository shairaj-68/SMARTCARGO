import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { TableRowSkeleton } from '../../components/SkeletonLoader';
import { adminAPI } from '../../services/api';

const roleBadge: Record<string, string> = {
  admin:     'badge badge-purple',
  logistics: 'badge badge-blue',
  customer:  'badge badge-green',
};

export default function AdminUsers() {
  const [users, setUsers]   = useState<any[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const totalPages = Math.ceil(total / 10);

  useEffect(() => {
    setLoading(true);
    adminAPI.getAllUsers({ page, limit: 10, search })
      .then((res) => { setUsers(res.data.users); setTotal(res.data.total); setLoading(false); })
      .catch(() => setLoading(false));
  }, [page, search]);

  const toggleStatus = async (id: string, isActive: boolean) => {
    await adminAPI.updateUserStatus(id, { isActive: !isActive });
    setUsers(users.map(u => u._id === id ? { ...u, isActive: !isActive } : u));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Users"
        subtitle={`${total} registered users on the platform`}
        breadcrumbs={[{ label: 'Admin' }, { label: 'Users' }]}
      />

      <div className="table-wrap">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="input-wrapper" style={{ maxWidth: 320, flex: 1 }}>
            <Search size={16} className="input-icon-left" />
            <input type="text" placeholder="Search by name or email…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="input-field has-icon-left"
              style={{ height: 40, fontSize: 13 }} />
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-3)' }}>
            {total} results
          </div>
        </div>

        {/* Table */}
        <table className="table-pro">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <TableRowSkeleton rows={8} />
              : users.map(user => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm">{user.name?.charAt(0).toUpperCase()}</div>
                      <span className="td-primary">{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td><span className={roleBadge[user.role] || 'badge badge-gray'}>{user.role}</span></td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-green' : 'badge-red'}`}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleStatus(user._id, user.isActive)}
                      className="btn btn-sm"
                      style={{ background: user.isActive ? 'var(--red-bg)' : 'var(--green-bg)', color: user.isActive ? 'var(--red-text)' : 'var(--green-text)', border: 'none' }}
                      title={user.isActive ? 'Suspend' : 'Activate'}
                    >
                      {user.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      {user.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>

        {!loading && users.length === 0 && (
          <EmptyState icon={Users} title="No users found" description="Try adjusting your search query." />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight size={14} />
            </button>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-4)' }}>
              Page {page} of {totalPages}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
