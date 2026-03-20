import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Globe, Lock, Plus, X, ArrowRight, Settings, RefreshCw } from 'lucide-react';
import { useRole, hasAccess } from '../../../contexts/RoleContext';
import { MemberAvatar } from '../../MemberAvatar';
import { ImmersiveRoomModal, type ImmersiveRoomProperties } from '../../modals/ImmersiveRoomModal';

interface Room {
  id: string;
  name: string;
  thumbnail: string;
  participants: number;
  maxParticipants: number;
  isPublic: boolean;
  description: string;
  host: string;
  status: 'live' | 'scheduled' | 'idle';
}

const INITIAL_MY_ROOMS: Room[] = [
  { id: 'r1', name: 'Engine Training Lab', thumbnail: 'linear-gradient(135deg, #1d4593 0%, #2980b9 100%)', participants: 3, maxParticipants: 8, isPublic: false, description: 'Private training environment for the 915i engine series. Includes full digital twin with interactive procedures.', host: 'You', status: 'live' },
  { id: 'r2', name: 'Safety Drill Room', thumbnail: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)', participants: 0, maxParticipants: 12, isPublic: false, description: 'Emergency response and safety protocol training space with evacuation simulations.', host: 'You', status: 'idle' },
  { id: 'r3', name: 'Assembly Workshop', thumbnail: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)', participants: 1, maxParticipants: 6, isPublic: true, description: 'Collaborative assembly training with step-by-step guided procedures.', host: 'You', status: 'live' },
];

const INITIAL_PUBLIC_ROOMS: Room[] = [
  { id: 'p1', name: 'Hydraulic Systems 101', thumbnail: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)', participants: 5, maxParticipants: 10, isPublic: true, description: 'Open training session covering hydraulic system basics, maintenance, and troubleshooting.', host: 'David Amrosa', status: 'live' },
  { id: 'p2', name: 'Generator Maintenance', thumbnail: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', participants: 2, maxParticipants: 8, isPublic: true, description: 'Hands-on generator maintenance training using interactive 3D models.', host: 'Sarah Chen', status: 'live' },
  { id: 'p3', name: 'Quality Control Lab', thumbnail: 'linear-gradient(135deg, #f39c12 0%, #f1c40f 100%)', participants: 0, maxParticipants: 6, isPublic: true, description: 'Quality inspection training room with measurement tools and defect identification exercises.', host: 'Marcus Williams', status: 'scheduled' },
  { id: 'p4', name: 'Electrical Systems', thumbnail: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)', participants: 4, maxParticipants: 10, isPublic: true, description: 'Electrical diagnostics and wiring training for industrial equipment.', host: 'Elena Rodriguez', status: 'live' },
  { id: 'p5', name: 'Onboarding Room', thumbnail: 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)', participants: 0, maxParticipants: 20, isPublic: true, description: 'New employee onboarding space with equipment familiarization tours.', host: 'Nika Jerrardo', status: 'idle' },
];

// Random gradient for new rooms
const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
];

// Map environment IDs to gradients
const ENV_THUMBNAILS: Record<string, string> = {
  'env-1': 'linear-gradient(135deg, #2c3e50 0%, #4a6fa5 100%)',
  'env-2': 'linear-gradient(135deg, #1d7874 0%, #2dcb75 100%)',
  'env-3': 'linear-gradient(135deg, #614385 0%, #516395 100%)',
  'env-4': 'linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)',
  'env-5': 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
  'env-6': 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
};

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  live: { label: 'Live', color: '#fff', bg: '#11E874' },
  scheduled: { label: 'Scheduled', color: '#fff', bg: '#F9A825' },
  idle: { label: 'Idle', color: '#fff', bg: '#7F7F7F' },
};

function RoomCard({ room, onClick, onEdit }: { room: Room; onClick: () => void; onEdit?: () => void }) {
  const status = statusLabels[room.status];
  return (
    <div
      className="group cursor-pointer rounded-xl overflow-hidden border border-border bg-card hover:shadow-elevation-sm transition-shadow"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{ background: room.thumbnail, aspectRatio: '16/10' }}
      >
        {/* Status badge */}
        <span
          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs"
          style={{ backgroundColor: status.bg, color: status.color, fontWeight: 'var(--font-weight-bold)', fontSize: '10px' }}
        >
          {status.label}
        </span>
        {/* Privacy icon */}
        <span className="absolute top-2 right-2 p-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          {room.isPublic ? <Globe className="size-3 text-white" /> : <Lock className="size-3 text-white" />}
        </span>
        {/* Settings gear — visible on hover for own rooms */}
        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="absolute bottom-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            aria-label="Room settings"
          >
            <Settings className="size-3.5 text-white" />
          </button>
        )}
        {/* Center icon */}
        <div
          className="size-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        >
          <Users className="size-6 text-white" />
        </div>
      </div>
      {/* Info */}
      <div className="p-3">
        <div className="truncate" style={{ fontSize: '13px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
          {room.name}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span style={{ fontSize: '11px', color: '#7F7F7F' }}>
            {room.host}
          </span>
          <span className="flex items-center gap-1" style={{ fontSize: '11px', color: '#7F7F7F' }}>
            <Users className="size-3" />
            {room.participants}/{room.maxParticipants}
          </span>
        </div>
      </div>
    </div>
  );
}

export function AppVirtualRoomPage() {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Partial<ImmersiveRoomProperties> | null>(null);
  const [myRooms, setMyRooms] = useState<Room[]>(INITIAL_MY_ROOMS);
  const [publicRooms, setPublicRooms] = useState<Room[]>(INITIAL_PUBLIC_ROOMS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { currentRole } = useRole();
  const canCreate = hasAccess(currentRole, 'create-content');

  const handleEditRoom = (room: Room) => {
    setEditingRoom({
      roomId: room.id,
      roomName: room.name,
      roomDescription: room.description,
      isPublic: room.isPublic,
      thumbnailUrl: room.thumbnail,
    });
  };

  const handleCreateSave = useCallback((data: ImmersiveRoomProperties) => {
    const thumbnail = data.environmentAddress
      ? (ENV_THUMBNAILS[data.environmentAddress] || GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)])
      : GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];

    const newRoom: Room = {
      id: data.roomId,
      name: data.roomName,
      thumbnail,
      participants: 0,
      maxParticipants: 10,
      isPublic: data.isPublic,
      description: data.roomDescription,
      host: 'You',
      status: data.hasEndDate ? 'scheduled' : 'idle',
    };

    if (data.isPublic) {
      setPublicRooms((prev) => [newRoom, ...prev]);
    } else {
      setMyRooms((prev) => [newRoom, ...prev]);
    }
  }, []);

  const handleEditSave = useCallback((data: ImmersiveRoomProperties) => {
    const updateRoom = (room: Room): Room => {
      if (room.id !== data.roomId) return room;
      const thumbnail = data.environmentAddress
        ? (ENV_THUMBNAILS[data.environmentAddress] || room.thumbnail)
        : room.thumbnail;
      return {
        ...room,
        name: data.roomName,
        description: data.roomDescription,
        isPublic: data.isPublic,
        thumbnail,
      };
    };
    setMyRooms((prev) => prev.map(updateRoom));
    setPublicRooms((prev) => prev.map(updateRoom));
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate network fetch
    setTimeout(() => setIsRefreshing(false), 600);
  }, []);

  return (
    <div className="h-full flex relative">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
                Immersive Rooms
              </h2>
              <p style={{ fontSize: '13px', color: '#7F7F7F', marginTop: '2px' }}>
                Join or create virtual training rooms
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center rounded-lg border hover:bg-[#F5F5F5] transition-colors"
              style={{ width: '36px', height: '36px', borderColor: '#C2C9DB', color: '#868D9E' }}
              aria-label="Refresh rooms"
              disabled={isRefreshing}
            >
              <RefreshCw
                className="size-4"
                style={{
                  animation: isRefreshing ? 'spin 0.6s linear infinite' : undefined,
                }}
              />
            </button>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 text-white rounded-lg hover:brightness-110 transition-opacity"
              style={{ backgroundColor: '#2F80ED', height: '36px', fontWeight: 'var(--font-weight-semibold)', fontSize: '13px' }}
            >
              <Plus className="size-4" /> Create Room
            </button>
          )}
        </div>

        {/* My Rooms */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="size-4" style={{ color: '#7F7F7F' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              My Rooms
            </h3>
            <span
              className="px-2 py-0.5 rounded-full"
              style={{ fontSize: '11px', fontWeight: 'var(--font-weight-bold)', backgroundColor: '#E9E9E9', color: '#36415D' }}
            >
              {myRooms.length}
            </span>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))' }}>
            {myRooms.map((room) => (
              <RoomCard key={room.id} room={room} onClick={() => setSelectedRoom(room)} onEdit={() => handleEditRoom(room)} />
            ))}
          </div>
        </div>

        {/* Public Rooms */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="size-4" style={{ color: '#7F7F7F' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Public Rooms
            </h3>
            <span
              className="px-2 py-0.5 rounded-full"
              style={{ fontSize: '11px', fontWeight: 'var(--font-weight-bold)', backgroundColor: '#E9E9E9', color: '#36415D' }}
            >
              {publicRooms.length}
            </span>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))' }}>
            {publicRooms.map((room) => (
              <RoomCard key={room.id} room={room} onClick={() => setSelectedRoom(room)} />
            ))}
          </div>
        </div>
      </div>

      {/* Join Lobby Side Panel */}
      {selectedRoom && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50"
            onClick={() => setSelectedRoom(null)}
          />
          {/* Panel */}
          <div
            className="fixed top-0 right-0 bottom-0 z-[51] bg-card flex flex-col shadow-elevation-lg w-full sm:w-[380px]"
            style={{
              maxWidth: '100vw',
              borderLeft: '1px solid #C2C9DB',
              animation: 'roomPanelIn 0.25s ease-out',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedRoom(null)}
              className="absolute top-3 right-3 z-10 p-2.5 hover:bg-secondary rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ color: '#7F7F7F' }}
              aria-label="Close panel"
            >
              <X className="size-5" />
            </button>

            {/* Thumbnail */}
            <div
              className="w-full shrink-0 flex items-center justify-center"
              style={{ background: selectedRoom.thumbnail, height: '200px' }}
            >
              <div
                className="size-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Users className="size-8 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {/* Status & privacy */}
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded-full text-xs"
                  style={{
                    backgroundColor: statusLabels[selectedRoom.status].bg,
                    color: statusLabels[selectedRoom.status].color,
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  {statusLabels[selectedRoom.status].label}
                </span>
                <span className="flex items-center gap-1 text-xs" style={{ color: '#7F7F7F' }}>
                  {selectedRoom.isPublic ? <Globe className="size-3" /> : <Lock className="size-3" />}
                  {selectedRoom.isPublic ? 'Public' : 'Private'}
                </span>
              </div>

              {/* Name */}
              <h3 style={{ fontSize: '18px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
                {selectedRoom.name}
              </h3>

              {/* Description */}
              <p style={{ fontSize: '13px', color: '#7F7F7F', lineHeight: '1.5' }}>
                {selectedRoom.description}
              </p>

              {/* Details */}
              <div className="flex flex-col gap-3 py-3" style={{ borderTop: '1px solid #E9E9E9', borderBottom: '1px solid #E9E9E9' }}>
                <div className="flex justify-between">
                  <span style={{ fontSize: '12px', color: '#7F7F7F' }}>Host</span>
                  <span style={{ fontSize: '12px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>{selectedRoom.host}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: '12px', color: '#7F7F7F' }}>Participants</span>
                  <span style={{ fontSize: '12px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
                    {selectedRoom.participants} / {selectedRoom.maxParticipants}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: '12px', color: '#7F7F7F' }}>Access</span>
                  <span style={{ fontSize: '12px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
                    {selectedRoom.isPublic ? 'Anyone with link' : 'Invited members only'}
                  </span>
                </div>
              </div>

              {/* Participants avatars */}
              {selectedRoom.participants > 0 && (
                <div>
                  <span style={{ fontSize: '12px', color: '#7F7F7F', fontWeight: 'var(--font-weight-semibold)' }}>
                    Currently in room
                  </span>
                  <div className="flex items-center mt-2">
                    {Array.from({ length: Math.min(selectedRoom.participants, 5) }).map((_, i) => (
                      <MemberAvatar
                        key={i}
                        name={['Luy Robin', 'David Amrosa', 'Nika Jerrardo', 'Jared Sunn', 'Sarah Chen'][i % 5]}
                        initials={['LR', 'DA', 'NJ', 'JS', 'SC'][i % 5]}
                        color={['#2F80ED', '#2F80ED', '#E91E63', '#FF6B35', '#00BCD4'][i % 5]}
                        size="lg"
                        border={true}
                        className={i > 0 ? '-ml-1' : ''}
                        showTooltip={false}
                      />
                    ))}
                    {selectedRoom.participants > 5 && (
                      <span className="text-xs ml-1" style={{ color: '#7F7F7F' }}>
                        +{selectedRoom.participants - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="p-5 flex flex-col gap-2 shrink-0" style={{ borderTop: '1px solid #C2C9DB', paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))' }}>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="flex-1 flex items-center justify-center rounded-lg transition-colors hover:bg-secondary/80"
                  style={{
                    height: '44px',
                    backgroundColor: '#E9E9E9',
                    color: '#36415D',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: '13px',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate('/app/3d-viewer?mode=immersive&room=' + selectedRoom.id)}
                  className="flex-1 flex items-center justify-center gap-2 text-white rounded-lg hover:brightness-110 transition-opacity"
                  style={{
                    height: '44px',
                    backgroundColor: '#2F80ED',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: '13px',
                  }}
                >
                  Join Room <ArrowRight className="size-4" />
                </button>
              </div>
              {selectedRoom.host === 'You' && (
                <button
                  onClick={() => {
                    handleEditRoom(selectedRoom);
                    setSelectedRoom(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-lg transition-colors hover:bg-[#F5F5F5] border"
                  style={{
                    height: '38px',
                    color: '#36415D',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: '13px',
                    borderColor: '#C2C9DB',
                  }}
                >
                  <Settings className="size-4" style={{ color: '#868D9E' }} /> Room Settings
                </button>
              )}
            </div>
          </div>

          <style>{`
            @keyframes roomPanelIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}

      {/* Create Room Modal */}
      <ImmersiveRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateSave}
      />

      {/* Edit Room Modal */}
      <ImmersiveRoomModal
        isOpen={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        onSave={handleEditSave}
        editRoom={editingRoom}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
