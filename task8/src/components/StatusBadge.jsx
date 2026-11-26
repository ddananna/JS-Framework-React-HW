const LABELS = {
  available: 'Available',
  reserved: 'Reserved',
  completed: 'Completed',
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{LABELS[status] ?? status}</span>;
}
