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
  subWorkspace?: string;
}

export interface Meeting {
  id?: string;
  title: string;
  participants: Person[];
  scheduledTime: Date;
  duration: number;
  hostId?: string;
  requireAdmission?: boolean;
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
  const [isParticipantDropdownOpen, setIsParticipantDropdownOpen] = useState(false);
  const [externalEmails, setExternalEmails] = useState<Person[]>([]);
  const [meetingPassword, setMeetingPassword] = useState('');
  const [requireAdmission, setRequireAdmission] = useState(false);
  const participantSearchRef = useRef<HTMLDivElement>(null);
  const participantInputRef = useRef<HTMLInputElement>(null);
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
      // Restore external email participants
      const externals = editingMeeting.participants.filter(p => p.role === 'External');
      setExternalEmails(externals);

      setRequireAdmission(editingMeeting.requireAdmission || false);
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

  // Close participant dropdown when clicking outside
  useClickOutside(participantSearchRef, () => {
    setIsParticipantDropdownOpen(false);
  });

  if (!isOpen) return null;

  const allPeople = [...people, ...externalEmails];

  const filteredPeople = searchQuery.trim()
    ? people.filter(person =>
        !selectedParticipants.includes(person.id) &&
        (person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (person.id.includes('@') && person.id.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    : [];

  const isValidEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  const searchIsEmail = isValidEmail(searchQuery);
  const emailAlreadyInWorkspace = searchIsEmail && people.some(p => p.id.toLowerCase() === searchQuery.trim().toLowerCase() || p.name.toLowerCase() === searchQuery.trim().toLowerCase());
  const emailAlreadyAdded = searchIsEmail && selectedParticipants.some(id => id.toLowerCase() === searchQuery.trim().toLowerCase());
  const showInviteExternal = searchIsEmail && !emailAlreadyInWorkspace && !emailAlreadyAdded;

  const getEmailInitials = (email: string) => {
    const local = email.split('@')[0];
    return local.substring(0, 2).toUpperCase();
  };

  const addExternalEmail = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    const person: Person = {
      id: trimmed,
      name: trimmed,
      initial: getEmailInitials(trimmed),
      color: '#868D9E',
      role: 'External',
    };
    setExternalEmails(prev => [...prev, person]);
    setSelectedParticipants(prev => [...prev, trimmed]);
    setSearchQuery('');
    setIsParticipantDropdownOpen(false);
  };

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
    
    const participants = allPeople.filter(p => selectedParticipants.includes(p.id));
    
    const meetingData = {
      title,
      participants,
      scheduledTime,
      duration: 30,
      requireAdmission,
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
    setExternalEmails([]);
    setMeetingPassword('');
    setRequireAdmission(false);
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
        className="bg-card rounded-2xl w-full max-w-[680px] max-h-[calc(100vh-32px)] flex flex-col border border-border"
        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar size={18} className="text-primary" />
            </div>
            <h2 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-bold)' }}>
              {editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted hover:text-foreground"
          >
            <X size={18} />
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
                className="w-full bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-lg px-4 py-3 text-foreground outline-none transition-all hover:border-primary/30"
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
                  <div className="flex items-center gap-2 px-3 py-2 bg-secondary/30 rounded-lg">
                    <Calendar size={14} className="text-muted" />
                    <span className="text-muted" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      Start
                    </span>
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-card border border-border focus:border-primary rounded-lg px-4 py-3 text-foreground outline-none transition-colors hover:border-primary/50"
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-card border border-border focus:border-primary rounded-lg px-4 py-3 text-foreground outline-none transition-colors hover:border-primary/50"
                  />
                </div>

                {/* End Date/Time */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-secondary/30 rounded-lg">
                    <Clock size={14} className="text-muted" />
                    <span className="text-muted" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      End
                    </span>
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-card border border-border focus:border-primary rounded-lg px-4 py-3 text-foreground outline-none transition-colors hover:border-primary/50"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-card border border-border focus:border-primary rounded-lg px-4 py-3 text-foreground outline-none transition-colors hover:border-primary/50"
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
                className="w-full bg-card border border-border hover:border-primary/50 focus:border-primary rounded-lg px-4 py-3 text-foreground text-left flex items-center gap-3 outline-none transition-colors"
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
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg overflow-hidden z-50 max-w-[calc(100vw-32px)]"
                  style={{ boxShadow: 'var(--elevation-md)' }}
                >
                  <div className="p-3 border-b border-border bg-secondary/20">
                    <div className="bg-card border border-border focus-within:border-primary rounded-lg flex items-center gap-2 px-3 py-2 transition-colors">
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
              <label className="block text-foreground mb-2.5" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                <Users size={16} className="inline-block mr-2 mb-0.5" />
                Participants {selectedParticipants.length > 0 && (
                  <span className="text-primary ml-1">({selectedParticipants.length})</span>
                )}
              </label>

              {/* Selected participants chips */}
              {selectedParticipants.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedParticipants.map(id => {
                    const person = allPeople.find(p => p.id === id);
                    if (!person) return null;
                    const isExternal = externalEmails.some(e => e.id === id);
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-2 pl-1 pr-2 py-1 bg-secondary/50 border border-border rounded-full"
                      >
                        <MemberAvatar
                          name={person.name}
                          id={person.id}
                          initials={person.initial}
                          color={person.color}
                          size="sm"
                          border={false}
                          showTooltip={false}
                          showProfileOnClick={false}
                        />
                        <span className="text-foreground max-w-[160px] truncate" style={{ fontSize: 'var(--text-sm)' }}>
                          {person.name}
                        </span>
                        {isExternal && (
                          <span className="text-muted" style={{ fontSize: '10px' }}>ext</span>
                        )}
                        <button
                          onClick={() => {
                            toggleParticipant(id);
                            if (isExternal) setExternalEmails(prev => prev.filter(e => e.id !== id));
                          }}
                          className="ml-0.5 p-0.5 rounded-full hover:bg-destructive/15 text-muted hover:text-destructive transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Search input with dropdown */}
              <div className="relative" ref={participantSearchRef}>
                <div className="bg-card border border-border focus-within:border-primary rounded-lg flex items-center gap-2 px-4 py-3 transition-colors">
                  <IconSearch />
                  <input
                    ref={participantInputRef}
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsParticipantDropdownOpen(e.target.value.trim().length > 0);
                    }}
                    onFocus={() => {
                      if (searchQuery.trim().length > 0) setIsParticipantDropdownOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && showInviteExternal) {
                        e.preventDefault();
                        addExternalEmail(searchQuery);
                      }
                    }}
                    className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted"
                  />
                </div>

                {/* Dropdown results */}
                {isParticipantDropdownOpen && (searchQuery.trim().length > 0) && (
                  <div
                    className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg overflow-hidden z-50"
                    style={{ boxShadow: 'var(--elevation-md)' }}
                  >
                    <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                      {/* Workspace matches */}
                      {filteredPeople.length > 0 && (
                        <div className="px-3 pt-2 pb-1">
                          <span className="text-muted uppercase tracking-wide" style={{ fontSize: '10px', fontWeight: 'var(--font-weight-semibold)' }}>
                            Workspace Members
                          </span>
                        </div>
                      )}
                      {filteredPeople.slice(0, 8).map((person) => (
                        <button
                          key={person.id}
                          type="button"
                          onClick={() => {
                            toggleParticipant(person.id);
                            setSearchQuery('');
                            setIsParticipantDropdownOpen(false);
                            participantInputRef.current?.focus();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors text-left"
                        >
                          <MemberAvatar
                            name={person.name}
                            id={person.id}
                            initials={person.initial}
                            color={person.color}
                            size="lg"
                            border
                            showTooltip={false}
                            showProfileOnClick={false}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-foreground truncate">{person.name}</div>
                            {person.role && (
                              <div className="text-muted truncate" style={{ fontSize: 'var(--text-sm)' }}>{person.role}</div>
                            )}
                          </div>
                        </button>
                      ))}

                      {/* No workspace results */}
                      {filteredPeople.length === 0 && !showInviteExternal && (
                        <div className="px-4 py-4 text-muted text-center" style={{ fontSize: 'var(--text-sm)' }}>
                          No matching workspace members
                        </div>
                      )}

                      {/* Invite external email option */}
                      {showInviteExternal && (
                        <>
                          {filteredPeople.length > 0 && <div className="border-t border-border" />}
                          <button
                            type="button"
                            onClick={() => addExternalEmail(searchQuery)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left"
                          >
                            <div
                              className="size-8 rounded-full flex items-center justify-center border border-dashed border-primary/40"
                              style={{ background: 'var(--primary-alpha-10, rgba(47,128,237,0.1))' }}
                            >
                              <svg className="size-4 text-primary" fill="none" viewBox="0 0 16 16">
                                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-primary" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                                Invite "{searchQuery.trim()}"
                              </div>
                              <div className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                                Send meeting invite to external email
                              </div>
                            </div>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                Type a name to find workspace members, or enter an email to invite externally.
              </div>
            </div>

            {/* Meeting Password */}
            <div>
              <label className="block text-foreground mb-2.5" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                Password <span className="text-muted" style={{ fontWeight: 'var(--font-weight-normal)', fontSize: 'var(--text-sm)' }}>(optional)</span>
              </label>
              <input
                type="text"
                value={meetingPassword}
                onChange={(e) => setMeetingPassword(e.target.value)}
                className="w-full bg-card border border-border focus:border-primary rounded-lg px-4 py-3 text-foreground outline-none transition-colors hover:border-primary/50"
                placeholder="Set a password for participants to join"
              />
              <div className="mt-2 text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                Participants will need this password to join the meeting.
              </div>
            </div>

            {/* Require Admission */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={requireAdmission}
                  onChange={(e) => setRequireAdmission(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer accent-[#2F80ED]"
                />
                <div>
                  <span className="text-foreground group-hover:text-primary transition-colors" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                    Require admission
                  </span>
                  <p className="text-muted mt-1" style={{ fontSize: 'var(--text-sm)' }}>
                    Participants must be admitted by the host before joining the call. They will wait in a waiting room until approved.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 justify-end px-6 py-4 border-t border-border/60 shrink-0 bg-secondary/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-border bg-card text-foreground rounded-lg hover:bg-secondary hover:border-border/80 transition-all"
            style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all flex items-center gap-2"
            style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)' }}
          >
            <Calendar size={14} />
            {editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
          </button>
        </div>
      </div>
    </div>
  );
}
