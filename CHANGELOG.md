# Changelog - AIDevPilot

All notable changes to the AIDevPilot extension will be documented in this file.

---

## [3.0.0] - 2025-01-XX - FULL-STACK VALIDATION RELEASE 🚀

### 🎯 Major Features

#### NEW: BackendValidator Agent 🔗
**The agent that would have prevented the calendar bug!**

Automatically matches frontend forms to backend POST handlers and catches:
- Forms with no backend endpoint
- Button actions with missing server-side logic
- AJAX calls to non-existent API routes

**Real-world impact:** Caught 2 production bugs in AiniTravel hotel platform:
- `edit_booking` form → no `$_POST['edit_booking']` handler
- `extend_stay` modal → no backend logic to update checkout date

**How it works:**
```javascript
// Scans for all forms
<form method="POST">
  <input type="hidden" name="edit_booking" value="1">
</form>

// Checks for corresponding handler
if (isset($_POST['edit_booking'])) {
  // ✅ Handler exists
}

// Reports missing handlers
Missing: extend_stay, delete_booking, update_status
```

#### NEW: DatabaseValidator Agent 💾
**Prevents the #1 cause of 500 errors!**

Validates database queries for:
- Wrong table names (`multiple_guests` should be `booking_guests`)
- SQL injection risks (string concatenation vs prepared statements)
- Missing CASCADE operations (orphaned foreign keys)

**Real-world impact:** Detected in production code:
```php
// ❌ CRITICAL: Table doesn't exist
INSERT INTO multiple_guests

// ✅ Fixed by DatabaseValidator
INSERT INTO booking_guests
```

**Severity levels:**
- 🔴 CRITICAL: Table doesn't exist, SQL injection risk
- 🟠 HIGH: Missing prepared statement, wrong column name
- 🟡 MEDIUM: Inefficient query, missing index

---

### ✨ Enhancements

#### AutoFixer Orchestrator
- Now runs **10 agents** (was 8)
- Added BackendValidator + DatabaseValidator to sequence
- Enhanced confidence scoring:
  - 95-100%: ✅ READY TO DEPLOY
  - 80-94%: ⚠️ REVIEW NEEDED
  - 0-79%: ❌ NOT READY
- Improved summary with issue counts per agent

#### Chat Participant
- New commands:
  - `@aidevpilot validate backend` - Run BackendValidator only
  - `@aidevpilot validate database` - Run DatabaseValidator only
- Better error messages with emojis and severity colors

#### VS Code Commands
- `AI Dev: Validate Backend Handlers` - Standalone backend check
- `AI Dev: Validate Database Queries` - Standalone database audit

---

### 🐛 Bug Fixes
- Fixed AutoFixer not reporting missing handlers
- Corrected confidence calculation (was inflated)
- Fixed typo in ProductionDeployer (`deployerReport` → `deployReport`)

---

### 📚 Documentation
- Added `MARKETING_README.md` with full feature showcase
- Case study: AiniTravel hotel platform ROI analysis
- Comparison table vs GitHub Copilot, Tabnine
- Real bug examples with before/after code

---

### 🔄 Breaking Changes
**None** - Fully backward compatible with v2.x

---

### 📦 Package Details
- **File count:** 399 files
- **Size:** 606.5KB
- **Languages supported:** PHP, JavaScript, TypeScript
- **VS Code min version:** 1.80.0

---

## [2.2.0] - 2024-12-15

### Added
- UIEnhancer agent for accessibility and modern design patterns
- ProductionDeployer agent for safe SCP/rsync commands
- Chat participant with sticky mode
- Load context command (Ctrl+Shift+C)

### Changed
- Improved SecurityGuard blocking logic
- Better Markdown formatting in reports

---

## [2.1.0] - 2024-11-20

### Added
- FormHardener agent for CSRF token injection
- Dashboard webview with code quality metrics
- Auto-scan on save (configurable)

### Fixed
- InputValidator false positives for prepared statements

---

## [2.0.0] - 2024-10-10

### Added
- Complete rewrite with swarm architecture
- BugHunter, BackupFinder, CodeMerger agents
- InputValidator agent
- SecurityGuard agent

### Changed
- Moved from regex patterns to AST parsing
- Improved performance (3x faster scans)

---

## [1.0.2] - 2024-09-01

### Initial Release
- Basic code quality scanning
- 70+ pattern detection
- Simple auto-fix suggestions

---

## Upgrade Guide

### From v2.x to v3.0.0

**No action required!** Just update the extension and enjoy:
- 2 new agents automatically included
- Enhanced AutoFixer reports
- Better confidence scores

**New commands to try:**
```
Ctrl+Shift+S - Scan file (now includes backend + database validation)
@aidevpilot validate backend - Check for missing handlers
@aidevpilot validate database - Audit SQL queries
```

---

## Support & Feedback

- **Issues:** [GitHub Issues](https://github.com/juanmorellana2021/ai-dev-engineer/issues)
- **Feature Requests:** [GitHub Discussions](https://github.com/juanmorellana2021/ai-dev-engineer/discussions)
- **Email:** support@aidevpilot.com
- **Discord:** [Join community](https://discord.gg/aidevpilot)

---

**🎉 Thank you for using AIDevPilot v3.0.0!**

The only AI that validates your entire stack automatically.
