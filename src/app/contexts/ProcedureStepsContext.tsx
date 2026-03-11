import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Step } from '../components/procedure-editor/ProcedureEditor';
import { DEFAULT_PROCEDURE_STEPS } from '../data/mockProcedureSteps';

// Shared store for procedure step data — used by both ProcedureEditor (3D) and ProcedureCanvas (flow editor)

interface ProcedureStepsContextType {
  getSteps: (procedureId: string) => Step[];
  setSteps: (procedureId: string, steps: Step[]) => void;
  getTitle: (procedureId: string) => string;
  setTitle: (procedureId: string, title: string) => void;
}

const ProcedureStepsContext = createContext<ProcedureStepsContextType | null>(null);

export function ProcedureStepsProvider({ children }: { children: ReactNode }) {
  const [stepsMap, setStepsMap] = useState<Record<string, Step[]>>(() => {
    const initial: Record<string, Step[]> = {};
    for (const [id, data] of Object.entries(DEFAULT_PROCEDURE_STEPS)) {
      initial[id] = data.steps;
    }
    return initial;
  });

  const [titlesMap, setTitlesMap] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const [id, data] of Object.entries(DEFAULT_PROCEDURE_STEPS)) {
      initial[id] = data.title;
    }
    return initial;
  });

  const getSteps = useCallback((procedureId: string): Step[] => {
    return stepsMap[procedureId] || [];
  }, [stepsMap]);

  const setSteps = useCallback((procedureId: string, steps: Step[]) => {
    setStepsMap(prev => ({ ...prev, [procedureId]: steps }));
  }, []);

  const getTitle = useCallback((procedureId: string): string => {
    return titlesMap[procedureId] || '';
  }, [titlesMap]);

  const setTitle = useCallback((procedureId: string, title: string) => {
    setTitlesMap(prev => ({ ...prev, [procedureId]: title }));
  }, []);

  return (
    <ProcedureStepsContext.Provider value={{ getSteps, setSteps, getTitle, setTitle }}>
      {children}
    </ProcedureStepsContext.Provider>
  );
}

export function useProcedureSteps() {
  const ctx = useContext(ProcedureStepsContext);
  if (!ctx) throw new Error('useProcedureSteps must be used within ProcedureStepsProvider');
  return ctx;
}
