import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Settings, ChevronDown, Share2, Star, MoreVertical, Edit, Clock, User, Layers, Box, Globe, X } from 'lucide-react';
import { useState } from 'react';
import { useRole, hasAccess } from '../../../contexts/RoleContext';

const procedures: Record<string, {
  name: string;
  steps: number;
  lastUpdated: string;
  version: string;
  author: string;
  description: string;
  image: string;
  digitalTwin?: string;
  configurations: string[];
  modes: string[];
}> = {
  'p1': {
    name: 'Routine Maintenance for High-Volume Printing Equipment',
    steps: 35,
    lastUpdated: 'Feb 19, 2024 · 11:32',
    version: '1.5',
    author: 'Carlos Oliveira',
    description: 'This is a step-by-step guide to troubleshooting and maintaining high-volume printing equipment. The maintenance covers key checks for paper feed systems, ink delivery components, and output quality calibration. Each section guides you through systematic inspection, maintenance cleaning and calibration procedures.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
    digitalTwin: 'Printing Unit Assembly',
    configurations: ['Default Configuration', 'Service Mode', 'Maintenance Mode'],
    modes: ['3D Mode', 'AR Mode', 'Standard Mode'],
  },
  'p2': {
    name: 'Engine Calibration Procedure',
    steps: 22,
    lastUpdated: 'Feb 18, 2024 · 09:15',
    version: '2.1',
    author: 'Maria Santos',
    description: 'Complete calibration procedure for the main engine assembly. Covers fuel injection timing, valve clearance adjustment, and ECU parameter setup.',
    image: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&h=400&fit=crop',
    digitalTwin: 'Engine Assembly',
    configurations: ['Standard', 'High Performance', 'Economy'],
    modes: ['3D Mode', 'Standard Mode'],
  },
};

const defaultProcedure = {
  name: 'Procedure',
  steps: 10,
  lastUpdated: 'Feb 20, 2024',
  version: '1.0',
  author: 'System',
  description: 'Procedure description will appear here.',
  image: '',
  configurations: ['Default'],
  modes: ['Standard Mode'],
};

export function AppProcedureDetailPage() {
  const navigate = useNavigate();
  const { projectId, procedureId } = useParams();
  const [selectedConfig, setSelectedConfig] = useState(0);
  const [selectedMode, setSelectedMode] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showCreatorArea, setShowCreatorArea] = useState(true);
  const [showLanguageSelector, setShowLanguageSelector] = useState(true);

  const { currentRole } = useRole();
  const canEdit = hasAccess(currentRole, 'projects-edit');

  const procedure = procedures[procedureId || ''] || defaultProcedure;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border bg-card flex items-center gap-3">
        <button
          onClick={() => navigate(`/app/project/${projectId}/kb`)}
          className="p-2 hover:bg-secondary rounded-lg text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Back to knowledge base"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h3 className="text-foreground truncate flex-1" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-h4)' }}>
          Procedure Details
        </h3>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${isFavorited ? 'text-yellow-500' : 'text-muted hover:text-foreground'}`}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className="size-5" fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
          <button className="p-2 text-muted hover:text-foreground rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Share">
            <Share2 className="size-5" />
          </button>
          <button className="p-2 text-muted hover:text-foreground rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="More options">
            <MoreVertical className="size-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          {/* Language selector */}
          {showLanguageSelector && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-card rounded-lg border border-border">
              <Globe className="size-4 text-muted" />
              <span className="text-sm text-foreground flex-1" style={{ fontWeight: 'var(--font-weight-medium)' }}>English</span>
              <ChevronDown className="size-4 text-muted" />
              <button
                onClick={() => setShowLanguageSelector(false)}
                className="p-1 text-muted hover:text-foreground rounded transition-colors ml-1"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left - Main info */}
            <div className="flex-1 min-w-0">
              {/* Thumbnail */}
              {procedure.image && (
                <div className="aspect-video rounded-lg overflow-hidden bg-secondary mb-4">
                  <img
                    src={procedure.image}
                    alt={procedure.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Title & metadata */}
              <h3 className="text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-h3)' }}>
                {procedure.name}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted mb-4">
                <span className="flex items-center gap-1">
                  <Layers className="size-3.5" />
                  {procedure.steps} steps
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  Last updated {procedure.lastUpdated}
                </span>
                <span>·</span>
                <span>v{procedure.version}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-foreground/80 leading-relaxed mb-6">
                {procedure.description}
              </p>

              {/* Dropdowns */}
              <div className="space-y-3 mb-6">
                {/* Digital Twin */}
                {procedure.digitalTwin && (
                  <div>
                    <label className="text-xs text-muted mb-1 block" style={{ fontWeight: 'var(--font-weight-medium)' }}>Digital Twin</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-secondary rounded-lg">
                      <Box className="size-4 text-muted" />
                      <span className="text-sm text-foreground flex-1">{procedure.digitalTwin}</span>
                      <ChevronDown className="size-4 text-muted" />
                    </div>
                  </div>
                )}

                {/* Configuration */}
                <div>
                  <label className="text-xs text-muted mb-1 block" style={{ fontWeight: 'var(--font-weight-medium)' }}>Configuration</label>
                  <select
                    value={selectedConfig}
                    onChange={(e) => setSelectedConfig(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-secondary rounded-lg text-sm text-foreground border-none outline-none appearance-none cursor-pointer min-h-[44px]"
                  >
                    {procedure.configurations.map((config, i) => (
                      <option key={i} value={i}>{config}</option>
                    ))}
                  </select>
                </div>

                {/* Mode */}
                <div>
                  <label className="text-xs text-muted mb-1 block" style={{ fontWeight: 'var(--font-weight-medium)' }}>Mode</label>
                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-secondary rounded-lg text-sm text-foreground border-none outline-none appearance-none cursor-pointer min-h-[44px]"
                  >
                    {procedure.modes.map((mode, i) => (
                      <option key={i} value={i}>{mode}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Run button */}
              <button
                onClick={() => navigate(`/app/project/${projectId}/procedure/${procedureId}/launch`)}
                className="w-full bg-primary text-white rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                style={{ fontWeight: 'var(--font-weight-semibold)', minHeight: '48px' }}
              >
                <Play className="size-5" />
                Run in 3D
              </button>

              {/* 2D link */}
              <button
                onClick={() => navigate(`/app/project/${projectId}/procedure/${procedureId}/launch`)}
                className="w-full mt-2 text-sm text-primary hover:underline text-center"
                style={{ minHeight: '44px' }}
              >
                Don't need a digital twin? Run in 2D
              </button>
            </div>

            {/* Right - Content creator area (desktop) — only for editors */}
            {showCreatorArea && canEdit && (
              <div className="lg:w-[300px] shrink-0">
                <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                      Content creator area
                    </span>
                    <button className="text-muted hover:text-foreground">
                      <Settings className="size-4" />
                    </button>
                  </div>
                  <div className="text-xs text-muted space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Last updated</span>
                      <span className="text-foreground">{procedure.lastUpdated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Author</span>
                      <span className="text-foreground">{procedure.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Version</span>
                      <span className="text-foreground">v{procedure.version}</span>
                    </div>
                  </div>
                  <button
                    className="w-full py-2.5 bg-primary text-white rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors text-sm"
                    style={{ fontWeight: 'var(--font-weight-semibold)' }}
                  >
                    <Edit className="size-4" />
                    Edit
                  </button>

                  {/* Loading progress bar (mockup) */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-muted mb-1">
                      <span>Loading assets</span>
                      <span>1%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '1%' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
