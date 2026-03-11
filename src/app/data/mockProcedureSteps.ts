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
      { id: 'popup-1c', title: 'Fuel Supply Valve', description: 'Close the fuel supply valve on the fuel line near the base frame. This prevents fuel flow during filter and line inspections.', position: { x: 50, y: 75 }, color: '#FF1F1F', mediaFiles: [], requiresConfirmation: true, confirmButtonText: 'Fuel valve closed', arrowDirection: 'up' },
    ],
    mediaFiles: [],
  },
  {
    id: sid(2),
    parentStepId: sid(1),
    title: 'Visual Inspection of Generator Housing',
    description: 'Perform a thorough walk-around inspection of the generator enclosure. Check for external damage, corrosion, fluid leaks, loose bolts, and debris accumulation. Inspect exhaust connections and ventilation openings for blockages.',
    actions: [],
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
    actions: [],
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
    popups: [
      { id: 'popup-4a', title: 'Drain Plug Location', description: 'The oil drain plug is at the lowest point of the oil pan, accessible from the underside of the generator. Use a 19mm socket wrench.', position: { x: 40, y: 65 }, color: '#FF6B35', mediaFiles: [], arrowDirection: 'up' },
      { id: 'popup-4b', title: 'Oil Filter Replacement', description: 'Use a filter wrench to remove the old filter (turn counter-clockwise). Apply a thin film of new oil to the new filter gasket. Hand-tighten the new filter plus 3/4 turn.', position: { x: 65, y: 35 }, color: '#2F80ED', mediaFiles: [], arrowDirection: 'left' },
      { id: 'popup-4c', title: 'Oil Specification', description: 'Use SAE 15W-40 API CK-4 rated diesel engine oil. Capacity: 12.5 liters. Do not overfill — check dipstick after adding 12 liters.', position: { x: 25, y: 30 }, color: '#11E874', mediaFiles: [], arrowDirection: 'right' },
    ],
    mediaFiles: [],
  },
  {
    id: sid(5),
    parentStepId: sid(4),
    title: 'Inspect & Replace Air Filter',
    description: 'Open the air filter housing by releasing the four spring clips. Remove the air filter element and inspect for dirt, damage, or moisture. Hold the filter up to light — if light does not pass through, replace the element. Clean the housing interior before installing the new filter.',
    actions: [],
    color: 'var(--foreground)',
    hasAnimation: true,
    popups: [
      { id: 'popup-5a', title: 'Air Filter Housing', description: 'The air filter housing is located on top of the engine, connected to the intake manifold via a rubber boot. Release the four spring clips to open.', position: { x: 45, y: 25 }, color: '#2F80ED', mediaFiles: [], arrowDirection: 'down' },
      { id: 'popup-5b', title: 'Filter Service Indicator', description: 'Check the restriction indicator on the air cleaner housing. If the indicator shows RED, the filter must be replaced regardless of visual condition.', position: { x: 70, y: 50 }, color: '#FF1F1F', mediaFiles: [], arrowDirection: 'left' },
    ],
    mediaFiles: [],
  },
  {
    id: sid(6),
    parentStepId: sid(5),
    title: 'Check Coolant Level & Condition',
    description: 'With the engine cool, remove the radiator cap (turn counter-clockwise slowly to release pressure). Coolant level should be visible at the filler neck. Check the overflow tank — level should be between MIN and MAX. Inspect coolant color: green/blue = good, brown/rusty = flush needed.',
    actions: [],
    color: '#11E874',
    hasAnimation: false,
    popups: [
      { id: 'popup-6a', title: 'Radiator Cap Warning', description: 'NEVER open the radiator cap when the engine is hot. The cooling system is pressurized and can cause severe burns. Wait at least 30 minutes after shutdown.', position: { x: 35, y: 20 }, color: '#FF1F1F', mediaFiles: [], arrowDirection: 'down' },
      { id: 'popup-6b', title: 'Coolant Specification', description: 'Use a 50/50 mix of ethylene glycol antifreeze and distilled water. Do not mix coolant types (green vs orange). Total system capacity: 18 liters.', position: { x: 60, y: 55 }, color: '#11E874', mediaFiles: [], arrowDirection: 'left' },
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
    actions: [],
    color: '#FF6B35',
    hasAnimation: false,
    popups: [
      { id: 'popup-7a', title: 'Fuel/Water Separator', description: 'The fuel/water separator is mounted on the engine front, between the fuel tank and injection pump. Clear water from the bowl by opening the drain valve until clean fuel flows.', position: { x: 30, y: 45 }, color: '#FF6B35', mediaFiles: [], arrowDirection: 'right' },
      { id: 'popup-7b', title: 'Fuel Line Inspection', description: 'Follow each fuel line from the tank to the engine. Check for chafing where lines contact the frame. Look for wet spots or diesel smell indicating a leak.', position: { x: 65, y: 35 }, color: '#2F80ED', mediaFiles: [], arrowDirection: 'down' },
      { id: 'popup-7c', title: 'Fuel Filter Replacement', description: 'If replacing: close fuel supply valve, use a filter wrench to remove old filter, prime new filter with clean diesel, install hand-tight plus 1/2 turn. Bleed air from the system using the bleed screw on the injection pump.', position: { x: 50, y: 70 }, color: '#8404B3', mediaFiles: [], arrowDirection: 'up' },
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
      { id: 'popup-8b', title: 'Terminal Cleaning', description: 'Disconnect negative (-) terminal first, then positive (+). Clean with baking soda solution and wire brush. Apply anti-corrosion spray. Reconnect positive first, then negative.', position: { x: 65, y: 60 }, color: '#11E874', mediaFiles: [], arrowDirection: 'left' },
    ],
    mediaFiles: [],
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
    actions: [],
    color: '#8404B3',
    hasAnimation: false,
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
    popups: [
      { id: 'popup-10a', title: 'Startup Checklist', description: '1. All panels and covers secured\n2. Tools removed from generator area\n3. Lockout devices removed\n4. Fuel valve open\n5. Coolant and oil at correct levels\n6. Area clear of personnel', position: { x: 25, y: 25 }, color: '#11E874', mediaFiles: [], requiresConfirmation: true, confirmButtonText: 'All pre-start checks passed', arrowDirection: 'down' },
      { id: 'popup-10b', title: 'Operating Parameters', description: 'Voltage: 220V ±5% (or 380V for 3-phase)\nFrequency: 50 Hz ±0.5 Hz\nOil pressure: 40–60 psi\nCoolant temp: 80–95°C\nIf any parameter is out of range, shut down immediately.', position: { x: 65, y: 40 }, color: '#2F80ED', mediaFiles: [], arrowDirection: 'left' },
      { id: 'popup-10c', title: 'Maintenance Log Entry', description: 'Record: date, run hours, oil level/change, filter status, coolant level, battery voltage, belt condition, and any issues found. Sign and date the entry.', position: { x: 45, y: 75 }, color: '#8404B3', mediaFiles: [], requiresConfirmation: true, confirmButtonText: 'Logbook updated', arrowDirection: 'up' },
    ],
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
  'generator-kb-2': { title: 'Generator Preventive Maintenance Procedure', steps: GENERATOR_MAINTENANCE_STEPS },
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
