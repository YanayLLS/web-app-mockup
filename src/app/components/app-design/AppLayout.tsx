import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, ChevronUp, X, BookOpen, Headset, Box, MessageSquare, HelpCircle, Star, Clock, User, Settings, LogOut, MoreVertical, Phone, Video, Mic, MicOff, Users, PhoneOff, Crosshair, UserPlus, Send, Crown, Eye, EyeOff } from 'lucide-react';
import { AppKnowledgeBasePage } from './pages/AppKnowledgeBasePage';
import { AppProjectKBPage } from './pages/AppProjectKBPage';
import { AppRemoteSupportPage } from './pages/AppRemoteSupportPage';
import { AppAIChatPage } from './pages/AppAIChatPage';
import { AppVirtualRoomPage } from './pages/AppVirtualRoomPage';
import { AppNotificationsPage, initialAppNotifications } from './pages/AppNotificationsPage';
import { AppSearchModal } from './pages/AppSearchPage';
import { AppLoginPage } from './pages/AppLoginPage';
import { AppFolderBrowsePage } from './pages/AppFolderBrowsePage';
import { AppSettingsModal } from './components/AppSettingsModal';
import { AppProcedureInfoModal } from './components/AppProcedureInfoModal';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ProcedureEditor } from '../procedure-editor/ProcedureEditor';
import { getUrlParam, setUrlParam } from '../../utils/urlParams';
import { useRole, hasAccess } from '../../contexts/RoleContext';
import { MemberAvatar } from '../MemberAvatar';

const navItems = [
  { id: 'knowledgebase', icon: BookOpen, label: 'Projects', path: '/app/knowledgebase' },
  { id: 'remote-support', icon: Headset, label: 'Remote Support', path: '/app/remote-support' },
  { id: 'immersive', icon: Box, label: 'Immersive Room', path: '/app/immersive' },
  { id: 'ai-chat', icon: MessageSquare, label: 'AI Chat', path: '/app/ai-chat' },
];

// Real KB items from project data used by app pages
const allKBItems: { id: string; name: string; type: string; projectId: string; projectName: string }[] = [
  // 915 i Series
  { id: 'p1', name: 'Routine Maintenance for High-Volume Printing Equipment', type: 'procedure', projectId: '915-i-series', projectName: '915 i Series' },
  { id: 'p2', name: 'Engine Calibration Procedure', type: 'procedure', projectId: '915-i-series', projectName: '915 i Series' },
  { id: 'p3', name: 'Belt Replacement Guide', type: 'procedure', projectId: '915-i-series', projectName: '915 i Series' },
  { id: 'dt1', name: 'Main Engine Assembly', type: 'digital-twin', projectId: '915-i-series', projectName: '915 i Series' },
  { id: 'dt2', name: 'Hydraulic System', type: 'digital-twin', projectId: '915-i-series', projectName: '915 i Series' },
  { id: 'm1', name: 'Installation Tutorial Video', type: 'media', projectId: '915-i-series', projectName: '915 i Series' },
  // Generator
  { id: 'gen-p1', name: 'Preventive Maintenance Procedure', type: 'procedure', projectId: 'generator', projectName: 'Generator' },
  { id: 'gen-p2', name: 'Air Filter Replacement', type: 'procedure', projectId: 'generator', projectName: 'Generator' },
  { id: 'gen-p3', name: 'Coolant System Flush & Refill', type: 'procedure', projectId: 'generator', projectName: 'Generator' },
  { id: 'gen-dt1', name: 'Generator Digital Twin', type: 'digital-twin', projectId: 'generator', projectName: 'Generator' },
  // Manufacturing Alpha
  { id: 'mfg-p1', name: 'CNC Machine X500 Setup', type: 'procedure', projectId: 'manufacturing-alpha', projectName: 'Manufacturing Facility Alpha' },
  { id: 'mfg-dt1', name: 'Assembly Line Robot AR-2000', type: 'digital-twin', projectId: 'manufacturing-alpha', projectName: 'Manufacturing Facility Alpha' },
];

// Favorites — curated set of items the user has starred
const appFavorites = allKBItems.filter(i => ['p1', 'gen-p1', 'gen-dt1'].includes(i.id));

// Recently viewed — last few items the user opened (most recent first)
const appRecentlyViewed = allKBItems.filter(i => ['gen-p2', 'p2', 'dt1', 'mfg-p1'].includes(i.id));

const sidebarContacts = [
  { id: '1', name: 'Luy Robin', role: 'Field Engineer', initials: 'LR', online: true, color: '#2F80ED' },
  { id: '2', name: 'David Amrosa', role: 'Service Support Expert', initials: 'DA', online: true, color: '#2F80ED' },
  { id: '3', name: 'Nika Jerrardo', role: 'Instructor', initials: 'NJ', online: false, color: '#11E874' },
  { id: '4', name: 'Jared Sunn', role: 'Operator', initials: 'JS', online: true, color: '#FF6B35' },
  { id: '5', name: 'Sarah Chen', role: 'Admin', initials: 'SC', online: false, color: '#E91E63' },
  { id: '6', name: 'Marcus Williams', role: 'Field Engineer', initials: 'MW', online: true, color: '#00BCD4' },
  { id: '7', name: 'Elena Rodriguez', role: 'Support Manager', initials: 'ER', online: false, color: '#FF9800' },
  { id: '8', name: 'Tom Anderson', role: 'Operator', initials: 'TA', online: true, color: '#9C27B0' },
];

// Procedure data matching 3D scene's kbProcedures
const sceneProcedures: Record<string, { id: string; projectId: string; name: string; type: 'procedure'; steps: number; lastUpdated: string; version: string; description: string; digitalTwinName: string; configurationName: string; modeName: string }> = {
  p1: { id: 'p1', projectId: '915-i-series', name: 'Routine Maintenance', type: 'procedure', steps: 35, lastUpdated: '02/15/2025', version: '1.5', description: 'Complete routine maintenance procedure for high-volume equipment.', digitalTwinName: 'Generator Assembly', configurationName: 'Standard', modeName: 'Maintenance' },
  p2: { id: 'p2', projectId: '915-i-series', name: 'Engine Calibration', type: 'procedure', steps: 22, lastUpdated: '01/28/2025', version: '2.1', description: 'Step-by-step calibration procedure for engine timing, fuel mixture, and governor settings.', digitalTwinName: 'Generator Assembly', configurationName: 'Calibration', modeName: 'Diagnostics' },
  p3: { id: 'p3', projectId: '915-i-series', name: 'Belt Replacement', type: 'procedure', steps: 15, lastUpdated: '03/01/2025', version: '1.0', description: 'Guide for inspecting and replacing drive belts.', digitalTwinName: 'Generator Assembly', configurationName: 'Standard', modeName: 'Repair' },
  p4: { id: 'p4', projectId: '915-i-series', name: 'Spark Plug Replacement', type: 'procedure', steps: 12, lastUpdated: '02/20/2025', version: '1.2', description: 'Remove and replace spark plugs.', digitalTwinName: 'Generator Assembly', configurationName: 'Standard', modeName: 'Repair' },
  p5: { id: 'p5', projectId: '915-i-series', name: 'Oil Change Procedure', type: 'procedure', steps: 8, lastUpdated: '02/10/2025', version: '3.0', description: 'Drain and refill engine oil.', digitalTwinName: 'Generator Assembly', configurationName: 'Standard', modeName: 'Maintenance' },
  p6: { id: 'p6', projectId: '915-i-series', name: 'Starting Procedure', type: 'procedure', steps: 6, lastUpdated: '01/15/2025', version: '2.0', description: 'Safe engine starting sequence.', digitalTwinName: 'Generator Assembly', configurationName: 'Standard', modeName: 'Operation' },
};

const INITIAL_PARTICIPANTS = [
  { id: 'self', name: 'You', initials: 'YN', color: '#2F80ED', isSelf: true, role: 'Host' },
  { id: 'da', name: 'David Amrosa', initials: 'DA', color: '#2F80ED', isSelf: false, role: 'Engineer' },
  { id: 'nj', name: 'Nika Jerrardo', initials: 'NJ', color: '#E91E63', isSelf: false, role: 'Instructor' },
];

const INVITABLE_CONTACTS = [
  { id: 'js', name: 'Jared Sunn', initials: 'JS', color: '#FF6B35', role: 'Operator' },
  { id: 'sc', name: 'Sarah Chen', initials: 'SC', color: '#00BCD4', role: 'Admin' },
  { id: 'mw', name: 'Marcus Williams', initials: 'MW', color: '#27ae60', role: 'Engineer' },
  { id: 'er', name: 'Elena Rodriguez', initials: 'ER', color: '#FF9800', role: 'Support' },
  { id: 'ta', name: 'Tom Anderson', initials: 'TA', color: '#9C27B0', role: 'Operator' },
];

const CHAT_MESSAGES = [
  { id: 1, sender: 'David Amrosa', initials: 'DA', color: '#2F80ED', text: 'Can everyone see the exhaust manifold? I\'m pointing at it now.', time: '2:34 PM' },
  { id: 2, sender: 'Nika Jerrardo', initials: 'NJ', color: '#E91E63', text: 'Yes, I see your laser. The gasket looks worn on that side.', time: '2:35 PM' },
  { id: 3, sender: 'You', initials: 'YN', color: '#2F80ED', text: 'Let me isolate that part so we can get a better look.', time: '2:36 PM', isSelf: true },
  { id: 4, sender: 'David Amrosa', initials: 'DA', color: '#2F80ED', text: 'Good idea. Can you also X-ray the housing around it?', time: '2:36 PM' },
];

function ImmersiveActionBar({ onLeave, iframeRef }: { onLeave: () => void; iframeRef: React.RefObject<HTMLIFrameElement | null> }) {
  const [micOn, setMicOn] = useState(true);
  const [laserOn, setLaserOn] = useState(false);
  const [followMode, setFollowMode] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);
  const [chatMessages, setChatMessages] = useState(CHAT_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const [inviteSearch, setInviteSearch] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendToScene = (msg: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*');
  };

  const invitePerson = (contact: typeof INVITABLE_CONTACTS[0]) => {
    if (participants.find(p => p.id === contact.id)) return;
    const newP = { ...contact, isSelf: false };
    setParticipants(prev => [...prev, newP]);
    setInviteSearch('');
    // Spawn avatar in 3D scene
    sendToScene({ type: 'spawn-avatar', id: contact.id, name: contact.name, initials: contact.initials, color: contact.color });
    // Fake "joined" chat message
    setChatMessages(prev => [...prev, {
      id: Date.now(), sender: 'System', initials: '', color: '#7F7F7F',
      text: `${contact.name} joined the room`, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), isSystem: true
    } as typeof CHAT_MESSAGES[0]]);
  };

  const removePerson = (id: string) => {
    const person = participants.find(p => p.id === id);
    setParticipants(prev => prev.filter(p => p.id !== id));
    sendToScene({ type: 'remove-avatar', id });
    if (person) {
      setChatMessages(prev => [...prev, {
        id: Date.now(), sender: 'System', initials: '', color: '#7F7F7F',
        text: `${person.name} left the room`, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), isSystem: true
      } as typeof CHAT_MESSAGES[0]]);
    }
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now(), sender: 'You', initials: 'YN', color: '#2F80ED',
      text: chatInput.trim(), time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), isSelf: true
    } as typeof CHAT_MESSAGES[0]]);
    setChatInput('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const availableInvites = INVITABLE_CONTACTS.filter(c =>
    !participants.find(p => p.id === c.id) &&
    (!inviteSearch || c.name.toLowerCase().includes(inviteSearch.toLowerCase()))
  );

  // Spawn initial non-self avatars on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      INITIAL_PARTICIPANTS.filter(p => !p.isSelf).forEach(p => {
        sendToScene({ type: 'spawn-avatar', id: p.id, name: p.name, initials: p.initials, color: p.color });
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Participants strip — top right */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        {participants.map((p) => (
          <div
            key={p.id}
            className="size-9 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/20"
            style={{ backgroundColor: p.color }}
            title={p.name}
          >
            {p.initials}
          </div>
        ))}
      </div>

      {/* Room name — top left */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
        <div className="size-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-white text-sm font-semibold">Engine Training Lab</span>
        <span className="text-white/50 text-xs">{participants.length} in room</span>
      </div>

      {/* Chat panel — right side */}
      {showChat && (
        <div
          className="absolute top-14 right-3 bottom-20 z-30 w-80 flex flex-col rounded-2xl overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-white text-sm font-semibold">Room Chat</span>
            <button onClick={() => setShowChat(false)} className="text-white/50 hover:text-white transition-colors">
              <X className="size-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            {chatMessages.map((msg) => (
              'isSystem' in msg ? (
                <div key={msg.id} className="text-center text-white/40 text-xs py-1">{msg.text}</div>
              ) : (
                <div key={msg.id} className={`flex gap-2 ${(msg as typeof CHAT_MESSAGES[0]).isSelf ? 'flex-row-reverse' : ''}`}>
                  {!(msg as typeof CHAT_MESSAGES[0]).isSelf && (
                    <div className="size-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: msg.color }}>
                      {msg.initials}
                    </div>
                  )}
                  <div className={`max-w-[75%] ${(msg as typeof CHAT_MESSAGES[0]).isSelf ? 'ml-auto' : ''}`}>
                    {!(msg as typeof CHAT_MESSAGES[0]).isSelf && (
                      <div className="text-white/60 text-[10px] mb-0.5">{msg.sender}</div>
                    )}
                    <div
                      className="px-3 py-2 rounded-xl text-white text-xs leading-relaxed"
                      style={{ background: (msg as typeof CHAT_MESSAGES[0]).isSelf ? '#2F80ED' : 'rgba(255,255,255,0.1)' }}
                    >
                      {msg.text}
                    </div>
                    <div className={`text-white/30 text-[9px] mt-0.5 ${(msg as typeof CHAT_MESSAGES[0]).isSelf ? 'text-right' : ''}`}>{msg.time}</div>
                  </div>
                </div>
              )
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 flex gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-lg text-white text-xs outline-none placeholder-white/30"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <button onClick={sendChat} className="size-9 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition-colors">
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Participants panel — right side */}
      {showParticipants && (
        <div
          className="absolute top-14 right-3 z-30 w-80 flex flex-col rounded-2xl overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', maxHeight: 'calc(100% - 100px)' }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-white text-sm font-semibold">Participants ({participants.length})</span>
            <button onClick={() => setShowParticipants(false)} className="text-white/50 hover:text-white transition-colors">
              <X className="size-4" />
            </button>
          </div>

          {/* Current participants */}
          <div className="overflow-y-auto flex-1">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group">
                <div className="relative">
                  <div className="size-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: p.color }}>
                    {p.initials}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-green-400 ring-2 ring-black/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-semibold truncate flex items-center gap-1.5">
                    {p.name}
                    {p.isSelf && <span className="text-white/30 text-[10px]">(you)</span>}
                    {p.role === 'Host' && <Crown className="size-3 text-yellow-400" />}
                  </div>
                  <div className="text-white/40 text-[10px]">{p.role}</div>
                </div>
                {!p.isSelf && (
                  <button
                    onClick={() => removePerson(p.id)}
                    className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all"
                    title="Remove from room"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Invite section */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="px-4 pt-3 pb-2">
              <div className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-2">Invite to room</div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-white/30" />
                <input
                  value={inviteSearch}
                  onChange={e => setInviteSearch(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg text-white text-xs outline-none placeholder-white/30"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto pb-2">
              {availableInvites.map((c) => (
                <button
                  key={c.id}
                  onClick={() => invitePerson(c)}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="size-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: c.color }}>
                    {c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white/80 text-xs truncate">{c.name}</div>
                    <div className="text-white/30 text-[10px]">{c.role}</div>
                  </div>
                  <UserPlus className="size-4 text-white/30" />
                </button>
              ))}
              {availableInvites.length === 0 && (
                <div className="text-center text-white/30 text-xs py-3">
                  {inviteSearch ? 'No matches' : 'All contacts invited'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Follow mode banner */}
      {followMode && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(47,128,237,0.85)', backdropFilter: 'blur(8px)' }}>
          <Eye className="size-4 text-white" />
          <span className="text-white text-sm font-semibold">Everyone is following your view</span>
          <button
            onClick={() => setFollowMode(false)}
            className="ml-2 px-3 py-1 rounded-lg text-white text-xs font-semibold hover:bg-white/20 transition-colors"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            Release
          </button>
        </div>
      )}

      {/* Bottom action bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-2xl" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Mic */}
        <button
          onClick={() => setMicOn(!micOn)}
          className="size-11 rounded-xl flex items-center justify-center transition-all hover:brightness-110 active:scale-95"
          style={{ background: micOn ? 'rgba(255,255,255,0.15)' : '#FF1F1F' }}
          title={micOn ? 'Mute' : 'Unmute'}
        >
          {micOn ? <Mic className="size-5 text-white" /> : <MicOff className="size-5 text-white" />}
        </button>

        {/* Laser pointer */}
        <button
          onClick={() => setLaserOn(!laserOn)}
          className="size-11 rounded-xl flex items-center justify-center transition-all hover:brightness-110 active:scale-95"
          style={{ background: laserOn ? '#FF1F1F' : 'rgba(255,255,255,0.15)' }}
          title={laserOn ? 'Disable laser' : 'Laser pointer'}
        >
          <Crosshair className="size-5 text-white" />
        </button>

        <div className="w-px h-7 bg-white/20 mx-1" />

        {/* Follow me (host only) */}
        <button
          onClick={() => setFollowMode(!followMode)}
          className="h-11 px-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95"
          style={{ background: followMode ? '#2F80ED' : 'rgba(255,255,255,0.15)' }}
          title={followMode ? 'Release participants' : 'Make everyone follow your view'}
        >
          {followMode ? <EyeOff className="size-5 text-white" /> : <Eye className="size-5 text-white" />}
          <span className="text-white text-xs font-semibold hidden sm:inline">{followMode ? 'Release' : 'Follow Me'}</span>
        </button>

        <div className="w-px h-7 bg-white/20 mx-1" />

        {/* Chat */}
        <button
          onClick={() => { setShowChat(!showChat); if (showParticipants) setShowParticipants(false); }}
          className="size-11 rounded-xl flex items-center justify-center transition-all hover:brightness-110 active:scale-95 relative"
          style={{ background: showChat ? '#2F80ED' : 'rgba(255,255,255,0.15)' }}
          title="Chat"
        >
          <MessageSquare className="size-5 text-white" />
        </button>

        {/* Participants */}
        <button
          onClick={() => { setShowParticipants(!showParticipants); if (showChat) setShowChat(false); }}
          className="size-11 rounded-xl flex items-center justify-center transition-all hover:brightness-110 active:scale-95"
          style={{ background: showParticipants ? '#2F80ED' : 'rgba(255,255,255,0.15)' }}
          title="Participants"
        >
          <Users className="size-5 text-white" />
        </button>

        <div className="w-px h-7 bg-white/20 mx-1" />

        {/* Leave */}
        <button
          onClick={onLeave}
          className="h-11 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95"
          style={{ background: '#FF1F1F' }}
          title="Leave room"
        >
          <PhoneOff className="size-5 text-white" />
          <span className="text-white text-sm font-semibold hidden sm:inline">Leave</span>
        </button>
      </div>
    </>
  );
}

function App3DViewer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [procedureModal, setProcedureModal] = useState<string | null>(null);
  const sceneIframeRef = useRef<HTMLIFrameElement>(null);

  const openProcInfo = (id: string | null) => {
    setProcedureModal(id);
    setUrlParam('proc', id);
  };

  const params = new URLSearchParams(location.search);
  const urlMode = params.get('mode');
  const isImmersiveMode = urlMode === 'immersive';
  const startMode = urlMode === 'editor' ? '&startMode=editor' : isImmersiveMode ? '&startMode=immersive' : '';
  const configName = params.get('config');
  const isDemoComplete = params.get('demo') === 'kb-config-complete';
  const [showDemoComplete, setShowDemoComplete] = useState(isDemoComplete);

  // Stable cache-buster so parent re-renders don't reload the iframe
  const [cacheBuster] = useState(() => Date.now());

  // Auto-open from URL param
  useEffect(() => {
    const procId = getUrlParam('proc');
    if (procId && !procedureModal) setProcedureModal(procId);
  }, []);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'openProcedureInfo' && e.data.procedureId) {
        openProcInfo(e.data.procedureId);
      } else if (e.data?.type === 'openProcedure' && e.data.procedureId) {
        // "Run in 3D" from the 3D scene's built-in procedure modal
        navigate(`/app/procedure-editor/${e.data.procedureId}`);
      } else if (e.data?.type === 'backToKB') {
        navigate('/app/knowledgebase');
      } else if (e.data?.type === 'open-flow-settings') {
        // Open settings in web context (iframe's editor settings button)
        window.open('/web/project/generator/knowledgebase?settings=1', '_blank');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [navigate]);

  const proc = procedureModal ? sceneProcedures[procedureModal] : null;

  return (
    <>
      <div className="w-full h-full relative" style={{ overflow: 'hidden', touchAction: 'none' }}>
        <iframe
          ref={sceneIframeRef}
          src={`${import.meta.env.BASE_URL}app/digital-twin-scene.html?embedded=true${startMode}&v=${cacheBuster}`}
          className="absolute inset-0 w-full h-full border-0"
          style={{ overflow: 'hidden' }}
          title="Digital Twin"
          allow="autoplay; fullscreen; camera; xr-spatial-tracking"
        />
        {isImmersiveMode && <ImmersiveActionBar onLeave={() => navigate('/app/immersive')} iframeRef={sceneIframeRef} />}
        {showDemoComplete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
            <div className="rounded-xl shadow-2xl p-6 text-center" style={{ background: '#fff', width: 340 }}>
              <div className="text-4xl mb-3" style={{ color: '#11E874' }}>&#10003;</div>
              <div className="text-base font-bold mb-1" style={{ color: '#36415D' }}>Configurations Demo Complete!</div>
              <div className="text-sm mb-4" style={{ color: '#868D9E', lineHeight: 1.5 }}>
                The digital twin loaded with the <b style={{ color: '#2F80ED' }}>{configName || 'selected'}</b> configuration applied. Only parts defined in that configuration are visible.
                <br /><br />
                You've completed the full workflow: <b style={{ color: '#36415D' }}>create</b>, <b style={{ color: '#36415D' }}>customize</b>, <b style={{ color: '#36415D' }}>organize</b>, <b style={{ color: '#36415D' }}>save &amp; publish</b>, and <b style={{ color: '#36415D' }}>open from the Knowledge Base</b>.
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{ background: '#2F80ED', color: '#fff' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#5999F1')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#2F80ED')}
                  onClick={() => {
                    setShowDemoComplete(false);
                    // Clean up demo param from URL
                    const url = new URL(window.location.href);
                    url.searchParams.delete('demo');
                    history.replaceState(null, '', url.toString());
                    // Notify DebugMenu that demo is complete
                    window.postMessage({ type: 'debugDemoEnded', featureId: 'kb-config-selection' }, '*');
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {proc && (
        <AppProcedureInfoModal
          procedure={proc}
          onClose={() => openProcInfo(null)}
        />
      )}
    </>
  );
}

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showRecentPanel, setShowRecentPanel] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(true);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const updateBtnRef = useRef<HTMLButtonElement>(null);
  const updatePopupRef = useRef<HTMLDivElement>(null);
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [recentlyViewedOpen, setRecentlyViewedOpen] = useState(true);

  // Wrappers that keep URL params in sync with modal state
  const openSettings = (open: boolean) => {
    setShowSettings(open);
    setUrlParam('settings', open ? '1' : null);
  };
  const openSearchModal = (open: boolean) => {
    setShowSearchModal(open);
    setUrlParam('search', open ? '1' : null);
  };

  // Auto-open modals from URL params on mount
  useEffect(() => {
    if (getUrlParam('settings') === '1') setShowSettings(true);
    if (getUrlParam('search') === '1') setShowSearchModal(true);
  }, []);

  // Determine active nav item from URL
  const getActiveNav = () => {
    const path = location.pathname;
    if (path.includes('/remote-support')) return 'remote-support';
    if (path.includes('/immersive')) return 'immersive';
    if (path.includes('/ai-chat')) return 'ai-chat';
    if (path.includes('/search')) return 'search';
    return 'knowledgebase';
  };

  const activeNav = getActiveNav();

  // Role-based navigation filtering
  const { currentRole } = useRole();
  const visibleNavItems = navItems.filter((item) => {
    switch (item.id) {
      case 'knowledgebase': return true; // visible to all roles
      case 'remote-support': return hasAccess(currentRole, 'remote-support');
      case 'immersive': return currentRole !== 'guest';
      case 'ai-chat': return hasAccess(currentRole, 'ai-chat');
      default: return true;
    }
  });
  const canStartCall = hasAccess(currentRole, 'start-call');

  // Close menus on outside click
  useEffect(() => {
    const handler = () => {
      setShowUserMenu(false);
      setShowNotifDropdown(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Close update popup on outside click
  useEffect(() => {
    if (!showUpdatePopup) return;
    const handleClick = (e: MouseEvent) => {
      if (updatePopupRef.current && !updatePopupRef.current.contains(e.target as Node) &&
          updateBtnRef.current && !updateBtnRef.current.contains(e.target as Node)) {
        setShowUpdatePopup(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showUpdatePopup]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsUpdating(false);
    setShowUpdatePopup(false);
    setHasUpdate(false);
  };

  if (!isLoggedIn) {
    return <AppLoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  const [showSearchModal, setShowSearchModal] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      openSearchModal(true);
    }
  };

  // Check if we're on a page that shouldn't show the recently viewed panel
  const isRemoteSupport = location.pathname.includes('/remote-support');
  const isProcedureEditor = location.pathname.includes('/procedure-editor');
  const is3DViewer = location.pathname.includes('/3d-viewer');
  const isPreviewMode = new URLSearchParams(location.search).get('preview') === 'true';
  const isFullscreenEmbed = isProcedureEditor || is3DViewer;
  const isImmersive = location.pathname.includes('/immersive');
  const isDetailPage = location.pathname.includes('/procedure/') ||
                        location.pathname.includes('/ai-chat') ||
                        isImmersive ||
                        isFullscreenEmbed;

  return (
    <div className="flex flex-col w-full overflow-hidden" style={{  height: '100dvh' }}>
      {/* ===== TOP HEADER BAR ===== */}
      <header className="shrink-0 flex items-center px-4 lg:pl-0 lg:pr-0 gap-3" style={{ backgroundColor: '#FFFFFF', height: isPreviewMode ? '0px' : '55px', borderBottom: isPreviewMode ? 'none' : '1px solid #C2C9DB', overflow: isPreviewMode ? 'hidden' : undefined }}>
        {/* Logo — aligned above sidebar on desktop */}
        <div
          className="hidden lg:flex items-center justify-center shrink-0 cursor-pointer"
          style={{ width: '70px' }}
          onClick={() => navigate('/app/knowledgebase')}
        >
          <div className="size-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#36415D' }}>
            <span className="text-white" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: '16px' }}>F</span>
          </div>
        </div>
        <span className="hidden lg:block cursor-pointer" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: '20px', color: '#36415D' }} onClick={() => navigate('/app/knowledgebase')}>
          frontline.io
        </span>
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 shrink-0 cursor-pointer" onClick={() => navigate('/app/knowledgebase')}>
          <div className="size-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#36415D' }}>
            <span className="text-white" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: '16px' }}>F</span>
          </div>
          <span className="hidden sm:block" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: '20px', color: '#36415D' }}>
            Frontline
          </span>
        </div>

        {/* Search bar - centered */}
        <div className="flex-1 flex justify-center px-4">
          <div className="relative flex items-center" style={{ maxWidth: '400px', width: '100%' }}>
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#7F7F7F' }} />
            <input
              type="text"
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => openSearchModal(true)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); openSearchModal(true); } }}
              className="w-full pl-8 pr-9 text-xs border-none outline-none placeholder:text-[#7F7F7F]"
              style={{ backgroundColor: '#F5F5F5', borderRadius: '8px', height: '30px', color: '#36415D' }}
            />
            <button
              onClick={() => openSearchModal(true)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-md hover:bg-white/60 transition-colors"
              style={{ width: '22px', height: '22px', color: '#868D9E' }}
              title="Voice search"
            >
              <Mic style={{ width: '13px', height: '13px' }} />
            </button>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Update button */}
          {hasUpdate && (
            <div className="relative hidden sm:block">
              <button
                ref={updateBtnRef}
                onClick={(e) => { e.stopPropagation(); setShowUpdatePopup(!showUpdatePopup); }}
                className="flex items-center gap-1.5 px-4 text-sm hover:bg-black/5 transition-colors"
                style={{ border: '1px solid #C2C9DB', borderRadius: '25px', height: '32px', fontWeight: 'var(--font-weight-semibold)', color: '#36415D' }}
              >
                Update
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F80ED] animate-pulse" />
              </button>

              {showUpdatePopup && (
                <div
                  ref={updatePopupRef}
                  className="absolute right-0 top-full mt-2 w-[340px] bg-white border border-[#C2C9DB] z-50 overflow-hidden"
                  style={{ borderRadius: '12px', boxShadow: '0 8px 32px rgba(54,65,93,0.18)' }}
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-[#E9E9E9]" style={{ background: 'linear-gradient(135deg, #f8f0ff 0%, #f0f4ff 100%)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#2F80ED]/15 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="#2F80ED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 2.5v7M5.5 6L8 3.5 10.5 6M3 12.5h10"/>
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#36415D' }}>Version 2.4.0</p>
                        <p style={{ fontSize: '11px', color: '#868D9E' }}>Released March 10, 2026</p>
                      </div>
                    </div>
                  </div>

                  {/* Changelog */}
                  <div className="px-4 py-3">
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#36415D', marginBottom: '8px' }}>What's new</p>
                    <div className="flex flex-col gap-2">
                      {[
                        { tag: 'NEW', color: '#0aad52', bg: 'rgba(17,232,116,0.12)', text: 'Flow editor with drag-and-drop canvas' },
                        { tag: 'NEW', color: '#0aad52', bg: 'rgba(17,232,116,0.12)', text: 'Digital twin modal with connected flows' },
                        { tag: 'FIX', color: '#2F80ED', bg: 'rgba(47,128,237,0.12)', text: 'Improved 3D scene performance and selection' },
                        { tag: 'UPD', color: '#2F80ED', bg: 'rgba(47, 128, 237,0.12)', text: 'Media library integration with knowledge base' },
                        { tag: 'UPD', color: '#2F80ED', bg: 'rgba(47, 128, 237,0.12)', text: 'Analytics dashboard with PDF export' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="mt-0.5 shrink-0 px-1.5 py-px rounded" style={{ fontSize: '9px', fontWeight: 700, color: item.color, background: item.bg }}>{item.tag}</span>
                          <span style={{ fontSize: '13px', color: '#36415D' }}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                    <a
                      href="https://helpdesk.frontline.io/portal/en/kb/whats-new/frontline-io-web-release-content"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 hover:underline"
                      style={{ fontSize: '12px', color: '#2F80ED' }}
                    >
                      View full release notes
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 2.5h5v5M9.5 2.5l-7 7"/></svg>
                    </a>
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 border-t border-[#E9E9E9] flex items-center justify-between" style={{ background: '#FAFAFA' }}>
                    <button
                      onClick={() => setShowUpdatePopup(false)}
                      style={{ fontSize: '13px', color: '#868D9E' }}
                      className="hover:text-[#36415D] transition-colors"
                    >
                      Later
                    </button>
                    <button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-white transition-colors disabled:opacity-60"
                      style={{ fontSize: '13px', fontWeight: 700, background: '#2F80ED', borderRadius: '8px' }}
                    >
                      {isUpdating && (
                        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                      )}
                      {isUpdating ? 'Updating...' : 'Update now'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          <button
            className="relative p-1.5 hover:bg-black/5 rounded-lg" style={{ color: '#36415D' }}
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifPanel(!showNotifPanel);
            }}
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            {initialAppNotifications.filter(n => !n.read).length > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-destructive rounded-full flex items-center justify-center text-white"
                style={{ fontSize: '10px', fontWeight: 'var(--font-weight-bold)', padding: '0 4px' }}
              >
                {initialAppNotifications.filter(n => !n.read).length}
              </span>
            )}
          </button>

          {/* Settings / More menu */}
          <button
            className="p-1.5 hover:bg-black/5 rounded-lg hidden sm:flex" style={{ color: '#36415D' }}
            onClick={(e) => { e.stopPropagation(); openSettings(true); }}
            aria-label="Settings"
          >
            <Settings className="size-5" />
          </button>

          {/* User avatar */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <MemberAvatar
              name="Current Operator"
              initials="CO"
              size="lg"
              showTooltip={false}
              showProfileOnClick={false}
              onClick={() => setShowUserMenu(!showUserMenu)}
            />
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-[10px] shadow-elevation-lg border border-border z-50 py-1">
                <button className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-secondary flex items-center gap-2">
                  <User className="size-4" /> Profile
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-secondary flex items-center gap-2"
                  onClick={() => { setShowUserMenu(false); openSettings(true); }}
                >
                  <Settings className="size-4" /> Settings
                </button>
                <div className="border-t border-border my-1" />
                <button
                  className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-secondary flex items-center gap-2"
                  onClick={() => navigate('/')}
                >
                  <LogOut className="size-4" /> Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Windows window controls (desktop only) — decorative, non-functional */}
          <div className="hidden lg:flex items-center ml-2" style={{ gap: '2px' }} aria-hidden="true">
            <div style={{ width: '1px', height: '20px', backgroundColor: '#C2C9DB', marginRight: '6px' }} />
            {/* Minimize */}
            <div
              className="flex items-center justify-center hover:bg-black/5 transition-colors"
              style={{ width: '36px', height: '36px' }}
            >
              <svg width="10" height="1" viewBox="0 0 10 1" fill="none">
                <rect width="10" height="1" fill="#36415D" />
              </svg>
            </div>
            {/* Maximize */}
            <div
              className="flex items-center justify-center hover:bg-black/5 transition-colors"
              style={{ width: '36px', height: '36px' }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect x="0.5" y="0.5" width="9" height="9" stroke="#36415D" strokeWidth="1" fill="none" />
              </svg>
            </div>
            {/* Close */}
            <div
              className="flex items-center justify-center hover:bg-[#E81123] hover:text-white transition-colors group"
              style={{ width: '36px', height: '36px' }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="#36415D" strokeWidth="1.2" className="group-hover:stroke-white" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN BODY ===== */}
      <div className="flex flex-1 min-h-0">
        {/* ===== LEFT SIDEBAR (icon nav) ===== */}
        {!isFullscreenEmbed && <nav
          role="navigation"
          aria-label="Main navigation"
          className="shrink-0 bg-card flex-col z-50 hidden lg:flex lg:items-center w-[70px]"
          style={{ borderRight: '1px solid #C2C9DB', paddingBottom: '16px' }}
        >
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                }}
                className="relative flex items-center transition-colors"
                style={{
                  color: isActive ? '#36415D' : '#7F7F7F',
                }}
                title={item.label}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                    style={{ width: '2px', height: '59px', backgroundColor: '#36415D' }}
                  />
                )}

                {/* Desktop: icon + small label stacked vertically */}
                <div className="hidden lg:flex flex-col items-center justify-center" style={{ width: '70px', paddingTop: '10px', paddingBottom: '10px', gap: '3px' }}>
                  <Icon style={{ width: '22px', height: '22px', flexShrink: 0 }} />
                  <span
                    className="uppercase text-center leading-tight"
                    style={{
                      fontSize: '8px',
                      fontWeight: 'var(--font-weight-bold)',
                      letterSpacing: '0.3px',
                      width: '62px',
                      wordWrap: 'break-word',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Mobile: icon + label horizontal */}
                <div
                  className="flex lg:hidden items-center gap-3 w-full"
                  style={{
                    padding: '12px 20px',
                    backgroundColor: isActive ? '#F0F4FF' : 'transparent',
                  }}
                >
                  <Icon style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)' }}>
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}

          <div className="flex-1" />

          {/* Help button at bottom */}
          <div className="flex justify-center">
            <button
              className="flex items-center justify-center rounded-full transition-colors hover:opacity-100"
              style={{
                width: '30px',
                height: '30px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #C2C9DB',
                color: '#36415D',
                fontSize: '14px',
                fontWeight: 'var(--font-weight-bold)',
              }}
              title="Help"
              aria-label="Help"
            >
              ?
            </button>
          </div>
        </nav>}

        {/* ===== RIGHT SIDEBAR PANEL (desktop only) ===== */}
        {!isDetailPage && showRecentPanel && (
          <aside
            className="hidden xl:flex shrink-0 bg-card flex-col overflow-y-auto"
            style={{ width: '371px', borderRight: '1px solid #C2C9DB', paddingTop: '10px' }}
          >
            {isRemoteSupport && hasAccess(currentRole, 'remote-support') ? (
              /* ---- CONTACTS LIST for Remote Support ---- */
              <>
                <div className="px-4 pb-2" style={{ borderBottom: '1px solid #C2C9DB' }}>
                  <div className="flex items-center gap-2" style={{ height: '40px' }}>
                    <User className="size-4" style={{ color: '#7F7F7F' }} />
                    <span
                      className="flex-1 uppercase"
                      style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: '#36415D', letterSpacing: '0.5px' }}
                    >
                      People
                    </span>
                  </div>
                  <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#7F7F7F' }} />
                    <input
                      type="text"
                      placeholder="Search people..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm bg-secondary border-none outline-none text-foreground placeholder:text-muted"
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {sidebarContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors cursor-pointer"
                    >
                      <MemberAvatar
                        name={contact.name}
                        initials={contact.initials}
                        color={contact.color}
                        size="xl"
                        showStatus={true}
                        status={contact.online ? 'active' : 'offline'}
                        role={contact.role}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="truncate" style={{ fontSize: '13px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
                          {contact.name}
                        </div>
                        <div className="truncate" style={{ fontSize: '11px', color: '#7F7F7F' }}>
                          {contact.role}
                        </div>
                      </div>
                      {canStartCall && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" aria-label={`Video call ${contact.name}`}>
                          <Video className="size-3.5" />
                        </button>
                        <button className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" aria-label={`Phone call ${contact.name}`}>
                          <Phone className="size-3.5" />
                        </button>
                      </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* ---- FAVORITES & RECENTLY VIEWED for KB pages ---- */
              <>
                {/* Favorites */}
                <div style={{ borderBottom: '1px solid #C2C9DB' }}>
                  <button
                    onClick={() => setFavoritesOpen(!favoritesOpen)}
                    className="flex items-center gap-2 w-full px-4 hover:bg-secondary/50 transition-colors"
                    style={{ height: '40px' }}
                  >
                    <Star className="size-4" style={{ color: '#7F7F7F' }} />
                    <span
                      className="flex-1 text-left uppercase"
                      style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: '#36415D', letterSpacing: '0.5px' }}
                    >
                      Favorites
                    </span>
                    <ChevronDown className="size-4 transition-transform" style={{ color: '#7F7F7F', transform: favoritesOpen ? undefined : 'rotate(-90deg)' }} />
                  </button>
                  {favoritesOpen && (
                    <div className="px-4 pb-2">
                      {appFavorites.map((item) => (
                        <div
                          key={item.id}
                          className="hover:bg-secondary rounded-lg cursor-pointer transition-colors px-2"
                          style={{ paddingTop: '6px', paddingBottom: '6px' }}
                          onClick={() => {
                            if (item.type === 'procedure') {
                              navigate(`/app/project/${item.projectId}/kb?open=${item.id}`);
                            } else if (item.type === 'digital-twin') {
                              navigate(`/app/3d-viewer`);
                            } else {
                              navigate(`/app/project/${item.projectId}/kb`);
                            }
                          }}
                        >
                          <div className="truncate" style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
                            {item.name}
                          </div>
                          <div className="truncate" style={{ fontSize: '12px', fontWeight: 'var(--font-weight-normal)', color: '#7F7F7F' }}>
                            {item.projectName}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recently Viewed */}
                <div>
                  <button
                    onClick={() => setRecentlyViewedOpen(!recentlyViewedOpen)}
                    className="flex items-center gap-2 w-full px-4 hover:bg-secondary/50 transition-colors"
                    style={{ height: '40px' }}
                  >
                    <Clock className="size-4" style={{ color: '#7F7F7F' }} />
                    <span
                      className="flex-1 text-left uppercase"
                      style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: '#36415D', letterSpacing: '0.5px' }}
                    >
                      Recently Viewed
                    </span>
                    <ChevronDown className="size-4 transition-transform" style={{ color: '#7F7F7F', transform: recentlyViewedOpen ? undefined : 'rotate(-90deg)' }} />
                  </button>
                  {recentlyViewedOpen && (
                    <div className="px-4 pb-2">
                      {appRecentlyViewed.map((item) => (
                        <div
                          key={item.id}
                          className="hover:bg-secondary rounded-lg cursor-pointer transition-colors px-2"
                          style={{ paddingTop: '6px', paddingBottom: '6px' }}
                          onClick={() => {
                            if (item.type === 'procedure') {
                              navigate(`/app/project/${item.projectId}/kb?open=${item.id}`);
                            } else if (item.type === 'digital-twin') {
                              navigate(`/app/3d-viewer`);
                            } else {
                              navigate(`/app/project/${item.projectId}/kb`);
                            }
                          }}
                        >
                          <div className="truncate" style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
                            {item.name}
                          </div>
                          <div className="truncate" style={{ fontSize: '12px', fontWeight: 'var(--font-weight-normal)', color: '#7F7F7F' }}>
                            {item.projectName}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </aside>
        )}

        {/* ===== MAIN CONTENT ===== */}
        <main className={`flex-1 min-w-0 min-h-0 bg-background ${isFullscreenEmbed ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <Routes>
            <Route path="procedure-editor/:procedureId" element={
              <DndProvider backend={HTML5Backend}>
                <ProcedureEditor />
              </DndProvider>
            } />
            <Route path="3d-viewer" element={<App3DViewer />} />
            <Route path="knowledgebase" element={<AppKnowledgeBasePage />} />
            <Route path="project/:projectId/kb" element={<AppProjectKBPage />} />
            <Route path="project/:projectId/folder/:folderId" element={<AppFolderBrowsePage />} />
            <Route path="remote-support" element={<AppRemoteSupportPage />} />
            <Route path="ai-chat" element={<AppAIChatPage />} />
            {/* Notifications is now a side panel, not a page */}
            <Route path="immersive" element={<AppVirtualRoomPage />} />
            <Route path="*" element={<Navigate to="/app/knowledgebase" replace />} />
          </Routes>
        </main>
      </div>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      {!isFullscreenEmbed && <nav role="navigation" aria-label="Mobile navigation" className="lg:hidden shrink-0 bg-card flex items-center justify-around" style={{ borderTop: '1px solid #C2C9DB', minHeight: '56px', padding: '0 4px', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          // Short labels for bottom nav
          const shortLabel = item.id === 'knowledgebase' ? 'Projects'
            : item.id === 'remote-support' ? 'Support'
            : item.id === 'immersive' ? 'Room'
            : item.id === 'ai-chat' ? 'AI Chat'
            : item.label;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors"
              style={{
                color: isActive ? '#2F80ED' : '#7F7F7F',
                minWidth: '48px',
                minHeight: '44px',
                padding: '4px 6px',
              }}
            >
              <Icon style={{ width: '20px', height: '20px' }} />
              <span style={{
                fontSize: '9px',
                fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
                lineHeight: '1',
              }}>
                {shortLabel}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setShowNotifPanel(!showNotifPanel)}
          className="flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors relative"
          style={{
            color: showNotifPanel ? '#2F80ED' : '#7F7F7F',
            minWidth: '48px',
            minHeight: '44px',
            padding: '4px 6px',
          }}
        >
          <Bell style={{ width: '20px', height: '20px' }} />
          <span
            className="absolute rounded-full bg-destructive"
            style={{ top: '2px', right: '8px', width: '6px', height: '6px' }}
          />
          <span style={{ fontSize: '9px', fontWeight: activeNav === 'notifications' ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)', lineHeight: '1' }}>
            Alerts
          </span>
        </button>
      </nav>}

      {/* Notifications Side Panel */}
      {showNotifPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setShowNotifPanel(false)}
          />
          {/* Panel */}
          <div
            className="fixed top-0 right-0 bottom-0 z-[61] bg-card flex flex-col shadow-elevation-lg"
            style={{
              width: '400px',
              maxWidth: '100vw',
              borderLeft: '1px solid #C2C9DB',
              animation: 'slide-in-right 0.25s ease-out',
            }}
          >
            {/* Close button overlaid on top-right, aligned with three-dots */}
            <button
              onClick={() => setShowNotifPanel(false)}
              className="absolute right-3 z-10 p-2 hover:bg-secondary rounded-lg transition-colors"
              style={{ color: '#7F7F7F', top: '16px' }}
              aria-label="Close notifications"
            >
              <X className="size-5" />
            </button>
            {/* Content — AppNotificationsPage has its own header */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <AppNotificationsPage />
            </div>
          </div>
          <style>{`
            @keyframes slide-in-right {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}

      {/* Settings Modal */}
      {showSettings && <AppSettingsModal onClose={() => openSettings(false)} />}

      {/* Search Modal */}
      <AppSearchModal
        isOpen={showSearchModal}
        onClose={() => { openSearchModal(false); setSearchQuery(''); }}
        initialQuery={searchQuery}
      />
    </div>
  );
}
