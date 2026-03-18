import { getStatusTone } from "../lib/formatters";

export function StatusBadge({ value }) {
  return <span className={`status-badge ${getStatusTone(value)}`}>{value || "n/a"}</span>;
}
