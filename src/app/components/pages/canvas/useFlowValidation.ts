import { useRef, useEffect, useState } from 'react';
import type { Node, Edge } from 'reactflow';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export type ValidationIssueType =
  | 'unreachable'
  | 'dead-end'
  | 'missing-content'
  | 'cycle'
  | 'orphan-edge'
  | 'empty-branch';

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  type: ValidationIssueType;
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export interface ValidationResult {
  issues: ValidationIssue[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
  totalCount: number;
  nodeIssueMap: Map<string, ValidationSeverity>; // nodeId -> highest severity
}

function runValidation(nodes: Node[], edges: Edge[]): ValidationResult {
  const issues: ValidationIssue[] = [];
  let issueIdx = 0;

  const nodeMap = new Map<string, Node>();
  for (const n of nodes) nodeMap.set(n.id, n);

  // Build adjacency (source -> targets)
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source)!.push(e.target);
  }

  // --- Orphan edges ---
  for (const e of edges) {
    if (!nodeMap.has(e.source) || !nodeMap.has(e.target)) {
      issues.push({
        id: `v-${issueIdx++}`,
        severity: 'error',
        type: 'orphan-edge',
        message: `Edge connects to a deleted node`,
        edgeId: e.id,
        nodeId: nodeMap.has(e.source) ? e.source : e.target,
      });
    }
  }

  // --- Reachability (BFS from start-node) ---
  const reachable = new Set<string>();
  const queue: string[] = ['start-node'];
  reachable.add('start-node');
  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adj.get(current) || [];
    for (const n of neighbors) {
      if (!reachable.has(n)) {
        reachable.add(n);
        queue.push(n);
      }
    }
  }

  for (const n of nodes) {
    if (n.type === 'note') continue; // notes don't need connections
    if (!reachable.has(n.id) && n.id !== 'start-node') {
      issues.push({
        id: `v-${issueIdx++}`,
        severity: 'warning',
        type: 'unreachable',
        message: `"${(n.data as any).title || n.id}" is not connected to Start`,
        nodeId: n.id,
      });
    }
  }

  // --- Dead ends (reachable nodes with no outgoing edges, excluding notes) ---
  for (const n of nodes) {
    if (n.type === 'note' || n.type === 'start') continue;
    if (!reachable.has(n.id)) continue;

    const outgoing = edges.filter(e => e.source === n.id);
    if (outgoing.length === 0) {
      issues.push({
        id: `v-${issueIdx++}`,
        severity: 'info',
        type: 'dead-end',
        message: `"${(n.data as any).title || n.id}" has no outgoing connection (end step?)`,
        nodeId: n.id,
      });
    }
  }

  // --- Missing content ---
  for (const n of nodes) {
    if (n.type !== 'dynamic') continue;
    const d = n.data as any;
    const title = (d.title || '').trim();
    const desc = (d.description || '').trim();

    if (!title || /^Step \d+$/.test(title)) {
      issues.push({
        id: `v-${issueIdx++}`,
        severity: 'info',
        type: 'missing-content',
        message: `"${title || 'Untitled'}" has a default or empty title`,
        nodeId: n.id,
      });
    }

    if (!desc) {
      issues.push({
        id: `v-${issueIdx++}`,
        severity: 'info',
        type: 'missing-content',
        message: `"${title || 'Untitled'}" has no description`,
        nodeId: n.id,
      });
    }
  }

  // --- Cycle detection (DFS coloring) ---
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  for (const n of nodes) color.set(n.id, WHITE);

  const cycleNodes = new Set<string>();

  function dfs(nodeId: string): boolean {
    color.set(nodeId, GRAY);
    const neighbors = adj.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (color.get(neighbor) === GRAY) {
        // Back edge = cycle
        cycleNodes.add(nodeId);
        cycleNodes.add(neighbor);
        return true;
      }
      if (color.get(neighbor) === WHITE) {
        if (dfs(neighbor)) {
          cycleNodes.add(nodeId);
        }
      }
    }
    color.set(nodeId, BLACK);
    return false;
  }

  dfs('start-node');
  // Also check unreachable components
  for (const n of nodes) {
    if (color.get(n.id) === WHITE) {
      dfs(n.id);
    }
  }

  if (cycleNodes.size > 0) {
    // Report one warning per cycle participant
    const reported = new Set<string>();
    for (const nId of cycleNodes) {
      if (reported.has(nId)) continue;
      reported.add(nId);
      const node = nodeMap.get(nId);
      if (node && node.type !== 'note') {
        issues.push({
          id: `v-${issueIdx++}`,
          severity: 'warning',
          type: 'cycle',
          message: `"${(node.data as any).title || nId}" is part of a loop`,
          nodeId: nId,
        });
      }
    }
  }

  // --- Empty branches ---
  for (const n of nodes) {
    if (n.type === 'dynamic') {
      const d = n.data as any;
      const options = d.options || [];
      if (options.length > 1) {
        // Check each option handle
        const sourceHandles = new Set(edges.filter(e => e.source === n.id).map(e => e.sourceHandle));
        for (const opt of options) {
          if (!sourceHandles.has(opt.id)) {
            issues.push({
              id: `v-${issueIdx++}`,
              severity: 'warning',
              type: 'empty-branch',
              message: `"${d.title || 'Untitled'}" has unconnected output "${opt.text}"`,
              nodeId: n.id,
            });
          }
        }
      }
    }

    if (n.type === 'logic') {
      const d = n.data as any;
      if (d.logicType === 'platform-switch' && d.platforms) {
        const sourceHandles = new Set(edges.filter(e => e.source === n.id).map(e => e.sourceHandle));
        for (const plat of d.platforms) {
          if (!sourceHandles.has(plat.id)) {
            issues.push({
              id: `v-${issueIdx++}`,
              severity: 'warning',
              type: 'empty-branch',
              message: `Platform Switch has unconnected "${plat.label}" output`,
              nodeId: n.id,
            });
          }
        }
      }
    }
  }

  // Build node-to-highest-severity map
  const nodeIssueMap = new Map<string, ValidationSeverity>();
  const severityRank: Record<ValidationSeverity, number> = { error: 3, warning: 2, info: 1 };

  for (const issue of issues) {
    if (issue.nodeId) {
      const current = nodeIssueMap.get(issue.nodeId);
      if (!current || severityRank[issue.severity] > severityRank[current]) {
        nodeIssueMap.set(issue.nodeId, issue.severity);
      }
    }
  }

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;

  return {
    issues,
    errorCount,
    warningCount,
    infoCount,
    totalCount: issues.length,
    nodeIssueMap,
  };
}

export function useFlowValidation(nodes: Node[], edges: Edge[], isOpen: boolean) {
  const [result, setResult] = useState<ValidationResult>({
    issues: [],
    errorCount: 0,
    warningCount: 0,
    infoCount: 0,
    totalCount: 0,
    nodeIssueMap: new Map(),
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced validation — runs 500ms after nodes/edges change
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setResult(runValidation(nodes, edges));
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [nodes, edges]);

  return result;
}
