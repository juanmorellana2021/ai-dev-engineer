const vscode = require('vscode');
const SecurityScanner = require('./lib/security-scanner');
const AutoFixer = require('./lib/auto-fixer');
const LicenseValidator = require('./lib/license-validator');
const ErrorHandlingScanner = require('./lib/error-handling-scanner');
const ArchitectureScanner = require('./lib/architecture-scanner');
const DatabaseScanner = require('./lib/database-scanner');
const PerformanceScanner = require('./lib/performance-scanner');
const APIScanner = require('./lib/api-scanner');
const OOPScanner = require('./lib/oop-scanner');
const ChatParticipant = require('./lib/chat-participant');
const ContextLoader = require('./lib/context-loader');
const DashboardPanel = require('./lib/dashboard-panel');

let securityScanner;
let errorHandlingScanner;
let architectureScanner;
let databaseScanner;
let performanceScanner;
let apiScanner;
let oopScanner;
let autoFixer;
let licenseValidator;
let diagnosticCollection;
let contextLoader;
let projectContext;
let dashboardPanel;

/**
 * Activates the extension
 */
function activate(context) {
    console.log('AI Dev Engineer is now active!');

    // Initialize all scanners
    securityScanner = new SecurityScanner();
    errorHandlingScanner = new ErrorHandlingScanner();
    architectureScanner = new ArchitectureScanner();
    databaseScanner = new DatabaseScanner();
    performanceScanner = new PerformanceScanner();
    apiScanner = new APIScanner();
    oopScanner = new OOPScanner();
    autoFixer = new AutoFixer();
    licenseValidator = new LicenseValidator(context);
    contextLoader = new ContextLoader();
    dashboardPanel = new DashboardPanel(context);
    
    // Auto-load project context from memory-bank
    contextLoader.loadProjectContext().then(ctx => {
        if (ctx) {
            projectContext = ctx;
            console.log('✅ AIDevPilot: Project context loaded from memory-bank');
            
            // Show notification (optional)
            vscode.window.showInformationMessage(
                `🤖 AIDevPilot: Loaded ${ctx.codingPatterns.length} patterns, ${ctx.technologies.length} technologies`,
                'View Context'
            ).then(selection => {
                if (selection === 'View Context') {
                    showContextWelcome(context);
                }
            });
        } else {
            console.log('ℹ️ AIDevPilot: No memory-bank found, using default patterns');
        }
    });
    
    // Initialize chat participant
    const chatParticipant = new ChatParticipant({
        securityScanner,
        errorHandlingScanner,
        architectureScanner,
        databaseScanner,
        performanceScanner,
        apiScanner,
        oopScanner
    }, autoFixer);
    chatParticipant.register(context);
    
    // Create diagnostic collection for showing errors in editor
    diagnosticCollection = vscode.languages.createDiagnosticCollection('aiDevEngineer');
    context.subscriptions.push(diagnosticCollection);

    // AUTO-LOAD CONTEXT: Show welcome message with context on startup
    const config = vscode.workspace.getConfiguration('aiDevEngineer');
    if (config.get('autoShowContextOnStartup', true)) {
        setTimeout(() => {
            showContextWelcome(context);
        }, 2000); // Wait 2 seconds for workspace to fully load
    }

    // ==================== COMMAND: Show Dashboard ====================
    let showDashboardCommand = vscode.commands.registerCommand('aiDevEngineer.showDashboard', () => {
        dashboardPanel.show();
    });
    context.subscriptions.push(showDashboardCommand);

    // ==================== COMMAND: Scan Current File ====================
    let scanFileCommand = vscode.commands.registerCommand('aiDevEngineer.scanFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No file is currently open');
            return;
        }

        const document = editor.document;
        const fileContent = document.getText();
        const filePath = document.fileName;

        // Show progress
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "AIDevPilot scanning code...",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: "Security..." });

            // Run ALL 7 scanners
            const securityIssues = securityScanner.scan(fileContent, filePath);
            progress.report({ increment: 14, message: "Error handling..." });
            
            const errorIssues = errorHandlingScanner.scan(fileContent, filePath);
            progress.report({ increment: 28, message: "Architecture..." });
            
            const archIssues = architectureScanner.scan(fileContent, filePath);
            progress.report({ increment: 42, message: "Database..." });
            
            const dbIssues = databaseScanner.scan(fileContent, filePath);
            progress.report({ increment: 56, message: "Performance..." });
            
            const perfIssues = performanceScanner.scan(fileContent, filePath);
            progress.report({ increment: 70, message: "API design..." });
            
            const apiIssues = apiScanner.scan(fileContent, filePath);
            progress.report({ increment: 85, message: "OOP principles..." });
            
            const oopIssues = oopScanner.scan(fileContent, filePath);
            
            // Combine all issues
            const allIssues = [
                ...securityIssues,
                ...errorIssues,
                ...archIssues,
                ...dbIssues,
                ...perfIssues,
                ...apiIssues,
                ...oopIssues
            ];
            
            progress.report({ increment: 100 });

            // Show results
            if (allIssues.length === 0) {
                vscode.window.showInformationMessage('✅ No issues found! Your code looks great!');
                diagnosticCollection.clear();
            } else {
                const critical = allIssues.filter(v => v.severity === 'CRITICAL').length;
                const high = allIssues.filter(v => v.severity === 'HIGH').length;
                
                // Group by type
                const byType = {
                    SECURITY: allIssues.filter(i => i.type === 'SECURITY').length,
                    ERROR_HANDLING: allIssues.filter(i => i.type === 'ERROR_HANDLING').length,
                    ARCHITECTURE: allIssues.filter(i => i.type === 'ARCHITECTURE').length,
                    DATABASE: allIssues.filter(i => i.type === 'DATABASE').length,
                    PERFORMANCE: allIssues.filter(i => i.type === 'PERFORMANCE').length,
                    API_DESIGN: allIssues.filter(i => i.type === 'API_DESIGN').length,
                    OOP: allIssues.filter(i => i.type === 'OOP').length
                };
                
                const summary = Object.entries(byType)
                    .filter(([_, count]) => count > 0)
                    .map(([type, count]) => `${count} ${type.toLowerCase()}`)
                    .join(', ');
                
                vscode.window.showWarningMessage(
                    `⚠️ Found ${allIssues.length} issues: ${summary} (${critical + high} critical/high)`,
                    'View Issues',
                    'Auto-Fix'
                ).then(async selection => {
                    if (selection === 'View Issues') {
                        showVulnerabilitiesPanel(allIssues, document);
                    } else if (selection === 'Auto-Fix') {
                        vscode.commands.executeCommand('aiDevEngineer.autoFix');
                    }
                });

                // Add diagnostics to editor
                addDiagnostics(document, allIssues);
            }
        });
    });

    // ==================== COMMAND: Scan Workspace ====================
    let scanWorkspaceCommand = vscode.commands.registerCommand('aiDevEngineer.scanWorkspace', async () => {
        const tier = await licenseValidator.checkLicense();
        
        if (tier === 'free') {
            vscode.window.showInformationMessage(
                'Workspace scanning is a Pro feature. Upgrade for unlimited scans!',
                'Learn More'
            ).then(selection => {
                if (selection === 'Learn More') {
                    vscode.env.openExternal(vscode.Uri.parse('https://github.com/juanmorellana2021/revolutionary-hotel-platform#ai-security-guardian'));
                }
            });
            return;
        }

        // Scan all JavaScript and PHP files
        const files = await vscode.workspace.findFiles('**/*.{js,php,ts}', '**/node_modules/**');
        
        let totalVulnerabilities = 0;
        let criticalCount = 0;

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Scanning ${files.length} files...`,
            cancellable: false
        }, async (progress) => {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const document = await vscode.workspace.openTextDocument(file);
                const vulnerabilities = securityScanner.scan(document.getText(), file.fsPath);
                
                totalVulnerabilities += vulnerabilities.length;
                criticalCount += vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
                
                if (vulnerabilities.length > 0) {
                    addDiagnostics(document, vulnerabilities);
                }
                
                progress.report({ 
                    increment: (100 / files.length),
                    message: `${i + 1}/${files.length} files`
                });
            }
        });

        vscode.window.showInformationMessage(
            `Scan complete! Found ${totalVulnerabilities} issues (${criticalCount} critical)`,
            'View Problems'
        ).then(selection => {
            if (selection === 'View Problems') {
                vscode.commands.executeCommand('workbench.actions.view.problems');
            }
        });
    });

    // ==================== COMMAND: Auto-Fix ====================
    let autoFixCommand = vscode.commands.registerCommand('aiDevEngineer.autoFix', async () => {
        const tier = await licenseValidator.checkLicense();
        
        if (tier === 'free') {
            vscode.window.showInformationMessage(
                '🔒 Auto-fix is a Pro feature. Coming soon at $9/month!',
                'Enter License Key',
                'Learn More'
            ).then(async selection => {
                if (selection === 'Learn More') {
                    vscode.env.openExternal(vscode.Uri.parse('https://github.com/juanmorellana2021/revolutionary-hotel-platform#ai-security-guardian'));
                } else if (selection === 'Enter License Key') {
                    const key = await vscode.window.showInputBox({
                        prompt: 'Enter your Pro license key',
                        password: true,
                        placeHolder: 'xxxx-xxxx-xxxx-xxxx'
                    });
                    if (key) {
                        await context.secrets.store('licenseKey', key);
                        vscode.window.showInformationMessage('License key saved! Try auto-fix again.');
                    }
                }
            });
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No file is currently open');
            return;
        }

        const document = editor.document;
        const fileContent = document.getText();
        const filePath = document.fileName;

        // Scan for issues
        const vulnerabilities = securityScanner.scan(fileContent, filePath);
        
        if (vulnerabilities.length === 0) {
            vscode.window.showInformationMessage('No security issues to fix!');
            return;
        }

        // Generate fixed version
        const fixedCode = await autoFixer.generateFixedVersion(fileContent, filePath, vulnerabilities);
        
        // Show diff in new editor
        const originalUri = vscode.Uri.parse(`untitled:${filePath}.original`);
        const fixedUri = vscode.Uri.parse(`untitled:${filePath}.fixed`);
        
        await vscode.workspace.openTextDocument(originalUri).then(doc => {
            return vscode.workspace.applyEdit(new vscode.WorkspaceEdit().set(doc.uri, [
                new vscode.TextEdit(new vscode.Range(0, 0, doc.lineCount, 0), fileContent)
            ]));
        });
        
        await vscode.workspace.openTextDocument(fixedUri).then(doc => {
            return vscode.workspace.applyEdit(new vscode.WorkspaceEdit().set(doc.uri, [
                new vscode.TextEdit(new vscode.Range(0, 0, doc.lineCount, 0), fixedCode)
            ]));
        });

        // Show diff
        vscode.commands.executeCommand('vscode.diff', originalUri, fixedUri, 'Security Fixes (Before ← → After)');
        
        vscode.window.showInformationMessage(
            `✅ Fixed ${vulnerabilities.length} security issues!`,
            'Apply Changes'
        ).then(selection => {
            if (selection === 'Apply Changes') {
                const edit = new vscode.WorkspaceEdit();
                edit.replace(
                    document.uri,
                    new vscode.Range(0, 0, document.lineCount, 0),
                    fixedCode
                );
                vscode.workspace.applyEdit(edit);
                vscode.window.showInformationMessage('🎉 Security fixes applied!');
            }
        });
    });

    // ==================== COMMAND: Generate Tests ====================
    let generateTestsCommand = vscode.commands.registerCommand('aiDevEngineer.generateTests', async () => {
        const tier = await licenseValidator.checkLicense();
        
        if (tier === 'free') {
            vscode.window.showInformationMessage(
                '🔒 Test generation is a Pro feature. Coming soon!',
                'Learn More'
            ).then(selection => {
                if (selection === 'Learn More') {
                    vscode.env.openExternal(vscode.Uri.parse('https://github.com/juanmorellana2021/revolutionary-hotel-platform#ai-security-guardian'));
                }
            });
            return;
        }

        vscode.window.showInformationMessage('🚧 Test generation coming in v1.1!');
    });

    // ==================== COMMAND: Load Project Context ====================
    let loadContextCommand = vscode.commands.registerCommand('aiDevEngineer.loadContext', async () => {
        // Look for ai-dev-engineer.json in .vscode folder
        const workspaceFolders = vscode.workspace.workspaceFolders;
        
        if (!workspaceFolders) {
            vscode.window.showWarningMessage('No workspace folder open');
            return;
        }

        const contextFilePath = vscode.Uri.joinPath(
            workspaceFolders[0].uri,
            '.vscode',
            'ai-dev-engineer.json'
        );

        let contextData;
        let contextExists = false;

        try {
            const fileContent = await vscode.workspace.fs.readFile(contextFilePath);
            contextData = JSON.parse(fileContent.toString());
            contextExists = true;
        } catch (error) {
            // File doesn't exist - create template
            contextData = {
                projectName: "New Project",
                improvementPlan: {
                    methodology: "Page-by-page systematic improvements",
                    currentPhase: "Initial Setup",
                    completedPages: [],
                    pagesQueue: []
                },
                securityPatterns: {},
                codeStandards: {},
                nextSteps: []
            };
        }

        // Generate context prompt
        const completedPages = contextData.improvementPlan?.completedPages || [];
        const pagesQueue = contextData.improvementPlan?.pagesQueue || [];
        const securityPatterns = Object.keys(contextData.securityPatterns || {}).join(', ') || 'None yet';
        
        const lastCompleted = completedPages.length > 0 
            ? completedPages[completedPages.length - 1].page 
            : 'None';
        
        const nextPage = pagesQueue.length > 0 ? pagesQueue[0] : 'TBD';

        const contextPrompt = `Context: ${contextData.projectName || 'Project'} - AI Dev Engineer Workflow

📋 Project State:
- Methodology: ${contextData.improvementPlan?.methodology || 'Page-by-page improvements'}
- Current Phase: ${contextData.improvementPlan?.currentPhase || 'Setup'}
- Last Completed: ${lastCompleted}
- Next Target: ${nextPage}

✅ Completed Pages (${completedPages.length}):
${completedPages.map(p => `- ${p.page} (${p.date}): ${p.improvements?.slice(0, 2).join(', ') || 'Improvements applied'}`).join('\n') || '- None yet'}

📚 Security Patterns Applied:
${securityPatterns}

🎯 Code Standards:
${Object.entries(contextData.codeStandards || {}).map(([key, val]) => `- ${key}: ${val}`).join('\n') || '- Read from .vscode/ai-dev-engineer.json'}

⏭️ Next Steps:
${contextData.nextSteps?.slice(0, 3).map((step, i) => `${i + 1}. ${step}`).join('\n') || '1. Analyze next page\n2. Apply security patterns\n3. Test thoroughly'}

📄 Full Context: Read .vscode/ai-dev-engineer.json for complete details

---
Ready to continue! What should we work on?`;

        // Copy to clipboard
        await vscode.env.clipboard.writeText(contextPrompt);

        // Show notification with preview
        const action = await vscode.window.showInformationMessage(
            `✅ Context copied to clipboard! ${contextExists ? 'Based on your ai-dev-engineer.json' : '(Template - customize your JSON file)'}`,
            'Paste in Chat',
            'Edit Context File',
            'View Full Context'
        );

        if (action === 'Edit Context File') {
            if (!contextExists) {
                // Create template file
                const encoder = new TextEncoder();
                await vscode.workspace.fs.writeFile(
                    contextFilePath,
                    encoder.encode(JSON.stringify(contextData, null, 2))
                );
            }
            const doc = await vscode.workspace.openTextDocument(contextFilePath);
            await vscode.window.showTextDocument(doc);
        } else if (action === 'View Full Context') {
            // Show in new untitled file
            const doc = await vscode.workspace.openTextDocument({
                content: contextPrompt,
                language: 'markdown'
            });
            await vscode.window.showTextDocument(doc);
        }
    });

    // ==================== AUTO-SCAN ON SAVE ====================
    let autoScanDisposable = vscode.workspace.onDidSaveTextDocument(async (document) => {
        const config = vscode.workspace.getConfiguration('aiDevEngineer');
        if (config.get('autoScanOnSave')) {
            const vulnerabilities = securityScanner.scan(document.getText(), document.fileName);
            if (vulnerabilities.length > 0) {
                addDiagnostics(document, vulnerabilities);
            }
        }
    });

    // Register all commands
    context.subscriptions.push(
        scanFileCommand,
        scanWorkspaceCommand,
        autoFixCommand,
        generateTestsCommand,
        showDashboardCommand,
        loadContextCommand,
        autoScanDisposable
    );
}

/**
 * Add diagnostics to editor (red squiggly lines)
 */
function addDiagnostics(document, vulnerabilities) {
    const diagnostics = vulnerabilities.map(vuln => {
        const line = Math.max(0, vuln.line - 1); // 0-indexed
        const range = document.lineAt(line).range;
        
        let severity;
        switch (vuln.severity) {
            case 'CRITICAL':
            case 'HIGH':
                severity = vscode.DiagnosticSeverity.Error;
                break;
            case 'MEDIUM':
                severity = vscode.DiagnosticSeverity.Warning;
                break;
            default:
                severity = vscode.DiagnosticSeverity.Information;
        }

        return new vscode.Diagnostic(
            range,
            `[${vuln.severity}] ${vuln.message}`,
            severity
        );
    });

    diagnosticCollection.set(document.uri, diagnostics);
}

/**
 * Show vulnerabilities in panel
 */
function showVulnerabilitiesPanel(vulnerabilities, document) {
    const panel = vscode.window.createWebviewPanel(
        'vulnerabilities',
        'Security Issues',
        vscode.ViewColumn.Beside,
        { enableScripts: true }
    );

    panel.webview.html = getVulnerabilitiesHTML(vulnerabilities, document.fileName);
}

/**
 * Generate HTML for vulnerabilities panel
 */
function getVulnerabilitiesHTML(vulnerabilities, fileName) {
    const items = vulnerabilities.map(v => `
        <div class="vulnerability ${v.severity.toLowerCase()}">
            <div class="header">
                <span class="severity">${v.severity}</span>
                <span class="type">${v.type}</span>
                <span class="line">Line ${v.line}</span>
            </div>
            <div class="message">${v.message}</div>
            ${v.fix ? `<div class="fix">💡 Fix: ${v.fix}</div>` : ''}
        </div>
    `).join('');

    return `<!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
            h1 { font-size: 20px; margin-bottom: 20px; }
            .vulnerability { border-left: 4px solid; padding: 12px; margin-bottom: 12px; background: #f5f5f5; }
            .vulnerability.critical { border-color: #d32f2f; }
            .vulnerability.high { border-color: #f57c00; }
            .vulnerability.medium { border-color: #fbc02d; }
            .vulnerability.low { border-color: #388e3c; }
            .header { display: flex; gap: 12px; margin-bottom: 8px; }
            .severity { font-weight: bold; text-transform: uppercase; }
            .type { color: #666; }
            .line { color: #666; font-size: 12px; }
            .message { margin-bottom: 8px; }
            .fix { font-size: 12px; color: #1976d2; margin-top: 8px; }
        </style>
    </head>
    <body>
        <h1>🛡️ Security Issues in ${fileName}</h1>
        ${items}
    </body>
    </html>`;
}

/**
 * Generate HTML for dashboard
 */
function getDashboardHTML() {
    return `<!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 20px; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px; }
            .stat { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 36px; font-weight: bold; margin-bottom: 8px; }
            .stat-label { color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <h1>🛡️ AI Dev Engineer Dashboard</h1>
        <div class="stats">
            <div class="stat">
                <div class="stat-value">0</div>
                <div class="stat-label">Files Scanned</div>
            </div>
            <div class="stat">
                <div class="stat-value">0</div>
                <div class="stat-label">Issues Found</div>
            </div>
            <div class="stat">
                <div class="stat-value">0</div>
                <div class="stat-label">Issues Fixed</div>
            </div>
        </div>
        <p>Start scanning files to see your security metrics!</p>
    </body>
    </html>`;
}

/**
 * Show context welcome message on startup
 */
async function showContextWelcome(context) {
    // If we have loaded project context from memory-bank, show it
    if (projectContext && contextLoader) {
        const formatted = contextLoader.formatContext();
        
        const panel = vscode.window.createWebviewPanel(
            'aidevpilotContext',
            '📋 AIDevPilot - Project Context',
            vscode.ViewColumn.Two,
            {}
        );

        panel.webview.html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 20px;
                        background: #1e1e1e;
                        color: #d4d4d4;
                    }
                    h1 { color: #569cd6; }
                    h2 { color: #4ec9b0; margin-top: 20px; }
                    ul { list-style-type: none; padding-left: 0; }
                    li { 
                        margin: 5px 0; 
                        padding: 8px 12px;
                        background: #252526;
                        border-left: 3px solid #007acc;
                        border-radius: 3px;
                    }
                    .badge {
                        display: inline-block;
                        padding: 4px 8px;
                        background: #0e639c;
                        border-radius: 3px;
                        font-size: 12px;
                        margin-right: 8px;
                    }
                </style>
            </head>
            <body>
                <h1>🤖 AIDevPilot - Project Context Loaded</h1>
                <p>Context automatically loaded from <code>memory-bank/</code></p>
                ${formatted.replace(/\n/g, '<br>').replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/^- (.+)$/gm, '<li>$1</li>')}
                <hr>
                <p><strong>💡 Smart Scanning:</strong> AIDevPilot now knows your project patterns and will give context-aware suggestions!</p>
            </body>
            </html>
        `;

        return;
    }

    // Fallback to old behavior
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;

    const contextFilePath = vscode.Uri.joinPath(
        workspaceFolders[0].uri,
        '.vscode',
        'ai-dev-engineer.json'
    );

    let contextExists = false;
    try {
        await vscode.workspace.fs.readFile(contextFilePath);
        contextExists = true;
    } catch (error) {
        // File doesn't exist
        return;
    }

    if (contextExists) {
        const action = await vscode.window.showInformationMessage(
            '🚀 AI Dev Engineer: Ready! Context available for new chat sessions.',
            'Copy Context Now',
            'Don\'t Show Again'
        );

        if (action === 'Copy Context Now') {
            vscode.commands.executeCommand('aiDevEngineer.loadContext');
        } else if (action === 'Don\'t Show Again') {
            const config = vscode.workspace.getConfiguration('aiDevEngineer');
            await config.update('autoShowContextOnStartup', false, true);
        }
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
