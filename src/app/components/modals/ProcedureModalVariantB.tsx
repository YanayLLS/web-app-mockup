import { useState } from 'react';
import {
  X,
  Play,
  Maximize2,
  Edit2,
  Box,
  Share2,
  Star,
  ChevronDown,
  ExternalLink,
  User,
  Calendar,
  Clock,
  Settings,
  History,
} from 'lucide-react';

interface ProcedureModalVariantBProps {
  procedure: {
    id: string;
    name: string;
    description?: string;
    connectedDigitalTwinIds?: string[];
    digitalTwinId?: string;
    thumbnail?: string;
    isPublished: boolean;
    hasUnpublishedChanges: boolean;
    publishedVersion?: string;
    publishedDate?: string;
    createdBy: string;
    createdDate: string;
    lastEditedBy: string;
    lastEdited: string;
  };
  onClose: () => void;
}

export function ProcedureModalVariantB({ procedure, onClose }: ProcedureModalVariantBProps) {
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [versionHistoryExpanded, setVersionHistoryExpanded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0, 0, 0, 0.65)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-b-title"
        className="flex overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 1200,
          height: '85vh',
          borderRadius: 16,
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* =========================================== */}
        {/* LEFT — 3D Preview Area (65%)                */}
        {/* =========================================== */}
        <div
          className="relative flex flex-col"
          style={{
            width: '65%',
            background: 'linear-gradient(160deg, #1a3a6e 0%, #2F80ED 40%, #004fff 100%)',
          }}
        >
          {/* Floating top-left controls */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            {/* DT name badge */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <Box size={14} className="text-white/80" />
              <span
                className="text-xs text-white/90"
                style={{ fontWeight: 600 }}
              >
                Generator Digital Twin
              </span>
            </div>

            {/* Fullscreen button */}
            <button
              className="flex items-center justify-center rounded-lg transition-colors"
              style={{
                width: 32,
                height: 32,
                background: 'rgba(0, 0, 0, 0.35)',
                backdropFilter: 'blur(12px)',
              }}
              aria-label="Fullscreen"
            >
              <Maximize2 size={14} className="text-white/80" />
            </button>
          </div>

          {/* Floating close button — top-right of preview */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
            style={{
              width: 32,
              height: 32,
              background: 'rgba(0, 0, 0, 0.35)',
              backdropFilter: 'blur(12px)',
            }}
            aria-label="Close modal"
          >
            <X size={16} className="text-white" />
          </button>

          {/* Centered play button */}
          <div className="flex-1 flex items-center justify-center">
            <button
              className="flex items-center justify-center rounded-full transition-all hover:scale-105"
              style={{
                width: 72,
                height: 72,
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
              aria-label="Play 3D preview"
            >
              <Play size={32} className="text-white ml-1" fill="white" />
            </button>
          </div>

          {/* Bottom bar overlay */}
          <div
            className="relative z-10 flex items-center gap-3 px-5 py-3.5"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.0) 100%)',
            }}
          >
            <button
              className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm transition-all hover:bg-white/15"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.35)',
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
              }}
            >
              <span>Edit in app</span>
              <ExternalLink size={12} />
            </button>
            <button
              className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm transition-all hover:brightness-110"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
              }}
            >
              <span>Edit in canvas</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>

        {/* =========================================== */}
        {/* RIGHT — Info Panel (35%)                    */}
        {/* =========================================== */}
        <div
          className="flex flex-col"
          style={{
            width: '35%',
            background: '#FFFFFF',
          }}
        >
          {/* Scrollable content */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#C2C9DB transparent' }}
          >
            <div className="px-6 py-6">
              {/* Title + edit icon */}
              <div className="flex items-start gap-2 group mb-3">
                <h2
                  id="variant-b-title"
                  className="flex-1 leading-tight"
                  style={{
                    color: '#36415D',
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {procedure.name}
                </h2>
                <button
                  className="mt-1 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#868D9E' }}
                  aria-label="Edit title"
                >
                  <Edit2 size={14} />
                </button>
              </div>

              {/* Status row */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Published badge */}
                {procedure.isPublished ? (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                    style={{
                      background: 'rgba(17, 232, 116, 0.1)',
                      color: '#0B9E4D',
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#11E874',
                        display: 'inline-block',
                      }}
                    />
                    Published
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                    style={{
                      background: 'rgba(127, 127, 127, 0.1)',
                      color: '#7F7F7F',
                      fontWeight: 600,
                    }}
                  >
                    Draft
                  </span>
                )}

                {/* Version */}
                {procedure.publishedVersion && (
                  <span
                    className="text-xs"
                    style={{ color: '#868D9E' }}
                  >
                    v{procedure.publishedVersion}
                  </span>
                )}

                {/* Separator dot */}
                {procedure.publishedDate && (
                  <>
                    <span style={{ color: '#C2C9DB' }}>·</span>
                    <span
                      className="text-xs"
                      style={{ color: '#868D9E' }}
                    >
                      {procedure.publishedDate}
                    </span>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="my-5" style={{ height: 1, background: '#E9E9E9' }} />

              {/* Description */}
              <div>
                <h3
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: '#868D9E', fontWeight: 700, letterSpacing: '0.06em' }}
                >
                  Description
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: '#36415D' }}
                >
                  {procedure.description ||
                    'A step-by-step maintenance procedure for the industrial generator unit. Covers inspection, component replacement, and safety verification workflows connected to the 3D digital twin.'}
                </p>
              </div>

              {/* Divider */}
              <div className="my-5" style={{ height: 1, background: '#E9E9E9' }} />

              {/* Connected Digital Twin */}
              <div>
                <h3
                  className="text-xs uppercase tracking-wider mb-3"
                  style={{ color: '#868D9E', fontWeight: 700, letterSpacing: '0.06em' }}
                >
                  Connected Digital Twin
                </h3>
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                  style={{
                    background: '#F5F5F5',
                    border: '1px solid #E9E9E9',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-md"
                    style={{
                      width: 32,
                      height: 32,
                      background: 'rgba(47, 128, 237, 0.08)',
                    }}
                  >
                    <Box size={16} style={{ color: '#2F80ED' }} />
                  </div>
                  <span
                    className="text-sm flex-1"
                    style={{ color: '#36415D', fontWeight: 600 }}
                  >
                    Generator Digital Twin
                  </span>
                  <ExternalLink size={12} style={{ color: '#868D9E' }} />
                </div>
              </div>

              {/* Divider */}
              <div className="my-5" style={{ height: 1, background: '#E9E9E9' }} />

              {/* Details — 2-column key-value grid */}
              <div>
                <h3
                  className="text-xs uppercase tracking-wider mb-3"
                  style={{ color: '#868D9E', fontWeight: 700, letterSpacing: '0.06em' }}
                >
                  Details
                </h3>
                <div
                  className="grid gap-y-3 gap-x-4"
                  style={{ gridTemplateColumns: '1fr 1fr' }}
                >
                  {/* Created by */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <User size={11} style={{ color: '#868D9E' }} />
                      <span
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: '#868D9E', fontWeight: 600 }}
                      >
                        Created by
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: '#36415D', fontWeight: 500 }}>
                      {procedure.createdBy}
                    </p>
                  </div>

                  {/* Created date */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar size={11} style={{ color: '#868D9E' }} />
                      <span
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: '#868D9E', fontWeight: 600 }}
                      >
                        Created
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: '#36415D', fontWeight: 500 }}>
                      {procedure.createdDate}
                    </p>
                  </div>

                  {/* Last edited by */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <User size={11} style={{ color: '#868D9E' }} />
                      <span
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: '#868D9E', fontWeight: 600 }}
                      >
                        Last edited by
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: '#36415D', fontWeight: 500 }}>
                      {procedure.lastEditedBy}
                    </p>
                  </div>

                  {/* Last edited */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock size={11} style={{ color: '#868D9E' }} />
                      <span
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: '#868D9E', fontWeight: 600 }}
                      >
                        Last edited
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: '#36415D', fontWeight: 500 }}>
                      {procedure.lastEdited}
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-5" style={{ height: 1, background: '#E9E9E9' }} />

              {/* Share + Favorite buttons */}
              <div className="flex items-center gap-2">
                <button
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm transition-all"
                  style={{
                    border: '1px solid #C2C9DB',
                    color: '#36415D',
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2F80ED';
                    e.currentTarget.style.color = '#2F80ED';
                    e.currentTarget.style.background = 'rgba(47, 128, 237, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#C2C9DB';
                    e.currentTarget.style.color = '#36415D';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="flex items-center justify-center rounded-lg transition-all"
                  style={{
                    width: 40,
                    height: 40,
                    border: '1px solid #C2C9DB',
                    color: isFavorited ? '#F59E0B' : '#868D9E',
                  }}
                  aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star
                    size={16}
                    fill={isFavorited ? '#F59E0B' : 'none'}
                  />
                </button>
              </div>

              {/* Divider */}
              <div className="my-5" style={{ height: 1, background: '#E9E9E9' }} />

              {/* Collapsible Settings */}
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: '1px solid #E9E9E9' }}
              >
                <button
                  onClick={() => setSettingsExpanded(!settingsExpanded)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-3 transition-colors"
                  style={{ background: settingsExpanded ? '#F5F5F5' : 'transparent' }}
                  aria-expanded={settingsExpanded}
                >
                  <Settings size={14} style={{ color: '#2F80ED' }} />
                  <span
                    className="text-sm flex-1 text-left"
                    style={{ color: '#36415D', fontWeight: 600 }}
                  >
                    Settings
                  </span>
                  <ChevronDown
                    size={14}
                    style={{
                      color: '#868D9E',
                      transform: settingsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 200ms',
                    }}
                  />
                </button>
                {settingsExpanded && (
                  <div
                    className="px-3.5 pb-3.5 pt-2 space-y-2"
                    style={{ borderTop: '1px solid #E9E9E9' }}
                  >
                    {[
                      { label: 'Auto narrate header', checked: true },
                      { label: 'Auto narrate description', checked: true },
                      { label: 'Allow 2D viewing', checked: true },
                      { label: 'Allow skipping steps', checked: false },
                      { label: 'Show survey', checked: true },
                    ].map((setting) => (
                      <label
                        key={setting.label}
                        className="flex items-center gap-2.5 py-1 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          defaultChecked={setting.checked}
                          className="w-3.5 h-3.5 rounded cursor-pointer"
                          style={{ accentColor: '#2F80ED' }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: '#36415D' }}
                        >
                          {setting.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Collapsible Version History */}
              <div
                className="rounded-lg overflow-hidden mt-2"
                style={{ border: '1px solid #E9E9E9' }}
              >
                <button
                  onClick={() => setVersionHistoryExpanded(!versionHistoryExpanded)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-3 transition-colors"
                  style={{ background: versionHistoryExpanded ? '#F5F5F5' : 'transparent' }}
                  aria-expanded={versionHistoryExpanded}
                >
                  <History size={14} style={{ color: '#8B5CF6' }} />
                  <span
                    className="text-sm flex-1 text-left"
                    style={{ color: '#36415D', fontWeight: 600 }}
                  >
                    Version History
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{
                      color: '#868D9E',
                      background: '#E9E9E9',
                      fontWeight: 600,
                    }}
                  >
                    5
                  </span>
                  <ChevronDown
                    size={14}
                    style={{
                      color: '#868D9E',
                      transform: versionHistoryExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 200ms',
                    }}
                  />
                </button>
                {versionHistoryExpanded && (
                  <div
                    className="px-3.5 pb-3 pt-1"
                    style={{ borderTop: '1px solid #E9E9E9' }}
                  >
                    {[
                      { version: '1.5', date: 'Mar 18, 2026', by: 'Laura G.' },
                      { version: '1.4', date: 'Mar 12, 2026', by: 'David M.' },
                      { version: '1.3', date: 'Feb 28, 2026', by: 'Laura G.' },
                      { version: '1.2', date: 'Feb 15, 2026', by: 'Sarah K.' },
                      { version: '1.1', date: 'Jan 30, 2026', by: 'Laura G.' },
                    ].map((entry) => (
                      <div
                        key={entry.version}
                        className="flex items-center gap-3 py-2"
                        style={{ borderBottom: '1px solid #F5F5F5' }}
                      >
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            color: '#2F80ED',
                            background: 'rgba(47, 128, 237, 0.08)',
                            fontWeight: 700,
                          }}
                        >
                          {entry.version}
                        </span>
                        <span
                          className="text-xs flex-1"
                          style={{ color: '#868D9E' }}
                        >
                          {entry.date}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: '#36415D', fontWeight: 500 }}
                        >
                          {entry.by}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
