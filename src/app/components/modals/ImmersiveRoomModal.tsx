import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Upload, Trash2, Calendar, Clock, Copy, ChevronDown,
  Globe, Lock, Shield, Users, Image, Link2, Eye, Mic, MicOff,
  MessageSquare, Pointer, UserPlus, MonitorPlay, Box,
  Search, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ── Types ──────────────────────────────────────────────────────

type AdmissionType = 'none' | 'forGuestsOnly' | 'forEveryone';

interface ImmersiveRoomProperties {
  roomId: string;
  roomName: string;
  roomDescription: string;
  roomPassword: string;
  meetingStartDate: string; // ISO
  meetingStartTime: string; // HH:mm
  meetingEndDate: string;
  meetingEndTime: string;
  hasEndDate: boolean;
  thumbnailUrl: string;
  localThumbnailPath: string;
  isPublic: boolean;
  isRestrictedAccess: boolean;
  admissionType: AdmissionType;
  environmentAddress: string;
  environmentName: string;
  connectedDigitalTwinId: string;
  connectedDigitalTwinName: string;
  invitedUsers: string[];
  isChatAllowed: boolean;
  isAddMediaAllowed: boolean;
  isEditMediaAllowed: boolean;
  isPointerAllowed: boolean;
  isInvitationsAllowed: boolean;
  isMicrophonesDisabled: boolean;
  isForceParticipantsView: boolean;
}

export type { ImmersiveRoomProperties };

interface ImmersiveRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (room: ImmersiveRoomProperties) => void;
  editRoom?: Partial<ImmersiveRoomProperties> | null;
}

// ── Mock data ──────────────────────────────────────────────────

const mockEnvironments = [
  { id: 'env-1', name: 'Industrial Workshop', thumbnail: 'linear-gradient(135deg, #2c3e50 0%, #4a6fa5 100%)' },
  { id: 'env-2', name: 'Open Space', thumbnail: 'linear-gradient(135deg, #1d7874 0%, #2dcb75 100%)' },
  { id: 'env-3', name: 'Conference Room', thumbnail: 'linear-gradient(135deg, #614385 0%, #516395 100%)' },
  { id: 'env-4', name: 'Training Facility', thumbnail: 'linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)' },
  { id: 'env-5', name: 'Outdoor Field', thumbnail: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' },
  { id: 'env-6', name: 'Server Room', thumbnail: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
];

const mockDigitalTwins = [
  { id: 'dt-1', name: 'Caterpillar 915i Wheel Loader', thumbnail: 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)' },
  { id: 'dt-2', name: 'Generator Set C9.3', thumbnail: 'linear-gradient(135deg, #2F80ED 0%, #56CCF2 100%)' },
  { id: 'dt-3', name: 'Hydraulic Pump Assembly', thumbnail: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' },
  { id: 'dt-4', name: 'Electric Motor Unit', thumbnail: 'linear-gradient(135deg, #8e44ad 0%, #3498db 100%)' },
];

const mockUsers = [
  { id: 'u1', name: 'David Amrosa', email: 'david@company.com' },
  { id: 'u2', name: 'Nika Jerrardo', email: 'nika@company.com' },
  { id: 'u3', name: 'Sarah Chen', email: 'sarah@company.com' },
  { id: 'u4', name: 'Marcus Williams', email: 'marcus@company.com' },
  { id: 'u5', name: 'Elena Rodriguez', email: 'elena@company.com' },
  { id: 'u6', name: 'Jared Sunn', email: 'jared@company.com' },
  { id: 'u7', name: 'Luy Robin', email: 'luy@company.com' },
  { id: 'u8', name: 'Tom Harris', email: 'tom@company.com' },
];

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

const ADMISSION_OPTIONS: { value: AdmissionType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'forGuestsOnly', label: 'For Guests Only' },
  { value: 'forEveryone', label: 'For Everyone' },
];

// ── Helpers ────────────────────────────────────────────────────

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function todayStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function nowTime() {
  const d = new Date();
  const m = Math.ceil(d.getMinutes() / 30) * 30;
  const h = m === 60 ? d.getHours() + 1 : d.getHours();
  return `${String(h % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

function parseDateStr(s: string) {
  const [d, m, y] = s.split('/').map(Number);
  return new Date(y, m - 1, d);
}

function computeDuration(sd: string, st: string, ed: string, et: string): string {
  const start = parseDateStr(sd);
  const end = parseDateStr(ed);
  const [sh, sm] = st.split(':').map(Number);
  const [eh, em] = et.split(':').map(Number);
  start.setHours(sh, sm);
  end.setHours(eh, em);
  let diff = end.getTime() - start.getTime();
  if (diff < 0) return '—';
  const days = Math.floor(diff / 86400000); diff %= 86400000;
  const hours = Math.floor(diff / 3600000); diff %= 3600000;
  const mins = Math.floor(diff / 60000);
  const parts: string[] = [];
  if (days) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours) parts.push(`${hours}h`);
  if (mins) parts.push(`${mins}m`);
  return parts.join(', ') || '0m';
}

function addOneHour(date: string, time: string): { date: string; time: string } {
  const d = parseDateStr(date);
  const [h, m] = time.split(':').map(Number);
  d.setHours(h + 1, m);
  return {
    date: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`,
    time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
  };
}

// ── Sub-components ─────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-2 mb-3"
      style={{ paddingTop: '4px' }}
    >
      <h4
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: '#868D9E',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
        }}
      >
        {children}
      </h4>
      <div className="flex-1 h-px" style={{ backgroundColor: '#E9E9E9' }} />
    </div>
  );
}

function FormLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{ fontSize: '12px', fontWeight: 600, color: '#36415D', display: 'block', marginBottom: '5px' }}
    >
      {children}
    </label>
  );
}

function FormCheckbox({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div
      className="flex items-start gap-3 cursor-pointer group py-1"
      onClick={() => onChange(!checked)}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!checked); } }}
    >
      <div
        className="size-[18px] rounded-[4px] border-[1.5px] flex items-center justify-center shrink-0 transition-all mt-px"
        style={{
          borderColor: checked ? '#2F80ED' : '#C2C9DB',
          backgroundColor: checked ? '#2F80ED' : '#FFFFFF',
        }}
      >
        {checked && <Check className="size-3 text-white" strokeWidth={3} />}
      </div>
      <div className="flex-1 min-w-0">
        <span style={{ fontSize: '13px', color: '#36415D', fontWeight: 500 }}>{label}</span>
        {description && (
          <span style={{ fontSize: '11px', color: '#868D9E', display: 'block', marginTop: '1px' }}>
            {description}
          </span>
        )}
      </div>
    </div>
  );
}

function SelectionCard({
  thumbnail,
  name,
  selected,
  onClick,
}: {
  thumbnail: string;
  name: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors"
      style={{
        backgroundColor: selected ? 'rgba(47, 128, 237, 0.08)' : undefined,
        border: selected ? '1.5px solid #2F80ED' : '1.5px solid transparent',
      }}
      onClick={onClick}
      onMouseEnter={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.backgroundColor = '#F5F5F5'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = selected ? 'rgba(47, 128, 237, 0.08)' : ''; }}
    >
      <div
        className="size-10 rounded-lg shrink-0"
        style={{ background: thumbnail }}
      />
      <span style={{ fontSize: '13px', fontWeight: 500, color: '#36415D' }} className="truncate flex-1">
        {name}
      </span>
      {selected && (
        <div className="size-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#2F80ED' }}>
          <Check className="size-3 text-white" strokeWidth={3} />
        </div>
      )}
    </div>
  );
}

function UserRow({
  name,
  email,
  selected,
  onClick,
}: {
  name: string;
  email: string;
  selected: boolean;
  onClick: () => void;
}) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  return (
    <div
      className="flex items-center gap-3 px-2 py-1.5 rounded-lg cursor-pointer transition-colors"
      style={{
        backgroundColor: selected ? 'rgba(47, 128, 237, 0.06)' : undefined,
      }}
      onClick={onClick}
      onMouseEnter={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.backgroundColor = '#F5F5F5'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = selected ? 'rgba(47, 128, 237, 0.06)' : ''; }}
    >
      <div
        className="size-8 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: '#2F80ED', color: 'white', fontSize: '11px', fontWeight: 700 }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#36415D' }} className="truncate">{name}</div>
        <div style={{ fontSize: '11px', color: '#868D9E' }} className="truncate">{email}</div>
      </div>
      <div
        className="size-[18px] rounded-[4px] border-[1.5px] flex items-center justify-center shrink-0 transition-all"
        style={{
          borderColor: selected ? '#2F80ED' : '#C2C9DB',
          backgroundColor: selected ? '#2F80ED' : '#FFFFFF',
        }}
      >
        {selected && <Check className="size-3 text-white" strokeWidth={3} />}
      </div>
    </div>
  );
}

// Custom toast
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-lg text-white shadow-elevation-md"
      style={{ backgroundColor: '#36415D', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap' }}
    >
      {message}
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────

const defaultRoom = (): ImmersiveRoomProperties => ({
  roomId: generateId(),
  roomName: '',
  roomDescription: '',
  roomPassword: '',
  meetingStartDate: todayStr(),
  meetingStartTime: nowTime(),
  meetingEndDate: todayStr(),
  meetingEndTime: (() => { const r = addOneHour(todayStr(), nowTime()); return r.time; })(),
  hasEndDate: false,
  thumbnailUrl: '',
  localThumbnailPath: '',
  isPublic: false,
  isRestrictedAccess: false,
  admissionType: 'none',
  environmentAddress: mockEnvironments[0].id,
  environmentName: mockEnvironments[0].name,
  connectedDigitalTwinId: '',
  connectedDigitalTwinName: '',
  invitedUsers: [],
  isChatAllowed: true,
  isAddMediaAllowed: true,
  isEditMediaAllowed: true,
  isPointerAllowed: true,
  isInvitationsAllowed: true,
  isMicrophonesDisabled: false,
  isForceParticipantsView: false,
});

export function ImmersiveRoomModal({ isOpen, onClose, onSave, editRoom }: ImmersiveRoomModalProps) {
  const isEditMode = !!editRoom;
  const [room, setRoom] = useState<ImmersiveRoomProperties>(defaultRoom());
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [showEnvSelector, setShowEnvSelector] = useState(false);
  const [showDtSelector, setShowDtSelector] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const envBtnRef = useRef<HTMLButtonElement>(null);
  const dtBtnRef = useRef<HTMLButtonElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      if (editRoom) {
        setRoom({ ...defaultRoom(), ...editRoom });
        setShowPasswordField(!!editRoom.roomPassword);
        if (editRoom.thumbnailUrl) setThumbnailPreview(editRoom.thumbnailUrl);
      } else {
        setRoom(defaultRoom());
        setThumbnailPreview('');
        setShowPasswordField(false);
      }
      setShowEnvSelector(false);
      setShowDtSelector(false);
      setShowUserSelector(false);
      setUserSearch('');
    }
  }, [isOpen, editRoom]);

  // Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const update = useCallback(<K extends keyof ImmersiveRoomProperties>(key: K, value: ImmersiveRoomProperties[K]) => {
    setRoom((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleNameChange = (v: string) => {
    if (v.length > 70) {
      setToast('Room name cannot exceed 70 characters');
      return;
    }
    update('roomName', v);
  };

  const handleDescriptionChange = (v: string) => {
    if (v.length > 1000) {
      setToast('Description cannot exceed 1000 characters');
      return;
    }
    update('roomDescription', v);
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setToast('Only JPG, JPEG and PNG files are accepted');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setToast('File size must be under 20 MB');
      return;
    }
    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);
    update('localThumbnailPath', file.name);
  };

  const removeThumbnail = () => {
    setThumbnailPreview('');
    update('thumbnailUrl', '');
    update('localThumbnailPath', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEnvironmentSelect = (env: typeof mockEnvironments[0]) => {
    update('environmentAddress', env.id);
    update('environmentName', env.name);
    if (!thumbnailPreview && !room.localThumbnailPath) {
      setThumbnailPreview(env.thumbnail);
    }
    setShowEnvSelector(false);
  };

  const handleDtSelect = (dt: typeof mockDigitalTwins[0]) => {
    update('connectedDigitalTwinId', dt.id);
    update('connectedDigitalTwinName', dt.name);
    if (!thumbnailPreview && !room.localThumbnailPath) {
      setThumbnailPreview(dt.thumbnail);
    }
    setShowDtSelector(false);
  };

  const toggleInvitedUser = (userId: string) => {
    setRoom((prev) => {
      const users = new Set(prev.invitedUsers);
      if (users.has(userId)) users.delete(userId);
      else users.add(userId);
      return { ...prev, invitedUsers: Array.from(users) };
    });
  };

  const handleCopyLink = () => {
    const link = `https://app.frontline.io/deep/virtualroom/workspace/${room.roomId}`;
    navigator.clipboard.writeText(link).then(() => setToast('Link copied to clipboard'));
  };

  const handleSubmit = () => {
    if (!room.roomName.trim()) {
      setToast('Room name is required');
      return;
    }
    onSave?.(room);
    setToast(isEditMode ? 'Room settings saved' : 'Room created successfully');
    setTimeout(() => onClose(), 600);
  };

  const filteredUsers = mockUsers.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const duration = room.hasEndDate
    ? computeDuration(room.meetingStartDate, room.meetingStartTime, room.meetingEndDate, room.meetingEndTime)
    : null;

  // Get effective thumbnail for preview area
  const effectiveThumbnail = thumbnailPreview
    || (room.environmentAddress ? mockEnvironments.find(e => e.id === room.environmentAddress)?.thumbnail : '')
    || 'linear-gradient(135deg, #36415D 0%, #5E677D 100%)';

  if (!isOpen) return null;

  return (
    <>
      {/* Full-screen container: click outside panel = close */}
      <div
        className="fixed inset-0 z-[60] flex justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
        onClick={onClose}
      >
      {/* Panel */}
      <div
        ref={panelRef}
        className="bg-white flex flex-col shrink-0 h-full"
        style={{
          width: '440px',
          maxWidth: '100vw',
          borderLeft: '1px solid #C2C9DB',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
          animation: 'irmSlideIn 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div
          className="flex items-center justify-between shrink-0 px-5"
          style={{ height: '56px', borderBottom: '1px solid #E9E9E9' }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#36415D' }}>
            {isEditMode ? 'Room Settings' : 'New Room'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 rounded-lg hover:bg-[#F5F5F5] transition-colors"
              style={{ height: '34px', fontSize: '13px', fontWeight: 500, color: '#36415D', border: '1px solid #C2C9DB' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 rounded-lg text-white hover:brightness-110 transition-opacity"
              style={{ height: '34px', fontSize: '13px', fontWeight: 600, backgroundColor: '#2F80ED' }}
            >
              {isEditMode ? 'Save' : 'Create'}
            </button>
          </div>
        </div>

        {/* Thumbnail preview banner */}
        <div
          className="relative w-full shrink-0 flex items-center justify-center"
          style={{ background: effectiveThumbnail, height: '120px' }}
        >
          {thumbnailPreview && thumbnailPreview.startsWith('blob:') && (
            <img src={thumbnailPreview} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="relative z-10 flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white transition-colors"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)', fontSize: '12px', fontWeight: 500, backdropFilter: 'blur(4px)' }}
            >
              <Upload className="size-3.5" /> Upload
            </button>
            {(thumbnailPreview || room.localThumbnailPath) && (
              <button
                onClick={removeThumbnail}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white transition-colors"
                style={{ backgroundColor: 'rgba(255,31,31,0.6)', fontSize: '12px', fontWeight: 500, backdropFilter: 'blur(4px)' }}
              >
                <Trash2 className="size-3.5" /> Remove
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleThumbnailUpload}
            className="hidden"
          />
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-6" style={{ paddingTop: '16px' }}>

          {/* ── Section 1: Basic Info ── */}
          <SectionHeader>Basic Information</SectionHeader>

          <div className="mb-3">
            <FormLabel htmlFor="irm-name">Room Name</FormLabel>
            <input
              id="irm-name"
              type="text"
              value={room.roomName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter room name..."
              className="w-full bg-white border outline-none focus:border-[#2E80ED] focus:shadow-[0_0_0_2px_rgba(46,128,237,0.12)] transition-all"
              style={{ borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#36415D', borderColor: '#C2C9DB', minHeight: '36px' }}
            />
            <div style={{ fontSize: '10px', color: '#868D9E', marginTop: '3px', textAlign: 'right' }}>
              {room.roomName.length}/70
            </div>
          </div>

          <div className="mb-4">
            <FormLabel htmlFor="irm-desc">Room Description</FormLabel>
            <textarea
              id="irm-desc"
              value={room.roomDescription}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Describe the purpose of this room..."
              rows={3}
              className="w-full bg-white border outline-none focus:border-[#2E80ED] focus:shadow-[0_0_0_2px_rgba(46,128,237,0.12)] transition-all resize-none custom-scrollbar"
              style={{ borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#36415D', borderColor: '#C2C9DB' }}
            />
            <div style={{ fontSize: '10px', color: '#868D9E', marginTop: '3px', textAlign: 'right' }}>
              {room.roomDescription.length}/1000
            </div>
          </div>

          {/* ── Section 2: Scheduling ── */}
          <SectionHeader>Scheduling</SectionHeader>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <FormLabel>Start Date</FormLabel>
              <div className="relative">
                <input
                  type="text"
                  value={room.meetingStartDate}
                  readOnly
                  className="w-full bg-white border cursor-pointer outline-none"
                  style={{ borderRadius: '8px', padding: '8px 12px 8px 34px', fontSize: '13px', color: '#36415D', borderColor: '#C2C9DB', minHeight: '36px' }}
                  onClick={(e) => {
                    // Create a hidden date input to open the native picker
                    const hidden = document.createElement('input');
                    hidden.type = 'date';
                    hidden.style.position = 'fixed';
                    hidden.style.opacity = '0';
                    hidden.style.pointerEvents = 'none';
                    document.body.appendChild(hidden);
                    hidden.addEventListener('change', () => {
                      const [y, m, d] = hidden.value.split('-');
                      update('meetingStartDate', `${d}/${m}/${y}`);
                      document.body.removeChild(hidden);
                    });
                    hidden.addEventListener('blur', () => {
                      setTimeout(() => { if (document.body.contains(hidden)) document.body.removeChild(hidden); }, 200);
                    });
                    hidden.showPicker?.();
                    hidden.click();
                  }}
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#868D9E', pointerEvents: 'none' }} />
              </div>
            </div>
            <div>
              <FormLabel>Start Time</FormLabel>
              <div className="relative">
                <select
                  value={room.meetingStartTime}
                  onChange={(e) => update('meetingStartTime', e.target.value)}
                  className="w-full bg-white border outline-none appearance-none cursor-pointer focus:border-[#2E80ED]"
                  style={{ borderRadius: '8px', padding: '8px 12px 8px 34px', fontSize: '13px', color: '#36415D', borderColor: '#C2C9DB', minHeight: '36px' }}
                >
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#868D9E', pointerEvents: 'none' }} />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#868D9E', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <FormCheckbox
              checked={room.hasEndDate}
              onChange={(v) => {
                update('hasEndDate', v);
                if (v) {
                  const end = addOneHour(room.meetingStartDate, room.meetingStartTime);
                  update('meetingEndDate', end.date);
                  update('meetingEndTime', end.time);
                }
              }}
              label="Set end date & time"
            />
          </div>

          <AnimatePresence initial={false}>
            {room.hasEndDate && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <FormLabel>End Date</FormLabel>
                    <div className="relative">
                      <input
                        type="text"
                        value={room.meetingEndDate}
                        readOnly
                        className="w-full bg-white border cursor-pointer outline-none"
                        style={{ borderRadius: '8px', padding: '8px 12px 8px 34px', fontSize: '13px', color: '#36415D', borderColor: '#C2C9DB', minHeight: '36px' }}
                        onClick={() => {
                          const hidden = document.createElement('input');
                          hidden.type = 'date';
                          hidden.style.position = 'fixed';
                          hidden.style.opacity = '0';
                          hidden.style.pointerEvents = 'none';
                          document.body.appendChild(hidden);
                          hidden.addEventListener('change', () => {
                            const [y, m, d] = hidden.value.split('-');
                            update('meetingEndDate', `${d}/${m}/${y}`);
                            document.body.removeChild(hidden);
                          });
                          hidden.addEventListener('blur', () => {
                            setTimeout(() => { if (document.body.contains(hidden)) document.body.removeChild(hidden); }, 200);
                          });
                          hidden.showPicker?.();
                          hidden.click();
                        }}
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#868D9E', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <FormLabel>End Time</FormLabel>
                    <div className="relative">
                      <select
                        value={room.meetingEndTime}
                        onChange={(e) => update('meetingEndTime', e.target.value)}
                        className="w-full bg-white border outline-none appearance-none cursor-pointer focus:border-[#2E80ED]"
                        style={{ borderRadius: '8px', padding: '8px 12px 8px 34px', fontSize: '13px', color: '#36415D', borderColor: '#C2C9DB', minHeight: '36px' }}
                      >
                        {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#868D9E', pointerEvents: 'none' }} />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#868D9E', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div
                  className="flex items-center gap-2 rounded-lg mb-3 px-3"
                  style={{ backgroundColor: '#F5F5F5', height: '32px' }}
                >
                  <Clock className="size-3.5" style={{ color: '#868D9E' }} />
                  <span style={{ fontSize: '12px', color: '#868D9E', fontWeight: 500 }}>Duration:</span>
                  <span style={{ fontSize: '12px', color: '#36415D', fontWeight: 600 }}>{duration}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Section 3: Access Control ── */}
          <SectionHeader>Access Control</SectionHeader>

          <div className="flex flex-col gap-1 mb-3">
            <FormCheckbox
              checked={room.isPublic}
              onChange={(v) => update('isPublic', v)}
              label="Public room"
              description="Room appears in the workspace public rooms list"
            />
            <FormCheckbox
              checked={room.isRestrictedAccess}
              onChange={(v) => update('isRestrictedAccess', v)}
              label="Restricted access"
              description="Only invited users can join this room"
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <FormCheckbox
              checked={showPasswordField}
              onChange={(v) => {
                setShowPasswordField(v);
                if (!v) update('roomPassword', '');
              }}
              label="Require password"
            />
            <AnimatePresence initial={false}>
              {showPasswordField && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ paddingTop: '8px', paddingLeft: '30px' }}>
                    <input
                      type="text"
                      value={room.roomPassword}
                      onChange={(e) => update('roomPassword', e.target.value)}
                      placeholder="Enter room password"
                      className="w-full bg-white border outline-none focus:border-[#2E80ED] focus:shadow-[0_0_0_2px_rgba(46,128,237,0.12)] transition-all"
                      style={{ borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#36415D', borderColor: '#C2C9DB', minHeight: '36px' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Admission type */}
          <div className="mb-3">
            <FormLabel>Admission Type</FormLabel>
            <div className="relative">
              <select
                value={room.admissionType}
                onChange={(e) => update('admissionType', e.target.value as AdmissionType)}
                className="w-full bg-white border outline-none appearance-none cursor-pointer focus:border-[#2E80ED]"
                style={{ borderRadius: '8px', padding: '8px 12px 8px 34px', fontSize: '13px', color: '#36415D', borderColor: '#C2C9DB', minHeight: '36px' }}
              >
                {ADMISSION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#868D9E', pointerEvents: 'none' }} />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#868D9E', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Share link (only in edit mode or after name exists) */}
          {(isEditMode || room.roomName) && (
            <div className="mb-4">
              <FormLabel>Share Link</FormLabel>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 flex items-center gap-2 border rounded-lg px-3 min-w-0"
                  style={{ borderColor: '#C2C9DB', height: '36px', backgroundColor: '#F5F5F5' }}
                >
                  <Link2 className="size-3.5 shrink-0" style={{ color: '#868D9E' }} />
                  <span style={{ fontSize: '12px', color: '#868D9E' }} className="truncate">
                    .../virtualroom/workspace/{room.roomId.slice(0, 8)}...
                  </span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 shrink-0 rounded-lg border hover:bg-[#F5F5F5] transition-colors"
                  style={{ height: '36px', padding: '0 12px', fontSize: '12px', fontWeight: 500, color: '#36415D', borderColor: '#C2C9DB' }}
                >
                  <Copy className="size-3.5" /> Copy
                </button>
              </div>
            </div>
          )}

          {/* ── Section 4: Environment ── */}
          <SectionHeader>Environment</SectionHeader>

          <div className="mb-4 relative">
            <div className="flex items-center gap-2">
              <button
                ref={envBtnRef}
                onClick={() => { setShowEnvSelector(!showEnvSelector); setShowDtSelector(false); setShowUserSelector(false); }}
                className="flex-1 flex items-center gap-2 border rounded-lg px-3 transition-colors text-left"
                style={{
                  height: '40px',
                  borderColor: showEnvSelector ? '#2F80ED' : '#C2C9DB',
                  backgroundColor: showEnvSelector ? 'rgba(47, 128, 237, 0.04)' : '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: room.environmentName ? '#36415D' : '#868D9E',
                }}
              >
                <Box className="size-4 shrink-0" style={{ color: '#868D9E' }} />
                <span className="truncate flex-1">
                  {room.environmentName || 'Select environment'}
                </span>
                <ChevronDown className="size-3.5 shrink-0" style={{ color: '#868D9E', transform: showEnvSelector ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }} />
              </button>
              {room.environmentAddress && (
                <button
                  onClick={() => { update('environmentAddress', ''); update('environmentName', ''); }}
                  className="size-[40px] flex items-center justify-center rounded-lg border hover:bg-[#FFF0F0] hover:border-[#FF1F1F] transition-colors shrink-0"
                  style={{ borderColor: '#C2C9DB', color: '#FF1F1F' }}
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>

            <AnimatePresence initial={false}>
              {showEnvSelector && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div
                    className="mt-2 border rounded-xl overflow-hidden"
                    style={{ borderColor: '#E9E9E9', backgroundColor: '#FFFFFF' }}
                  >
                    <div className="p-2 flex flex-col gap-0.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                      {mockEnvironments.map((env) => (
                        <SelectionCard
                          key={env.id}
                          thumbnail={env.thumbnail}
                          name={env.name}
                          selected={room.environmentAddress === env.id}
                          onClick={() => handleEnvironmentSelect(env)}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Section 5: Digital Twin ── */}
          <SectionHeader>Digital Twin</SectionHeader>

          <div className="mb-4 relative">
            <div className="flex items-center gap-2">
              <button
                ref={dtBtnRef}
                onClick={() => { setShowDtSelector(!showDtSelector); setShowEnvSelector(false); setShowUserSelector(false); }}
                className="flex-1 flex items-center gap-2 border rounded-lg px-3 transition-colors text-left"
                style={{
                  height: '40px',
                  borderColor: showDtSelector ? '#2F80ED' : '#C2C9DB',
                  backgroundColor: showDtSelector ? 'rgba(47, 128, 237, 0.04)' : '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: room.connectedDigitalTwinName ? '#36415D' : '#868D9E',
                }}
              >
                <MonitorPlay className="size-4 shrink-0" style={{ color: '#868D9E' }} />
                <span className="truncate flex-1">
                  {room.connectedDigitalTwinName || 'Select digital twin'}
                </span>
                <ChevronDown className="size-3.5 shrink-0" style={{ color: '#868D9E', transform: showDtSelector ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }} />
              </button>
              {room.connectedDigitalTwinId && (
                <button
                  onClick={() => { update('connectedDigitalTwinId', ''); update('connectedDigitalTwinName', ''); }}
                  className="size-[40px] flex items-center justify-center rounded-lg border hover:bg-[#FFF0F0] hover:border-[#FF1F1F] transition-colors shrink-0"
                  style={{ borderColor: '#C2C9DB', color: '#FF1F1F' }}
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>

            <AnimatePresence initial={false}>
              {showDtSelector && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div
                    className="mt-2 border rounded-xl overflow-hidden"
                    style={{ borderColor: '#E9E9E9', backgroundColor: '#FFFFFF' }}
                  >
                    <div className="p-2 flex flex-col gap-0.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                      {mockDigitalTwins.map((dt) => (
                        <SelectionCard
                          key={dt.id}
                          thumbnail={dt.thumbnail}
                          name={dt.name}
                          selected={room.connectedDigitalTwinId === dt.id}
                          onClick={() => handleDtSelect(dt)}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Section 6: Invited Users ── */}
          <SectionHeader>Invited Users</SectionHeader>

          <div className="mb-4">
            <button
              onClick={() => { setShowUserSelector(!showUserSelector); setShowEnvSelector(false); setShowDtSelector(false); }}
              className="w-full flex items-center gap-2 border rounded-lg px-3 transition-colors text-left"
              style={{
                height: '40px',
                borderColor: showUserSelector ? '#2F80ED' : '#C2C9DB',
                backgroundColor: showUserSelector ? 'rgba(47, 128, 237, 0.04)' : '#FFFFFF',
                fontSize: '13px',
                fontWeight: 500,
                color: '#36415D',
              }}
            >
              <Users className="size-4 shrink-0" style={{ color: '#868D9E' }} />
              <span className="flex-1">
                Select invited users
                {room.invitedUsers.length > 0 && (
                  <span style={{ color: '#2F80ED', fontWeight: 600 }}> ({room.invitedUsers.length} selected)</span>
                )}
              </span>
              <ChevronDown className="size-3.5 shrink-0" style={{ color: '#868D9E', transform: showUserSelector ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }} />
            </button>

            <AnimatePresence initial={false}>
              {showUserSelector && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div
                    className="mt-2 border rounded-xl overflow-hidden"
                    style={{ borderColor: '#E9E9E9', backgroundColor: '#FFFFFF' }}
                  >
                    {/* Search bar */}
                    <div style={{ padding: '8px 8px 4px' }}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#868D9E' }} />
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Search users..."
                          className="w-full bg-white border outline-none focus:border-[#2E80ED] transition-all"
                          style={{ borderRadius: '8px', padding: '6px 12px 6px 32px', fontSize: '12px', color: '#36415D', borderColor: '#C2C9DB', minHeight: '32px' }}
                        />
                      </div>
                    </div>
                    {/* User list */}
                    <div className="p-1 flex flex-col gap-0.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                      {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                        <UserRow
                          key={u.id}
                          name={u.name}
                          email={u.email}
                          selected={room.invitedUsers.includes(u.id)}
                          onClick={() => toggleInvitedUser(u.id)}
                        />
                      )) : (
                        <div className="text-center py-4" style={{ fontSize: '12px', color: '#868D9E' }}>
                          No users found
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Section 7: Host Permissions ── */}
          <SectionHeader>Host Permissions</SectionHeader>

          <div className="flex flex-col gap-0.5">
            <FormCheckbox
              checked={room.isAddMediaAllowed}
              onChange={(v) => update('isAddMediaAllowed', v)}
              label="Allow add media"
              description="Participants can add media to the room"
            />
            <FormCheckbox
              checked={room.isEditMediaAllowed}
              onChange={(v) => update('isEditMediaAllowed', v)}
              label="Allow edit media"
              description="Participants can edit media in the room"
            />
            <FormCheckbox
              checked={room.isChatAllowed}
              onChange={(v) => update('isChatAllowed', v)}
              label="Allow chat"
              description="Participants can use the chat"
            />
            <FormCheckbox
              checked={room.isPointerAllowed}
              onChange={(v) => update('isPointerAllowed', v)}
              label="Allow show pointer"
              description="Participants can use the 3D pointer"
            />
            <FormCheckbox
              checked={room.isInvitationsAllowed}
              onChange={(v) => update('isInvitationsAllowed', v)}
              label="Allow invitations"
              description="Participants can invite others"
            />
            <FormCheckbox
              checked={room.isMicrophonesDisabled}
              onChange={(v) => update('isMicrophonesDisabled', v)}
              label="Disable participants' microphones"
              description="Force-mute all participants"
            />
            <FormCheckbox
              checked={room.isForceParticipantsView}
              onChange={(v) => update('isForceParticipantsView', v)}
              label="Force participants view"
              description="Lock participant cameras to host's view"
            />
          </div>
        </div>
      </div>
      </div>

      {/* Slide-in animation */}
      <style>{`
        @keyframes irmSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </>
  );
}
