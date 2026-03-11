import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Phone, Maximize2, Minimize2 } from 'lucide-react';
import { useActiveCall } from '../contexts/ActiveCallContext';
import { useState, useEffect, useRef } from 'react';

export function FloatingMinimizedCall() {
  const { activeCall, updateCallState, isCallMinimized, setIsCallMinimized } = useActiveCall();
  const navigate = useNavigate();
  const location = useLocation();
  const [callDuration, setCallDuration] = useState('0:00');
  const [isExpanded, setIsExpanded] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  
  // Don't show on remote support page or if not minimized
  const isOnRemoteSupportPage = location.pathname === '/remote-support' || location.pathname === '/web/remote-support';
  
  // Calculate call duration
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
  
  // Auto-minimize when navigating away from remote support page
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
  
  const handleEndCall = () => {
    // This would normally end the call - for demo, just clear the active call
    if (window.confirm('Are you sure you want to end the call?')) {
      updateCallState({ isAudioEnabled: false, isVideoEnabled: false });
      setIsCallMinimized(false);
      navigate('/web/remote-support');
    }
  };
  
  return (
    <>
      {/* Compact indicator when not expanded */}
      {!isExpanded && (
        <div
          className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-[var(--radius)] cursor-pointer hover:border-primary/50 transition-all"
          style={{
            boxShadow: 'var(--elevation-lg)',
            fontFamily: 'var(--font-family)',
            maxWidth: 'calc(100vw - 32px)'
          }}
          onClick={() => setIsExpanded(true)}
        >
          {/* Pulsing indicator */}
          <div className="size-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
          
          {/* Call Info */}
          <div>
            <div 
              className="text-sm text-foreground"
              style={{ fontWeight: 'var(--font-weight-semibold)' }}
            >
              {activeCall.meetingTitle}
            </div>
            <div 
              className="text-xs text-muted"
              style={{ fontFamily: 'var(--font-family)' }}
            >
              {callDuration}
            </div>
          </div>
          
          {/* Quick actions */}
          <div className="flex items-center gap-1 pl-3 border-l border-border">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMaximize();
              }}
              className="p-2 hover:bg-secondary rounded-[var(--radius)] transition-colors text-foreground"
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
          className="fixed bottom-6 right-4 sm:right-6 z-50 bg-card border border-border rounded-[var(--radius)] overflow-hidden"
          style={{
            boxShadow: 'var(--elevation-xl)',
            fontFamily: 'var(--font-family)',
            width: '360px',
            maxWidth: 'calc(100vw - 32px)'
          }}
        >
          {/* Video preview area */}
          <div 
            ref={videoRef}
            className="relative bg-background aspect-video flex items-center justify-center"
          >
            {/* Mock video feed */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/40" />
            
            {/* Video off state */}
            {!activeCall.isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-2">
                  <div 
                    className="size-16 rounded-full bg-primary/20 flex items-center justify-center text-primary"
                    style={{ fontWeight: 'var(--font-weight-bold)' }}
                  >
                    <span className="text-2xl">
                      {activeCall.meetingTitle.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span 
                    className="text-sm text-muted"
                    style={{ fontFamily: 'var(--font-family)' }}
                  >
                    Camera off
                  </span>
                </div>
              </div>
            )}
            
            {/* Call status overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-full border border-border">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              <span 
                className="text-xs text-foreground"
                style={{ fontWeight: 'var(--font-weight-medium)' }}
              >
                {callDuration}
              </span>
            </div>
            
            {/* Minimize button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm hover:bg-background rounded-[var(--radius)] transition-colors text-foreground border border-border"
              title="Minimize"
            >
              <Minimize2 className="size-4" />
            </button>
          </div>
          
          {/* Controls bar */}
          <div className="p-3 bg-secondary/30 border-t border-border">
            <div 
              className="text-sm text-foreground mb-2"
              style={{ fontWeight: 'var(--font-weight-semibold)' }}
            >
              {activeCall.meetingTitle}
            </div>
            
            <div className="flex items-center justify-between gap-2">
              {/* Left side controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateCallState({ isAudioEnabled: !activeCall.isAudioEnabled });
                  }}
                  className={`p-2.5 rounded-[var(--radius)] transition-colors ${ 
                    activeCall.isAudioEnabled 
                      ? 'hover:bg-secondary text-foreground bg-background' 
                      : 'bg-destructive text-white hover:bg-destructive/90'
                  }`}
                  title={activeCall.isAudioEnabled ? 'Mute' : 'Unmute'}
                >
                  {activeCall.isAudioEnabled ? (
                    <Mic className="size-4" />
                  ) : (
                    <MicOff className="size-4" />
                  )}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateCallState({ isVideoEnabled: !activeCall.isVideoEnabled });
                  }}
                  className={`p-2.5 rounded-[var(--radius)] transition-colors ${
                    activeCall.isVideoEnabled 
                      ? 'hover:bg-secondary text-foreground bg-background' 
                      : 'bg-destructive text-white hover:bg-destructive/90'
                  }`}
                  title={activeCall.isVideoEnabled ? 'Stop video' : 'Start video'}
                >
                  {activeCall.isVideoEnabled ? (
                    <Video className="size-4" />
                  ) : (
                    <VideoOff className="size-4" />
                  )}
                </button>
                
                <button
                  onClick={handleEndCall}
                  className="p-2.5 bg-destructive hover:bg-destructive/90 rounded-[var(--radius)] transition-colors text-white ml-1"
                  title="End call"
                >
                  <Phone className="size-4" />
                </button>
              </div>
              
              {/* Right side - Maximize */}
              <button
                onClick={handleMaximize}
                className="px-3 py-2 bg-primary hover:bg-primary/90 rounded-[var(--radius)] transition-colors text-primary-foreground flex items-center gap-2"
                title="Return to full screen"
              >
                <Maximize2 className="size-4" />
                <span 
                  className="text-sm"
                  style={{ fontWeight: 'var(--font-weight-medium)' }}
                >
                  Open
                </span>
              </button>
            </div>
            
            <div 
              className="text-xs text-muted mt-2 text-center"
              style={{ fontFamily: 'var(--font-family)' }}
            >
              {activeCall.participantCount} {activeCall.participantCount === 1 ? 'participant' : 'participants'}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
