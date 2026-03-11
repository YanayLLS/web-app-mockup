import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Users, Globe, X } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import { MemberAvatar } from './MemberAvatar';

const TIMEZONES = [
  { name: 'Pacific/Midway', label: 'Midway Island, Samoa', offset: 'UTC-11:00' },
  { name: 'Pacific/Honolulu', label: 'Hawaii', offset: 'UTC-10:00' },
  { name: 'America/Anchorage', label: 'Alaska', offset: 'UTC-09:00' },
  { name: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)', offset: 'UTC-08:00' },
  { name: 'America/Denver', label: 'Mountain Time (US & Canada)', offset: 'UTC-07:00' },
  { name: 'America/Chicago', label: 'Central Time (US & Canada)', offset: 'UTC-06:00' },
  { name: 'America/New_York', label: 'Eastern Time (US & Canada)', offset: 'UTC-05:00' },
  { name: 'America/Caracas', label: 'Caracas, La Paz', offset: 'UTC-04:30' },
  { name: 'America/Santiago', label: 'Santiago', offset: 'UTC-04:00' },
  { name: 'America/Sao_Paulo', label: 'Brasilia', offset: 'UTC-03:00' },
  { name: 'Atlantic/South_Georgia', label: 'Mid-Atlantic', offset: 'UTC-02:00' },
  { name: 'Atlantic/Azores', label: 'Azores', offset: 'UTC-01:00' },
  { name: 'Europe/London', label: 'London, Dublin, Edinburgh', offset: 'UTC+00:00' },
  { name: 'Europe/Paris', label: 'Paris, Brussels, Madrid', offset: 'UTC+01:00' },
  { name: 'Europe/Athens', label: 'Athens, Istanbul, Cairo', offset: 'UTC+02:00' },
  { name: 'Europe/Moscow', label: 'Moscow, St. Petersburg', offset: 'UTC+03:00' },
  { name: 'Asia/Dubai', label: 'Abu Dhabi, Muscat', offset: 'UTC+04:00' },
  { name: 'Asia/Karachi', label: 'Islamabad, Karachi', offset: 'UTC+05:00' },
  { name: 'Asia/Kolkata', label: 'Mumbai, Kolkata, New Delhi', offset: 'UTC+05:30' },
  { name: 'Asia/Dhaka', label: 'Dhaka, Astana', offset: 'UTC+06:00' },
  { name: 'Asia/Bangkok', label: 'Bangkok, Hanoi, Jakarta', offset: 'UTC+07:00' },
  { name: 'Asia/Singapore', label: 'Singapore, Beijing, Hong Kong', offset: 'UTC+08:00' },
  { name: 'Asia/Tokyo', label: 'Tokyo, Seoul, Osaka', offset: 'UTC+09:00' },
  { name: 'Australia/Sydney', label: 'Sydney, Melbourne, Canberra', offset: 'UTC+10:00' },
  { name: 'Pacific/Noumea', label: 'Magadan, Solomon Islands', offset: 'UTC+11:00' },
  { name: 'Pacific/Auckland', label: 'Auckland, Wellington', offset: 'UTC+12:00' },
  { name: 'Pacific/Tongatapu', label: 'Nuku\'alofa', offset: 'UTC+13:00' },
];

function IconSearch() {
  return (
    <svg className="block size-3.5" fill="none" viewBox="0 0 14 14">
      <path
        d="M6.125 11.375C8.88642 11.375 11.125 9.13642 11.125 6.375C11.125 3.61358 8.88642 1.375 6.125 1.375C3.36358 1.375 1.125 3.61358 1.125 6.375C1.125 9.13642 3.36358 11.375 6.125 11.375Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.625 12.875L9.71875 9.96875"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface Person {
  id: string;
  name: string;
  initial: string;
  color: string;
  role?: string;
}

export interface Meeting {
  id?: string;
  title: string;
  participants: Person[];
  scheduledTime: Date;
  duration: number;
  hostId?: string;
}

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (meeting: Omit<Meeting, 'id'>) => void;
  people: Person[];
  initialTitle?: string;
  editingMeeting?: Meeting;
  onUpdate?: (meeting: Meeting) => void;
}

export function ScheduleMeetingModal({ isOpen, onClose, onSchedule, people, initialTitle, editingMeeting, onUpdate }: ScheduleMeetingModalProps) {
  const getDefaultDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    
    const endTime = new Date(now);
    endTime.setMinutes(endTime.getMinutes() + 30);
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const startTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const endTimeStr = endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    return { dateStr, startTimeStr, endTimeStr };
  };

  const defaultDateTime = getDefaultDateTime();
  
  const [title, setTitle] = useState(initialTitle || 'Meeting with Host Name');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(defaultDateTime.dateStr);
  const [startTime, setStartTime] = useState(defaultDateTime.startTimeStr);
  const [endDate, setEndDate] = useState(defaultDateTime.dateStr);
  const [endTime, setEndTime] = useState(defaultDateTime.endTimeStr);
  const [selectedTimezone, setSelectedTimezone] = useState(TIMEZONES[5]); // Default to Central Time
  const [timezoneSearchQuery, setTimezoneSearchQuery] = useState('');
  const [isTimezoneDropdownOpen, setIsTimezoneDropdownOpen] = useState(false);
  const timezoneDropdownRef = useRef<HTMLDivElement>(null);

  // Load editing meeting data when component opens in edit mode
  useEffect(() => {
    if (editingMeeting) {
      setTitle(editingMeeting.title);
      setSelectedParticipants(editingMeeting.participants.map(p => p.id));
      
      const schedDate = new Date(editingMeeting.scheduledTime);
      const endDate = new Date(schedDate);
      endDate.setMinutes(endDate.getMinutes() + editingMeeting.duration);
      
      const year = schedDate.getFullYear();
      const month = String(schedDate.getMonth() + 1).padStart(2, '0');
      const day = String(schedDate.getDate()).padStart(2, '0');
      setStartDate(`${year}-${month}-${day}`);
      setStartTime(schedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
      
      const endYear = endDate.getFullYear();
      const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
      const endDay = String(endDate.getDate()).padStart(2, '0');
      setEndDate(`${endYear}-${endMonth}-${endDay}`);
      setEndTime(endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    }
  }, [editingMeeting]);

  useEffect(() => {
    if (initialTitle && !editingMeeting) {
      setTitle(initialTitle);
    }
  }, [initialTitle, editingMeeting]);

  // Close timezone dropdown when clicking outside
  useClickOutside(timezoneDropdownRef, () => {
    setIsTimezoneDropdownOpen(false);
    setTimezoneSearchQuery('');
  });

  if (!isOpen) return null;

  const filteredPeople = people.filter(person => 
    person.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTimezones = TIMEZONES.filter(tz =>
    tz.label.toLowerCase().includes(timezoneSearchQuery.toLowerCase()) ||
    tz.offset.toLowerCase().includes(timezoneSearchQuery.toLowerCase())
  );

  const handleSubmit = () => {
    const scheduledTime = new Date();
    scheduledTime.setHours(scheduledTime.getHours() + 1);
    scheduledTime.setMinutes(0);
    scheduledTime.setSeconds(0);
    scheduledTime.setMilliseconds(0);
    
    const participants = people.filter(p => selectedParticipants.includes(p.id));
    
    const meetingData = {
      title,
      participants,
      scheduledTime,
      duration: 30,
    };

    if (editingMeeting && onUpdate) {
      // Update existing meeting
      onUpdate({
        ...meetingData,
        id: editingMeeting.id,
      });
    } else {
      // Create new meeting
      onSchedule(meetingData);
    }

    // Reset form
    setTitle('Meeting with Host Name');
    setSelectedParticipants([]);
    setSearchQuery('');
    const resetDateTime = getDefaultDateTime();
    setStartDate(resetDateTime.dateStr);
    setStartTime(resetDateTime.startTimeStr);
    setEndDate(resetDateTime.dateStr);
    setEndTime(resetDateTime.endTimeStr);
    onClose();
  };

  const toggleParticipant = (personId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-card rounded-[var(--radius)] w-full max-w-[680px] max-h-[calc(100vh-32px)] flex flex-col border border-border"
        style={{ boxShadow: 'var(--elevation-md)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <h2 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-bold)' }}>
            {editingMeeting ? 'Edit Meeting' : 'Schedule Remote Support Meeting'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-secondary rounded-[var(--radius)] transition-colors text-muted hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <div className="flex flex-col gap-6">
            {/* Meeting Title */}
            <div>
              <label className="block text-foreground mb-2.5" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                Meeting Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-card border border-border focus:border-primary rounded-[var(--radius)] px-4 py-3 text-foreground outline-none transition-colors hover:border-primary/50"
                placeholder="Enter meeting title"
              />
            </div>

            {/* Date and Time */}
            <div>
              <label className="block text-foreground mb-2.5" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                Date & Time
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Start Date/Time */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-secondary/30 rounded-[var(--radius)]">
                    <Calendar size={14} className="text-muted" />
                    <span className="text-muted" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      Start
                    </span>
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-card border border-border focus:border-primary rounded-[var(--radius)] px-4 py-3 text-foreground outline-none transition-colors hover:border-primary/50"
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-card border border-border focus:border-primary rounded-[var(--radius)] px-4 py-3 text-foreground outline-none transition-colors hover:border-primary/50"
                  />
                </div>

                {/* End Date/Time */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-secondary/30 rounded-[var(--radius)]">
                    <Clock size={14} className="text-muted" />
                    <span className="text-muted" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      End
                    </span>
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-card border border-border focus:border-primary rounded-[var(--radius)] px-4 py-3 text-foreground outline-none transition-colors hover:border-primary/50"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-card border border-border focus:border-primary rounded-[var(--radius)] px-4 py-3 text-foreground outline-none transition-colors hover:border-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Timezone */}
            <div className="relative" ref={timezoneDropdownRef}>
              <label className="block text-foreground mb-2.5" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                Timezone
              </label>
              <button
                type="button"
                onClick={() => setIsTimezoneDropdownOpen(!isTimezoneDropdownOpen)}
                className="w-full bg-card border border-border hover:border-primary/50 focus:border-primary rounded-[var(--radius)] px-4 py-3 text-foreground text-left flex items-center gap-3 outline-none transition-colors"
              >
                <Globe size={18} className="text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="text-foreground truncate">{selectedTimezone.label}</div>
                  <div className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>{selectedTimezone.offset}</div>
                </div>
                <svg 
                  className={`block size-4 text-muted transition-transform ${isTimezoneDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 12 12"
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {isTimezoneDropdownOpen && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-[var(--radius)] overflow-hidden z-50 max-w-[calc(100vw-32px)]"
                  style={{ boxShadow: 'var(--elevation-md)' }}
                >
                  <div className="p-3 border-b border-border bg-secondary/20">
                    <div className="bg-card border border-border focus-within:border-primary rounded-[var(--radius)] flex items-center gap-2 px-3 py-2 transition-colors">
                      <IconSearch />
                      <input
                        type="text"
                        placeholder="Search timezones..."
                        value={timezoneSearchQuery}
                        onChange={(e) => setTimezoneSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                    {filteredTimezones.map((tz) => (
                      <button
                        key={tz.name}
                        type="button"
                        onClick={() => {
                          setSelectedTimezone(tz);
                          setIsTimezoneDropdownOpen(false);
                          setTimezoneSearchQuery('');
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border last:border-b-0 ${
                          selectedTimezone.name === tz.name ? 'bg-primary/10' : ''
                        }`}
                      >
                        <div className={selectedTimezone.name === tz.name ? 'text-primary' : 'text-foreground'} style={{ fontWeight: selectedTimezone.name === tz.name ? 'var(--font-weight-semibold)' : 'normal' }}>
                          {tz.label}
                        </div>
                        <div className="text-muted mt-0.5" style={{ fontSize: 'var(--text-sm)' }}>{tz.offset}</div>
                      </button>
                    ))}
                    {filteredTimezones.length === 0 && (
                      <div className="px-4 py-6 text-muted text-center" style={{ fontSize: 'var(--text-sm)' }}>
                        No timezones found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Participants */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <label className="text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                  <Users size={16} className="inline-block mr-2 mb-0.5" />
                  Participants {selectedParticipants.length > 0 && (
                    <span className="text-primary ml-1">({selectedParticipants.length})</span>
                  )}
                </label>
                <div className="bg-card border border-border focus-within:border-primary rounded-[var(--radius)] w-full sm:w-[240px] flex items-center gap-2 px-3 py-2 transition-colors">
                  <IconSearch />
                  <input
                    type="text"
                    placeholder="Search participants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted"
                    style={{ fontSize: 'var(--text-sm)' }}
                  />
                </div>
              </div>

              <div className="border border-border rounded-[var(--radius)] overflow-hidden max-h-[280px] overflow-y-auto custom-scrollbar bg-card">
                {/* Invited Participants */}
                {filteredPeople.filter(p => selectedParticipants.includes(p.id)).map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-secondary/30 transition-colors"
                  >
                    <MemberAvatar
                      name={person.name}
                      id={person.id}
                      initials={person.initial}
                      color={person.color}
                      size="xl"
                      border
                      showTooltip={false}
                      showProfileOnClick={false}
                    />
                    <div className="flex-1 text-foreground">
                      {person.name}
                    </div>
                    <button
                      onClick={() => toggleParticipant(person.id)}
                      className="px-4 py-2 rounded-[var(--radius)] transition-all bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                      style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {/* Divider - only show if there are invited participants and non-invited participants */}
                {filteredPeople.filter(p => selectedParticipants.includes(p.id)).length > 0 && 
                 filteredPeople.filter(p => !selectedParticipants.includes(p.id)).length > 0 && (
                  <div className="flex items-center gap-3 px-4 py-2 bg-secondary/20 border-b border-border">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-muted text-xs uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                      Not Invited
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}

                {/* Non-Invited Participants */}
                {filteredPeople.filter(p => !selectedParticipants.includes(p.id)).slice(0, 12).map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors"
                  >
                    <MemberAvatar
                      name={person.name}
                      id={person.id}
                      initials={person.initial}
                      color={person.color}
                      size="xl"
                      border
                      showTooltip={false}
                      showProfileOnClick={false}
                    />
                    <div className="flex-1 text-foreground">
                      {person.name}
                    </div>
                    <button
                      onClick={() => toggleParticipant(person.id)}
                      className="px-4 py-2 rounded-[var(--radius)] transition-all bg-primary text-primary-foreground hover:opacity-90"
                      style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 justify-end px-6 py-4 border-t border-border shrink-0 bg-secondary/20">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-border bg-card text-foreground rounded-[var(--radius)] hover:bg-secondary transition-colors"
            style={{ fontWeight: 'var(--font-weight-semibold)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-[var(--radius)] hover:opacity-90 transition-opacity"
            style={{ fontWeight: 'var(--font-weight-semibold)' }}
          >
            {editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
          </button>
        </div>
      </div>
    </div>
  );
}
