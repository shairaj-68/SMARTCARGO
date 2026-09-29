import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  trend?: { value: number; isUp: boolean };
  color?: string; // kept for backward-compat, ignored
  prefix?: string;
  suffix?: string;
}

export default function StatCard({ title, value, icon, trend, prefix = '', suffix = '' }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const isNumeric = typeof value === 'number';

  useEffect(() => {
    if (!isNumeric || isNaN(numericValue)) { setDisplayValue(numericValue); return; }
    let start = 0;
    const duration = 900;
    const increment = numericValue / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= numericValue) { setDisplayValue(numericValue); clearInterval(timer); }
      else { setDisplayValue(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [numericValue, isNumeric]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="stat-card"
    >
      <div className="flex-1">
        <p style={{ fontSize: 'var(--font-small)', fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, letterSpacing: '.01em' }}>
          {title}
        </p>
        <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.02em', lineHeight: 1 }}>
          {isNumeric
            ? `${prefix}${displayValue.toLocaleString()}${suffix}`
            : value}
        </p>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            {trend.isUp
              ? <TrendingUp size={13} color="var(--green)" />
              : <TrendingDown size={13} color="var(--red)" />}
            <span style={{ fontSize: 12, fontWeight: 600, color: trend.isUp ? 'var(--green)' : 'var(--red)' }}>
              {trend.isUp ? '+' : ''}{trend.value}%
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-4)' }}>vs last month</span>
          </div>
        )}
      </div>
      <div
        style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'var(--brand)', color: '#fff',
        }}
      >
        {icon}
      </div>
    </motion.div>
  );
}
