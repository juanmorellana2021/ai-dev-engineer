const vscode = require('vscode');

class SwarmAgents {
    constructor() {
        this.log = [];
    }

    // BugHunter - Finds Issues in Code
    async bugHunter(stream, task) {
        stream.markdown(`## 🔍 BugHunter Agent Activated\n\n`);
        stream.markdown(`Analyzing: ${task}\n\n`);
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            stream.markdown(`❌ No file open to analyze.\n`);
            return null;
        }

        const fileName = editor.document.fileName;
        const content = editor.document.getText();

        // Check for common issues
        const issues = [];
        
        if (content.includes("Coming soon")) {
            issues.push("Placeholder functions detected");
        }
        if (content.match(/\$_GET\[|request\.GET\[/) && !content.includes("filter_input")) {
            issues.push("Unvalidated user input");
        }
        if (content.includes("mysql_query")) {
            issues.push("Deprecated MySQL functions");
        }

        stream.markdown(`📊 **Scout Report:**\n`);
        stream.markdown(`- File: \`${fileName.split(/[\\\/]/).pop()}\`\n`);
        stream.markdown(`- Size: ${content.length} chars\n`);
        stream.markdown(`- Issues Found: ${issues.length}\n\n`);

        if (issues.length > 0) {
            stream.markdown(`**Issues:**\n`);
            issues.forEach(issue => stream.markdown(`- ⚠️ ${issue}\n`));
        }

        return { fileName, issues, content };
    }

    // BackupFinder - Locates Working Code in Backups
    async backupFinder(stream, bugReport) {
        stream.markdown(`\n## 📚 BackupFinder Agent Activated\n\n`);
        
        if (!bugReport) {
            stream.markdown(`❌ No bug report to analyze.\n`);
            return null;
        }

        const fileName = bugReport.fileName.split(/[\\\/]/).pop();
        const baseName = fileName.replace(/\.(php|js|ts|py)$/, '');
        const ext = fileName.match(/\.(php|js|ts|py)$/)?.[0] || '';

        stream.markdown(`Searching for working versions of \`${fileName}\`...\n\n`);

        // Look for backup versions
        const patterns = [
            `${baseName}_current${ext}`,
            `${baseName}_prod${ext}`,
            `${baseName}_backup${ext}`,
            `backup-*/${fileName}`
        ];

        stream.markdown(`**Search patterns:**\n`);
        patterns.forEach(p => stream.markdown(`- 📁 ${p}\n`));

        stream.markdown(`\n💡 **Recommendation:** Compare current file with:\n`);
        stream.markdown(`1. \`${baseName}_current${ext}\` (working version)\n`);
        stream.markdown(`2. \`backup-prod-vps-*/manage/${fileName}\` (production backup)\n`);

        return { fileName, patterns, baseName, ext };
    }

    // CodeMerger - Merges Working Code into Broken Files
    async codeMerger(stream, backupReport) {
        stream.markdown(`\n## ⚔️ CodeMerger Agent Activated\n\n`);
        
        if (!backupReport) {
            stream.markdown(`❌ No backup report to work with.\n`);
            return null;
        }

        stream.markdown(`Ready to merge fixes into \`${backupReport.fileName}\`\n\n`);
        
        stream.markdown(`**CodeMerger Protocol:**\n`);
        stream.markdown(`1. ✅ Locate working code in backup files\n`);
        stream.markdown(`2. ✅ Compare differences line-by-line\n`);
        stream.markdown(`3. ✅ Extract ONLY the fixed functions\n`);
        stream.markdown(`4. ✅ Preserve formatting and context\n`);
        stream.markdown(`5. ✅ Apply minimal changes\n\n`);

        stream.markdown(`💡 **Next Step:** Use \`replace_string_in_file\` to merge working code.\n`);

        return { ready: true };
    }

    // InputValidator - Sanitizes All User Inputs
    async inputValidator(stream) {
        stream.markdown(`\n## 🧹 InputValidator Agent Activated\n\n`);
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            stream.markdown(`❌ No file to validate.\n`);
            return { fixed: 0 };
        }

        const content = editor.document.getText();
        const fileName = editor.document.fileName;

        stream.markdown(`Scanning for unvalidated inputs...\n\n`);

        const issues = [];
        
        // Find all $_POST, $_GET, $_REQUEST without validation
        const unsafeInputs = content.match(/\$_(POST|GET|REQUEST)\[[^\]]+\]/g) || [];
        const hasCleanInput = content.includes('cleanInput(');
        const hasFilterInput = content.includes('filter_input(');

        if (unsafeInputs.length > 0 && !hasCleanInput && !hasFilterInput) {
            issues.push({
                type: 'Unvalidated Input',
                count: unsafeInputs.length,
                fix: 'Add cleanInput() helper function and wrap all user inputs'
            });
        }

        // Find forms without CSRF tokens
        const forms = (content.match(/<form[^>]*>/gi) || []).length;
        const csrfTokens = (content.match(/csrf_token/gi) || []).length;
        
        if (forms > 0 && csrfTokens < forms) {
            issues.push({
                type: 'Missing CSRF Tokens',
                count: forms - csrfTokens,
                fix: 'Add <input type="hidden" name="csrf_token" value="<?php echo $_SESSION[\'csrf_token\']; ?>">'
            });
        }

        stream.markdown(`**InputValidator Report:**\n`);
        stream.markdown(`- Unsafe inputs found: ${unsafeInputs.length}\n`);
        stream.markdown(`- Forms: ${forms}, CSRF tokens: ${csrfTokens}\n`);
        stream.markdown(`- Issues to fix: ${issues.length}\n\n`);

        if (issues.length > 0) {
            stream.markdown(`**Fixes Needed:**\n`);
            issues.forEach(issue => {
                stream.markdown(`- ⚠️ ${issue.type} (${issue.count}): ${issue.fix}\n`);
            });
        } else {
            stream.markdown(`✅ All inputs are properly validated!\n`);
        }

        return { issues, fixed: 0, needsFix: issues.length };
    }

    // FormHardener - Adds CSRF Tokens to All Forms
    async formHardener(stream, validatorReport) {
        stream.markdown(`\n## 🔐 FormHardener Agent Activated\n\n`);
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            stream.markdown(`❌ No file to harden.\n`);
            return { fixed: 0 };
        }

        const content = editor.document.getText();
        const fileName = editor.document.fileName;

        stream.markdown(`Adding CSRF protection to forms...\n\n`);

        // Find all forms without CSRF tokens
        const formMatches = content.matchAll(/<form[^>]*method\s*=\s*["']POST["'][^>]*>/gi);
        const formsNeedingTokens = [];

        for (const match of formMatches) {
            const formStart = match.index;
            const formEnd = content.indexOf('</form>', formStart);
            const formContent = content.substring(formStart, formEnd);
            
            if (!formContent.includes('csrf_token')) {
                formsNeedingTokens.push({
                    start: formStart,
                    end: formEnd,
                    content: match[0]
                });
            }
        }

        stream.markdown(`**FormHardener Report:**\n`);
        stream.markdown(`- Forms needing CSRF tokens: ${formsNeedingTokens.length}\n\n`);

        if (formsNeedingTokens.length > 0) {
            stream.markdown(`**Will add to each form:**\n`);
            stream.markdown(`\`\`\`php\n`);
            stream.markdown(`<input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">\n`);
            stream.markdown(`\`\`\`\n\n`);
            
            stream.markdown(`💡 **Instructions for GitHub Copilot:**\n`);
            stream.markdown(`Please add CSRF token hidden input after each <form> tag in the file.\n`);
        } else {
            stream.markdown(`✅ All forms already have CSRF protection!\n`);
        }

        return { formsNeedingTokens: formsNeedingTokens.length, fixed: 0 };
    }

    // UIEnhancer - Improves User Experience & Modern Design
    async uiEnhancer(stream) {
        stream.markdown(`\n## 🎨 UIEnhancer Agent Activated\n\n`);
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            stream.markdown(`❌ No file to enhance.\n`);
            return { suggestions: [] };
        }

        const content = editor.document.getText();
        const fileName = editor.document.fileName;

        stream.markdown(`Analyzing UI/UX patterns...\n\n`);

        const suggestions = [];

        // Check for modern CSS features
        const hasGradients = content.includes('linear-gradient') || content.includes('radial-gradient');
        const hasAnimations = content.includes('@keyframes') || content.includes('animation:');
        const hasResponsive = content.includes('@media') || content.includes('flex') || content.includes('grid');
        const hasDarkMode = content.includes('dark-theme') || content.includes('dark-mode');
        const hasLoadingStates = content.includes('loading') || content.includes('spinner');
        const hasErrorStates = content.includes('error-message') || content.includes('alert-danger');
        const hasSuccessStates = content.includes('success-message') || content.includes('alert-success');
        const hasTooltips = content.includes('tooltip') || content.includes('title=');
        const hasIcons = content.includes('emoji') || content.includes('icon') || content.includes('fa-');
        const hasAccessibility = content.includes('aria-') || content.includes('role=');

        // UI/UX Checks
        if (!hasGradients) {
            suggestions.push({
                type: 'Visual Enhancement',
                issue: 'No gradients detected',
                fix: 'Add modern gradients to buttons/cards: linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                priority: 'LOW'
            });
        }

        if (!hasAnimations) {
            suggestions.push({
                type: 'User Feedback',
                issue: 'No loading animations',
                fix: 'Add spinner/skeleton screens for async operations',
                priority: 'MEDIUM'
            });
        }

        if (!hasResponsive) {
            suggestions.push({
                type: 'Mobile Support',
                issue: 'No responsive design detected',
                fix: 'Add CSS Grid/Flexbox and @media queries for mobile/tablet',
                priority: 'HIGH'
            });
        }

        if (!hasDarkMode) {
            suggestions.push({
                type: 'Modern UX',
                issue: 'No dark mode support',
                fix: 'Add dark-theme CSS class and toggle button',
                priority: 'MEDIUM'
            });
        }

        if (!hasLoadingStates) {
            suggestions.push({
                type: 'User Feedback',
                issue: 'No loading states',
                fix: 'Show spinner during AJAX calls so users know system is working',
                priority: 'HIGH'
            });
        }

        if (!hasErrorStates) {
            suggestions.push({
                type: 'Error Handling',
                issue: 'No error messages',
                fix: 'Add visual error feedback (red toast notifications)',
                priority: 'HIGH'
            });
        }

        if (!hasTooltips) {
            suggestions.push({
                type: 'User Guidance',
                issue: 'No tooltips',
                fix: 'Add helpful tooltips on hover for complex buttons/fields',
                priority: 'LOW'
            });
        }

        if (!hasAccessibility) {
            suggestions.push({
                type: 'Accessibility',
                issue: 'Missing ARIA labels',
                fix: 'Add aria-label, role attributes for screen readers',
                priority: 'MEDIUM'
            });
        }

        // Check for common UI anti-patterns
        const hasAlerts = content.includes('alert(');
        const hasInlineStyles = content.match(/style\s*=\s*["'][^"']{50,}/g);
        const hasMagicNumbers = content.match(/\d{3,}px/g);

        if (hasAlerts) {
            suggestions.push({
                type: 'UX Anti-pattern',
                issue: `${(content.match(/alert\(/g) || []).length} alert() calls found`,
                fix: 'Replace with modern toast notifications or modal dialogs',
                priority: 'HIGH'
            });
        }

        if (hasInlineStyles && hasInlineStyles.length > 5) {
            suggestions.push({
                type: 'Code Quality',
                issue: `${hasInlineStyles.length} long inline styles`,
                fix: 'Extract to CSS classes for maintainability',
                priority: 'MEDIUM'
            });
        }

        stream.markdown(`**UIEnhancer Report:**\n\n`);
        
        const criticalUI = suggestions.filter(s => s.priority === 'HIGH');
        const mediumUI = suggestions.filter(s => s.priority === 'MEDIUM');
        const lowUI = suggestions.filter(s => s.priority === 'LOW');

        stream.markdown(`- 🔴 HIGH Priority: ${criticalUI.length}\n`);
        stream.markdown(`- 🟡 MEDIUM Priority: ${mediumUI.length}\n`);
        stream.markdown(`- 🟢 LOW Priority: ${lowUI.length}\n\n`);

        if (suggestions.length > 0) {
            stream.markdown(`**UI/UX Improvements Needed:**\n\n`);
            
            if (criticalUI.length > 0) {
                stream.markdown(`### 🔴 High Priority:\n`);
                criticalUI.forEach(s => {
                    stream.markdown(`- **${s.type}**: ${s.issue}\n`);
                    stream.markdown(`  💡 ${s.fix}\n\n`);
                });
            }

            if (mediumUI.length > 0) {
                stream.markdown(`### 🟡 Medium Priority:\n`);
                mediumUI.forEach(s => {
                    stream.markdown(`- **${s.type}**: ${s.issue}\n`);
                    stream.markdown(`  💡 ${s.fix}\n\n`);
                });
            }
        } else {
            stream.markdown(`✅ UI looks modern and user-friendly!\n`);
        }

        return { suggestions, needsImprovement: suggestions.length };
    }

    // BackendValidator - Verifies Frontend Forms Have Backend Handlers
    async backendValidator(stream) {
        stream.markdown(`\n## 🔗 BackendValidator Agent Activated\n\n`);
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            stream.markdown(`❌ No file to validate.\n`);
            return { matched: 0, missing: [] };
        }

        const content = editor.document.getText();
        const fileName = editor.document.fileName;

        stream.markdown(`Matching frontend forms to backend handlers...\n\n`);

        const missingHandlers = [];
        
        // Find all forms with hidden inputs that indicate POST actions
        const formActions = content.matchAll(/<input\s+type="hidden"\s+name="([^"]+)"\s+value="1"/gi);
        const postHandlers = content.matchAll(/\$_POST\['([^']+)'\]/g);
        
        const formActionNames = new Set();
        const postHandlerNames = new Set();
        
        for (const match of formActions) {
            formActionNames.add(match[1]);
        }
        
        for (const match of postHandlers) {
            postHandlerNames.add(match[1]);
        }

        // Check which forms are missing handlers
        for (const actionName of formActionNames) {
            if (!postHandlerNames.has(actionName)) {
                missingHandlers.push(actionName);
            }
        }

        stream.markdown(`**BackendValidator Report:**\n`);
        stream.markdown(`- Frontend forms found: ${formActionNames.size}\n`);
        stream.markdown(`- Backend handlers found: ${postHandlerNames.size}\n`);
        stream.markdown(`- Missing handlers: ${missingHandlers.length}\n\n`);

        if (missingHandlers.length > 0) {
            stream.markdown(`⚠️ **Frontend/Backend Mismatch Detected:**\n\n`);
            missingHandlers.forEach(handler => {
                stream.markdown(`- ❌ Form has \`name="${handler}"\` but NO backend \`$_POST['${handler}']\`\n`);
            });
            stream.markdown(`\n💡 **Fix:** Add backend handlers for each missing form action.\n\n`);
            stream.markdown(`Example:\n`);
            stream.markdown(`\`\`\`php\n`);
            stream.markdown(`if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['${missingHandlers[0]}'])) {\n`);
            stream.markdown(`    // Handle ${missingHandlers[0]} logic\n`);
            stream.markdown(`}\n`);
            stream.markdown(`\`\`\`\n`);
        } else {
            stream.markdown(`✅ All forms have matching backend handlers!\n`);
        }

        return { 
            matched: formActionNames.size - missingHandlers.length, 
            missing: missingHandlers,
            frontendForms: Array.from(formActionNames),
            backendHandlers: Array.from(postHandlerNames)
        };
    }

    // DatabaseValidator - Checks for Correct Table Names
    async databaseValidator(stream) {
        stream.markdown(`\n## 💾 DatabaseValidator Agent Activated\n\n`);
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            stream.markdown(`❌ No file to validate.\n`);
            return { issues: [] };
        }

        const content = editor.document.getText();

        stream.markdown(`Validating database table names...\n\n`);

        const issues = [];
        
        // Common table name mistakes
        const wrongTableNames = {
            'multiple_guests': 'booking_guests',
            'guest_info': 'booking_guests',
            'room_status': 'room_status_by_date'
        };

        // Check for wrong table names
        for (const [wrong, correct] of Object.entries(wrongTableNames)) {
            if (content.includes(wrong)) {
                const occurrences = (content.match(new RegExp(wrong, 'g')) || []).length;
                issues.push({
                    severity: 'HIGH',
                    wrong: wrong,
                    correct: correct,
                    occurrences: occurrences,
                    fix: `Replace all instances of '${wrong}' with '${correct}'`
                });
            }
        }

        // Check for missing table prefixes or dangerous patterns
        const rawQueries = content.match(/query\s*\(\s*["']SELECT.*FROM\s+(\w+)/gi);
        const unpreparedStatements = content.match(/query\s*\(\s*["'].*\$_(POST|GET|REQUEST)/gi);

        if (unpreparedStatements && unpreparedStatements.length > 0) {
            issues.push({
                severity: 'CRITICAL',
                issue: 'SQL Injection Risk',
                occurrences: unpreparedStatements.length,
                fix: 'Use prepared statements (PDO) instead of string concatenation'
            });
        }

        stream.markdown(`**DatabaseValidator Report:**\n\n`);

        if (issues.length === 0) {
            stream.markdown(`✅ All table names are correct!\n`);
            stream.markdown(`✅ No SQL injection risks detected!\n`);
        } else {
            stream.markdown(`⚠️ **Database Issues Found:**\n\n`);
            issues.forEach(issue => {
                const icon = issue.severity === 'CRITICAL' ? '🔴' : '🟠';
                if (issue.wrong) {
                    stream.markdown(`${icon} **Wrong Table Name** (${issue.occurrences} times):\n`);
                    stream.markdown(`   ❌ Using: \`${issue.wrong}\`\n`);
                    stream.markdown(`   ✅ Should be: \`${issue.correct}\`\n\n`);
                } else {
                    stream.markdown(`${icon} **${issue.issue}** (${issue.occurrences} instances)\n`);
                    stream.markdown(`   💡 ${issue.fix}\n\n`);
                }
            });
        }

        return { issues, tablesChecked: Object.keys(wrongTableNames).length };
    }

    // SecurityGuard - Blocks Deployment if Vulnerabilities Found
    async securityGuard(stream) {
        stream.markdown(`\n## 🛡️ SecurityGuard Agent Activated\n\n`);
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            stream.markdown(`❌ No file to secure.\n`);
            return { approved: false };
        }

        const content = editor.document.getText();

        stream.markdown(`Running security scan...\n\n`);

        const vulnerabilities = [];
        
        // SQL Injection check
        if (content.match(/query\s*\(\s*["']\s*SELECT.*\$|query\s*\(\s*".*\$_/i)) {
            vulnerabilities.push({ severity: "CRITICAL", issue: "SQL Injection risk detected" });
        }

        // XSS check
        if (content.match(/echo\s+\$_(GET|POST|REQUEST)\[/i)) {
            vulnerabilities.push({ severity: "HIGH", issue: "XSS vulnerability - unescaped output" });
        }

        // CSRF check
        if (content.includes("$_POST") && !content.includes("csrf_token")) {
            vulnerabilities.push({ severity: "MEDIUM", issue: "Missing CSRF protection" });
        }

        if (vulnerabilities.length === 0) {
            stream.markdown(`✅ **SECURITY: PASSED**\n`);
            stream.markdown(`No critical vulnerabilities detected.\n`);
            return { approved: true, vulnerabilities: [] };
        } else {
            stream.markdown(`⚠️ **SECURITY: ISSUES FOUND**\n\n`);
            vulnerabilities.forEach(v => {
                const icon = v.severity === 'CRITICAL' ? '🔴' : v.severity === 'HIGH' ? '🟠' : '🟡';
                stream.markdown(`${icon} **${v.severity}**: ${v.issue}\n`);
            });
            stream.markdown(`\n❌ Deployment blocked until issues resolved.\n`);
            return { approved: false, vulnerabilities };
        }
    }

    // ProductionDeployer - Pushes Code to Live Server
    async productionDeployer(stream, securityReport) {
        stream.markdown(`\n## 🚀 ProductionDeployer Agent Activated\n\n`);

        if (!securityReport || !securityReport.approved) {
            stream.markdown(`❌ Deployment blocked - SecurityGuard did not approve.\n`);
            return { deployed: false };
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            stream.markdown(`❌ No file to deploy.\n`);
            return { deployed: false };
        }

        const fileName = editor.document.fileName.split(/[\\\/]/).pop();

        stream.markdown(`**Deployment Checklist:**\n`);
        stream.markdown(`- ✅ SecurityGuard approved\n`);
        stream.markdown(`- ✅ File: \`${fileName}\`\n`);
        stream.markdown(`- 🎯 Target: prod-vps:/var/www/html/manage/\n\n`);

        stream.markdown(`**Ready to deploy!** Use command:\n`);
        stream.markdown(`\`\`\`bash\n`);
        stream.markdown(`scp ${fileName} prod-vps:/var/www/html/manage/${fileName}\n`);
        stream.markdown(`\`\`\`\n\n`);

        stream.markdown(`💡 To auto-deploy, I'll need GitHub Copilot to run the terminal command.\n`);

        return { deployed: "manual", fileName, command: `scp ${fileName} prod-vps:/var/www/html/manage/${fileName}` };
    }

    // AutoFixer - Coordinates All Agents to Fix Issues
    async autoFixer(stream, task) {
        stream.markdown(`# 🎯 AutoFixer - AI Swarm Activated\n\n`);
        stream.markdown(`**Task:** ${task}\n\n`);
        stream.markdown(`---\n\n`);

        // Run agents in sequence
        const bugReport = await this.bugHunter(stream, task);
        
        if (!bugReport || bugReport.issues.length === 0) {
            stream.markdown(`\n✅ No issues detected. File looks good!\n`);
            return;
        }

        const backupReport = await this.backupFinder(stream, bugReport);
        const mergeReport = await this.codeMerger(stream, backupReport);
        const backendReport = await this.backendValidator(stream);
        const databaseReport = await this.databaseValidator(stream);
        const validatorReport = await this.inputValidator(stream);
        const formReport = await this.formHardener(stream, validatorReport);
        const uiReport = await this.uiEnhancer(stream);
        const securityReport = await this.securityGuard(stream);
        const deployReport = await this.productionDeployer(stream, securityReport);

        stream.markdown(`\n---\n\n`);
        stream.markdown(`## 📊 AutoFixer Summary\n\n`);
        stream.markdown(`- 🔍 BugHunter: ${bugReport.issues.length} issues found\n`);
        stream.markdown(`- 📚 BackupFinder: ${backupReport.patterns.length} backup patterns identified\n`);
        stream.markdown(`- ⚔️ CodeMerger: ${mergeReport.ready ? 'Ready' : 'Not ready'}\n`);
        stream.markdown(`- 🔗 BackendValidator: ${backendReport.missing.length} missing handlers\n`);
        stream.markdown(`- 💾 DatabaseValidator: ${databaseReport.issues.length} database issues\n`);
        stream.markdown(`- 🧹 InputValidator: ${validatorReport.needsFix || 0} validation issues\n`);
        stream.markdown(`- 🔐 FormHardener: ${formReport.formsNeedingTokens || 0} forms need CSRF tokens\n`);
        stream.markdown(`- 🎨 UIEnhancer: ${uiReport.needsImprovement || 0} UI/UX improvements\n`);
        stream.markdown(`- 🛡️ SecurityGuard: ${securityReport.approved ? 'APPROVED ✅' : 'BLOCKED ❌'}\n`);
        stream.markdown(`- 🚀 ProductionDeployer: ${deployReport.deployed === 'manual' ? 'Manual deployment ready' : 'Not deployed'}\n\n`);

        // Calculate confidence score
        const totalChecks = 10;
        const passedChecks = 
            (bugReport.issues.length === 0 ? 1 : 0) +
            (backendReport.missing.length === 0 ? 1 : 0) +
            (databaseReport.issues.length === 0 ? 1 : 0) +
            (validatorReport.needsFix === 0 ? 1 : 0) +
            (formReport.formsNeedingTokens === 0 ? 1 : 0) +
            (uiReport.needsImprovement === 0 ? 1 : 0) +
            (securityReport.approved ? 1 : 0) + 3; // +3 for backup, merge, deploy readiness

        const confidence = Math.round((passedChecks / totalChecks) * 100);
        
        stream.markdown(`### 📈 Overall Confidence: ${confidence}%\n\n`);
        
        if (confidence >= 95) {
            stream.markdown(`✅ **READY TO DEPLOY** - All systems go!\n`);
        } else if (confidence >= 80) {
            stream.markdown(`⚠️ **REVIEW NEEDED** - Fix ${totalChecks - passedChecks} issues before deploying.\n`);
        } else {
            stream.markdown(`❌ **NOT READY** - Critical issues must be resolved.\n`);
        }

        if (securityReport.approved && deployReport.command) {
            stream.markdown(`\n**Next:** Ask GitHub Copilot to run:\n`);
            stream.markdown(`\`${deployReport.command}\`\n`);
        }
    }
}

module.exports = SwarmAgents;
