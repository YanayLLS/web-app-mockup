import { Search, Phone, Video, MessageSquare, Plus, ChevronDown, Users, PhoneCall, Calendar, MoreVertical, Clock, X, Copy, Check } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { AppCallDeviceModal } from './AppCallDevicePage';
import { AppMeetingJoinModal } from './AppMeetingJoinPage';
import { AppScheduleMeetingModal } from './AppScheduleMeetingPage';
import { getUrlParam, setUrlParam } from '../../../utils/urlParams';
import { useRole, hasAccess } from '../../../contexts/RoleContext';
import { MemberAvatar } from '../../MemberAvatar';

const contacts = [
  { id: '1', name: 'Luy Robin', role: 'Field Engineer', initials: 'LR', online: true, color: '#2F80ED' },
  { id: '2', name: 'David Amrosa', role: 'Service Support Expert', initials: 'DA', online: true, color: '#2F80ED' },
  { id: '3', name: 'Nika Jerrardo', role: 'Instructor', initials: 'NJ', online: false, color: '#11E874' },
  { id: '4', name: 'Jared Sunn', role: 'Operator', initials: 'JS', online: true, color: '#FF6B35' },
  { id: '5', name: 'Sarah Chen', role: 'Admin', initials: 'SC', online: false, color: '#E91E63' },
  { id: '6', name: 'Marcus Williams', role: 'Field Engineer', initials: 'MW', online: true, color: '#00BCD4' },
  { id: '7', name: 'Elena Rodriguez', role: 'Support Manager', initials: 'ER', online: false, color: '#FF9800' },
  { id: '8', name: 'Tom Anderson', role: 'Operator', initials: 'TA', online: true, color: '#9C27B0' },
  { id: '9', name: 'Lisa Park', role: 'Content Creator', initials: 'LP', online: false, color: '#4CAF50' },
  { id: '10', name: 'James Kim', role: 'Service Support Expert', initials: 'JK', online: true, color: '#F44336' },
];

interface Meeting {
  id: string;
  title: string;
  time: string;
  date: string;
  participants: string[];
  status: 'upcoming' | 'past';
}

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const shortTz = new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || '';

const mockMeetings: Meeting[] = [
  { id: 'm1', title: 'Maintenance Review', time: '10:00 AM', date: 'Today', participants: ['LR', 'DA'], status: 'upcoming' },
  { id: 'm2', title: 'Field Support Briefing', time: '2:30 PM', date: 'Today', participants: ['NJ', 'JS', 'SC'], status: 'upcoming' },
  { id: 'm3', title: 'Equipment Troubleshooting', time: '9:00 AM', date: 'Tomorrow', participants: ['MW', 'TA'], status: 'upcoming' },
];

const mockRecentCalls = [
  { id: 'r1', title: 'Quick Support Call', time: '4:15 PM', date: 'Yesterday', duration: '12 min', participants: ['LR'] },
  { id: 'r2', title: 'Team Standup', time: '9:00 AM', date: 'Yesterday', duration: '25 min', participants: ['DA', 'NJ', 'JS'] },
  { id: 'r3', title: 'Device Diagnostics', time: '3:30 PM', date: '2 days ago', duration: '8 min', participants: ['MW'] },
];

const mobileActions = [
  { id: 'start', label: 'Start meeting', icon: Video, color: '#2F80ED', action: 'start' },
  { id: 'join', label: 'Join meeting', icon: Users, color: '#2F80ED', action: 'join' },
  { id: 'call', label: 'Call device', icon: Phone, color: '#2F80ED', action: 'call-device' },
  { id: 'schedule', label: 'Schedule meeting', icon: Calendar, color: '#2F80ED', action: 'schedule' },
];

export function AppRemoteSupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'agenda' | 'recent'>('agenda');
  const [showNewSessionMenu, setShowNewSessionMenu] = useState(false);
  const [showCallDeviceModal, setShowCallDeviceModal] = useState(false);
  const [showJoinMeetingModal, setShowJoinMeetingModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { currentRole } = useRole();
  const canScheduleMeeting = hasAccess(currentRole, 'schedule-meeting');
  const canStartCall = hasAccess(currentRole, 'start-call');

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const openCallDevice = (open: boolean) => { setShowCallDeviceModal(open); setUrlParam('calldevice', open ? '1' : null); };
  const openJoinMeeting = (open: boolean) => { setShowJoinMeetingModal(open); setUrlParam('joinmeeting', open ? '1' : null); };
  const openSchedule = (open: boolean) => { setShowScheduleModal(open); setUrlParam('schedule', open ? '1' : null); };

  useEffect(() => {
    if (getUrlParam('calldevice') === '1') setShowCallDeviceModal(true);
    if (getUrlParam('joinmeeting') === '1') setShowJoinMeetingModal(true);
    if (getUrlParam('schedule') === '1') setShowScheduleModal(true);
  }, []);

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyMeetingId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      showToast('Meeting ID copied to clipboard');
    }).catch(() => {
      showToast('Failed to copy meeting ID');
    });
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartMeeting = () => {
    setShowNewSessionMenu(false);
    // In a real app this would start a video call
    showToast('Starting instant meeting...');
  };


  return (
    <div className="h-full flex flex-col">
      {/* ===== MOBILE VIEW (below lg): 4 action buttons ===== */}
      <div className="lg:hidden flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="p-4 sm:p-6 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-primary" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-bold)' }}>
                Remote Support
              </h2>
              <p className="text-sm text-muted mt-0.5">
                Connect, troubleshoot, and collaborate remotely.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: '10px' }}>
                My Device ID
              </span>
              <p className="text-foreground mt-0.5" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: '14px', letterSpacing: '2px' }}>
                902 950 988
              </p>
            </div>
          </div>
        </div>

        {/* 4 action buttons grid */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="grid grid-cols-2 gap-6 max-w-xs w-full mb-8">
            {mobileActions
              .filter((action) => {
                if (action.id === 'start' || action.id === 'call') return canStartCall;
                if (action.id === 'schedule') return canScheduleMeeting;
                return true; // 'join' is always visible
              })
              .map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    if (action.action === 'start') handleStartMeeting();
                    else if (action.action === 'join') openJoinMeeting(true);
                    else if (action.action === 'call-device') openCallDevice(true);
                    else if (action.action === 'schedule') openSchedule(true);
                  }}
                  className="flex flex-col items-center gap-3"
                >
                  <div
                    className="size-20 rounded-full flex items-center justify-center text-white shadow-elevation-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: action.color }}
                  >
                    <Icon className="size-8" />
                  </div>
                  <span className="text-sm text-foreground text-center" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP VIEW (lg+): meetings + contact actions ===== */}
      <div className="hidden lg:flex flex-col h-full">
        {/* Header with tabs and actions */}
        <div className="bg-card border-b border-border shrink-0">
          <div className="flex items-center justify-between px-6" style={{ height: '56px' }}>
            {/* Tabs */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab('agenda')}
                className={`flex items-center gap-2 pb-0.5 border-b-2 transition-colors ${
                  activeTab === 'agenda' ? 'border-primary text-foreground' : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <Calendar className="size-4" />
                <span style={{ fontSize: '14px', fontWeight: activeTab === 'agenda' ? 'var(--font-weight-bold)' : 'normal' }}>
                  Agenda
                </span>
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`flex items-center gap-2 pb-0.5 border-b-2 transition-colors ${
                  activeTab === 'recent' ? 'border-primary text-foreground' : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <Clock className="size-4" />
                <span style={{ fontSize: '14px', fontWeight: activeTab === 'recent' ? 'var(--font-weight-bold)' : 'normal' }}>
                  Recent Calls
                </span>
              </button>
            </div>

            {/* Device ID + Action buttons */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/60 rounded-lg">
                <span className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-medium)' }}>My Device ID</span>
                <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)', letterSpacing: '1.5px' }}>902 950 988</span>
              </div>
              <div className="w-px h-6 bg-border" />
              {canStartCall && (
                <button
                  onClick={() => openCallDevice(true)}
                  className="px-3 py-2 bg-card border border-border text-foreground rounded-[var(--radius)] hover:bg-secondary transition-colors flex items-center gap-2 text-sm"
                  style={{ fontWeight: 'var(--font-weight-bold)' }}
                >
                  <Phone className="size-3.5" />
                  Call Device
                </button>
              )}
              <button
                onClick={() => openJoinMeeting(true)}
                className="px-3 py-2 bg-card border border-border text-foreground rounded-[var(--radius)] hover:bg-secondary transition-colors flex items-center gap-2 text-sm"
                style={{ fontWeight: 'var(--font-weight-bold)' }}
              >
                <Video className="size-3.5" />
                Join Meeting
              </button>
              {canStartCall && (
                <div className="relative">
                  <button
                    onClick={() => setShowNewSessionMenu(!showNewSessionMenu)}
                    className="px-3 py-2 bg-primary text-white rounded-[var(--radius)] hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
                    style={{ fontWeight: 'var(--font-weight-bold)' }}
                  >
                    <Plus className="size-3.5" />
                    Create Meeting
                  </button>
                  {showNewSessionMenu && (
                    <div className="absolute top-full mt-2 right-0 w-56 bg-card rounded-[var(--radius)] shadow-elevation-lg border border-border z-10 py-1">
                      <button
                        onClick={handleStartMeeting}
                        className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-secondary flex items-center gap-2"
                      >
                        <PhoneCall className="size-4" /> Start instant meeting
                      </button>
                      {canScheduleMeeting && (
                        <button
                          onClick={() => { openSchedule(true); setShowNewSessionMenu(false); }}
                          className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-secondary flex items-center gap-2"
                        >
                          <Calendar className="size-4" /> Schedule for later
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'agenda' ? (
            /* ---- AGENDA TAB ---- */
            <div className="p-6">
              {mockMeetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted">
                  <Calendar className="size-12 mb-4 opacity-30" />
                  <p className="text-sm">No upcoming meetings</p>
                  <button
                    onClick={() => openSchedule(true)}
                    className="mt-3 text-sm text-primary hover:underline"
                  >
                    Schedule a meeting
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {mockMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="bg-card rounded-[var(--radius)] border border-border p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
                            {meeting.title}
                          </h4>
                          <p style={{ fontSize: '12px', color: '#7F7F7F', marginTop: '2px' }}>
                            {meeting.date} at {meeting.time} {shortTz}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyMeetingId(meeting.id)}
                            className="p-2 text-muted hover:text-foreground hover:bg-secondary rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            title="Copy meeting ID"
                            aria-label="Copy meeting ID"
                          >
                            {copiedId === meeting.id ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
                          </button>
                          <button
                            className="px-3 py-1.5 bg-primary text-white rounded-[var(--radius-button)] hover:opacity-90 transition-opacity text-xs"
                            style={{ fontWeight: 'var(--font-weight-bold)' }}
                          >
                            Join
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {meeting.participants.map((p, i) => (
                          <MemberAvatar
                            key={i}
                            name={contacts[i % contacts.length]?.name || p}
                            initials={p}
                            color={contacts[i % contacts.length]?.color || '#2F80ED'}
                            size="sm"
                            border={i > 0}
                            className={i > 0 ? '-ml-1' : ''}
                            showTooltip={false}
                          />
                        ))}
                        <span style={{ fontSize: '11px', color: '#7F7F7F', marginLeft: '6px' }}>
                          {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ---- RECENT CALLS TAB ---- */
            <div className="p-6">
              {mockRecentCalls.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted">
                  <Clock className="size-12 mb-4 opacity-30" />
                  <p className="text-sm">No recent calls</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mockRecentCalls.map((call) => (
                    <div
                      key={call.id}
                      className="bg-card rounded-[var(--radius)] border border-border p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
                            {call.title}
                          </h4>
                          <p style={{ fontSize: '12px', color: '#7F7F7F', marginTop: '2px' }}>
                            {call.date} at {call.time} · {call.duration}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {call.participants.map((p, i) => (
                            <MemberAvatar
                              key={i}
                              name={contacts[i % contacts.length]?.name || p}
                              initials={p}
                              color={contacts[i % contacts.length]?.color || '#2F80ED'}
                              size="sm"
                              border={i > 0}
                              className={i > 0 ? '-ml-1' : ''}
                              showTooltip={false}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== TOAST ===== */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[#36415D] text-white rounded-lg shadow-elevation-lg flex items-center gap-2"
          style={{ fontSize: '13px', fontWeight: 'var(--font-weight-medium)', animation: 'toast-in 0.2s ease-out' }}
        >
          <Check className="size-4 shrink-0" />
          {toast}
        </div>
      )}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      {/* ===== MODALS ===== */}
      <AppCallDeviceModal isOpen={showCallDeviceModal} onClose={() => openCallDevice(false)} />
      <AppMeetingJoinModal isOpen={showJoinMeetingModal} onClose={() => openJoinMeeting(false)} />
      <AppScheduleMeetingModal isOpen={showScheduleModal} onClose={() => openSchedule(false)} />
    </div>
  );
}
