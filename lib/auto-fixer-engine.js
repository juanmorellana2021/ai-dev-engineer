const vscode = require('vscode');
const fs = require('fs');

class AutoFixerEngine {
    async fixWithAgent(agentId, agentResults) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            throw new Error('No file open');
        }

        const document = editor.document;
        const fileContent = document.getText();
        let fixes = 0;

        switch(agentId) {
            case 'inputvalidator':
                fixes = await this.fixInputValidation(document, agentResults);
                break;
            case 'formhardener':
                fixes = await this.fixCSRFTokens(document, agentResults);
                break;
            case 'uienhancer':
                fixes = await this.fixUIIssues(document, agentResults);
                break;
            case 'bughunter':
                fixes = await this.fixBugs(document, agentResults);
                break;
            default:
                // For other agents, show suggestion to use Copilot
                vscode.window.showInformationMessage(
                    `💡 ${agentId} found issues. Use @aidevpilot in chat to apply fixes with GitHub Copilot.`
                );
                return 0;
        }

        return fixes;
    }

    async fixInputValidation(document, results) {
        const edit = new vscode.WorkspaceEdit();
        let fixes = 0;

        // Add cleanInput function if not exists
        const fileContent = document.getText();
        if (!fileContent.includes('function cleanInput(')) {
            const insertPosition = new vscode.Position(0, 0);
            const cleanInputCode = `<?php
function cleanInput($data, $type = 'string') {
    $data = trim($data);
    $data = stripslashes($data);
    switch($type) {
        case 'int': return filter_var($data, FILTER_VALIDATE_INT);
        case 'float': return filter_var($data, FILTER_VALIDATE_FLOAT);
        case 'email': return filter_var($data, FILTER_VALIDATE_EMAIL);
        case 'string':
        default: return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }
}
?>

`;
            edit.insert(document.uri, insertPosition, cleanInputCode);
            fixes++;
        }

        // Auto-wrap $_POST and $_GET with cleanInput
        const lines = fileContent.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Find $_POST['xxx'] or $_GET['xxx'] not already wrapped
            const postMatches = line.match(/\$_POST\['([^']+)'\]/g);
            const getMatches = line.match(/\$_GET\['([^']+)'\]/g);
            
            if (postMatches) {
                for (const match of postMatches) {
                    if (!line.includes(`cleanInput(${match}`)) {
                        const range = new vscode.Range(
                            new vscode.Position(i, line.indexOf(match)),
                            new vscode.Position(i, line.indexOf(match) + match.length)
                        );
                        edit.replace(document.uri, range, `cleanInput(${match}, 'string')`);
                        fixes++;
                    }
                }
            }
            
            if (getMatches) {
                for (const match of getMatches) {
                    if (!line.includes(`cleanInput(${match}`)) {
                        const range = new vscode.Range(
                            new vscode.Position(i, line.indexOf(match)),
                            new vscode.Position(i, line.indexOf(match) + match.length)
                        );
                        edit.replace(document.uri, range, `cleanInput(${match}, 'string')`);
                        fixes++;
                    }
                }
            }
        }

        await vscode.workspace.applyEdit(edit);
        return fixes;
    }

    async fixCSRFTokens(document, results) {
        const edit = new vscode.WorkspaceEdit();
        let fixes = 0;

        const fileContent = document.getText();
        const lines = fileContent.split('\n');

        // Add CSRF functions at top if not exists
        if (!fileContent.includes('csrf_token')) {
            const insertPosition = new vscode.Position(0, 0);
            const csrfCode = `<?php
session_start();

// CSRF Protection
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

function validateCSRF() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
            die(json_encode(['success' => false, 'message' => 'Invalid CSRF token']));
        }
    }
}
?>

`;
            edit.insert(document.uri, insertPosition, csrfCode);
            fixes++;
        }

        // Find forms and add CSRF token input
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Find <form with method="post"
            if (line.includes('<form') && line.toLowerCase().includes('method') && line.toLowerCase().includes('post')) {
                // Check next 10 lines for csrf_token
                let hasToken = false;
                for (let j = i; j < Math.min(i + 15, lines.length); j++) {
                    if (lines[j].includes('csrf_token')) {
                        hasToken = true;
                        break;
                    }
                }
                
                if (!hasToken) {
                    // Add token after form tag
                    const insertPosition = new vscode.Position(i + 1, 0);
                    const tokenInput = `        <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">\n`;
                    edit.insert(document.uri, insertPosition, tokenInput);
                    fixes++;
                }
            }
        }

        await vscode.workspace.applyEdit(edit);
        return fixes;
    }

    async fixUIIssues(document, results) {
        // UI fixes are subjective - recommend using Copilot
        vscode.window.showInformationMessage(
            '🎨 UIEnhancer found design improvements. Use @aidevpilot in chat to apply with GitHub Copilot.'
        );
        return 0;
    }

    async fixBugs(document, results) {
        const edit = new vscode.WorkspaceEdit();
        let fixes = 0;

        const fileContent = document.getText();
        const lines = fileContent.split('\n');

        // Remove "Coming soon" alerts
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('alert') && line.includes('Coming soon')) {
                const range = new vscode.Range(
                    new vscode.Position(i, 0),
                    new vscode.Position(i + 1, 0)
                );
                edit.delete(document.uri, range);
                fixes++;
            }
        }

        await vscode.workspace.applyEdit(edit);
        return fixes;
    }

    async fixAll(swarmResults) {
        let totalFixes = 0;
        
        for (const [agentId, results] of Object.entries(swarmResults)) {
            if (results && results.issues > 0) {
                const fixes = await this.fixWithAgent(agentId, results);
                totalFixes += fixes;
            }
        }

        return totalFixes;
    }
}

module.exports = AutoFixerEngine;
