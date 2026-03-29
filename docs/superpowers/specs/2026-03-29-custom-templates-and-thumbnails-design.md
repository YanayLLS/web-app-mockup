# Custom Templates & Thumbnail Improvements — Flow Editor

**Date:** 2026-03-29
**Scope:** Template Library in ProcedureCanvas flow editor

---

## 1. Custom Templates

### 1.1 Save Flow

Users create custom templates by selecting nodes on the canvas and saving them from the Template Library.

1. User selects one or more nodes on the canvas
2. Opens Template Library (the library button or shortcut)
3. Bottom-left shows active "Save Selection as Template" button
4. Save modal collects:
   - **Name** (required, text input)
   - **Description** (optional, textarea)
   - **Category** (dropdown from existing categories: Safety, Maintenance, Assembly, Inspection, Training, General)
5. On save:
   - Snapshot selected nodes and edges that connect only between selected nodes (edges to non-selected nodes are dropped)
   - Normalize positions: shift so the top-left node is at (0,0)
   - Generate a unique ID (`custom-` + timestamp)
   - Set `isBuiltIn: false`, `isFullProcedure` based on node count (>=4 = procedure starter, <4 = reusable block), `authorName: 'You'`, `createdAt` ISO timestamp
   - Persist to `localStorage` key `flow-editor-custom-templates` as JSON array

### 1.2 Display in Template Library

- Custom templates appear alongside built-in templates in the grid
- "All" tab shows both; "Built-in" tab filters to `isBuiltIn: true`; "Custom" tab filters to `isBuiltIn: false`
- Custom template cards are visually identical to built-in cards except:
  - A small "Custom" text badge replaces the "Frontline" author attribution
- On hover: same "Insert" / "Use Template" action as built-in
- Custom cards show a trash icon (top-right corner) on hover
- Clicking trash: icon changes to a red checkmark with "Delete?" tooltip; clicking again confirms deletion. Clicking away cancels.

### 1.3 Persistence

- Storage: `localStorage` key `flow-editor-custom-templates`
- Load on component mount, merge with built-in templates
- Save on every add/delete operation
- No backend dependency

### 1.4 Edge Cases

- Duplicate template names are allowed (unique IDs differentiate them)
- Saving a single node creates a 1-step reusable block
- If no nodes are selected, save button shows guidance text ("Select steps on the canvas…")
- Category counts in the sidebar update to include custom templates

---

## 2. Thumbnail Improvements

### 2.1 New FlowThumbnail Rendering (Polished Bar Layout)

Replace the current abstract rectangle grid with a vertical flow visualization:

**Node rendering by type:**
- **Start node:** Filled blue pill (#2F80ED), smaller than step bars
- **Regular steps:** Horizontal bars with white fill, subtle border (#e2e8f0), and a 3px left color accent stripe. Color comes from node's `color` property if `isColorized`, otherwise defaults to #2F80ED
- **Decision/branching nodes** (options.length > 1): Pill shape with warm amber background (#fef3c7) and amber border (#f59e0b)
- **Input type indicators:** If a node has `isInput: true`, show a tiny visual cue inside the bar:
  - Barcode: small vertical lines pattern
  - Picture: small camera-like dot
  - Text: small pencil-like mark

**Connectors:**
- Thin vertical lines (#C2C9DB) between sequential nodes
- Small filled arrow-head (triangle) at the bottom of each connector pointing to next node
- Branch splits from decision nodes: two lines diverging left and right to colored endpoint bars
  - Left/first option: green-tinted bar (#d1fae5 fill, #10b981 border)
  - Right/second option: red-tinted bar (#fee2e2 fill, #ef4444 border)
  - 3+ options: fan out evenly

**Layout algorithm:**
- True vertical flow order (sorted by Y position, same as current)
- Fixed vertical spacing between nodes
- Center-aligned horizontally
- SVG dimensions: 220 x dynamic height (min 80, scale with node count, max ~140)

### 2.2 Visual Specs

- SVG viewBox width: 220
- Step bar width: 100px, height: 12px, rx: 3
- Start pill width: 56px, height: 14px, rx: 7
- Decision pill width: 100px, height: 12px, rx: 6
- Color accent stripe: 3px wide, same height as bar
- Connector line: 1px stroke, #C2C9DB
- Arrow-head: 6px wide triangle, same color as connector
- Branch endpoint bars: 50px wide, 10px tall

---

## 3. Integration Points

### 3.1 ProcedureCanvas.tsx

- `onSaveAsTemplate` callback: capture selected nodes and their internal edges, normalize positions, persist to localStorage
- On mount: load custom templates from localStorage, merge into templates array passed to TemplateLibrary
- New `onDeleteTemplate` callback: remove template by ID, re-save to localStorage

### 3.2 TemplateLibrary.tsx

- Accept new prop: `onDeleteTemplate: (templateId: string) => void`
- Template cards: add delete affordance for non-built-in templates
- Inline delete confirmation (no browser popups)

### 3.3 builtInTemplates.ts

- No changes needed — built-in templates remain code-generated

---

## 4. Out of Scope

- Template import/export
- Template sharing between users
- Template versioning
- Editing a saved template's nodes (only metadata: name/description/category)
- Backend persistence
