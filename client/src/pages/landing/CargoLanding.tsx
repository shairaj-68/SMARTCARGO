import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Search, Ship, Package, Globe, Users,
  ArrowRight,
} from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────────────── */
const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
];

const stats = [
  { value: '10,000+', label: 'Containers Booked', icon: Package },
  { value: '500+',    label: 'Partner Companies',  icon: Users },
  { value: '200+',    label: 'Global Routes',       icon: Globe },
  { value: '50+',     label: 'Countries Served',    icon: Ship },
];

const steps = [
  { step: '01', title: 'Search', description: 'Find available cargo space by origin, destination, container type and departure date.' },
  { step: '02', title: 'Book',   description: 'Select your CBM slot, upload shipping documents, and confirm your booking instantly.' },
  { step: '03', title: 'Track',  description: 'Monitor your cargo in real-time from port of loading to final delivery.' },
];



/* ─── Component ─────────────────────────────────────────────────── */
export default function CargoLanding() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState({ origin: '', destination: '', date: '', type: '' });
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.origin)      params.set('origin', search.origin);
    if (search.destination) params.set('destination', search.destination);
    if (search.date)        params.set('date', search.date);
    if (search.type)        params.set('containerType', search.type);
    navigate(`/login?redirect=/customer/search&${params.toString()}`);
  };

  return (
    <div className="min-h-screen font-['Inter',sans-serif]" style={{ background: 'var(--bg)' }}>

      {/* ══════════════════════ HERO SECTION ══════════════════════ */}
      <section className="relative" style={{ height: '85vh', minHeight: 600 }}>

        {/* Video Background */}
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4"
        />
        {/* Light scrim */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />

        {/* Content stack */}
        <div className="relative z-10 h-full flex flex-col">

          {/* ── Navigation ───────────────────────────────────────── */}
          <nav className="w-full mx-auto" style={{ maxWidth: 'var(--content-max)', padding: '24px 32px' }}>
            <div className="flex items-center justify-between">

              {/* Brand */}
              <motion.div
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2.5"
              >
                <div className="flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: 'var(--brand)' }}>
                  <Ship size={18} className="text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">LCL Marketplace</span>
              </motion.div>

              {/* Desktop links */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="hidden md:flex items-center gap-8"
              >
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.label} href={link.href}
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i + 0.35, duration: 0.4 }}
                    style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)', textDecoration: 'none' }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </motion.div>

              {/* Desktop auth buttons */}
              <motion.div
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="hidden md:flex items-center gap-3"
              >
                <Link to="/login" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', padding: '0 12px', textDecoration: 'none' }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  Get Started
                </Link>
              </motion.div>

              {/* Mobile hamburger */}
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="md:hidden btn-icon" onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>

            {/* Mobile dropdown */}
            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="md:hidden mt-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 overflow-hidden"
                >
                  {navLinks.map((link) => (
                    <a key={link.label} href={link.href} className="block px-6 py-3.5 text-sm font-medium text-gray-900 border-b border-gray-100" onClick={() => setMobileOpen(false)}>
                      {link.label}
                    </a>
                  ))}
                  <div className="px-6 py-4 flex flex-col gap-2 border-t border-gray-100">
                    <Link to="/login" className="btn btn-secondary w-full" onClick={() => setMobileOpen(false)}>Sign In</Link>
                    <Link to="/register" className="btn btn-primary w-full" onClick={() => setMobileOpen(false)}>Get Started</Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          {/* ── Hero Content ─────────────────────────────────────── */}
          <div className="flex-1 flex flex-col justify-center px-4" style={{ maxWidth: 'var(--content-max)', margin: '0 auto', width: '100%', paddingBottom: 60 }}>
            
            <div style={{ maxWidth: 800 }}>
              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.55 }}
                style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 20 }}
              >
                Smart Cargo Space Booking
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
                style={{ fontSize: 'clamp(48px, 8vw, 88px)', lineHeight: 0.95, letterSpacing: '-.03em', fontWeight: 400, color: 'var(--text-3)' }}
              >
                Efficient.<br/>
                <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>Affordable.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.55 }}
                style={{ fontSize: 18, color: 'var(--text-2)', marginTop: 24, marginBottom: 40, maxWidth: 500, lineHeight: 1.6 }}
              >
                Book unused container space on-demand. Pay only for the CBM you need with verified carriers worldwide.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.5 }} className="flex gap-4">
                <Link to="/register" className="btn btn-primary">Book Space Now</Link>
                <Link to="#how-it-works" className="btn btn-secondary" style={{ background: 'rgba(255,255,255,.5)', backdropFilter: 'blur(10px)' }}>How it works</Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Floating Search Bar aligned to bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 32px', transform: 'translateY(50%)', zIndex: 20 }}>
          <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.55 }}
              className="card card-p" style={{ background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(12px)', padding: 16 }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12 }}>
                <input type="text" placeholder="Origin Port" value={search.origin} onChange={e => setSearch({ ...search, origin: e.target.value })} className="input-field" />
                <input type="text" placeholder="Destination Port" value={search.destination} onChange={e => setSearch({ ...search, destination: e.target.value })} className="input-field" />
                <input type="date" value={search.date} onChange={e => setSearch({ ...search, date: e.target.value })} className="input-field" />
                <button type="submit" className="btn btn-primary" style={{ width: 140 }}><Search size={16} /> Search</button>
              </div>
            </motion.form>
          </div>
        </div>
      </section>

      <div style={{ height: 60 }} /> {/* Spacer for floating search */}

      {/* ══════════════════════ STATS ══════════════════════════════ */}
      <section style={{ padding: '80px 32px' }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <s.icon size={22} className="text-white" />
              </div>
              <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em', marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize: 14, color: 'var(--text-3)' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section id="how-it-works" style={{ padding: '100px 32px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12 }}>The Process</p>
            <h2 style={{ fontSize: 40, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.02em' }}>How It Works</h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {steps.map((step, i) => (
              <motion.div key={step.step} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }} className="card card-p">
                <p style={{ fontSize: 56, fontWeight: 800, color: 'var(--border)', letterSpacing: '-.04em', lineHeight: 1, marginBottom: 16 }}>{step.step}</p>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA BANNER ═════════════════════════ */}
      <section id="pricing" style={{ padding: '120px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontSize: 48, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.03em', marginBottom: 16 }}>Ready to ship smarter?</h2>
            <p style={{ fontSize: 16, color: 'var(--text-3)', marginBottom: 32 }}>Join 500+ companies that trust LCL Marketplace for their cargo shipping needs.</p>
            <div className="flex gap-4 justify-center">
              <Link to="/register?role=customer" className="btn btn-primary" style={{ padding: '0 32px' }}>Book Cargo Space <ArrowRight size={16} /></Link>
              <Link to="/register?role=logistics" className="btn btn-secondary" style={{ padding: '0 32px' }}>List as Carrier <ArrowRight size={16} /></Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════════════ */}
      <footer id="about" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '48px 32px' }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: 'var(--brand)' }}><Ship size={16} className="text-white" /></div>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>LCL Marketplace</span>
          </div>
          <div className="flex items-center gap-6">
            {navLinks.map(link => <a key={link.label} href={link.href} style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none' }}>{link.label}</a>)}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-4)' }}>© 2026 LCL Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
