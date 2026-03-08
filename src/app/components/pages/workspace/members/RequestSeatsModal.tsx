import { X, Mail } from 'lucide-react';

interface RequestSeatsModalProps {
  onClose: () => void;
  availableSeats: number;
  totalSeats: number;
}

export function RequestSeatsModal({ onClose, availableSeats, totalSeats }: RequestSeatsModalProps) {
  const handleRequestSeats = () => {
    // Create a mailto link to support
    const subject = encodeURIComponent('Request for Additional Workspace Seats');
    const body = encodeURIComponent(
      `Hello Support Team,\n\nI would like to request additional seats for my workspace.\n\nCurrent Status:\n- Total Seats: ${totalSeats}\n- Available Seats: ${availableSeats}\n- Seats in Use: ${totalSeats - availableSeats}\n\nPlease let me know the process for adding more seats.\n\nThank you!`
    );
    window.location.href = `mailto:support@company.com?subject=${subject}&body=${body}`;
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[100]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="relative p-6 w-full max-w-md"
        style={{
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--elevation-sm)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded transition-colors hover:bg-secondary"
          style={{
            color: 'var(--muted)',
          }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
          style={{
            backgroundColor: 'var(--warning)',
            opacity: 0.1,
          }}
        >
          <Users
            className="w-6 h-6"
            style={{ color: 'var(--warning)', opacity: 1 }}
          />
        </div>

        {/* Title */}
        <h3
          className="mb-2"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-h3)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--foreground)',
          }}
        >
          {availableSeats === 0 ? 'No Seats Available' : 'Not Enough Seats'}
        </h3>

        {/* Description */}
        <p
          className="mb-6"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-base)',
            color: 'var(--muted)',
            lineHeight: '1.5',
          }}
        >
          {availableSeats === 0
            ? `You've reached your workspace limit of ${totalSeats} seats. To invite more members, you'll need to request additional seats.`
            : `You don't have enough available seats to complete this action. You currently have ${availableSeats} seat${
                availableSeats === 1 ? '' : 's'
              } available out of ${totalSeats} total.`}
        </p>

        {/* Info box */}
        <div
          className="p-4 mb-6"
          style={{
            backgroundColor: 'var(--primary-background)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-sm)',
              color: 'var(--foreground)',
              lineHeight: '1.5',
            }}
          >
            <strong style={{ fontWeight: 'var(--font-weight-bold)' }}>
              How to get more seats:
            </strong>
            <br />
            Contact our support team to upgrade your workspace. We'll help you
            add the seats you need.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 transition-colors"
            style={{
              backgroundColor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleRequestSeats}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 transition-all"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}

function Users({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}
