import type { ReactNode } from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface Crumb { label: string; href?: string; }

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="breadcrumb mb-2">
          <Home size={12} className="text-[var(--text-4)]" />
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight size={12} className="breadcrumb-sep" />
              {crumb.href
                ? <a href={crumb.href} className="breadcrumb-item hover:text-[var(--text-1)] transition-colors">{crumb.label}</a>
                : <span className={`breadcrumb-item ${i === breadcrumbs.length - 1 ? 'active' : ''}`}>{crumb.label}</span>
              }
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
