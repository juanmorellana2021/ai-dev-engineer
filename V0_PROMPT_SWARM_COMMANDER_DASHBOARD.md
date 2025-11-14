# V0.DEV PROMPT - Swarm Commander Technical Dashboard

Create a professional, technical monitoring dashboard for an AI swarm system with the following specifications:

## Core Concept
A real-time monitoring dashboard for "Swarm Commander" - an AI agent orchestration system that coordinates 12 specialized agents. The UI should feel like a **technical control center** with **system monitoring aesthetics** (think DevOps dashboards, AWS CloudWatch, Datadog, etc.)

## Color Scheme
- **Background**: Dark theme (#0a0e27, #0f172a)
- **Primary accent**: Electric blue (#3b82f6, #60a5fa)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Critical**: Red (#ef4444)
- **Text**: Light gray (#e2e8f0, #94a3b8)
- **Borders**: Subtle white/blue (#1e293b, rgba(59, 130, 246, 0.2))

## Layout Structure

### Top Section - Commander Status
- **Large header**: "👑 Swarm Commander - System Control Panel"
- **System status indicator**: 
  - "System Operational" (green pulse)
  - "Agents Analyzing" (amber pulse)
  - "Critical Issues" (red pulse)
- **Real-time metrics bar**:
  - Total Checks: 12
  - Passed: 10
  - Warnings: 2
  - Critical: 0
  - Confidence: 85%

### Middle Section - Agent Grid (3x4 grid)

Display 12 agent cards in a responsive grid:

**Each agent card shows:**
1. **Agent icon** (use emoji or simple icon)
2. **Agent name** (e.g., "BugHunter", "FileStructureValidator")
3. **Status badge**: 
   - "IDLE" (gray)
   - "RUNNING" (blue with spinner)
   - "PASS" (green checkmark)
   - "WARN" (amber warning)
   - "FAIL" (red X)
4. **Metrics**: 
   - Issues found: 0
   - Execution time: 0.5s
5. **Progress bar** (when running)

**The 12 Agents:**
1. 🔍 BugHunter
2. 📚 BackupFinder
3. ⚔️ CodeMerger
4. 🏗️ ArchitectureAnalyzer
5. 🔗 FileStructureValidator
6. 🔗 BackendValidator
7. 💾 DatabaseValidator
8. 🧹 InputValidator
9. 🔐 FormHardener
10. 🎨 UIEnhancer
11. 🛡️ SecurityGuard
12. 🚀 ProductionDeployer

### Bottom Section - System Analysis

**Two columns:**

**Left Column - Current File Analysis:**
- File name: `modern_sidebar.php`
- File type: COMPONENT
- Size: 3.2 KB
- Dependencies: 15 files
- Impact level: HIGH (color-coded)

**Right Column - Commander Decision:**
Large decision panel showing:
- Decision icon (✅ / ⚠️ / 🚫)
- Decision text: "DEPLOYMENT BLOCKED" / "APPROVED" / "REVIEW NEEDED"
- Reason summary
- Action items (numbered list)

### Bottom Bar - Activity Log
Scrollable terminal-style log showing real-time agent activity:
```
[12:34:56] 👑 Commander: Pre-flight analysis started
[12:34:57] 🔍 BugHunter: Scanning for issues...
[12:34:58] 🔍 BugHunter: Found 2 issues - WARN
[12:34:59] 🔗 FileStructureValidator: Validating file references...
[12:35:00] 🔗 FileStructureValidator: 2 broken links detected - FAIL
[12:35:01] 👑 Commander: DEPLOYMENT BLOCKED - Critical issues detected
```

## Specific UI Elements

### Agent Card States:
```
IDLE state:
- Subtle gray background
- Dashed border
- Icon in grayscale

RUNNING state:
- Blue gradient background
- Pulsing border
- Spinning indicator
- Progress bar animated

PASS state:
- Green left border (thick)
- Green checkmark icon
- Success metrics displayed

WARN state:
- Amber left border
- Warning triangle icon
- Issue count highlighted

FAIL state:
- Red left border
- X icon
- Critical count in red
```

### System Metrics Cards:
Each metric should be in a glass-morphism card with:
- Large number (e.g., "85%")
- Label below (e.g., "Confidence")
- Small trend indicator (↑ ↓ →)
- Background color coding based on value

### Commander Decision Panel:
Large prominent panel with:
- Icon (shield for blocked, checkmark for approved)
- Decision headline in large text
- Color-coded background (red tint for blocked, green for approved)
- Bullet points for reasons
- Action button ("Review Issues" / "Deploy Now")

## Interactive Features

1. **Agent cards clickable** - shows detailed report in modal
2. **Hover effects** - subtle glow and lift
3. **Real-time updates** - smooth transitions when status changes
4. **Progress indicators** - circular progress for confidence score
5. **Expandable sections** - click to see more details

## Technical Details to Show

**File Context Box:**
```
Target File: modern_sidebar.php
Type: Shared Component
Used By: 15 files
Features:
  - Navigation links: 9
  - Database queries: 0
  - Forms: 0
Impact: Changes affect site-wide navigation
```

**Cross-Impact Analysis:**
Visual connections showing:
- FileStructureValidator found issues
- + isComponent = true
- + relatedFiles = 15
- = CRITICAL SYSTEM IMPACT

**Deployment Command Box:**
Only shown when approved:
```bash
$ scp modern_sidebar.php prod-vps:/var/www/html/manage/includes/
```

## Responsive Design
- Desktop: 3-column agent grid
- Tablet: 2-column agent grid
- Mobile: Single column, stacked layout

## Animation Requirements
- Smooth fade-in when loading
- Pulsing borders for active/warning states
- Progress bar animations
- Terminal log auto-scroll
- Number count-up animations for metrics

## Font & Icons
- Font: "Inter" or "Roboto Mono" for technical feel
- Icons: Use emoji or simple SVG icons (not gaming style)
- Monospace font for logs and code blocks

## Key Differences from Gaming Dashboard
- ❌ NO spaceship graphics
- ❌ NO game-like animations
- ❌ NO playful elements
- ✅ Professional monitoring aesthetic
- ✅ Technical/enterprise feel
- ✅ Clear data visualization
- ✅ DevOps dashboard style

## Example Layout ASCII:
```
┌─────────────────────────────────────────────────────┐
│  👑 Swarm Commander - System Control Panel          │
│  ● System Operational | Checks: 12 | Confidence: 85%│
└─────────────────────────────────────────────────────┘

┌───────┬───────┬───────┬───────┐
│ Total │Passed │Warns  │Critical│
│  12   │  10   │   2   │   0   │
└───────┴───────┴───────┴───────┘

┌──────────┬──────────┬──────────┬──────────┐
│🔍Bug     │📚Backup  │⚔️Merge   │🏗️Arch    │
│Hunter    │Finder    │          │Analyzer  │
│✅ PASS   │✅ PASS   │✅ PASS   │⚠️ WARN   │
│Issues: 0 │Found: 3  │Ready ✓   │Issues: 2 │
└──────────┴──────────┴──────────┴──────────┘

┌──────────┬──────────┬──────────┬──────────┐
│🔗File    │🔗Backend │💾Database│🧹Input   │
│Structure │Validator │Validator │Validator │
│❌ FAIL   │✅ PASS   │✅ PASS   │✅ PASS   │
│Broken: 2 │Missing:0 │Issues: 0 │Unsafe: 0 │
└──────────┴──────────┴──────────┴──────────┘

┌──────────┬──────────┬──────────┬──────────┐
│🔐Form    │🎨UI      │🛡️Security│🚀Deployer│
│Hardener  │Enhancer  │Guard     │          │
│✅ PASS   │✅ PASS   │✅ PASS   │🚫 BLOCKED│
│CSRF: OK  │Score: 5/5│No Vulns  │Critical  │
└──────────┴──────────┴──────────┴──────────┘

┌──────────────────────┬─────────────────────────┐
│ Current File         │ Commander Decision      │
│ modern_sidebar.php   │ 🚫 DEPLOYMENT BLOCKED   │
│ Type: COMPONENT      │                         │
│ Used by: 15 files    │ Reason: 2 broken links  │
│ Impact: HIGH         │ in shared component will│
│                      │ break site navigation   │
│                      │                         │
│                      │ Action Required:        │
│                      │ 1. Fix broken links     │
│                      │ 2. Re-run validation    │
└──────────────────────┴─────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Activity Log (Terminal)                             │
├─────────────────────────────────────────────────────┤
│ [12:35:00] 🔗 FileStructureValidator: FAIL          │
│ [12:35:01] 👑 Commander: Deployment blocked         │
└─────────────────────────────────────────────────────┘
```

## Technical Specifications
- Framework: React with TypeScript
- Styling: Tailwind CSS
- Animations: Framer Motion
- Charts: Recharts (for confidence percentage)
- State management: React hooks
- Real-time updates: WebSocket ready (structure only)

Build this as a single-page React component with TypeScript, using Tailwind for styling and ensuring it's production-ready, responsive, and matches modern DevOps monitoring dashboard aesthetics.
