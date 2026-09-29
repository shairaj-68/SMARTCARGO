import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Package, CreditCard, BarChart3,
  Settings, MessageSquare, AlertTriangle, FileText, Container, Search,
  HelpCircle, LogOut, Star, Truck, Ship,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { logout } from '../features/authSlice';

const adminLinks = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard',          end: true },
  { to: '/admin/users',      icon: Users,           label: 'Users' },
  { to: '/admin/companies',  icon: Building2,       label: 'Companies' },
  { to: '/admin/containers', icon: Container,       label: 'Containers' },
  { to: '/admin/bookings',   icon: Package,         label: 'Bookings' },
  { to: '/admin/payments',   icon: CreditCard,      label: 'Payments' },
  { to: '/admin/revenue',    icon: BarChart3,       label: 'Revenue' },
  { to: '/admin/reports',    icon: FileText,        label: 'Reports' },
  { to: '/admin/analytics',  icon: BarChart3,       label: 'Analytics' },
  { to: '/admin/messages',   icon: MessageSquare,   label: 'Messages' },
  { to: '/admin/disputes',   icon: AlertTriangle,   label: 'Disputes' },
  { to: '/admin/settings',   icon: Settings,        label: 'Settings' },
];

const logisticsLinks = [
  { to: '/logistics',            icon: LayoutDashboard, label: 'Dashboard',       end: true },
  { to: '/logistics/containers', icon: Container,       label: 'Containers' },
  { to: '/logistics/bookings',   icon: Package,         label: 'Bookings' },
  { to: '/logistics/payments',   icon: CreditCard,      label: 'Payments' },
  { to: '/logistics/invoices',   icon: FileText,        label: 'Invoices' },
  { to: '/logistics/messages',   icon: MessageSquare,   label: 'Messages' },
  { to: '/logistics/analytics',  icon: BarChart3,       label: 'Analytics' },
  { to: '/logistics/settings',   icon: Settings,        label: 'Settings' },
];

const customerLinks = [
  { to: '/customer',           icon: LayoutDashboard, label: 'Dashboard',        end: true },
  { to: '/customer/search',    icon: Search,          label: 'Search Containers' },
  { to: '/customer/bookings',  icon: Package,         label: 'My Bookings' },
  { to: '/customer/tracking',  icon: Truck,           label: 'Tracking' },
  { to: '/customer/payments',  icon: CreditCard,      label: 'Payments' },
  { to: '/customer/documents', icon: FileText,        label: 'Documents' },
  { to: '/customer/invoices',  icon: FileText,        label: 'Invoices' },
  { to: '/customer/messages',  icon: MessageSquare,   label: 'Messages' },
  { to: '/customer/reviews',   icon: Star,            label: 'Reviews' },
  { to: '/customer/support',   icon: HelpCircle,      label: 'Support' },
];

export default function Sidebar() {
  const { user } = useAppSelector((state: any) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'logistics' ? logisticsLinks : customerLinks;
  const roleLabel = user?.role === 'admin' ? 'Admin Panel' : user?.role === 'logistics' ? 'Carrier Portal' : 'My Cargo';

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  return (
    <aside className="sidebar">
      {/* Role section label */}
      <div style={{ padding: '20px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--bg)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
          <Ship size={13} color="var(--brand)" />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{roleLabel}</span>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '4px 0 16px', overflowY: 'auto' }}>
        <div style={{ padding: '0 8px' }}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <link.icon size={17} className="nav-icon" />
              <span className="nav-label">{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)', padding: 12 }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
            <div className="avatar avatar-sm">{user.name?.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-4)', textTransform: 'capitalize' }}>{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="nav-item"
          style={{ width: '100%', border: 'none', cursor: 'pointer', color: 'var(--red-text)', textAlign: 'left' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--red-bg)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <LogOut size={17} className="nav-icon" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
