/**
 * StatCard — Reusable summary card for the dashboard.
 * Displays an icon, label, and numeric value with hover animation.
 */
export default function StatCard({ icon, label, value, bgClass, textClass }) {
  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card stat-card shadow-sm h-100">
        <div className="card-body d-flex align-items-center gap-3">
          <div className={`stat-icon ${bgClass}`}>
            {icon}
          </div>
          <div>
            <div className="text-muted small mb-1">{label}</div>
            <div className="fs-2 fw-bold lh-1">{value ?? '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
