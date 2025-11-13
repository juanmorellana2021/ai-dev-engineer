# DesignAgent Specification

## 🎯 The Problem

Current **UIEnhancer** agent only REVIEWS existing UI:
- "This button should be bigger"
- "Add accessibility attributes"
- "Use modern design patterns"

But it **doesn't actually BUILD** the UI! It's a critic, not a creator.

---

## 💡 The Solution: Separate Concerns

### DesignAgent 🎨 (The Builder)
**Role:** Create complete UI components from requirements

**Input:**
- User requirement: "Create a booking form with date picker, guest count, and room selection"
- Design system preferences (Tailwind, Bootstrap, custom CSS)
- Brand colors, fonts, spacing rules

**Output:**
```html
<!-- Complete, production-ready component -->
<div class="booking-form">
  <div class="form-group">
    <label for="checkin" class="form-label">Check-in Date</label>
    <input type="date" id="checkin" class="form-control" required>
  </div>
  <!-- ... full implementation -->
</div>

<style>
/* Modern, accessible CSS */
.booking-form { ... }
</style>

<script>
// Interactive behaviors
document.querySelector('#checkin').addEventListener('change', ...)
</script>
```

**Features:**
- Generates semantic HTML
- Writes accessible markup (ARIA labels, roles)
- Creates responsive CSS (mobile-first)
- Adds JavaScript for interactions
- Follows design system rules

---

### UIEnhancer 🔍 (The Critic)
**Role:** Review and improve existing UI

**Input:**
- Existing HTML/CSS/JS from file
- Current design trends
- Accessibility standards (WCAG 2.1)

**Output:**
```markdown
## UIEnhancer Report

Issues Found:
1. 🔴 CRITICAL: Missing alt text on 3 images
2. 🟠 HIGH: Form has no validation feedback
3. 🟡 MEDIUM: Color contrast ratio 3.2:1 (needs 4.5:1)

Recommendations:
- Add `aria-label` to icon buttons
- Implement focus states for keyboard navigation
- Use `rem` units instead of `px` for better scaling
```

**Features:**
- Scans for accessibility violations
- Checks color contrast
- Validates responsive behavior
- Suggests modern patterns (CSS Grid, Flexbox)
- Identifies usability issues

---

## 🤝 How They Work Together

### Scenario: Build New Feature
```javascript
// Step 1: DesignAgent creates the UI
const designReport = await this.designAgent(stream, {
  component: 'BookingForm',
  requirements: ['date picker', 'guest count', 'room selection'],
  style: 'modern-minimal'
});

// Step 2: UIEnhancer reviews it
const enhanceReport = await this.uiEnhancer(stream);

// Step 3: DesignAgent refines based on feedback
if (enhanceReport.issues.length > 0) {
  const refinedDesign = await this.designAgent(stream, {
    improvements: enhanceReport.recommendations
  });
}
```

### Workflow
1. **DesignAgent** builds initial component
2. **UIEnhancer** reviews for issues
3. **DesignAgent** fixes issues
4. **BackendValidator** ensures form has handler
5. **SecurityGuard** checks for CSRF/XSS
6. **Deploy!**

---

## 📋 DesignAgent Implementation Plan

### Phase 1: Basic Component Generation
```javascript
async designAgent(stream, requirements) {
  stream.markdown(`## 🎨 DesignAgent - Building UI Component\n\n`);
  
  // Parse requirements
  const { component, fields, style } = requirements;
  
  // Generate HTML
  const html = this.generateHTML(fields, style);
  
  // Generate CSS
  const css = this.generateCSS(style);
  
  // Generate JavaScript
  const js = this.generateJS(fields);
  
  // Return complete component
  return {
    html,
    css,
    js,
    files: [
      { path: `${component}.html`, content: html },
      { path: `${component}.css`, content: css },
      { path: `${component}.js`, content: js }
    ]
  };
}
```

### Phase 2: Design System Integration
- Load Tailwind/Bootstrap classes
- Use component libraries (Shadcn, Material UI)
- Respect brand guidelines (colors, fonts, spacing)

### Phase 3: Smart Component Library
- Pre-built templates:
  - Forms (booking, contact, login)
  - Tables (data grid, sortable, filterable)
  - Modals (confirm, info, fullscreen)
  - Navigation (sidebar, topbar, breadcrumbs)
  - Cards (product, profile, stats)

### Phase 4: AI-Powered Customization
- "Make it look like Airbnb" → Copy their design patterns
- "Add animations" → Include Framer Motion/GSAP
- "Mobile-first" → Start with 320px viewport

---

## 🧪 Testing Strategy

### Test Case 1: Calendar Edit Booking Modal
**Requirement:** "Create a modal to edit booking with date pickers, guest name, and room selector"

**DesignAgent Output:**
```html
<div class="modal" id="editBookingModal">
  <div class="modal-dialog">
    <div class="modal-header">
      <h3>Edit Booking</h3>
      <button class="close" onclick="closeModal()">&times;</button>
    </div>
    <form method="POST" id="editBookingForm">
      <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
      <input type="hidden" name="edit_booking" value="1">
      
      <div class="form-row">
        <label for="guest_name">Guest Name</label>
        <input type="text" id="guest_name" name="guest_name" required>
      </div>
      <!-- ... more fields -->
    </form>
  </div>
</div>
```

**UIEnhancer Review:**
- ✅ Semantic HTML
- ✅ CSRF token included
- ⚠️ Missing ARIA roles
- ⚠️ No keyboard trap handling

**BackendValidator Check:**
- ✅ Form has `name="edit_booking"`
- ❌ No `$_POST['edit_booking']` handler found
- 🔧 Auto-generate handler template

---

## 🎯 Success Metrics

### DesignAgent
- **Speed:** Generate component in <3 seconds
- **Quality:** 90%+ accessibility score (Lighthouse)
- **Accuracy:** Meets requirements without revisions
- **Consistency:** Follows design system 100%

### UIEnhancer
- **Coverage:** Catches 95%+ accessibility issues
- **Accuracy:** <5% false positives
- **Actionability:** Every issue has fix suggestion

### Combined
- **First-pass quality:** 80%+ components deploy-ready
- **Developer satisfaction:** 4.5+ stars (user surveys)
- **Time saved:** 60%+ reduction in UI development time

---

## 🚀 Rollout Plan

### v3.1.0 (Next Release)
- [ ] Basic DesignAgent (forms only)
- [ ] Enhanced UIEnhancer (accessibility focus)
- [ ] Integration with BackendValidator

### v3.2.0
- [ ] Expanded templates (tables, modals, cards)
- [ ] Tailwind/Bootstrap support
- [ ] Real-time preview in webview

### v4.0.0
- [ ] AI-powered design copying ("make it like X")
- [ ] Animation support
- [ ] Component library marketplace

---

## 💬 User Feedback Needed

**Questions for testing:**
1. Does DesignAgent output match your mental model?
2. Are UIEnhancer suggestions actionable?
3. Which component templates do you need most?
4. What design systems should we support first?

**Test with real calendar project:**
- Let DesignAgent rebuild Edit Booking modal
- Compare to hand-coded version
- Measure time saved
- Track bugs caught by UIEnhancer

---

## 📝 Notes from Session

**Original insight:** "UIEnhancer doesn't know how to design a UI yet"

**The fix:** Split into two agents:
- DesignAgent = CREATE
- UIEnhancer = CRITIQUE

**Why this works:**
- Clear separation of concerns
- DesignAgent can fail fast (builder)
- UIEnhancer validates quality (reviewer)
- BackendValidator ensures it works (integrator)

**Real-world proof:** Calendar bugs showed we need FULL-STACK validation:
- Frontend agent builds UI ✅
- BackendValidator checks handlers ✅
- DatabaseValidator verifies tables ✅
- SecurityGuard blocks deploy if unsafe ✅

**Next level:** DesignAgent completes the stack by BUILDING frontend, not just reviewing it.
