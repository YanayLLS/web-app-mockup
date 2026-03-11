import { Loader2, X, Mic, Video, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface MediaDeviceOption {
  deviceId: string;
  label: string;
}

interface AppMeetingJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppMeetingJoinModal({ isOpen, onClose }: AppMeetingJoinModalProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [status, setStatus] = useState<'default' | 'loading' | 'error'>('default');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [audioDevices, setAudioDevices] = useState<MediaDeviceOption[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceOption[]>([]);
  const [selectedAudio, setSelectedAudio] = useState('');
  const [selectedVideo, setSelectedVideo] = useState('');

  // Enumerate devices when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function enumerate() {
      try {
        // Request permission to get labeled devices
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).catch(() => null);
        const devices = await navigator.mediaDevices.enumerateDevices();

        const audio: MediaDeviceOption[] = devices
          .filter(d => d.kind === 'audioinput')
          .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + 1}` }));
        const video: MediaDeviceOption[] = devices
          .filter(d => d.kind === 'videoinput')
          .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Camera ${i + 1}` }));

        setAudioDevices(audio);
        setVideoDevices(video);
        if (audio.length && !selectedAudio) setSelectedAudio(audio[0].deviceId);
        if (video.length && !selectedVideo) setSelectedVideo(video[0].deviceId);

        // Release the stream
        stream?.getTracks().forEach(t => t.stop());
      } catch {
        // Permission denied or no devices — show fallback defaults
        setAudioDevices([{ deviceId: 'default', label: 'Default Microphone' }]);
        setVideoDevices([{ deviceId: 'default', label: 'Default Camera' }]);
        if (!selectedAudio) setSelectedAudio('default');
        if (!selectedVideo) setSelectedVideo('default');
      }
    }
    enumerate();
  }, [isOpen]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setStatus('default');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleJoin = () => {
    const code = digits.join('');
    if (code.length < 6) return;

    setStatus('loading');
    setTimeout(() => {
      setStatus('error');
    }, 1500);
  };

  const code = digits.join('');

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className="pointer-events-auto bg-card rounded-[var(--radius)] shadow-elevation-lg border border-border overflow-hidden"
          style={{ width: '440px', maxWidth: '100%' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>Join Meeting</h3>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
              <X className="size-4" style={{ color: '#36415D' }} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <h2 className="text-center text-foreground mb-5" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: '15px' }}>
              Enter meeting password
            </h2>

              {/* Segmented input: 2 groups of 3 */}
              <div className="flex items-center justify-center gap-3 mb-5">
                {/* Group 1 */}
                <div className="flex gap-1.5 sm:gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digits[i]}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className={`w-12 h-12 sm:size-11 text-center text-lg rounded-lg outline-none transition-colors
                        ${status === 'error' ? 'border-2 border-destructive bg-destructive/5' : 'border-2 border-dashed border-input bg-card focus:border-primary focus:border-solid'}`}
                      style={{ fontWeight: 'var(--font-weight-bold)', fontSize: '16px' }}
                    />
                  ))}
                </div>

                <span className="text-muted text-lg">-</span>

                {/* Group 2 */}
                <div className="flex gap-1.5 sm:gap-1.5">
                  {[3, 4, 5].map((i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digits[i]}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className={`w-12 h-12 sm:size-11 text-center text-lg rounded-lg outline-none transition-colors
                        ${status === 'error' ? 'border-2 border-destructive bg-destructive/5' : 'border-2 border-dashed border-input bg-card focus:border-primary focus:border-solid'}`}
                      style={{ fontWeight: 'var(--font-weight-bold)', fontSize: '16px' }}
                    />
                  ))}
                </div>
              </div>

              {/* Error message */}
              {status === 'error' && (
                <p className="text-center text-sm text-destructive mb-4" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  Invalid meeting password
                </p>
              )}

              {/* Device Selection */}
              <div className="space-y-3 mb-5">
                {/* Microphone */}
                <div className="relative">
                  <label className="flex items-center gap-2 text-xs text-muted mb-1.5" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    <Mic className="size-3.5" />
                    Microphone
                  </label>
                  <div className="relative">
                    <select
                      value={selectedAudio}
                      onChange={(e) => setSelectedAudio(e.target.value)}
                      className="w-full appearance-none bg-card border border-border rounded-[var(--radius)] px-3 py-2.5 pr-8 text-sm text-foreground outline-none focus:border-primary transition-colors cursor-pointer min-h-[44px]"
                    >
                      {audioDevices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted pointer-events-none" />
                  </div>
                </div>

                {/* Camera */}
                <div className="relative">
                  <label className="flex items-center gap-2 text-xs text-muted mb-1.5" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    <Video className="size-3.5" />
                    Camera
                  </label>
                  <div className="relative">
                    <select
                      value={selectedVideo}
                      onChange={(e) => setSelectedVideo(e.target.value)}
                      className="w-full appearance-none bg-card border border-border rounded-[var(--radius)] px-3 py-2.5 pr-8 text-sm text-foreground outline-none focus:border-primary transition-colors cursor-pointer min-h-[44px]"
                    >
                      {videoDevices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Join button */}
              <button
                onClick={handleJoin}
                disabled={code.length < 6 || status === 'loading'}
                className="w-full py-3 min-h-[48px] bg-primary text-white rounded-[var(--radius-button)] flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontWeight: 'var(--font-weight-semibold)' }}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'JOIN'
                )}
              </button>
          </div>
        </div>
      </div>
    </>
  );
}
