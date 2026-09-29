import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Upload, Eye, File as FileIcon, Search, Filter, ShieldCheck, Clock, AlertCircle, Ship, MapPin, Box } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { documentAPI, customerAPI } from '../../services/api';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { TableRowSkeleton } from '../../components/SkeletonLoader';
import toast from 'react-hot-toast';

const TABS = ['All Documents', 'Required', 'Uploaded', 'Pending', 'Verified'];

export default function CustomerDocuments() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All Documents');
  
  // Upload State
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState('commercial_invoice');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Fetch bookings to select from
    customerAPI.getMyBookings()
      .then(res => {
        const bks = res.data.bookings || [];
        setBookings(bks);
        if (bks.length > 0) {
          setSelectedBooking(bks[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedBooking) {
      setLoading(true);
      documentAPI.getMyDocuments()
        .then(res => {
          // In a real app we'd fetch docs for the specific booking, but for now we filter locally
          const allDocs = res.data.documents || [];
          setDocuments(allDocs.filter((d: any) => d.bookingId === selectedBooking._id || d.bookingId?._id === selectedBooking._id));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [selectedBooking]);

  const filteredDocs = documents.filter(d => {
    if (tab === 'All Documents') return true;
    if (tab === 'Uploaded') return d.status === 'uploaded';
    if (tab === 'Pending') return d.status === 'under_review' || d.status === 'pending_upload';
    if (tab === 'Verified') return d.status === 'verified';
    if (tab === 'Required') return true; // Mock logic
    return true;
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !selectedBooking) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('type', uploadType);
    formData.append('bookingId', selectedBooking._id);

    try {
      const res = await documentAPI.uploadDocument(formData);
      setDocuments([res.data.document, ...documents]);
      toast.success('Document uploaded successfully');
      setShowUpload(false);
      setUploadFile(null);
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return <span className="badge badge-green"><ShieldCheck size={12} style={{marginRight: 4}}/> Verified</span>;
      case 'under_review': return <span className="badge badge-yellow"><Clock size={12} style={{marginRight: 4}}/> Under Review</span>;
      case 'rejected': return <span className="badge badge-red"><AlertCircle size={12} style={{marginRight: 4}}/> Rejected</span>;
      case 'uploaded': return <span className="badge badge-blue"><Upload size={12} style={{marginRight: 4}}/> Uploaded</span>;
      default: return <span className="badge badge-gray" style={{textTransform: 'capitalize'}}>{status.replace('_', ' ')}</span>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Document Management System"
        subtitle="Securely store, share, and track all your shipment-related documents."
        breadcrumbs={[{ label: 'My Cargo' }, { label: 'Documents' }]}
        actions={
          <div style={{ display: 'flex', gap: 12 }}>
            <select 
              className="input-field" 
              style={{ width: 200, padding: '8px 12px' }}
              value={selectedBooking?._id || ''}
              onChange={(e) => setSelectedBooking(bookings.find(b => b._id === e.target.value))}
            >
              {bookings.map(b => (
                <option key={b._id} value={b._id}>{b.bookingNumber} - {b.containerId?.originPort}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
              <Upload size={16} /> Upload Document
            </button>
          </div>
        }
      />

      {selectedBooking && (
        <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(to right, var(--surface-1), var(--surface-2))' }}>
          <div style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--brand-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                <Box size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginBottom: 2 }}>BOOKING ID</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>{selectedBooking.bookingNumber}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--brand-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                <MapPin size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginBottom: 2 }}>ROUTE</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{selectedBooking.containerId?.originPort} → {selectedBooking.containerId?.destinationPort}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--brand-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                <Ship size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginBottom: 2 }}>STATUS</div>
                <div style={{ fontSize: 15, fontWeight: 600, textTransform: 'capitalize' }}>{selectedBooking.status}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="tab-list" style={{ marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="card">
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <div className="input-icon-wrap" style={{ width: 300 }}>
            <Search className="icon" size={16} />
            <input type="text" className="input-field" placeholder="Search documents..." style={{ paddingLeft: 36 }} />
          </div>
          <button className="btn btn-secondary btn-sm"><Filter size={14} /> Filter</button>
        </div>
        <div className="table-wrap" style={{ border: 'none', borderRadius: '0 0 var(--r-lg) var(--r-lg)' }}>
          <table className="table-pro">
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton rows={5} />
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map(d => (
                  <tr key={d._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileIcon size={16} color="var(--brand)" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{d.fileName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>v{d.version || 1}.0</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize', color: 'var(--text-2)' }}>{d.type.replace(/_/g, ' ')}</span></td>
                    <td><span style={{ fontSize: 13, textTransform: 'capitalize' }}>{d.uploadedByRole || 'Customer'}</span></td>
                    <td><span style={{ fontSize: 13 }}>{new Date(d.createdAt).toLocaleDateString()}</span></td>
                    <td>{getStatusBadge(d.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-icon" title="View">
                          <Eye size={16} />
                        </a>
                        <a href={d.fileUrl} download className="btn-icon" title="Download">
                          <Download size={16} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '60px 0' }}>
                    <EmptyState icon={FileText} title="No documents found" description={`There are no ${tab.toLowerCase()} for this booking.`} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Document" size="md"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowUpload(false)}>Cancel</button>
          <button form="upload-form" type="submit" className="btn btn-primary" disabled={isUploading || !uploadFile}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </>}>
        <form id="upload-form" onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div>
            <label className="form-label">Document Type</label>
            <select className="input-field" value={uploadType} onChange={e => setUploadType(e.target.value)}>
              <option value="commercial_invoice">Commercial Invoice</option>
              <option value="packing_list">Packing List</option>
              <option value="bill_of_lading">Bill of Lading</option>
              <option value="shipping_invoice">Shipping Invoice</option>
              <option value="insurance_certificate">Insurance Certificate</option>
              <option value="gst_invoice">GST Invoice</option>
              <option value="export_declaration">Export Declaration</option>
              <option value="customs_documents">Customs Documents</option>
              <option value="delivery_receipt">Delivery Receipt</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="form-label">File</label>
            <div 
              style={{ 
                border: '2px dashed var(--border)', 
                borderRadius: 'var(--r-lg)', 
                padding: '40px', 
                textAlign: 'center',
                background: 'var(--surface-2)',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input 
                id="file-upload" 
                type="file" 
                style={{ display: 'none' }} 
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setUploadFile(e.target.files[0]);
                  }
                }}
              />
              <Upload size={32} color="var(--brand)" style={{ margin: '0 auto 12px' }} />
              {uploadFile ? (
                <div style={{ fontWeight: 600 }}>{uploadFile.name}</div>
              ) : (
                <>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Drag & Drop or Click to Browse</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Supported files: PDF, DOCX, XLSX, PNG, JPG</div>
                </>
              )}
            </div>
          </div>
        </form>
      </Modal>

    </motion.div>
  );
}
