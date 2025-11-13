const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const AutoFixerEngine = require('./auto-fixer-engine');

class DashboardPanel {
    constructor(context) {
        this.context = context;
        this.panel = null;
        this.autoFixer = new AutoFixerEngine();
    }

    show() {
        if (this.panel) {
            this.panel.reveal();
        } else {
            this.createPanel();
        }
    }

    createPanel() {
        this.panel = vscode.window.createWebviewPanel(
            'aidevpilotDashboard',
            '🤖 AIDevPilot Dashboard',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.getWebviewContent();

        this.panel.onDidDispose(() => {
            this.panel = null;
        });

        // Handle messages from webview
        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'runAgent':
                        this.runAgent(message.agentId);
                        break;
                    case 'fixAgent':
                        this.fixAgent(message.agentId);
                        break;
                    case 'runFullSwarm':
                        this.runFullSwarm();
                        break;
                    case 'fixAll':
                        this.fixAll();
                        break;
                    case 'scanCurrentFile':
                        this.scanCurrentFile();
                        break;
                }
            }
        );
    }

    getWebviewContent() {
        const htmlPath = path.join(this.context.extensionPath, 'dashboard.html');
        let html = fs.readFileSync(htmlPath, 'utf8');

        // Replace script section with VS Code message passing
        const scriptReplacement = `
        <script>
            const vscode = acquireVsCodeApi();

            const agents = [
                {
                    id: 'bughunter',
                    name: 'BugHunter',
                    icon: '🔍',
                    description: 'Detects issues, placeholders, and code smells',
                    status: 'idle',
                    results: null
                },
                {
                    id: 'backupfinder',
                    name: 'BackupFinder',
                    icon: '📚',
                    description: 'Locates working versions in backups and git history',
                    status: 'idle',
                    results: null
                },
                {
                    id: 'codemerger',
                    name: 'CodeMerger',
                    icon: '⚔️',
                    description: 'Merges working code from backups into broken files',
                    status: 'idle',
                    results: null
                },
                {
                    id: 'inputvalidator',
                    name: 'InputValidator',
                    icon: '🧹',
                    description: 'Validates all user inputs and sanitizes data',
                    status: 'idle',
                    results: null
                },
                {
                    id: 'formhardener',
                    name: 'FormHardener',
                    icon: '🔐',
                    description: 'Adds CSRF protection to all POST forms',
                    status: 'idle',
                    results: null
                },
                {
                    id: 'uienhancer',
                    name: 'UIEnhancer',
                    icon: '🎨',
                    description: 'Improves UX with modern design patterns',
                    status: 'idle',
                    results: null
                },
                {
                    id: 'securityguard',
                    name: 'SecurityGuard',
                    icon: '🛡️',
                    description: 'Blocks deployment if vulnerabilities detected',
                    status: 'idle',
                    results: null
                },
                {
                    id: 'productiondeployer',
                    name: 'ProductionDeployer',
                    icon: '🚀',
                    description: 'Deploys approved code to production server',
                    status: 'idle',
                    results: null
                }
            ];

            let stats = {
                totalScans: 0,
                issuesFound: 0,
                issuesFixed: 0,
                deployments: 0
            };

            function renderAgents() {
                const grid = document.getElementById('agents-grid');
                grid.innerHTML = agents.map(agent => \`
                    <div class="agent-card \${agent.status !== 'idle' ? agent.status : ''} \${agent.results ? 'has-results' : ''}" 
                         id="agent-\${agent.id}">
                        <span class="agent-icon">\${agent.icon}</span>
                        <div class="agent-name">\${agent.name}</div>
                        <div class="agent-description">\${agent.description}</div>
                        <span class="agent-status \${agent.status}">\${agent.status.toUpperCase()}</span>
                        \${agent.results ? \`
                            <div class="agent-results">
                                <strong>Results:</strong><br>
                                \${agent.results}
                            </div>
                        \` : ''}
                        <button class="run-agent-btn" onclick="runAgent('\${agent.id}')" 
                                \${agent.status === 'working' ? 'disabled' : ''}>
                            Run \${agent.name}
                        </button>
                    </div>
                \`).join('');
            }

            function updateStats() {
                document.getElementById('total-scans').textContent = stats.totalScans;
                document.getElementById('issues-found').textContent = stats.issuesFound;
                document.getElementById('issues-fixed').textContent = stats.issuesFixed;
                document.getElementById('deployments').textContent = stats.deployments;
            }

            function addLog(message, type = 'success') {
                const log = document.getElementById('results-log');
                const time = new Date().toLocaleTimeString();
                const item = document.createElement('div');
                item.className = \`result-item \${type}\`;
                item.innerHTML = \`
                    <div class="result-time">\${time}</div>
                    <div class="result-message">\${message}</div>
                \`;
                log.insertBefore(item, log.firstChild);
                
                while (log.children.length > 10) {
                    log.removeChild(log.lastChild);
                }
            }

            function runAgent(agentId) {
                vscode.postMessage({
                    command: 'runAgent',
                    agentId: agentId
                });
            }

            function fixAgent(agentId) {
                vscode.postMessage({
                    command: 'fixAgent',
                    agentId: agentId
                });
            }

            function runFullSwarm() {
                vscode.postMessage({
                    command: 'runFullSwarm'
                });
            }

            function fixAll() {
                vscode.postMessage({
                    command: 'fixAll'
                });
            }

            function scanCurrentFile() {
                vscode.postMessage({
                    command: 'scanCurrentFile'
                });
            }

            function stopAllAgents() {
                agents.forEach(agent => {
                    agent.status = 'idle';
                    agent.results = null;
                });
                renderAgents();
                document.getElementById('progress-fill').style.width = '0%';
                addLog('⏹️ All agents stopped', 'error');
            }

            // Listen for messages from extension
            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.type) {
                    case 'agentUpdate':
                        const agent = agents.find(a => a.id === message.agentId);
                        if (agent) {
                            agent.status = message.status;
                            agent.results = message.results;
                            renderAgents();
                        }
                        break;
                    case 'addLog':
                        addLog(message.message, message.logType);
                        break;
                    case 'updateStats':
                        Object.assign(stats, message.stats);
                        updateStats();
                        break;
                }
            });

            // Initialize
            renderAgents();
            updateStats();
        </script>
        `;

        html = html.replace(/<script>[\s\S]*<\/script>/, scriptReplacement);

        return html;
    }

    async runAgent(agentId) {
        const vscode = require('vscode');
        const SwarmAgents = require('./swarm-agents');
        const swarm = new SwarmAgents();

        // Send status update to webview
        this.sendUpdate('agentUpdate', {
            agentId,
            status: 'working',
            results: null
        });

        this.sendUpdate('addLog', {
            message: `🔄 ${agentId} started scanning...`,
            logType: 'warning'
        });

        // Get current file
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.sendUpdate('addLog', {
                message: `❌ No file open`,
                logType: 'error'
            });
            this.sendUpdate('agentUpdate', {
                agentId,
                status: 'idle',
                results: null
            });
            return;
        }

        const document = editor.document;
        const filePath = document.fileName;

        // Create a simple stream that sends updates to dashboard
        const stream = {
            markdown: (text) => {
                this.sendUpdate('addLog', {
                    message: text.replace(/[#*`]/g, ''),
                    logType: 'success'
                });
            }
        };

        try {
            let result;
            switch(agentId) {
                case 'bughunter':
                    result = await swarm.bugHunter(stream, `Scan ${filePath}`);
                    break;
                case 'backupfinder':
                    result = await swarm.backupFinder(stream, { fileName: filePath });
                    break;
                case 'inputvalidator':
                    result = await swarm.inputValidator(stream);
                    break;
                case 'formhardener':
                    result = await swarm.formHardener(stream, {});
                    break;
                case 'uienhancer':
                    result = await swarm.uiEnhancer(stream);
                    break;
                case 'securityguard':
                    result = await swarm.securityGuard(stream);
                    break;
                case 'codemerger':
                    stream.markdown('CodeMerger delegates to GitHub Copilot - use @aidevpilot in chat');
                    break;
                case 'productiondeployer':
                    result = await swarm.productionDeployer(stream, { approved: true });
                    break;
            }

            const issueCount = result?.issues || result?.count || result?.needsImprovement || 0;
            
            this.sendUpdate('agentUpdate', {
                agentId,
                status: 'complete',
                results: `Found ${issueCount} issues`
            });

            this.sendUpdate('addLog', {
                message: `✅ ${agentId} completed - ${issueCount} issues found`,
                logType: 'success'
            });

            // Update stats
            this.sendUpdate('updateStats', {
                stats: {
                    issuesFound: issueCount
                }
            });

        } catch (error) {
            this.sendUpdate('addLog', {
                message: `❌ ${agentId} error: ${error.message}`,
                logType: 'error'
            });
            this.sendUpdate('agentUpdate', {
                agentId,
                status: 'idle',
                results: null
            });
        }
    }

    async runFullSwarm() {
        const vscode = require('vscode');
        const SwarmAgents = require('./swarm-agents');
        const swarm = new SwarmAgents();

        this.sendUpdate('addLog', {
            message: '🎯 Running full swarm - all 8 agents...',
            logType: 'warning'
        });

        // Get current file
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.sendUpdate('addLog', {
                message: `❌ No file open - please open a file to scan`,
                logType: 'error'
            });
            return;
        }

        const document = editor.document;
        const filePath = document.fileName;

        // Create stream for dashboard updates
        const stream = {
            markdown: (text) => {
                this.sendUpdate('addLog', {
                    message: text.replace(/[#*`]/g, ''),
                    logType: 'success'
                });
            }
        };

        try {
            // Run autoFixer (runs all agents)
            await swarm.autoFixer(stream, `Full scan of ${filePath}`);
            
            this.sendUpdate('addLog', {
                message: '✅ Full swarm complete! Check results above.',
                logType: 'success'
            });

            this.sendUpdate('updateStats', {
                stats: {
                    totalScans: 1,
                    deployments: 0
                }
            });

        } catch (error) {
            this.sendUpdate('addLog', {
                message: `❌ Swarm error: ${error.message}`,
                logType: 'error'
            });
        }
    }

    async scanCurrentFile() {
        this.sendUpdate('addLog', {
            message: '🔍 Scanning current file with BugHunter...',
            logType: 'warning'
        });

        // Just run BugHunter
        await this.runAgent('bughunter');
    }

    async fixAgent(agentId) {
        const vscode = require('vscode');
        const SwarmAgents = require('./swarm-agents');
        const swarm = new SwarmAgents();

        this.sendUpdate('addLog', {
            message: `🔧 ${agentId} fixing issues...`,
            logType: 'warning'
        });

        this.sendUpdate('agentUpdate', {
            agentId,
            status: 'working',
            results: null
        });

        // Get current file
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.sendUpdate('addLog', {
                message: `❌ No file open`,
                logType: 'error'
            });
            return;
        }

        const stream = {
            markdown: (text) => {
                this.sendUpdate('addLog', {
                    message: text.replace(/[#*`]/g, ''),
                    logType: 'success'
                });
            }
        };

        try {
            // Run agent to get results first
            let result;
            switch(agentId) {
                case 'bughunter':
                    result = await swarm.bugHunter(stream, `Scan ${editor.document.fileName}`);
                    break;
                case 'inputvalidator':
                    result = await swarm.inputValidator(stream);
                    break;
                case 'formhardener':
                    result = await swarm.formHardener(stream, {});
                    break;
                case 'uienhancer':
                    result = await swarm.uiEnhancer(stream);
                    break;
            }

            // Apply fixes
            const fixes = await this.autoFixer.fixWithAgent(agentId, result);

            this.sendUpdate('addLog', {
                message: `✅ ${agentId} applied ${fixes} fixes`,
                logType: 'success'
            });

            this.sendUpdate('agentUpdate', {
                agentId,
                status: 'complete',
                results: `Fixed ${fixes} issues`
            });

            this.sendUpdate('updateStats', {
                stats: {
                    issuesFixed: fixes
                }
            });

        } catch (error) {
            this.sendUpdate('addLog', {
                message: `❌ ${agentId} fix error: ${error.message}`,
                logType: 'error'
            });
        }

        // Reset status
        setTimeout(() => {
            this.sendUpdate('agentUpdate', {
                agentId,
                status: 'idle',
                results: null
            });
        }, 3000);
    }

    async fixAll() {
        this.sendUpdate('addLog', {
            message: '🔧 Fix All - scanning and fixing all issues...',
            logType: 'warning'
        });

        const vscode = require('vscode');
        const SwarmAgents = require('./swarm-agents');
        const swarm = new SwarmAgents();

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.sendUpdate('addLog', {
                message: `❌ No file open`,
                logType: 'error'
            });
            return;
        }

        const stream = {
            markdown: (text) => {
                this.sendUpdate('addLog', {
                    message: text.replace(/[#*`]/g, ''),
                    logType: 'success'
                });
            }
        };

        const fixableAgents = ['bughunter', 'inputvalidator', 'formhardener'];
        let totalFixes = 0;

        for (const agentId of fixableAgents) {
            this.sendUpdate('agentUpdate', {
                agentId,
                status: 'working',
                results: null
            });

            try {
                // Scan
                let result;
                switch(agentId) {
                    case 'bughunter':
                        result = await swarm.bugHunter(stream, `Scan ${editor.document.fileName}`);
                        break;
                    case 'inputvalidator':
                        result = await swarm.inputValidator(stream);
                        break;
                    case 'formhardener':
                        result = await swarm.formHardener(stream, {});
                        break;
                }

                // Fix
                const fixes = await this.autoFixer.fixWithAgent(agentId, result);
                totalFixes += fixes;

                this.sendUpdate('agentUpdate', {
                    agentId,
                    status: 'complete',
                    results: `Fixed ${fixes} issues`
                });

                await new Promise(resolve => setTimeout(resolve, 500));

                this.sendUpdate('agentUpdate', {
                    agentId,
                    status: 'idle',
                    results: null
                });

            } catch (error) {
                this.sendUpdate('addLog', {
                    message: `❌ ${agentId} error: ${error.message}`,
                    logType: 'error'
                });
            }
        }

        this.sendUpdate('addLog', {
            message: `🎉 Fix All complete! Applied ${totalFixes} total fixes`,
            logType: 'success'
        });

        this.sendUpdate('updateStats', {
            stats: {
                issuesFixed: totalFixes,
                totalScans: 1
            }
        });
    }

    sendUpdate(type, data) {
        if (this.panel) {
            this.panel.webview.postMessage({ type, ...data });
        }
    }
}

module.exports = DashboardPanel;
