# Sub-Workspaces Feature Specification

> Complete feature spec derived from the production codebase at `frontline.io-web`.
> This document covers data model, UI pages, CRUD operations, permissions, edge cases, and all behavioral details.

---

## 1. Overview

Sub-Workspaces allow a **parent workspace admin** to create isolated organizational units within a workspace. Each sub-workspace has its own owner, members, mirrored projects, permissions, and lifecycle settings. Sub-workspaces support up to 3 levels of hierarchy (parent → sub → sub-sub).

**Key Concepts:**
- A sub-workspace is a **child domain** of the parent workspace
- Content is shared via **mirrored projects** (read-only copies from parent)
- Members are drawn from the parent's seat pool
- The parent controls what the sub-workspace can and cannot do via **permissions**

---

## 2. Data Model

### SubWorkspace Object

| Field | Type | Description |
|-------|------|-------------|
| `DomainName` | `string` | Internal unique identifier |
| `WorkspaceDisplayedName` | `string` | User-facing name (3–24 characters) |
| `Owner` | `string` | Owner's email address (lowercase) |
| `MembersCount` | `number` | Current registered members |
| `MaxUsers` | `number` | Maximum allowed seats (from parent pool) |
| `DateCreated` | `Date` | Creation timestamp |
| `ExpirationDate` | `Date` | When the sub-workspace expires |
| `Country` | `string` | Country selection |
| `IsDeleted` | `boolean` | Soft-delete flag |
| `Blocked` | `boolean` | Whether access is blocked |
| `MirroredItemsCount` | `number` | Count of mirrored projects |
| `SubDomains` | `string[]` | List of child sub-workspace names |
| `Channel` | `boolean` | Whether this workspace can create children |

### Permission Flags (set by parent)

| Permission | Field | Description |
|------------|-------|-------------|
| Can create sub-workspaces | `CanCreateCustomers` | **Master toggle** — when ON, disables all other permissions below |
| Can call members via Remote Support | `CanCallSubDomainUsers` | Allow remote support calls to this sub-workspace's users |
| Can delete sub-workspaces | `CanDeleteSubWorkspace` | Allow deletion of the sub-workspace |
| Can mirror parent projects | `CanMirrorParentProjects` | Allow mirroring projects from the parent |
| Can edit expiration date | `CanEditExpirationDate` | Allow editing own expiration date |
| Can add AI chat knowledge | `CanAddAiChatKnowledge` | Allow adding AI knowledge base content |

### Report Settings

| Field | Type | Description |
|-------|------|-------------|
| `SubWorkspaceReportColumns` | `string[]` | Selected workspace report columns |
| `MemberReportColumns` | `string[]` | Selected member report columns |
| `AutomaticUserReport` | `object` | Scheduled report config (frequency, admin, dates) |

---

## 3. UI Pages & Layout

### 3.1 List View (Main Page)

The default view when navigating to Sub-Workspaces management.

**Layout:** Full-width table with header bar.

**Header:**
- Page title: "Sub-Workspaces"
- **"Create Sub-Workspace"** button (opens 3-step wizard modal)
- **"Export Reports"** button (opens report settings modal)

**Table Columns:**

| Column | Field | Sortable | Searchable | Notes |
|--------|-------|----------|------------|-------|
| Workspace | `WorkspaceDisplayedName` | Yes | Yes | Primary column |
| Creation Date | `DateCreated` | Yes | No | Formatted date |
| Expiration Date | `ExpirationDate` | Yes | No | Warning icon if near expiry |
| Members | `MembersCount / MaxUsers` | Yes | No | Display as "X / Y members allowed" |
| Mirrored Projects | `MirroredItemsCount` | Yes | No | Count |
| Options | — | No | No | Settings icon button + Blocked badge |

**Row Actions:**
- Click settings icon → navigate to Settings View for that sub-workspace
- Blocked sub-workspaces show a lock/block icon with tooltip "Blocked sub-workspace"

**Empty State:** "No sub-workspaces yet" message with CTA to create one.

---

### 3.2 Settings View (Detail Page)

Shown when clicking a sub-workspace's settings icon from the list.

**Layout:** Two-column (65% left / 35% right) with header bar.

**Header Bar (SubWorkspaceBar):**
- Back button → returns to List View
- Workspace name (editable inline with pencil icon)
- Stats row:
  - Members count
  - Mirrored Projects count
  - Sub-workspaces count
  - Creation date
  - Expiration date

**Left Column:**

#### General Settings Section
| Setting | Input Type | Validation | Notes |
|---------|-----------|------------|-------|
| Name | Text input | 3–24 chars, alphanumeric + symbols | Inline edit with character counter (X/24) |
| Owner | Email input | Valid email format | Transfers ownership on change (sends invitation) |
| Expiration Date | Date picker | Min: tomorrow | Only shown if `CanEditExpirationDate` is true |
| Country | Dropdown select | Required | Uses country list |
| Max Users | Number input | 1 – available parent seats | Shows "No free member seats available" if none |

#### Permissions Section
- 6 toggle switches (checkboxes per our UI rules) for the permission flags
- `CanCreateCustomers` is the **master toggle** — when enabled, it disables and locks the other 5 permissions
- Each permission has an explanatory tooltip

#### Danger Zone Section
- **Block/Activate Workspace** button
  - If active: "Block Workspace" (with confirmation dialog)
  - If blocked: "Activate Workspace"
- **Delete Workspace** button
  - Only visible if `CanDeleteSubWorkspace` permission is true
  - Shows confirmation dialog: "Are you sure? This action cannot be undone."
  - Permanently deletes the sub-workspace

**Right Column:**

#### Mirrored Projects Section
- Header: "Mirrored Projects"
- Description: "Mirrored projects can be viewed in this sub-workspace, but cannot be edited."
- **"Edit Mirrored Projects"** button → opens project selection modal
- List of currently mirrored projects (read-only display)

**Footer:**
- **Save** and **Discard** buttons — only visible when changes are detected
- Save triggers all update API calls (settings, ownership transfer, mirrored projects)

---

### 3.3 Create/Edit Sub-Workspace Modal (3-Step Wizard)

A modal dialog with a step indicator showing progress.

#### Step 1: Settings
| Field | Input | Validation |
|-------|-------|------------|
| Workspace Name | Text input | 3–24 chars, alphanumeric + special chars (!, @, ™, etc.) |
| Owner Email | Email input | Valid email format |
| Expiration Date | Date picker | Default: +1 year from now, min: tomorrow |
| Country | Dropdown | Required |
| Max Users | Number input | Between 1 and available parent seats |

**Button:** "Next"

#### Step 2: Permissions
- 6 checkboxes for permission flags
- `CanCreateCustomers` master toggle behavior (locks others when on)
- Tooltip descriptions for each permission

**Button:** "Next" / "Back"

#### Step 3: Project Selection
- Search bar with clear button
- "Select All / Unselect All" toggle
- Scrollable project list (checkboxes)
- Shift+click for range selection
- Real-time search filtering (regex-based)

**Validation:** At least 1 project must be selected for new sub-workspaces.

**Button:** "Create" (new) / "Update" (edit) / "Back"

---

### 3.4 Report Settings Modal

**Header:** "Report Settings" with Export button.

**Sections:**

1. **Automate Reporting** — toggle on/off
   - When on: select receiving admin from dropdown, set frequency (Daily/Weekly/Monthly), specific day, start & end dates
2. **Report Fields (Workspaces)** — multi-column checkboxes for workspace data columns
3. **Report Fields (Members)** — multi-column checkboxes for member data columns

**Validation:** At least one report field must be selected. Automation requires: start date + frequency + receiving user.

---

### 3.5 Project Selection Modal (EditMirrorItems)

Used in both the wizard Step 3 and the Settings View "Edit Mirrored Projects" button.

**Layout:**
- Search bar with icon and clear button
- "Select all / Unselect all" button
- Scrollable list (350px height) with checkboxes
- Shift+click for range selection

**Search Logic:**
- 1 character: match start of project name (`/^{char}/i`)
- 2+ characters: match after word boundaries (`/(\s|\-|_|\/){chars}/i`)

---

## 4. CRUD Operations

### Create
1. User clicks "Create Sub-Workspace" in list view
2. 3-step wizard modal opens
3. User fills settings → permissions → selects projects
4. On confirm:
   - API: `POST /domains/{db}/create-new-sub-workspace/`
   - Payload: `{ newDomainSettingsObj, ownerEmail }`
   - Then: `POST /domains/{db}/update-mirrored-projects/` for each selected project
5. List refreshes, modal closes

### Read
- **List:** `POST /domains/{db}/get-sub-domain-data` (paginated)
- **Single:** Load from table row + `POST /domains/{db}/get-sub-workspace-owner/`
- **Display Name:** `GET /domains/{db}/get-sub-workspace-display-name`

### Update
- **Settings:** `POST /domains/{db}/update-sub-domain-settings/`
- **Ownership Transfer:** `POST /domains/{db}/transfer-sub-workspace-ownership/` (sends invitation email)
- **Mirrored Projects:** `POST /domains/{db}/update-mirrored-projects/` (per project, with isDeleted flag)
- **Block/Activate:** Toggle `Blocked` flag → `POST update-sub-domain-settings`

### Delete
- `POST /domains/{db}/delete-sub-workspace/`
- Marks `IsDeleted = true` (permanent, no recovery)
- Returns to list view after deletion

---

## 5. Permissions & Access Control

### Who Can Access Sub-Workspace Management
- **Admin role required** — page is behind `requireAdmin` route guard
- Non-admins cannot see the menu item or access the route

### Parent Controls Sub-Workspace Capabilities
The 6 permission flags are set by the parent workspace admin and control what the sub-workspace can do:

1. **CanCreateCustomers** (master): When ON, the sub-workspace can create its own sub-workspaces. This disables toggles 2–5 (they become irrelevant at sub-sub level).
2. **CanCallSubDomainUsers**: Remote support calling access
3. **CanDeleteSubWorkspace**: Controls visibility of Delete button in Danger Zone
4. **CanMirrorParentProjects**: Controls project mirroring behavior
5. **CanEditExpirationDate**: Controls visibility of expiration date picker
6. **CanAddAiChatKnowledge**: AI knowledge base access (feature-flag gated)

---

## 6. Hierarchy

```
Main Workspace (Parent)
├── Sub-Workspace A (CanCreateCustomers = false)
│   ├── Mirrored Projects (from parent)
│   └── Members (from parent seat pool)
│
├── Sub-Workspace B (CanCreateCustomers = true)
│   ├── Sub-Sub-Workspace B1
│   │   └── Mirrored Projects (from Sub-Workspace B)
│   └── Sub-Sub-Workspace B2
│
└── Sub-Workspace C (Blocked)
    └── No access
```

- Parent's `SubDomains` array lists all direct child sub-workspace names
- Sub-workspaces with `CanCreateCustomers = true` can create their own children
- Max 3 levels deep

---

## 7. Edge Cases & States

### Empty States
| Context | Behavior |
|---------|----------|
| No sub-workspaces | Table shows empty state message + CTA |
| No mirrored projects | Shows description text, no list items |
| No available seats | MaxUsers validation fails: "No free member seats available" |

### Error States
| Action | Error Message |
|--------|---------------|
| Owner not found | "Error, current sub-workspace owner not found." |
| Update failure | "Error updating settings" |
| Delete failure | "An error occurred while attempting to delete the sub-workspace." |
| Block/Activate failure | Error message with action name |
| Report generation | "Error generating report" |
| Mirrored projects update | "Error setting new items." |

### Loading States
- Global loading spinner during API calls
- Buttons disabled while loading
- Project list shows loading indicator during fetch

### Validation Errors
| Field | Rule | Error Message |
|-------|------|---------------|
| Name | 3–24 chars, alphanumeric + symbols | "Workspace name must be 3–24 characters long and may include letters, numbers, spaces, and symbols like !, @, ™, etc." |
| Owner email | Valid email format | "Not valid email format." |
| Max Users | 1 – available seats | "Allowed number of members is between 1 and X." |
| Expiration | Min: tomorrow | Date picker enforces min date |
| Projects | ≥1 for new workspace | "At least one project is required." |
| Report fields | ≥1 selected | "At least one field is required to generate the report." |

### Blocked State
- Blocked sub-workspaces show lock icon in list view
- Tooltip: "Blocked sub-workspace"
- Can be reactivated via "Activate Workspace" in Danger Zone
- All member access is blocked

### Name Editing (Settings)
- Inline editing with character counter (X/24)
- Immediate validation: 3+ alphanumeric chars, max 24
- Save validation: additional server-side checks

---

## 8. Navigation Flow

```
Sidebar → "Sub-Workspaces" menu item
  ↓
List View
  ├── "Create Sub-Workspace" button → 3-step wizard modal
  ├── "Export Reports" button → Report settings modal
  └── Row settings icon → Settings View
        ├── Back button → List View
        ├── Edit fields → Save/Discard buttons appear
        ├── "Edit Mirrored Projects" → Project selection modal
        └── Danger Zone → Block/Delete with confirmation
```

---

## 9. Visual Design

### Icons Used
| Element | Icon |
|---------|------|
| Settings | Settings/Gear icon |
| Blocked | Lock or Block icon |
| Near expiry | Warning/Alert triangle |
| Delete | Trash icon |
| Block | Block/Ban icon |
| Activate | Refresh/Renew icon |
| Members | Users icon |
| Projects | Copy/Mirror icon (flipped) |
| Calendar | Calendar icon |
| Hierarchy | Tree/Branch icon |
| Edit name | Pencil/Edit icon |
| Search | Search/Magnifying glass icon |

### Stats Display
- Header stats bar uses icon + count + label pattern
- Members shown as "X / Y" (current / max)
- Dates formatted as locale date strings

---

## 10. API Endpoints Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| List sub-workspaces | POST | `/domains/{db}/get-sub-domain-data` |
| Create | POST | `/domains/{db}/create-new-sub-workspace/` |
| Get display name | GET | `/domains/{db}/get-sub-workspace-display-name` |
| Get owner | POST | `/domains/{db}/get-sub-workspace-owner/` |
| Update settings | POST | `/domains/{db}/update-sub-domain-settings/` |
| Transfer ownership | POST | `/domains/{db}/transfer-sub-workspace-ownership/` |
| Update mirrored projects | POST | `/domains/{db}/update-mirrored-projects/` |
| Delete | POST | `/domains/{db}/delete-sub-workspace/` |
| Get parent/sub projects | POST | `/domains/{db}/get-parent-or-sub-workspace-projects/` |
| Generate report | POST | `/domains/{db}/generate-sub-workspace-report/` |
| Save report settings | POST | `/domains/{db}/save-sub-workspace-report-settings/` |
| Get workspace admins | GET | `/domains/{db}/get-workspace-admins/` |

---

## 11. Implementation Notes for Designs App

### What Can Be Fully Implemented (Mock Data)
- List view with sortable/searchable table
- Settings view with all sections (general, permissions, danger zone, mirrored projects)
- Create/Edit 3-step wizard modal
- Project selection modal with search and shift-click
- Report settings modal
- All validation states and error messages
- Empty states, loading states, blocked states
- Navigation between list and settings views
- Inline name editing with character counter

### What Cannot Be Implemented (Requires Backend)
- Actual API calls (use mock data + toast notifications)
- Email invitations for ownership transfer
- Real seat allocation from parent workspace
- Automated report scheduling and delivery
- Server-side validation
