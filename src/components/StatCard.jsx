export function StatCard({ label, value, detail, accent = "sun" }) {
  return (
    <article className={`stat-card ${accent}`}>
      <span className="eyebrow">{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}
