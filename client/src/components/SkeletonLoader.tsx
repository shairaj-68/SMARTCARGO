/* Stat card grid skeleton */
export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <div>
        <div className="skeleton h-3 w-24 mb-3" />
        <div className="skeleton h-7 w-16 mb-2" />
        <div className="skeleton h-3 w-20" />
      </div>
      <div className="skeleton w-12 h-12 rounded-xl" />
    </div>
  );
}

/* Table rows skeleton */
export function TableRowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 5 }).map((_, j) => (
            <td key={j} className="px-5 py-4">
              <div className="skeleton h-4" style={{ width: `${60 + Math.random() * 30}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* Generic card skeleton */
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card card-p">
      <div className="skeleton h-5 w-1/3 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-4 mb-2" style={{ width: `${70 + i * 10}%` }} />
      ))}
    </div>
  );
}
