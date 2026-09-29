import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, ShieldCheck, CreditCard, Truck, Bell, Users, Upload } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { useAppSelector } from '../../hooks/useRedux';

const TABS = [
  { id: 'profile', label: 'Company Profile', icon: Building },
  { id: 'verification', label: 'Verification', icon: ShieldCheck },
  { id: 'banking', label: 'Banking & Payouts', icon: CreditCard },
  { id: 'fleet', label: 'Fleet Operations', icon: Truck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'team', label: 'Team Members', icon: Users },
];

export default function LogisticsSettings() {
  const { user } = useAppSelector((state: any) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); alert('Settings saved successfully!'); }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Settings"
        subtitle="Manage your company profile, fleet operations, and team access"
        breadcrumbs={[{ label: 'System' }, { label: 'Settings' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32 }}>
        {/* Sidebar Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  borderRadius: 8, border: 'none', background: isActive ? 'var(--brand-muted)' : 'transparent',
                  color: isActive ? 'var(--brand)' : 'var(--text-2)',
                  fontWeight: isActive ? 600 : 500, fontSize: 14, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s'
                }}>
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="card">
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} style={{ padding: 32 }}>
              <h3 className="section-title" style={{ marginBottom: 24 }}>Company Profile</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={32} color="var(--text-4)" />
                </div>
                <div>
                  <button type="button" className="btn btn-secondary btn-sm" style={{ marginBottom: 8 }}><Upload size={14} /> Upload Logo</button>
                  <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Recommended size: 256x256px</p>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label className="form-label">Company Name</label>
                  <input type="text" className="input-field" defaultValue="Fast Freight LLC" />
                </div>
                <div>
                  <label className="form-label">Contact Email</label>
                  <input type="email" className="input-field" defaultValue={user?.email} />
                </div>
                <div>
                  <label className="form-label">Phone Number</label>
                  <input type="text" className="input-field" defaultValue="+1 (555) 123-4567" />
                </div>
                <div>
                  <label className="form-label">Registration Number</label>
                  <input type="text" className="input-field" defaultValue="REG-987654321" readOnly style={{ background: 'var(--bg)' }} />
                </div>
              </div>
              
              <div style={{ marginBottom: 32 }}>
                <label className="form-label">Company Description</label>
                <textarea className="textarea-field" rows={4} defaultValue="Leading logistics provider specializing in trans-pacific LCL cargo." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          )}

          {activeTab === 'banking' && (
            <form onSubmit={handleSave} style={{ padding: 32 }}>
              <h3 className="section-title" style={{ marginBottom: 8 }}>Banking & Payouts</h3>
              <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 32 }}>Configure where your platform earnings are sent.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, maxWidth: 500 }}>
                <div>
                  <label className="form-label">Account Holder Name</label>
                  <input type="text" className="input-field" defaultValue="Fast Freight LLC" />
                </div>
                <div>
                  <label className="form-label">Bank Name</label>
                  <input type="text" className="input-field" defaultValue="Chase Business" />
                </div>
                <div>
                  <label className="form-label">Routing Number</label>
                  <input type="text" className="input-field" defaultValue="122000248" />
                </div>
                <div>
                  <label className="form-label">Account Number</label>
                  <input type="password" className="input-field" defaultValue="123456789" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 32 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Update Bank Details'}</button>
              </div>
            </form>
          )}

          {activeTab === 'fleet' && (
            <form onSubmit={handleSave} style={{ padding: 32 }}>
              <h3 className="section-title" style={{ marginBottom: 8 }}>Fleet Operations</h3>
              <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 32 }}>Set default configurations for new container listings.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, maxWidth: 600 }}>
                <div>
                  <label className="form-label">Default Container Types</label>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {['20ft Standard', '40ft Standard', 'Refrigerated', 'Flat Rack'].map(type => (
                      <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                        <input type="checkbox" defaultChecked={type.includes('Standard')} /> {type}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Primary Operating Ports</label>
                  <input type="text" className="input-field" defaultValue="Shanghai, Rotterdam, Los Angeles, Singapore" placeholder="Comma separated ports" />
                </div>

                <div>
                  <label className="form-label">Minimum Booking Space (CBM)</label>
                  <input type="number" className="input-field" defaultValue={1} style={{ maxWidth: 120 }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 32 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Fleet Settings'}</button>
              </div>
            </form>
          )}

          {(activeTab === 'verification' || activeTab === 'notifications' || activeTab === 'team') && (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <ShieldCheck size={48} color="var(--border)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Under Construction</h3>
              <p style={{ color: 'var(--text-3)' }}>The {TABS.find(t => t.id === activeTab)?.label} module is currently being built.</p>
            </div>
          )}

        </div>
      </div>
    </motion.div>
  );
}
