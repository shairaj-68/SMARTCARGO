import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ship, Eye, EyeOff, ArrowRight, Briefcase, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { register } from '../../features/authSlice';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="form-label">{label}</label>
    {children}
  </div>
);

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'customer',
    companyName: '', registrationNumber: '', gstNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state: any) => state.auth);

  const update = (f: string, v: string) => setFormData({ ...formData, [f]: v });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { alert('Passwords do not match'); return; }
    const result = await dispatch(register(formData));
    if (register.fulfilled.match(result)) {
      navigate(result.payload.user.role === 'logistics' ? '/logistics' : '/customer');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      {/* Brand panel */}
      <div style={{ width: '42%', background: 'var(--brand)', display: 'none', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', position: 'relative', overflow: 'hidden' }} className="lg-flex">
        <div style={{ position: 'absolute', right: -80, top: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ship size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-.02em' }}>LCL Marketplace</span>
        </div>
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontSize: 42, fontWeight: 300, color: '#fff', lineHeight: 1.15, letterSpacing: '-.03em', marginBottom: 16 }}>
            Start shipping<br /><span style={{ fontWeight: 700 }}>smarter today.</span>
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.7, marginBottom: 32 }}>
            Join 500+ companies booking cargo space on-demand. Pay only for the CBM you need.
          </p>
          {['No hidden fees', 'Real-time tracking', 'Verified carriers', 'Instant booking'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(74,222,128,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 12 }}>✓</span>
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>{f}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', position: 'relative' }}>© 2026 LCL Marketplace</p>
      </div>

      {/* Form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 24px', background: 'var(--bg)', overflowY: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: 520, paddingBottom: 40 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }} className="lg-hidden">
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ship size={17} color="#fff" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em' }}>LCL Marketplace</span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.02em', marginBottom: 6 }}>Create account</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 32 }}>Get started in minutes — no credit card required.</p>

          {error && (
            <div style={{ background: 'var(--red-bg)', border: '1px solid #fecaca', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: 'var(--red-text)', fontWeight: 500 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Role toggle */}
            <div>
              <label className="form-label">Account Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { value: 'customer',  label: 'Exporter / Importer', icon: User },
                  { value: 'logistics', label: 'Logistics Carrier',   icon: Briefcase },
                ].map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button" onClick={() => update('role', value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '14px 16px', borderRadius: 'var(--r-md)',
                      border: `2px solid ${formData.role === value ? 'var(--brand)' : 'var(--border)'}`,
                      background: formData.role === value ? 'var(--brand-muted)' : 'var(--surface)',
                      cursor: 'pointer', transition: 'all .15s',
                    }}>
                    <Icon size={16} color={formData.role === value ? 'var(--brand)' : 'var(--text-3)'} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: formData.role === value ? 'var(--brand)' : 'var(--text-2)' }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Full Name">
                <input type="text" value={formData.name} onChange={e => update('name', e.target.value)} required placeholder="Jane Smith" className="input-field" />
              </Field>
              <Field label="Phone">
                <input type="tel" value={formData.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 555 000 0000" className="input-field" />
              </Field>
            </div>

            <Field label="Email address">
              <input type="email" value={formData.email} onChange={e => update('email', e.target.value)} required placeholder="you@company.com" className="input-field" />
            </Field>

            {formData.role === 'logistics' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Company Name">
                  <input type="text" value={formData.companyName} onChange={e => update('companyName', e.target.value)} placeholder="FreightCo Ltd." className="input-field" />
                </Field>
                <Field label="Registration No.">
                  <input type="text" value={formData.registrationNumber} onChange={e => update('registrationNumber', e.target.value)} placeholder="REG123456" className="input-field" />
                </Field>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Password">
                <div className="input-wrapper">
                  <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => update('password', e.target.value)} required placeholder="8+ characters" className="input-field has-icon-right" />
                  <button type="button" className="input-icon-right btn-icon" style={{ height: 'var(--input-h)', width: 44 }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
              <Field label="Confirm Password">
                <input type="password" value={formData.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required placeholder="Repeat password" className="input-field" />
              </Field>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: 4, fontSize: 15 }}>
              {loading ? 'Creating account…' : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ marginTop: 32, textAlign: 'center', fontSize: 14, color: 'var(--text-3)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--text-1)', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </motion.div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-flex { display: flex !important; }
          .lg-hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
