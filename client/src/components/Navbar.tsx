import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, User, Ship, Menu, X, Settings } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { logout } from '../features/authSlice';
import { AnimatePresence, motion } from 'framer-motion';

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAppSelector((state: any) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  const dashLink = () => {
    if (!user) return '/';
    return user.role === 'admin' ? '/admin' : user.role === 'logistics' ? '/logistics' : '/customer';
  };

  const roleLabel = user?.role === 'admin' ? 'Administrator' : user?.role === 'logistics' ? 'Carrier' : 'Customer';

  return (
    <header className="navbar">
      {/* Brand */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ship size={18} color="#fff" />
        </div>
        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em' }}>LCL Marketplace</span>
      </Link>

      <div style={{ flex: 1 }} />

      {/* Desktop right */}
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Notification bell */}
          <button className="btn-icon" style={{ position: 'relative' }}>
            <Bell size={18} />
            <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', border: '1.5px solid #fff' }} />
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 6px' }} />

          {/* Profile */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileOpen(p => !p)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 'var(--r-md)', border: 'none', background: 'none', cursor: 'pointer', transition: 'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.2 }}>{user.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-4)', lineHeight: 1.2 }}>{roleLabel}</p>
              </div>
              <ChevronDown size={14} color="var(--text-4)" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: .97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: .97 }}
                  transition={{ duration: 0.15 }}
                  className="dropdown-menu"
                  style={{ right: 0, top: 'calc(100% + 8px)' }}
                >
                  <div style={{ padding: '10px 12px', marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{user.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-4)' }}>{user.email}</p>
                  </div>
                  <div className="dropdown-sep" />
                  <Link to={dashLink()} className="dropdown-item" onClick={() => setProfileOpen(false)}>
                    <User size={15} /> Dashboard
                  </Link>
                  <Link to="/shared/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                    <Settings size={15} /> Settings
                  </Link>
                  <div className="dropdown-sep" />
                  <button className="dropdown-item danger w-full" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={handleLogout}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/login" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', textDecoration: 'none', padding: '0 12px' }}>Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Get Started</Link>
        </div>
      )}

      {/* Mobile hamburger */}
      <button className="btn-icon" style={{ marginLeft: 8, display: 'none' }} onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </header>
  );
}
