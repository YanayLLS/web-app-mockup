// Shared AI response engine for both web and app AI chats
// Provides contextual, keyword-matched responses with streaming simulation

interface ResponseMatch {
  keywords: string[];
  /** If true, ALL keywords must be present. If false (default), ANY keyword matches. */
  matchAll?: boolean;
  response: string;
}

const responses: ResponseMatch[] = [
  // Greetings
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
    response: `Hello! I'm Iris, your AI assistant. I can help you with:\n\n• **Troubleshooting** equipment issues\n• **Finding procedures** in your knowledge base\n• **Step-by-step guidance** for maintenance tasks\n• **Answering questions** about your machines and workflows\n\nWhat can I help you with today?`,
  },

  // Generator-specific
  {
    keywords: ['generator', 'start'],
    matchAll: true,
    response: `To start the generator, follow these steps:\n\n1. **Pre-start checks** — Verify oil level is between MIN and MAX marks on the dipstick\n2. **Fuel valve** — Open the fuel shutoff valve (turn counterclockwise)\n3. **Circuit breaker** — Make sure the main breaker is in the OFF position\n4. **Choke** — Set choke to FULL if cold starting\n5. **Start switch** — Turn the key to START and hold until engine fires (max 10 seconds)\n6. **Warm up** — Let the engine idle for 2-3 minutes before applying load\n7. **Choke** — Gradually move choke to RUN position\n8. **Load** — Turn the circuit breaker ON\n\n⚠️ Never run the generator indoors or in enclosed spaces.\n\nWould you like me to walk you through any of these steps in detail?`,
  },
  {
    keywords: ['generator', 'shut', 'down'],
    response: `To safely shut down the generator:\n\n1. **Remove load** — Turn off all connected equipment\n2. **Breaker** — Switch the circuit breaker to OFF\n3. **Cool down** — Let the engine run at idle for 3-5 minutes\n4. **Stop** — Turn the key/switch to OFF\n5. **Fuel valve** — Close the fuel shutoff valve\n\n⏱ The cool-down period is important — it prevents thermal shock and extends engine life.\n\nAnything else you need help with?`,
  },
  {
    keywords: ['generator', 'not starting', 'won\'t start', 'doesn\'t start'],
    response: `Let's troubleshoot why the generator won't start:\n\n**Check these common causes:**\n\n1. ⛽ **Fuel** — Is the tank full? Is the fuel valve open?\n2. 🔋 **Battery** — Check battery voltage (should be 12.4V+). Clean terminals if corroded.\n3. 🛢️ **Oil level** — Low oil triggers the safety shutoff. Check dipstick.\n4. 🔌 **Spark plug** — Remove and inspect. Clean or replace if fouled.\n5. 🎛 **Choke** — Make sure choke is set to FULL for cold starts.\n6. 🔧 **Air filter** — A clogged filter restricts airflow. Remove and inspect.\n\n**If it cranks but won't fire:**\n• Fuel may be stale (replace if >30 days old)\n• Check fuel filter for blockage\n\n**If it doesn't crank at all:**\n• Battery is likely dead or disconnected\n• Check the emergency stop button isn't engaged\n\nWhich of these would you like to investigate first?`,
  },
  {
    keywords: ['oil', 'change', 'replace'],
    response: `Here's the oil change procedure:\n\n**What you'll need:**\n• New oil (SAE 10W-30, ~1.1 quarts for most generators)\n• Oil drain pan\n• Funnel\n• Socket wrench (typically 17mm)\n\n**Steps:**\n1. Run the engine for 2-3 minutes to warm the oil\n2. Turn off the engine and disconnect the spark plug wire\n3. Place the drain pan under the drain plug\n4. Remove the drain plug and let oil flow completely (about 5 min)\n5. Replace the drain plug and tighten to spec (18-20 Nm)\n6. Remove the oil fill cap and add new oil slowly\n7. Check dipstick — oil should be at the FULL mark\n8. Reconnect spark plug wire\n9. Run engine for 1 minute, then recheck level\n\n♻️ Dispose of used oil at a recycling center.\n\nNeed help with the oil filter replacement too?`,
  },
  {
    keywords: ['air filter', 'filter replacement', 'filter change'],
    response: `**Air Filter Replacement Guide:**\n\n1. **Turn off** the engine and let it cool\n2. **Locate** the air filter housing (usually on the side of the engine)\n3. **Remove** the housing cover — unclip or unscrew the retaining clips\n4. **Remove** the old filter element\n5. **Inspect** the housing — wipe out any dirt or debris\n6. **Install** the new filter — make sure it seats properly\n7. **Replace** the cover and secure all clips\n8. **Reset** the restriction indicator if equipped\n\n**Tips:**\n• Check the filter every 50 hours of operation\n• Replace immediately if torn, wet, or heavily soiled\n• Never run the engine without the air filter installed\n\nWould you like me to show you the related procedure in your knowledge base?`,
  },
  {
    keywords: ['coolant', 'cooling', 'overheat', 'temperature'],
    response: `**Cooling System Guidance:**\n\n**If the engine is overheating:**\n1. Reduce load immediately\n2. Check coolant level in the overflow tank (engine must be cool!)\n3. Inspect for leaks around hoses, radiator, and water pump\n4. Check if the radiator fins are blocked with debris\n5. Verify the cooling fan is operating\n\n**Coolant Flush & Refill:**\n1. Let engine cool completely\n2. Place a drain pan below the radiator drain valve\n3. Open the drain and let coolant flow out\n4. Close drain, fill with flush solution + water, run 10 min\n5. Drain again, then refill with 50/50 coolant mix\n6. Run engine and check for leaks\n\n⚠️ Never open the radiator cap on a hot engine!\n\nWant me to pull up the full coolant system flush procedure?`,
  },
  {
    keywords: ['belt', 'serpentine', 'alternator belt'],
    response: `**Belt Inspection & Replacement:**\n\n**Signs of a worn belt:**\n• Squealing noise on startup\n• Visible cracks, fraying, or glazing\n• Belt feels loose or has excess play\n\n**Replacement steps:**\n1. Disconnect the battery negative terminal\n2. Note the belt routing (take a photo for reference)\n3. Release the auto-tensioner using a breaker bar\n4. Slide the old belt off the pulleys\n5. Inspect all pulleys for wear or damage\n6. Route the new belt following the diagram\n7. Release the tensioner slowly onto the belt\n8. Verify belt is seated in all pulley grooves\n9. Reconnect the battery\n10. Start the engine and verify tracking for 30 seconds\n\n**Torque spec:** Tensioner bolt — 45 Nm\n\nShall I open the alternator belt procedure for more detail?`,
  },
  {
    keywords: ['battery', 'charge', 'voltage'],
    response: `**Battery Diagnostics:**\n\n**Quick checks:**\n• Voltage should read **12.4V or higher** (12.6V = fully charged)\n• Below 12.0V = battery needs charging or replacement\n• Check terminals for corrosion (white/green buildup)\n\n**Charging:**\n1. Disconnect negative terminal first, then positive\n2. Connect charger — red to positive, black to negative\n3. Set to 2A (slow charge) for 8-12 hours\n4. Monitor — disconnect when fully charged\n5. Reconnect positive first, then negative\n\n**Terminal cleaning:**\n1. Disconnect terminals\n2. Use baking soda + water paste and a wire brush\n3. Rinse with clean water\n4. Apply terminal protector spray\n5. Reconnect and tighten\n\nThe battery should be load-tested every 6 months. Would you like more details?`,
  },
  {
    keywords: ['fuel', 'filter', 'water separator'],
    response: `**Fuel Filter & Water Separator Service:**\n\n**When to service:**\n• Every 200 hours or annually\n• If engine sputters or loses power\n• If water is visible in the separator bowl\n\n**Steps:**\n1. Close the fuel shutoff valve\n2. Place a drain pan under the filter assembly\n3. Drain the water separator bowl\n4. Remove the old fuel filter (note the flow direction arrow)\n5. Lightly oil the gasket on the new filter\n6. Install the new filter hand-tight, then ¾ turn more\n7. Open the fuel shutoff valve\n8. Bleed the fuel system — use the primer pump until firm\n9. Start the engine and check for leaks\n\n⚠️ Use only the specified filter part number for your model.\n\nWant me to guide you through the fuel system bleeding procedure?`,
  },
  {
    keywords: ['maintenance', 'schedule', 'when', 'interval'],
    response: `**Recommended Maintenance Schedule:**\n\n| Interval | Task |\n|----------|------|\n| **Daily** | Check oil level, check for leaks, visual inspection |\n| **50 hours** | Clean/replace air filter, check battery |\n| **100 hours** | Change oil & filter, inspect spark plug |\n| **200 hours** | Replace fuel filter, flush coolant, inspect belts |\n| **500 hours** | Full service — all of the above plus valve adjustment |\n| **Annually** | Load test, battery replacement, full inspection |\n\n📋 Always log maintenance in the equipment record.\n\nWant me to show you the preventive maintenance procedure?`,
  },
  {
    keywords: ['safety', 'lockout', 'tagout', 'loto'],
    response: `**Lockout/Tagout (LOTO) Procedure:**\n\n**Before any maintenance:**\n1. **Notify** all affected personnel\n2. **Shut down** the equipment using normal procedures\n3. **Isolate** all energy sources:\n   • Disconnect electrical power\n   • Close fuel valves\n   • Release stored energy (capacitors, springs, pressure)\n4. **Apply** your personal lock and tag to each energy isolation device\n5. **Verify** zero energy state — try to start the equipment\n\n**After maintenance:**\n1. Inspect the work area — tools removed, guards replaced\n2. Verify all personnel are clear\n3. Remove your lock and tag\n4. Restore energy and test\n\n⚠️ **Never remove someone else's lock!**\n\nNeed the full LOTO procedure document?`,
  },
  {
    keywords: ['procedure', 'create'],
    matchAll: true,
    response: `I can help you create a new procedure! Here's how:\n\n1. Go to your **Knowledge Base**\n2. Click **"+ New"** and select **"Flow"**\n3. Give it a name and description\n4. Use the **Flow Editor** to add steps:\n   • Add text instructions for each step\n   • Attach photos or videos as visual references\n   • Connect to a Digital Twin for 3D guidance\n   • Add validation checkpoints\n5. **Preview** the procedure in viewer mode\n6. **Publish** when ready\n\nWould you like me to suggest a structure for your procedure?`,
  },
  {
    keywords: ['digital twin', '3d', 'model'],
    response: `**Digital Twins** are interactive 3D models of your equipment. You can:\n\n• **View & navigate** — Orbit, zoom, and inspect parts\n• **Add hotspots** — Mark specific locations with information, media, or links\n• **Connect to procedures** — Link 3D views to procedure steps for spatial guidance\n• **Annotate** — Add notes and callouts to specific components\n• **Bookmark views** — Save camera angles for quick reference\n\nTo open a Digital Twin:\n1. Go to your project's Knowledge Base\n2. Click on any item with the 🟪 Digital Twin badge\n3. Use mouse/touch to rotate, scroll to zoom\n\nWant me to open the Generator Digital Twin for you?`,
  },
  {
    keywords: ['remote', 'support', 'call', 'video'],
    response: `**Remote Support** lets you connect with experts in real-time:\n\n**Starting a call:**\n1. Go to the **Remote Support** page\n2. Tap **"Start Call"** or select a contact\n3. Choose **Video** or **Audio only**\n\n**During a call you can:**\n• Share your camera view\n• Draw annotations on the live feed\n• Share your screen\n• Send files and images\n• Use text chat alongside video\n\n**AR features (XR headset):**\n• Expert can place 3D arrows and markers in your view\n• Frozen frame annotation\n• Shared pointer\n\nWould you like to start a remote support session?`,
  },
  {
    keywords: ['guide', 'walk', 'through', 'how to', 'help me'],
    response: `I'd be happy to guide you! Here are the most common tasks I can help with:\n\n🔧 **Maintenance & Repair**\n• "How do I change the oil?"\n• "Walk me through belt replacement"\n• "Troubleshoot engine overheating"\n\n📋 **Procedures & Knowledge Base**\n• "Find the startup procedure"\n• "Create a new maintenance checklist"\n• "Show me safety protocols"\n\n🎯 **Digital Twins & 3D**\n• "Open the generator model"\n• "Show me where the fuel filter is"\n\n📞 **Support**\n• "Connect me with an expert"\n• "Start a remote support call"\n\nJust describe what you need in plain language and I'll help you step by step!`,
  },
  {
    keywords: ['machine', 'supported', 'equipment'],
    response: `Currently, your workspace has the following equipment:\n\n**Active Projects:**\n• 🔴 **Generator** — Diesel generator assembly with full 3D model and maintenance procedures\n• ⚙️ **915 i Series** — Industrial equipment with comprehensive KB\n• 🏭 **Manufacturing Facility Alpha** — CNC machines and robotic arms\n• 💻 **Elitebook 840 G9** — Laptop hardware documentation\n• 💻 **ProBook 450 G10** — Laptop service procedures\n• 💻 **ZBook Studio G9** — Workstation documentation\n• 🖨 **High-Volume Printing Equipment** — Industrial printers\n\nEach project contains procedures, digital twins, and supporting documents.\n\nWhich equipment would you like to explore?`,
  },
  {
    keywords: ['thank', 'thanks'],
    response: `You're welcome! I'm always here if you need help. Here are some things you can ask me anytime:\n\n• Troubleshooting questions about your equipment\n• Finding specific procedures or documents\n• Step-by-step guidance for maintenance tasks\n• Information about your digital twins\n\nHave a great day! 👋`,
  },
  {
    keywords: ['inspect', 'inspection', 'check'],
    response: `**Equipment Inspection Checklist:**\n\n**Visual inspection:**\n☐ Check for oil leaks, coolant leaks, or fuel leaks\n☐ Inspect belts for cracks or fraying\n☐ Check hoses for bulges, soft spots, or cracks\n☐ Look for loose or missing bolts/fasteners\n☐ Inspect wiring for damage or corrosion\n\n**Fluid levels:**\n☐ Engine oil — between MIN and MAX on dipstick\n☐ Coolant — at the FULL mark when cold\n☐ Fuel — adequate for planned operation\n\n**Operational check:**\n☐ Start the engine and listen for unusual sounds\n☐ Check all gauges — oil pressure, temperature, voltage\n☐ Test the emergency stop function\n☐ Verify all safety guards are in place\n\nWould you like me to create a custom inspection checklist for your equipment?`,
  },
  {
    keywords: ['error', 'warning', 'fault', 'code', 'alarm'],
    response: `To help diagnose the error, I'll need a bit more info:\n\n1. **What error code or message** are you seeing?\n2. **Which equipment** is showing the error?\n3. **When did it start** — during operation, on startup, or at shutdown?\n\n**Common error codes:**\n• **E01** — Low oil pressure → Check oil level, inspect oil pump\n• **E02** — High temperature → Check coolant level, inspect radiator\n• **E03** — Overspeed → Check governor, inspect fuel system\n• **E04** — Low battery → Check battery voltage, inspect charging system\n• **E05** — Fuel pressure → Check fuel filter, inspect fuel pump\n\nDescribe the error and I'll walk you through the resolution!`,
  },

  // ===== CONFIGURATIONS FEATURE =====
  {
    keywords: ['configuration', 'configurations', 'config', 'configs'],
    response: `**Digital Twin Configurations** let you manage multiple variants of the same equipment without duplicating digital twins.\n\n**What are configurations?**\nThe same physical product may have many configurations:\n• **Functionality** — e.g. a machine with or without an optional module\n• **As-built / ECO** — production line changes for cost or reliability\n• **FCO (Field Change Order)** — changes made at the customer's site\n\n**Key capabilities:**\n• Define part visibility, transforms, descriptions, and tags per configuration\n• Role-based permissions — technicians only see configs relevant to them\n• Import/Export via Excel for bulk management\n• Default Configuration always exists and can be customized (but not deleted or disabled)\n• Duplicate configs to quickly create variants\n\n**Who uses it?**\n• **Content Creators** — define and manage configurations in the editor\n• **Technicians** — select the right config when opening a digital twin\n• **Admins** — control permissions per configuration\n\nWant to know more about creating, editing, or viewing configurations?`,
  },
  {
    keywords: ['configuration', 'create', 'new'],
    matchAll: true,
    response: `**Creating a New Configuration:**\n\n1. Open the digital twin in the **editor**\n2. Go to the **Configurations** tab in the parts catalog panel\n3. Click **"Create Configuration"**\n4. A new config is created named "Configuration 1" — the current parts visibility state is captured\n5. Modify the 3D scene — hide/show parts, adjust transforms\n6. Changes are captured when you switch configs or click **"Set from view"**\n7. Rename the config and add a description and tags\n\n**Tips:**\n• You can also **duplicate** an existing config to start from a known state\n• The **Default Configuration** can be edited to customize part visibility, but it cannot be deleted or disabled\n• Each configuration tracks: name, description, tags, part visibility, part transforms, and permissions\n\nWould you like to know about managing permissions or bulk import/export?`,
  },
  {
    keywords: ['configuration', 'edit'],
    matchAll: true,
    response: `**Editing a Configuration:**\n\n1. Open the digital twin editor and go to the **Configurations** tab\n2. Click on the configuration you want to edit — it becomes the **active** config and opens the **details window**\n3. In the details window you can edit: name, description, tags, permissions, and enable/disable\n4. In the 3D scene, show or hide parts as needed\n5. Click **"Set from View"** to capture the current 3D state into the config\n\n**What you can change per config (in the details window):**\n• **Name and Description** — text fields at the top\n• **Tags** — for search and filtering (e.g. "Premium", "USA-East")\n• **Enabled/Disabled** — checkbox to toggle visibility to technicians\n• **Permissions** — expandable section with role checkboxes\n• **Part visibility** — via "Set from View" button\n\n**Note:** Enable/disable is only available in the details window, not inline in the list. Import/Export Excel is available from the three-dot menu at the bottom of the configurations tab.`,
  },
  {
    keywords: ['configuration', 'permission'],
    matchAll: true,
    response: `**Configuration Permissions:**\n\nEach configuration has a **PermittedTrainingAndFieldRoles** setting that controls who can see it.\n\n**How it works:**\n• When a technician opens a digital twin, they only see configurations they have permission to view\n• Non-permitted configurations are **hidden** (not shown as "access denied")\n• Service managers can be granted access to all configurations\n\n**Setting permissions:**\n1. Open the configuration properties in the editor\n2. Under **Permissions**, select which roles can view this config\n3. Save and publish the digital twin\n\n**Example:**\n• "AutoCorp-USA-East" config → visible to USA-East technicians only\n• "AutoCorp-Mexico" config → visible to Mexico technicians only\n• Service managers see all three regional configs\n\nThis is especially useful when different customers or regions have different equipment variants.`,
  },
  {
    keywords: ['configuration', 'import'],
    matchAll: true,
    response: `**Import/Export Configurations via Excel:**\n\nYou can bulk-manage part visibility across configurations using Excel.\n\n**Export:**\n1. Open the digital twin editor → Parts Catalog\n2. Click **Export** — downloads an Excel file\n3. Each configuration gets its own column next to the parts list\n4. Cells show visibility state (visible/hidden) per part per config\n\n**Edit in Excel:**\n• Add new configuration columns\n• Toggle visibility values per part\n• Excel controls **visibility only** — names, descriptions, tags, and transforms are managed in the editor\n\n**Import:**\n1. Click **Import** and select the modified Excel file\n2. If the file references configs that don't exist, you'll be asked: "Some configurations don't exist. Regenerate them?"\n3. Configurations refresh to match the Excel\n4. Other properties (description, tags, transforms) remain unchanged\n\nThis is great for standardizing configs across multiple digital twins.`,
  },
  {
    keywords: ['configuration', 'view'],
    matchAll: true,
    response: `**Viewing Configurations (as a Technician):**\n\nWhen you open a digital twin that has configurations:\n\n1. The loading/preview screen shows an **"Open with Configuration"** button\n2. Click it to see a **searchable popup** with available configs\n3. Search by name or tag to find the right variant\n4. Select a configuration — the 3D scene loads with the correct parts visible\n5. The parts catalog shows only parts relevant to this configuration\n\n**Opening a procedure with a configuration:**\n• When you open a procedure linked to a configured digital twin, the procedure uses the selected configuration\n• Steps reference only the parts visible in that config\n• If no config is selected, the Default Configuration is used\n\n**Important:** You **cannot change the configuration while a procedure is running**. You must complete or stop the procedure first, then switch configurations. This prevents steps from referencing parts that aren't visible.\n\n**Note:** You only see configurations you have permission to access — others are hidden.`,
  },
  {
    keywords: ['configuration', 'default'],
    matchAll: true,
    response: `**Default Configuration:**\n\nEvery digital twin automatically has a **Default Configuration** that:\n\n• Is **editable** — content creators can change the name, description, tags, permissions, and part visibility\n• Defines the **default state** shown when no specific configuration is selected\n• Is always available to all users regardless of permissions\n• **Cannot be deleted or disabled** — it always exists as the baseline\n\n**When is it used?**\n• When a user opens a digital twin without selecting a specific configuration\n• When a procedure doesn't specify a particular config\n• As the starting point when creating new configurations\n\nThe Default Configuration ensures there's always a baseline view of the digital twin available. Content creators can customize which parts are visible in this default state.`,
  },
  {
    keywords: ['configuration', 'duplicate'],
    matchAll: true,
    response: `**Duplicating a Configuration:**\n\nDuplicating is the fastest way to create a new variant:\n\n1. In the Configurations tab, find the config you want to copy\n2. Click the **three-dot menu** → **"Duplicate"**\n3. A new config is created with all the same settings:\n   • Part visibility state\n   • Part transforms\n   • Description and tags\n4. The duplicate gets the name "[Original Name] (Copy)"\n5. Rename it and make your changes\n\n**Use case:** You have a "Standard" config and need a "Premium" variant that adds a few extra parts — duplicate Standard, then show the additional parts.`,
  },
  {
    keywords: ['what', 'configuration', 'feature'],
    response: `**Configurations** is an upcoming feature for Digital Twins that solves a common problem: **the same equipment has multiple variants**.\n\n**The problem today:**\nContent creators have to duplicate entire digital twins for minor variations — different optional modules, regional differences, or field modifications. This leads to duplicated work and maintenance headaches.\n\n**What Configurations solves:**\n• **One digital twin, many variants** — define part visibility and transforms per configuration\n• **Role-based access** — technicians only see configs relevant to their equipment\n• **Bulk management** — import/export via Excel for large-scale operations\n• **Procedure integration** — procedures automatically adapt to the selected configuration\n• **Procedure lock** — configurations cannot be changed while a procedure is running\n\n**Platforms:**\n• **PC** — Full editor + viewer\n• **Mobile** — Viewer only (select and view configs)\n• **XR** — Not in scope for initial release\n\nWant me to explain any specific aspect in more detail?`,
  },
];

// ==================== PROJECT DATA TYPES ====================

export interface KBItemInfo {
  name: string;
  type: 'procedure' | 'digital-twin' | 'media' | 'folder';
  description?: string;
  steps?: number;
  version?: string;
  isPublished?: boolean;
  createdBy?: string;
  lastEdited?: string;
  children?: KBItemInfo[];
}

export interface ProjectInfo {
  name: string;
  items: KBItemInfo[];
}

/** Flatten nested KB items into a flat list */
function flattenItems(items: KBItemInfo[]): KBItemInfo[] {
  const result: KBItemInfo[] = [];
  for (const item of items) {
    result.push(item);
    if (item.children) result.push(...flattenItems(item.children));
  }
  return result;
}

/** Try to generate a content-aware response from project data */
function getContentAwareResponse(lower: string, projects?: ProjectInfo[]): string | null {
  if (!projects || projects.length === 0) return null;

  const allItems = projects.flatMap(p => flattenItems(p.items));
  const procedures = allItems.filter(i => i.type === 'procedure');
  const digitalTwins = allItems.filter(i => i.type === 'digital-twin');
  const folders = allItems.filter(i => i.type === 'folder');

  // --- "list/show procedures" or "what procedures" ---
  if (lower.match(/list.*procedure|show.*procedure|what.*procedure|my procedure|all procedure|how many procedure|list.*flow|show.*flow|what.*flow/)) {
    if (procedures.length === 0) {
      return `I didn't find any procedures in your knowledge base yet. You can create one by going to a project and tapping **"+ New" → Flow**.`;
    }
    let response = `I found **${procedures.length} procedures** across your projects:\n\n`;
    for (const project of projects) {
      const procs = flattenItems(project.items).filter(i => i.type === 'procedure');
      if (procs.length === 0) continue;
      response += `**${project.name}:**\n`;
      for (const p of procs) {
        const meta = [p.steps ? `${p.steps} steps` : null, p.version ? `v${p.version}` : null, p.isPublished ? 'Published' : null].filter(Boolean).join(' · ');
        response += `• ${p.name}${meta ? ` — ${meta}` : ''}\n`;
      }
      response += '\n';
    }
    response += `Would you like details on any of these? Just ask about one by name.`;
    return response;
  }

  // --- "list/show digital twins" ---
  if (lower.match(/list.*digital twin|show.*digital twin|what.*digital twin|my digital twin|all digital twin|list.*3d|show.*3d|my model/)) {
    if (digitalTwins.length === 0) {
      return `No digital twins found in your projects yet.`;
    }
    let response = `I found **${digitalTwins.length} digital twins**:\n\n`;
    for (const dt of digitalTwins) {
      response += `• **${dt.name}**${dt.description ? ` — ${dt.description}` : ''}\n`;
    }
    response += `\nWould you like to open one of these?`;
    return response;
  }

  // --- "list/show projects" ---
  if (lower.match(/list.*project|show.*project|what.*project|my project|all project|how many project/)) {
    let response = `You have **${projects.length} projects**:\n\n`;
    for (const project of projects) {
      const items = flattenItems(project.items);
      const procCount = items.filter(i => i.type === 'procedure').length;
      const dtCount = items.filter(i => i.type === 'digital-twin').length;
      response += `• **${project.name}** — ${procCount} procedures, ${dtCount} digital twins\n`;
    }
    response += `\nWhich project would you like to explore?`;
    return response;
  }

  // --- Search for a specific item by name ---
  const matchedItem = allItems.find(item => {
    const itemWords = item.name.toLowerCase().split(/\s+/);
    // Match if 2+ words from the item name appear in the query, or the full name
    const matchCount = itemWords.filter(w => w.length > 2 && lower.includes(w)).length;
    return matchCount >= 2 || lower.includes(item.name.toLowerCase());
  });

  if (matchedItem) {
    const parentProject = projects.find(p => flattenItems(p.items).some(i => i.name === matchedItem.name));

    if (matchedItem.type === 'procedure') {
      let response = `Here's what I found about **"${matchedItem.name}"**:\n\n`;
      response += `**Type:** Procedure\n`;
      if (parentProject) response += `**Project:** ${parentProject.name}\n`;
      if (matchedItem.steps) response += `**Steps:** ${matchedItem.steps}\n`;
      if (matchedItem.version) response += `**Version:** ${matchedItem.version}\n`;
      if (matchedItem.isPublished) response += `**Status:** Published\n`;
      if (matchedItem.createdBy) response += `**Created by:** ${matchedItem.createdBy}\n`;
      if (matchedItem.lastEdited) response += `**Last edited:** ${matchedItem.lastEdited}\n`;
      if (matchedItem.description) response += `\n${matchedItem.description}\n`;
      response += `\nWould you like me to open this procedure, or do you have questions about the steps?`;
      return response;
    }

    if (matchedItem.type === 'digital-twin') {
      let response = `Here's what I know about **"${matchedItem.name}"**:\n\n`;
      response += `**Type:** Digital Twin (3D Model)\n`;
      if (parentProject) response += `**Project:** ${parentProject.name}\n`;
      if (matchedItem.description) response += `**Description:** ${matchedItem.description}\n`;
      if (matchedItem.createdBy) response += `**Created by:** ${matchedItem.createdBy}\n`;
      response += `\nYou can open this digital twin to:\n• View and inspect the 3D model\n• See connected procedures\n• Navigate to specific parts\n\nWould you like to open it?`;
      return response;
    }

    if (matchedItem.type === 'folder') {
      const folderItems = matchedItem.children ? flattenItems(matchedItem.children) : [];
      let response = `**"${matchedItem.name}"** is a folder`;
      if (parentProject) response += ` in ${parentProject.name}`;
      response += `.\n\n`;
      if (folderItems.length > 0) {
        response += `It contains **${folderItems.length} items**:\n`;
        for (const child of folderItems.slice(0, 8)) {
          response += `• ${child.name} (${child.type})\n`;
        }
        if (folderItems.length > 8) response += `• ... and ${folderItems.length - 8} more\n`;
      }
      return response;
    }
  }

  // --- General "about" a project by name ---
  const matchedProject = projects.find(p => lower.includes(p.name.toLowerCase()));
  if (matchedProject) {
    const items = flattenItems(matchedProject.items);
    const procs = items.filter(i => i.type === 'procedure');
    const dts = items.filter(i => i.type === 'digital-twin');
    const media = items.filter(i => i.type === 'media');

    let response = `Here's an overview of **"${matchedProject.name}"**:\n\n`;
    response += `**${items.length} total items:**\n`;
    if (procs.length) response += `• ${procs.length} procedures\n`;
    if (dts.length) response += `• ${dts.length} digital twins\n`;
    if (media.length) response += `• ${media.length} media files\n`;
    if (folders.length) response += `• ${folders.filter(f => flattenItems(matchedProject.items).includes(f)).length} folders\n`;
    if (procs.length) {
      response += `\n**Procedures:**\n`;
      for (const p of procs) {
        response += `• ${p.name}${p.steps ? ` (${p.steps} steps)` : ''}\n`;
      }
    }
    response += `\nWhat would you like to know more about?`;
    return response;
  }

  return null;
}

/**
 * Get an AI response based on the user's message.
 * Matches keywords and returns a contextual response.
 * Optionally accepts project data for content-aware answers.
 */
export function getSmartAIResponse(userMessage: string, projects?: ProjectInfo[]): string {
  const lower = userMessage.toLowerCase();

  // First, try content-aware responses if project data is available
  const contentResponse = getContentAwareResponse(lower, projects);
  if (contentResponse) return contentResponse;

  // Then try static keyword matches — matchAll entries first (more specific), then any-match
  const matchAllEntries = responses.filter(e => e.matchAll);
  const anyMatchEntries = responses.filter(e => !e.matchAll);

  for (const entry of matchAllEntries) {
    if (entry.keywords.every(kw => lower.includes(kw))) {
      return entry.response;
    }
  }
  for (const entry of anyMatchEntries) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.response;
    }
  }

  // Default response
  return `That's a great question! Based on what you're asking about, here's what I can suggest:\n\nI searched your knowledge base but didn't find an exact match for "${userMessage}". Here are some things I can help with:\n\n• **Troubleshooting** — Describe the issue and I'll help diagnose it\n• **Procedures** — Ask about specific maintenance tasks\n• **Equipment info** — Ask about your machines and digital twins\n• **Navigation** — I can help you find things in the app\n\nCould you rephrase or give me more details about what you need?`;
}

/**
 * Simulates word-by-word streaming of an AI response.
 * Calls onUpdate with progressively longer content and onDone when complete.
 */
export function streamResponse(
  fullText: string,
  onUpdate: (partialText: string) => void,
  onDone: () => void,
): () => void {
  const words = fullText.split(/(\s+)/); // keep whitespace
  let index = 0;
  let accumulated = '';
  // Start with a small delay to feel like "thinking"
  const initialDelay = 300 + Math.random() * 400;

  let cancelled = false;
  let timer: ReturnType<typeof setTimeout>;

  const tick = () => {
    if (cancelled) return;
    // Add 1-3 words per tick for a natural feel
    const wordsPerTick = Math.floor(1 + Math.random() * 2);
    for (let i = 0; i < wordsPerTick && index < words.length; i++) {
      accumulated += words[index];
      index++;
    }
    onUpdate(accumulated);

    if (index < words.length) {
      // Variable speed — slow near punctuation, faster in middle
      const lastChar = accumulated.trimEnd().slice(-1);
      const isPunctuation = ['.', '!', '?', ':', '\n'].includes(lastChar);
      const delay = isPunctuation ? 80 + Math.random() * 120 : 20 + Math.random() * 40;
      timer = setTimeout(tick, delay);
    } else {
      onDone();
    }
  };

  timer = setTimeout(tick, initialDelay);

  // Return cancel function
  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}
