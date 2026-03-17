import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useIsMobile } from '../ui/use-mobile';
import svgPaths from '../../../imports/svg-zo2c6wenwl';
import scheduleSvgPaths from '../../../imports/svg-nmgvwn4834';
import menuSvgPaths from '../../../imports/svg-h2pvef5mth';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import { ScheduleMeetingModal, type Person, type Meeting } from '../ScheduleMeetingModal';
import { Paperclip, FileText, Folder, Phone, Video, Calendar, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { useActiveCall } from '../../contexts/ActiveCallContext';
import { getUrlParam, setUrlParam } from '../../utils/urlParams';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useRole, hasAccess } from '../../contexts/RoleContext';
import { MemberAvatar } from '../MemberAvatar';
import { useAppPopup } from '../../contexts/AppPopupContext';

function IconPeopleList() {
  return (
    <svg className="block size-4" fill="none" viewBox="0 0 16 16">
      <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M2 14c0-2.5 2.5-4 6-4s6 1.5 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconMultipleUsers() {
  return (
    <svg className="block size-4" fill="none" preserveAspectRatio="none" viewBox="0 0 16 8">
      <path d={svgPaths.p369d3080} fill="currentColor" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg className="block size-4" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
      <path d={svgPaths.p2280f500} fill="currentColor" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg className="block size-4" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
      <path d={svgPaths.p11f76e40} fill="currentColor" />
    </svg>
  );
}

function IconVideo() {
  return (
    <svg className="block size-5" fill="none" viewBox="0 0 20 20">
      <path d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M14 8l4-2v8l-4-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconMicrophone() {
  return (
    <svg className="block size-5" fill="none" viewBox="0 0 20 20">
      <rect x="7" y="2" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M4 10a6 6 0 0012 0M10 16v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IconMicrophoneOff() {
  return (
    <svg className="block size-5" fill="none" viewBox="0 0 20 20">
      <rect x="7" y="2" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M4 10a6 6 0 0012 0M10 16v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="3" y1="3" x2="17" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IconVideoOff() {
  return (
    <svg className="block size-5" fill="none" viewBox="0 0 20 20">
      <path d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M14 8l4-2v8l-4-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="3" y1="3" x2="17" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IconScreenShare() {
  return (
    <svg className="block size-5" fill="none" viewBox="0 0 20 20">
      <rect x="2" y="2" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M6 16l4-3 4 3M10 13v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 7l3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function IconPhone() {
  return (
    <svg className="block size-4" fill="none" viewBox="0 0 16 16">
      <path d="M14 10.5v2a1.5 1.5 0 01-1.64 1.5A13.5 13.5 0 012 3.64 1.5 1.5 0 013.5 2h2a1.5 1.5 0 011.5 1.29c.1.74.28 1.46.54 2.15a1.5 1.5 0 01-.34 1.58l-.85.84a12 12 0 005.29 5.29l.84-.85a1.5 1.5 0 011.58-.34c.69.26 1.41.44 2.15.54A1.5 1.5 0 0114 10.5z" fill="currentColor"/>
    </svg>
  );
}

function IconClose() {
  return (
    <svg className="block size-5" fill="none" viewBox="0 0 20 20">
      <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IconMore() {
  return (
    <svg className="block size-5" fill="none" viewBox="0 0 20 20">
      <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
      <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
      <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
    </svg>
  );
}

function IconMoreHorizontal() {
  return (
    <svg className="block size-4" fill="none" viewBox="0 0 16 16">
      <circle cx="3" cy="8" r="1.5" fill="currentColor"/>
      <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
      <circle cx="13" cy="8" r="1.5" fill="currentColor"/>
    </svg>
  );
}

function IconInvite() {
  return (
    <svg className="block size-5" fill="none" viewBox="0 0 20 20">
      <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );
}

function IconPeople() {
  return (
    <svg className="block size-5" fill="none" viewBox="0 0 20 20">
      <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M1 17c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="14" cy="6" r="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M15 12c2 0 4 1.5 4 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IconChat() {
  return (
    <svg className="block size-5" fill="none" viewBox="0 0 20 20">
      <rect x="2" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M6 8h8M6 11h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IconCaptions() {
  return (
    <svg className="block size-5" fill="none" viewBox="0 0 20 20">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M5 10c0-1 .5-1.5 1.5-1.5S8 9 8 10s-.5 1.5-1.5 1.5S5 11 5 10zM12 10c0-1 .5-1.5 1.5-1.5S15 9 15 10s-.5 1.5-1.5 1.5S12 11 12 10z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function IconSend() {
  return (
    <svg className="block size-4" fill="none" viewBox="0 0 20 20">
      <path d="M3 10l14-7-7 14-2-7-5-0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconSpotlight() {
  return (
    <svg className="block size-4" fill="none" viewBox="0 0 16 16">
      <path d="M8 1v2M8 13v2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M1 8h2M13 8h2M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

function IconUnspotlight() {
  return (
    <svg className="block size-4" fill="none" viewBox="0 0 16 16">
      <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

function IconPencil() {
  return (
    <svg className="block size-4" fill="none" viewBox="0 0 16 16">
      <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8zM10 4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconUndo() {
  return (
    <svg className="block size-4" fill="none" viewBox="0 0 16 16">
      <path d="M3 7h8a3 3 0 0 1 0 6H8M3 7l3-3M3 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconTrash() {
  return (
    <svg className="block size-4" fill="none" viewBox="0 0 16 16">
      <path d="M2 4h12M5.5 4V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1M13 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconPlay() {
  return (
    <svg className="block size-4" fill="none" viewBox="0 0 16 16">
      <path d="M4 2l10 6-10 6V2z" fill="currentColor"/>
    </svg>
  );
}

// Person and Meeting interfaces are now imported from ScheduleMeetingModal

interface MediaDevice {
  deviceId: string;
  label: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  senderInitial: string;
  senderColor: string;
  text: string;
  timestamp: Date;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    projectName: string;
  }>;
}

interface CallParticipant {
  id: string;
  name: string;
  initial: string;
  color: string;
  status: 'calling' | 'connected' | 'available';
  videoUrl?: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  mutedByHost?: boolean;
  spotlightedForEveryone?: boolean;
}

interface RecentCall {
  id: string;
  title: string;
  participants: Person[];
  timestamp: Date;
  duration: number;
  type: 'completed' | 'missed' | 'cancelled';
}

const people: Person[] = [
  { id: '1', name: 'Pablo Picasso', initial: 'P', color: '#71a2ed' },
  { id: '2', name: 'Quentin Tarantino', initial: 'Q', color: '#71a2ed', subWorkspace: 'Design Team' },
  { id: '3', name: 'Rosalind Franklin', initial: 'R', color: '#71a2ed' },
  { id: '4', name: 'Simone de Beauvoir', initial: 'S', color: '#71a2ed' },
  { id: '5', name: 'Toni Morrison', initial: 'T', color: '#71a2ed', subWorkspace: 'Engineering' },
  { id: '6', name: 'Ursula K. Le Guin', initial: 'U', color: '#71a2ed' },
  { id: '7', name: 'Vincent van Gogh', initial: 'V', color: '#71a2ed' },
  { id: '8', name: 'William Shakespeare', initial: 'W', color: '#71a2ed', subWorkspace: 'Marketing' },
  { id: '9', name: 'Xenophon', initial: 'X', color: '#71a2ed' },
  { id: '10', name: 'Yoko Ono', initial: 'Y', color: '#71a2ed' },
  { id: '11', name: 'Zora Neale Hurston', initial: 'Z', color: '#71a2ed', subWorkspace: 'Design Team' },
  { id: '12', name: 'Albert Einstein', initial: 'A', color: '#71a2ed' },
  { id: '13', name: 'Bob Dylan', initial: 'B', color: '#71a2ed' },
  { id: '14', name: 'Cleopatra', initial: 'C', color: '#71a2ed', subWorkspace: 'Product' },
  { id: '15', name: 'Dolly Parton', initial: 'D', color: '#71a2ed' },
];

interface CreateMeetingMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleForLater: () => void;
  onStartNow: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
  meetingTitle: string;
  onMeetingTitleChange: (title: string) => void;
  canScheduleMeeting?: boolean;
  canStartCall?: boolean;
}

function CreateMeetingMenu({ isOpen, onClose, onScheduleForLater, onStartNow, buttonRef, meetingTitle, onMeetingTitleChange, canScheduleMeeting = true, canStartCall = true }: CreateMeetingMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside([menuRef, buttonRef], onClose, isOpen);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 z-50 bg-card rounded-[var(--radius)] border border-border overflow-hidden flex flex-col"
      style={{
        top: 'calc(100% + 8px)',
        boxShadow: 'var(--elevation-lg)',
        width: '420px',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 32px)',
        fontFamily: 'var(--font-family)',
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-5 py-4 border-b border-border"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-[var(--radius)] flex items-center justify-center"
            style={{ backgroundColor: 'var(--primary)/10' }}
          >
            <Video size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <h4 
            className="text-foreground"
            style={{ 
              fontWeight: 'var(--font-weight-bold)',
              fontSize: 'var(--text-h3)',
              fontFamily: 'var(--font-family)',
            }}
          >
            Create Meeting
          </h4>
        </div>
        <button 
          onClick={onClose} 
          className="w-8 h-8 flex items-center justify-center hover:bg-secondary rounded-[var(--radius)] transition-colors"
          aria-label="Close"
        >
          <svg className="block size-[10px]" fill="none" preserveAspectRatio="none" viewBox="0 0 8.4 8.4">
            <path d={menuSvgPaths.pf2fa500} fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-5 py-5 overflow-y-auto custom-scrollbar flex-1">
        {/* Meeting Title Input */}
        <div className="mb-5">
          <label 
            className="block mb-2 text-foreground"
            style={{ 
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              fontFamily: 'var(--font-family)',
            }}
          >
            Meeting Title
          </label>
          <input
            type="text"
            placeholder="Meeting with Host Name"
            value={meetingTitle}
            onChange={(e) => onMeetingTitleChange(e.target.value)}
            className="w-full bg-input-background border border-border rounded-[var(--radius)] px-3 py-2.5 text-foreground outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            style={{ 
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family)',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Schedule for Later Button */}
          {canScheduleMeeting && (
          <button
            onClick={onScheduleForLater}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-secondary hover:bg-secondary/80 rounded-[var(--radius)] transition-colors group"
          >
            <div
              className="w-10 h-10 flex items-center justify-center rounded-[var(--radius)] bg-card border border-border group-hover:border-primary/30 transition-colors"
            >
              <Calendar size={18} style={{ color: 'var(--foreground)' }} />
            </div>
            <div className="flex-1 text-left">
              <div
                className="text-foreground"
                style={{
                  fontWeight: 'var(--font-weight-semibold)',
                  fontSize: 'var(--text-base)',
                  fontFamily: 'var(--font-family)',
                }}
              >
                Schedule for Later
              </div>
              <div
                className="text-muted"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)',
                }}
              >
                Pick a date and time to schedule
              </div>
            </div>
          </button>
          )}

          {/* Start Now Button */}
          {canStartCall && (
          <button
            onClick={onStartNow}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius)] hover:opacity-90 transition-opacity group"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <div
              className="w-10 h-10 flex items-center justify-center rounded-[var(--radius)]"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Video size={18} style={{ color: 'var(--primary-foreground)' }} />
            </div>
            <div className="flex-1 text-left">
              <div
                style={{
                  fontWeight: 'var(--font-weight-semibold)',
                  fontSize: 'var(--text-base)',
                  fontFamily: 'var(--font-family)',
                  color: 'var(--primary-foreground)',
                }}
              >
                Start Meeting Now
              </div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)',
                  color: 'var(--primary-foreground)',
                  opacity: 0.8,
                }}
              >
                Begin instantly with current settings
              </div>
            </div>
          </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ScheduleMeetingModal is now imported from ../ScheduleMeetingModal

// ScheduleMeetingModal is now imported from ../ScheduleMeetingModal

interface PreJoinMeetingProps {
  meeting: Meeting;
  onJoin: () => void;
  onCancel: () => void;
}

function PreJoinMeeting({ meeting, onJoin, onCancel }: PreJoinMeetingProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startVideo = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionError(false);
    } catch (err: any) {
      setPermissionError(true);
      // Silently handle - user can still join without camera/mic
    }
  };

  useEffect(() => {
    startVideo();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
  };

  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit' 
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="h-[72px] bg-card border-b border-border flex items-center justify-between px-3 md:px-6 shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <div className="p-2 bg-primary/10 rounded-[var(--radius)] shrink-0">
            <IconVideo />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-foreground text-sm md:text-base truncate" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {meeting.title}
            </h2>
            <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-muted">
              <span className="truncate">{formatDate(meeting.scheduledTime)} at {formatTime(meeting.scheduledTime)}</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">{meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-secondary rounded-[var(--radius)] transition-colors shrink-0"
          title="Cancel"
        >
          <svg className="block size-5" fill="none" viewBox="0 0 20 20">
            <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-3 md:p-8 bg-secondary/20">
        <div className="w-full max-w-[720px] flex flex-col gap-3 md:gap-6">
          <div className="relative w-full aspect-video bg-[#1a1625] rounded-[var(--radius)] overflow-hidden border border-border">
            {permissionError ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="size-16 rounded-full bg-destructive/20 flex items-center justify-center text-destructive mx-auto mb-4">
                    <svg className="block size-8" fill="none" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                    </svg>
                  </div>
                  <p className="text-sm text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    Camera & Microphone Access Needed
                  </p>
                  <p className="text-xs text-muted max-w-[320px] mx-auto mb-4">
                    Please allow camera and microphone access in your browser settings to join the call
                  </p>
                  <button
                    onClick={startVideo}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-[var(--radius)] hover:opacity-90 transition-opacity text-xs"
                    style={{ fontWeight: 'var(--font-weight-bold)' }}
                  >
                    Retry Access
                  </button>
                </div>
              </div>
            ) : !isVideoOff ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="size-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  ME
                </div>
              </div>
            )}

            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-3">
              <button
                onClick={handleToggleVideo}
                className="p-3.5 md:p-3 rounded-full transition-all hover:bg-foreground/20 text-foreground backdrop-blur-sm"
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {isVideoOff ? <IconVideoOff /> : <IconVideo />}
              </button>

              <button
                onClick={handleToggleMute}
                className="p-3.5 md:p-3 rounded-full transition-all hover:bg-foreground/20 text-foreground backdrop-blur-sm"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <IconMicrophoneOff /> : <IconMicrophone />}
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[var(--radius)] p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-[var(--radius)] shrink-0">
                <IconPeopleList />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm text-foreground truncate" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  Ready to join?
                </h3>
                <p className="text-xs text-muted truncate">
                  {meeting.participants.length > 0 
                    ? `${meeting.participants.length} participant${meeting.participants.length !== 1 ? 's are' : ' is'} waiting`
                    : 'Be the first to join'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-border text-foreground rounded-[var(--radius)] text-sm hover:bg-secondary transition-colors"
                style={{ fontWeight: 'var(--font-weight-bold)' }}
              >
                Cancel
              </button>
              <button
                onClick={onJoin}
                className="flex-1 px-3 md:px-4 py-2 md:py-2.5 bg-primary text-primary-foreground rounded-[var(--radius)] text-sm hover:opacity-90 transition-opacity"
                style={{ fontWeight: 'var(--font-weight-bold)' }}
              >
                Join Meeting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RemoteSupportPage({ 
  onCallStateChange, 
  initialShowScheduleModal = false 
}: { 
  onCallStateChange?: (inCall: boolean) => void;
  initialShowScheduleModal?: boolean;
}) {
  const isMobile = useIsMobile();
  const [isLandscape, setIsLandscape] = useState(false);
  const { prompt: appPrompt } = useAppPopup();
  const { currentRole } = useRole();
  const canScheduleMeeting = hasAccess(currentRole, 'schedule-meeting');
  const canStartCall = hasAccess(currentRole, 'start-call');
  const { projects, knowledgeBaseItems } = useProject();
  const { activeCall, setActiveCall, updateCallState, isCallMinimized, setIsCallMinimized } = useActiveCall();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [pastMeetings, setPastMeetings] = useState<Meeting[]>([]);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [inCall, setInCall] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [showPreJoin, setShowPreJoin] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(initialShowScheduleModal);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  const openScheduleModal = (open: boolean) => { setShowScheduleModal(open); setUrlParam('schedule', open ? '1' : null); };
  const [meetingTitle, setMeetingTitle] = useState('Meeting with Host Name');
  const [callId] = useState(() => Math.random().toString(36).substring(2, 11).toUpperCase());
  const [callPassword] = useState(() => Math.random().toString(36).substring(2, 8));
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const [activeTab, setActiveTab] = useState<'agenda' | 'recent'>('agenda');
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  
  // Call Device and Join Meeting states
  const [showCallDeviceModal, setShowCallDeviceModal] = useState(false);
  const [showJoinMeetingModal, setShowJoinMeetingModal] = useState(false);
  const [showInviteDeviceModal, setShowInviteDeviceModal] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [inviteDeviceId, setInviteDeviceId] = useState('');
  const [meetingCode, setMeetingCode] = useState('');
  const [meetingPassword, setMeetingPassword] = useState('');
  
  // Mobile state
  const [showMobilePeople, setShowMobilePeople] = useState(false);

  // In-call states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showPeoplePanel, setShowPeoplePanel] = useState(true);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPersonId, setHoveredPersonId] = useState<string | null>(null);
  const [hoveredParticipantId, setHoveredParticipantId] = useState<string | null>(null);
  const [hostId, setHostId] = useState('me');
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [currentCaption, setCurrentCaption] = useState('');
  const [captionSpeaker, setCaptionSpeaker] = useState('You');
  const [captionLanguage, setCaptionLanguage] = useState('en-US');
  const [captionHistory, setCaptionHistory] = useState<Array<{text: string, speaker: string, id: string}>>([]);
  const [openMenuParticipantId, setOpenMenuParticipantId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({});

  // Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<Array<{
    id: string;
    name: string;
    type: string;
    projectName: string;
  }>>([]);
  const [chatPanelWidth, setChatPanelWidth] = useState(360);
  const [isResizingChat, setIsResizingChat] = useState(false);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const chatResizeRef = useRef<HTMLDivElement>(null);

  // Participants state
  const [callParticipants, setCallParticipants] = useState<CallParticipant[]>([
    { 
      id: 'me', 
      name: 'You', 
      initial: 'ME', 
      color: '#2f80ed', 
      status: 'connected',
      audioEnabled: true,
      videoEnabled: true
    }
  ]);

  // Video state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [spotlightedParticipantId, setSpotlightedParticipantId] = useState<string | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const localVideoRefCb = useCallback((video: HTMLVideoElement | null) => {
    if (video && localStream) video.srcObject = localStream;
  }, [localStream]);
  const screenVideoRefCb = useCallback((video: HTMLVideoElement | null) => {
    if (video && screenStream) video.srcObject = screenStream;
  }, [screenStream]);
  const recognitionRef = useRef<any>(null);
  const captionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: window.innerWidth - 280, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const videoAreaRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);
  
  // Device selection state
  const [showVideoDeviceMenu, setShowVideoDeviceMenu] = useState(false);
  const [showAudioDeviceMenu, setShowAudioDeviceMenu] = useState(false);
  const [showCaptionsMenu, setShowCaptionsMenu] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [selectedAudioOutputDevice, setSelectedAudioOutputDevice] = useState<string>('');
  const [showAudioSettingsModal, setShowAudioSettingsModal] = useState(false);
  const [audioVolume, setAudioVolume] = useState(100);
  const [spatialAudioEnabled, setSpatialAudioEnabled] = useState(false);
  const [noiseSuppression, setNoiseSuppression] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#ff0000');
  const [drawingTool, setDrawingTool] = useState<'pen' | 'label' | 'beacon'>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPaths, setDrawingPaths] = useState<Array<{
    tool: 'pen' | 'label' | 'beacon';
    color: string;
    points: Array<{ x: number; y: number }>;
    text?: string;
  }>>([]);
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([]);
  const currentPathRef = useRef<Array<{ x: number; y: number }>>([]);
  const drawRafRef = useRef(0);
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingContainerRef = useRef<HTMLDivElement>(null);

  // Fullscreen state
  const [isCallFullscreen, setIsCallFullscreen] = useState(false);

  // Layout state
  const [videoLayout, setVideoLayout] = useState<'grid' | 'sidebar' | 'bottom'>('grid');
  const [floatingVideoSize, setFloatingVideoSize] = useState({ width: 224, height: 126 }); // 16:9 ratio, default w-56

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoDeviceMenuRef = useRef<HTMLDivElement>(null);
  const audioDeviceMenuRef = useRef<HTMLDivElement>(null);
  const captionsMenuRef = useRef<HTMLDivElement>(null);
  const [speakingParticipants, setSpeakingParticipants] = useState<Set<string>>(new Set());

  useEffect(() => {
    onCallStateChange?.(inCall);
  }, [inCall, onCallStateChange]);

  // Detect landscape orientation on mobile
  useEffect(() => {
    const checkOrientation = () => {
      if (isMobile) {
        setIsLandscape(window.innerWidth > window.innerHeight);
      } else {
        setIsLandscape(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [isMobile]);

  // Auto-unspotlight when only 1 participant remains
  useEffect(() => {
    const connectedParticipants = callParticipants.filter(p => p.status === 'connected');
    if (connectedParticipants.length <= 1 && spotlightedParticipantId) {
      setSpotlightedParticipantId(null);
    }
  }, [callParticipants, spotlightedParticipantId]);

  // Clear drawing state when spotlight changes
  useEffect(() => {
    setIsDrawingMode(false);
    setDrawingPaths([]);
    setCurrentPath([]);
    setFrozenFrame(null);
    setIsDrawing(false);
  }, [spotlightedParticipantId]);

  // Simulate random speaking with green border
  useEffect(() => {
    if (!inCall) return;

    let clearTimer: ReturnType<typeof setTimeout> | null = null;

    const interval = setInterval(() => {
      const connectedParticipants = callParticipants.filter(p => p.status === 'connected' && p.audioEnabled);
      if (connectedParticipants.length === 0) return;

      // Randomly select 0-2 participants to "speak"
      const numSpeaking = Math.floor(Math.random() * Math.min(3, connectedParticipants.length + 1));
      const speaking = new Set<string>();

      for (let i = 0; i < numSpeaking; i++) {
        const randomIndex = Math.floor(Math.random() * connectedParticipants.length);
        speaking.add(connectedParticipants[randomIndex].id);
      }

      setSpeakingParticipants(speaking);

      // Clear speaking after 1-3 seconds
      if (clearTimer) clearTimeout(clearTimer);
      clearTimer = setTimeout(() => {
        setSpeakingParticipants(new Set());
        clearTimer = null;
      }, 1000 + Math.random() * 2000);
    }, 3000);

    return () => {
      clearInterval(interval);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, [inCall, callParticipants]);

  // Call duration timer
  useEffect(() => {
    if (!callStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const duration = Math.floor((now.getTime() - callStartTime.getTime()) / 1000);
      setCallDuration(duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStartTime]);

  // Ensure call is not minimized when on Remote Support page
  useEffect(() => {
    if (inCall && isCallMinimized) {
      setIsCallMinimized(false);
    }
  }, [inCall, isCallMinimized, setIsCallMinimized]);

  useEffect(() => {
    if (inCall) {
      startLocalVideo();
    }
    return () => {
      stopLocalVideo();
    };
  }, [inCall]);

  // Enumerate devices on mount and listen for device changes
  useEffect(() => {
    const initializeDevices = async () => {
      // Enumerate devices without requesting permissions
      // Device labels will show as empty until permissions are granted during call
      await enumerateDevices();
    };

    initializeDevices();

    // Listen for device changes
    const handleDeviceChange = () => {
      enumerateDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  useClickOutside(moreMenuRef, () => setShowMoreMenu(false), showMoreMenu);

  // Chat panel resize handler — throttled via rAF
  useEffect(() => {
    if (!isResizingChat) return;
    let rafId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 300 && newWidth <= 600) {
          setChatPanelWidth(newWidth);
        }
      });
    };

    const handleMouseUp = () => {
      cancelAnimationFrame(rafId);
      setIsResizingChat(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingChat]);

  // Close device/captions menus when clicking outside
  useClickOutside(videoDeviceMenuRef, () => setShowVideoDeviceMenu(false), showVideoDeviceMenu);
  useClickOutside(audioDeviceMenuRef, () => setShowAudioDeviceMenu(false), showAudioDeviceMenu);
  useClickOutside(captionsMenuRef, () => setShowCaptionsMenu(false), showCaptionsMenu);

  // Handle initial schedule modal opening from external navigation (e.g., HomePage) or URL param
  useEffect(() => {
    if (initialShowScheduleModal && !showScheduleModal) {
      openScheduleModal(true);
    }
    if (getUrlParam('schedule') === '1' && !showScheduleModal) {
      setShowScheduleModal(true);
    }
  }, [initialShowScheduleModal]);

  // Restore call state when returning to page
  useEffect(() => {
    if (activeCall && !inCall) {
      // User was in a call and navigated back to this page
      // Restore the in-call state
      setInCall(true);
      setCallStartTime(activeCall.startTime);
      setIsMuted(!activeCall.isAudioEnabled);
      setIsVideoOff(!activeCall.isVideoEnabled);

      // Restore meeting info
      setCurrentMeeting({
        id: activeCall.callId,
        title: activeCall.meetingTitle,
        participants: [],
        scheduledTime: activeCall.startTime,
        duration: 30,
        hostId: '1'
      });
    }
  }, [activeCall]);

  // Update active call participant count when participants change
  useEffect(() => {
    if (activeCall && inCall) {
      updateCallState({ participantCount: callParticipants.length });
    }
  }, [callParticipants.length, inCall, activeCall, updateCallState]);

  const enumerateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
      setVideoDevices(videoInputs);
      setAudioDevices(audioInputs);
      setAudioOutputDevices(audioOutputs);
      
      // Set default devices if not already selected
      if (!selectedVideoDevice && videoInputs.length > 0) {
        setSelectedVideoDevice(videoInputs[0].deviceId);
      }
      if (!selectedAudioDevice && audioInputs.length > 0) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }
      if (!selectedAudioOutputDevice && audioOutputs.length > 0) {
        setSelectedAudioOutputDevice(audioOutputs[0].deviceId);
      }
    } catch (err) {
      console.error('Error enumerating devices:', err);
    }
  };

  const startLocalVideo = async (videoDeviceId?: string, audioDeviceId?: string) => {
    try {
      const constraints: MediaStreamConstraints = {
        video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
        audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Enumerate devices after getting permissions
      await enumerateDevices();
    } catch (err: any) {
      // Silently handle permission errors - user can still use call without camera/mic
      if (err.name === 'NotAllowedError') {
        // Permission denied - continue without camera/mic
        setIsVideoOff(true);
        setIsMuted(true);
      } else if (err.name === 'NotFoundError') {
        // No camera/mic found - continue without them
        setIsVideoOff(true);
        setIsMuted(true);
      } else if (err.name === 'NotReadableError') {
        // Device is in use - continue without camera/mic
        setIsVideoOff(true);
        setIsMuted(true);
      }
      // Don't show error toast or console log - just continue without media
    }
  };

  const stopLocalVideo = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setCaptionsEnabled(false);
    setCurrentCaption('');
  };

  const handleScheduleMeeting = (meeting: Omit<Meeting, 'id'>) => {
    const newMeeting: Meeting = {
      ...meeting,
      id: Date.now().toString(),
      hostId: '1'
    };
    setMeetings([...meetings, newMeeting]);
    openScheduleModal(false);
    toast.success('Meeting scheduled successfully');
  };

  const handleUpdateMeeting = (updatedMeeting: Meeting) => {
    setMeetings(meetings.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
    openScheduleModal(false);
    setEditingMeeting(null);
    toast.success('Meeting updated successfully');
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    openScheduleModal(true);
  };

  const handleDeleteMeeting = (meetingId: string) => {
    setMeetings(meetings.filter(m => m.id !== meetingId));
    toast.success('Meeting deleted successfully');
  };

  const handleChangeVideoDevice = async (deviceId: string) => {
    setSelectedVideoDevice(deviceId);
    setShowVideoDeviceMenu(false);
    
    // Stop current stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Start with new device
    await startLocalVideo(deviceId, selectedAudioDevice);
    toast.success('Camera changed');
  };

  const handleChangeAudioDevice = async (deviceId: string) => {
    setSelectedAudioDevice(deviceId);
    setShowAudioDeviceMenu(false);
    
    // Stop current stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Start with new device
    await startLocalVideo(selectedVideoDevice, deviceId);
    toast.success('Microphone changed');
  };

  const handleChangeAudioOutputDevice = (deviceId: string) => {
    setSelectedAudioOutputDevice(deviceId);
    toast.success('Speaker changed');
  };

  // Audio level monitoring — poll at 10fps instead of every rAF frame
  useEffect(() => {
    if (!localStream || isMuted) {
      setAudioLevel(0);
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(localStream);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    microphone.connect(analyser);
    analyser.fftSize = 256;

    const interval = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(Math.min(100, (average / 128) * 100));
    }, 100);

    return () => {
      clearInterval(interval);
      microphone.disconnect();
      audioContext.close();
    };
  }, [localStream, isMuted]);


  const handleStartMeetingNow = () => {
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      title: meetingTitle || 'Meeting with Host Name',
      participants: [],
      scheduledTime: new Date(),
      duration: 30,
      hostId: '1'
    };
    setCurrentMeeting(newMeeting);
    setShowCreateMenu(false);
    setShowPreJoin(true);
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    setCurrentMeeting(meeting);
    setShowPreJoin(true);
  };

  const handleCallDevice = () => {
    if (deviceId.length === 9) {
      const newMeeting: Meeting = {
        id: Date.now().toString(),
        title: `Device Call - ${deviceId}`,
        participants: [],
        scheduledTime: new Date(),
        duration: 30,
        hostId: '1'
      };
      setCurrentMeeting(newMeeting);
      setShowCallDeviceModal(false);
      setShowPreJoin(true);
      setDeviceId('');
    }
  };

  const handleInviteByDeviceId = () => {
    if (inviteDeviceId.length === 9) {
      // Simulate inviting the device to the current call
      toast.success(`Inviting device ${inviteDeviceId} to the call...`);
      setShowInviteDeviceModal(false);
      setInviteDeviceId('');
      
      // After 2 seconds, show device joined
      setTimeout(() => {
        const newParticipant: CallParticipant = {
          id: `device-${inviteDeviceId}`,
          name: `Device ${inviteDeviceId}`,
          audioEnabled: true,
          videoEnabled: true,
          handRaised: false,
          isSpeaking: false,
          isPresenting: false
        };
        setCallParticipants(prev => [...prev, newParticipant]);
        toast.success(`Device ${inviteDeviceId} joined the call`);
      }, 2000);
    }
  };

  const handleJoinMeetingByCode = () => {
    if (meetingCode.length === 8) {
      const newMeeting: Meeting = {
        id: Date.now().toString(),
        title: `Meeting - ${meetingCode}`,
        participants: [],
        scheduledTime: new Date(),
        duration: 30,
        hostId: '1'
      };
      setCurrentMeeting(newMeeting);
      setShowJoinMeetingModal(false);
      setShowPreJoin(true);
      setMeetingCode('');
      setMeetingPassword('');
    }
  };

  const handleJoinCall = async () => {
    setShowPreJoin(false);
    setInCall(true);
    const startTime = new Date();
    setCallStartTime(startTime);
    
    // Set active call in global context
    if (currentMeeting) {
      setActiveCall({
        callId: currentMeeting.id,
        meetingTitle: currentMeeting.title,
        startTime: startTime,
        participantCount: callParticipants.length,
        isAudioEnabled: !isMuted,
        isVideoEnabled: !isVideoOff
      });
    }
    
    // Start video stream if not already started
    if (!localStream) {
      await startLocalVideo();
    }
  };

  const handleLeaveCall = () => {
    if (currentMeeting) {
      setPastMeetings([currentMeeting, ...pastMeetings]);
      
      // Save to recent calls
      const recentCall: RecentCall = {
        id: Date.now().toString(),
        title: currentMeeting.title,
        participants: currentMeeting.participants,
        timestamp: new Date(),
        duration: callDuration,
        type: 'completed'
      };
      setRecentCalls([recentCall, ...recentCalls]);
    }
    
    // Clear active call from global context
    setActiveCall(null);
    
    stopLocalVideo();
    setInCall(false);
    setCurrentMeeting(null);
    setShowPreJoin(false);
    setIsScreenSharing(false);
    setShowPeoplePanel(false);
    setShowChatPanel(false);
    setCallStartTime(null);
    setCallDuration(0);
    setChatMessages([]);
    setCallParticipants([
      { 
        id: 'me', 
        name: 'You', 
        initial: 'ME', 
        color: '#2f80ed', 
        status: 'connected',
        audioEnabled: true,
        videoEnabled: true
      }
    ]);
    toast.success('Call ended');
  };

  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !newMutedState;
      });
    }
    setCallParticipants(prev => prev.map(p => 
      p.id === 'me' ? { ...p, audioEnabled: !newMutedState } : p
    ));
    
    // Update global call state
    if (activeCall) {
      updateCallState({ isAudioEnabled: !newMutedState });
    }
    
    toast.success(newMutedState ? 'Microphone off' : 'Microphone on');
  };

  const handleToggleVideo = async () => {
    const newVideoState = !isVideoOff;
    setIsVideoOff(newVideoState);
    
    if (newVideoState) {
      // Turning video OFF
      if (localStream) {
        localStream.getVideoTracks().forEach(track => {
          track.enabled = false;
        });
      }
      toast.success('Camera off');
    } else {
      // Turning video ON
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = true;
          // Ensure video element is connected
          if (videoRef.current && !videoRef.current.srcObject) {
            videoRef.current.srcObject = localStream;
          }
        }
      } else {
        // No stream exists, start a new one
        await startLocalVideo();
      }
      toast.success('Camera on');
    }
    
    setCallParticipants(prev => prev.map(p => 
      p.id === 'me' ? { ...p, videoEnabled: !newVideoState } : p
    ));
    
    // Update global call state
    if (activeCall) {
      updateCallState({ isVideoEnabled: !newVideoState });
    }
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
      toast.success('Screen sharing stopped');
    } else {
      // Start screen sharing
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: false
        });
        
        // Handle when user stops sharing via browser UI
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
          toast.success('Screen sharing stopped');
        };
        
        setScreenStream(stream);
        setIsScreenSharing(true);
        toast.success('Screen sharing started');
      } catch (err) {
        toast.error('Failed to start screen sharing');
      }
    }
  };

  const handleToggleCaptions = () => {
    const newCaptionsState = !captionsEnabled;
    setCaptionsEnabled(newCaptionsState);

    if (newCaptionsState) {
      // Start speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = captionLanguage;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              const captionId = Date.now().toString();
              setCaptionHistory(prev => {
                const newHistory = [...prev, { text: transcript, speaker: captionSpeaker, id: captionId }];
                return newHistory.slice(-5); // Keep only last 5 captions
              });
              setCurrentCaption(transcript);
              if (captionTimeoutRef.current) clearTimeout(captionTimeoutRef.current);
              captionTimeoutRef.current = setTimeout(() => setCurrentCaption(''), 3000);
            } else {
              interimTranscript += transcript;
              setCurrentCaption(interimTranscript);
            }
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            toast.error('Microphone permission denied. Please allow microphone access for captions.');
            setCaptionsEnabled(false);
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (e) {
                // Ignore stop errors
              }
              recognitionRef.current = null;
            }
            setCurrentCaption('');
          } else if (event.error === 'no-speech') {
            // This is normal - just means user hasn't spoken yet, keep listening
          } else if (event.error === 'aborted') {
            // Ignore aborted errors - this happens when manually stopped
          } else if (event.error === 'audio-capture') {
            toast.error('No microphone detected. Please connect a microphone and try again.');
            setCaptionsEnabled(false);
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (e) {
                // Ignore stop errors
              }
              recognitionRef.current = null;
            }
            setCurrentCaption('');
          } else if (event.error === 'network') {
            toast.error('Network error. Captions require an internet connection.');
            setCaptionsEnabled(false);
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (e) {
                // Ignore stop errors
              }
              recognitionRef.current = null;
            }
            setCurrentCaption('');
          } else {
            console.error('Captions error:', event.error);
            toast.error(`Captions error: ${event.error}`);
            setCaptionsEnabled(false);
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (e) {
                // Ignore stop errors
              }
              recognitionRef.current = null;
            }
            setCurrentCaption('');
          }
        };

        recognition.onend = () => {
          // Restart if captions are still enabled
          // Use recognitionRef to check if it's still active
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // If restart fails, disable captions
              setCaptionsEnabled(false);
              recognitionRef.current = null;
            }
          }
        };

        try {
          recognitionRef.current = recognition;
          recognition.start();
          toast.success('Captions enabled - Start speaking to see captions');
        } catch (error) {
          console.error('Failed to start speech recognition:', error);
          toast.error('Failed to start captions. Please check microphone permissions.');
          setCaptionsEnabled(false);
          recognitionRef.current = null;
        }
      } else {
        toast.error('Speech recognition not supported in this browser');
        setCaptionsEnabled(false);
      }
    } else {
      // Stop speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore stop errors
        }
        recognitionRef.current = null;
      }
      setCurrentCaption('');
      toast.success('Captions disabled');
    }
  };

  const handleToggleFullscreen = () => {
    setIsCallFullscreen(!isCallFullscreen);
    toast.success(isCallFullscreen ? 'Exited fullscreen' : 'Entered fullscreen');
  };

  const handleMinimizeCall = () => {
    setIsCallMinimized(true);
    toast.success('Call minimized - navigate to any page');
  };

  const handleMuteParticipant = (participantId: string) => {
    setCallParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, audioEnabled: false, mutedByHost: true } : p
    ));
    const participant = callParticipants.find(p => p.id === participantId);
    toast.success(`${participant?.name || 'Participant'} has been muted`);
  };

  const handleUnmuteParticipant = (participantId: string) => {
    setCallParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, mutedByHost: false } : p
    ));
    const participant = callParticipants.find(p => p.id === participantId);
    toast.success(`${participant?.name || 'Participant'} can now unmute`);
  };

  // Drawing handlers
  const handleStartDrawing = () => {
    if (!drawingContainerRef.current || !videoRef.current) return;
    
    // Freeze the current video frame
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || video.offsetWidth;
    canvas.height = video.videoHeight || video.offsetHeight;
    const ctx = canvas.getContext('2d');
    if (ctx && video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setFrozenFrame(canvas.toDataURL());
    }
  };

  const handleMouseDown = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Freeze frame on first draw
    if (!frozenFrame) {
      handleStartDrawing();
    }

    if (drawingTool === 'pen') {
      // Start freehand drawing
      setIsDrawing(true);
      setCurrentPath([{ x, y }]);
    } else if (drawingTool === 'beacon') {
      // Place beacon circle on click
      setDrawingPaths(prev => [...prev, {
        tool: 'beacon',
        color: drawingColor,
        points: [{ x, y }]
      }]);
      toast.success('Beacon placed');
    } else if (drawingTool === 'label') {
      // Place label on click
      const text = await appPrompt('Enter label text:', { title: 'Add Label', defaultValue: 'Label' });
      if (text) {
        setDrawingPaths(prev => [...prev, {
          tool: 'label',
          color: drawingColor,
          points: [{ x, y }],
          text
        }]);
        toast.success('Label placed');
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || drawingTool !== 'pen') return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    currentPathRef.current.push({ x, y });
    cancelAnimationFrame(drawRafRef.current);
    drawRafRef.current = requestAnimationFrame(() => {
      setCurrentPath([...currentPathRef.current]);
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || drawingTool !== 'pen') return;
    cancelAnimationFrame(drawRafRef.current);

    setIsDrawing(false);
    const path = currentPathRef.current;
    if (path.length > 0) {
      setDrawingPaths(prev => [...prev, {
        tool: drawingTool,
        color: drawingColor,
        points: path
      }]);
      currentPathRef.current = [];
      setCurrentPath([]);
    }
  };

  const handleClearDrawing = () => {
    setDrawingPaths([]);
    setCurrentPath([]);
    toast.success('All drawings cleared');
  };

  const handleUndoDrawing = () => {
    if (drawingPaths.length > 0) {
      setDrawingPaths(prev => prev.slice(0, -1));
      toast.success('Last drawing undone');
    }
  };

  const handleUnfreezeFrame = () => {
    setFrozenFrame(null);
    setDrawingPaths([]);
    setCurrentPath([]);
    setIsDrawingMode(false);
    toast.success('Frame unfrozen');
  };

  // Redraw canvas when paths change
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all paths
    [...drawingPaths, ...(currentPath.length > 0 ? [{
      tool: drawingTool,
      color: drawingColor,
      points: currentPath,
      text: ''
    }] : [])].forEach(path => {
      if (path.tool === 'pen') {
        // Freehand drawing
        if (path.points.length < 2) return;
        
        ctx.beginPath();
        ctx.strokeStyle = path.color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 1;
        
        const firstPoint = path.points[0];
        ctx.moveTo(firstPoint.x * canvas.width, firstPoint.y * canvas.height);
        
        for (let i = 1; i < path.points.length; i++) {
          const point = path.points[i];
          ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
        }
        
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (path.tool === 'beacon') {
        // Circle marker
        if (path.points.length === 0) return;
        const point = path.points[0];
        
        ctx.beginPath();
        ctx.strokeStyle = path.color;
        ctx.fillStyle = path.color;
        ctx.globalAlpha = 0.3;
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 40, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 0.8;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (path.tool === 'label') {
        // Text label
        if (path.points.length === 0) return;
        const point = path.points[0];
        const text = path.text || 'Label';
        
        ctx.font = 'bold 18px var(--font-family-base)';
        ctx.fillStyle = path.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 1;
        
        // Draw text outline
        ctx.strokeText(text, point.x * canvas.width, point.y * canvas.height);
        // Draw text
        ctx.fillText(text, point.x * canvas.width, point.y * canvas.height);
      }
    });
  }, [drawingPaths, currentPath, drawingTool, drawingColor]);

  const handleMuteAll = () => {
    setCallParticipants(prev => prev.map(p => 
      p.id === 'me' ? p : { ...p, audioEnabled: false, mutedByHost: true }
    ));
    toast.success('All participants have been muted');
  };

  const handleSendMessage = () => {
    if (chatInput.trim() || selectedAttachments.length > 0) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'You',
        senderInitial: 'ME',
        senderColor: '#2f80ed',
        text: chatInput,
        timestamp: new Date(),
        attachments: selectedAttachments.length > 0 ? selectedAttachments : undefined
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatInput('');
      setSelectedAttachments([]);
      
      // Reset textarea height
      if (chatInputRef.current) {
        chatInputRef.current.style.height = 'auto';
      }

      // Simulate random participant response after 2-4 seconds
      const connectedPeople = callParticipants.filter(p => p.status === 'connected' && p.id !== 'me');
      if (connectedPeople.length > 0) {
        const randomDelay = Math.random() * 2000 + 2000; // 2-4 seconds
        const randomParticipant = connectedPeople[Math.floor(Math.random() * connectedPeople.length)];
        
        const responses = [
          'Got it, thanks!',
          'That makes sense',
          'I agree',
          'Good point!',
          'Thanks for sharing',
          'Understood',
          'Yes, I see that',
          'Great idea!',
        ];
        
        setTimeout(() => {
          const response: ChatMessage = {
            id: Date.now().toString(),
            sender: randomParticipant.name,
            senderInitial: randomParticipant.initial,
            senderColor: randomParticipant.color,
            text: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, response]);
          // Increment unread count if chat panel is closed
          setUnreadMessagesCount(prevCount => prevCount + 1);
        }, randomDelay);
      }
    }
  };

  const handleInviteParticipant = (person: Person) => {
    // Add participant in "calling" state
    const newParticipant: CallParticipant = {
      id: person.id,
      name: person.name,
      initial: person.initial,
      color: person.color,
      status: 'calling',
      audioEnabled: true,
      videoEnabled: true
    };
    
    setCallParticipants(prev => [...prev, newParticipant]);
    setShowInviteModal(false);
    toast.success(`Calling ${person.name}...`);

    // After 2 seconds, "answer" the call
    setTimeout(() => {
      setCallParticipants(prev => prev.map(p => 
        p.id === person.id 
          ? { 
              ...p, 
              status: 'connected',
              videoUrl: person.id === '2' 
                ? 'https://images.unsplash.com/photo-1522199899308-2eef382e2158?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzfGVufDF8fHx8MTc3MDgyMDEyMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
                : person.id === '3'
                ? 'https://images.unsplash.com/photo-1598268012815-ae21095df31b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzc3xlbnwxfHx8fDE3NzA3MjE5NTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
                : person.id === '4'
                ? 'https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDcxMTM4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
                : 'https://images.unsplash.com/photo-1629773479797-438cfc9b1ee4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBjYXN1YWx8ZW58MXx8fHwxNzcwNzMyNjU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
            } 
          : p
      ));
      toast.success(`${person.name} joined the call`);
    }, 2000);
  };

  const handleCallAgain = (call: RecentCall) => {
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      title: call.title,
      participants: call.participants,
      scheduledTime: new Date(),
      duration: 30,
      hostId: '1'
    };
    setCurrentMeeting(newMeeting);
    setShowPreJoin(true);
    toast.success('Starting call...');
  };

  const availablePeople = useMemo(() => people.filter(p =>
    !callParticipants.some(cp => cp.id === p.id) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [callParticipants, searchQuery]);

  const connectedParticipants = useMemo(() => callParticipants.filter(p => p.status === 'connected'), [callParticipants]);
  const callingParticipants = useMemo(() => callParticipants.filter(p => p.status === 'calling'), [callParticipants]);

  if (showPreJoin && currentMeeting) {
    return (
      <PreJoinMeeting
        meeting={currentMeeting}
        onJoin={handleJoinCall}
        onCancel={() => {
          setShowPreJoin(false);
          setCurrentMeeting(null);
        }}
      />
    );
  }

  if (inCall && currentMeeting) {
    return (
      <div 
        ref={containerRef} 
        className={`h-full flex flex-col bg-[#3a2f4d] ${
          isCallFullscreen ? 'fixed inset-0 z-[9999]' : ''
        }`}
      >
        {/* Top Bar - White/Light */}
        <div className={`bg-card border-b border-border shrink-0`}>
          {/* Desktop Layout */}
          <div className="hidden md:flex h-20 items-center justify-between px-6 py-3">
            {/* Left: Meeting Info */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-[var(--radius)]">
                <Phone className="size-5 text-foreground" />
              </div>
              <div>
                <h3 className="text-sm text-foreground truncate max-w-[200px]" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {currentMeeting.title}
                </h3>
                <div className="text-xs text-muted">
                  {Math.floor(callDuration / 3600) > 0 && `${Math.floor(callDuration / 3600)}:`}
                  {String(Math.floor((callDuration % 3600) / 60)).padStart(2, '0')}:
                  {String(callDuration % 60).padStart(2, '0')}
                </div>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-[var(--radius)] hover:bg-secondary transition-colors"
              >
                <IconMore />
                <span className="text-xs text-foreground">More</span>
              </button>
              
              {showMoreMenu && (
                <div 
                  ref={moreMenuRef}
                  className="absolute top-full mt-1 right-0 w-56 bg-card border border-border rounded-[var(--radius)] overflow-hidden z-50"
                  style={{ boxShadow: 'var(--elevation-sm)' }}
                >
                  {/* Share Screen - shown in menu on smaller screens */}
                  <button
                    onClick={() => {
                      handleToggleScreenShare();
                      setShowMoreMenu(false);
                    }}
                    className="xl:hidden w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-3"
                  >
                    <IconScreenShare />
                    <span>{isScreenSharing ? 'Stop sharing' : 'Share screen'}</span>
                  </button>
                  {/* Captions - shown in menu on smaller screens */}
                  <button
                    onClick={() => {
                      handleToggleCaptions();
                      setShowMoreMenu(false);
                    }}
                    className="xl:hidden w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-3"
                  >
                    <IconCaptions />
                    <span>{captionsEnabled ? 'Disable captions' : 'Enable captions'}</span>
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Recording started');
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-3"
                  >
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="3" strokeWidth={2} />
                      <circle cx="12" cy="12" r="9" strokeWidth={2} />
                    </svg>
                    <span>Start recording</span>
                  </button>
                  {hostId === 'me' && (
                    <button
                      onClick={() => {
                        handleMuteAll();
                        setShowMoreMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-3 border-t border-border"
                    >
                      <IconMicrophoneOff />
                      <span>Mute all</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="hidden md:flex flex-col items-center gap-1 px-4 py-2 rounded-[var(--radius)] hover:bg-secondary transition-colors"
            >
              <IconInvite />
              <span className="text-xs text-foreground">Invite</span>
            </button>

            <button
              onClick={() => setShowPeoplePanel(!showPeoplePanel)}
              className={`flex flex-col items-center gap-1 px-2 md:px-4 py-2 rounded-[var(--radius)] transition-colors ${
                showPeoplePanel ? 'bg-primary/10 text-primary' : 'hover:bg-secondary text-foreground'
              }`}
            >
              <IconPeople />
              <span className="text-xs relative inline-block hidden md:inline-block">
                <span className="invisible absolute" style={{ fontWeight: 'var(--font-weight-bold)' }}>People</span>
                <span style={{ fontWeight: showPeoplePanel ? 'var(--font-weight-bold)' : 'normal' }}>People</span>
              </span>
            </button>

            <button
              onClick={() => {
                setShowChatPanel(!showChatPanel);
                // Mark messages as read when opening chat panel
                if (!showChatPanel) {
                  setUnreadMessagesCount(0);
                }
              }}
              className={`flex flex-col items-center gap-1 px-2 md:px-4 py-2 rounded-[var(--radius)] transition-colors relative ${
                showChatPanel ? 'bg-primary/10 text-primary' : 'hover:bg-secondary text-foreground'
              }`}
            >
              <IconChat />
              <span className="text-xs relative inline-block hidden md:inline-block">
                <span className="invisible absolute" style={{ fontWeight: 'var(--font-weight-bold)' }}>Chat</span>
                <span style={{ fontWeight: showChatPanel ? 'var(--font-weight-bold)' : 'normal' }}>Chat</span>
              </span>
              {unreadMessagesCount > 0 && !showChatPanel && (
                <div className="absolute top-0.5 md:top-1 right-0.5 md:right-1 size-4 bg-destructive rounded-full flex items-center justify-center text-white text-[10px]" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {unreadMessagesCount}
                </div>
              )}
            </button>

            <button
              onClick={handleToggleScreenShare}
              className={`hidden xl:flex flex-col items-center gap-1 px-4 py-2 rounded-[var(--radius)] transition-colors ${
                isScreenSharing ? 'bg-primary/10 text-primary' : 'hover:bg-secondary text-foreground'
              }`}
            >
              <IconScreenShare />
              <span className="text-xs relative inline-block">
                <span className="invisible absolute" style={{ fontWeight: 'var(--font-weight-bold)' }}>Share</span>
                <span style={{ fontWeight: isScreenSharing ? 'var(--font-weight-bold)' : 'normal' }}>Share</span>
              </span>
            </button>

            <div className="relative hidden xl:flex">
              <button
                onClick={handleToggleCaptions}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-l-[var(--radius)] transition-colors ${
                  captionsEnabled ? 'bg-primary/10 text-primary' : 'hover:bg-secondary text-foreground'
                }`}
              >
                <IconCaptions />
                <span className="text-xs relative inline-block">
                  <span className="invisible absolute" style={{ fontWeight: 'var(--font-weight-bold)' }}>Captions</span>
                  <span style={{ fontWeight: captionsEnabled ? 'var(--font-weight-bold)' : 'normal' }}>Captions</span>
                </span>
              </button>
              <button
                onClick={() => setShowCaptionsMenu(!showCaptionsMenu)}
                className={`flex items-center justify-center px-2 py-2 rounded-r-[var(--radius)] transition-colors ${
                  captionsEnabled ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'hover:bg-secondary text-foreground'
                }`}
                title="Caption settings"
              >
                <svg className="size-3.5" fill="none" viewBox="0 0 12 8">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Captions Language Menu */}
              {showCaptionsMenu && (
                <div 
                  ref={captionsMenuRef}
                  className="absolute top-full mt-2 left-0 w-72 bg-card border border-border rounded-[var(--radius)] overflow-hidden z-50"
                  style={{ boxShadow: 'var(--elevation-lg)' }}
                >
                  <div className="px-4 py-3 border-b border-border bg-secondary/30">
                    <div 
                      className="text-sm text-foreground" 
                      style={{ 
                        fontWeight: 'var(--font-weight-bold)',
                        fontFamily: 'var(--font-family)'
                      }}
                    >
                      Caption Language
                    </div>
                    <div 
                      className="text-xs text-muted mt-0.5"
                      style={{ fontFamily: 'var(--font-family)' }}
                    >
                      Choose language for live transcription
                    </div>
                  </div>
                  <div 
                    className="max-h-80 overflow-y-auto"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'var(--muted) transparent'
                    }}
                  >
                    <style>{`
                      .caption-language-scroll::-webkit-scrollbar {
                        width: 8px;
                      }
                      .caption-language-scroll::-webkit-scrollbar-track {
                        background: transparent;
                      }
                      .caption-language-scroll::-webkit-scrollbar-thumb {
                        background-color: var(--muted);
                        border-radius: var(--radius);
                        border: 2px solid transparent;
                        background-clip: padding-box;
                      }
                      .caption-language-scroll::-webkit-scrollbar-thumb:hover {
                        background-color: var(--foreground);
                        border: 2px solid transparent;
                        background-clip: padding-box;
                      }
                    `}</style>
                    <div className="caption-language-scroll">
                      {[
                        { code: 'en-US', label: 'English', region: 'United States', flag: '🇺🇸' },
                        { code: 'en-GB', label: 'English', region: 'United Kingdom', flag: '🇬🇧' },
                        { code: 'es-ES', label: 'Spanish', region: 'Spain', flag: '🇪🇸' },
                        { code: 'es-MX', label: 'Spanish', region: 'Mexico', flag: '🇲🇽' },
                        { code: 'fr-FR', label: 'French', region: 'France', flag: '🇫🇷' },
                        { code: 'de-DE', label: 'German', region: 'Germany', flag: '🇩🇪' },
                        { code: 'it-IT', label: 'Italian', region: 'Italy', flag: '🇮🇹' },
                        { code: 'pt-BR', label: 'Portuguese', region: 'Brazil', flag: '🇧🇷' },
                        { code: 'pt-PT', label: 'Portuguese', region: 'Portugal', flag: '🇵🇹' },
                        { code: 'zh-CN', label: 'Chinese', region: 'Simplified', flag: '🇨🇳' },
                        { code: 'zh-TW', label: 'Chinese', region: 'Traditional', flag: '🇹🇼' },
                        { code: 'ja-JP', label: 'Japanese', region: 'Japan', flag: '🇯🇵' },
                        { code: 'ko-KR', label: 'Korean', region: 'South Korea', flag: '🇰🇷' },
                        { code: 'ru-RU', label: 'Russian', region: 'Russia', flag: '🇷🇺' },
                        { code: 'ar-SA', label: 'Arabic', region: 'Saudi Arabia', flag: '🇸🇦' },
                        { code: 'hi-IN', label: 'Hindi', region: 'India', flag: '🇮🇳' },
                        { code: 'nl-NL', label: 'Dutch', region: 'Netherlands', flag: '🇳🇱' },
                        { code: 'pl-PL', label: 'Polish', region: 'Poland', flag: '🇵🇱' },
                        { code: 'tr-TR', label: 'Turkish', region: 'Turkey', flag: '🇹🇷' },
                      ].map((language) => {
                        const isSelected = captionLanguage === language.code;
                        return (
                          <button
                            key={language.code}
                            onClick={() => {
                              setCaptionLanguage(language.code);
                              setShowCaptionsMenu(false);
                              
                              // Restart recognition with new language if captions are enabled
                              if (captionsEnabled && recognitionRef.current) {
                                try {
                                  recognitionRef.current.stop();
                                  recognitionRef.current = null;
                                  setCaptionsEnabled(false);
                                  // Wait a bit then restart
                                  setTimeout(() => {
                                    handleToggleCaptions();
                                  }, 100);
                                } catch (e) {
                                  console.error('Error restarting captions:', e);
                                }
                              }
                              
                              toast.success(`Caption language set to ${language.label} (${language.region})`);
                            }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-secondary transition-all duration-150 flex items-center gap-3 group ${
                              isSelected ? 'bg-primary/10 border-l-2 border-primary' : 'border-l-2 border-transparent'
                            }`}
                          >
                            <span className="text-lg flex-shrink-0">{language.flag}</span>
                            <div className="flex-1 min-w-0">
                              <div 
                                className="text-sm text-foreground"
                                style={{ 
                                  fontWeight: isSelected ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                                  fontFamily: 'var(--font-family)'
                                }}
                              >
                                {language.label}
                              </div>
                              <div 
                                className="text-xs text-muted"
                                style={{ fontFamily: 'var(--font-family)' }}
                              >
                                {language.region}
                              </div>
                            </div>
                            {isSelected && (
                              <svg className="size-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            

            <button
              onClick={handleToggleFullscreen}
              className="hidden md:flex flex-col items-center gap-1 px-4 py-2 rounded-[var(--radius)] hover:bg-secondary transition-colors text-foreground"
              title="Toggle fullscreen"
            >
              {isCallFullscreen ? (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              ) : (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              )}
              <span className="text-xs text-foreground">Fullscreen</span>
            </button>

            <div className="w-px h-10 bg-border mx-1" />

            <div className="relative flex">
              <button
                onClick={handleToggleMute}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-l-[var(--radius)] hover:bg-secondary transition-colors ${
                  isMuted ? 'opacity-50' : 'text-foreground'
                }`}
              >
                {isMuted ? <IconMicrophoneOff /> : <IconMicrophone />}
                <span className="text-xs" style={{ fontWeight: !isMuted ? 'var(--font-weight-bold)' : 'normal' }}>
                  Mic
                </span>
              </button>
              <button
                onClick={() => setShowAudioDeviceMenu(!showAudioDeviceMenu)}
                className={`flex items-center justify-center px-2 py-2 rounded-r-[var(--radius)] hover:bg-secondary transition-colors ${
                  isMuted ? 'opacity-50' : 'text-foreground'
                }`}
                title="Select microphone"
              >
                <svg className="size-3.5" fill="none" viewBox="0 0 12 8">
                  <path d="M1 1.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {/* Audio Device Menu */}
              {showAudioDeviceMenu && (
                <div 
                  ref={audioDeviceMenuRef}
                  className="absolute top-full mt-2 left-0 w-80 bg-card border border-border rounded-[var(--radius)] overflow-hidden z-50"
                  style={{ boxShadow: 'var(--elevation-md)' }}
                >
                  {/* Speaker Section */}
                  <div className="px-4 py-3.5 border-b border-border">
                    <div className="text-xs text-muted mb-3" style={{ fontWeight: 'var(--font-weight-medium)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      Speaker
                    </div>
                    <div className="space-y-2">
                      {audioOutputDevices.length > 0 ? audioOutputDevices.map((device) => (
                        <label
                          key={device.deviceId}
                          className="flex items-center gap-3 cursor-pointer group p-2 -mx-2 rounded-[var(--radius)] hover:bg-secondary/50 transition-colors"
                        >
                          <input
                            type="radio"
                            name="audioOutput"
                            checked={selectedAudioOutputDevice === device.deviceId}
                            onChange={() => setSelectedAudioOutputDevice(device.deviceId)}
                            className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2 cursor-pointer shrink-0"
                            style={{ accentColor: 'var(--color-primary)' }}
                          />
                          <span className="text-sm text-foreground flex-1 truncate">
                            {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                          </span>
                        </label>
                      )) : (
                        <div className="text-sm text-muted py-1">No speakers detected</div>
                      )}
                    </div>
                    
                    {/* Volume Slider */}
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/50">
                      <svg className="size-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={audioVolume}
                        onChange={(e) => setAudioVolume(Number(e.target.value))}
                        className="flex-1 h-1.5 bg-secondary rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${audioVolume}%, var(--color-secondary) ${audioVolume}%, var(--color-secondary) 100%)`
                        }}
                      />
                      <span className="text-xs text-muted min-w-[2rem] text-right">{audioVolume}%</span>
                    </div>
                  </div>

                  {/* Microphone Section */}
                  <div className="px-4 py-3.5 border-b border-border">
                    <div className="text-xs text-muted mb-3" style={{ fontWeight: 'var(--font-weight-medium)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      Microphone
                    </div>
                    <div className="space-y-2">
                      {audioDevices.length > 0 ? audioDevices.map((device) => (
                        <label
                          key={device.deviceId}
                          className="flex items-center gap-3 cursor-pointer group p-2 -mx-2 rounded-[var(--radius)] hover:bg-secondary/50 transition-colors"
                        >
                          <input
                            type="radio"
                            name="audioInput"
                            checked={selectedAudioDevice === device.deviceId}
                            onChange={() => handleChangeAudioDevice(device.deviceId)}
                            className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2 cursor-pointer shrink-0"
                            style={{ accentColor: 'var(--color-primary)' }}
                          />
                          <span className="text-sm text-foreground flex-1 truncate">
                            {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                          </span>
                        </label>
                      )) : (
                        <div className="text-sm text-muted py-1">No microphones detected</div>
                      )}
                    </div>
                    
                    {/* Microphone Level Indicator */}
                    <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-border/50">
                      <svg className="size-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      <div className="flex gap-1 flex-1">
                        {Array.from({ length: 20 }).map((_, i) => {
                          const threshold = (i / 20) * 100;
                          const isActive = audioLevel > threshold;
                          return (
                            <div
                              key={i}
                              className="flex-1 h-6 rounded-sm transition-all"
                              style={{
                                backgroundColor: isActive 
                                  ? i < 14 ? 'var(--color-primary)' : '#ef4444'
                                  : 'var(--color-secondary)'
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Spatial Audio & Noise Suppression */}
                  <div className="px-4 py-3.5 border-b border-border space-y-3">
                    <label className="flex items-center justify-between cursor-pointer group p-2 -mx-2 rounded-[var(--radius)] hover:bg-secondary/50 transition-colors">
                      <span className="text-sm text-foreground">
                        Spatial audio
                      </span>
                      <button
                        onClick={() => setSpatialAudioEnabled(!spatialAudioEnabled)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          spatialAudioEnabled ? 'bg-primary' : 'bg-secondary'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            spatialAudioEnabled ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </label>
                    
                    <label className="flex items-center justify-between cursor-pointer group p-2 -mx-2 rounded-[var(--radius)] hover:bg-secondary/50 transition-colors">
                      <span className="text-sm text-foreground">
                        Noise suppression
                      </span>
                      <button
                        onClick={() => setNoiseSuppression(!noiseSuppression)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          noiseSuppression ? 'bg-primary' : 'bg-secondary'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            noiseSuppression ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="relative flex">
              <button
                onClick={handleToggleVideo}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-l-[var(--radius)] hover:bg-secondary transition-colors ${
                  isVideoOff ? 'opacity-50' : 'text-foreground'
                }`}
              >
                {isVideoOff ? <IconVideoOff /> : <IconVideo />}
                <span className="text-xs" style={{ fontWeight: !isVideoOff ? 'var(--font-weight-bold)' : 'normal' }}>
                  Camera
                </span>
              </button>
              <button
                onClick={() => setShowVideoDeviceMenu(!showVideoDeviceMenu)}
                className={`flex items-center justify-center px-2 py-2 rounded-r-[var(--radius)] hover:bg-secondary transition-colors ${
                  isVideoOff ? 'opacity-50' : 'text-foreground'
                }`}
                title="Select camera"
              >
                <svg className="size-3.5" fill="none" viewBox="0 0 12 8">
                  <path d="M1 1.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {/* Video Device Menu */}
              {showVideoDeviceMenu && (
                <div 
                  ref={videoDeviceMenuRef}
                  className="absolute top-full mt-2 left-0 w-80 bg-card border border-border rounded-[var(--radius)] overflow-hidden z-50"
                  style={{ boxShadow: 'var(--elevation-sm)' }}
                >
                  <div className="px-4 py-3">
                    <div className="text-xs text-muted mb-3" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      CAMERA
                    </div>
                    <div className="space-y-2">
                      {videoDevices.length > 0 ? videoDevices.map((device) => (
                        <label
                          key={device.deviceId}
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer group hover:bg-secondary/50 rounded-[var(--radius)] transition-colors"
                        >
                          <input
                            type="radio"
                            name="videoInput"
                            checked={selectedVideoDevice === device.deviceId}
                            onChange={() => handleChangeVideoDevice(device.deviceId)}
                            className="w-4 h-4 flex-shrink-0 cursor-pointer"
                            style={{ accentColor: 'var(--color-primary)' }}
                          />
                          <span className="text-sm text-foreground flex-1 group-hover:text-primary transition-colors">
                            {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                          </span>
                        </label>
                      )) : (
                        <div className="text-sm text-muted px-3 py-2">No cameras detected</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLeaveCall}
              className="flex items-center gap-2 px-5 py-2.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-[var(--radius)] transition-opacity ml-2"
              style={{ fontWeight: 'var(--font-weight-bold)' }}
            >
              <span className="text-sm">Leave</span>
            </button>
          </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Call Name Header - Hidden in landscape */}
            {!isLandscape && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-[var(--radius)]">
                  <Phone className="size-4 text-foreground" />
                </div>
                <div>
                  <h3 className="text-sm text-foreground truncate" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {currentMeeting.title}
                  </h3>
                  <div className="text-xs text-muted">
                    {Math.floor(callDuration / 3600) > 0 && `${Math.floor(callDuration / 3600)}:`}
                    {String(Math.floor((callDuration % 3600) / 60)).padStart(2, '0')}:
                    {String(callDuration % 60).padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* Right side controls */}
              <div className="flex items-center gap-2">
                {/* People button */}
                <button
                  onClick={() => setShowPeoplePanel(!showPeoplePanel)}
                  className={`p-2.5 rounded-[var(--radius)] transition-colors ${
                    showPeoplePanel ? 'bg-primary/10 text-primary' : 'hover:bg-secondary text-foreground'
                  }`}
                  title="People"
                >
                  <IconPeople />
                </button>

                {/* More menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="p-2.5 hover:bg-secondary rounded-[var(--radius)] transition-colors text-foreground"
                    title="More options"
                  >
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                    </svg>
                  </button>

                  {/* More menu dropdown */}
                  {showMoreMenu && (
                    <div 
                      ref={moreMenuRef}
                      className="absolute top-full mt-1 right-0 w-56 bg-card border border-border rounded-[var(--radius)] overflow-hidden z-50"
                      style={{ boxShadow: 'var(--elevation-sm)' }}
                    >
                      <button
                        onClick={() => {
                          setShowInviteModal(true);
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-3"
                      >
                        <IconInvite />
                        <span>Invite people</span>
                      </button>
                      <button
                        onClick={() => {
                          handleToggleCaptions();
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-3"
                      >
                        <IconCaptions />
                        <span>{captionsEnabled ? 'Disable captions' : 'Enable captions'}</span>
                      </button>
                      <button
                        onClick={() => {
                          toast.success('Recording started');
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-3"
                      >
                        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle cx="12" cy="12" r="3" strokeWidth={2} />
                          <circle cx="12" cy="12" r="9" strokeWidth={2} />
                        </svg>
                        <span>Start recording</span>
                      </button>
                      <button
                        onClick={() => {
                          handleToggleFullscreen();
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-3"
                      >
                        {isCallFullscreen ? (
                          <>
                            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                            </svg>
                            <span>Exit fullscreen</span>
                          </>
                        ) : (
                          <>
                            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                            </svg>
                            <span>Fullscreen</span>
                          </>
                        )}
                      </button>
                      {hostId === 'me' && (
                        <button
                          onClick={() => {
                            handleMuteAll();
                            setShowMoreMenu(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-3 border-t border-border"
                        >
                          <IconMicrophoneOff />
                          <span>Mute all</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* People Panel - LEFT SIDE */}
          {showPeoplePanel && (
            <div className="fixed md:relative inset-0 md:inset-auto w-full md:w-80 bg-card md:border-r border-border flex flex-col shrink-0 z-50 md:z-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                <div className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  People
                </div>
                <button
                  onClick={() => setShowPeoplePanel(false)}
                  className="p-1.5 hover:bg-secondary rounded-[var(--radius)] transition-colors"
                >
                  <svg className="block size-4" fill="none" viewBox="0 0 18 18">
                    <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Search */}
              <div className="px-4 py-3 border-b border-border shrink-0">
                <div className="bg-white border border-border rounded-[var(--radius)] px-3 py-2 flex items-center gap-2 focus-within:border-primary transition-colors">
                  <IconSearch />
                  <input
                    type="text"
                    placeholder="Search people..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
                  />
                </div>
              </div>

              {/* Participants List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* In this meeting */}
                <div className="py-2">
                  <button 
                    onClick={() => setCollapsedSections(prev => ({ ...prev, 'in-meeting': !prev['in-meeting'] }))}
                    className="flex items-center gap-2 px-4 py-2 w-full hover:bg-secondary/30 transition-colors"
                  >
                    <svg 
                      className={`size-3 shrink-0 text-muted transition-transform ${collapsedSections['in-meeting'] ? '' : 'rotate-90'}`} 
                      fill="none" 
                      viewBox="0 0 11 11"
                    >
                      <path d="M3 2l4 3.5L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="text-xs text-muted uppercase tracking-wide">
                      In this meeting ({connectedParticipants.length})
                    </div>
                  </button>

                  {!collapsedSections['in-meeting'] && (
                    <div className="space-y-0.5 px-2">
                      {connectedParticipants.map((participant) => (
                        <div 
                          key={participant.id}
                          onMouseEnter={() => setHoveredParticipantId(participant.id)}
                          onMouseLeave={() => setHoveredParticipantId(null)}
                          className="group flex items-center gap-3 px-2 py-2 hover:bg-secondary/50 rounded-[var(--radius)] transition-colors min-h-[40px] relative"
                        >
                          <MemberAvatar name={participant.name} size="md" color={participant.color} initials={participant.initial} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-foreground truncate">
                              {participant.name}
                            </div>
                            {participant.id === hostId && (
                              <div className="text-xs text-muted">Host</div>
                            )}
                          </div>

                          {/* Muted indicator */}
                          {!participant.audioEnabled && (
                            <div className="shrink-0 mr-1" title={participant.mutedByHost ? 'Muted by host (override)' : 'Muted'}>
                              <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24">
                                <path d="M15 9v3a3 3 0 1 1-6 0V9a3 3 0 0 1 6 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M5 10a7 7 0 0 0 14 0M12 19v2M8 21h8M19 4L5 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </div>
                          )}
                          
                          {/* Context menu button - always visible on mobile, hover-visible on desktop */}
                          <div className={`relative shrink-0 transition-opacity md:opacity-0 md:group-hover:opacity-100 ${hoveredParticipantId === participant.id || openMenuParticipantId === participant.id ? 'md:opacity-100' : ''}`}>
                              <button
                                className="p-1 hover:bg-card rounded-[var(--radius)] transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuParticipantId(openMenuParticipantId === participant.id ? null : participant.id);
                                }}
                              >
                                <IconMoreHorizontal />
                              </button>

                              {/* Context menu */}
                              {openMenuParticipantId === participant.id && (
                                <>
                                  {/* Backdrop to close menu */}
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setOpenMenuParticipantId(null)}
                                  />

                                  {/* Menu */}
                                  <div
                                    className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-[var(--radius)] shadow-lg z-50 py-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {/* Show different options based on whether I'm the host and if this is me */}
                                    {participant.id === 'me' ? (
                                      <>
                                        <button
                                          onClick={() => {
                                            setOpenMenuParticipantId(null);
                                            toast.success('Profile settings would open here');
                                          }}
                                          className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-secondary/50 transition-colors"
                                        >
                                          View Profile
                                        </button>
                                        <button
                                          onClick={() => {
                                            setOpenMenuParticipantId(null);
                                            toast.success('Settings would open here');
                                          }}
                                          className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-secondary/50 transition-colors"
                                        >
                                          Audio/Video Settings
                                        </button>
                                      </>
                                    ) : hostId === 'me' ? (
                                      <>
                                        {participant.audioEnabled ? (
                                          <button
                                            onClick={() => {
                                              handleMuteParticipant(participant.id);
                                              setOpenMenuParticipantId(null);
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-secondary/50 transition-colors"
                                          >
                                            Mute
                                          </button>
                                        ) : participant.mutedByHost ? (
                                          <button
                                            onClick={() => {
                                              handleUnmuteParticipant(participant.id);
                                              setOpenMenuParticipantId(null);
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-secondary/50 transition-colors"
                                          >
                                            Allow Unmute
                                          </button>
                                        ) : null}
                                        <button
                                          onClick={() => {
                                            setSpotlightedParticipantId(participant.id);
                                            setOpenMenuParticipantId(null);
                                            toast.success(`Spotlighted ${participant.name}`);
                                          }}
                                          className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-secondary/50 transition-colors"
                                        >
                                          Spotlight
                                        </button>
                                        <button
                                          onClick={() => {
                                            setHostId(participant.id);
                                            setOpenMenuParticipantId(null);
                                            toast.success(`${participant.name} is now the host`);
                                          }}
                                          className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-secondary/50 transition-colors"
                                        >
                                          Make Host
                                        </button>
                                        <div className="h-px bg-border my-1" />
                                        <button
                                          onClick={() => {
                                            setCallParticipants(prev => prev.filter(p => p.id !== participant.id));
                                            setOpenMenuParticipantId(null);
                                            toast.success(`${participant.name} was removed`);
                                          }}
                                          className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                        >
                                          Remove from call
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => {
                                            setOpenMenuParticipantId(null);
                                            toast.success(`Would open profile for ${participant.name}`);
                                          }}
                                          className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-secondary/50 transition-colors"
                                        >
                                          View Profile
                                        </button>
                                        <button
                                          onClick={() => {
                                            setOpenMenuParticipantId(null);
                                            toast.success(`Would send message to ${participant.name}`);
                                          }}
                                          className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-secondary/50 transition-colors"
                                        >
                                          Send Message
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </>
                              )}
                          </div>
                        </div>
                      ))}

                      {callingParticipants.map((participant) => (
                        <div 
                          key={participant.id}
                          className="flex items-center gap-3 px-2 py-2 min-h-[40px]"
                        >
                          <div className="animate-pulse">
                            <MemberAvatar name={participant.name} size="md" color={participant.color} initials={participant.initial} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-muted truncate">
                              {participant.name}
                            </div>
                            <div className="text-xs text-muted">Calling...</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Available */}
                <div className="py-2">
                  <button 
                    onClick={() => setCollapsedSections(prev => ({ ...prev, 'available': !prev['available'] }))}
                    className="flex items-center gap-2 px-4 py-2 w-full hover:bg-secondary/30 transition-colors"
                  >
                    <svg 
                      className={`size-3 shrink-0 text-muted transition-transform ${collapsedSections['available'] ? '' : 'rotate-90'}`} 
                      fill="none" 
                      viewBox="0 0 11 11"
                    >
                      <path d="M3 2l4 3.5L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="text-xs text-muted uppercase tracking-wide">
                      Available
                    </div>
                  </button>

                  {!collapsedSections['available'] && (
                    <div className="space-y-0.5 px-2">
                      {people
                        .filter(person => !callParticipants.some(p => p.id === person.id))
                        .filter(person => person.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((person) => (
                          <div 
                            key={person.id}
                            className="flex items-center gap-3 px-2 py-2 hover:bg-secondary/50 rounded-[var(--radius)] transition-colors group min-h-[40px]"
                          >
                            <MemberAvatar name={person.name} size="md" color={person.color} initials={person.initial} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-foreground truncate">
                                {person.name}
                              </div>
                            </div>
                            <button
                              onClick={() => handleInviteParticipant(person)}
                              className="text-xs text-primary hover:underline transition-opacity md:opacity-0 md:group-hover:opacity-100 shrink-0"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Video Area */}
          <div ref={videoAreaRef} className="flex-1 flex items-center justify-center p-3 md:p-8 overflow-hidden" style={{ userSelect: isDragging ? 'none' : 'auto' }}>
            <div className="w-full h-full flex items-center justify-center max-w-full max-h-full overflow-hidden">
              {spotlightedParticipantId || isMobile ? (
                // Spotlight Mode (always on mobile)
                <div className={`w-full h-full flex ${
                  isMobile ? (isLandscape ? 'flex-row gap-2' : 'flex-col gap-2') : videoLayout === 'sidebar' ? 'flex-row gap-4' : 'flex-col gap-4'
                } items-center justify-center max-w-full max-h-full overflow-hidden`}>
                  {(() => {
                    // On mobile, always spotlight the first participant if none is selected
                    const actualSpotlightId = spotlightedParticipantId || (isMobile && connectedParticipants.length > 0 ? connectedParticipants[0].id : null);
                    const spotlightedParticipant = connectedParticipants.find(p => p.id === actualSpotlightId);
                    const otherParticipants = connectedParticipants.filter(p => p.id !== actualSpotlightId);
                    if (!spotlightedParticipant) return null;

                    return (
                      <>
                        {/* Main spotlighted video */}
                        <div 
                          ref={drawingContainerRef}
                          className={`${
                            isMobile ? 'w-full flex-1 max-h-full' : videoLayout === 'sidebar' ? 'flex-1 aspect-video' : 'w-full max-w-[1400px] aspect-video'
                          } bg-[#2a2438] rounded-[var(--radius)] overflow-hidden shadow-2xl relative group transition-all ${
                            speakingParticipants.has(spotlightedParticipant.id) ? 'border-4 border-green-500' : 'border border-white/10'
                          }`}
                        >
                          {/* Video content for spotlighted participant */}
                          {frozenFrame ? (
                            <img src={frozenFrame} alt="Frozen frame" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              {spotlightedParticipant.id === 'me' ? (
                                isScreenSharing && screenStream ? (
                                  <video
                                    ref={screenVideoRefCb}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-contain bg-black"
                                  />
                                ) : isVideoOff ? (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="size-32 rounded-full bg-primary flex items-center justify-center text-white text-4xl mx-auto mb-4 border-4 border-white/20" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                        ME
                                      </div>
                                      <p className="text-white text-sm">Your camera is off</p>
                                    </div>
                                  </div>
                                ) : (
                                  <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                  />
                                )
                              ) : spotlightedParticipant.videoUrl ? (
                                <ImageWithFallback
                                  src={spotlightedParticipant.videoUrl}
                                  alt={spotlightedParticipant.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div 
                                    className="size-32 rounded-full flex items-center justify-center text-white text-4xl border-4 border-white/20" 
                                    style={{ backgroundColor: spotlightedParticipant.color, fontWeight: 'var(--font-weight-bold)' }}
                                  >
                                    {spotlightedParticipant.initial}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* Drawing canvas overlay */}
                          {isDrawingMode && (
                            <canvas
                              ref={canvasRef}
                              width={1400}
                              height={788}
                              className="absolute inset-0 w-full h-full"
                              style={{ cursor: 'crosshair' }}
                              onMouseDown={handleMouseDown}
                              onMouseMove={handleMouseMove}
                              onMouseUp={handleMouseUp}
                              onMouseLeave={handleMouseUp}
                            />
                          )}
                          
                          {/* Top Controls */}
                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            {/* Draw button */}
                            <button
                              onClick={() => {
                                setIsDrawingMode(!isDrawingMode);
                                if (isDrawingMode) {
                                  handleUnfreezeFrame();
                                }
                              }}
                              className={`px-2 py-1.5 backdrop-blur-sm rounded-[var(--radius)] transition-all md:opacity-0 md:group-hover:opacity-100 flex items-center gap-2 border ${
                                isDrawingMode
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-white/90 hover:bg-white text-black border-white/20'
                              }`}
                              title="Toggle drawing mode"
                            >
                              <IconPencil />
                              <span className="text-xs" style={{ fontWeight: 'var(--font-weight-bold)' }}>Draw</span>
                            </button>

                            {/* Spotlight controls - Hidden on mobile */}
                            {!isMobile && (
                              <>
                                <button
                                  onClick={() => {
                                    if (spotlightedParticipant) {
                                      const isCurrentlyForEveryone = spotlightedParticipant.spotlightedForEveryone;
                                      setCallParticipants(prev => 
                                        prev.map(p => ({
                                          ...p,
                                          spotlightedForEveryone: p.id === spotlightedParticipant.id ? !isCurrentlyForEveryone : false
                                        }))
                                      );
                                      toast.success(
                                        isCurrentlyForEveryone 
                                          ? `Spotlighted ${spotlightedParticipant.name} for you only`
                                          : `Spotlighted ${spotlightedParticipant.name} for everyone`
                                      );
                                    }
                                  }}
                                  className={`px-2 py-1.5 backdrop-blur-sm rounded-[var(--radius)] transition-all md:opacity-0 md:group-hover:opacity-100 flex items-center gap-2 border text-black ${
                                    spotlightedParticipant?.spotlightedForEveryone
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-white/90 hover:bg-white border-white/20'
                                  }`}
                                  title={spotlightedParticipant?.spotlightedForEveryone ? "Remove spotlight for everyone" : "Spotlight for everyone"}
                                >
                                  <IconSpotlight />
                                  <span className="text-xs" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                    {spotlightedParticipant?.spotlightedForEveryone ? 'For Everyone' : 'Spotlight for Everyone'}
                                  </span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSpotlightedParticipantId(null);
                                    setCallParticipants(prev => 
                                      prev.map(p => ({
                                        ...p,
                                        spotlightedForEveryone: false
                                      }))
                                    );
                                    handleUnfreezeFrame();
                                  }}
                                  className="px-2 py-1.5 bg-white/90 hover:bg-white backdrop-blur-sm rounded-[var(--radius)] transition-all md:opacity-0 md:group-hover:opacity-100 flex items-center gap-2 border border-white/20 text-black"
                                  title="Exit spotlight"
                                >
                                  <IconUnspotlight />
                                  <span className="text-xs" style={{ fontWeight: 'var(--font-weight-bold)' }}>Exit Spotlight</span>
                                </button>
                              </>
                            )}
                          </div>

                          {/* Drawing Controls - Only show when drawing mode is active */}
                          {isDrawingMode && (
                            <div className={`absolute top-3 left-3 right-3 ${isMobile ? 'flex-col gap-2' : 'flex-row gap-2'} flex items-stretch px-2 py-2 bg-white/95 backdrop-blur-sm rounded-[var(--radius)] border border-white/20 shadow-lg max-w-full overflow-x-auto`}>
                              {/* Tool selection */}
                              <div className={`flex items-center ${isMobile ? 'gap-0.5 flex-1 justify-between' : 'gap-1'}`}>
                                <button
                                  onClick={() => setDrawingTool('pen')}
                                  className={`${isMobile ? 'px-2 py-1 flex-1' : 'px-3 py-1.5'} text-xs rounded-[var(--radius-sm)] transition-colors flex items-center ${isMobile ? 'justify-center' : ''} gap-1.5 ${
                                    drawingTool === 'pen' ? 'bg-primary text-white' : 'text-black hover:bg-black/10'
                                  }`}
                                  style={{ fontWeight: 'var(--font-weight-bold)' }}
                                  title="Pen - freehand drawing"
                                >
                                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                  {!isMobile && 'Pen'}
                                </button>
                                <button
                                  onClick={() => setDrawingTool('label')}
                                  className={`${isMobile ? 'px-2 py-1 flex-1' : 'px-3 py-1.5'} text-xs rounded-[var(--radius-sm)] transition-colors flex items-center ${isMobile ? 'justify-center' : ''} gap-1.5 ${
                                    drawingTool === 'label' ? 'bg-primary text-white' : 'text-black hover:bg-black/10'
                                  }`}
                                  style={{ fontWeight: 'var(--font-weight-bold)' }}
                                  title="Label - click to add text"
                                >
                                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                  {!isMobile && 'Label'}
                                </button>
                                <button
                                  onClick={() => setDrawingTool('beacon')}
                                  className={`${isMobile ? 'px-2 py-1 flex-1' : 'px-3 py-1.5'} text-xs rounded-[var(--radius-sm)] transition-colors flex items-center ${isMobile ? 'justify-center' : ''} gap-1.5 ${
                                    drawingTool === 'beacon' ? 'bg-primary text-white' : 'text-black hover:bg-black/10'
                                  }`}
                                  style={{ fontWeight: 'var(--font-weight-bold)' }}
                                  title="Beacon - click to place circle marker"
                                >
                                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                                  </svg>
                                  {!isMobile && 'Beacon'}
                                </button>
                              </div>

                              {/* Divider */}
                              {!isMobile && <div className="w-px h-6 bg-black/20"></div>}

                              {/* Color picker */}
                              <div className={`flex items-center ${isMobile ? 'gap-1 flex-1 justify-between' : 'gap-1.5'}`}>
                                {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#ffffff'].map(color => (
                                  <button
                                    key={color}
                                    onClick={() => setDrawingColor(color)}
                                    className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} rounded-full border-2 transition-all hover:scale-110 ${
                                      drawingColor === color ? 'border-primary scale-110' : 'border-gray-300'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </div>

                              {/* Divider */}
                              {!isMobile && <div className="w-px h-6 bg-black/20"></div>}

                              {/* Action buttons */}
                              <div className={`flex items-center ${isMobile ? 'gap-1 flex-1 justify-between' : 'gap-1'}`}>
                                <button
                                  onClick={handleUndoDrawing}
                                  disabled={drawingPaths.length === 0}
                                  className={`${isMobile ? 'p-1' : 'p-1.5'} text-xs rounded-[var(--radius-sm)] text-black hover:bg-black/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
                                  title="Undo last"
                                >
                                  <IconUndo />
                                </button>
                                <button
                                  onClick={handleClearDrawing}
                                  disabled={drawingPaths.length === 0}
                                  className={`${isMobile ? 'p-1' : 'p-1.5'} text-xs rounded-[var(--radius-sm)] text-black hover:bg-black/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
                                  title="Clear all"
                                >
                                  <IconTrash />
                                </button>
                                {!isMobile && (
                                  <button
                                    onClick={() => toast.success('HD quality requested')}
                                    className="px-3 py-1.5 text-xs rounded-[var(--radius-sm)] bg-white/80 text-black hover:bg-white transition-colors flex items-center gap-1.5"
                                    style={{ fontWeight: 'var(--font-weight-bold)' }}
                                    title="Request HD quality"
                                  >
                                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Request HD
                                  </button>
                                )}
                                <button
                                  onClick={handleUnfreezeFrame}
                                  className={`${isMobile ? 'px-2 py-1 flex-1' : 'px-3 py-1.5'} text-xs rounded-[var(--radius-sm)] bg-white/80 text-black hover:bg-white transition-colors flex items-center ${isMobile ? 'justify-center' : ''} gap-1.5`}
                                  style={{ fontWeight: 'var(--font-weight-bold)' }}
                                  title="Unpause video"
                                >
                                  <IconPlay />
                                  {!isMobile && 'Unpause'}
                                </button>
                                {frozenFrame && (
                                  <button
                                    onClick={handleUnfreezeFrame}
                                    className={`${isMobile ? 'px-2 py-1 flex-1' : 'px-3 py-1.5'} text-xs rounded-[var(--radius-sm)] bg-primary text-white hover:bg-primary/90 transition-colors flex items-center ${isMobile ? 'justify-center' : ''} gap-1.5`}
                                    style={{ fontWeight: 'var(--font-weight-bold)' }}
                                    title="Unfreeze frame"
                                  >
                                    <IconPlay />
                                    {!isMobile && 'Unfreeze'}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Name label */}
                          <div className="absolute bottom-3 left-3 flex items-center gap-2">
                            <div className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-[var(--radius)] border border-white/10">
                              <span className="text-white text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                {spotlightedParticipant.name}
                              </span>
                            </div>
                            {spotlightedParticipant.spotlightedForEveryone && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary backdrop-blur-sm rounded-[var(--radius)] border border-primary-foreground/20">
                                <IconSpotlight className="text-white" />
                                <span className="text-primary-foreground text-xs" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                  Spotlighted for Everyone
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Screen Sharing Indicator */}
                          {spotlightedParticipant.id === 'me' && isScreenSharing && !isDrawingMode && (
                            <div className="absolute top-3 left-3 px-3 py-2 bg-primary/90 backdrop-blur-sm rounded-[var(--radius)] flex items-center gap-2">
                              <IconScreenShare />
                              <span className="text-white text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                Sharing screen
                              </span>
                            </div>
                          )}

                          {/* Captions Display */}
                          {captionsEnabled && (captionHistory.length > 0 || currentCaption) && (
                            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 max-w-[80%] flex flex-col gap-1 items-center">
                              {captionHistory.slice(-5).map((caption, index) => {
                                const opacity = 0.3 + (index / 4) * 0.7; // Fade from 0.3 to 1.0
                                return (
                                  <div 
                                    key={caption.id}
                                    className="px-4 py-2 bg-black/80 backdrop-blur-sm rounded-[var(--radius)] border border-white/20 transition-opacity duration-500"
                                    style={{ opacity }}
                                  >
                                    <p className="text-white text-sm text-center">{caption.text}</p>
                                  </div>
                                );
                              })}
                              {currentCaption && (
                                <div className="px-4 py-2 bg-black/80 backdrop-blur-sm rounded-[var(--radius)] border border-white/20">
                                  <p className="text-white text-sm text-center">{currentCaption}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Other participants row - Below spotlight */}
                        {otherParticipants.length === 1 ? (
                          // Single other participant - Draggable & Resizable overlay on desktop, fixed thumbnail on mobile
                          <div
                            ref={dragRef}
                            style={isMobile ? {} : {
                              position: 'absolute',
                              left: `${dragPosition.x}px`,
                              top: `${dragPosition.y}px`,
                              width: `${floatingVideoSize.width}px`,
                              height: `${floatingVideoSize.height}px`,
                              cursor: isDragging ? 'grabbing' : 'grab',
                              zIndex: 50,
                              userSelect: 'none'
                            }}
                            className={`${
                              isMobile 
                                ? 'w-32 aspect-video' 
                                : ''
                            } bg-[#2a2438] rounded-[var(--radius)] overflow-visible shadow-2xl relative group transition-all select-none ${
                              speakingParticipants.has(otherParticipants[0].id) ? 'border-4 border-green-500' : 'border-2 border-white/30'
                            }`}
                            onMouseDown={(e) => {
                              if (isMobile) return;
                              // Don't start drag if clicking on resize handle
                              if ((e.target as HTMLElement).classList.contains('resize-handle')) {
                                return;
                              }

                              e.preventDefault();
                              setIsDragging(true);

                              // Calculate offset from mouse position to top-left of element
                              const rect = dragRef.current?.getBoundingClientRect();
                              if (rect) {
                                dragOffsetRef.current = {
                                  x: e.clientX - rect.left,
                                  y: e.clientY - rect.top
                                };
                              }

                              let rafId = 0;
                              const handleMouseMove = (e: MouseEvent) => {
                                e.preventDefault();
                                cancelAnimationFrame(rafId);
                                rafId = requestAnimationFrame(() => {
                                  const videoArea = videoAreaRef.current?.getBoundingClientRect();
                                  const floatingRect = dragRef.current?.getBoundingClientRect();

                                  if (videoArea && floatingRect) {
                                    let newX = e.clientX - dragOffsetRef.current.x;
                                    let newY = e.clientY - dragOffsetRef.current.y;

                                    newX = Math.max(videoArea.left, Math.min(newX, videoArea.right - floatingRect.width));
                                    newY = Math.max(videoArea.top, Math.min(newY, videoArea.bottom - floatingRect.height));

                                    setDragPosition({ x: newX, y: newY });
                                  }
                                });
                              };

                              const handleMouseUp = () => {
                                cancelAnimationFrame(rafId);
                                setIsDragging(false);
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                              };

                              document.addEventListener('mousemove', handleMouseMove);
                              document.addEventListener('mouseup', handleMouseUp);
                            }}
                            onClick={() => {
                              if (isMobile) {
                                setSpotlightedParticipantId(otherParticipants[0].id);
                              }
                            }}
                          >
                            <div className="w-full h-full rounded-[var(--radius)] overflow-hidden">
                              {otherParticipants[0].id === 'me' ? (
                                localStream ? (
                                  <video
                                    ref={localVideoRefCb}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div 
                                      className="size-16 rounded-full bg-primary flex items-center justify-center text-white text-xl border-2 border-white/20" 
                                      style={{ fontWeight: 'var(--font-weight-bold)' }}
                                    >
                                      ME
                                    </div>
                                  </div>
                                )
                              ) : otherParticipants[0].videoUrl ? (
                                <ImageWithFallback
                                  src={otherParticipants[0].videoUrl}
                                  alt={otherParticipants[0].name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div 
                                    className="size-16 rounded-full flex items-center justify-center text-white text-xl border-2 border-white/20" 
                                    style={{ backgroundColor: otherParticipants[0].color, fontWeight: 'var(--font-weight-bold)' }}
                                  >
                                    {otherParticipants[0].initial}
                                  </div>
                                </div>
                              )}

                              {/* Spotlight button on overlay - Desktop only */}
                              {!isMobile && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSpotlightedParticipantId(otherParticipants[0].id);
                                  }}
                                  className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-white backdrop-blur-sm rounded transition-all md:opacity-0 md:group-hover:opacity-100 flex items-center gap-1.5 border border-white/20 text-black"
                                  title="Spotlight this video"
                                >
                                  <IconSpotlight />
                                  <span className="text-xs pr-0.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>Spotlight</span>
                                </button>
                              )}

                              {/* Name label with mute icon */}
                              <div className={`absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-sm rounded text-white border border-white/10 flex items-center gap-1 ${
                                isMobile ? 'px-1 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
                              }`} style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                <span className="truncate max-w-[60px]">{otherParticipants[0].name}</span>
                                {!otherParticipants[0].audioEnabled && (
                                  <svg className={isMobile ? 'size-2.5' : 'size-3.5'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M15 9v3a3 3 0 1 1-6 0V9a3 3 0 0 1 6 0Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M5 10a7 7 0 0 0 14 0M12 19v2M8 21h8M19 4L5 20" strokeWidth="2" strokeLinecap="round"/>
                                  </svg>
                                )}
                              </div>
                            </div>

                            {/* Resize Handle - Desktop only */}
                            {!isMobile && (
                              <div
                                className="resize-handle absolute top-0 left-0 w-6 h-6 cursor-nwse-resize md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                style={{ touchAction: 'none' }}
                                onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const startX = e.clientX;
                                const startY = e.clientY;
                                const startWidth = floatingVideoSize.width;
                                const startHeight = floatingVideoSize.height;
                                const startPosX = dragPosition.x;
                                const startPosY = dragPosition.y;
                                let rafId = 0;

                                const handleResize = (e: MouseEvent) => {
                                  e.preventDefault();
                                  cancelAnimationFrame(rafId);
                                  rafId = requestAnimationFrame(() => {
                                    const deltaX = e.clientX - startX;

                                    const newWidth = Math.max(160, Math.min(480, startWidth - deltaX));
                                    const newHeight = newWidth * (9 / 16);

                                    const widthDiff = startWidth - newWidth;
                                    const heightDiff = startHeight - newHeight;
                                    const newX = startPosX + widthDiff;
                                    const newY = startPosY + heightDiff;

                                    const videoArea = videoAreaRef.current?.getBoundingClientRect();

                                    if (videoArea) {
                                      if (newX >= videoArea.left &&
                                          newY >= videoArea.top &&
                                          newX + newWidth <= videoArea.right &&
                                          newY + newHeight <= videoArea.bottom) {
                                        setFloatingVideoSize({ width: newWidth, height: newHeight });
                                        setDragPosition({ x: newX, y: newY });
                                      }
                                    }
                                  });
                                };

                                const handleResizeEnd = () => {
                                  cancelAnimationFrame(rafId);
                                  document.removeEventListener('mousemove', handleResize);
                                  document.removeEventListener('mouseup', handleResizeEnd);
                                };

                                document.addEventListener('mousemove', handleResize);
                                document.addEventListener('mouseup', handleResizeEnd);
                              }}
                            >
                              <svg 
                                className="absolute top-0.5 left-0.5 text-white/70" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 16 16"
                              >
                                <path 
                                  d="M1 6L6 1M1 11L11 1" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                            )}
                          </div>
                        ) : otherParticipants.length > 1 ? (
                          // Multiple other participants - Sidebar or Bottom row based on layout
                          <div className="relative overflow-hidden" style={{
                            width: isMobile && isLandscape ? 'auto' : '100%',
                            height: isMobile && isLandscape ? '100%' : 'auto'
                          }}>
                            <div className={`${
                              isMobile 
                                ? (isLandscape ? 'h-full flex flex-col' : 'w-full')
                                : videoLayout === 'sidebar' 
                                  ? 'w-64 h-full flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2' 
                                  : 'w-full max-w-[1400px] flex justify-center'
                            }`}>
                              <div 
                                className={`${
                                  isMobile
                                    ? (isLandscape ? 'flex flex-col gap-2 overflow-y-auto pb-2 px-2 h-full hide-scrollbar select-none' : 'flex gap-2 overflow-x-auto pb-2 px-2 w-full hide-scrollbar select-none')
                                    : videoLayout === 'sidebar' 
                                      ? 'flex flex-col gap-2' 
                                      : 'flex gap-2 overflow-x-auto custom-scrollbar pb-2 px-2'
                                }`}
                              >
                                {otherParticipants.map((participant) => (
                              <div 
                                key={participant.id}
                                onClick={() => {
                                  if (isMobile) {
                                    setSpotlightedParticipantId(participant.id);
                                  }
                                }}
                                className={`${
                                  isMobile ? (isLandscape ? 'w-full cursor-pointer' : 'w-32 cursor-pointer') : videoLayout === 'sidebar' ? 'w-full' : 'w-48'
                                } aspect-video bg-[#2a2438] rounded-[var(--radius)] overflow-hidden shadow-xl relative group shrink-0 transition-all ${
                                  speakingParticipants.has(participant.id) ? 'border-4 border-green-500' : 'border-2 border-white/30'
                                }`}
                              >
                                {participant.id === 'me' ? (
                                  localStream ? (
                                    <video
                                      ref={localVideoRefCb}
                                      autoPlay
                                      muted
                                      playsInline
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <div 
                                        className="size-16 rounded-full bg-primary flex items-center justify-center text-white text-xl border-2 border-white/20" 
                                        style={{ fontWeight: 'var(--font-weight-bold)' }}
                                      >
                                        ME
                                      </div>
                                    </div>
                                  )
                                ) : participant.videoUrl ? (
                                  <ImageWithFallback
                                    src={participant.videoUrl}
                                    alt={participant.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div 
                                      className="size-16 rounded-full flex items-center justify-center text-white text-xl border-2 border-white/20" 
                                      style={{ backgroundColor: participant.color, fontWeight: 'var(--font-weight-bold)' }}
                                    >
                                      {participant.initial}
                                    </div>
                                  </div>
                                )}

                                {/* Spotlight button - Desktop only */}
                                {!isMobile && (
                                  <button
                                    onClick={() => setSpotlightedParticipantId(participant.id)}
                                    className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-white backdrop-blur-sm rounded transition-all flex items-center gap-1.5 border border-white/20 text-black md:opacity-0 md:group-hover:opacity-100"
                                    title="Spotlight this video"
                                  >
                                    <IconSpotlight />
                                    <span className="text-xs pr-0.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>Spotlight</span>
                                  </button>
                                )}

                                {/* Name label with mute icon */}
                                <div className={`absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-sm rounded text-white border border-white/10 flex items-center gap-1 ${
                                  isMobile ? 'px-1 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
                                }`} style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                  <span className={`truncate ${isMobile ? 'max-w-[60px]' : 'max-w-[120px]'}`}>{participant.name}</span>
                                  {!participant.audioEnabled && (
                                    <svg className={isMobile ? 'size-2.5' : 'size-3.5'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path d="M15 9v3a3 3 0 1 1-6 0V9a3 3 0 0 1 6 0Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M5 10a7 7 0 0 0 14 0M12 19v2M8 21h8M19 4L5 20" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                  )}
                                </div>
                              </div>
                            ))}
                            </div>
                            
                            {/* Layout Change Button - Desktop only */}
                            <button
                              onClick={() => {
                                const layouts: Array<'grid' | 'sidebar' | 'bottom'> = ['grid', 'sidebar', 'bottom'];
                                const currentIndex = layouts.indexOf(videoLayout);
                                const nextLayout = layouts[(currentIndex + 1) % layouts.length];
                                setVideoLayout(nextLayout);
                                const layoutNames = { grid: 'Grid View', sidebar: 'Sidebar View', bottom: 'Bottom View' };
                                toast.success(`Layout changed to ${layoutNames[nextLayout]}`);
                              }}
                              className={`hidden md:flex absolute ${
                                videoLayout === 'sidebar' 
                                  ? 'bottom-2 left-2' 
                                  : 'top-2 right-2'
                              } px-2 py-1 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded text-white text-xs border border-white/20 transition-colors items-center gap-1.5`}
                              style={{ fontWeight: 'var(--font-weight-bold)' }}
                              title="Change video layout"
                            >
                              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {videoLayout === 'sidebar' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM16 5a1 1 0 011-1h2a1 1 0 011 1v14a1 1 0 01-1 1h-2a1 1 0 01-1-1V5z" />
                                ) : videoLayout === 'bottom' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16M4 12h16M4 19h16" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                )}
                              </svg>
                              Layout
                            </button>
                          </div>
                          </div>
                        ) : null}
                      </>
                    );
                  })()}
                </div>
              ) : (
                // Grid Mode - All videos same size
                <div className="w-full max-w-[1400px] h-full flex items-center justify-center">
                  <div 
                    className="grid gap-2 md:gap-4 w-full"
                    style={{
                      gridTemplateColumns: !isMobile ? (
                        connectedParticipants.length === 1 ? '1fr' :
                        connectedParticipants.length === 2 ? 'repeat(2, 1fr)' :
                        connectedParticipants.length <= 4 ? 'repeat(2, 1fr)' :
                        connectedParticipants.length <= 6 ? 'repeat(3, 1fr)' :
                        'repeat(4, 1fr)'
                      ) : (
                        connectedParticipants.length === 1 ? '1fr' :
                        connectedParticipants.length <= 4 ? '1fr' :
                        'repeat(2, 1fr)'
                      )
                    }}
                  >
                    {connectedParticipants.map((participant) => (
                      <div 
                        key={participant.id} 
                        className={`aspect-video bg-[#2a2438] rounded-[var(--radius)] overflow-hidden shadow-lg relative group transition-all ${
                          speakingParticipants.has(participant.id) ? 'border-4 border-green-500' : 'border border-white/10'
                        }`}
                      >
                        {/* Video/Avatar Content */}
                        {participant.id === 'me' ? (
                          isScreenSharing && screenStream ? (
                            <video
                              ref={screenVideoRefCb}
                              autoPlay
                              muted
                              playsInline
                              className="w-full h-full object-contain bg-black"
                            />
                          ) : isVideoOff ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <div 
                                className="size-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl border-4 border-white/20" 
                                style={{ fontWeight: 'var(--font-weight-bold)' }}
                              >
                                ME
                              </div>
                            </div>
                          ) : (
                            <video
                              ref={localVideoRefCb}
                              autoPlay
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : participant.videoUrl ? (
                          <ImageWithFallback
                            src={participant.videoUrl}
                            alt={participant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div 
                              className="size-20 rounded-full flex items-center justify-center text-white text-2xl border-4 border-white/20" 
                              style={{ backgroundColor: participant.color, fontWeight: 'var(--font-weight-bold)' }}
                            >
                              {participant.initial}
                            </div>
                          </div>
                        )}

                        {/* Spotlight button - appears on hover, white background with text, hide if only 1 user */}
                        {connectedParticipants.length > 1 && (
                          <button
                            onClick={() => setSpotlightedParticipantId(participant.id)}
                            className="absolute top-2 right-2 px-2 py-1 bg-white/90 hover:bg-white backdrop-blur-sm rounded transition-all md:opacity-0 md:group-hover:opacity-100 flex items-center gap-1.5 border border-white/20 text-black"
                            title="Spotlight this video"
                          >
                            <IconSpotlight />
                            <span className="text-xs" style={{ fontWeight: 'var(--font-weight-bold)' }}>Spotlight</span>
                          </button>
                        )}

                        {/* Name label with mute icon */}
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-white text-xs border border-white/10 flex items-center gap-1.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                          {participant.name}
                          {!participant.audioEnabled && (
                            <svg className="size-3.5 text-white" fill="none" viewBox="0 0 24 24">
                              <path d="M15 9v3a3 3 0 1 1-6 0V9a3 3 0 0 1 6 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M5 10a7 7 0 0 0 14 0M12 19v2M8 21h8M19 4L5 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Captions Display - Grid mode */}
                  {captionsEnabled && (captionHistory.length > 0 || currentCaption) && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[80%] flex flex-col gap-1 items-center">
                      {captionHistory.map((caption, index) => {
                        const opacity = (index + 1) / captionHistory.length;
                        return (
                          <div 
                            key={caption.id}
                            className="px-4 py-2 bg-black/80 backdrop-blur-sm rounded-[var(--radius)] border border-white/20 transition-opacity duration-300"
                            style={{ opacity }}
                          >
                            <div className="flex items-start gap-2">
                              <div 
                                className="size-6 rounded-full bg-primary flex items-center justify-center text-white text-xs shrink-0 mt-0.5"
                                style={{ fontWeight: 'var(--font-weight-bold)' }}
                              >
                                {caption.speaker.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-white text-sm">{caption.text}</p>
                            </div>
                          </div>
                        );
                      })}
                      {currentCaption && (
                        <div className="px-4 py-2 bg-black/80 backdrop-blur-sm rounded-[var(--radius)] border border-white/20">
                          <div className="flex items-start gap-2">
                            <div 
                              className="size-6 rounded-full bg-primary flex items-center justify-center text-white text-xs shrink-0 mt-0.5 cursor-pointer group relative"
                              style={{ fontWeight: 'var(--font-weight-bold)' }}
                              title={captionSpeaker}
                            >
                              {captionSpeaker.charAt(0).toUpperCase()}
                              {/* Tooltip */}
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap md:opacity-0 md:group-hover:opacity-100 transition-opacity pointer-events-none">
                                {captionSpeaker}
                              </div>
                            </div>
                            <p className="text-white text-sm flex-1">{currentCaption}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Global Screen Sharing Indicator - only in grid mode when no one spotlighted */}
              {!spotlightedParticipantId && isScreenSharing && connectedParticipants.length === 1 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-2 bg-primary/90 backdrop-blur-sm rounded-[var(--radius)] flex items-center gap-2">
                  <IconScreenShare />
                  <span className="text-white text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    You are sharing your screen
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Chat Panel - RIGHT SIDE */}
          {showChatPanel && (
            <div 
              className="fixed md:relative inset-0 md:inset-auto w-full md:w-auto bg-card md:border-l border-border flex flex-col shrink-0 z-50 md:z-auto"
              style={{ width: !isMobile ? `${chatPanelWidth}px` : '100%' }}
            >
              {/* Resize Handle - Desktop only */}
              <div
                ref={chatResizeRef}
                onMouseDown={() => setIsResizingChat(true)}
                className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/50 transition-colors z-10 group hidden md:block"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-primary/30" />
              </div>

              {/* Header */}
              <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card">
                <h3 className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  Chat
                </h3>
                <button
                  onClick={() => setShowChatPanel(false)}
                  className="p-2.5 hover:bg-secondary rounded-[var(--radius)] transition-colors text-muted hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <svg className="block size-4" fill="none" viewBox="0 0 18 18">
                    <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="size-16 rounded-full bg-secondary/50 mx-auto mb-4 flex items-center justify-center">
                      <IconChat />
                    </div>
                    <p className="text-sm text-foreground mb-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      No messages yet
                    </p>
                    <p className="text-xs text-muted">Start the conversation with your team</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div key={message.id} className="flex gap-3 group">
                        <div className="shrink-0 mt-0.5">
                          <MemberAvatar name={message.sender} size="xl" color={message.senderColor} initials={message.senderInitial} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1.5">
                            <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                              {message.sender}
                            </span>
                            <span className="text-xs text-muted">
                              {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="bg-secondary/40 rounded-lg rounded-tl-sm px-3.5 py-2.5 shadow-sm border border-border/50 hover:border-border transition-colors">
                            {message.text && (
                              <p className="text-sm text-foreground break-words leading-relaxed whitespace-pre-wrap">{message.text}</p>
                            )}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className={`flex flex-col gap-2 ${message.text ? 'mt-2.5' : ''}`}>
                                {message.attachments.map((attachment) => (
                                  <button
                                    key={attachment.id}
                                    onClick={() => {
                                      toast.success(`Opening ${attachment.name}`);
                                    }}
                                    className="flex items-center gap-2.5 p-2.5 bg-card border border-border rounded-[var(--radius)] hover:bg-secondary hover:border-primary/30 transition-all text-left group/attachment shadow-sm"
                                  >
                                    <div className="size-8 bg-primary/10 rounded-[var(--radius)] flex items-center justify-center shrink-0 group-hover/attachment:bg-primary/20 transition-colors">
                                      <FileText size={16} className="text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-foreground truncate group-hover/attachment:text-primary transition-colors" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                        {attachment.name}
                                      </p>
                                      <p className="text-xs text-muted truncate">{attachment.projectName}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="px-4 py-4 border-t border-border shrink-0 bg-card">
                {/* Selected Attachments Preview */}
                {selectedAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedAttachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-[var(--radius)] text-xs group/chip hover:bg-primary/15 transition-colors"
                      >
                        <FileText size={14} className="text-primary shrink-0" />
                        <span className="text-foreground truncate max-w-[150px]" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                          {attachment.name}
                        </span>
                        <button
                          onClick={() => setSelectedAttachments(prev => prev.filter(a => a.id !== attachment.id))}
                          className="text-muted hover:text-foreground transition-colors ml-1 hover:bg-secondary/50 rounded size-4 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => {
                      setChatInput(e.target.value);
                      // Auto-resize textarea
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 bg-input-background border border-border rounded-[var(--radius)] px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted resize-none overflow-y-auto custom-scrollbar shadow-sm"
                    style={{ minHeight: '44px', maxHeight: '200px' }}
                    rows={1}
                  />
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setShowAttachmentPicker(true)}
                      className="h-[44px] w-[44px] flex items-center justify-center bg-card border border-border rounded-[var(--radius)] hover:bg-secondary hover:border-primary/30 transition-all shrink-0 text-muted hover:text-primary shadow-sm"
                      title="Attach knowledge base item"
                    >
                      <Paperclip size={18} />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() && selectedAttachments.length === 0}
                      className="h-[44px] px-5 flex items-center justify-center bg-primary text-primary-foreground rounded-[var(--radius)] hover:bg-primary/90 transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm disabled:shadow-none"
                    >
                      <IconSend />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Action Bar */}
        <div className="md:hidden border-t border-border bg-card shrink-0">
          <div className="flex items-center justify-around px-3 py-3 gap-2">
            {/* Mic Button */}
            <button
              onClick={handleToggleMute}
              className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-[var(--radius)] bg-secondary hover:bg-secondary/80 transition-colors flex-1 text-foreground"
            >
              {isMuted ? <IconMicrophoneOff /> : <IconMicrophone />}
              <span className="text-[10px]" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Mic
              </span>
            </button>

            {/* Camera Button */}
            <button
              onClick={handleToggleVideo}
              className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-[var(--radius)] bg-secondary hover:bg-secondary/80 transition-colors flex-1 text-foreground"
            >
              {isVideoOff ? <IconVideoOff /> : <IconVideo />}
              <span className="text-[10px]" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Camera
              </span>
            </button>

            {/* Chat Button */}
            <button
              onClick={() => {
                setShowChatPanel(!showChatPanel);
                if (!showChatPanel) {
                  setUnreadMessagesCount(0);
                }
              }}
              className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-[var(--radius)] transition-colors flex-1 relative ${
                showChatPanel ? 'bg-primary/10 text-primary' : 'bg-secondary hover:bg-secondary/80 text-foreground'
              }`}
            >
              <IconChat />
              <span className="text-[10px]" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Chat
              </span>
              {unreadMessagesCount > 0 && !showChatPanel && (
                <div className="absolute top-1.5 right-1.5 size-4 bg-destructive rounded-full flex items-center justify-center text-white text-[9px]" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {unreadMessagesCount}
                </div>
              )}
            </button>

            {/* Leave Call - Phone Hangup Icon */}
            <button
              onClick={handleLeaveCall}
              className="flex flex-col items-center gap-1.5 px-3 py-2.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-[var(--radius)] transition-opacity flex-1"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
              </svg>
              <span className="text-[10px]" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Leave
              </span>
            </button>
          </div>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInviteModal(false)}>
            <div 
              className="bg-card rounded-lg w-full max-w-[480px] flex flex-col border border-border overflow-hidden max-h-[80vh]"
              style={{ boxShadow: 'var(--elevation-md)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-card border-b border-border flex items-center justify-between px-5 py-4 shrink-0">
                <div>
                  <div className="text-base text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    Invite people
                  </div>
                  <div className="text-sm text-muted mt-0.5">
                    Share this meeting with others
                  </div>
                </div>
                <button 
                  onClick={() => setShowInviteModal(false)} 
                  className="p-1.5 hover:bg-secondary rounded-[var(--radius)] transition-colors shrink-0"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 18 18">
                    <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Share Options */}
                <div className="p-5 space-y-3 border-b border-border">
                  {/* Copy meeting link */}
                  <button 
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(window.location.href);
                        toast.success('Meeting link copied to clipboard');
                      } catch (err) {
                        // Fallback: Create a temporary input element
                        const textArea = document.createElement('textarea');
                        textArea.value = window.location.href;
                        textArea.style.position = 'fixed';
                        textArea.style.left = '-999999px';
                        textArea.style.top = '-999999px';
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        try {
                          document.execCommand('copy');
                          toast.success('Meeting link copied to clipboard');
                        } catch (error) {
                          toast.error('Unable to copy to clipboard');
                        }
                        textArea.remove();
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors group"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <svg className="size-5 text-primary" fill="none" viewBox="0 0 11.3333 13.3333">
                        <path d="M4 10.6667C3.63333 10.6667 3.31944 10.5361 3.05833 10.275C2.79722 10.0139 2.66667 9.7 2.66667 9.33333V1.33333C2.66667 0.966667 2.79722 0.652778 3.05833 0.391667C3.31944 0.130556 3.63333 0 4 0H10C10.3667 0 10.6806 0.130556 10.9417 0.391667C11.2028 0.652778 11.3333 0.966667 11.3333 1.33333V9.33333C11.3333 9.7 11.2028 10.0139 10.9417 10.275C10.6806 10.5361 10.3667 10.6667 10 10.6667H4ZM4 9.33333H10V1.33333H4V9.33333ZM1.33333 13.3333C0.966667 13.3333 0.652778 13.2028 0.391667 12.9417C0.130556 12.6806 0 12.3667 0 12V2.66667H1.33333V12H8.66667V13.3333H1.33333Z" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                        Copy meeting link
                      </div>
                      <div className="text-xs text-muted">
                        Share the link with anyone
                      </div>
                    </div>
                    <svg className="size-4 text-muted group-hover:text-foreground transition-colors" fill="none" viewBox="0 0 16 16">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {/* Share via email */}
                  <button 
                    onClick={() => {
                      const subject = encodeURIComponent('Join my meeting');
                      const body = encodeURIComponent(`Join my meeting: ${window.location.href}`);
                      window.location.href = `mailto:?subject=${subject}&body=${body}`;
                      toast.success('Opening email client...');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors group"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <svg className="size-5 text-primary" fill="none" viewBox="0 0 12.6667 10.6667">
                        <path d="M0 10.6667V0L12.6667 5.33333L0 10.6667ZM1.33333 8.66667L9.23333 5.33333L1.33333 2V4.33333L5.33333 5.33333L1.33333 6.33333V8.66667ZM1.33333 8.66667V2V6.33333V8.66667Z" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                        Share via email
                      </div>
                      <div className="text-xs text-muted">
                        Send invitation via email
                      </div>
                    </div>
                    <svg className="size-4 text-muted group-hover:text-foreground transition-colors" fill="none" viewBox="0 0 16 16">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {/* Invite by Device ID */}
                  <button 
                    onClick={() => {
                      setShowInviteModal(false);
                      setShowInviteDeviceModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors group"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                        Invite by Device ID
                      </div>
                      <div className="text-xs text-muted">
                        Call a device using its ID
                      </div>
                    </div>
                    <svg className="size-4 text-muted group-hover:text-foreground transition-colors" fill="none" viewBox="0 0 16 16">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                {/* Call Details */}
                <div className="px-5 py-4 border-b border-border space-y-3">
                  <div className="text-sm text-foreground mb-3" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    Call Details
                  </div>
                  
                  {/* Call ID */}
                  <div className="space-y-1.5">
                    <div className="text-xs text-muted">Call ID</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-secondary/30 rounded-[var(--radius)] text-sm text-foreground font-mono">
                        {callId}
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(callId);
                            toast.success('Call ID copied');
                          } catch (err) {
                            const textArea = document.createElement('textarea');
                            textArea.value = callId;
                            textArea.style.position = 'fixed';
                            textArea.style.left = '-999999px';
                            document.body.appendChild(textArea);
                            textArea.select();
                            try {
                              document.execCommand('copy');
                              toast.success('Call ID copied');
                            } catch (error) {
                              toast.error('Unable to copy');
                            }
                            textArea.remove();
                          }
                        }}
                        className="p-2 hover:bg-secondary rounded-[var(--radius)] transition-colors"
                        title="Copy Call ID"
                      >
                        <svg className="size-4 text-muted" fill="none" viewBox="0 0 11.3333 13.3333">
                          <path d="M4 10.6667C3.63333 10.6667 3.31944 10.5361 3.05833 10.275C2.79722 10.0139 2.66667 9.7 2.66667 9.33333V1.33333C2.66667 0.966667 2.79722 0.652778 3.05833 0.391667C3.31944 0.130556 3.63333 0 4 0H10C10.3667 0 10.6806 0.130556 10.9417 0.391667C11.2028 0.652778 11.3333 0.966667 11.3333 1.33333V9.33333C11.3333 9.7 11.2028 10.0139 10.9417 10.275C10.6806 10.5361 10.3667 10.6667 10 10.6667H4ZM4 9.33333H10V1.33333H4V9.33333ZM1.33333 13.3333C0.966667 13.3333 0.652778 13.2028 0.391667 12.9417C0.130556 12.6806 0 12.3667 0 12V2.66667H1.33333V12H8.66667V13.3333H1.33333Z" fill="currentColor" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Call Password */}
                  <div className="space-y-1.5">
                    <div className="text-xs text-muted">Password</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-secondary/30 rounded-[var(--radius)] text-sm text-foreground font-mono">
                        {callPassword}
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(callPassword);
                            toast.success('Password copied');
                          } catch (err) {
                            const textArea = document.createElement('textarea');
                            textArea.value = callPassword;
                            textArea.style.position = 'fixed';
                            textArea.style.left = '-999999px';
                            document.body.appendChild(textArea);
                            textArea.select();
                            try {
                              document.execCommand('copy');
                              toast.success('Password copied');
                            } catch (error) {
                              toast.error('Unable to copy');
                            }
                            textArea.remove();
                          }
                        }}
                        className="p-2 hover:bg-secondary rounded-[var(--radius)] transition-colors"
                        title="Copy Password"
                      >
                        <svg className="size-4 text-muted" fill="none" viewBox="0 0 11.3333 13.3333">
                          <path d="M4 10.6667C3.63333 10.6667 3.31944 10.5361 3.05833 10.275C2.79722 10.0139 2.66667 9.7 2.66667 9.33333V1.33333C2.66667 0.966667 2.79722 0.652778 3.05833 0.391667C3.31944 0.130556 3.63333 0 4 0H10C10.3667 0 10.6806 0.130556 10.9417 0.391667C11.2028 0.652778 11.3333 0.966667 11.3333 1.33333V9.33333C11.3333 9.7 11.2028 10.0139 10.9417 10.275C10.6806 10.5361 10.3667 10.6667 10 10.6667H4ZM4 9.33333H10V1.33333H4V9.33333ZM1.33333 13.3333C0.966667 13.3333 0.652778 13.2028 0.391667 12.9417C0.130556 12.6806 0 12.3667 0 12V2.66667H1.33333V12H8.66667V13.3333H1.33333Z" fill="currentColor" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Available People */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      Available people
                    </div>
                    <div className="text-xs text-muted">
                      ({availablePeople.length})
                    </div>
                  </div>
                  
                  {availablePeople.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="size-12 rounded-full bg-secondary/50 mx-auto mb-3 flex items-center justify-center">
                        <svg className="size-6 text-muted" fill="none" viewBox="0 0 16 16">
                          <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M3 13c0-2.5 2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <p className="text-sm text-muted">No one available to invite</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {availablePeople.map((person) => (
                        <div
                          key={person.id}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/50 rounded-lg transition-colors group"
                        >
                          <MemberAvatar name={person.name} size="xl" color={person.color} initials={person.initial} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-foreground truncate">
                              {person.name}
                            </div>
                            {person.subWorkspace && (
                              <div className="text-xs text-muted truncate">{person.subWorkspace}</div>
                            )}
                          </div>
                          <button
                            onClick={() => handleInviteParticipant(person)}
                            className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-xs hover:opacity-90 transition-opacity shrink-0"
                            style={{ fontWeight: 'var(--font-weight-bold)' }}
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audio & Video Settings Modal */}
        {showAudioSettingsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAudioSettingsModal(false)}>
            <div 
              className="bg-card rounded-lg w-full max-w-[360px] flex flex-col border border-border overflow-hidden"
              style={{ boxShadow: 'var(--elevation-md)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-card border-b border-border flex items-center justify-between px-5 py-4 shrink-0">
                <div className="text-base text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  Audio & Video Settings
                </div>
                <button 
                  onClick={() => setShowAudioSettingsModal(false)} 
                  className="p-1.5 hover:bg-secondary rounded-[var(--radius)] transition-colors shrink-0"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 18 18">
                    <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[600px] custom-scrollbar">
                {/* Speaker Section */}
                <div className="px-5 py-4 border-b border-border">
                  <div className="text-sm text-foreground mb-3" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    Speaker
                  </div>
                  <div className="space-y-2">
                    {audioOutputDevices.map((device) => (
                      <label
                        key={device.deviceId}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name="audioOutput"
                          checked={selectedAudioOutputDevice === device.deviceId}
                          onChange={() => handleChangeAudioOutputDevice(device.deviceId)}
                          className="size-4 text-primary accent-primary"
                        />
                        <span className="text-sm text-foreground flex-1">
                          {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Volume Slider */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <svg className="size-4 text-muted" fill="none" viewBox="0 0 20 20">
                        <path d="M10 4l-4 4H2v4h4l4 4V4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 7a4 4 0 010 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={audioVolume}
                        onChange={(e) => setAudioVolume(Number(e.target.value))}
                        className="flex-1 h-1.5 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                        style={{
                          background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${audioVolume}%, var(--color-secondary) ${audioVolume}%, var(--color-secondary) 100%)`
                        }}
                      />
                      <svg className="size-4 text-muted" fill="none" viewBox="0 0 20 20">
                        <path d="M10 4l-4 4H2v4h4l4 4V4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 7a4 4 0 010 6M16.5 5a7 7 0 010 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Microphone Section */}
                <div className="px-5 py-4 border-b border-border">
                  <div className="text-sm text-foreground mb-3" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    Microphone
                  </div>
                  <div className="space-y-2">
                    {audioDevices.map((device) => (
                      <label
                        key={device.deviceId}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name="audioInput"
                          checked={selectedAudioDevice === device.deviceId}
                          onChange={() => handleChangeAudioDevice(device.deviceId)}
                          className="size-4 text-primary accent-primary"
                        />
                        <span className="text-sm text-foreground flex-1">
                          {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Audio Level Indicator */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <svg className="size-4 text-muted" fill="none" viewBox="0 0 20 20">
                        <rect x="8" y="4" width="4" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M5 10h10M8 16c0 1.5 1 2 2 2s2-.5 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <div className="flex-1 flex items-center gap-0.5 h-5">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div
                            key={i}
                            className={`flex-1 h-full rounded-sm transition-all ${
                              (audioLevel / 5) > i ? 'bg-primary' : 'bg-secondary'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spatial Audio Toggle */}
                <div className="px-5 py-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      Spatial audio
                    </div>
                    <button
                      onClick={() => {
                        setSpatialAudioEnabled(!spatialAudioEnabled);
                        toast.success(`Spatial audio ${!spatialAudioEnabled ? 'enabled' : 'disabled'}`);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        spatialAudioEnabled ? 'bg-primary' : 'bg-secondary'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          spatialAudioEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Noise Suppression Toggle */}
                <div className="px-5 py-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      Noise suppression
                    </div>
                    <button
                      onClick={() => {
                        setNoiseSuppressionEnabled(!noiseSuppressionEnabled);
                        toast.success(`Noise suppression ${!noiseSuppressionEnabled ? 'enabled' : 'disabled'}`);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        noiseSuppressionEnabled ? 'bg-primary' : 'bg-secondary'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          noiseSuppressionEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* More Audio Settings */}
                <div className="px-5 py-4">
                  <button
                    onClick={() => {
                      toast.success('Opening advanced settings...');
                    }}
                    className="text-sm text-primary hover:underline"
                    style={{ fontWeight: 'var(--font-weight-medium)' }}
                  >
                    More audio settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Connection error state
  if (connectionError) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="p-5 bg-destructive/10 rounded-full mb-4">
            <AlertTriangle size={36} className="text-destructive" />
          </div>
          <h3 className="text-base text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
            Connection failed
          </h3>
          <p className="text-sm text-muted mb-6">
            Unable to connect to the remote support service. Please check your internet connection and try again.
          </p>
          <button
            onClick={() => setConnectionError(false)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-[var(--radius)] hover:opacity-90 transition-opacity"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            <RefreshCw size={16} />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Meetings List View
  return (
    <div className={`h-full ${isMobile ? 'flex flex-col' : 'flex'} bg-background`}>
      {/* Mobile People Panel Overlay */}
      {isMobile && showMobilePeople && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowMobilePeople(false)}
        />
      )}

      {/* Left Panel - People */}
      <div className={`${
        isMobile 
          ? `fixed top-0 left-0 h-full w-[280px] z-50 transition-transform duration-300 ${
              showMobilePeople ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'w-[280px] shrink-0'
      } bg-card border-r border-border flex flex-col`}>
        {/* Header */}
        <div className="h-16 border-b border-border flex items-center px-4 shrink-0">
          <div className="flex items-center gap-2">
            <svg className="block size-4" fill="none" viewBox="0 0 16 16">
              <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M2 14c0-2.5 2.5-4 6-4s6 1.5 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <h3 className="text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              People
            </h3>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border shrink-0">
          <div className="bg-input-background border border-border rounded-[var(--radius)] px-3 py-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
            />
            <IconSearch />
          </div>
        </div>

        {/* People List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {people.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((person) => {
            // 20% of users have sub-workspace
            const showSubWorkspace = person.subWorkspace;
            
            return (
              <div 
                key={person.id}
                onMouseEnter={() => setHoveredPersonId(person.id)}
                onMouseLeave={() => setHoveredPersonId(null)}
                className="group flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors border-b border-border"
              >
                <MemberAvatar name={person.name} size="lg" color={person.color} initials={person.initial} />
                <div className="flex-1 text-sm text-foreground truncate">
                  {person.name}
                </div>
                <div className="ml-auto shrink-0 flex items-center gap-2">
                  {showSubWorkspace && (
                    <div className={`px-2 py-0.5 bg-secondary border border-border rounded-[var(--radius)] text-xs text-muted hidden md:block ${hoveredPersonId === person.id ? 'md:hidden' : ''}`}>
                      {person.subWorkspace}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      const newMeeting: Meeting = {
                        id: Date.now().toString(),
                        title: `Call with ${person.name}`,
                        participants: [person],
                        scheduledTime: new Date(),
                        duration: 30,
                        hostId: '1'
                      };
                      setCurrentMeeting(newMeeting);
                      setShowPreJoin(true);
                    }}
                    className={`px-2.5 py-1 bg-secondary hover:bg-secondary/80 text-foreground rounded-[var(--radius)] transition-all flex items-center gap-1.5 md:opacity-0 md:group-hover:opacity-100 ${hoveredPersonId === person.id ? 'md:opacity-100' : ''}`}
                    title="Call"
                  >
                    <Phone className="size-4" />
                    <span className="text-xs">
                      Call
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel - Meetings */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with Tabs */}
        <div className={`bg-card border-b border-border shrink-0`}>
          {/* Desktop Layout */}
          <div className={`hidden md:flex h-16 items-center justify-between ${isMobile ? 'px-4' : 'px-6'}`}>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab('agenda')}
                className={`flex items-center gap-2 pb-0.5 border-b-2 transition-colors ${
                  activeTab === 'agenda' 
                    ? 'border-primary text-foreground' 
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
                style={{ fontFamily: 'var(--font-family)' }}
              >
                <svg className="block size-4 text-foreground" fill="none" viewBox="0 0 16 16">
                  <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M2 6h12" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={{ fontWeight: activeTab === 'agenda' ? 'var(--font-weight-bold)' : 'normal' }}>
                  Agenda
                </span>
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`flex items-center gap-2 pb-0.5 border-b-2 transition-colors ${
                  activeTab === 'recent' 
                    ? 'border-primary text-foreground' 
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
                style={{ fontFamily: 'var(--font-family)' }}
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ fontWeight: activeTab === 'recent' ? 'var(--font-weight-bold)' : 'normal' }}>
                  Recent Calls
                </span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              {/* Call Device Button */}
              <button
                onClick={() => setShowCallDeviceModal(true)}
                className="px-4 py-2 bg-card border border-border text-foreground rounded-[var(--radius)] hover:bg-secondary transition-colors flex items-center gap-2"
                style={{ fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}
              >
                <Phone className="size-4" />
                <span>Call Device</span>
              </button>

              {/* Join Meeting Button */}
              <button
                onClick={() => setShowJoinMeetingModal(true)}
                className="px-4 py-2 bg-card border border-border text-foreground rounded-[var(--radius)] hover:bg-secondary transition-colors flex items-center gap-2"
                style={{ fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}
              >
                <Video className="size-4" />
                <span>Join Meeting</span>
              </button>

              {/* Create Button with Schedule split */}
              <div className="relative">
                <div className="flex items-stretch h-9 rounded-[var(--radius)] overflow-hidden">
                  <button
                    ref={createButtonRef}
                    onClick={() => setShowCreateMenu(!showCreateMenu)}
                    className="px-4 bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center"
                    style={{ fontWeight: 'var(--font-weight-bold)' }}
                  >
                    Create meeting
                  </button>
                  {canScheduleMeeting && (
                    <button
                      onClick={() => openScheduleModal(true)}
                      className="w-9 bg-primary text-primary-foreground border-l border-white/20 hover:bg-primary/80 transition-colors flex items-center justify-center"
                      title="Schedule for later"
                    >
                      <Calendar size={15} />
                    </button>
                  )}
                </div>
                <CreateMeetingMenu
                  isOpen={showCreateMenu}
                  onClose={() => setShowCreateMenu(false)}
                  onScheduleForLater={() => {
                    setShowCreateMenu(false);
                    openScheduleModal(true);
                  }}
                  onStartNow={handleStartMeetingNow}
                  buttonRef={createButtonRef}
                  meetingTitle={meetingTitle}
                  onMeetingTitleChange={setMeetingTitle}
                  canScheduleMeeting={false}
                  canStartCall={canStartCall}
                />
              </div>
            </div>
          </div>

          {/* Mobile Layout - Two Lines */}
          <div className="md:hidden">
            {/* First Line: Tabs */}
            <div className="h-14 flex items-center px-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMobilePeople(true)}
                  className="p-2 -ml-2 hover:bg-secondary rounded-[var(--radius)] transition-colors"
                >
                  <svg className="block size-5" fill="none" viewBox="0 0 20 20">
                    <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M1 17c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="14" cy="6" r="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M15 12c2 0 4 1.5 4 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveTab('agenda')}
                    className={`flex items-center gap-2 pb-0.5 border-b-2 transition-colors ${
                      activeTab === 'agenda' 
                        ? 'border-primary text-foreground' 
                        : 'border-transparent text-muted hover:text-foreground'
                    }`}
                    style={{ fontFamily: 'var(--font-family)' }}
                  >
                    <svg className="block size-4 text-foreground" fill="none" viewBox="0 0 16 16">
                      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      <path d="M2 6h12" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span className="text-sm" style={{ fontWeight: activeTab === 'agenda' ? 'var(--font-weight-bold)' : 'normal' }}>
                      Agenda
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('recent')}
                    className={`flex items-center gap-2 pb-0.5 border-b-2 transition-colors ${
                      activeTab === 'recent' 
                        ? 'border-primary text-foreground' 
                        : 'border-transparent text-muted hover:text-foreground'
                    }`}
                    style={{ fontFamily: 'var(--font-family)' }}
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm" style={{ fontWeight: activeTab === 'recent' ? 'var(--font-weight-bold)' : 'normal' }}>
                      Recent
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ScheduleMeetingModal
          isOpen={showScheduleModal}
          onClose={() => {
            openScheduleModal(false);
            setEditingMeeting(null);
          }}
          onSchedule={handleScheduleMeeting}
          onUpdate={handleUpdateMeeting}
          people={people}
          initialTitle={meetingTitle}
          editingMeeting={editingMeeting || undefined}
        />

        {/* Call Device Modal */}
        {showCallDeviceModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCallDeviceModal(false)}
          >
            <div
              className="bg-card border border-border rounded-[var(--radius)] p-6 max-w-[480px] w-full"
              onClick={(e) => e.stopPropagation()}
              style={{ boxShadow: 'var(--elevation-sm)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3
                  className="text-foreground"
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  Call Device
                </h3>
                <button
                  onClick={() => setShowCallDeviceModal(false)}
                  className="p-1.5 hover:bg-secondary rounded-[var(--radius)] transition-colors"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 18 18">
                    <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              <p
                className="mb-5 text-muted"
                style={{
                  fontSize: 'var(--text-sm)',
                }}
              >
                Enter the 9-digit device ID to initiate a remote support call
              </p>

              <div className="mb-6">
                <label
                  className="block mb-2 text-foreground"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  Device ID
                </label>
                <input
                  type="text"
                  value={deviceId}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                    setDeviceId(value);
                  }}
                  placeholder="123456789"
                  className="w-full px-4 py-3 bg-background border border-border rounded-[var(--radius)] outline-none focus:border-primary transition-colors"
                  style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-family)',
                    letterSpacing: '0.15em',
                  }}
                  maxLength={9}
                  autoFocus
                />
                <div className="flex items-center justify-between mt-2">
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                    }}
                  >
                    {deviceId.length}/9 digits
                  </p>
                  {deviceId.length === 9 && (
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--primary)',
                        fontWeight: 'var(--font-weight-bold)',
                      }}
                    >
                      ✓ Ready to call
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-2.5 rounded-[var(--radius)] border border-border hover:bg-secondary transition-colors text-foreground"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                  onClick={() => {
                    setShowCallDeviceModal(false);
                    setDeviceId('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2.5 rounded-[var(--radius)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                    backgroundColor: deviceId.length === 9 ? 'var(--primary)' : 'var(--secondary)',
                    color: deviceId.length === 9 ? 'var(--primary-foreground)' : 'var(--muted)',
                  }}
                  onClick={handleCallDevice}
                  disabled={deviceId.length !== 9}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="size-4" />
                    <span>Call Device</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invite Device Modal */}
        {showInviteDeviceModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInviteDeviceModal(false)}
          >
            <div
              className="bg-card border border-border rounded-[var(--radius)] p-6 max-w-[480px] w-full"
              onClick={(e) => e.stopPropagation()}
              style={{ boxShadow: 'var(--elevation-sm)', fontFamily: 'var(--font-family)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3
                  className="text-foreground"
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  Invite by Device ID
                </h3>
                <button
                  onClick={() => setShowInviteDeviceModal(false)}
                  className="p-1.5 hover:bg-secondary rounded-[var(--radius)] transition-colors"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 18 18">
                    <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              <p
                className="mb-5 text-muted"
                style={{
                  fontSize: 'var(--text-sm)',
                }}
              >
                Enter the 9-digit device ID to invite it to this call
              </p>

              <div className="mb-6">
                <label
                  className="block mb-2 text-foreground"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  Device ID
                </label>
                <input
                  type="text"
                  value={inviteDeviceId}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                    setInviteDeviceId(value);
                  }}
                  placeholder="123456789"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius)] outline-none focus:border-primary transition-colors"
                  style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-family)',
                    letterSpacing: '0.15em',
                  }}
                  maxLength={9}
                  autoFocus
                />
                <div className="flex items-center justify-between mt-2">
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                    }}
                  >
                    {inviteDeviceId.length}/9 digits
                  </p>
                  {inviteDeviceId.length === 9 && (
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--primary)',
                        fontWeight: 'var(--font-weight-bold)',
                      }}
                    >
                      ✓ Ready to invite
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-2.5 rounded-[var(--radius)] border border-border hover:bg-secondary transition-colors text-foreground"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                  onClick={() => {
                    setShowInviteDeviceModal(false);
                    setInviteDeviceId('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2.5 rounded-[var(--radius)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                    backgroundColor: inviteDeviceId.length === 9 ? 'var(--primary)' : 'var(--secondary)',
                    color: inviteDeviceId.length === 9 ? 'var(--primary-foreground)' : 'var(--muted)',
                  }}
                  onClick={handleInviteByDeviceId}
                  disabled={inviteDeviceId.length !== 9}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="size-4" />
                    <span>Invite Device</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Join Meeting Modal */}
        {showJoinMeetingModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowJoinMeetingModal(false)}
          >
            <div
              className="bg-card border border-border rounded-[var(--radius)] p-6 max-w-[480px] w-full"
              onClick={(e) => e.stopPropagation()}
              style={{ boxShadow: 'var(--elevation-sm)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3
                  className="text-foreground"
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  Join Meeting
                </h3>
                <button
                  onClick={() => setShowJoinMeetingModal(false)}
                  className="p-1.5 hover:bg-secondary rounded-[var(--radius)] transition-colors"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 18 18">
                    <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              <p
                className="mb-5 text-muted"
                style={{
                  fontSize: 'var(--text-sm)',
                }}
              >
                Enter the 8-digit meeting code and optional password to join
              </p>

              <div className="mb-4">
                <label
                  className="block mb-2 text-foreground"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  Meeting Code
                </label>
                <input
                  type="text"
                  value={meetingCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                    setMeetingCode(value);
                  }}
                  placeholder="12345678"
                  className="w-full px-4 py-3 bg-background border border-border rounded-[var(--radius)] outline-none focus:border-primary transition-colors"
                  style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-family)',
                    letterSpacing: '0.15em',
                  }}
                  maxLength={8}
                  autoFocus
                />
                <div className="flex items-center justify-between mt-2">
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                    }}
                  >
                    {meetingCode.length}/8 digits
                  </p>
                  {meetingCode.length === 8 && (
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--primary)',
                        fontWeight: 'var(--font-weight-bold)',
                      }}
                    >
                      ✓ Code valid
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label
                  className="block mb-2 text-foreground"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  Password (optional)
                </label>
                <input
                  type="password"
                  value={meetingPassword}
                  onChange={(e) => setMeetingPassword(e.target.value)}
                  placeholder="Enter password if required"
                  className="w-full px-4 py-3 bg-background border border-border rounded-[var(--radius)] outline-none focus:border-primary transition-colors"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-family)',
                  }}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 px-4 py-2.5 rounded-[var(--radius)] border border-border hover:bg-secondary transition-colors text-foreground"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                  onClick={() => {
                    setShowJoinMeetingModal(false);
                    setMeetingCode('');
                    setMeetingPassword('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2.5 rounded-[var(--radius)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                    backgroundColor: meetingCode.length === 8 ? 'var(--primary)' : 'var(--secondary)',
                    color: meetingCode.length === 8 ? 'var(--primary-foreground)' : 'var(--muted)',
                  }}
                  onClick={handleJoinMeetingByCode}
                  disabled={meetingCode.length !== 8}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Video className="size-4" />
                    <span>Join Meeting</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attachment Picker Modal */}
        {showAttachmentPicker && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
            style={{ zIndex: 10000 }}
            onClick={() => setShowAttachmentPicker(false)}
          >
            <div
              className="bg-card border border-border rounded-[var(--radius)] w-full max-w-[700px] max-h-[80vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{ boxShadow: 'var(--elevation-md)' }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border shrink-0 bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className="text-foreground mb-1"
                      style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-weight-bold)',
                      }}
                    >
                      Attach from Workspace
                    </h3>
                    <p className="text-xs text-muted">
                      Select procedures or folders to share in chat
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAttachmentPicker(false)}
                    className="p-2 hover:bg-secondary rounded-[var(--radius)] transition-colors text-muted hover:text-foreground"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 18 18">
                      <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {projects.map((project) => {
                  const projectItems = knowledgeBaseItems.filter(
                    (item) => item.projectId === project.id && (item.type === 'procedure' || item.type === 'folder')
                  );

                  if (projectItems.length === 0) return null;

                  return (
                    <div key={project.id} className="mb-6 last:mb-0">
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <div className="size-6 bg-primary/10 rounded-[var(--radius)] flex items-center justify-center">
                          <Folder size={14} className="text-primary" />
                        </div>
                        <h4
                          className="text-foreground"
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-bold)',
                          }}
                        >
                          {project.name}
                        </h4>
                        <span className="text-xs text-muted">
                          ({projectItems.length} item{projectItems.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                      <div className="space-y-2">
                        {projectItems.map((item) => {
                          const isSelected = selectedAttachments.some((a) => a.id === item.id);
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedAttachments((prev) =>
                                    prev.filter((a) => a.id !== item.id)
                                  );
                                } else {
                                  setSelectedAttachments((prev) => [
                                    ...prev,
                                    {
                                      id: item.id,
                                      name: item.name,
                                      type: item.type,
                                      projectName: project.name,
                                    },
                                  ]);
                                }
                              }}
                              className={`w-full flex items-center gap-3 p-3.5 rounded-[var(--radius)] transition-all text-left group ${
                                isSelected
                                  ? 'bg-primary/10 border border-primary shadow-sm'
                                  : 'bg-secondary/30 border border-transparent hover:bg-secondary hover:border-border/50 hover:shadow-sm'
                              }`}
                            >
                              <div className={`size-9 rounded-[var(--radius)] flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-primary/20' : 'bg-card group-hover:bg-card/80'
                              }`}>
                                <FileText size={18} className={isSelected ? 'text-primary' : 'text-muted group-hover:text-foreground'} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}
                                  style={{ fontWeight: 'var(--font-weight-bold)' }}
                                >
                                  {item.name}
                                </p>
                                <p className="text-xs text-muted capitalize mt-0.5">{item.type}</p>
                              </div>
                              {isSelected && (
                                <div className="size-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                                  <svg className="size-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                                    <path
                                      d="M5 13l4 4L19 7"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border shrink-0 bg-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted">
                    {selectedAttachments.length} item{selectedAttachments.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAttachmentPicker(false);
                      setSelectedAttachments([]);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-[var(--radius)] border border-border hover:bg-secondary transition-colors text-foreground"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-bold)',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowAttachmentPicker(false)}
                    disabled={selectedAttachments.length === 0}
                    className="flex-1 px-4 py-2.5 rounded-[var(--radius)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-bold)',
                      backgroundColor: selectedAttachments.length > 0 ? 'var(--primary)' : 'var(--secondary)',
                      color: selectedAttachments.length > 0 ? 'var(--primary-foreground)' : 'var(--muted)',
                    }}
                  >
                    Attach {selectedAttachments.length > 0 && `(${selectedAttachments.length})`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-card">
          {activeTab === 'agenda' ? (
            meetings.length > 0 ? (
              <div className="p-6">
                {/* Agenda View */}
                <div className="space-y-2">
                  {meetings.map((meeting) => (
                  <div 
                    key={meeting.id}
                    className="bg-card border border-border rounded-[var(--radius)] hover:border-primary/50 transition-colors overflow-hidden"
                  >
                    <div className="flex items-center gap-4 px-4 py-3">
                      {/* Time column */}
                      <div className="flex flex-col items-center shrink-0 w-16">
                        <div className="text-xs text-muted uppercase tracking-wide">
                          {meeting.scheduledTime.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-xl text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                          {meeting.scheduledTime.getDate()}
                        </div>
                        <div className="text-xs text-muted">
                          {meeting.scheduledTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="w-px h-12 bg-border shrink-0" />

                      {/* Meeting info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-foreground truncate mb-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                          {meeting.title}
                        </h4>
                        {meeting.participants.length > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1.5">
                              {meeting.participants.slice(0, 3).map((participant) => (
                                <MemberAvatar key={participant.id} name={participant.name} size="xs" color={participant.color} initials={participant.initial} border />
                              ))}
                            </div>
                            <span className="text-xs text-muted">
                              {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleEditMeeting(meeting)}
                          className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded-[var(--radius)] transition-colors"
                          title="Edit meeting"
                        >
                          <svg className="size-4" fill="none" viewBox="0 0 18 18">
                            <path d="M12.5 2.5l3 3-8.5 8.5H4v-3l8.5-8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10.5 4.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteMeeting(meeting.id!)}
                          className="p-1.5 text-muted hover:text-destructive hover:bg-destructive/10 rounded-[var(--radius)] transition-colors"
                          title="Delete meeting"
                        >
                          <svg className="size-4" fill="none" viewBox="0 0 18 18">
                            <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleJoinMeeting(meeting)}
                          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-[var(--radius)] hover:opacity-90 transition-opacity text-xs"
                          style={{ fontWeight: 'var(--font-weight-bold)' }}
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-card">
                <div className="p-5 bg-secondary/50 rounded-full mb-4">
                  <Calendar size={36} className="text-muted" />
                </div>
                <h3 className="text-base text-foreground mb-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  No scheduled meetings
                </h3>
                <p className="text-sm text-muted text-center max-w-[300px] mb-1">
                  Your scheduled meetings will show here.{' '}
                  <button
                    onClick={() => openScheduleModal(true)}
                    className="text-primary hover:underline"
                    style={{ fontWeight: 'var(--font-weight-bold)' }}
                  >
                    Learn more
                  </button>
                </p>
                {canScheduleMeeting && (
                <button
                  onClick={() => openScheduleModal(true)}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-[var(--radius)] hover:opacity-90 transition-opacity"
                  style={{ fontWeight: 'var(--font-weight-bold)' }}
                >
                  + Schedule Meeting
                </button>
                )}
              </div>
            )
          ) : (
            /* Recent Calls View */
            recentCalls.length > 0 ? (
              <div className="p-6">
                <div className="space-y-2">
                  {recentCalls.map((call) => {
                    const formatDuration = (seconds: number) => {
                      const mins = Math.floor(seconds / 60);
                      const secs = seconds % 60;
                      if (mins === 0) return `${secs}s`;
                      return `${mins}m ${secs}s`;
                    };

                    const formatCallTime = (date: Date) => {
                      const now = new Date();
                      const diffMs = now.getTime() - date.getTime();
                      const diffMins = Math.floor(diffMs / 60000);
                      const diffHours = Math.floor(diffMs / 3600000);
                      const diffDays = Math.floor(diffMs / 86400000);

                      if (diffMins < 1) return 'Just now';
                      if (diffMins < 60) return `${diffMins} min ago`;
                      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    };

                    return (
                      <div 
                        key={call.id}
                        className="bg-card border border-border rounded-[var(--radius)] hover:border-primary/50 transition-colors overflow-hidden"
                      >
                        <div className="flex items-center gap-4 px-4 py-3">
                          {/* Call Icon */}
                          <div className="shrink-0">
                            <div className={`size-10 rounded-full flex items-center justify-center ${
                              call.type === 'completed' ? 'bg-primary/10 text-primary' :
                              call.type === 'missed' ? 'bg-destructive/10 text-destructive' :
                              'bg-muted text-muted'
                            }`}>
                              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                          </div>

                          {/* Call info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm text-foreground truncate mb-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                              {call.title}
                            </h4>
                            <div className="flex flex-col gap-1">
                              {call.participants.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <div className="flex -space-x-1.5">
                                    {call.participants.slice(0, 3).map((participant) => (
                                      <MemberAvatar key={participant.id} name={participant.name} size="xs" color={participant.color} initials={participant.initial} border />
                                    ))}
                                  </div>
                                  <span className="text-xs text-muted">
                                    {call.participants.length} participant{call.participants.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-3 text-xs text-muted">
                                <span>{formatCallTime(call.timestamp)}</span>
                                <span>•</span>
                                <span>Duration: {formatDuration(call.duration)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleCallAgain(call)}
                              className="px-4 py-2 bg-primary text-primary-foreground rounded-[var(--radius)] hover:opacity-90 transition-opacity text-xs flex items-center gap-2"
                              style={{ fontWeight: 'var(--font-weight-bold)' }}
                              title="Call again"
                            >
                              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              Call Again
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-card">
                <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <svg className="size-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-foreground mb-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  No recent calls yet
                </p>
                <p className="text-xs text-muted text-center max-w-[280px]">
                  Your call history will appear here after you complete calls
                </p>
              </div>
            )
          )}
        </div>

        {/* Mobile Bottom Action Bar */}
        <div className="md:hidden border-t border-border bg-card shrink-0">
          <div className="flex items-center justify-around px-4 py-3 gap-2">
            {/* Call Device Button */}
            <button
              onClick={() => setShowCallDeviceModal(true)}
              className="flex flex-col items-center gap-1.5 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-[var(--radius)] transition-colors flex-1 text-foreground"
            >
              <Phone className="size-5" />
              <span className="text-[11px]" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Call Device
              </span>
            </button>

            {/* Join Meeting Button */}
            <button
              onClick={() => setShowJoinMeetingModal(true)}
              className="flex flex-col items-center gap-1.5 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-[var(--radius)] transition-colors flex-1 text-foreground"
            >
              <Video className="size-5" />
              <span className="text-[11px]" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Join Meeting
              </span>
            </button>

            {/* Create Button */}
            <button
              ref={createButtonRef}
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="flex flex-col items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-[var(--radius)] hover:opacity-90 transition-opacity flex-1"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[11px]" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Create
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
