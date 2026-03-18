import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Phone, Maximize2, Minimize2, Users } from 'lucide-react';
import { useActiveCall } from '../contexts/ActiveCallContext';
import { useAppPopup } from '../contexts/AppPopupContext';
import { useState, useEffect, useRef } from 'react';

export function FloatingMinimizedCall() {
  const { activeCall, updateCallState, isCallMinimized, setIsCallMinimized } = useActiveCall();
  const { confirm } = useAppPopup();
  const navigate = useNavigate();
  const location = useLocation();
  const [callDuration, setCallDuration] = useState('0:00');
  const [isExpanded, setIsExpanded] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  const isOnRemoteSupportPage = location.pathname === '/remote-support' || location.pathname === '/web/remote-support';

  useEffect(() => {
    if (!activeCall) return;
    const updateDuration = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - activeCall.startTime.getTime()) / 1000);
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setCallDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [activeCall]);

  useEffect(() => {
    if (activeCall && !isOnRemoteSupportPage) {
      setIsCallMinimized(true);
    } else if (isOnRemoteSupportPage) {
      setIsCallMinimized(false);
    }
  }, [isOnRemoteSupportPage, activeCall, setIsCallMinimized]);

  if (!activeCall || !isCallMinimized || isOnRemoteSupportPage) return null;

  const handleMaximize = () => {
    setIsCallMinimized(false);
    navigate('/web/remote-support');
  };

  const handleEndCall = async () => {
    const ok = await confirm('Are you sure you want to end the call?', { title: 'End Call', variant: 'warning', destructive: true });
    if (ok) {
      updateCallState({ isAudioEnabled: false, isVideoEnabled: false });
      setIsCallMinimized(false);
      navigate('/web/remote-support');
    }
  };

  return (
    <>
      {/* Compact indicator */}
      {!isExpanded && (
        <div
          className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)', maxWidth: 'calc(100vw - 32px)' }}
          onClick={() => setIsExpanded(true)}
        >
          {/* Pulsing indicator */}
          <div className="relative flex-shrink-0">
            <div className="size-2.5 rounded-full" style={{ backgroundColor: '#11E874' }} />
            <div className="absolute inset-0 size-2.5 rounded-full animate-ping opacity-40" style={{ backgroundColor: '#11E874' }} />
          </div>

          {/* Call Info */}
          <div>
            <div className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
              {activeCall.meetingTitle}
            </div>
            <div className="text-xs text-muted">{callDuration}</div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-1 pl-3 border-l border-border/60">
            <button
              onClick={(e) => { e.stopPropagation(); handleMaximize(); }}
              className="p-2 hover:bg-secondary rounded-lg transition-colors text-foreground"
              title="Return to call"
            >
              <Maximize2 className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Expanded floating video window */}
      {isExpanded && (
        <div
          className="fixed bottom-6 right-4 sm:right-6 z-50 bg-card border border-border rounded-xl overflow-hidden"
          style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.15)', width: '360px', maxWidth: 'calc(100vw - 32px)' }}
        >
          {/* Video preview area */}
          <div ref={videoRef} className="relative bg-background aspect-video flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/40" />

            {/* Video off state */}
            {!activeCall.isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="size-16 rounded-full flex items-center justify-center text-white text-2xl"
                    style={{ background: 'linear-gradient(135deg, #2F80ED, #004FFF)', fontWeight: 'var(--font-weight-bold)' }}
                  >
                    {activeCall.meetingTitle.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-muted">Camera off</span>
                </div>
              </div>
            )}

            {/* Call status overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-full border border-border/60">
              <div className="relative">
                <div className="size-2 rounded-full" style={{ backgroundColor: '#11E874' }} />
                <div className="absolute inset-0 size-2 rounded-full animate-ping opacity-40" style={{ backgroundColor: '#11E874' }} />
              </div>
              <span className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                {callDuration}
              </span>
            </div>

            {/* Minimize button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm hover:bg-background rounded-lg transition-colors text-foreground border border-border/60"
              title="Minimize"
            >
              <Minimize2 className="size-4" />
            </button>
          </div>

          {/* Controls bar */}
          <div className="p-3 bg-secondary/20 border-t border-border/60">
            <div className="text-sm text-foreground mb-2.5" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
              {activeCall.meetingTitle}
            </div>

            <div className="flex items-center justify-between gap-2">
              {/* Left controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); updateCallState({ isAudioEnabled: !activeCall.isAudioEnabled }); }}
                  className={`p-2.5 rounded-lg transition-all ${
                    activeCall.isAudioEnabled
                      ? 'hover:bg-secondary text-foreground bg-card border border-border'
                      : 'bg-destructive text-white hover:brightness-110'
                  }`}
                  title={activeCall.isAudioEnabled ? 'Mute' : 'Unmute'}
                >
                  {activeCall.isAudioEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); updateCallState({ isVideoEnabled: !activeCall.isVideoEnabled }); }}
                  className={`p-2.5 rounded-lg transition-all ${
                    activeCall.isVideoEnabled
                      ? 'hover:bg-secondary text-foreground bg-card border border-border'
                      : 'bg-destructive text-white hover:brightness-110'
                  }`}
                  title={activeCall.isVideoEnabled ? 'Stop video' : 'Start video'}
                >
                  {activeCall.isVideoEnabled ? <Video className="size-4" /> : <VideoOff className="size-4" />}
                </button>

                <button
                  onClick={handleEndCall}
                  className="p-2.5 bg-destructive hover:brightness-110 hover:shadow-md hover:shadow-destructive/20 rounded-lg transition-all text-white ml-0.5"
                  title="End call"
                >
                  <Phone className="size-4" />
                </button>
              </div>

              {/* Right - Maximize */}
              <button
                onClick={handleMaximize}
                className="px-3 py-2 bg-primary hover:brightness-110 hover:shadow-md hover:shadow-primary/20 rounded-lg transition-all text-primary-foreground flex items-center gap-2"
                title="Return to full screen"
              >
                <Maximize2 className="size-4" />
                <span className="text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>Open</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted mt-2.5">
              <Users size={12} />
              <span>{activeCall.participantCount} {activeCall.participantCount === 1 ? 'participant' : 'participants'}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
