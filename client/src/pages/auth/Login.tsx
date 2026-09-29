import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ship, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { login } from '../../features/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state: any) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      const role = result.payload.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'logistics' ? '/logistics' : '/customer');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      {/* ── Brand Panel ── */}
      <div style={{ width: '42%', background: 'var(--brand)', display: 'none', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', position: 'relative', overflow: 'hidden' }}
        className="lg-flex"
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: -80, top: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div style={{ position: 'absolute', right: -40, bottom: 120, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ship size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-.02em' }}>LCL Marketplace</span>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.1)', borderRadius: 999, padding: '6px 14px', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.8)' }}>500+ companies trust us</span>
          </div>
          <h2 style={{ fontSize: 42, fontWeight: 300, color: '#fff', lineHeight: 1.15, letterSpacing: '-.03em', marginBottom: 16 }}>
            Smart Cargo.<br /><span style={{ fontWeight: 700 }}>Simplified.</span>
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.7 }}>
            Book unused container space on-demand. Pay only for the CBM you need — no minimums, no commitments.
          </p>

          <div style={{ marginTop: 40, display: 'flex', gap: 32 }}>
            {[['10K+', 'Bookings'], ['200+', 'Routes'], ['50+', 'Countries']].map(([val, label]) => (
              <div key={label}>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{val}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', position: 'relative' }}>© 2026 LCL Marketplace. All rights reserved.</p>
      </div>

      {/* ── Form Panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: 'var(--bg)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: 460 }}
        >
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }} className="lg-hidden">
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ship size={17} color="#fff" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em' }}>LCL Marketplace</span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.02em', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 32 }}>Sign in to your account to continue</p>

          {error && (
            <div style={{ background: 'var(--red-bg)', border: '1px solid #fecaca', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: 'var(--red-text)', fontWeight: 500 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="form-label">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@company.com" className="input-field" />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  placeholder="Enter your password" className="input-field has-icon-right" />
                <button type="button" className="input-icon-right btn-icon" style={{ height: 'var(--input-h)', width: 44 }}
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ width: '100%', marginTop: 4, fontSize: 15 }}>
              {loading ? 'Signing in…' : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ marginTop: 32, textAlign: 'center', fontSize: 14, color: 'var(--text-3)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--text-1)', fontWeight: 700, textDecoration: 'none' }}>Create one →</Link>
          </p>
        </motion.div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-flex { display: flex !important; }
          .lg-hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
