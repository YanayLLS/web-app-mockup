// InviteMembersPanel - 3-stage invite process
import { useState, useRef } from 'react';
import { X, ChevronDown, Users, Plus, Mail, Send, AlertCircle, Bug, Upload, Info } from 'lucide-react';
import { ProjectAccessModal } from './ProjectAccessModal';
import { RolesSelectionContextMenu } from './RolesSelectionContextMenu';
import { SimpleRolesContextMenu, type RoleWithDescription } from './SimpleRolesContextMenu';
import { GroupContextMenu } from './GroupContextMenu';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/app/components/ui/tooltip';
import { calculateMenuPosition } from '@/app/utils/positionUtils';
import * as XLSX from 'xlsx';
import { RequestSeatsModal } from './RequestSeatsModal';
import { useAppPopup } from '../../../../contexts/AppPopupContext';

export interface Group {
  id: string;
  name: string;
  color: string;
  members: Array<{ id: string; name: string; initials: string; color: string }>;
  projects: string[];
}

interface InviteMembersPanelProps {
  onClose: () => void;
  onInvite: (emails: string[], group: string | null, projects: string[], roles: any) => void;
  roleSystem: 'new' | 'today';
  onNavigateToRoles?: () => void;
  groups?: Group[];
  onNavigateToGroups?: () => void;
  publicFeatureEnabled?: boolean;
  availableSeats?: number;
  totalSeats?: number;
  availableRoles?: RoleWithDescription[];
}

interface EmailTag {
  email: string;
  status: 'valid' | 'invalid' | 'duplicate';
}

// Simulated existing workspace members for duplicate detection
const existingMembers = [
  'tests@lsaf.com',
  'test@test.comss',
  'test@test.comsafas',
  'test@test.comsasfasf',
];

export function InviteMembersPanel({ onClose, onInvite, roleSystem, onNavigateToRoles, groups = [], onNavigateToGroups, publicFeatureEnabled = true, availableSeats = 999, totalSeats = 999, availableRoles }: InviteMembersPanelProps) {
  const { alert: appAlert } = useAppPopup();
  // Extract group names from groups data
  const availableGroups = groups.map(g => g.name);
  
  // Stage management
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);
  
  const [emailTags, setEmailTags] = useState<EmailTag[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<any>(
    roleSystem === 'new' 
      ? { selectedRole: 'Operator' }
      : { training: 'None', content: 'None', administration: 'None' }
  );
  const [showGroupContextMenu, setShowGroupContextMenu] = useState<{ top: number; left: number } | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showRolesContextMenu, setShowRolesContextMenu] = useState(false);
  const [rolesMenuPosition, setRolesMenuPosition] = useState<{ top: number; left?: number; right?: number } | null>(null);
  const rolesButtonRef = useRef<HTMLButtonElement>(null);
  const groupsButtonRef = useRef<HTMLButtonElement>(null);
  const [showRequestSeatsModal, setShowRequestSeatsModal] = useState(false);
  const [showSeatsExceededModal, setShowSeatsExceededModal] = useState(false);

  const validateEmail = (email: string): 'valid' | 'invalid' | 'duplicate' => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'invalid';
    }
    
    // Check for duplicates in existing members
    if (existingMembers.includes(email)) {
      return 'duplicate';
    }
    
    // Check for duplicates in current tags
    if (emailTags.some(tag => tag.email === email)) {
      return 'duplicate';
    }
    
    return 'valid';
  };

  const generateRandomEmails = () => {
    // Generate only valid emails with no errors
    const randomNames = ['alex', 'jamie', 'taylor', 'casey', 'morgan', 'riley', 'jordan', 'avery', 'quinn', 'sage', 'blake', 'cameron', 'drew', 'emerson', 'finley'];
    const randomDomains = ['test.com', 'demo.io', 'sample.org', 'example.net', 'mock.dev', 'trial.co', 'preview.app'];
    const randomNumber = Math.floor(Math.random() * 10000);
    
    // Generate a random count of emails (between 3 and 12)
    const emailCount = Math.floor(Math.random() * 10) + 3;
    
    const newEmails: EmailTag[] = [];
    
    for (let i = 0; i < emailCount; i++) {
      // Only generate valid emails
      const name = randomNames[Math.floor(Math.random() * randomNames.length)];
      const domain = randomDomains[Math.floor(Math.random() * randomDomains.length)];
      newEmails.push({
        email: `${name}${randomNumber + i}@${domain}`,
        status: 'valid'
      });
    }
    
    setEmailTags(newEmails);
  };

  const generateRandomEmailsWithErrors = () => {
    // Generate emails with errors (invalid and duplicate)
    const randomNames = ['alex', 'jamie', 'taylor', 'casey', 'morgan', 'riley', 'jordan', 'avery', 'quinn', 'sage', 'blake', 'cameron', 'drew', 'emerson', 'finley'];
    const randomDomains = ['test.com', 'demo.io', 'sample.org', 'example.net', 'mock.dev', 'trial.co', 'preview.app'];
    const randomNumber = Math.floor(Math.random() * 10000);
    
    // Generate a random count of emails (between 3 and 12)
    const emailCount = Math.floor(Math.random() * 10) + 3;
    
    const newEmails: EmailTag[] = [];
    
    for (let i = 0; i < emailCount; i++) {
      const randomValue = Math.random();
      
      if (randomValue < 0.3) {
        // Invalid email (30% chance)
        const invalidPatterns = [
          `invalidemail${i}`,
          `no@domain${i}`,
          `@${randomDomains[Math.floor(Math.random() * randomDomains.length)]}`,
          `${randomNames[Math.floor(Math.random() * randomNames.length)]}@`,
          `${randomNames[Math.floor(Math.random() * randomNames.length)]}.com`,
          `user${i}@@test.com`,
          `user${i}@test`,
        ];
        newEmails.push({
          email: invalidPatterns[Math.floor(Math.random() * invalidPatterns.length)],
          status: 'invalid'
        });
      } else if (randomValue < 0.5) {
        // Duplicate email (20% chance)
        newEmails.push({
          email: existingMembers[Math.floor(Math.random() * existingMembers.length)],
          status: 'duplicate'
        });
      } else {
        // Valid email (50% chance)
        const name = randomNames[Math.floor(Math.random() * randomNames.length)];
        const domain = randomDomains[Math.floor(Math.random() * randomDomains.length)];
        newEmails.push({
          email: `${name}${randomNumber + i}@${domain}`,
          status: 'valid'
        });
      }
    }
    
    setEmailTags(newEmails);
  };

  const simulateFileUpload = () => {
    // Simulate uploading a file with demo emails
    const demoEmails = [
      'john.smith@company.com',
      'sarah.jones@business.com',
      'mike.wilson@startup.io',
      'emily.brown@tech.com',
      'david.lee@enterprise.net',
      'lisa.taylor@digital.com',
      'tests@lsaf.com', // duplicate
      'invalid-email', // invalid
      'robert.martin@office.com',
      'jennifer.white@workspace.com',
    ];

    const newTags = demoEmails.map(email => ({
      email,
      status: validateEmail(email) as 'valid' | 'invalid' | 'duplicate'
    }));

    setEmailTags([...emailTags, ...newTags]);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      const email = inputValue.trim().replace(/,/g, '').replace(/\s/g, '');
      if (email) {
        const status = validateEmail(email);
        const newTag = { email, status };
        const newTags = [...emailTags, newTag];
        
        // Check if adding this email exceeds available seats
        const validCount = newTags.filter(t => t.status === 'valid').length;
        if (validCount > availableSeats) {
          setShowSeatsExceededModal(true);
          return;
        }
        
        setEmailTags(newTags);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && inputValue === '' && emailTags.length > 0) {
      // Remove the last email tag when backspace is pressed on empty input
      e.preventDefault();
      setEmailTags(emailTags.slice(0, -1));
    }
  };

  const removeEmail = (index: number) => {
    setEmailTags(emailTags.filter((_, i) => i !== index));
  };

  const handleRolesButtonClick = () => {
    const button = rolesButtonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      // Estimate menu height based on role system
      const menuHeight = roleSystem === 'new' ? 200 : 400;
      const menuWidth = 320;
      
      const position = calculateMenuPosition(rect, menuWidth, menuHeight);
      setRolesMenuPosition(position);
      setShowRolesContextMenu(true);
    }
  };

  const handleInvite = () => {
    const validEmails = emailTags.filter(tag => tag.status === 'valid').map(tag => tag.email);
    
    // Check if we have enough seats
    if (validEmails.length > availableSeats) {
      setShowRequestSeatsModal(true);
      return;
    }
    
    onInvite(validEmails, selectedGroups.length > 0 ? selectedGroups[0] : null, selectedProjects, selectedRoles);
    onClose();
  };

  const extractEmailsFromFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert sheet to JSON
        const jsonData: any[] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Extract all email-like strings from all cells
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const extractedEmails: string[] = [];
        
        jsonData.forEach((row: any[]) => {
          row.forEach((cell: any) => {
            const cellStr = String(cell).trim();
            if (emailRegex.test(cellStr)) {
              extractedEmails.push(cellStr);
            }
          });
        });
        
        // Add extracted emails to tags
        const newTags = extractedEmails.map(email => ({
          email,
          status: validateEmail(email) as 'valid' | 'invalid' | 'duplicate'
        }));
        
        setEmailTags([...emailTags, ...newTags]);
      } catch (error) {
        console.error('Error parsing file:', error);
        appAlert("Failed to parse the file. Please make sure it's a valid Excel or CSV file.", { title: 'Parse Error', variant: 'error' });
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is Excel or CSV
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        extractEmailsFromFile(file);
      } else {
        appAlert('Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file.', { title: 'Invalid File Type', variant: 'error' });
      }
    }
    
    // Reset input so the same file can be uploaded again
    event.target.value = '';
  };

  const getRolesDisplay = () => {
    if (roleSystem === 'new') {
      return selectedRoles.selectedRole || 'Operator';
    } else {
      const nonNoneRoles = Object.entries(selectedRoles).filter(([_, value]) => value !== 'None');
      if (nonNoneRoles.length === 0) return 'Select roles';
      return `${nonNoneRoles.length} selected`;
    }
  };

  const invalidEmails = emailTags.filter(tag => tag.status === 'invalid');
  const duplicateEmails = emailTags.filter(tag => tag.status === 'duplicate');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div 
        className="bg-card rounded-xl w-full max-w-[640px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ 
          border: '1px solid var(--border)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)'
        }}
      >
        {/* Header with enhanced visual hierarchy */}
        <div className="px-6 py-5 border-b border-border relative overflow-hidden">
          {/* Subtle gradient background */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)'
            }}
          />
          
          <div className="relative">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={{ 
                      backgroundColor: 'var(--primary)',
                      boxShadow: '0 4px 12px rgba(47, 128, 237, 0.25)'
                    }}
                  >
                    {currentStage === 1 && <Mail className="w-5 h-5" style={{ color: 'var(--primary-foreground)' }} />}
                    {currentStage === 2 && <Users className="w-5 h-5" style={{ color: 'var(--primary-foreground)' }} />}
                    {currentStage === 3 && <Send className="w-5 h-5" style={{ color: 'var(--primary-foreground)' }} />}
                  </div>
                  <div>
                    <h2 className="font-bold leading-tight" style={{ color: 'var(--foreground)', fontSize: 'var(--text-h2)', fontFamily: 'var(--font-family)' }}>
                      {currentStage === 1 && 'Add members'}
                      {currentStage === 2 && 'Set permissions'}
                      {currentStage === 3 && 'Final review'}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
                      {currentStage === 1 && 'Enter emails or upload a file'}
                      {currentStage === 2 && 'Choose roles and groups'}
                      {currentStage === 3 && 'Review and send invites'}
                    </p>
                  </div>
                  {currentStage === 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={generateRandomEmails}
                        className="p-2 rounded-lg transition-all hover:scale-110"
                        style={{ 
                          backgroundColor: 'var(--secondary)',
                          color: 'var(--muted)'
                        }}
                        title="Generate valid test emails"
                      >
                        <Bug className="w-4 h-4" />
                      </button>
                      <button
                        onClick={generateRandomEmailsWithErrors}
                        className="p-2 rounded-lg transition-all hover:scale-110"
                        style={{ 
                          backgroundColor: 'var(--destructive-background)',
                          color: 'var(--destructive)'
                        }}
                        title="Generate test emails with errors"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-destructive/10 rounded-lg transition-all hover:scale-110"
                style={{ color: 'var(--muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 flex-1">
                <div 
                  className="flex items-center justify-center w-6 h-6 rounded text-xs transition-all"
                  style={{
                    backgroundColor: currentStage >= 1 ? 'var(--primary)' : 'var(--secondary)',
                    color: currentStage >= 1 ? 'var(--primary-foreground)' : 'var(--muted)',
                    fontFamily: 'var(--font-family)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}
                >
                  {currentStage > 1 ? '✓' : '1'}
                </div>
                <div 
                  className="h-0.5 flex-1 rounded-full transition-all"
                  style={{ backgroundColor: currentStage >= 2 ? 'var(--primary)' : 'var(--border)' }}
                />
              </div>
              <div className="flex items-center gap-1.5 flex-1">
                <div 
                  className="flex items-center justify-center w-6 h-6 rounded text-xs transition-all"
                  style={{
                    backgroundColor: currentStage >= 2 ? 'var(--primary)' : 'var(--secondary)',
                    color: currentStage >= 2 ? 'var(--primary-foreground)' : 'var(--muted)',
                    fontFamily: 'var(--font-family)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}
                >
                  {currentStage > 2 ? '✓' : '2'}
                </div>
                <div 
                  className="h-0.5 flex-1 rounded-full transition-all"
                  style={{ backgroundColor: currentStage >= 3 ? 'var(--primary)' : 'var(--border)' }}
                />
              </div>
              <div 
                className="flex items-center justify-center w-6 h-6 rounded text-xs transition-all"
                style={{
                  backgroundColor: currentStage >= 3 ? 'var(--primary)' : 'var(--secondary)',
                  color: currentStage >= 3 ? 'var(--primary-foreground)' : 'var(--muted)',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-semibold)'
                }}
              >
                3
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <>
          {currentStage === 1 && (
            <div className="flex flex-col gap-5">
              {/* Seats Info - Subtle */}
              <div 
                className="px-3 py-2 rounded-lg flex items-center gap-2 border"
                style={{ 
                  backgroundColor: availableSeats === 0 ? 'var(--destructive-background)' : 'var(--secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <Users className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
                <p 
                  className="text-xs" 
                  style={{ 
                    color: availableSeats === 0 ? 'var(--destructive)' : 'var(--muted)', 
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  {availableSeats === 0 ? 'No seats available' : `${availableSeats} of ${totalSeats} seats available`}
                </p>
              </div>

            {/* Email Input Section */}
            <div className="flex flex-col gap-2.5">
              <label className="font-bold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)', fontSize: 'var(--text-base)' }}>
                Email addresses
              </label>
              
              {/* Email Tags Container */}
              <div 
                className="border rounded-lg p-3 transition-all"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  minHeight: emailTags.length === 0 ? '54px' : 'auto',
                  maxHeight: '240px',
                  overflowY: 'auto'
                }}
              >
                <div className="flex flex-wrap gap-2">
                  {emailTags.map((tag, index) => (
                    <div
                      key={index}
                      className="px-2.5 py-1 rounded flex items-center gap-2 transition-all group"
                      style={{ 
                        backgroundColor: tag.status === 'invalid' || tag.status === 'duplicate'
                          ? 'var(--destructive-background)' 
                          : 'var(--secondary)',
                        color: tag.status === 'invalid' || tag.status === 'duplicate'
                          ? 'var(--destructive)'
                          : 'var(--foreground)',
                        border: `1px solid ${
                          tag.status === 'invalid' || tag.status === 'duplicate'
                            ? 'var(--destructive)' 
                            : 'var(--border)'
                        }`
                      }}
                    >
                      <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>{tag.email}</span>
                      <button
                        onClick={() => removeEmail(index)}
                        className="opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder={emailTags.length === 0 ? "Type email and press Enter, comma, or space" : "Add more..."}
                    className="flex-1 min-w-[220px] outline-none bg-transparent py-2 placeholder:text-muted/60"
                    style={{ 
                      color: 'var(--foreground)',
                      fontSize: 'var(--text-base)',
                      fontFamily: 'var(--font-family)'
                    }}
                    autoFocus
                  />
                </div>
              </div>

              {/* Enhanced Error Messages */}
              <div className="flex flex-col gap-2">
                {invalidEmails.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg animate-in slide-in-from-top-1" style={{ backgroundColor: 'var(--destructive-background)' }}>
                    <AlertCircle className="w-4 h-4" style={{ color: 'var(--destructive)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--destructive)', fontFamily: 'var(--font-family)' }}>
                      {invalidEmails.length} invalid email{invalidEmails.length !== 1 ? 's' : ''} - check format
                    </p>
                  </div>
                )}
                {duplicateEmails.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg animate-in slide-in-from-top-1" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                    <AlertCircle className="w-4 h-4" style={{ color: '#d97706' }} />
                    <p className="text-sm font-medium" style={{ color: '#d97706', fontFamily: 'var(--font-family)' }}>
                      {duplicateEmails.length} already in workspace
                    </p>
                  </div>
                )}
              </div>
              
              {/* Quick Actions Bar - Enhanced */}
              <div className="flex items-center justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label 
                      htmlFor="file-upload"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer"
                      style={{ 
                        color: 'var(--muted)',
                        fontFamily: 'var(--font-family)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--muted)';
                      }}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload CSV/Excel</span>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="left"
                    style={{ 
                      backgroundColor: 'var(--popover)',
                      color: 'var(--popover-foreground)',
                      fontFamily: 'var(--font-family)',
                      fontSize: 'var(--text-sm)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      padding: '8px 12px'
                    }}
                  >
                    Quick bulk import: Upload a file and we'll extract all email addresses
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            </div>
          )}

          {currentStage === 2 && (
            <div className="flex flex-col gap-5">
              {/* Configure Permissions */}
              <div className="flex flex-col gap-2.5">
                <label className="font-bold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)', fontSize: 'var(--text-base)' }}>
                  Role
                </label>
                <button
                  ref={rolesButtonRef}
                  onClick={handleRolesButtonClick}
                  className="w-full px-4 py-3 border rounded-lg flex items-center justify-between transition-all hover:bg-secondary"
                  style={{ 
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <span className="font-medium" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)', fontSize: 'var(--text-base)' }}>
                    {getRolesDisplay()}
                  </span>
                  <ChevronDown className="w-5 h-5" style={{ color: 'var(--muted)' }} />
                </button>
              </div>

              {/* Groups Section */}
              <div className="flex flex-col gap-2.5">
                <label className="font-bold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)', fontSize: 'var(--text-base)' }}>
                  Groups <span className="text-xs font-normal ml-1" style={{ color: 'var(--muted)' }}>(optional)</span>
                </label>
                <button
                  ref={groupsButtonRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    const button = e.currentTarget;
                    const rect = button.getBoundingClientRect();
                    const menuWidth = 320;
                    const menuHeight = 400;
                    
                    let top = rect.bottom + 4;
                    let left = rect.left;
                    
                    // Check if menu would go off right edge
                    if (left + menuWidth > window.innerWidth) {
                      left = window.innerWidth - menuWidth - 16;
                    }
                    
                    // Check if menu would go off bottom edge
                    if (top + menuHeight > window.innerHeight) {
                      top = rect.top - menuHeight - 4;
                    }
                    
                    setShowGroupContextMenu({ top, left });
                  }}
                  className="w-full px-4 py-3 border rounded-lg transition-all hover:bg-secondary"
                  style={{ 
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium" style={{ color: selectedGroups.length === 0 ? 'var(--muted)' : 'var(--foreground)', fontFamily: 'var(--font-family)', fontSize: 'var(--text-base)' }}>
                      {selectedGroups.length === 0 ? 'Select groups' : `${selectedGroups.length} group${selectedGroups.length > 1 ? 's' : ''} selected`}
                    </span>
                    <ChevronDown className="w-5 h-5" style={{ color: 'var(--muted)' }} />
                  </div>
                </button>
              </div>
            </div>
          )}

          {currentStage === 3 && (
            <div className="flex flex-col gap-5">
              {/* Review Summary */}
              <div 
                className="px-4 py-3 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p 
                        className="font-bold" 
                        style={{ 
                          color: 'var(--foreground)', 
                          fontFamily: 'var(--font-family)',
                          fontSize: 'var(--text-base)'
                        }}
                      >
                        Inviting {emailTags.filter(tag => tag.status === 'valid').length} member{emailTags.filter(tag => tag.status === 'valid').length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
                        Review before sending
                      </p>
                    </div>
                  </div>
                  
                  <div className="h-px" style={{ backgroundColor: 'var(--border)' }} />
                  
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>Role:</p>
                      <p 
                        className="text-sm font-medium" 
                        style={{ 
                          color: 'var(--foreground)', 
                          fontFamily: 'var(--font-family)'
                        }}
                      >
                        {getRolesDisplay()}
                      </p>
                    </div>
                    {selectedGroups.length > 0 && (
                      <div className="flex items-start gap-2">
                        <p className="text-xs pt-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>Groups:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedGroups.map((groupName) => {
                            const group = groups.find(g => g.name === groupName);
                            const groupColor = group?.color || '#888888';
                            return (
                              <span
                                key={groupName}
                                className="px-2 py-0.5 rounded-lg text-xs flex items-center gap-1"
                                style={{
                                  backgroundColor: `${groupColor}20`,
                                  color: groupColor,
                                  border: `1px solid ${groupColor}`,
                                  fontFamily: 'var(--font-family)',
                                }}
                              >
                                <Users className="w-3 h-3" style={{ color: groupColor }} />
                                {groupName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Access */}
              <div className="flex flex-col gap-2.5">
                <label className="font-bold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)', fontSize: 'var(--text-base)' }}>
                  Project Access <span className="text-xs font-normal ml-1" style={{ color: 'var(--muted)' }}>(optional)</span>
                </label>
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="w-full px-4 py-3 border rounded-lg flex items-center justify-between transition-all hover:bg-secondary"
                  style={{ 
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <span className="font-medium" style={{ color: selectedProjects.length > 0 || selectedGroups.length > 0 ? 'var(--foreground)' : 'var(--muted)', fontFamily: 'var(--font-family)', fontSize: 'var(--text-base)' }}>
                    {(() => {
                      // Get all projects from selected groups
                      const groupProjects = selectedGroups.flatMap(groupName => {
                        const group = groups.find(g => g.name === groupName);
                        return group?.projects || [];
                      });
                      
                      // Combine group projects with manually selected projects (remove duplicates)
                      const allProjects = Array.from(new Set([...groupProjects, ...selectedProjects]));
                      
                      if (allProjects.length === 0) {
                        return 'Add specific projects';
                      }
                      
                      // Count projects, folders, and items
                      const projectCount = allProjects.filter(p => !p.includes('f')).length;
                      const folderCount = allProjects.filter(p => p.includes('f') && !p.includes('i')).length;
                      const itemCount = allProjects.filter(p => p.includes('i')).length;
                      
                      const parts = [];
                      if (projectCount > 0) parts.push(`${projectCount} project${projectCount > 1 ? 's' : ''}`);
                      if (folderCount > 0) parts.push(`${folderCount} folder${folderCount > 1 ? 's' : ''}`);
                      if (itemCount > 0) parts.push(`${itemCount} item${itemCount > 1 ? 's' : ''}`);
                      
                      return parts.join(', ');
                    })()}
                  </span>
                  <ChevronDown className="w-5 h-5" style={{ color: 'var(--muted)' }} />
                </button>
              </div>
            </div>
          )}
          </>
        </div>

        {/* Enhanced Footer with prominent CTAs */}
        <div 
          className="px-6 py-4 border-t flex items-center justify-between gap-3"
          style={{ 
            borderColor: 'var(--border)',
            backgroundColor: 'var(--card)'
          }}
        >
          <div>
            {currentStage > 1 && (
              <button
                onClick={() => setCurrentStage((currentStage - 1) as 1 | 2 | 3)}
                className="px-5 py-2.5 rounded-lg transition-all hover:scale-105 flex items-center gap-2"
                style={{ 
                  backgroundColor: 'var(--secondary)',
                  color: 'var(--foreground)', 
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-semibold)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-background)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--secondary)';
                }}
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg transition-all hover:scale-105"
              style={{ 
                backgroundColor: 'var(--secondary)',
                color: 'var(--foreground)', 
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: 'var(--text-base)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--destructive-background)';
                e.currentTarget.style.color = 'var(--destructive)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--secondary)';
                e.currentTarget.style.color = 'var(--foreground)';
              }}
            >
              Cancel
            </button>
            {currentStage < 3 ? (
              <button
                onClick={() => {
                  // Close any open dropdowns
                  setShowRolesContextMenu(false);
                  setShowGroupContextMenu(null);
                  setShowProjectModal(false);
                  // Move to next stage
                  setCurrentStage((currentStage + 1) as 1 | 2 | 3);
                }}
                disabled={currentStage === 1 && emailTags.filter(tag => tag.status === 'valid').length === 0}
                className="px-6 py-3 rounded-xl transition-all hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center gap-2.5 font-bold"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--text-base)',
                  boxShadow: '0 4px 12px rgba(47, 128, 237, 0.3)',
                  opacity: currentStage === 1 && emailTags.filter(tag => tag.status === 'valid').length === 0 ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!(currentStage === 1 && emailTags.filter(tag => tag.status === 'valid').length === 0)) {
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(47, 128, 237, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(47, 128, 237, 0.3)';
                }}
              >
                <span>Continue</span>
                <ChevronDown className="w-5 h-5 -rotate-90" />
              </button>
            ) : (
              <button
                onClick={handleInvite}
                className="px-6 py-3 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2.5 font-bold"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--text-base)',
                  boxShadow: '0 4px 12px rgba(47, 128, 237, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(47, 128, 237, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(47, 128, 237, 0.3)';
                }}
              >
                <Send className="w-5 h-5" />
                <span>Send Invitations ({emailTags.filter(tag => tag.status === 'valid').length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Group Context Menu */}
      {showGroupContextMenu && (
        <GroupContextMenu
          currentGroups={selectedGroups}
          onClose={() => setShowGroupContextMenu(null)}
          onSave={(groups) => {
            setSelectedGroups(groups);
          }}
          position={showGroupContextMenu}
          allowMultiple={true}
          availableGroups={availableGroups}
          availableGroupsWithColors={groups.map(g => ({ name: g.name, color: g.color }))}
          onManageGroups={onNavigateToGroups}
        />
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <ProjectAccessModal
          currentProjects={selectedProjects}
          memberGroups={selectedGroups}
          onClose={() => setShowProjectModal(false)}
          onSave={(projects) => {
            setSelectedProjects(projects);
            setShowProjectModal(false);
          }}
          groups={groups}
          publicFeatureEnabled={publicFeatureEnabled}
        />
      )}

      {/* Roles Context Menu */}
      {showRolesContextMenu && rolesMenuPosition && (() => {
        // Calculate max height based on available space
        const spaceBelow = window.innerHeight - rolesMenuPosition.top;
        const spaceAbove = rolesMenuPosition.top;
        const maxHeight = Math.max(spaceBelow, spaceAbove) - 32; // 32px padding
        
        return (
          <div
            className="fixed z-50"
            style={{ 
              top: `${rolesMenuPosition.top}px`, 
              left: rolesMenuPosition.left !== undefined ? `${rolesMenuPosition.left}px` : undefined,
              right: rolesMenuPosition.right !== undefined ? `${rolesMenuPosition.right}px` : undefined,
              maxHeight: `${maxHeight}px`,
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {roleSystem === 'new' ? (
              <SimpleRolesContextMenu
                currentRole={selectedRoles.selectedRole}
                onClose={() => setShowRolesContextMenu(false)}
                onSelect={(role) => {
                  setSelectedRoles({ selectedRole: role });
                  setShowRolesContextMenu(false);
                }}
                onNavigateToRoles={onNavigateToRoles}
                availableRoles={availableRoles}
              />
            ) : (
              <RolesSelectionContextMenu
                currentRoles={selectedRoles}
                onClose={() => setShowRolesContextMenu(false)}
                onSave={(roles) => {
                  setSelectedRoles(roles);
                  setShowRolesContextMenu(false);
                }}
                onNavigateToRoles={onNavigateToRoles}
              />
            )}
          </div>
        );
      })()}

      {/* Request Seats Modal */}
      {showRequestSeatsModal && (
        <RequestSeatsModal
          onClose={() => setShowRequestSeatsModal(false)}
          availableSeats={availableSeats}
          totalSeats={totalSeats}
        />
      )}
      
      {/* Seats Exceeded Modal */}
      {showSeatsExceededModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowSeatsExceededModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="seats-exceeded-title"
        >
          <div
            className="bg-card rounded-lg border w-full max-w-md m-4 p-6"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--destructive-background)' }}
                aria-hidden="true"
              >
                <AlertCircle className="w-5 h-5" style={{ color: 'var(--destructive)' }} />
              </div>
              <div className="flex-1">
                <h3 
                  id="seats-exceeded-title"
                  className="font-bold mb-1" 
                  style={{ 
                    color: 'var(--foreground)', 
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-lg)'
                  }}
                >
                  Not enough seats
                </h3>
                <p 
                  className="text-sm" 
                  style={{ 
                    color: 'var(--muted)', 
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  You only have {availableSeats} seat{availableSeats !== 1 ? 's' : ''} available. Remove some emails or contact support to add more seats.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSeatsExceededModal(false)}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
