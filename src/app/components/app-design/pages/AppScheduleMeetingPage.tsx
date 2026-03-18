import { Search, X, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';
import { useRole, hasAccess } from '../../../contexts/RoleContext';
import { MemberAvatar } from '../../MemberAvatar';

const allParticipants = [
  { id: '1', name: 'Luy Robin', role: 'Field Engineer', avatar: 'LR', color: '#2F80ED', added: true },
  { id: '2', name: 'David Amrosa', role: 'Service Support Expert', avatar: 'DA', color: '#2F80ED', added: true },
  { id: '3', name: 'Nika Jerrardo', role: 'Instructor', avatar: 'NJ', color: '#11E874', added: true },
  { id: '4', name: 'Jared Sunn', role: 'Operator', avatar: 'JS', color: '#FF6B35', added: false },
  { id: '5', name: 'Sarah Chen', role: 'Admin', avatar: 'SC', color: '#E91E63', added: false },
  { id: '6', name: 'Marcus Williams', role: 'Field Engineer', avatar: 'MW', color: '#00BCD4', added: false },
];

interface AppScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppScheduleMeetingModal({ isOpen, onClose }: AppScheduleMeetingModalProps) {
  const { currentRole } = useRole();
  const canSchedule = hasAccess(currentRole, 'schedule-meeting');
  const [title, setTitle] = useState('Remote Support Meeting');
  const [startDate, setStartDate] = useState('2026-03-08');
  const [startTime, setStartTime] = useState('10:00');
  const [endDate, setEndDate] = useState('2026-03-08');
  const [endTime, setEndTime] = useState('11:00');
  const [timezone] = useState('Atlantic Standard Time (AST) - UTC +13:37');
  const [participantSearch, setParticipantSearch] = useState('');
  const [participants, setParticipants] = useState(allParticipants);

  const toggleParticipant = (id: string) => {
    setParticipants(prev =>
      prev.map(p => p.id === id ? { ...p, added: !p.added } : p)
    );
  };

  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(participantSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className="pointer-events-auto bg-card rounded-lg shadow-elevation-lg border border-border overflow-hidden flex flex-col"
          style={{ width: '560px', maxWidth: '100%', maxHeight: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
            <h3 style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>Schedule Meeting</h3>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Close">
              <X className="size-4" style={{ color: '#36415D' }} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-5 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Add title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-lg text-sm bg-card border-2 border-input outline-none text-foreground placeholder:text-muted focus:border-primary transition-colors"
                style={{ fontWeight: 'var(--font-weight-medium)' }}
              />
            </div>

            {/* Date and Time */}
            <div>
              <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Date and Time
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11 px-3 rounded-lg text-sm bg-card border-2 border-input outline-none text-foreground focus:border-primary transition-colors flex-1 min-w-[130px]"
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-11 px-3 rounded-lg text-sm bg-card border-2 border-input outline-none text-foreground focus:border-primary transition-colors min-w-[100px]"
                />
                <span className="text-sm text-muted px-1">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-11 px-3 rounded-lg text-sm bg-card border-2 border-input outline-none text-foreground focus:border-primary transition-colors flex-1 min-w-[130px]"
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-11 px-3 rounded-lg text-sm bg-card border-2 border-input outline-none text-foreground focus:border-primary transition-colors min-w-[100px]"
                />
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Timezone
              </label>
              <div className="relative">
                <select
                  value={timezone}
                  className="w-full h-10 px-3 rounded-lg text-sm bg-card border-2 border-input outline-none text-foreground focus:border-primary transition-colors appearance-none pr-10 cursor-pointer"
                >
                  <option>Atlantic Standard Time (AST) - UTC +13:37</option>
                  <option>Eastern Standard Time (EST) - UTC -05:00</option>
                  <option>Pacific Standard Time (PST) - UTC -08:00</option>
                  <option>Central European Time (CET) - UTC +01:00</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Participants
              </label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-lg text-sm bg-secondary border-none outline-none text-foreground placeholder:text-muted focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden max-h-48 overflow-y-auto">
                {filteredParticipants.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                    <MemberAvatar
                      name={p.name}
                      initials={p.avatar}
                      color={p.color}
                      size="lg"
                      role={p.role}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground truncate" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                        {p.name}
                      </div>
                      <div className="text-xs text-muted truncate">{p.role}</div>
                    </div>
                    <button
                      onClick={() => toggleParticipant(p.id)}
                      className={`text-xs shrink-0 min-h-[44px] px-2 ${p.added ? 'text-destructive hover:text-destructive/80' : 'text-primary hover:text-primary/80'}`}
                      style={{ fontWeight: 'var(--font-weight-medium)' }}
                    >
                      {p.added ? 'Remove' : '+ Add'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Share link */}
            <button className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <LinkIcon className="size-4" />
              Share link
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border flex items-center justify-end gap-2 shrink-0" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))' }}>
            <button
              onClick={onClose}
              className="px-5 text-sm text-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              style={{ fontWeight: 'var(--font-weight-semibold)', minHeight: '44px' }}
            >
              Cancel
            </button>
            <button
              disabled={!canSchedule}
              className={`px-5 text-sm rounded-lg transition-colors ${canSchedule ? 'text-white bg-primary hover:bg-primary/90' : 'text-muted bg-muted/30 cursor-not-allowed'}`}
              style={{ fontWeight: 'var(--font-weight-semibold)', minHeight: '44px' }}
              title={!canSchedule ? 'You do not have permission to schedule meetings' : undefined}
            >
              Schedule Meeting
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
