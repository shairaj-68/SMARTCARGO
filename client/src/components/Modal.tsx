import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
}

const sizes = { sm: 440, md: 560, lg: 720, xl: 900 };

export default function Modal({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.45)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: .96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: .96, y: 12 }}
            transition={{ duration: 0.2, ease: [.16,1,.3,1] }}
            style={{
              position: 'relative', background: '#fff',
              borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-xl)',
              width: '100%', maxWidth: sizes[size],
              maxHeight: 'calc(100vh - 48px)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>{title}</h3>
              <button className="btn-icon" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            {/* Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {children}
            </div>
            {/* Footer */}
            {footer && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: '#fafafa', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
