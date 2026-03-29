import type { Step } from '../components/procedure-editor/ProcedureEditor';

const sid = (n: number) => `sample-step-${n}`;

const GENERATOR_MAINTENANCE_STEPS: Step[] = [
  {
    id: sid(1),
    title: 'Safety Preparation & Lockout',
    description: 'Before beginning generator maintenance, ensure all safety protocols are followed. The generator must be fully shut down and cooled for at least 30 minutes. Wear appropriate PPE and apply lockout/tagout to the main breaker and fuel supply valve.',
    actions: [],
    color: '#FF1F1F',
    hasAnimation: false,
    popups: [
      { id: 'popup-1a', title: 'Required PPE', description: 'Safety glasses, insulated gloves (rated 1000V), steel-toe boots, hearing protection, and flame-resistant clothing are mandatory.', position: { x: 30, y: 20 }, color: '#FF6B35', mediaFiles: [], arrowDirection: 'down' },
      { id: 'popup-1b', title: 'Main Breaker Lockout', description: 'The main breaker is located on the generator control panel. Switch to OFF, apply your personal padlock, and attach the lockout tag with date and name.', position: { x: 70, y: 45 }, color: '#FF1F1F', mediaFiles: [], requiresConfirmation: true, confirmButtonText: 'Lockout applied', arrowDirection: 'left' },
    ],
    mediaFiles: [],
  },
  {
    id: sid(2),
    parentStepId: sid(1),
    title: 'Visual Inspection of Generator Housing',
    description: 'Perform a thorough walk-around inspection of the generator enclosure. Check for external damage, corrosion, fluid leaks, loose bolts, and debris accumulation. Inspect exhaust connections and ventilation openings for blockages.',
    actions: [
      { label: 'Pass — No issues found', nextStepId: '' },
      { label: 'Fail — Damage detected', nextStepId: '' },
    ],
    color: '#2F80ED',
    hasAnimation: false,
    popups: [
      { id: 'popup-2a', title: 'Exhaust System Check', description: 'Inspect the exhaust manifold and muffler connections for soot buildup, cracks, or loose clamps. Black residue around joints indicates an exhaust leak.', position: { x: 25, y: 30 }, color: '#2F80ED', mediaFiles: [], arrowDirection: 'right' },
      { id: 'popup-2b', title: 'Ventilation Louvers', description: 'Ensure all ventilation louvers are clear of debris, leaves, or nesting material. Blocked louvers cause overheating and reduced power output.', position: { x: 65, y: 25 }, color: '#2F80ED', mediaFiles: [], arrowDirection: 'down' },
      { id: 'popup-2c', title: 'Base Frame & Mounts', description: 'Check all anti-vibration mounts for cracking or compression. Verify anchor bolts are tight. Look for fluid puddles under the base frame.', position: { x: 45, y: 70 }, color: '#8404B3', mediaFiles: [], arrowDirection: 'up' },
    ],
    mediaFiles: [],
    validation: {
      id: 'val-2',
      checkpoints: [
        { id: 'cp-2a', type: 'visual', severity: 'warning', label: 'Enclosure integrity', selectedParts: ['generator-housing', 'exhaust-manifold'], passState: { description: 'No visible damage, corrosion, or leaks found on housing', mediaFiles: [] }, failState: { description: 'Damage or corrosion detected — document and schedule repair', mediaFiles: [] } },
      ],
    },
  },
  {
    id: sid(3),
    parentStepId: sid(2),
    title: 'Check Engine Oil Level & Condition',
    description: 'Remove the oil dipstick, wipe clean, reinsert fully, and withdraw to read the level. Oil should be between the LOW and FULL marks. Inspect oil color and consistency — dark black or gritty oil indicates the need for an oil change.',
    actions: [
      { label: 'Oil level OK', nextStepId: '' },
      { label: 'Oil needs change', nextStepId: '' },
    ],
    color: '#8404B3',
    hasAnimation: false,
    popups: [
      { id: 'popup-3a', title: 'Dipstick Location', description: 'The engine oil dipstick has a yellow handle and is located on the left side of the engine block, near the oil fill cap.', position: { x: 35, y: 40 }, color: '#8404B3', mediaFiles: [], arrowDirection: 'right' },
      { id: 'popup-3b', title: 'Oil Condition Guide', description: 'Amber/honey = good condition. Dark brown = serviceable but aging. Black/gritty = change immediately. Milky/frothy = possible coolant contamination — escalate.', position: { x: 70, y: 55 }, color: '#11E874', mediaFiles: [], arrowDirection: 'left' },
    ],
    mediaFiles: [],
    validation: {
      id: 'val-3',
      checkpoints: [
        { id: 'cp-3a', type: 'measurement', severity: 'critical', label: 'Engine oil level', selectedParts: ['engine-block', 'oil-dipstick'], tolerance: { nominal: 85, min: 60, max: 100, unit: '%' }, passState: { description: 'Oil level is between LOW and FULL marks', mediaFiles: [] }, failState: { description: 'Oil level is below LOW mark — top up or change oil', mediaFiles: [], remediationSteps: 'Add SAE 15W-40 diesel engine oil to bring level to FULL mark' } },
      ],
    },
  },
  {
    id: sid(4),
    parentStepId: sid(3),
    title: 'Drain & Replace Engine Oil',
    description: 'Place a drain pan (min. 15L capacity) under the oil drain plug. Remove the drain plug using a 19mm socket and allow oil to drain completely (approx. 10 minutes). Replace the oil filter. Reinstall drain plug with new gasket and torque to 35 Nm. Fill with SAE 15W-40 diesel engine oil to the FULL mark.',
    actions: [],
    color: '#FF6B35',
    hasAnimation: true,
    popups: [],
    mediaFiles: [
      { id: 'media-4a', name: 'Oil Change Reference Video', type: 'video', url: '', size: 24500000 },
      { id: 'media-4b', name: 'Filter Torque Spec Sheet', type: 'document', url: '', size: 850000 },
    ],
  },
  {
    id: sid(5),
    parentStepId: sid(4),
    title: 'Inspect & Replace Air Filter',
    description: 'Open the air filter housing by releasing the four spring clips. Remove the air filter element and inspect for dirt, damage, or moisture. Hold the filter up to light — if light does not pass through, replace the element. Clean the housing interior before installing the new filter.',
    actions: [
      { label: 'Filter OK — reinstall', nextStepId: '' },
      { label: 'Filter dirty — replace', nextStepId: '' },
    ],
    color: 'var(--foreground)',
    hasAnimation: true,
    popups: [],
    mediaFiles: [
      { id: 'media-5a', name: 'Air Filter Diagram', type: 'image', url: '', size: 1200000 },
    ],
  },
  {
    id: sid(6),
    parentStepId: sid(5),
    title: 'Check Coolant Level & Condition',
    description: 'With the engine cool, remove the radiator cap (turn counter-clockwise slowly to release pressure). Coolant level should be visible at the filler neck. Check the overflow tank — level should be between MIN and MAX. Inspect coolant color: green/blue = good, brown/rusty = flush needed.',
    actions: [],
    color: '#11E874',
    hasAnimation: false,
    configurationIds: ['config-premium-coolant', 'config-autocorp-usa-east'],
    popups: [
      { id: 'popup-6a', title: 'Radiator Cap Warning', description: 'NEVER open the radiator cap when the engine is hot. The cooling system is pressurized and can cause severe burns. Wait at least 30 minutes after shutdown.', position: { x: 35, y: 20 }, color: '#FF1F1F', mediaFiles: [], arrowDirection: 'down' },
    ],
    mediaFiles: [],
    validation: {
      id: 'val-6',
      checkpoints: [
        { id: 'cp-6a', type: 'measurement', severity: 'warning', label: 'Coolant level', selectedParts: ['radiator', 'coolant-overflow-tank'], tolerance: { nominal: 80, min: 50, max: 100, unit: '%' }, passState: { description: 'Coolant level is within acceptable range', mediaFiles: [] }, failState: { description: 'Coolant level is low — top up with correct mixture before proceeding', mediaFiles: [] } },
      ],
    },
  },
  {
    id: sid(7),
    parentStepId: sid(6),
    title: 'Inspect Fuel System',
    description: 'Check all fuel lines and fittings for leaks, cracks, or loose connections. Inspect the fuel/water separator bowl — drain any accumulated water by opening the petcock valve at the bottom. Replace the fuel filter if the service interval has been reached (every 500 hours).',
    actions: [
      { label: 'No water — skip drain', nextStepId: '' },
      { label: 'Water found — drain separator', nextStepId: '' },
      { label: 'Filter due — replace filter', nextStepId: '' },
    ],
    color: '#FF6B35',
    hasAnimation: false,
    popups: [
      { id: 'popup-7a', title: 'Fuel/Water Separator', description: 'The fuel/water separator is mounted on the engine front, between the fuel tank and injection pump. Clear water from the bowl by opening the drain valve until clean fuel flows.', position: { x: 30, y: 45 }, color: '#FF6B35', mediaFiles: [], arrowDirection: 'right' },
    ],
    mediaFiles: [],
  },
  {
    id: sid(8),
    parentStepId: sid(7),
    title: 'Test Battery & Electrical Connections',
    description: 'Measure battery voltage with a multimeter — should read 12.4V or higher (24V systems: 24.8V+). Inspect battery terminals for corrosion (white/green buildup). Clean terminals with a wire brush if needed. Check that all cable connections are tight. Verify the battery charger/maintainer is functioning.',
    actions: [],
    color: '#2F80ED',
    hasAnimation: false,
    popups: [
      { id: 'popup-8a', title: 'Battery Voltage Reference', description: '12.6V+ = fully charged\n12.4V = 75% charged\n12.2V = 50% charged\n12.0V = 25% charged\nBelow 12.0V = dead — replace or recharge immediately.', position: { x: 40, y: 30 }, color: '#2F80ED', mediaFiles: [], arrowDirection: 'down' },
    ],
    mediaFiles: [
      { id: 'media-8a', name: 'Electrical Wiring Diagram', type: 'document', url: '', size: 2100000 },
    ],
    validation: {
      id: 'val-8',
      checkpoints: [
        { id: 'cp-8a', type: 'measurement', severity: 'critical', label: 'Battery voltage', selectedParts: ['battery', 'battery-terminals'], tolerance: { nominal: 12.6, min: 12.4, max: 14.0, unit: 'V' }, passState: { description: 'Battery voltage is within normal operating range', mediaFiles: [] }, failState: { description: 'Battery voltage is low — recharge or replace battery before startup', mediaFiles: [], remediationSteps: 'Connect battery charger at 10A for 4-6 hours, then retest' } },
      ],
    },
  },
  {
    id: sid(9),
    parentStepId: sid(8),
    title: 'Inspect Drive Belt & Coolant Hoses',
    description: 'Check the serpentine drive belt for cracks, fraying, glazing, or excessive slack. Belt deflection should be 10-12mm at the longest span. Inspect all coolant hoses by squeezing them — they should be firm but flexible. Soft, spongy, or cracked hoses must be replaced.',
    actions: [
      { label: 'Belt & hoses OK', nextStepId: '' },
      { label: 'Belt needs replacement', nextStepId: '' },
      { label: 'Hoses need replacement', nextStepId: '' },
    ],
    color: '#8404B3',
    hasAnimation: false,
    configurationIds: ['config-standard'],
    popups: [
      { id: 'popup-9a', title: 'Belt Tension Check', description: 'Press the belt at the midpoint between the alternator and water pump pulleys. Acceptable deflection: 10–12mm. If the auto-tensioner is at its limit, replace the belt.', position: { x: 35, y: 45 }, color: '#8404B3', mediaFiles: [], arrowDirection: 'right' },
      { id: 'popup-9b', title: 'Hose Inspection Points', description: 'Check upper radiator hose, lower radiator hose, heater hoses, and bypass hoses. Pay special attention to clamp areas — this is where hoses fail first.', position: { x: 65, y: 40 }, color: '#FF6B35', mediaFiles: [], arrowDirection: 'left' },
    ],
    mediaFiles: [],
    validation: {
      id: 'val-9',
      checkpoints: [
        { id: 'cp-9a', type: 'visual', severity: 'critical', label: 'Drive belt condition', selectedParts: ['drive-belt', 'alternator-pulley', 'water-pump-pulley'], passState: { description: 'Belt is in good condition with proper tension', mediaFiles: [] }, failState: { description: 'Belt shows wear or improper tension — replace before startup', mediaFiles: [], remediationSteps: 'Install new serpentine belt part #GB-SB-2200 and verify tension' } },
        { id: 'cp-9b', type: 'visual', severity: 'warning', label: 'Coolant hose integrity', selectedParts: ['upper-radiator-hose', 'lower-radiator-hose'], passState: { description: 'All hoses are firm and free of cracks or swelling', mediaFiles: [] }, failState: { description: 'Hose deterioration detected — schedule replacement', mediaFiles: [] } },
      ],
    },
  },
  {
    id: sid(10),
    parentStepId: sid(9),
    title: 'Run Load Test & Final Checks',
    description: 'Remove all lockout/tagout devices. Open the fuel supply valve. Start the generator and allow a 5-minute warm-up at no load. Gradually apply load in 25% increments up to 75% rated capacity. Monitor voltage, frequency, oil pressure, and coolant temperature. Run under load for 15 minutes, then reduce load and cool down. Record all readings in the maintenance logbook.',
    actions: [],
    color: '#11E874',
    hasAnimation: false,
    popups: [],
    mediaFiles: [],
    validation: {
      id: 'val-10',
      checkpoints: [
        { id: 'cp-10a', type: 'measurement', severity: 'critical', label: 'Output voltage under load', selectedParts: ['generator-alternator', 'control-panel'], tolerance: { nominal: 220, min: 209, max: 231, unit: 'V' }, passState: { description: 'Voltage is stable and within ±5% of nominal', mediaFiles: [] }, failState: { description: 'Voltage is out of range — check AVR and alternator', mediaFiles: [], remediationSteps: 'Inspect automatic voltage regulator (AVR) settings and alternator brushes' } },
        { id: 'cp-10b', type: 'measurement', severity: 'critical', label: 'Output frequency', selectedParts: ['engine-governor', 'control-panel'], tolerance: { nominal: 50, min: 49.5, max: 50.5, unit: 'Hz' }, passState: { description: 'Frequency is stable at 50 Hz under load', mediaFiles: [] }, failState: { description: 'Frequency deviation detected — adjust engine governor', mediaFiles: [] } },
        { id: 'cp-10c', type: 'visual', severity: 'warning', label: 'No leaks during operation', selectedParts: ['engine-block', 'fuel-lines', 'coolant-hoses', 'exhaust-manifold'], passState: { description: 'No fluid or exhaust leaks observed during load test', mediaFiles: [] }, failState: { description: 'Leak detected during operation — shut down and repair', mediaFiles: [], remediationSteps: 'Identify leak source, tighten connections or replace gaskets' } },
      ],
    },
  },
];

// Branching variant — multi-output steps connect to separate branch nodes
const GENERATOR_BRANCHING_STEPS: Step[] = (() => {
  const steps: Step[] = GENERATOR_MAINTENANCE_STEPS.map(s => ({
    ...s,
    actions: s.actions.map(a => ({ ...a })),
    popups: [...s.popups],
    mediaFiles: [...s.mediaFiles],
  }));

  const byId = (id: string) => steps.find(s => s.id === id)!;

  // Step 2 — Visual Inspection: pass → oil check, fail → document damage
  byId(sid(2)).actions = [
    { label: 'Pass — No issues found', nextStepId: sid(3) },
    { label: 'Fail — Damage detected', nextStepId: sid(11) },
  ];

  // Step 3 — Oil Check: OK → skip to air filter, needs change → drain/replace
  byId(sid(3)).actions = [
    { label: 'Oil level OK', nextStepId: sid(5) },
    { label: 'Oil needs change', nextStepId: sid(4) },
  ];

  // Step 5 — Air Filter: OK → coolant, dirty → install new filter
  byId(sid(5)).actions = [
    { label: 'Filter OK — reinstall', nextStepId: sid(6) },
    { label: 'Filter dirty — replace', nextStepId: sid(12) },
  ];

  // Step 7 — Fuel System: 3-way branch
  byId(sid(7)).actions = [
    { label: 'No water — skip drain', nextStepId: sid(8) },
    { label: 'Water found — drain separator', nextStepId: sid(13) },
    { label: 'Filter due — replace filter', nextStepId: sid(14) },
  ];

  // Step 9 — Belt & Hoses: 3-way branch
  byId(sid(9)).actions = [
    { label: 'Belt & hoses OK', nextStepId: sid(10) },
    { label: 'Belt needs replacement', nextStepId: sid(15) },
    { label: 'Hoses need replacement', nextStepId: sid(16) },
  ];

  // ── Branch paths ────────────────────────────────────────────────────────

  // Fail path from Step 2 — dead-end escalation (does NOT rejoin main flow)
  // 11 → 17 → END
  steps.push(
    {
      id: sid(11),
      title: 'Document & Report Damage',
      description: 'Take photographs of all damage found during the visual inspection. Create a maintenance report noting the type, location, and severity of each issue.',
      actions: [{ label: 'Report created', nextStepId: sid(17) }],
      color: '#FF1F1F',
      hasAnimation: false,
      popups: [],
      mediaFiles: [],
    },
    {
      id: sid(17),
      title: 'Escalate to Maintenance Supervisor',
      description: 'Submit the damage report with photos to the maintenance supervisor. Generator is taken out of service until structural repairs are completed and re-inspected. Tag the unit as "Out of Service — Awaiting Repair".',
      actions: [],
      color: '#FF1F1F',
      hasAnimation: false,
      popups: [],
      mediaFiles: [],
    },
  );

  // Filter dirty path from Step 5 — short merge back to coolant
  steps.push(
    {
      id: sid(12),
      title: 'Install New Air Filter Element',
      description: 'Remove the old filter element from the housing. Wipe the housing interior with a clean lint-free cloth. Unbox the new filter and verify the correct part number. Insert the new element ensuring proper seating. Close the housing and secure all four spring clips.',
      actions: [{ label: 'New filter installed', nextStepId: sid(6) }],
      color: '#11E874',
      hasAnimation: false,
      popups: [],
      mediaFiles: [],
    },
  );

  // Water found path from Step 7 — 2-step branch: drain → verify → Battery
  // 13 → 18 → sid(8)
  steps.push(
    {
      id: sid(13),
      title: 'Drain Water Separator Bowl',
      description: 'Place a container under the fuel/water separator. Open the petcock drain valve at the bottom of the separator bowl. Allow water and contaminated fuel to drain until clean diesel flows. Close the petcock valve.',
      actions: [{ label: 'Water drained', nextStepId: sid(18) }],
      color: '#FF6B35',
      hasAnimation: false,
      popups: [],
      mediaFiles: [],
    },
    {
      id: sid(18),
      title: 'Verify Fuel Quality',
      description: 'Collect a fuel sample from the separator outlet into a clear glass jar. Hold up to light and check for cloudiness, particles, or water droplets. If contamination persists, drain and flush the fuel tank before proceeding.',
      actions: [{ label: 'Fuel is clean', nextStepId: sid(8) }],
      color: '#FF6B35',
      hasAnimation: false,
      popups: [],
      mediaFiles: [],
    },
  );

  // Filter due path from Step 7 — separate fork: replace → prime → full service end
  // 14 → 19 → 23 → END (does NOT rejoin main flow)
  steps.push(
    {
      id: sid(14),
      title: 'Replace Fuel Filter Element',
      description: 'Close the fuel supply valve. Use a filter wrench to remove the old fuel filter. Apply a thin coat of clean diesel to the gasket of the new filter. Pre-fill the new filter with clean diesel. Install hand-tight plus 1/2 turn.',
      actions: [{ label: 'Filter installed', nextStepId: sid(19) }],
      color: '#FF6B35',
      hasAnimation: false,
      popups: [],
      mediaFiles: [],
    },
    {
      id: sid(19),
      title: 'Prime & Bleed Fuel Lines',
      description: 'Open the fuel supply valve. Locate the bleed screw on the injection pump housing. Open the bleed screw and operate the hand primer pump until a steady, bubble-free stream of diesel flows. Close the bleed screw tightly.',
      actions: [{ label: 'System primed', nextStepId: sid(23) }],
      color: '#FF6B35',
      hasAnimation: false,
      popups: [],
      mediaFiles: [],
    },
    {
      id: sid(23),
      title: 'Full Fuel System Service Complete',
      description: 'The fuel filter has been replaced and the fuel system has been bled. Run the engine for 5 minutes at idle to verify no air leaks in the fuel system. Log the filter replacement in the maintenance record with date and part number.',
      actions: [],
      color: '#11E874',
      hasAnimation: false,
      popups: [],
      mediaFiles: [],
    },
  );

  // Belt replacement path from Step 9 — 2-step: replace → verify alignment → Load Test
  // 15 → 20 → sid(10)
  steps.push(
    {
      id: sid(15),
      title: 'Replace Serpentine Belt',
      description: 'Note the belt routing from the diagram on the fan shroud. Use a breaker bar to release the auto-tensioner. Slide the old belt off all pulleys. Inspect all pulleys for wear or wobble. Route the new belt following the diagram.',
      actions: [{ label: 'Belt installed', nextStepId: sid(20) }],
      color: '#8404B3',
      hasAnimation: false,
      popups: [],
      mediaFiles: [],
    },
    {
      id: sid(20),
      title: 'Verify Belt Alignment & Tension',
      description: 'Release the tensioner to apply tension to the new belt. Check deflection at the longest span — must be 10–12 mm. Visually verify the belt tracks centered on all pulleys. Spin each pulley by hand to confirm smooth operation.',
      actions: [{ label: 'Alignment verified', nextStepId: sid(10) }],
      color: '#8404B3',
      hasAnimation: false,
      popups: [],
      mediaFiles: [],
    },
  );

  // Hose replacement path from Step 9 — separate fork with its own sub-branch
  // 16 → 21 → (pass → 24 END) or (fail → 22 → 25 END)
  // Does NOT rejoin main flow — cooling system work is a full separate procedure
  steps.push(
    {
      id: sid(16),
      title: 'Replace Coolant Hoses',
      description: 'Drain coolant to below the hose level. Loosen hose clamps with a flat screwdriver. Remove the deteriorated hose(s). Clean the fittings of old sealant or corrosion. Install new hose(s) with new clamps.',
      actions: [{ label: 'Hoses installed', nextStepId: sid(21) }],
      color: '#8404B3',
      hasAnimation: false,
      popups: [],
      mediaFiles: [],
    },
    {
      id: sid(21),
      title: 'Pressure Test Cooling System',
      description: 'Refill the cooling system with 50/50 coolant mix. Attach a cooling system pressure tester to the radiator filler neck. Pump to 15 PSI (103 kPa) and hold for 10 minutes. Monitor the pressure gauge for any drop.',
      actions: [
        { label: 'Pressure holds — no leaks', nextStepId: sid(24) },
        { label: 'Pressure drops — leak detected', nextStepId: sid(22) },
      ],
      color: '#2F80ED',
      hasAnimation: false,
      popups: [],
      mediaFiles: [],
    },
    {
      id: sid(24),
      title: 'Coolant System Service Complete',
      description: 'The cooling system has been repaired and pressure tested successfully. Bleed air from the system by running the engine with the radiator cap off until the thermostat opens. Top off coolant and install cap. Log all replaced components.',
      actions: [],
      color: '#11E874',
      hasAnimation: false,
      popups: [],
      mediaFiles: [],
    },
    {
      id: sid(22),
      title: 'Locate & Repair Leak',
      description: 'With the system still pressurized, visually inspect all hose connections, clamps, and fittings for coolant seepage. Tighten or replace the leaking component. Re-pressurize and verify the repair holds for 10 minutes.',
      actions: [{ label: 'Leak repaired', nextStepId: sid(25) }],
      color: '#FF1F1F',
      hasAnimation: false,
      popups: [],
      mediaFiles: [],
    },
    {
      id: sid(25),
      title: 'Escalate — Extended Cooling Repair',
      description: 'The cooling system requires additional parts or specialist attention. Tag the generator as "Limited Service — Cooling Repair Pending". Create a work order for the cooling system specialist team with all findings and photos attached.',
      actions: [],
      color: '#FF1F1F',
      hasAnimation: false,
      popups: [],
      mediaFiles: [],
    },
  );

  return steps;
})();

// Helper to build a simple linear procedure
function makeSimpleSteps(data: { title: string; description: string; color: string }[]): Step[] {
  return data.map((d, i) => ({
    id: `auto-step-${i + 1}`,
    parentStepId: i > 0 ? `auto-step-${i}` : undefined,
    title: d.title,
    description: d.description,
    actions: [],
    color: d.color,
    hasAnimation: false,
    popups: [],
    mediaFiles: [],
  }));
}

// Default step data keyed by procedure ID
export const DEFAULT_PROCEDURE_STEPS: Record<string, { title: string; steps: Step[] }> = {
  // Generator procedures — full data
  'generator-maintenance': { title: 'Generator Preventive Maintenance Procedure', steps: GENERATOR_MAINTENANCE_STEPS },
  'generator-kb-2': { title: 'Preventive Maintenance Procedure', steps: GENERATOR_BRANCHING_STEPS },
  // Shorter generator procedures
  'generator-kb-3': {
    title: 'Air Filter Replacement',
    steps: makeSimpleSteps([
      { title: 'Safety Preparation', description: 'Shut down the generator and allow the engine to cool. Apply lockout/tagout per site procedure.', color: '#FF1F1F' },
      { title: 'Remove Air Filter Housing Cover', description: 'Release the four spring clips securing the air filter housing lid. Carefully remove the lid to expose the filter element.', color: '#2F80ED' },
      { title: 'Inspect & Remove Old Filter', description: 'Remove the filter element and inspect for dirt, moisture, or damage. Hold up to light — replace if light does not pass through.', color: '#8404B3' },
      { title: 'Clean Housing & Install New Filter', description: 'Wipe the inside of the housing with a clean cloth. Insert the new filter element and ensure it seats properly.', color: '#11E874' },
      { title: 'Reassemble & Reset Indicator', description: 'Replace housing lid and secure all four spring clips. Reset the restriction indicator on the housing.', color: '#2F80ED' },
    ]),
  },
  'generator-kb-4': {
    title: 'Coolant System Flush & Refill',
    steps: makeSimpleSteps([
      { title: 'Safety Prep & Drain Coolant', description: 'Ensure engine is cool. Place drain pan under radiator. Open drain petcock and remove radiator cap to drain completely.', color: '#FF1F1F' },
      { title: 'Flush Cooling System', description: 'Close drain, fill with flush solution and distilled water. Run engine at idle for 15 minutes. Shut down and drain.', color: '#FF6B35' },
      { title: 'Inspect Hoses & Thermostat', description: 'While system is empty, squeeze-test all hoses. Inspect thermostat housing gasket. Replace worn components.', color: '#2F80ED' },
      { title: 'Refill with Coolant', description: 'Close drain petcock. Fill system with 50/50 coolant mix (18L capacity). Fill overflow tank to MAX line.', color: '#11E874' },
      { title: 'Bleed Air & Verify', description: 'Start engine with radiator cap off, run until thermostat opens. Top off coolant, replace cap. Check for leaks.', color: '#8404B3' },
    ]),
  },
  'generator-kb-5': {
    title: 'Fuel Filter & Water Separator Service',
    steps: makeSimpleSteps([
      { title: 'Safety Lockout & Prep', description: 'Shut down generator. Close fuel supply valve. Apply lockout/tagout. Place absorbent mat under fuel filter area.', color: '#FF1F1F' },
      { title: 'Drain Water Separator', description: 'Open the petcock valve at the bottom of the fuel/water separator bowl. Drain until clean fuel flows. Close valve.', color: '#FF6B35' },
      { title: 'Replace Fuel Filter', description: 'Use filter wrench to remove old filter. Prime new filter with clean diesel. Install hand-tight plus 1/2 turn.', color: '#2F80ED' },
      { title: 'Bleed Fuel System', description: 'Open the bleed screw on the injection pump. Operate the hand primer until bubble-free fuel flows. Close bleed screw.', color: '#8404B3' },
      { title: 'Leak Check & Startup', description: 'Open fuel supply valve. Wipe area clean. Start generator and run 5 minutes. Inspect all connections for leaks.', color: '#11E874' },
    ]),
  },
  'generator-kb-6': {
    title: 'Alternator Belt Removal & Installation',
    steps: makeSimpleSteps([
      { title: 'Safety Lockout', description: 'Shut down generator. Apply lockout/tagout to prevent accidental startup during belt work.', color: '#FF1F1F' },
      { title: 'Release Belt Tension', description: 'Locate the auto-tensioner. Use a breaker bar to rotate the tensioner and release belt tension. Note belt routing.', color: '#2F80ED' },
      { title: 'Remove Old Belt & Inspect Pulleys', description: 'Slide belt off pulleys. Inspect all pulleys for wear, wobble, or damage. Check tensioner spring and bearing.', color: '#FF6B35' },
      { title: 'Install New Belt', description: 'Route new belt following the routing diagram on the fan shroud. Engage tensioner to hold belt in place.', color: '#11E874' },
      { title: 'Verify Tension & Test', description: 'Check belt deflection (10-12mm at longest span). Remove lockout. Start generator and observe belt tracking for 2 minutes.', color: '#8404B3' },
    ]),
  },
};
