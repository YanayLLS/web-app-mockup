import { useState, useMemo, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Eye,
  Users,
  Monitor,
  Smartphone,
  ChevronDown,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Video,
  Activity,
  Target,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Maximize2,
  Globe,
  Layers,
  Glasses,
  ArrowUpRight,
  ArrowDownRight,
  Timer,
  Link2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Sector
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Types
type SessionStatus = 'completed' | 'failed' | 'abandoned';
type DeviceType = 'Desktop' | 'HoloLens' | 'Mobile';
type SessionType = 'Digital Twin' | 'Procedure';
type TimeRange = 'last-7' | 'last-30' | 'last-90' | 'all';

interface ProcedureStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: 'completed' | 'skipped' | 'failed';
  images?: string[];
  userMedia?: {
    type: 'image' | 'video';
    thumbnail: string;
    fullUrl: string;
    timestamp: string;
  }[];
}

interface Session {
  id: string;
  status: SessionStatus;
  procedureName: string;
  workspace: string;
  user: string;
  isGuest: boolean;
  duration: string;
  date: string;
  deviceType: DeviceType;
  sessionType: SessionType;
  score: number | null;
  videoMarkers: number;
  hasRecording: boolean;
  isTest: boolean;
  completionRate: number;
  startTime: string;
  endTime: string;
  steps: number;
  completedSteps: number;
  errors: number;
  timestamp: Date;
  procedureSteps: ProcedureStep[];
}

// Project-specific base data
const projectBaseData: Record<string, {
  multiplier: number;
  mainProcedure: string;
  procedures: string[];
  avgDuration: string;
}> = {
  '915-i-series': {
    multiplier: 1,
    mainProcedure: 'Phoenix Main Assembly',
    procedures: ['Phoenix Main Assembly', 'Component Integration', 'Quality Control', 'System Calibration', 'Final Testing', 'Safety Inspection', 'Documentation'],
    avgDuration: '8:24'
  },
  'quantum-leap': {
    multiplier: 1.5,
    mainProcedure: 'Quantum Initialization',
    procedures: ['Quantum Initialization', 'Particle Alignment', 'Energy Calibration', 'Stability Check', 'Field Verification', 'Data Logging', 'System Shutdown'],
    avgDuration: '12:15'
  },
  'operation-nightingale': {
    multiplier: 0.7,
    mainProcedure: 'Nightingale Protocol',
    procedures: ['Nightingale Protocol', 'Patient Assessment', 'Equipment Setup', 'Vital Monitoring', 'Emergency Response', 'Recovery Process', 'Post-Op Check'],
    avgDuration: '6:30'
  },
  'project-chimera': {
    multiplier: 1.2,
    mainProcedure: 'Chimera Integration',
    procedures: ['Chimera Integration', 'Module Assembly', 'Interface Testing', 'Performance Tuning', 'Validation Run', 'Stress Testing', 'Final Review'],
    avgDuration: '9:45'
  },
  'atlas-platform': {
    multiplier: 2.0,
    mainProcedure: 'Atlas Deployment',
    procedures: ['Atlas Deployment', 'Infrastructure Setup', 'Network Config', 'Security Audit', 'Load Testing', 'Monitoring Setup', 'Go-Live Check'],
    avgDuration: '15:20'
  },
  'nova-launchpad': {
    multiplier: 0.9,
    mainProcedure: 'Nova Launch Sequence',
    procedures: ['Nova Launch Sequence', 'Pre-Launch Check', 'Fuel Systems', 'Navigation Setup', 'Communication Test', 'Countdown Protocol', 'Launch Execution'],
    avgDuration: '7:50'
  },
  'titan-analytics': {
    multiplier: 1.8,
    mainProcedure: 'Titan Data Pipeline',
    procedures: ['Titan Data Pipeline', 'Data Ingestion', 'Transformation', 'Analytics Run', 'Model Training', 'Validation', 'Report Generation'],
    avgDuration: '11:30'
  },
  'project-evergreen': {
    multiplier: 0.8,
    mainProcedure: 'Evergreen Maintenance',
    procedures: ['Evergreen Maintenance', 'System Inspection', 'Component Replacement', 'Lubrication', 'Alignment Check', 'Performance Test', 'Sign-Off'],
    avgDuration: '5:45'
  },
  'bluebird-crm': {
    multiplier: 1.3,
    mainProcedure: 'Bluebird Setup',
    procedures: ['Bluebird Setup', 'User Onboarding', 'Data Migration', 'Workflow Config', 'Integration Test', 'Training Session', 'Go-Live Support'],
    avgDuration: '10:00'
  }
};

// Data generation functions based on time period and project
const generateDataForPeriod = (period: TimeRange, projectId?: string) => {
  const multipliers = {
    'last-7': 0.3,
    'last-30': 1,
    'last-90': 2.8,
    'all': 4.5
  };

  const mult = multipliers[period];
  const projectData = projectId ? projectBaseData[projectId] : projectBaseData['915-i-series'];
  const projectMult = projectData?.multiplier || 1;
  const finalMult = mult * projectMult;

  // Views over time data
  const getViewsData = () => {
    if (period === 'last-7') {
      return [
        { date: 'Feb 3', views: 59, completions: 46 },
        { date: 'Feb 4', views: 72, completions: 58 },
        { date: 'Feb 5', views: 68, completions: 52 },
        { date: 'Feb 6', views: 75, completions: 61 },
        { date: 'Feb 7', views: 82, completions: 68 },
        { date: 'Feb 8', views: 79, completions: 64 },
        { date: 'Feb 9', views: 88, completions: 72 },
      ];
    } else if (period === 'last-30') {
      return [
        { date: 'Jan 28', views: 45, completions: 32 },
        { date: 'Jan 29', views: 52, completions: 38 },
        { date: 'Jan 30', views: 48, completions: 35 },
        { date: 'Jan 31', views: 61, completions: 45 },
        { date: 'Feb 1', views: 55, completions: 42 },
        { date: 'Feb 2', views: 67, completions: 51 },
        { date: 'Feb 3', views: 59, completions: 46 },
        { date: 'Feb 4', views: 72, completions: 58 },
        { date: 'Feb 5', views: 68, completions: 52 },
        { date: 'Feb 6', views: 75, completions: 61 },
        { date: 'Feb 7', views: 82, completions: 68 },
        { date: 'Feb 8', views: 79, completions: 64 },
        { date: 'Feb 9', views: 88, completions: 72 },
      ];
    } else if (period === 'last-90') {
      return [
        { date: 'Nov', views: 142, completions: 98 },
        { date: 'Dec', views: 178, completions: 132 },
        { date: 'Jan', views: 215, completions: 167 },
        { date: 'Feb', views: 248, completions: 192 },
      ];
    } else {
      return [
        { date: 'Q3 2025', views: 412, completions: 298 },
        { date: 'Q4 2025', views: 523, completions: 389 },
        { date: 'Q1 2026', views: 687, completions: 512 },
      ];
    }
  };

  // Per-procedure views over time (for "Individual" chart mode)
  const getPerProcedureData = () => {
    const procs = (projectData?.procedures || projectBaseData['915-i-series'].procedures).slice(0, 5);
    const baseData = getViewsData();
    return baseData.map(point => {
      const result: Record<string, any> = { date: point.date };
      procs.forEach((name, i) => {
        const share = [0.32, 0.24, 0.18, 0.14, 0.12][i];
        result[name] = Math.round(point.views * share * (0.85 + Math.random() * 0.3));
      });
      return result;
    });
  };

  // Top procedures data - uses project-specific procedure names
  const procedureNames = projectData?.procedures || projectBaseData['915-i-series'].procedures;
  const topProceduresData = procedureNames.map((name, index) => ({
    name,
    views: Math.round((342 - index * 30) * finalMult),
    avgDuration: projectData?.avgDuration || '8:24',
    completion: 94 - index * 2,
    failRate: [3, 5, 2, 8, 4, 6, 1][index] || 3,
  }));

  // Device data - varies by project
  const deviceData = [
    { name: 'Desktop', value: Math.round(452 * finalMult), color: 'var(--color-primary)' },
    { name: 'HoloLens', value: Math.round(186 * finalMult), color: 'var(--color-accent)' },
    { name: 'Mobile', value: Math.round(98 * finalMult), color: 'var(--color-muted)' },
  ];

  // Session type data - varies by project
  const sessionTypeData = [
    { name: 'Flow', value: Math.round(456 * finalMult), color: 'var(--color-accent)' },
    { name: 'Digital Twin', value: Math.round(280 * finalMult), color: 'var(--color-primary)' },
  ];

  // Previous period data for trend calculation
  const prevMultipliers: Record<TimeRange, number> = {
    'last-7': 0.25,
    'last-30': 0.85,
    'last-90': 2.2,
    'all': 4.5
  };
  const prevMult = prevMultipliers[period] * projectMult;
  const trends = {
    prevViews: Math.round(topProceduresData.reduce((a, p) => a + p.views, 0) * (prevMult / finalMult) * 0.88),
    prevSessions: Math.round(10 * prevMult * 0.9),
    prevCompleted: Math.round(8 * prevMult * 0.85),
    prevAvgCompletion: 82,
    prevAvgDuration: '9:12',
  };

  return {
    viewsOverTime: getViewsData(),
    perProcedureData: getPerProcedureData(),
    topProcedures: topProceduresData,
    devices: deviceData,
    sessionTypes: sessionTypeData,
    trends,
  };
};

// Mock procedure steps
const createMockSteps = (totalSteps: number, completedSteps: number): ProcedureStep[] => {
  const steps: ProcedureStep[] = [];
  
  for (let i = 0; i < totalSteps; i++) {
    const isCompleted = i < completedSteps;
    const stepNumber = i + 1;
    
    steps.push({
      id: `step-${i}`,
      stepNumber,
      title: `Step ${stepNumber}: ${['Initialize System', 'Check Components', 'Verify Connections', 'Run Diagnostics', 'Configure Settings', 'Test Functionality', 'Review Results', 'Complete Process', 'Safety Check', 'Final Verification', 'Documentation', 'Shutdown Flow'][i % 12]}`,
      description: `Detailed instructions for step ${stepNumber}. ${isCompleted ? 'This step was completed successfully.' : 'This step was not completed.'}`,
      startTime: `10:${String(i * 2).padStart(2, '0')}`,
      endTime: isCompleted ? `10:${String(i * 2 + 2).padStart(2, '0')}` : '—',
      duration: isCompleted ? `0:${30 + i * 5}` : '—',
      status: isCompleted ? 'completed' : (i === completedSteps ? 'failed' : 'skipped'),
      images: isCompleted && i % 3 === 0 ? [
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400'
      ] : undefined,
      userMedia: isCompleted && i % 4 === 0 ? [
        {
          type: 'image' as const,
          thumbnail: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=200',
          fullUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200',
          timestamp: `10:${String(i * 2 + 1).padStart(2, '0')}`
        }
      ] : undefined
    });
  }
  
  return steps;
};

// Generate mock sessions based on project
const generateMockSessions = (projectId?: string): Session[] => {
  const projectData = projectId ? projectBaseData[projectId] : projectBaseData['915-i-series'];
  const procedures = projectData?.procedures || projectBaseData['915-i-series'].procedures;
  
  return [
    {
      id: '1',
      status: 'completed',
      procedureName: procedures[0],
      workspace: 'Nymeo',
      user: 'Yoav Nader',
      isGuest: false,
      duration: projectData?.avgDuration || '8:24',
      date: 'Feb 09, 2026',
      deviceType: 'Desktop',
      sessionType: 'Procedure',
      score: 95,
      videoMarkers: 0,
      hasRecording: false,
      isTest: false,
      completionRate: 100,
      startTime: '10:24',
      endTime: '10:32',
      steps: 12,
      completedSteps: 12,
      errors: 1,
      timestamp: new Date('2026-02-09T10:24:00'),
      procedureSteps: createMockSteps(12, 12)
    },
    {
      id: '2',
      status: 'completed',
      procedureName: procedures[1],
      workspace: 'Nymeo',
      user: 'Yoav Nader',
      isGuest: false,
      duration: '6:12',
      date: 'Feb 08, 2026',
      deviceType: 'Desktop',
      sessionType: 'Digital Twin',
      score: 88,
      videoMarkers: 0,
      hasRecording: false,
      isTest: false,
      completionRate: 100,
      startTime: '14:15',
      endTime: '14:21',
      steps: 8,
      completedSteps: 8,
      errors: 2,
      timestamp: new Date('2026-02-08T14:15:00'),
      procedureSteps: createMockSteps(8, 8)
    },
    {
      id: '3',
      status: 'abandoned',
      procedureName: procedures[2],
      workspace: 'Nymeo',
      user: 'Sarah Chen',
      isGuest: false,
      duration: '3:45',
      date: 'Feb 09, 2026',
      deviceType: 'HoloLens',
      sessionType: 'Procedure',
      score: null,
      videoMarkers: 0,
      hasRecording: false,
      isTest: false,
      completionRate: 48,
      startTime: '11:30',
      endTime: '—',
      steps: 10,
      completedSteps: 5,
      errors: 0,
      timestamp: new Date('2026-02-09T11:30:00'),
      procedureSteps: createMockSteps(10, 5)
    },
    {
      id: '4',
      status: 'completed',
      procedureName: procedures[0],
      workspace: 'Nymeo',
      user: 'Mike Johnson',
      isGuest: false,
      duration: '7:58',
      date: 'Feb 08, 2026',
      deviceType: 'Desktop',
      sessionType: 'Procedure',
      score: 92,
      videoMarkers: 3,
      hasRecording: true,
      isTest: true,
      completionRate: 100,
      startTime: '09:00',
      endTime: '09:08',
      steps: 12,
      completedSteps: 12,
      errors: 0,
      timestamp: new Date('2026-02-08T09:00:00'),
      procedureSteps: createMockSteps(12, 12)
    },
    {
      id: '5',
      status: 'failed',
      procedureName: procedures[3],
      workspace: 'Nymeo',
      user: 'Emma Davis',
      isGuest: false,
      duration: '2:15',
      date: 'Feb 07, 2026',
      deviceType: 'Mobile',
      sessionType: 'Procedure',
      score: 45,
      videoMarkers: 5,
      hasRecording: true,
      isTest: false,
      completionRate: 32,
      startTime: '16:45',
      endTime: '16:47',
      steps: 6,
      completedSteps: 2,
      errors: 4,
      timestamp: new Date('2026-02-07T16:45:00'),
      procedureSteps: createMockSteps(6, 2)
    },
    {
      id: '6',
      status: 'completed',
      procedureName: procedures[4],
      workspace: 'Nymeo',
      user: 'James Wilson',
      isGuest: false,
      duration: '4:18',
      date: 'Feb 07, 2026',
      deviceType: 'HoloLens',
      sessionType: 'Procedure',
      score: 97,
      videoMarkers: 0,
      hasRecording: false,
      isTest: false,
      completionRate: 100,
      startTime: '13:20',
      endTime: '13:24',
      steps: 7,
      completedSteps: 7,
      errors: 0,
      timestamp: new Date('2026-02-07T13:20:00'),
      procedureSteps: createMockSteps(7, 7)
    },
    {
      id: '7',
      status: 'completed',
      procedureName: procedures[5],
      workspace: 'Nymeo',
      user: 'Alex Martinez',
      isGuest: false,
      duration: '9:02',
      date: 'Feb 06, 2026',
      deviceType: 'Desktop',
      sessionType: 'Procedure',
      score: 86,
      videoMarkers: 2,
      hasRecording: true,
      isTest: true,
      completionRate: 100,
      startTime: '15:10',
      endTime: '15:19',
      steps: 15,
      completedSteps: 15,
      errors: 3,
      timestamp: new Date('2026-02-06T15:10:00'),
      procedureSteps: createMockSteps(15, 15)
    },
    {
      id: '8',
      status: 'completed',
      procedureName: procedures[6],
      workspace: 'Nymeo',
      user: 'Lisa Park',
      isGuest: false,
      duration: '6:55',
      date: 'Feb 06, 2026',
      deviceType: 'Desktop',
      sessionType: 'Digital Twin',
      score: 91,
      videoMarkers: 1,
      hasRecording: true,
      isTest: false,
      completionRate: 100,
      startTime: '11:05',
      endTime: '11:12',
      steps: 9,
      completedSteps: 9,
      errors: 1,
      timestamp: new Date('2026-02-06T11:05:00'),
      procedureSteps: createMockSteps(9, 9)
    },
    {
      id: '9',
      status: 'completed',
      procedureName: procedures[0],
      workspace: 'Nymeo',
      user: 'David Brown',
      isGuest: false,
      duration: projectData?.avgDuration || '8:15',
      date: 'Jan 15, 2026',
      deviceType: 'Desktop',
      sessionType: 'Procedure',
      score: 89,
      videoMarkers: 0,
      hasRecording: false,
      isTest: false,
      completionRate: 100,
      startTime: '10:00',
      endTime: '10:08',
      steps: 12,
      completedSteps: 12,
      errors: 2,
      timestamp: new Date('2026-01-15T10:00:00'),
      procedureSteps: createMockSteps(12, 12)
    },
    {
      id: '10',
      status: 'completed',
      procedureName: procedures[3],
      workspace: 'Nymeo',
      user: 'Rachel Green',
      isGuest: false,
      duration: '5:45',
      date: 'Dec 20, 2025',
      deviceType: 'HoloLens',
      sessionType: 'Procedure',
      score: 94,
      videoMarkers: 1,
      hasRecording: true,
      isTest: false,
      completionRate: 100,
      startTime: '14:30',
      endTime: '14:36',
      steps: 6,
      completedSteps: 6,
      errors: 0,
      timestamp: new Date('2025-12-20T14:30:00'),
      procedureSteps: createMockSteps(6, 6)
    },
    {
      id: '11',
      status: 'completed',
      procedureName: procedures[0],
      workspace: 'Nymeo',
      user: 'Guest',
      isGuest: true,
      duration: '5:32',
      date: 'Feb 09, 2026',
      deviceType: 'Mobile',
      sessionType: 'Procedure',
      score: 78,
      videoMarkers: 0,
      hasRecording: false,
      isTest: false,
      completionRate: 100,
      startTime: '08:12',
      endTime: '08:17',
      steps: 12,
      completedSteps: 12,
      errors: 2,
      timestamp: new Date('2026-02-09T08:12:00'),
      procedureSteps: createMockSteps(12, 12)
    },
    {
      id: '12',
      status: 'abandoned',
      procedureName: procedures[2],
      workspace: 'Nymeo',
      user: 'Guest',
      isGuest: true,
      duration: '1:45',
      date: 'Feb 08, 2026',
      deviceType: 'Mobile',
      sessionType: 'Procedure',
      score: null,
      videoMarkers: 0,
      hasRecording: false,
      isTest: false,
      completionRate: 22,
      startTime: '19:30',
      endTime: '—',
      steps: 10,
      completedSteps: 2,
      errors: 0,
      timestamp: new Date('2026-02-08T19:30:00'),
      procedureSteps: createMockSteps(10, 2)
    },
    {
      id: '13',
      status: 'completed',
      procedureName: procedures[1],
      workspace: 'Nymeo',
      user: 'Guest',
      isGuest: true,
      duration: '7:10',
      date: 'Feb 07, 2026',
      deviceType: 'Desktop',
      sessionType: 'Procedure',
      score: 82,
      videoMarkers: 0,
      hasRecording: false,
      isTest: false,
      completionRate: 100,
      startTime: '12:05',
      endTime: '12:12',
      steps: 8,
      completedSteps: 8,
      errors: 1,
      timestamp: new Date('2026-02-07T12:05:00'),
      procedureSteps: createMockSteps(8, 8)
    },
    {
      id: '14',
      status: 'completed',
      procedureName: procedures[0],
      workspace: 'Nymeo',
      user: 'Guest',
      isGuest: true,
      duration: '6:48',
      date: 'Feb 06, 2026',
      deviceType: 'Mobile',
      sessionType: 'Procedure',
      score: 74,
      videoMarkers: 0,
      hasRecording: false,
      isTest: false,
      completionRate: 85,
      startTime: '21:15',
      endTime: '21:22',
      steps: 12,
      completedSteps: 10,
      errors: 3,
      timestamp: new Date('2026-02-06T21:15:00'),
      procedureSteps: createMockSteps(12, 10)
    },
    {
      id: '15',
      status: 'failed',
      procedureName: procedures[4],
      workspace: 'Nymeo',
      user: 'Guest',
      isGuest: true,
      duration: '0:58',
      date: 'Feb 05, 2026',
      deviceType: 'Mobile',
      sessionType: 'Procedure',
      score: 20,
      videoMarkers: 0,
      hasRecording: false,
      isTest: false,
      completionRate: 14,
      startTime: '16:00',
      endTime: '16:01',
      steps: 7,
      completedSteps: 1,
      errors: 5,
      timestamp: new Date('2026-02-05T16:00:00'),
      procedureSteps: createMockSteps(7, 1)
    },
    {
      id: '16',
      status: 'completed',
      procedureName: procedures[3],
      workspace: 'Nymeo',
      user: 'Guest',
      isGuest: true,
      duration: '4:22',
      date: 'Jan 28, 2026',
      deviceType: 'Desktop',
      sessionType: 'Procedure',
      score: 88,
      videoMarkers: 0,
      hasRecording: false,
      isTest: false,
      completionRate: 100,
      startTime: '10:45',
      endTime: '10:49',
      steps: 6,
      completedSteps: 6,
      errors: 0,
      timestamp: new Date('2026-01-28T10:45:00'),
      procedureSteps: createMockSteps(6, 6)
    },
  ];
};

// Custom Dropdown Component
function CustomDropdown({ 
  value, 
  options, 
  onChange, 
  placeholder = 'Select...',
  className = ''
}: { 
  value: string; 
  options: { value: string; label: string }[]; 
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 px-3 py-2 bg-card border border-border rounded-lg text-xs text-foreground hover:bg-secondary transition-colors flex items-center justify-between"
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="absolute top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg z-20 max-h-60 overflow-auto"
            style={{ boxShadow: 'var(--elevation-sm)' }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs text-left transition-colors ${
                  value === option.value 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Shared status helpers
function getStatusIconShared(status: SessionStatus, size = 14) {
  switch (status) {
    case 'completed': return <CheckCircle2 size={size} className="text-[#10b981]" />;
    case 'abandoned': return <AlertCircle size={size} className="text-muted" />;
    case 'failed': return <XCircle size={size} className="text-destructive" />;
  }
}
function getStatusLabelShared(status: SessionStatus) {
  switch (status) {
    case 'completed': return 'Completed';
    case 'abandoned': return 'Abandoned';
    case 'failed': return 'Failed';
  }
}

// Fullscreen Media Viewer
function FullscreenMediaViewer({ 
  mediaUrl, 
  onClose 
}: { 
  mediaUrl: string; 
  onClose: () => void;
}) {
  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90" 
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-card/90 hover:bg-card rounded-lg transition-colors"
      >
        <X size={24} className="text-foreground" />
      </button>
      <img 
        src={mediaUrl} 
        alt="Fullscreen media" 
        className="max-w-[90vw] max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// Session Details Modal
function SessionDetailsModal({ 
  session, 
  onClose 
}: { 
  session: Session; 
  onClose: () => void;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [fullscreenMedia, setFullscreenMedia] = useState<string | null>(null);
  
  const currentStep = session.procedureSteps[currentStepIndex];

  const getStepStatusColor = (status: 'completed' | 'skipped' | 'failed') => {
    switch (status) {
      case 'completed':
        return 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20';
      case 'skipped':
        return 'bg-muted/10 text-muted border-muted/20';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
        <div 
          className="bg-card border border-border rounded-lg shadow-lg max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
          style={{ boxShadow: 'var(--elevation-lg)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-border">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex items-center gap-2">
                {getStatusIconShared(session.status, 20)}
                <div>
                  <h2 className="text-lg text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {session.procedureName}
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    {getStatusLabelShared(session.status)} · {session.isGuest ? 'Guest via link' : session.user} · {session.date}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary rounded-lg transition-colors"
            >
              <X size={20} className="text-muted" />
            </button>
          </div>

          {/* Content - Two Column Layout */}
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 sm:grid-cols-[280px_1fr] h-full">
              {/* Left Sidebar - Steps List */}
              <div className="border-r border-border bg-secondary/20 overflow-auto">
                <div className="p-4">
                  <h3 className="text-xs text-muted uppercase tracking-wide mb-3" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    Flow Steps ({session.completedSteps}/{session.steps})
                  </h3>
                  <div className="space-y-2">
                    {session.procedureSteps.map((step, index) => (
                      <button
                        key={step.id}
                        onClick={() => setCurrentStepIndex(index)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          currentStepIndex === index 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'bg-card border border-border hover:bg-secondary'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 ${
                            step.status === 'completed' ? 'bg-[#10b981] text-white' :
                            step.status === 'failed' ? 'bg-destructive text-white' :
                            'bg-muted/30 text-muted'
                          }`} style={{ fontWeight: 'var(--font-weight-bold)' }}>
                            {step.stepNumber}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground truncate" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                              {step.title.includes(':') ? step.title.split(': ').slice(1).join(': ') : `Step ${step.stepNumber}`}
                            </p>
                            <p className="text-[10px] text-muted mt-0.5">
                              {step.duration}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Content - Step Details */}
              <div className="overflow-auto">
                <div className="p-6 space-y-6">
                  {/* Step Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                          {currentStep.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-[10px] border ${getStepStatusColor(currentStep.status)}`}
                              style={{ fontWeight: 'var(--font-weight-bold)' }}>
                          {currentStep.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted">
                        {currentStep.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                        disabled={currentStepIndex === 0}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={18} className="text-foreground" />
                      </button>
                      <button
                        onClick={() => setCurrentStepIndex(Math.min(session.procedureSteps.length - 1, currentStepIndex + 1))}
                        disabled={currentStepIndex === session.procedureSteps.length - 1}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={18} className="text-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Step Timing */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={14} className="text-muted" />
                        <span className="text-xs text-muted">Start Time</span>
                      </div>
                      <p className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                        {currentStep.startTime}
                      </p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={14} className="text-muted" />
                        <span className="text-xs text-muted">End Time</span>
                      </div>
                      <p className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                        {currentStep.endTime}
                      </p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity size={14} className="text-muted" />
                        <span className="text-xs text-muted">Duration</span>
                      </div>
                      <p className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                        {currentStep.duration}
                      </p>
                    </div>
                  </div>

                  {/* Step Images */}
                  {currentStep.images && currentStep.images.length > 0 && (
                    <div className="border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <ImageIcon size={16} className="text-muted" />
                        <h4 className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                          Step Instructions
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {currentStep.images.map((image, index) => (
                          <div 
                            key={index}
                            className="relative aspect-video bg-secondary rounded-lg overflow-hidden border border-border group cursor-pointer"
                            onClick={() => setFullscreenMedia(image)}
                          >
                            <img 
                              src={image} 
                              alt={`Step instruction ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Maximize2 size={24} className="text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User Uploaded Media */}
                  {currentStep.userMedia && currentStep.userMedia.length > 0 && (
                    <div className="border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Video size={16} className="text-muted" />
                        <h4 className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                          User Uploaded Media
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {currentStep.userMedia.map((media, index) => (
                          <div key={index} className="space-y-2">
                            <div 
                              className="relative aspect-video bg-secondary rounded-lg overflow-hidden border border-border group cursor-pointer"
                              onClick={() => setFullscreenMedia(media.fullUrl)}
                            >
                              <img 
                                src={media.thumbnail} 
                                alt={`User media ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 size={20} className="text-white" />
                              </div>
                              {media.type === 'video' && (
                                <div className="absolute bottom-2 right-2 bg-black/70 rounded px-1.5 py-0.5">
                                  <Video size={12} className="text-white" />
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted text-center">
                              Uploaded at {media.timestamp}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Media Message */}
                  {!currentStep.images && !currentStep.userMedia && (
                    <div className="border border-border rounded-lg p-8 text-center">
                      <FileText size={32} className="text-muted mx-auto mb-2" />
                      <p className="text-sm text-muted">No media attached to this step</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border p-4 bg-secondary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-muted">Session User</p>
                  <p className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {session.user}
                  </p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="text-xs text-muted">Session Date</p>
                  <p className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {session.date}
                  </p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="text-xs text-muted">Total Duration</p>
                  <p className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {session.duration}
                  </p>
                </div>
              </div>
              {session.hasRecording && (
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs hover:bg-primary/90 transition-colors">
                  <Video size={14} />
                  <span>View Full Recording</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Media Viewer */}
      {fullscreenMedia && (
        <FullscreenMediaViewer 
          mediaUrl={fullscreenMedia} 
          onClose={() => setFullscreenMedia(null)} 
        />
      )}
    </>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background overflow-auto">
      {/* Header skeleton */}
      <div className="shrink-0 px-6 py-5 flex items-center justify-between">
        <div className="h-6 bg-muted/30 rounded w-28 animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="h-10 w-36 bg-muted/30 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-muted/30 rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 sm:px-6 pb-6 space-y-5">
        {/* Chart skeleton */}
        <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
          <div className="flex items-center justify-between mb-5">
            <div className="h-4 bg-muted/30 rounded w-40" />
            <div className="h-8 bg-muted/30 rounded-lg w-44" />
          </div>
          <div className="h-[260px] bg-muted/20 rounded-lg" />
          <div className="flex items-center gap-5 mt-3 pl-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted/30 rounded-full" />
              <div className="h-3 bg-muted/30 rounded w-12" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted/30 rounded-full" />
              <div className="h-3 bg-muted/30 rounded w-20" />
            </div>
          </div>
        </div>

        {/* Summary cards skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-muted/30 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted/30 rounded w-16" />
                  <div className="h-5 bg-muted/30 rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-muted/30 rounded w-32 mb-4" />
              <div className="h-[180px] bg-muted/20 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="h-4 bg-muted/30 rounded w-36" />
            <div className="flex items-center gap-2">
              <div className="h-9 w-48 bg-muted/30 rounded-lg" />
              <div className="h-9 w-28 bg-muted/30 rounded-lg" />
            </div>
          </div>
          <div className="px-5 space-y-3 pb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-muted/20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <div className="p-5 bg-secondary/50 rounded-full mb-4">
        <BarChart3 size={40} className="text-muted" />
      </div>
      <h3 className="text-lg text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
        No analytics data yet
      </h3>
      <p className="text-sm text-muted text-center max-w-md">
        Analytics will appear here once users start viewing and completing procedures in this project
      </p>
    </div>
  );
}

interface AnalyticsPageProps {
  projectId?: string;
}

export function AnalyticsPage({ projectId }: AnalyticsPageProps = {}) {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('last-30');
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SessionStatus>('all');
  const [deviceFilter, setDeviceFilter] = useState<'all' | DeviceType>('all');
  const [sessionTypeFilter, setSessionTypeFilter] = useState<'all' | SessionType>('all');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Loading state
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, [projectId]);

  // Generate sessions for this project
  const allMockSessions = useMemo(() => generateMockSessions(projectId), [projectId]);

  // Filter sessions based on time range
  const filteredByTime = useMemo(() => {
    const now = new Date('2026-02-09');
    const cutoffDays = {
      'last-7': 7,
      'last-30': 30,
      'last-90': 90,
      'all': 999999
    };
    const cutoff = new Date(now.getTime() - cutoffDays[timeRange] * 24 * 60 * 60 * 1000);
    return allMockSessions.filter(session => session.timestamp >= cutoff);
  }, [timeRange, allMockSessions]);

  // Get dynamic data based on selected time range and project
  const dynamicData = useMemo(() => generateDataForPeriod(timeRange, projectId), [timeRange, projectId]);

  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-[#10b981]/10 text-[#10b981]';
      case 'abandoned':
        return 'bg-muted/10 text-muted';
      case 'failed':
        return 'bg-destructive/10 text-destructive';
    }
  };

  const filteredSessions = filteredByTime.filter(session => {
    const matchesSearch = session.procedureName.toLowerCase().includes(sessionSearchQuery.toLowerCase()) ||
                         session.user.toLowerCase().includes(sessionSearchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    const matchesDevice = deviceFilter === 'all' || session.deviceType === deviceFilter;
    const matchesType = sessionTypeFilter === 'all' || session.sessionType === sessionTypeFilter;
    
    return matchesSearch && matchesStatus && matchesDevice && matchesType;
  });

  const totalSessions = filteredByTime.length;
  const completedSessions = filteredByTime.filter(s => s.status === 'completed').length;
  const avgCompletionRate = totalSessions > 0 
    ? Math.round(filteredByTime.reduce((acc, s) => acc + s.completionRate, 0) / totalSessions)
    : 0;
  const totalViews = dynamicData.topProcedures.reduce((acc, p) => acc + p.views, 0);

  // PDF Export Function
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Analytics Report', 14, 20);
    
    // Time Range
    const timeRangeLabels = {
      'last-7': 'Last 7 Days',
      'last-30': 'Last 30 Days',
      'last-90': 'Last 90 Days',
      'all': 'All Time'
    };
    doc.setFontSize(11);
    doc.text(`Period: ${timeRangeLabels[timeRange]}`, 14, 30);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);
    
    // Summary Stats
    doc.setFontSize(14);
    doc.text('Summary Statistics', 14, 46);
    doc.setFontSize(10);
    doc.text(`Total Views: ${totalViews.toLocaleString()}`, 14, 54);
    doc.text(`Total Sessions: ${totalSessions}`, 14, 60);
    doc.text(`Completed Sessions: ${completedSessions}`, 14, 66);
    doc.text(`Avg Completion Rate: ${avgCompletionRate}%`, 14, 72);
    
    // Top Procedures Table
    doc.setFontSize(14);
    doc.text('Top Procedures', 14, 86);
    
    autoTable(doc, {
      startY: 90,
      head: [['Flow', 'Views', 'Avg Duration', 'Completion %']],
      body: dynamicData.topProcedures.map(proc => [
        proc.name,
        proc.views.toString(),
        proc.avgDuration,
        `${proc.completion}%`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [66, 66, 66] },
      styles: { fontSize: 9 }
    });
    
    // Sessions Table
    const finalY = (doc as any).lastAutoTable.finalY || 140;
    doc.setFontSize(14);
    doc.text('Recent Sessions', 14, finalY + 10);
    
    autoTable(doc, {
      startY: finalY + 14,
      head: [['Status', 'Flow', 'User', 'Duration', 'Date', 'Score']],
      body: filteredSessions.slice(0, 20).map(session => [
        getStatusLabelShared(session.status),
        session.procedureName,
        session.user,
        session.duration,
        session.date,
        session.score !== null ? session.score.toString() : '—'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [66, 66, 66] },
      styles: { fontSize: 8 }
    });
    
    // Save PDF
    doc.save(`analytics-report-${timeRange}-${new Date().getTime()}.pdf`);
  };

  const timeRangeOptions = [
    { value: 'last-7', label: 'Last 7 Days' },
    { value: 'last-30', label: 'Last 30 Days' },
    { value: 'last-90', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'abandoned', label: 'Abandoned' },
    { value: 'failed', label: 'Failed' },
  ];

  const deviceOptions = [
    { value: 'all', label: 'All Devices' },
    { value: 'Desktop', label: 'Desktop' },
    { value: 'HoloLens', label: 'HoloLens' },
    { value: 'Mobile', label: 'Mobile' },
  ];

  const sessionTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'Procedure', label: 'Flow' },
    { value: 'Digital Twin', label: 'Digital Twin' },
  ];

  const [chartMode, setChartMode] = useState<'aggregate' | 'individual'>('aggregate');
  const [activeDeviceIndex, setActiveDeviceIndex] = useState<number | null>(null);

  // Compute device totals for the donut center
  const deviceTotal = dynamicData.devices.reduce((acc, d) => acc + d.value, 0);

  // Session type totals for the table
  const sessionTypeTotal = dynamicData.sessionTypes.reduce((acc, t) => acc + t.value, 0);

  // Trend calculations
  const trends = dynamicData.trends;
  const calcTrend = (current: number, prev: number) => {
    if (prev === 0) return { pct: 0, up: true };
    const pct = Math.round(((current - prev) / prev) * 100);
    return { pct: Math.abs(pct), up: pct >= 0 };
  };
  const viewsTrend = calcTrend(totalViews, trends.prevViews);
  const sessionsTrend = calcTrend(totalSessions, trends.prevSessions);
  const completedTrend = calcTrend(completedSessions, trends.prevCompleted);
  const completionTrend = calcTrend(avgCompletionRate, trends.prevAvgCompletion);

  // Avg duration from sessions
  const avgDurationMinutes = totalSessions > 0
    ? filteredByTime.reduce((acc, s) => {
        const parts = s.duration.split(':');
        return acc + parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }, 0) / totalSessions
    : 0;
  const avgDurationStr = `${Math.floor(avgDurationMinutes / 60)}:${String(Math.round(avgDurationMinutes % 60)).padStart(2, '0')}`;

  // Per-procedure chart colors
  const procChartColors = ['var(--color-primary)', 'var(--color-accent)', '#10b981', '#f59e0b', '#2F80ED'];
  const topProcNames = (dynamicData.topProcedures || []).slice(0, 5).map(p => p.name);

  // User performance aggregation
  const userPerformance = useMemo(() => {
    const userMap = new Map<string, { sessions: number; completed: number; totalScore: number; scoreCount: number; totalCompletion: number; lastActive: Date; isGuest: boolean }>();
    filteredByTime.forEach(s => {
      const key = s.isGuest ? '__guest__' : s.user;
      const existing = userMap.get(key) || { sessions: 0, completed: 0, totalScore: 0, scoreCount: 0, totalCompletion: 0, lastActive: new Date(0), isGuest: s.isGuest };
      existing.sessions++;
      if (s.status === 'completed') existing.completed++;
      if (s.score !== null) { existing.totalScore += s.score; existing.scoreCount++; }
      existing.totalCompletion += s.completionRate;
      if (s.timestamp > existing.lastActive) existing.lastActive = s.timestamp;
      userMap.set(key, existing);
    });
    return Array.from(userMap.entries()).map(([key, data]) => ({
      name: data.isGuest ? 'Guest Users' : key,
      isGuest: data.isGuest,
      sessions: data.sessions,
      completed: data.completed,
      avgScore: data.scoreCount > 0 ? Math.round(data.totalScore / data.scoreCount) : null,
      avgCompletion: Math.round(data.totalCompletion / data.sessions),
      lastActive: data.lastActive.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    })).sort((a, b) => b.sessions - a.sessions);
  }, [filteredByTime]);

  // Content health — procedure failure/abandon rates
  const contentHealth = useMemo(() => {
    const procMap = new Map<string, { total: number; failed: number; abandoned: number; totalErrors: number }>();
    filteredByTime.forEach(s => {
      const existing = procMap.get(s.procedureName) || { total: 0, failed: 0, abandoned: 0, totalErrors: 0 };
      existing.total++;
      if (s.status === 'failed') existing.failed++;
      if (s.status === 'abandoned') existing.abandoned++;
      existing.totalErrors += s.errors;
      procMap.set(s.procedureName, existing);
    });
    return Array.from(procMap.entries()).map(([name, data]) => ({
      name,
      total: data.total,
      failRate: data.total > 0 ? Math.round(((data.failed + data.abandoned) / data.total) * 100) : 0,
      avgErrors: data.total > 0 ? (data.totalErrors / data.total).toFixed(1) : '0',
    })).sort((a, b) => b.failRate - a.failRate);
  }, [filteredByTime]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / rowsPerPage));
  const paginatedSessions = filteredSessions.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [sessionSearchQuery, statusFilter, deviceFilter, sessionTypeFilter, timeRange]);

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (totalSessions === 0 && timeRange === 'all') {
    return <AnalyticsEmptyState />;
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-auto">
      {/* Page Header with global time range */}
      <div className="shrink-0 px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-lg text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
          Analytics
        </h1>
        <div className="flex items-center gap-3">
          <CustomDropdown
            value={timeRange}
            options={timeRangeOptions}
            onChange={(value) => setTimeRange(value as TimeRange)}
            className="w-36"
          />
          <button
            onClick={exportToPDF}
            className="group/btn flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-xs text-foreground hover:bg-primary/5 hover:border-primary/20 hover:shadow-sm transition-all"
            style={{ fontWeight: 'var(--font-weight-semibold)' }}
          >
            <Download size={14} className="text-muted group-hover/btn:text-primary transition-colors" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 pb-6 space-y-5">

        {/* ===== HERO CHART CARD ===== */}
        <div className="bg-card border border-border rounded-xl p-5">
          {/* Top row: chart title + mode toggle */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                Views &amp; Completions
              </span>
            </div>
            <div className="flex bg-secondary rounded-lg p-0.5">
              <button
                onClick={() => setChartMode('aggregate')}
                className={`px-3 py-1.5 text-[11px] rounded-lg transition-colors ${
                  chartMode === 'aggregate'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
                style={chartMode === 'aggregate' ? { fontWeight: 'var(--font-weight-bold)' } : {}}
              >
                Aggregate
              </button>
              <button
                onClick={() => setChartMode('individual')}
                className={`px-3 py-1.5 text-[11px] rounded-lg transition-colors ${
                  chartMode === 'individual'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
                style={chartMode === 'individual' ? { fontWeight: 'var(--font-weight-bold)' } : {}}
              >
                By Flow
              </button>
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={260}>
            {chartMode === 'aggregate' ? (
              <AreaChart data={dynamicData.viewsOverTime}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
                  stroke="var(--color-border)"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
                  stroke="var(--color-border)"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '12px',
                    boxShadow: 'var(--elevation-sm)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                  name="Views"
                />
                <Area
                  type="monotone"
                  dataKey="completions"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCompletions)"
                  name="Completions"
                />
              </AreaChart>
            ) : (
              <LineChart data={dynamicData.perProcedureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
                  stroke="var(--color-border)"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
                  stroke="var(--color-border)"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '12px',
                    boxShadow: 'var(--elevation-sm)'
                  }}
                />
                {topProcNames.map((name, i) => (
                  <Line key={name} type="monotone" dataKey={name} stroke={procChartColors[i]} strokeWidth={2} dot={false} name={name} />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>

          {/* Legend row */}
          <div className="flex items-center gap-5 mt-3 pl-2 flex-wrap">
            {chartMode === 'aggregate' ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
                  <span className="text-[11px] text-muted">Views</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
                  <span className="text-[11px] text-muted">Completions</span>
                </div>
              </>
            ) : (
              topProcNames.map((name, i) => (
                <div key={name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: procChartColors[i] }} />
                  <span className="text-[11px] text-muted">{name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ===== SUMMARY CARDS ROW ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { label: 'Total Views', value: totalViews.toLocaleString(), icon: <Eye size={16} className="text-[#2F80ED]" />, color: '#2F80ED', trend: viewsTrend },
            { label: 'Total Sessions', value: totalSessions.toString(), icon: <Activity size={16} className="text-[#8B5CF6]" />, color: '#8B5CF6', trend: sessionsTrend },
            { label: 'Completed', value: completedSessions.toString(), icon: <CheckCircle2 size={16} className="text-[#10b981]" />, color: '#10b981', trend: completedTrend },
            { label: 'Avg Completion', value: `${avgCompletionRate}%`, icon: <Target size={16} className="text-[#F59E0B]" />, color: '#F59E0B', trend: completionTrend },
            { label: 'Avg Duration', value: avgDurationStr, icon: <Timer size={16} className="text-[#E91E63]" />, color: '#E91E63', trend: null },
          ].map((card) => (
            <div key={card.label} className="bg-card border border-border rounded-xl p-4 hover:shadow-sm hover:border-primary/15 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${card.color}12` }}>
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted">{card.label}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      {card.value}
                    </p>
                    {card.trend && card.trend.pct > 0 && (
                      <span className={`flex items-center gap-0.5 text-[10px] ${card.trend.up ? 'text-[#10b981]' : 'text-destructive'}`}
                            style={{ fontWeight: 'var(--font-weight-bold)' }}>
                        {card.trend.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {card.trend.pct}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== THREE-COLUMN CARDS ROW ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

          {/* Devices Card - donut chart */}
          <div className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Monitor size={15} className="text-muted" />
              <h2 className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>Devices</h2>
            </div>
            <div className="relative flex items-center justify-center" style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={dynamicData.devices}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={74}
                    paddingAngle={4}
                    dataKey="value"
                    startAngle={210}
                    endAngle={-30}
                    cornerRadius={6}
                    cursor="pointer"
                    activeIndex={activeDeviceIndex ?? undefined}
                    activeShape={(props: any) => (
                      <Sector
                        {...props}
                        innerRadius={props.innerRadius - 2}
                        outerRadius={props.outerRadius + 5}
                        cornerRadius={8}
                      />
                    )}
                    onMouseEnter={(_, index) => setActiveDeviceIndex(index)}
                    onMouseLeave={() => setActiveDeviceIndex(null)}
                  >
                    {dynamicData.devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    wrapperStyle={{ zIndex: 50, pointerEvents: 'none' }}
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius)',
                      fontSize: '12px',
                      boxShadow: 'var(--elevation-lg)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-xl text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {deviceTotal.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted">Sessions</p>
                </div>
              </div>
            </div>
            {/* Legend rows */}
            <div className="space-y-2.5 mt-1">
              {dynamicData.devices.map((device) => {
                const percentage = Math.round((device.value / deviceTotal) * 100);
                return (
                  <div key={device.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: device.color }} />
                      <span className="text-xs text-foreground">{device.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                        {device.value.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-muted w-10 text-right">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Overview Card */}
          <div className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <Layers size={15} className="text-muted" />
              <h2 className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>Activity Overview</h2>
            </div>
            {/* Key engagement stats */}
            <div className="space-y-4 mb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-primary" />
                  <span className="text-xs text-muted">Identified Users</span>
                </div>
                <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>{userPerformance.filter(u => !u.isGuest).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 size={14} className="text-muted" />
                  <span className="text-xs text-muted">Guest Sessions</span>
                </div>
                <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>{filteredByTime.filter(s => s.isGuest).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-[#10b981]" />
                  <span className="text-xs text-muted">Success Rate</span>
                </div>
                <span className="text-sm text-[#10b981]" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle size={14} className="text-destructive" />
                  <span className="text-xs text-muted">Failure Rate</span>
                </div>
                <span className="text-sm text-destructive" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {totalSessions > 0 ? Math.round((filteredByTime.filter(s => s.status === 'failed').length / totalSessions) * 100) : 0}%
                </span>
              </div>
            </div>
            {/* Session type split */}
            <div className="text-[10px] text-muted uppercase tracking-wide mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              Session Types
            </div>
            {dynamicData.sessionTypes.map((type) => {
              const percentage = Math.round((type.value / sessionTypeTotal) * 100);
              return (
                <div key={type.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: type.color + '20' }}>
                      {type.name === 'Flow' ? (
                        <Activity size={11} style={{ color: type.color }} />
                      ) : (
                        <Globe size={11} style={{ color: type.color }} />
                      )}
                    </div>
                    <span className="text-xs text-foreground">{type.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>{type.value.toLocaleString()}</span>
                    <span className="text-[11px] text-muted w-8 text-right">{percentage}%</span>
                  </div>
                </div>
              );
            })}
            <div className="pt-3">
              <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
                {dynamicData.sessionTypes.map((type) => (
                  <div
                    key={type.name}
                    className="h-full"
                    style={{ width: `${(type.value / sessionTypeTotal) * 100}%`, backgroundColor: type.color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Flow Performance Card - table style like "Browsers" */}
          <div className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={15} className="text-muted" />
              <h2 className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>Top Flows</h2>
            </div>
            {/* Table header */}
            <div className="flex items-center pb-2.5 border-b border-border mb-1">
              <span className="flex-1 text-[10px] text-muted uppercase tracking-wide">Flow</span>
              <span className="w-16 text-right text-[10px] text-muted uppercase tracking-wide">Views</span>
              <span className="w-14 text-right text-[10px] text-muted uppercase tracking-wide">Done %</span>
            </div>
            {/* Rows */}
            <div className="space-y-0">
              {dynamicData.topProcedures.slice(0, 5).map((procedure, index) => {
                return (
                  <div key={index} className="flex items-center py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: procChartColors[index] }}
                      />
                      <span className="text-xs text-foreground truncate">{procedure.name}</span>
                    </div>
                    <span className="w-16 text-right text-xs text-foreground shrink-0" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      {procedure.views.toLocaleString()}
                    </span>
                    <span className={`w-14 text-right text-[11px] shrink-0 ${procedure.completion >= 90 ? 'text-[#10b981]' : procedure.completion >= 70 ? 'text-foreground' : 'text-destructive'}`}
                          style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      {procedure.completion}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===== TEAM PERFORMANCE & CONTENT HEALTH ROW ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* User Performance */}
          <div className="bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2 p-5 pb-0 mb-3">
              <Users size={15} className="text-muted" />
              <h2 className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>User Performance</h2>
              <span className="text-[10px] text-muted ml-auto">{userPerformance.length} users</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-5 py-2.5 text-left"><span className="text-[10px] text-muted uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-bold)' }}>User</span></th>
                    <th className="px-3 py-2.5 text-center"><span className="text-[10px] text-muted uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-bold)' }}>Sessions</span></th>
                    <th className="px-3 py-2.5 text-center"><span className="text-[10px] text-muted uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-bold)' }}>Avg Score</span></th>
                    <th className="px-3 py-2.5 text-center"><span className="text-[10px] text-muted uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-bold)' }}>Completion</span></th>
                    <th className="px-3 py-2.5 text-right"><span className="text-[10px] text-muted uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-bold)' }}>Last Active</span></th>
                  </tr>
                </thead>
                <tbody>
                  {userPerformance.map(user => (
                    <tr key={user.name} className="border-t border-border">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          {user.isGuest ? (
                            <div className="w-7 h-7 rounded-full bg-muted/15 flex items-center justify-center">
                              <Link2 size={12} className="text-muted" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-foreground">{user.name}</span>
                            {user.isGuest && (
                              <span className="px-1.5 py-0.5 bg-muted/10 text-muted rounded text-[9px]">via link</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>{user.sessions}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {user.avgScore !== null ? (
                          <span className={`text-xs ${user.avgScore >= 80 ? 'text-[#10b981]' : user.avgScore >= 60 ? 'text-foreground' : 'text-destructive'}`}
                                style={{ fontWeight: 'var(--font-weight-bold)' }}>
                            {user.avgScore}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${user.avgCompletion === 100 ? 'bg-[#10b981]' : user.avgCompletion >= 70 ? 'bg-accent' : 'bg-destructive'}`}
                              style={{ width: `${user.avgCompletion}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted">{user.avgCompletion}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-xs text-muted">{user.lastActive}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Content Health */}
          <div className="bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2 p-5 pb-0 mb-3">
              <AlertCircle size={15} className="text-muted" />
              <h2 className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>Content Health</h2>
              <span className="text-[10px] text-muted ml-auto">Failure &amp; abandon rates</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-5 py-2.5 text-left"><span className="text-[10px] text-muted uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-bold)' }}>Flow</span></th>
                    <th className="px-3 py-2.5 text-center"><span className="text-[10px] text-muted uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-bold)' }}>Sessions</span></th>
                    <th className="px-3 py-2.5 text-center"><span className="text-[10px] text-muted uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-bold)' }}>Fail Rate</span></th>
                    <th className="px-3 py-2.5 text-center"><span className="text-[10px] text-muted uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-bold)' }}>Avg Errors</span></th>
                  </tr>
                </thead>
                <tbody>
                  {contentHealth.map(proc => (
                    <tr key={proc.name} className="border-t border-border">
                      <td className="px-5 py-3">
                        <span className="text-xs text-foreground">{proc.name}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>{proc.total}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] ${
                          proc.failRate === 0 ? 'bg-[#10b981]/10 text-[#10b981]' :
                          proc.failRate <= 10 ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                          'bg-destructive/10 text-destructive'
                        }`} style={{ fontWeight: 'var(--font-weight-bold)' }}>
                          {proc.failRate}%
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-xs text-muted">{proc.avgErrors}</span>
                      </td>
                    </tr>
                  ))}
                  {contentHealth.length === 0 && (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-xs text-muted">No data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ===== SESSION DETAILS TABLE ===== */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                Session Details
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={sessionSearchQuery}
                    onChange={(e) => setSessionSearchQuery(e.target.value)}
                    className="w-full sm:w-64 h-9 pl-9 pr-3 bg-secondary border border-border rounded-lg text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <CustomDropdown
                value={statusFilter}
                options={statusOptions}
                onChange={(value) => setStatusFilter(value as any)}
                className="w-40"
              />
              <CustomDropdown
                value={deviceFilter}
                options={deviceOptions}
                onChange={(value) => setDeviceFilter(value as any)}
                className="w-40"
              />
              <CustomDropdown
                value={sessionTypeFilter}
                options={sessionTypeOptions}
                onChange={(value) => setSessionTypeFilter(value as any)}
                className="w-40"
              />
              {(statusFilter !== 'all' || deviceFilter !== 'all' || sessionTypeFilter !== 'all' || sessionSearchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setDeviceFilter('all');
                    setSessionTypeFilter('all');
                    setSessionSearchQuery('');
                  }}
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <span className="text-[10px] text-muted uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      Status
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-[10px] text-muted uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      Flow
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-[10px] text-muted uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      User
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-[10px] text-muted uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      Duration
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-[10px] text-muted uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      Date
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-[10px] text-muted uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      Device
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left" title="Performance score based on completion rate, time efficiency, and error count">
                    <span className="text-[10px] text-muted uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      Score
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-[10px] text-muted uppercase tracking-wide" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      Completion
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="border-t border-border hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedSession(session)}
                  >
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${getStatusColor(session.status)}`}>
                        {getStatusIconShared(session.status)}
                        <span className="text-[10px]" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                          {getStatusLabelShared(session.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-foreground">{session.procedureName}</span>
                        {session.isTest && (
                          <span className="px-1.5 py-0.5 bg-accent/10 text-accent rounded text-[9px]" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                            TEST
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {session.isGuest && <Link2 size={11} className="text-muted shrink-0" />}
                        <span className="text-xs text-muted">{session.isGuest ? 'Guest' : session.user}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted">{session.duration}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted">{session.date}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {session.deviceType === 'Desktop' ? (
                          <Monitor size={12} className="text-muted" />
                        ) : session.deviceType === 'HoloLens' ? (
                          <Glasses size={12} className="text-muted" />
                        ) : (
                          <Smartphone size={12} className="text-muted" />
                        )}
                        <span className="text-xs text-foreground">{session.deviceType}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {session.score !== null ? (
                        <span className={`text-xs ${session.score >= 80 ? 'text-[#10b981]' : session.score >= 60 ? 'text-foreground' : 'text-destructive'}`}
                              style={{ fontWeight: 'var(--font-weight-bold)' }}>
                          {session.score}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[60px]">
                          <div
                            className={`h-full rounded-full transition-all ${
                              session.completionRate === 100 ? 'bg-[#10b981]' :
                              session.completionRate >= 50 ? 'bg-accent' :
                              'bg-destructive'
                            }`}
                            style={{ width: `${session.completionRate}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted">
                          {session.completionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSessions.length === 0 && (
            <div className="p-12 text-center">
              <AlertCircle size={32} className="text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">No sessions found matching your filters</p>
            </div>
          )}

          {/* Pagination */}
          {filteredSessions.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <span className="text-[11px] text-muted">
                Showing {((currentPage - 1) * rowsPerPage) + 1}–{Math.min(currentPage * rowsPerPage, filteredSessions.length)} of {filteredSessions.length} sessions
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} className="text-foreground" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                    style={currentPage === page ? { fontWeight: 'var(--font-weight-bold)' } : {}}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} className="text-foreground" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}
