/**
 * AIDevPilot Chat Participant
 * Enables /aidevpilot chat command for interactive code quality scanning
 */

const vscode = require('vscode');
const SwarmAgents = require('./swarm-agents');

class ChatParticipant {
    constructor(scanners, autoFixer) {
        this.scanners = scanners;
        this.autoFixer = autoFixer;
        this.swarm = new SwarmAgents();
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
        const originalPrompt = request.prompt;

        // Welcome / Help
        if (!userMessage || userMessage.includes('help')) {
            this.showWelcome(stream);
            return;
        }

        // INTERACTIVE SWARM ANALYSIS - /swarm or /deploy
        if (userMessage.includes('/swarm') || userMessage.includes('/deploy')) {
            await this.handleSwarmDeployment(request, stream, originalPrompt);
            return;
        }

        // SWARM COMMANDS (Legacy - keep for compatibility)
        if (userMessage.includes('fix this') || userMessage.includes('auto fix')) {
            await this.swarm.autoFixer(stream, request.prompt);
            return;
        }
        if (userMessage.includes('find bugs') || userMessage.includes('check issues')) {
            await this.swarm.bugHunter(stream, request.prompt);
            return;
        }
        if (userMessage.includes('find backup') || userMessage.includes('working version')) {
            await this.swarm.backupFinder(stream, null);
            return;
        }
        if (userMessage.includes('validate input') || userMessage.includes('check inputs')) {
            await this.swarm.inputValidator(stream);
            return;
        }
        if (userMessage.includes('harden forms') || userMessage.includes('csrf')) {
            await this.swarm.formHardener(stream, null);
            return;
        }
        if (userMessage.includes('improve ui') || userMessage.includes('enhance ux') || userMessage.includes('modernize')) {
            await this.swarm.uiEnhancer(stream);
            return;
        }
        if (userMessage.includes('check security') || userMessage.includes('vulnerabilities')) {
            await this.swarm.securityGuard(stream);
            return;
        }
        if (userMessage.includes('deploy') && !userMessage.includes('/deploy')) {
            await this.swarm.productionDeployer(stream, { approved: false });
            return;
        }

        // Specific scanner requests
        if (userMessage.includes('security')) {
            await this.scanWithScanner(stream, 'security');
            return;
        }
        if (userMessage.includes('error') || userMessage.includes('exception')) {
            await this.scanWithScanner(stream, 'error');
            return;
        }
        if (userMessage.includes('architecture') || userMessage.includes('solid')) {
            await this.scanWithScanner(stream, 'architecture');
            return;
        }
        if (userMessage.includes('database') || userMessage.includes('sql')) {
            await this.scanWithScanner(stream, 'database');
            return;
        }
        if (userMessage.includes('performance') || userMessage.includes('speed')) {
            await this.scanWithScanner(stream, 'performance');
            return;
        }
        if (userMessage.includes('api')) {
            await this.scanWithScanner(stream, 'api');
            return;
        }
        if (userMessage.includes('oop') || userMessage.includes('object')) {
            await this.scanWithScanner(stream, 'oop');
            return;
        }

        // Scan current file (all scanners or show menu)
        if (userMessage.includes('scan') || userMessage.includes('check') || userMessage.includes('analyze')) {
            // If they say "scan all" or just "scan", show menu first
            if (userMessage.includes('all')) {
                await this.scanCurrentFile(stream, 'all');
            } else {
                this.showScannerMenu(stream);
            }
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
        stream.markdown(`- 🔍 **"scan"** - Choose which scanner to run\n`);
        stream.markdown(`- 🔍 **"scan all"** - Run all 7 scanners\n`);
        stream.markdown(`- 🔒 **"check security"** - Security scan only\n`);
        stream.markdown(`- ⚡ **"check performance"** - Performance scan only\n`);
        stream.markdown(`- 🔧 **"fix issues"** - Auto-fix problems\n`);
        stream.markdown(`- 📊 **"show dashboard"** - View code quality report\n\n`);
        
        stream.markdown(`Try: *"scan"* to choose a scanner! 🚀`);
    }

    showScannerMenu(stream) {
        stream.markdown(`## 🎯 Choose a Scanner\n\n`);
        stream.markdown(`Type any of these commands:\n\n`);
        stream.markdown(`1. 🔒 **"security"** - Check for SQL injection, XSS, CSRF (6 patterns)\n`);
        stream.markdown(`2. ⚠️ **"error handling"** - Find missing try/catch, logging issues (10 patterns)\n`);
        stream.markdown(`3. 🏗️ **"architecture"** - Detect SOLID violations, God objects (10 patterns)\n`);
        stream.markdown(`4. 🗄️ **"database"** - Find N+1 queries, missing indexes (12 patterns)\n`);
        stream.markdown(`5. ⚡ **"performance"** - Optimize DOM, caching, lazy loading (12 patterns)\n`);
        stream.markdown(`6. 🌐 **"api"** - Check RESTful design, validation (11 patterns)\n`);
        stream.markdown(`7. 📐 **"oop"** - Find complexity, duplication, magic numbers (15 patterns)\n`);
        stream.markdown(`8. 🔍 **"scan all"** - Run all 7 scanners (76 patterns)\n\n`);
        stream.markdown(`Example: *"check security"* or *"scan all"*`);
    }

    showOptions(stream) {
        stream.markdown(`## Choose an action:\n\n`);
        stream.markdown(`1. 🔍 Type **"scan"** - Choose a scanner\n`);
        stream.markdown(`2. 🔧 Type **"fix issues"** - Auto-fix problems\n`);
        stream.markdown(`3. 📊 Type **"show dashboard"** - View quality report\n`);
        stream.markdown(`4. ✅ Type **"generate tests"** - Create tests\n\n`);
        stream.markdown(`Or ask me anything about code quality!`);
    }

    async scanWithScanner(stream, scannerType) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            stream.markdown(`❌ No file is currently open. Please open a file first.`);
            return;
        }

        const document = editor.document;
        const fileContent = document.getText();
        const filePath = document.fileName;
        const fileName = filePath.split(/[\\\/]/).pop();

        const scannerNames = {
            security: { name: '🔒 Security', scanner: this.scanners.securityScanner, type: 'SECURITY' },
            error: { name: '⚠️ Error Handling', scanner: this.scanners.errorHandlingScanner, type: 'ERROR_HANDLING' },
            architecture: { name: '🏗️ Architecture', scanner: this.scanners.architectureScanner, type: 'ARCHITECTURE' },
            database: { name: '🗄️ Database', scanner: this.scanners.databaseScanner, type: 'DATABASE' },
            performance: { name: '⚡ Performance', scanner: this.scanners.performanceScanner, type: 'PERFORMANCE' },
            api: { name: '🌐 API Design', scanner: this.scanners.apiScanner, type: 'API_DESIGN' },
            oop: { name: '📐 OOP', scanner: this.scanners.oopScanner, type: 'OOP' }
        };

        const config = scannerNames[scannerType];
        if (!config) {
            stream.markdown(`❌ Unknown scanner type. Type "scan" to see options.`);
            return;
        }

        stream.markdown(`## ${config.name} Scanner on \`${fileName}\`\n\n`);
        stream.progress(`Scanning for ${config.name} issues...`);

        const issues = config.scanner.scan(fileContent, filePath);

        if (issues.length === 0) {
            stream.markdown(`\n### ✅ Perfect! No ${config.name.toLowerCase()} issues found!\n\n`);
            return;
        }

        // Group by severity
        const critical = issues.filter(i => i.severity === 'CRITICAL');
        const high = issues.filter(i => i.severity === 'HIGH');
        const medium = issues.filter(i => i.severity === 'MEDIUM');
        const low = issues.filter(i => i.severity === 'LOW');

        stream.markdown(`\n### Found ${issues.length} ${config.name.toLowerCase()} issues:\n\n`);
        
        if (critical.length > 0) stream.markdown(`- 🔴 **${critical.length} CRITICAL**\n`);
        if (high.length > 0) stream.markdown(`- 🟠 **${high.length} HIGH**\n`);
        if (medium.length > 0) stream.markdown(`- 🟡 **${medium.length} MEDIUM**\n`);
        if (low.length > 0) stream.markdown(`- 🟢 **${low.length} LOW**\n\n`);

        // Show all issues
        stream.markdown(`\n### 📋 Details:\n\n`);
        for (const issue of issues) {
            const severityIcon = issue.severity === 'CRITICAL' ? '🔴' : 
                                issue.severity === 'HIGH' ? '🟠' : 
                                issue.severity === 'MEDIUM' ? '🟡' : '🟢';
            stream.markdown(`${severityIcon} **Line ${issue.line}**: ${issue.message}\n`);
            stream.markdown(`- *${issue.recommendation}*\n\n`);
        }

        stream.markdown(`\n---\n\n`);
        stream.markdown(`💡 Type **"fix issues"** to auto-fix these problems!\n\n`);
        stream.markdown(`🔍 Type **"scan all"** to run all scanners.`);
    }

    async scanCurrentFile(stream, scanType = 'all') {
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
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            stream.markdown(`❌ No file is currently open.`);
            return;
        }

        const document = editor.document;
        const filePath = document.fileName;
        const fileName = filePath.split(/[\\\/]/).pop();

        stream.markdown(`## 🔧 Auto-Fixing \`${fileName}\`...\n\n`);
        stream.progress('Scanning for issues...');

        // Run all scanners first
        const fileContent = document.getText();
        const {
            securityScanner,
            errorHandlingScanner,
            architectureScanner,
            databaseScanner,
            performanceScanner,
            apiScanner,
            oopScanner
        } = this.scanners;

        const allIssues = [
            ...securityScanner.scan(fileContent, filePath),
            ...errorHandlingScanner.scan(fileContent, filePath),
            ...architectureScanner.scan(fileContent, filePath),
            ...databaseScanner.scan(fileContent, filePath),
            ...performanceScanner.scan(fileContent, filePath),
            ...apiScanner.scan(fileContent, filePath),
            ...oopScanner.scan(fileContent, filePath)
        ];

        if (allIssues.length === 0) {
            stream.markdown(`✅ No issues found! Code looks good.`);
            return;
        }

        // Sort by severity and line number
        const criticalIssues = allIssues.filter(i => i.severity === 'CRITICAL');
        const highIssues = allIssues.filter(i => i.severity === 'HIGH');
        const fixableIssues = [...criticalIssues, ...highIssues].slice(0, 10); // Top 10

        stream.markdown(`Found **${allIssues.length} issues** (${criticalIssues.length} critical, ${highIssues.length} high)\n\n`);
        stream.markdown(`🤖 **GitHub Copilot will fix the top ${fixableIssues.length} critical/high issues:**\n\n`);

        // Format issues for Copilot to fix
        for (const issue of fixableIssues) {
            const icon = issue.severity === 'CRITICAL' ? '🔴' : '🟠';
            stream.markdown(`${icon} **Line ${issue.line}**: ${issue.message}\n`);
            stream.markdown(`   Fix: ${issue.recommendation}\n\n`);
        }

        stream.markdown(`\n---\n\n`);
        stream.markdown(`💡 **Instructions for GitHub Copilot:**\n\n`);
        stream.markdown(`Please fix the above issues in \`${fileName}\` by:\n`);
        stream.markdown(`1. Reading the file at line numbers shown\n`);
        stream.markdown(`2. Applying the recommended fixes\n`);
        stream.markdown(`3. Making targeted edits with replace_string_in_file tool\n\n`);
        stream.markdown(`Focus on CRITICAL and HIGH severity issues first.`);
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
        stream.markdown(`🚧 Coming soon! This will auto-generate:\n\n`);
        stream.markdown(`- Unit tests for functions\n`);
        stream.markdown(`- Integration tests\n`);
        stream.markdown(`- Test coverage reports\n\n`);
        stream.markdown(`For now, focus on fixing critical issues from scans.`);
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

    /**
     * INTERACTIVE SWARM DEPLOYMENT HANDLER
     * User wants conversational interface: asks "what file?" and "what issues?" before acting
     * Instead of assuming current file, we clarify intent first
     */
    async handleSwarmDeployment(request, stream, originalPrompt) {
        const vscode = require('vscode');
        
        // Step 1: Detect if file specified in prompt
        const fileMatch = originalPrompt.match(/(?:deploy|swarm)\s+([^\s]+\.(?:php|js|ts|jsx|tsx|html|css))/i);
        let targetFile = null;
        
        if (fileMatch) {
            // File specified in prompt: "@aidevpilot /deploy modern_sidebar.php"
            const fileName = fileMatch[1];
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            
            if (workspaceFolder) {
                // Search workspace for matching file
                const files = await vscode.workspace.findFiles(`**/${fileName}`, '**/node_modules/**');
                
                if (files.length === 1) {
                    targetFile = files[0].fsPath;
                    stream.markdown(`🎯 **Target File:** \`${fileName}\`\n\n`);
                } else if (files.length > 1) {
                    stream.markdown(`⚠️ **Multiple files found matching "${fileName}":**\n\n`);
                    files.slice(0, 10).forEach((file, idx) => {
                        const relativePath = vscode.workspace.asRelativePath(file);
                        stream.markdown(`${idx + 1}. \`${relativePath}\`\n`);
                    });
                    stream.markdown(`\n❓ **Please specify which file by using the full path**, like:\n`);
                    stream.markdown(`\`@aidevpilot /deploy ${vscode.workspace.asRelativePath(files[0])}\`\n\n`);
                    return;
                } else {
                    stream.markdown(`❌ **File not found:** \`${fileName}\`\n\n`);
                    stream.markdown(`💡 Try specifying the full path or browse workspace.\n\n`);
                    // Fall through to file selection below
                }
            }
        }
        
        // Step 2: If no file specified or found, ask user
        if (!targetFile) {
            const editor = vscode.window.activeTextEditor;
            const currentFile = editor?.document.fileName;
            
            stream.markdown(`## 📁 Which file(s) would you like me to analyze?\n\n`);
            
            if (currentFile) {
                const fileName = currentFile.split(/[\\/]/).pop();
                stream.markdown(`**Option 1:** Current file → \`${fileName}\`\n`);
                stream.markdown(`   Use: \`@aidevpilot /deploy current\`\n\n`);
            }
            
            stream.markdown(`**Option 2:** Specify a file path\n`);
            stream.markdown(`   Example: \`@aidevpilot /deploy hotel-management-system/room_management.php\`\n\n`);
            
            stream.markdown(`**Option 3:** Analyze recently modified files\n`);
            stream.markdown(`   Use: \`@aidevpilot /deploy recent\`\n\n`);
            
            stream.markdown(`**Option 4:** Scan entire workspace for issues\n`);
            stream.markdown(`   Use: \`@aidevpilot /swarm full\`\n\n`);
            
            stream.markdown(`---\n\n`);
            stream.markdown(`💡 **Tip:** Be specific to get faster, more focused analysis!\n`);
            return;
        }
        
        // Step 3: Ask about specific concerns
        const concernMatch = originalPrompt.match(/--concerns?\s+([a-z,\s]+)/i);
        let concerns = [];
        
        if (concernMatch) {
            // Concerns specified: "@aidevpilot /deploy file.php --concerns security,structure"
            concerns = concernMatch[1].split(',').map(c => c.trim().toLowerCase());
            stream.markdown(`🎯 **Focus Areas:** ${concerns.join(', ')}\n\n`);
        } else {
            // Ask about concerns
            stream.markdown(`## 🎯 Any specific concerns?\n\n`);
            stream.markdown(`Add \`--concerns\` to your next message to focus the analysis:\n\n`);
            stream.markdown(`- **security** → SQL injection, XSS, CSRF vulnerabilities\n`);
            stream.markdown(`- **structure** → Broken links, missing files, component architecture\n`);
            stream.markdown(`- **performance** → Slow queries, memory leaks, inefficient code\n`);
            stream.markdown(`- **quality** → Code smells, duplication, maintainability\n`);
            stream.markdown(`- **all** → Full comprehensive swarm analysis (12 agents)\n\n`);
            stream.markdown(`**Example:**\n`);
            stream.markdown(`\`@aidevpilot /deploy ${targetFile.split(/[\\/]/).pop()} --concerns security,structure\`\n\n`);
            
            // Default: run full analysis
            concerns = ['all'];
            stream.markdown(`⚡ **Running FULL swarm analysis** (you can narrow focus next time)...\n\n`);
        }
        
        // Step 4: Show what we're about to do
        stream.markdown(`---\n\n`);
        stream.markdown(`## 🧠 Activating AI Swarm Intelligence\n\n`);
        stream.markdown(`**Target:** \`${targetFile}\`\n`);
        stream.markdown(`**Focus:** ${concerns.includes('all') ? 'Full Analysis (12 agents)' : concerns.join(', ')}\n`);
        stream.markdown(`**Mode:** Pre-Deployment Safety Check\n\n`);
        
        stream.progress(`Initializing swarm...`);
        
        // Step 5: Run the actual swarm analysis
        await this.runSwarmAnalysisWithProgress(targetFile, concerns, stream);
    }

    /**
     * Run swarm analysis with progressive display
     */
    async runSwarmAnalysisWithProgress(targetFile, concerns, stream) {
        const vscode = require('vscode');
        const fs = require('fs');
        
        // Verify file exists
        if (!fs.existsSync(targetFile)) {
            stream.markdown(`❌ **Error:** File not found at \`${targetFile}\`\n`);
            return;
        }
        
        stream.markdown(`---\n\n`);
        stream.markdown(`## 🔍 Multi-Agent Analysis in Progress\n\n`);
        
        // Show agent activation sequence
        const agentSequence = [
            { name: 'FileStructureValidator', emoji: '📂', task: 'Checking file structure and references' },
            { name: 'BugHunter', emoji: '🐛', task: 'Scanning for bugs and code issues' },
            { name: 'SecurityGuard', emoji: '🛡️', task: 'Security vulnerability analysis' },
            { name: 'ArchitectureReviewer', emoji: '🏗️', task: 'Architecture and design patterns' },
            { name: 'FormHardener', emoji: '🔐', task: 'Form security and validation' },
            { name: 'PerformanceOptimizer', emoji: '⚡', task: 'Performance bottleneck detection' },
        ];
        
        // Filter agents based on concerns
        let activeAgents = agentSequence;
        if (!concerns.includes('all')) {
            activeAgents = agentSequence.filter(agent => {
                if (concerns.includes('security')) return ['SecurityGuard', 'FormHardener'].includes(agent.name);
                if (concerns.includes('structure')) return ['FileStructureValidator', 'ArchitectureReviewer'].includes(agent.name);
                if (concerns.includes('performance')) return ['PerformanceOptimizer'].includes(agent.name);
                if (concerns.includes('quality')) return ['BugHunter', 'ArchitectureReviewer'].includes(agent.name);
                return true;
            });
        }
        
        // Show active agents
        stream.markdown(`**Activating ${activeAgents.length} specialized agents:**\n\n`);
        activeAgents.forEach(agent => {
            stream.markdown(`${agent.emoji} **${agent.name}** → ${agent.task}\n`);
        });
        
        stream.markdown(`\n⏳ Analysis running...\n\n`);
        stream.progress(`Running swarm analysis...`);
        
        // Actually run the production deployer (existing swarm logic)
        await this.swarm.productionDeployer(stream, { 
            approved: false,
            targetFile: targetFile,
            concerns: concerns
        });
        
        stream.markdown(`\n---\n\n`);
        stream.markdown(`## ✅ Analysis Complete\n\n`);
        stream.markdown(`💡 **Next Steps:**\n`);
        stream.markdown(`- Review the Commander's decision above\n`);
        stream.markdown(`- Fix any critical/high severity issues\n`);
        stream.markdown(`- Re-run analysis: \`@aidevpilot /deploy ${targetFile.split(/[\\/]/).pop()}\`\n`);
        stream.markdown(`- Ready to deploy? Check voting consensus and agent reports\n`);
    }
}

module.exports = ChatParticipant;
