import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface WorkspaceSettings {
  name: string;
  accentColor: string;
  logoUrl: string | null; // data URL from uploaded file, or null for default
}

interface WorkspaceContextType {
  workspace: WorkspaceSettings;
  updateWorkspace: (settings: Partial<WorkspaceSettings>) => void;
}

const defaultWorkspace: WorkspaceSettings = {
  name: 'Frontline360',
  accentColor: '#2F80ED',
  logoUrl: null,
};

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspace: defaultWorkspace,
  updateWorkspace: () => {},
});

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

function hexToRgba(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 1.00)`;
}

function hexToRgbaAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyAccentColor(hex: string) {
  const root = document.documentElement;
  const rgba = hexToRgba(hex);
  root.style.setProperty('--primary', rgba);
  root.style.setProperty('--primary-background', hexToRgbaAlpha(hex, 0.1));
  root.style.setProperty('--ring', rgba);
  root.style.setProperty('--sidebar-primary', rgba);
  root.style.setProperty('--sidebar-ring', rgba);
  root.style.setProperty('--chart-1', rgba);
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<WorkspaceSettings>(() => {
    try {
      const saved = localStorage.getItem('workspace-settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultWorkspace;
  });

  // Apply accent color on mount and whenever it changes
  useEffect(() => {
    applyAccentColor(workspace.accentColor);
  }, [workspace.accentColor]);

  const updateWorkspace = useCallback((settings: Partial<WorkspaceSettings>) => {
    setWorkspace(prev => {
      const next = { ...prev, ...settings };
      localStorage.setItem('workspace-settings', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <WorkspaceContext.Provider value={{ workspace, updateWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
