# LogicAgent Specification - The "Business Rules" Validator

## 🎯 The Problem

**UIEnhancer** designs pretty interfaces.  
**DesignAgent** builds HTML/CSS/JS.  
**BackendValidator** checks handlers exist.  
**DatabaseValidator** validates table names.

**BUT NOBODY VALIDATES THE BUSINESS LOGIC!**

### Real Example from Today:

**Room Status Management** has 3 modes:
```html
<select id="statusDateMode">
    <option value="single">Single Day</option>
    <option value="range">Date Range</option>
    <option value="permanent">Permanent (All Future Dates)</option>
</select>
```

**The Logic Problem:**
- User selects "single" → should only affect ONE date
- User selects "range" → should affect dates from start to end
- User selects "permanent" → should affect ALL future dates

**What's actually happening:**
- Code writes to `room_status_by_date` table correctly
- Calendar cells read from table correctly
- **BUT** there's no validation that the visual display matches user expectation

**Example Bug:**
- User sets Room 101 to "Maintenance" for "Nov 13-20"
- Expects: 8 cells show 🔧 (Nov 13, 14, 15, 16, 17, 18, 19, 20)
- Reality: Could be showing wrong dates, all dates, or no dates
- **Nobody checked the logic!**

---

## 💡 What LogicAgent Should Do

### 1. **Validate Business Rules**

Scans code for conditional logic and checks if it makes sense:

```javascript
// LogicAgent checks:
if (dateMode === 'single') {
    // Should only insert 1 row into room_status_by_date ✅
    // Should only affect cells for that specific date ✅
}

if (dateMode === 'range') {
    // Should loop from startDate to endDate ✅
    // Should insert multiple rows (one per date) ✅
    // Should affect cells in that range only ✅
}

if (dateMode === 'permanent') {
    // Should update rooms.status (permanent field) ✅
    // Should affect ALL future cells ✅
}
```

### 2. **Detect Logic Gaps**

```markdown
🔴 LOGIC ERROR FOUND:

File: calendar_view.php
Line: 1798-1810

Issue: Cell rendering checks room_status_by_date BUT doesn't handle "permanent" status

Code:
```php
$statusKey = $room['id'] . '_' . $currentDate;
$roomStatus = isset($roomStatusByDate[$statusKey]) 
    ? $roomStatusByDate[$statusKey] 
    : ($room['status'] ?? 'clean');
```

Problem: If user sets "permanent" status, it updates rooms.status but calendar cells only check room_status_by_date for specific dates. Future dates won't show status!

Fix needed:
```php
// Check room_status_by_date first (overrides permanent)
$statusKey = $room['id'] . '_' . $currentDate;
if (isset($roomStatusByDate[$statusKey])) {
    $roomStatus = $roomStatusByDate[$statusKey];
} else {
    // Fall back to permanent status for dates not in room_status_by_date
    $roomStatus = $room['status'] ?? 'clean';
}
```
```

### 3. **Test Logic Paths**

```javascript
// LogicAgent generates test scenarios:

Test Case 1: Single Day
- Input: Room 101, status=maintenance, date_mode=single, date=2025-11-13
- Expected Database: 1 row in room_status_by_date (room_id=101, status_date=2025-11-13)
- Expected Visual: Only Nov 13 cell shows 🔧
- Expected Behavior: Nov 14 and beyond show default status

Test Case 2: Date Range
- Input: Room 101, status=maintenance, date_mode=range, start=2025-11-13, end=2025-11-20
- Expected Database: 8 rows in room_status_by_date (one per date)
- Expected Visual: Nov 13-20 cells show 🔧
- Expected Behavior: Nov 12 and Nov 21 show default status

Test Case 3: Permanent
- Input: Room 101, status=maintenance, date_mode=permanent
- Expected Database: rooms.status = 'maintenance' (permanent field)
- Expected Visual: ALL future cells show 🔧
- Expected Behavior: Past dates unaffected
```

### 4. **Validate State Consistency**

```markdown
LogicAgent checks:

1. Frontend State vs Backend State
   - User selects "range" in dropdown
   - Does backend receive date_mode = 'range'? ✅/❌
   - Does backend insert rows for range? ✅/❌
   - Do calendar cells display range? ✅/❌

2. Database State vs Visual State
   - Database has 8 rows for Nov 13-20
   - Do 8 cells show icons? ✅/❌
   - Are they the correct dates? ✅/❌

3. User Intent vs Actual Outcome
   - User wants "maintenance for next week"
   - Selects date_mode = 'range', Nov 13-20
   - Visual shows maintenance for Nov 13-20? ✅/❌
```

---

## 🔧 LogicAgent Implementation

### Agent Code (swarm-agents.js)

```javascript
async logicAgent(stream) {
    stream.markdown(`## 🧠 LogicAgent - Business Rules Validator\n\n`);
    
    const document = vscode.window.activeTextEditor?.document;
    if (!document) {
        stream.markdown(`⚠️ No active file\n`);
        return { issues: [] };
    }
    
    const content = document.getText();
    const issues = [];
    
    // 1. Find all conditional logic
    const conditionals = this.findConditionals(content);
    
    // 2. Validate state consistency
    for (const conditional of conditionals) {
        const stateCheck = this.validateStateConsistency(conditional, content);
        if (!stateCheck.valid) {
            issues.push({
                severity: 'HIGH',
                type: 'logic_inconsistency',
                location: conditional.line,
                message: stateCheck.error,
                fix: stateCheck.suggestion
            });
        }
    }
    
    // 3. Check for missing else branches
    const missingElse = this.findMissingElseBranches(content);
    issues.push(...missingElse);
    
    // 4. Validate loop logic (date ranges, arrays)
    const loopIssues = this.validateLoops(content);
    issues.push(...loopIssues);
    
    // 5. Check user intent vs implementation
    const intentMismatch = this.checkUserIntent(content);
    issues.push(...intentMismatch);
    
    // Report findings
    if (issues.length === 0) {
        stream.markdown(`✅ No logic issues found\n\n`);
    } else {
        stream.markdown(`🔴 Found ${issues.length} logic issues:\n\n`);
        
        issues.forEach((issue, i) => {
            stream.markdown(`### ${i + 1}. ${issue.type}\n`);
            stream.markdown(`**Severity:** ${issue.severity}\n`);
            stream.markdown(`**Line:** ${issue.location}\n`);
            stream.markdown(`**Issue:** ${issue.message}\n\n`);
            
            if (issue.fix) {
                stream.markdown(`**Suggested Fix:**\n\`\`\`\n${issue.fix}\n\`\`\`\n\n`);
            }
        });
    }
    
    return {
        issues,
        validated: conditionals.length,
        consistency: issues.length === 0
    };
}

// Helper: Find all if/else/switch statements
findConditionals(content) {
    const conditionals = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        // Match if statements
        const ifMatch = line.match(/if\s*\((.*?)\)/);
        if (ifMatch) {
            conditionals.push({
                type: 'if',
                condition: ifMatch[1],
                line: index + 1
            });
        }
        
        // Match switch statements
        const switchMatch = line.match(/switch\s*\((.*?)\)/);
        if (switchMatch) {
            conditionals.push({
                type: 'switch',
                variable: switchMatch[1],
                line: index + 1
            });
        }
    });
    
    return conditionals;
}

// Helper: Validate state consistency
validateStateConsistency(conditional, content) {
    // Example: Check if date_mode logic is complete
    if (conditional.condition.includes('date_mode')) {
        const hasRange = content.includes("date_mode === 'range'");
        const hasSingle = content.includes("date_mode === 'single'");
        const hasPermanent = content.includes("date_mode === 'permanent'");
        
        if (!hasRange || !hasSingle || !hasPermanent) {
            return {
                valid: false,
                error: 'Incomplete date_mode handling - missing cases',
                suggestion: 'Add handlers for all 3 modes: single, range, permanent'
            };
        }
    }
    
    return { valid: true };
}

// Helper: Find missing else branches
findMissingElseBranches(content) {
    const issues = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        // If statement without else
        if (line.match(/if\s*\(/) && !content.includes('else', index)) {
            // Check if this is a critical path
            if (line.includes('status') || line.includes('date_mode')) {
                issues.push({
                    severity: 'MEDIUM',
                    type: 'missing_else',
                    location: index + 1,
                    message: 'If statement lacks else branch - what happens if condition is false?',
                    fix: 'Add else clause to handle alternative path'
                });
            }
        }
    });
    
    return issues;
}

// Helper: Validate loops
validateLoops(content) {
    const issues = [];
    
    // Check for date range loops
    const dateLoopPattern = /for.*startDate.*endDate/;
    if (content.match(dateLoopPattern)) {
        // Validate loop increments dates correctly
        if (!content.includes('addDay') && !content.includes('strtotime("+1 day")')) {
            issues.push({
                severity: 'CRITICAL',
                type: 'infinite_loop_risk',
                message: 'Date loop may not increment - risk of infinite loop',
                fix: 'Add date increment: $currentDate = date("Y-m-d", strtotime($currentDate . " +1 day"))'
            });
        }
    }
    
    return issues;
}

// Helper: Check user intent
checkUserIntent(content) {
    const issues = [];
    
    // Example: If user can select "permanent" but code doesn't update rooms.status
    if (content.includes('value="permanent"')) {
        if (!content.includes('UPDATE rooms SET status')) {
            issues.push({
                severity: 'CRITICAL',
                type: 'user_intent_mismatch',
                message: 'User can select "permanent" status but backend doesn\'t update rooms table',
                fix: 'Add: UPDATE rooms SET status = ? WHERE id = ? for permanent mode'
            });
        }
    }
    
    return issues;
}
```

---

## 🧪 LogicAgent Test Cases

### Test 1: Room Status Date Mode Logic

**Input Code:**
```php
if ($dateMode === 'single') {
    // Insert single date
} elseif ($dateMode === 'range') {
    // Insert range
}
// Missing: permanent mode!
```

**LogicAgent Output:**
```markdown
🔴 LOGIC ERROR

Type: incomplete_switch
Severity: CRITICAL
Line: 100

Issue: date_mode has 3 possible values (single, range, permanent) 
       but code only handles 2 cases

Impact: If user selects "permanent", no action will be taken

Fix: Add elseif ($dateMode === 'permanent') branch
```

### Test 2: Calendar Cell Display Logic

**Input Code:**
```php
$roomStatus = isset($roomStatusByDate[$statusKey]) 
    ? $roomStatusByDate[$statusKey] 
    : 'clean';
```

**LogicAgent Output:**
```markdown
🟠 LOGIC WARNING

Type: fallback_logic_incomplete
Severity: HIGH
Line: 1798

Issue: Fallback defaults to 'clean' but doesn't check rooms.status for permanent status

Impact: If room has permanent maintenance status, cells will show 'clean' 
        because room_status_by_date won't have entries for all dates

Fix: Change fallback to: ($room['status'] ?? 'clean')
     This respects permanent status from rooms table
```

---

## 📊 LogicAgent Value Proposition

### What Other Agents Miss:

| Agent | Checks | Misses |
|-------|--------|--------|
| BugHunter | Syntax errors | Logic errors |
| BackendValidator | Handlers exist | Handler logic is correct |
| DatabaseValidator | Table names | Query logic handles all cases |
| UIEnhancer | Design quality | UI matches business rules |
| **LogicAgent** | ✅ Business rules | Nothing! |

### Real Bugs LogicAgent Would Catch:

1. **Room Status "Permanent" Mode**
   - ❌ Current: Permanent status ignored by calendar cells
   - ✅ LogicAgent: "permanent mode sets rooms.status but cells only check room_status_by_date"

2. **Date Range Off-by-One**
   - ❌ Current: Range Nov 13-20 might show 7 days instead of 8
   - ✅ LogicAgent: "Loop condition uses < instead of <= - excludes end date"

3. **Missing Status Reset**
   - ❌ Current: Setting status to "clean" doesn't delete from room_status_by_date
   - ✅ LogicAgent: "clean status should DELETE rows, not INSERT with status='clean'"

---

## 🚀 Rollout Plan

### v3.1.0: Basic LogicAgent
- [ ] Validate if/else completeness
- [ ] Check state consistency (frontend dropdown vs backend handler)
- [ ] Detect missing cases in switch statements

### v3.2.0: Advanced Logic Validation
- [ ] Loop analysis (infinite loops, off-by-one)
- [ ] User intent matching (UI options vs backend implementation)
- [ ] State machine validation (status transitions)

### v4.0.0: AI-Powered Logic Reasoning
- [ ] Natural language business rules → code validation
- [ ] Generate test cases from logic branches
- [ ] Predict edge cases based on conditional complexity

---

## 💬 User Quote (The Inspiration)

> "i just wanted for teh date rane or set date or permannetn you know that logical i feel like we need a logic agent for desing"

**Translation:**
The calendar has 3 modes (date range, set date, permanent) but nobody validates the logic connects correctly between:
- User selection (dropdown)
- Backend processing (database writes)
- Visual display (calendar cells)

**LogicAgent solves this!** 🎯

---

**Status:** Ready for implementation in v3.1.0  
**Priority:** HIGH - Fills critical gap in agent coverage  
**Complexity:** Medium - Requires pattern matching + state analysis  
**ROI:** Very High - Catches bugs no other agent detects
