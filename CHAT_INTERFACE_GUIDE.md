# AIDevPilot Chat Interface Guide

## 🎯 How to Use the Chat Interface

AIDevPilot now supports **conversational interaction** through VS Code's chat panel!

### Getting Started

1. **Open the Chat Panel**
   - Press `Ctrl+Alt+I` (Windows/Linux) or `Cmd+Alt+I` (Mac)
   - Or click the chat icon in the Activity Bar

2. **Start a Conversation**
   Type `@aidevpilot` followed by your request:
   ```
   @aidevpilot scan this file
   @aidevpilot fix issues
   @aidevpilot show dashboard
   @aidevpilot help
   ```

### Available Commands

| Command | Description |
|---------|-------------|
| `@aidevpilot` or `@aidevpilot help` | Show welcome message and available options |
| `@aidevpilot scan` | Analyze current file for 76+ code quality issues |
| `@aidevpilot fix` | Auto-fix issues (Pro feature) |
| `@aidevpilot dashboard` | Show code quality dashboard |
| `@aidevpilot test` | Generate unit tests (Pro feature) |

### Example Conversations

**Simple Scan:**
```
You: @aidevpilot scan this file
AIDevPilot: 🔍 Scanning hotel_setup.php...
Found 12 issues:
- 🔴 2 CRITICAL issues
- 🟠 5 HIGH priority issues
- 🟡 3 MEDIUM priority issues
- 🟢 2 LOW priority issues
...
```

**Get Help:**
```
You: @aidevpilot help
AIDevPilot: 🤖 AIDevPilot - Your Code Quality Co-Pilot
I scan your code for 76+ quality issues across:
- 🔒 Security (SQL injection, XSS, CSRF)
- ⚠️ Error Handling (try/catch, logging)
...
```

**Natural Language:**
```
You: @aidevpilot check for security issues
AIDevPilot: [Runs security scan on current file]

You: @aidevpilot what's wrong with my code?
AIDevPilot: [Shows interactive menu to choose scan type]
```

### Features

✅ **Interactive Results** - Issues displayed directly in chat with syntax highlighting  
✅ **Conversational** - Ask questions naturally, no need to remember exact commands  
✅ **Context Aware** - Automatically scans the file you're currently editing  
✅ **Visual Feedback** - Emoji indicators for severity levels  
✅ **Quick Actions** - Click suggestions to jump to code or apply fixes  

### Chat vs Command Palette

**Chat Interface (NEW):**
- Type `@aidevpilot scan` in chat panel
- Conversational, interactive
- Results shown inline with context
- Better for exploration and learning

**Command Palette (Still Available):**
- Press `Ctrl+Shift+P` → "AI Dev: Scan Current File"
- Traditional VS Code commands
- Keyboard shortcuts (Ctrl+Shift+S)
- Better for quick scans

### Pro Features in Chat

Some commands require **AIDevPilot Pro** ($19/month):

- 🔧 **Auto-Fix** - Automatically fix detected issues
- ✅ **Test Generation** - Generate unit tests for functions
- 📈 **Advanced Analytics** - Detailed quality trends
- 🔄 **Unlimited Scans** - No daily scan limits

[Upgrade to Pro →](https://gumroad.com/aidevpilot)

### Tips

1. **Open a file first** - The chat scans the file you're currently editing
2. **Use natural language** - "check this" works just as well as "scan this file"
3. **Follow-up questions** - Ask "why is this a problem?" after seeing results
4. **Combine with commands** - Use chat for exploration, shortcuts for speed

### Troubleshooting

**Chat not responding?**
- Make sure you have a file open in the editor
- Check that the extension is enabled (look for robot icon)
- Try reloading VS Code (Ctrl+R)

**Can't find @aidevpilot?**
- Type `@` in chat to see all available participants
- If not listed, reinstall the extension
- Make sure you're using VS Code 1.80.0 or newer

---

**Need help?** Type `@aidevpilot help` in chat or visit [GitHub Issues](https://github.com/juanmorellana2021/ai-dev-engineer/issues)
