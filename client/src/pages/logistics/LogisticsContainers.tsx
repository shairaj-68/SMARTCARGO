import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Container } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { TableRowSkeleton } from '../../components/SkeletonLoader';
import { logisticsAPI } from '../../services/api';

const statusBadge: Record<string, string> = {
  active: 'badge badge-green',
  paused: 'badge badge-amber',
  closed: 'badge badge-red',
  full:   'badge badge-blue',
};

const INITIAL_FORM = {
  containerNumber: '', type: '20ft', originPort: '', destinationPort: '',
  originCountry: '', destinationCountry: '',
  departureDate: '', arrivalDate: '', capacity: '', pricePerCBM: '',
  minBooking: '1', maxBooking: '', cargoTypes: '',
};

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="form-label">{label}{required && <span className="required">*</span>}</label>
    {children}
  </div>
);

export default function LogisticsContainers() {
  const [containers, setContainers] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState(INITIAL_FORM);

  useEffect(() => {
    logisticsAPI.getContainers()
      .then((res) => { setContainers(res.data.containers); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const f = (field: string) => ({ value: (form as any)[field], onChange: (e: any) => setForm({ ...form, [field]: e.target.value }) });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const data = { ...form, capacity: Number(form.capacity), pricePerCBM: Number(form.pricePerCBM), minBooking: Number(form.minBooking), maxBooking: Number(form.maxBooking), cargoTypes: form.cargoTypes.split(',').map(s => s.trim()).filter(Boolean) };
      const res = await logisticsAPI.addContainer(data);
      setContainers([res.data.container, ...containers]);
      setShowAdd(false); setForm(INITIAL_FORM);
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this container?')) return;
    await logisticsAPI.deleteContainer(id);
    setContainers(containers.filter(c => c._id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Containers"
        subtitle={`${containers.length} container listings`}
        breadcrumbs={[{ label: 'Carrier Portal' }, { label: 'Containers' }]}
        actions={
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Container
          </button>
        }
      />

      <div className="table-wrap">
        <table className="table-pro">
          <thead>
            <tr>
              <th>Container #</th>
              <th>Type</th>
              <th>Route</th>
              <th>Departure</th>
              <th>Space (CBM)</th>
              <th>Price/CBM</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <TableRowSkeleton rows={6} />
              : containers.map(c => (
                <tr key={c._id}>
                  <td className="td-primary" style={{ fontFamily: 'monospace', fontSize: 13 }}>{c.containerNumber}</td>
                  <td><span className="badge badge-gray">{c.type}</span></td>
                  <td>
                    <span style={{ fontSize: 13 }}>{c.originPort}</span>
                    <span style={{ color: 'var(--text-4)', margin: '0 6px' }}>→</span>
                    <span style={{ fontSize: 13 }}>{c.destinationPort}</span>
                  </td>
                  <td>{c.departureDate ? new Date(c.departureDate).toLocaleDateString() : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 60, height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round(((c.capacity - c.availableSpace) / c.capacity) * 100)}%`, height: '100%', background: 'var(--brand)', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{c.availableSpace}/{c.capacity}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>${c.pricePerCBM}</td>
                  <td><span className={statusBadge[c.status] || 'badge badge-gray'}>{c.status}</span></td>
                  <td>
                    <button className="btn-icon" onClick={() => handleDelete(c._id)} title="Delete"
                      style={{ color: 'var(--red-text)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--red-bg)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && containers.length === 0 && (
          <EmptyState icon={Container} title="No containers yet" description="Add your first container to start receiving booking requests."
            action={<button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Container</button>} />
        )}
      </div>

      {/* Add Container Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Container" size="lg"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button form="container-form" type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving…' : 'Add Container'}</button>
        </>}>
        <form id="container-form" onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Container Number" required><input {...f('containerNumber')} required className="input-field" placeholder="MSCU1234567" /></Field>
            <Field label="Type" required>
              <select {...f('type')} className="select-field">
                {['20ft','40ft','reefer','openTop','flatRack'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Origin Port" required><input {...f('originPort')} required className="input-field" placeholder="Shanghai" /></Field>
            <Field label="Destination Port" required><input {...f('destinationPort')} required className="input-field" placeholder="Rotterdam" /></Field>
            <Field label="Origin Country"><input {...f('originCountry')} className="input-field" placeholder="China" /></Field>
            <Field label="Destination Country"><input {...f('destinationCountry')} className="input-field" placeholder="Netherlands" /></Field>
            <Field label="Departure Date" required><input type="date" {...f('departureDate')} required className="input-field" /></Field>
            <Field label="Arrival Date" required><input type="date" {...f('arrivalDate')} required className="input-field" /></Field>
            <Field label="Capacity (CBM)" required><input type="number" {...f('capacity')} required className="input-field" placeholder="25" min="1" /></Field>
            <Field label="Price per CBM ($)" required><input type="number" {...f('pricePerCBM')} required className="input-field" placeholder="45" min="0" /></Field>
            <Field label="Min Booking (CBM)"><input type="number" {...f('minBooking')} className="input-field" placeholder="1" /></Field>
            <Field label="Max Booking (CBM)" required><input type="number" {...f('maxBooking')} required className="input-field" placeholder="25" /></Field>
          </div>
          <Field label="Cargo Types (comma-separated)">
            <input {...f('cargoTypes')} className="input-field" placeholder="Electronics, Automotive, General Cargo" />
          </Field>
        </form>
      </Modal>
    </motion.div>
  );
}
