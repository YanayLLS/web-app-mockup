import type { Node, Edge } from 'reactflow';

/**
 * Built-in templates shipped with the app.
 * Each template has real, meaningful node/edge data that content creators
 * can use as a starting point for actual procedures.
 */

// Helper to create a node with defaults
function makeNode(
  id: string,
  y: number,
  title: string,
  description: string,
  extras: Record<string, any> = {},
  x = 400,
): Node {
  const optionId = extras._optionId || crypto.randomUUID();
  const options = extras.options || [{ id: optionId, text: extras._optionText || 'Continue' }];
  return {
    id,
    type: 'dynamic',
    position: { x, y },
    data: {
      title,
      description,
      isColorized: extras.isColorized ?? false,
      color: extras.color || '#2f80ed',
      isInput: extras.isInput ?? false,
      inputType: extras.inputType || 'text',
      isBranching: options.length > 1,
      options,
      popups: extras.popups || [],
      media: extras.media || [],
    },
  };
}

function makeEdge(source: string, sourceHandle: string, target: string): Edge {
  return {
    id: `e-${source}-${sourceHandle}-${target}`,
    source,
    target,
    sourceHandle,
    type: 'custom',
    style: { strokeWidth: 2, stroke: '#2f80ed' },
    animated: false,
  };
}

// ─── Procedure Starters (full procedures) ─────────────────────────────────

export function getEquipmentInspectionTemplate() {
  const n1 = 'ei-1', n2 = 'ei-2', n3 = 'ei-3', n4 = 'ei-4', n5 = 'ei-5', n6 = 'ei-6';
  const o1 = 'ei-o1', o2 = 'ei-o2', o3 = 'ei-o3', o4 = 'ei-o4';
  const oPass = 'ei-pass', oFail = 'ei-fail';

  const nodes: Node[] = [
    makeNode(n1, 0, 'Identify Equipment', 'Scan the equipment barcode or enter the asset ID manually to pull up its maintenance history and specifications.', {
      isInput: true, inputType: 'barcode', _optionId: o1, isColorized: true, color: '#3b82f6',
    }),
    makeNode(n2, 250, 'Visual Inspection', 'Perform a thorough visual inspection of the equipment exterior. Look for cracks, corrosion, loose fittings, or fluid leaks.', {
      _optionId: o2,
    }),
    makeNode(n3, 500, 'Functional Test', 'Run the equipment through its standard operating cycle. Monitor for unusual sounds, vibrations, or error codes on the control panel.', {
      _optionId: o3,
      isInput: true, inputType: 'text',
    }),
    makeNode(n4, 750, 'Pass or Fail?', 'Based on the visual inspection and functional test, determine if the equipment meets safety and performance standards.', {
      isColorized: true, color: '#f59e0b',
      options: [
        { id: oPass, text: 'Pass — Approved for use' },
        { id: oFail, text: 'Fail — Needs repair' },
      ],
    }),
    makeNode(n5, 1000, 'Approve & Tag Equipment', 'Attach an approved inspection sticker with today\'s date. Update the digital maintenance log to reflect the passed inspection.', {
      _optionId: o4, isColorized: true, color: '#10b981',
    }),
    makeNode(n6, 1000, 'Create Repair Work Order', 'Document all identified issues and submit a repair work order. Tag the equipment as "Out of Service" until repairs are completed.', {
      isColorized: true, color: '#ef4444',
      popups: [
        { id: 'p1', title: 'Safety Notice', description: 'Equipment that fails inspection must be immediately removed from the production floor and tagged with a red "Do Not Use" label.', media: [], color: '#ef4444' },
      ],
    }, 700),
  ];

  const edges: Edge[] = [
    makeEdge(n1, o1, n2),
    makeEdge(n2, o2, n3),
    makeEdge(n3, o3, n4),
    makeEdge(n4, oPass, n5),
    makeEdge(n4, oFail, n6),
  ];

  return { nodes, edges };
}

export function getSafetyLockoutTagoutTemplate() {
  const n1 = 'lt-1', n2 = 'lt-2', n3 = 'lt-3', n4 = 'lt-4', n5 = 'lt-5', n6 = 'lt-6', n7 = 'lt-7';
  const o1 = 'lt-o1', o2 = 'lt-o2', o3 = 'lt-o3', o4 = 'lt-o4', o5 = 'lt-o5', o6 = 'lt-o6';

  const nodes: Node[] = [
    makeNode(n1, 0, 'Notify Affected Personnel', 'Inform all operators and nearby workers that a lockout/tagout procedure is about to begin. Confirm they acknowledge the shutdown.', {
      _optionId: o1, isColorized: true, color: '#ef4444',
      popups: [
        { id: 'p1', title: 'OSHA Requirement', description: 'OSHA 29 CFR 1910.147 requires that all affected employees be notified before lockout/tagout begins. Failure to notify can result in citations.', media: [], color: '#f59e0b' },
      ],
    }),
    makeNode(n2, 250, 'Shut Down Equipment', 'Follow the manufacturer\'s normal shutdown procedure. Do not use the emergency stop unless there is an immediate hazard.', {
      _optionId: o2,
    }),
    makeNode(n3, 500, 'Isolate Energy Sources', 'Disconnect all energy sources: electrical, hydraulic, pneumatic, thermal, chemical, and gravitational. Use approved isolation devices.', {
      _optionId: o3,
    }),
    makeNode(n4, 750, 'Apply Locks & Tags', 'Each authorized worker applies their personal lock and tag to every energy isolation device. Tags must include worker name, date, and reason.', {
      _optionId: o4, isInput: true, inputType: 'picture',
    }),
    makeNode(n5, 1000, 'Verify Zero Energy State', 'Attempt to start the equipment using normal controls. Test with a voltage meter or pressure gauge to confirm zero energy. Equipment must NOT start.', {
      _optionId: o5, isColorized: true, color: '#f59e0b',
    }),
    makeNode(n6, 1250, 'Perform Maintenance Work', 'With verified lockout in place, proceed with the planned maintenance or repair task. Do not remove any locks until work is fully complete.', {
      _optionId: o6,
    }),
    makeNode(n7, 1500, 'Remove Locks & Restore', 'Each worker removes only their own lock. Verify all tools and personnel are clear. Restore energy and perform a test run. Notify all personnel.', {
      isColorized: true, color: '#10b981',
    }),
  ];

  const edges: Edge[] = [
    makeEdge(n1, o1, n2),
    makeEdge(n2, o2, n3),
    makeEdge(n3, o3, n4),
    makeEdge(n4, o4, n5),
    makeEdge(n5, o5, n6),
    makeEdge(n6, o6, n7),
  ];

  return { nodes, edges };
}

export function getNewEmployeeOnboardingTemplate() {
  const n1 = 'ob-1', n2 = 'ob-2', n3 = 'ob-3', n4 = 'ob-4', n5 = 'ob-5';
  const o1 = 'ob-o1', o2 = 'ob-o2', o3 = 'ob-o3', o4 = 'ob-o4';
  const oYes = 'ob-yes', oNo = 'ob-no';

  const nodes: Node[] = [
    makeNode(n1, 0, 'Welcome & Safety Briefing', 'Welcome the new employee. Walk through the facility safety rules, emergency exits, assembly points, and PPE requirements for their work area.', {
      _optionId: o1, isColorized: true, color: '#8b5cf6',
      popups: [
        { id: 'p1', title: 'Required PPE', description: 'Safety glasses, steel-toe boots, and hi-vis vest are required at all times on the production floor. Hearing protection required in zones marked with signage.', media: [], color: '#3b82f6' },
      ],
    }),
    makeNode(n2, 250, 'Workstation Setup', 'Guide the employee through their workstation. Show how to adjust the equipment, where tools are stored, and how to request supplies.', {
      _optionId: o2,
    }),
    makeNode(n3, 500, 'Hands-On Task Demo', 'Demonstrate the primary task the employee will perform. Have them observe one full cycle, then guide them through performing it themselves.', {
      _optionId: o3,
    }),
    makeNode(n4, 750, 'Competency Check', 'Have the employee complete the task independently while you observe. Ask them to explain each step and the safety considerations involved.', {
      isColorized: true, color: '#f59e0b',
      options: [
        { id: oYes, text: 'Competent — Ready to work' },
        { id: oNo, text: 'Needs more training' },
      ],
    }),
    makeNode(n5, 1000, 'Sign Off & Assign Buddy', 'Record the training completion. Assign a buddy/mentor for the employee\'s first two weeks. Schedule a 30-day check-in.', {
      _optionId: o4, isColorized: true, color: '#10b981',
      isInput: true, inputType: 'text',
    }),
  ];

  const edges: Edge[] = [
    makeEdge(n1, o1, n2),
    makeEdge(n2, o2, n3),
    makeEdge(n3, o3, n4),
    makeEdge(n4, oYes, n5),
    makeEdge(n4, oNo, n3), // Loop back for more training
  ];

  return { nodes, edges };
}

export function getQualityControlTemplate() {
  const n1 = 'qc-1', n2 = 'qc-2', n3 = 'qc-3', n4 = 'qc-4', n5 = 'qc-5', n6 = 'qc-6';
  const o1 = 'qc-o1', o2 = 'qc-o2', o3 = 'qc-o3', o4 = 'qc-o4', o5 = 'qc-o5';
  const oPass = 'qc-pass', oFail = 'qc-fail';

  const nodes: Node[] = [
    makeNode(n1, 0, 'Scan Product Batch', 'Scan the batch barcode to load specifications, tolerances, and the sampling plan for this product line.', {
      _optionId: o1, isInput: true, inputType: 'barcode', isColorized: true, color: '#3b82f6',
    }),
    makeNode(n2, 250, 'Dimensional Measurement', 'Using calibrated instruments, measure the critical dimensions listed in the spec sheet. Record each measurement.', {
      _optionId: o2, isInput: true, inputType: 'text',
    }),
    makeNode(n3, 500, 'Visual & Surface Inspection', 'Inspect the product surface for defects: scratches, dents, discoloration, burrs, or incomplete finishes. Use magnification if required.', {
      _optionId: o3,
      isInput: true, inputType: 'picture',
    }),
    makeNode(n4, 750, 'Accept or Reject?', 'Review all measurements and inspection notes. Determine if the batch meets release criteria.', {
      isColorized: true, color: '#f59e0b',
      options: [
        { id: oPass, text: 'Accept — Release batch' },
        { id: oFail, text: 'Reject — Hold for review' },
      ],
    }),
    makeNode(n5, 1000, 'Release Batch', 'Apply the QC approval stamp/label. Update the inventory system to mark the batch as released. Move to finished goods.', {
      _optionId: o4, isColorized: true, color: '#10b981',
    }),
    makeNode(n6, 1000, 'Quarantine & Report', 'Move the batch to the quarantine area. Create a non-conformance report (NCR) with photos and measurements. Notify the production supervisor.', {
      _optionId: o5, isColorized: true, color: '#ef4444',
      popups: [
        { id: 'p1', title: 'Non-Conformance Protocol', description: 'Rejected batches must be physically separated and clearly labeled. An NCR must be filed within 4 hours of detection. Root cause analysis is required within 48 hours.', media: [], color: '#ef4444' },
      ],
    }, 700),
  ];

  const edges: Edge[] = [
    makeEdge(n1, o1, n2),
    makeEdge(n2, o2, n3),
    makeEdge(n3, o3, n4),
    makeEdge(n4, oPass, n5),
    makeEdge(n4, oFail, n6),
  ];

  return { nodes, edges };
}

export function getChangeoverProcedureTemplate() {
  const n1 = 'co-1', n2 = 'co-2', n3 = 'co-3', n4 = 'co-4', n5 = 'co-5';
  const o1 = 'co-o1', o2 = 'co-o2', o3 = 'co-o3', o4 = 'co-o4';

  const nodes: Node[] = [
    makeNode(n1, 0, 'Confirm New Production Order', 'Review the incoming production order. Verify the product spec, quantity, and required tooling/materials before beginning changeover.', {
      _optionId: o1, isColorized: true, color: '#3b82f6',
    }),
    makeNode(n2, 250, 'Clean & Clear Previous Run', 'Remove all parts, materials, and labels from the previous product run. Clean the equipment per the cleaning SOP for this machine.', {
      _optionId: o2,
    }),
    makeNode(n3, 500, 'Install New Tooling & Settings', 'Swap in the required dies, molds, or fixtures for the new product. Enter the new machine parameters from the setup sheet.', {
      _optionId: o3,
      isInput: true, inputType: 'text',
    }),
    makeNode(n4, 750, 'Run First Article & Verify', 'Produce a small sample batch. Measure critical dimensions and compare against the spec sheet. Adjust settings if needed.', {
      _optionId: o4, isColorized: true, color: '#f59e0b',
      isInput: true, inputType: 'picture',
    }),
    makeNode(n5, 1000, 'Approve & Start Production', 'Once the first article passes inspection, approve the setup. Begin full production run and record the changeover time.', {
      isColorized: true, color: '#10b981',
    }),
  ];

  const edges: Edge[] = [
    makeEdge(n1, o1, n2),
    makeEdge(n2, o2, n3),
    makeEdge(n3, o3, n4),
    makeEdge(n4, o4, n5),
  ];

  return { nodes, edges };
}


// ─── Reusable Blocks (small building-block patterns) ──────────────────────

export function getSafetyGateBlock() {
  const n1 = 'sg-1', n2 = 'sg-2';
  const oPass = 'sg-pass', oFail = 'sg-fail';

  const nodes: Node[] = [
    makeNode(n1, 0, 'Safety Checkpoint', 'Verify that all required PPE is worn and safety conditions are met before proceeding to the next step.', {
      isColorized: true, color: '#ef4444',
      options: [
        { id: oPass, text: 'All clear — proceed' },
        { id: oFail, text: 'Unsafe condition — stop' },
      ],
    }),
    makeNode(n2, 250, 'Stop Work & Report Hazard', 'Immediately stop all work. Report the unsafe condition to your supervisor and document it in the incident system.', {
      isColorized: true, color: '#ef4444',
      popups: [
        { id: 'p1', title: 'Stop Work Authority', description: 'Every worker has the right and responsibility to stop work when an unsafe condition exists. No retribution for exercising stop work authority.', media: [], color: '#ef4444' },
      ],
    }, 700),
  ];

  const edges: Edge[] = [
    makeEdge(n1, oFail, n2),
  ];

  return { nodes, edges };
}

export function getPhotoDocumentationBlock() {
  const n1 = 'pd-1', n2 = 'pd-2';
  const o1 = 'pd-o1';

  const nodes: Node[] = [
    makeNode(n1, 0, 'Take Photo Evidence', 'Photograph the current state from multiple angles. Ensure good lighting and that identifying labels are visible in the frame.', {
      _optionId: o1, isInput: true, inputType: 'picture', isColorized: true, color: '#3b82f6',
    }),
    makeNode(n2, 250, 'Add Notes & Context', 'Describe what the photos show. Note any anomalies, the location, and any relevant conditions (weather, lighting, etc.).', {
      isInput: true, inputType: 'text',
    }),
  ];

  const edges: Edge[] = [
    makeEdge(n1, o1, n2),
  ];

  return { nodes, edges };
}

export function getSupervisorApprovalBlock() {
  const n1 = 'sa-1', n2 = 'sa-2';
  const oApprove = 'sa-approve', oReject = 'sa-reject';

  const nodes: Node[] = [
    makeNode(n1, 0, 'Supervisor Review & Approval', 'A supervisor must review the completed work and either approve to proceed or reject with feedback for corrections.', {
      isColorized: true, color: '#f59e0b',
      options: [
        { id: oApprove, text: 'Approved' },
        { id: oReject, text: 'Rejected — needs rework' },
      ],
      isInput: true, inputType: 'text',
    }),
    makeNode(n2, 250, 'Apply Corrections', 'Address the supervisor\'s feedback. Redo the required steps and resubmit for approval.', {
      isColorized: true, color: '#ef4444',
    }, 700),
  ];

  const edges: Edge[] = [
    makeEdge(n1, oReject, n2),
  ];

  return { nodes, edges };
}

export function getDataCaptureBlock() {
  const n1 = 'dc-1', n2 = 'dc-2';
  const o1 = 'dc-o1';

  const nodes: Node[] = [
    makeNode(n1, 0, 'Scan Barcode / QR Code', 'Scan the item\'s barcode or QR code to automatically populate the tracking record with the correct asset or part information.', {
      _optionId: o1, isInput: true, inputType: 'barcode', isColorized: true, color: '#3b82f6',
    }),
    makeNode(n2, 250, 'Record Measurement Data', 'Enter the required measurements or readings. The system will flag values outside acceptable tolerances automatically.', {
      isInput: true, inputType: 'text',
    }),
  ];

  const edges: Edge[] = [
    makeEdge(n1, o1, n2),
  ];

  return { nodes, edges };
}

export function getTroubleshootingDecisionBlock() {
  const n1 = 'td-1', n2 = 'td-2', n3 = 'td-3', n4 = 'td-4';
  const oA = 'td-oA', oB = 'td-oB', oC = 'td-oC';

  const nodes: Node[] = [
    makeNode(n1, 0, 'Identify the Symptom', 'Select the symptom that best describes the issue you are experiencing with the equipment.', {
      isColorized: true, color: '#f59e0b',
      options: [
        { id: oA, text: 'Not starting / no power' },
        { id: oB, text: 'Unusual noise or vibration' },
        { id: oC, text: 'Error code on display' },
      ],
    }),
    makeNode(n2, 300, 'Check Power & Connections', 'Verify the power supply is on, cables are connected, and the emergency stop is not engaged. Check the circuit breaker.', {
      isColorized: true, color: '#ef4444',
    }, 100),
    makeNode(n3, 300, 'Inspect Mechanical Components', 'Check for loose bolts, worn bearings, misaligned belts, or debris in moving parts. Tighten or replace as needed.', {
    }, 400),
    makeNode(n4, 300, 'Look Up Error Code', 'Enter the error code displayed on the panel. Refer to the troubleshooting guide in the equipment manual for the specific resolution steps.', {
      isInput: true, inputType: 'text', isColorized: true, color: '#3b82f6',
    }, 700),
  ];

  const edges: Edge[] = [
    makeEdge(n1, oA, n2),
    makeEdge(n1, oB, n3),
    makeEdge(n1, oC, n4),
  ];

  return { nodes, edges };
}


// ─── Export all built-in templates ────────────────────────────────────────

export interface BuiltInTemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  authorName: string;
  isFullProcedure: boolean;
  isBuiltIn: true;
  generator: () => { nodes: Node[]; edges: Edge[] };
}

export const BUILT_IN_TEMPLATES: BuiltInTemplateDefinition[] = [
  // ── Procedure Starters ──
  {
    id: 'builtin-equipment-inspection',
    name: 'Equipment Inspection',
    description: 'Complete inspection flow with barcode scan, visual checks, functional testing, and pass/fail branching with different outcomes.',
    category: 'Inspection',
    authorName: 'Frontline',
    isFullProcedure: true,
    isBuiltIn: true,
    generator: getEquipmentInspectionTemplate,
  },
  {
    id: 'builtin-lockout-tagout',
    name: 'Lockout / Tagout (LOTO)',
    description: 'Full OSHA-compliant lockout/tagout procedure: notify, shutdown, isolate, lock, verify zero energy, work, and restore.',
    category: 'Safety',
    authorName: 'Frontline',
    isFullProcedure: true,
    isBuiltIn: true,
    generator: getSafetyLockoutTagoutTemplate,
  },
  {
    id: 'builtin-employee-onboarding',
    name: 'New Employee Onboarding',
    description: 'Train new hires step by step: safety briefing, workstation setup, hands-on demo, competency check with re-training loop.',
    category: 'Training',
    authorName: 'Frontline',
    isFullProcedure: true,
    isBuiltIn: true,
    generator: getNewEmployeeOnboardingTemplate,
  },
  {
    id: 'builtin-quality-control',
    name: 'Quality Control Check',
    description: 'End-to-end QC flow: batch scan, dimensional measurement, surface inspection, accept/reject branching with quarantine path.',
    category: 'Inspection',
    authorName: 'Frontline',
    isFullProcedure: true,
    isBuiltIn: true,
    generator: getQualityControlTemplate,
  },
  {
    id: 'builtin-changeover',
    name: 'Production Line Changeover',
    description: 'Structured changeover from one product to another: verify order, clean, re-tool, first article inspection, and approve.',
    category: 'Maintenance',
    authorName: 'Frontline',
    isFullProcedure: true,
    isBuiltIn: true,
    generator: getChangeoverProcedureTemplate,
  },

  // ── Reusable Blocks ──
  {
    id: 'builtin-safety-gate',
    name: 'Safety Checkpoint',
    description: 'Pass/fail safety gate with PPE checklist. "Stop work" path for unsafe conditions with hazard reporting.',
    category: 'Safety',
    authorName: 'Frontline',
    isFullProcedure: false,
    isBuiltIn: true,
    generator: getSafetyGateBlock,
  },
  {
    id: 'builtin-photo-documentation',
    name: 'Photo Documentation',
    description: 'Capture photographic evidence with a structured checklist for required angles and a notes step for context.',
    category: 'General',
    authorName: 'Frontline',
    isFullProcedure: false,
    isBuiltIn: true,
    generator: getPhotoDocumentationBlock,
  },
  {
    id: 'builtin-supervisor-approval',
    name: 'Supervisor Approval Gate',
    description: 'Approval step requiring supervisor sign-off. Reject path loops back for corrections before re-review.',
    category: 'General',
    authorName: 'Frontline',
    isFullProcedure: false,
    isBuiltIn: true,
    generator: getSupervisorApprovalBlock,
  },
  {
    id: 'builtin-data-capture',
    name: 'Barcode + Measurement Capture',
    description: 'Scan a barcode/QR code to identify the item, then record measurement data with automatic tolerance checking.',
    category: 'Inspection',
    authorName: 'Frontline',
    isFullProcedure: false,
    isBuiltIn: true,
    generator: getDataCaptureBlock,
  },
  {
    id: 'builtin-troubleshooting',
    name: 'Troubleshooting Decision Tree',
    description: '3-way branching decision tree for common equipment issues: no power, unusual noise, or error code — each with targeted steps.',
    category: 'Maintenance',
    authorName: 'Frontline',
    isFullProcedure: false,
    isBuiltIn: true,
    generator: getTroubleshootingDecisionBlock,
  },
];
