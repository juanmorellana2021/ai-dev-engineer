/**
 * AIDevPilot Chat Participant
 * Enables /aidevpilot chat command for interactive code quality scanning
 */

const vscode = require('vscode');

class ChatParticipant {
    constructor(scanners, autoFixer) {
        this.scanners = scanners;
        this.autoFixer = autoFixer;
    }

    register(context) {
        // Register chat participant
        const participant = vscode.chat.createChatParticipant('aidevpilot.chat', async (request, context, stream, token) => {
            try {
                await this.handleChatRequest(request, context, stream, token);
            } catch (error) {
                stream.markdown(`❌ Error: ${error.message}`);
            }
        });

        participant.iconPath = vscode.Uri.file(context.asAbsolutePath('icon.png'));
        
        context.subscriptions.push(participant);

        return participant;
    }

    async handleChatRequest(request, context, stream, token) {
        const userMessage = request.prompt.toLowerCase();

        // Welcome / Help
        if (!userMessage || userMessage.includes('help')) {
            this.showWelcome(stream);
            return;
        }

        // Scan current file
        if (userMessage.includes('scan') || userMessage.includes('check') || userMessage.includes('analyze')) {
            await this.scanCurrentFile(stream);
            return;
        }

        // Auto-fix
        if (userMessage.includes('fix') || userMessage.includes('repair')) {
            await this.autoFixFile(stream);
            return;
        }

        // Show dashboard
        if (userMessage.includes('dashboard') || userMessage.includes('report') || userMessage.includes('summary')) {
            await this.showDashboard(stream);
            return;
        }

        // Generate tests
        if (userMessage.includes('test')) {
            await this.generateTests(stream);
            return;
        }

        // Default: show options
        this.showOptions(stream);
    }

    showWelcome(stream) {
        stream.markdown(`# 🤖 AIDevPilot - Your Code Quality Co-Pilot\n\n`);
        stream.markdown(`I scan your code for **76+ quality issues** across:\n\n`);
        stream.markdown(`- 🔒 **Security** (SQL injection, XSS, CSRF)\n`);
        stream.markdown(`- ⚠️ **Error Handling** (try/catch, logging, promises)\n`);
        stream.markdown(`- 🏗️ **Architecture** (SOLID, design patterns)\n`);
        stream.markdown(`- 🗄️ **Database** (N+1 queries, indexes, transactions)\n`);
        stream.markdown(`- ⚡ **Performance** (DOM optimization, lazy loading)\n`);
        stream.markdown(`- 🌐 **API Design** (RESTful, validation, pagination)\n`);
        stream.markdown(`- 📐 **OOP Principles** (encapsulation, complexity, duplication)\n\n`);
        
        stream.markdown(`## What can I do?\n\n`);
        stream.markdown(`- 🔍 **"scan this file"** - Analyze current file\n`);
        stream.markdown(`- 🔧 **"fix issues"** - Auto-fix problems\n`);
        stream.markdown(`- 📊 **"show dashboard"** - View code quality report\n`);
        stream.markdown(`- ✅ **"generate tests"** - Create unit tests\n\n`);
        
        stream.markdown(`Try: *"scan this file"* to get started! 🚀`);
    }

    showOptions(stream) {
        stream.markdown(`## Choose an action:\n\n`);
        stream.markdown(`1. 🔍 Type **"scan this file"** - Analyze your code\n`);
        stream.markdown(`2. 🔧 Type **"fix issues"** - Auto-fix problems\n`);
        stream.markdown(`3. 📊 Type **"show dashboard"** - View quality report\n`);
        stream.markdown(`4. ✅ Type **"generate tests"** - Create tests\n\n`);
        stream.markdown(`Or ask me anything about code quality!`);
    }

    async scanCurrentFile(stream) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            stream.markdown(`❌ No file is currently open. Please open a file first.`);
            return;
        }

        const document = editor.document;
        const fileContent = document.getText();
        const filePath = document.fileName;
        const fileName = filePath.split(/[\\\/]/).pop();

        stream.markdown(`## 🔍 Scanning \`${fileName}\`...\n\n`);
        stream.progress('Running all 7 scanners...');

        // Run all scanners
        const {
            securityScanner,
            errorHandlingScanner,
            architectureScanner,
            databaseScanner,
            performanceScanner,
            apiScanner,
            oopScanner
        } = this.scanners;

        const securityIssues = securityScanner.scan(fileContent, filePath);
        const errorIssues = errorHandlingScanner.scan(fileContent, filePath);
        const archIssues = architectureScanner.scan(fileContent, filePath);
        const dbIssues = databaseScanner.scan(fileContent, filePath);
        const perfIssues = performanceScanner.scan(fileContent, filePath);
        const apiIssues = apiScanner.scan(fileContent, filePath);
        const oopIssues = oopScanner.scan(fileContent, filePath);

        const allIssues = [
            ...securityIssues,
            ...errorIssues,
            ...archIssues,
            ...dbIssues,
            ...perfIssues,
            ...apiIssues,
            ...oopIssues
        ];

        // Show results
        if (allIssues.length === 0) {
            stream.markdown(`\n### ✅ Perfect! No issues found!\n\n`);
            stream.markdown(`Your code looks great! 🎉`);
            return;
        }

        // Group by severity
        const critical = allIssues.filter(i => i.severity === 'CRITICAL');
        const high = allIssues.filter(i => i.severity === 'HIGH');
        const medium = allIssues.filter(i => i.severity === 'MEDIUM');
        const low = allIssues.filter(i => i.severity === 'LOW');

        stream.markdown(`\n### Found ${allIssues.length} issues:\n\n`);
        
        if (critical.length > 0) {
            stream.markdown(`- 🔴 **${critical.length} CRITICAL** issues\n`);
        }
        if (high.length > 0) {
            stream.markdown(`- 🟠 **${high.length} HIGH** priority issues\n`);
        }
        if (medium.length > 0) {
            stream.markdown(`- 🟡 **${medium.length} MEDIUM** priority issues\n`);
        }
        if (low.length > 0) {
            stream.markdown(`- 🟢 **${low.length} LOW** priority issues\n`);
        }

        // Group by type
        const byType = {
            SECURITY: allIssues.filter(i => i.type === 'SECURITY'),
            ERROR_HANDLING: allIssues.filter(i => i.type === 'ERROR_HANDLING'),
            ARCHITECTURE: allIssues.filter(i => i.type === 'ARCHITECTURE'),
            DATABASE: allIssues.filter(i => i.type === 'DATABASE'),
            PERFORMANCE: allIssues.filter(i => i.type === 'PERFORMANCE'),
            API_DESIGN: allIssues.filter(i => i.type === 'API_DESIGN'),
            OOP: allIssues.filter(i => i.type === 'OOP')
        };

        stream.markdown(`\n### 📊 Issues by Category:\n\n`);
        
        for (const [type, issues] of Object.entries(byType)) {
            if (issues.length === 0) continue;
            
            const icon = this.getTypeIcon(type);
            stream.markdown(`#### ${icon} ${type.replace('_', ' ')} (${issues.length})\n\n`);
            
            // Show top 3 issues per category
            const topIssues = issues.slice(0, 3);
            for (const issue of topIssues) {
                stream.markdown(`**Line ${issue.line}**: ${issue.message}\n`);
                stream.markdown(`- *${issue.recommendation}*\n\n`);
            }
            
            if (issues.length > 3) {
                stream.markdown(`*...and ${issues.length - 3} more*\n\n`);
            }
        }

        stream.markdown(`\n---\n\n`);
        stream.markdown(`💡 Type **"fix issues"** to auto-fix these problems!\n\n`);
        stream.markdown(`📊 Type **"show dashboard"** for a detailed report.`);
    }

    async autoFixFile(stream) {
        stream.markdown(`## 🔧 Auto-Fix Feature\n\n`);
        stream.markdown(`⚠️ This is a **Pro feature**.\n\n`);
        stream.markdown(`Upgrade to Pro to unlock:\n`);
        stream.markdown(`- ✨ Automatic code fixes\n`);
        stream.markdown(`- 🔄 Unlimited scans\n`);
        stream.markdown(`- 📈 Advanced analytics\n`);
        stream.markdown(`- 🎯 Priority support\n\n`);
        stream.markdown(`[Get Pro for $19/month →](https://gumroad.com/aidevpilot)`);
    }

    async showDashboard(stream) {
        stream.markdown(`## 📊 Code Quality Dashboard\n\n`);
        stream.markdown(`🚧 Dashboard coming soon!\n\n`);
        stream.markdown(`Will include:\n`);
        stream.markdown(`- 📈 Quality score trends\n`);
        stream.markdown(`- 📊 Issue breakdown charts\n`);
        stream.markdown(`- 🎯 Most common problems\n`);
        stream.markdown(`- 💡 Personalized recommendations\n\n`);
        stream.markdown(`For now, type **"scan this file"** to analyze your code!`);
    }

    async generateTests(stream) {
        stream.markdown(`## ✅ Test Generation\n\n`);
        stream.markdown(`⚠️ This is a **Pro feature**.\n\n`);
        stream.markdown(`Pro members can auto-generate:\n`);
        stream.markdown(`- Unit tests for functions\n`);
        stream.markdown(`- Integration tests\n`);
        stream.markdown(`- Test coverage reports\n\n`);
        stream.markdown(`[Upgrade to Pro →](https://gumroad.com/aidevpilot)`);
    }

    getTypeIcon(type) {
        const icons = {
            SECURITY: '🔒',
            ERROR_HANDLING: '⚠️',
            ARCHITECTURE: '🏗️',
            DATABASE: '🗄️',
            PERFORMANCE: '⚡',
            API_DESIGN: '🌐',
            OOP: '📐'
        };
        return icons[type] || '📝';
    }
}

module.exports = ChatParticipant;
