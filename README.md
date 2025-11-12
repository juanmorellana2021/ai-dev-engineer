# 🤖 AIDevPilot

**Your AI Code Quality Co-Pilot - 76+ Patterns, 7 Scanners, Auto-Fix Included**

AIDevPilot is an intelligent VS Code extension that scans your code for security vulnerabilities, architectural issues, performance problems, and OOP violations. Chat with it naturally or use traditional commands!

## ✨ Features

### 💬 **Chat-Based Interface (NEW!)**
Talk to AIDevPilot naturally in the chat panel:
```
You: @aidevpilot scan this file
AIDevPilot: 🔍 Found 12 issues - 2 critical, 5 high priority...

You: @aidevpilot fix issues
AIDevPilot: 🔧 Auto-fixing [Pro feature]
```

### 🔍 **7 Powerful Scanners (76 Patterns)**

1. **🔒 Security Scanner (6 patterns)**
   - SQL Injection, XSS, CSRF
   - Weak cryptography, session security
   - Rate limiting validation

2. **⚠️ Error Handling Scanner (10 patterns)**
   - Missing try/catch blocks
   - Unhandled promise rejections
   - Silent failures, error logging

3. **🏗️ Architecture Scanner (10 patterns)**
   - SOLID principle violations
   - God objects, missing DI
   - Repository/Service patterns

4. **🗄️ Database Scanner (12 patterns)**
   - N+1 query problems
   - Missing indexes, transactions
   - SELECT * anti-pattern

5. **⚡ Performance Scanner (12 patterns)**
   - DOM queries in loops
   - Missing debouncing/throttling
   - Lazy loading opportunities

6. **🌐 API Design Scanner (11 patterns)**
   - Non-RESTful endpoints
   - Missing validation/pagination
   - Error response standards

7. **📐 OOP Scanner (15 patterns)**
   - Encapsulation violations
   - High cyclomatic complexity
   - Code duplication, magic numbers
   - Design pattern anti-patterns

### 🤖 **One-Click Auto-Fix** (Pro)
Automatically fix detected issues with AI-generated secure code

### 📊 **Real-Time Diagnostics**
Red squiggly lines with severity indicators (Critical/High/Medium/Low)

## 🚀 Quick Start

1. **Install** AIDevPilot from VS Code Marketplace
2. **Open the Chat Panel** (`Ctrl+Alt+I`)
3. **Type** `@aidevpilot scan this file`
4. **Get instant feedback** on 76+ code quality patterns!

## 💡 Usage

### Chat Interface (Recommended)
```bash
# Open chat panel (Ctrl+Alt+I), then:
@aidevpilot help              # Show all options
@aidevpilot scan this file    # Analyze current file
@aidevpilot fix issues        # Auto-fix problems (Pro)
@aidevpilot show dashboard    # View quality report
```

### Command Palette
```bash
Ctrl+Shift+P → "AI Dev: Scan Current File"
Ctrl+Shift+S (shortcut)
```

### Right-Click Menu
```
Right-click in editor → AI Dev: Scan Current File
```

### Auto-Fix Issues (Pro)
```
Right-click → AI Security: Auto-Fix All Issues
```

### Scan Entire Workspace (Pro)
```
Command Palette (Ctrl+Shift+P) → AI Security: Scan Entire Workspace
```

## 📸 Screenshots

### Before
```javascript
// ❌ Vulnerable Code
app.post('/api/swipe', async (req, res) => {
    const { message } = req.body;
    await db.query(`INSERT INTO messages VALUES ('${message}')`);
});
```

### After (Auto-Fixed)
```javascript
// ✅ Secure Code
const swipeLimiter = rateLimit({ windowMs: 60000, max: 100 });
const sanitizeInput = (input) => validator.escape(input);

app.post('/api/swipe', swipeLimiter, csrfProtection, async (req, res) => {
    const message = sanitizeInput(req.body.message);
    await db.query('INSERT INTO messages VALUES ($1)', [message]);
});
```

**Result:** Security score improved from 36% → 93%! 🎉

## 💰 Pricing

### Free Tier
✅ Scan 10 files/month  
✅ View vulnerabilities  
✅ Basic security tips  

### Pro - $9/month
✅ Unlimited scans  
✅ One-click auto-fix  
✅ Security test generation  
✅ Custom rules  
✅ Priority support  

[**Upgrade to Pro →**](https://securityai.dev/pricing)

## 🔐 Supported Languages

- JavaScript / TypeScript
- PHP
- More coming soon!

## 🎓 Learn More

- [OWASP Top 10](https://owasp.org/Top10/)
- [Security Best Practices](https://securityai.dev/learn)
- [Video Tutorials](https://securityai.dev/tutorials)

## 🐛 Found a Bug?

[Report it on GitHub →](https://github.com/juanmorellana2021/revolutionary-hotel-platform/issues)

## 📝 License

MIT

---

**Built with ❤️ by developers, for developers**

Protect your code. Protect your users. 🛡️
