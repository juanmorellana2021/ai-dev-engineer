/**
 * Context Loader - Automatically loads project context from memory-bank
 * Scans memory-bank folder and extracts coding patterns, architecture info, etc.
 */

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

class ContextLoader {
    constructor() {
        this.context = {
            architecture: [],
            codingPatterns: [],
            technologies: [],
            databases: [],
            deployment: [],
            security: []
        };
    }

    /**
     * Auto-load context from memory-bank folder
     */
    async loadProjectContext() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return null;
        }

        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        const memoryBankPath = path.join(workspaceRoot, 'memory-bank');

        // Check if memory-bank exists
        if (!fs.existsSync(memoryBankPath)) {
            return null;
        }

        try {
            // Load key context files
            await this.loadProductContext(memoryBankPath);
            await this.loadPatterns(memoryBankPath);
            await this.loadDecisionLog(memoryBankPath);
            
            return this.context;
        } catch (error) {
            console.error('Error loading context:', error);
            return null;
        }
    }

    /**
     * Load product context (architecture, tech stack)
     */
    async loadProductContext(memoryPath) {
        const productContextPath = path.join(memoryPath, 'productContext.md');
        
        if (!fs.existsSync(productContextPath)) {
            return;
        }

        const content = fs.readFileSync(productContextPath, 'utf8');

        // Extract architecture info
        const archMatch = content.match(/##\s*Architecture\s*([\s\S]*?)(?=##|$)/i);
        if (archMatch) {
            this.context.architecture = archMatch[1]
                .split('\n')
                .filter(line => line.trim())
                .map(line => line.trim());
        }

        // Extract technologies
        const techMatch = content.match(/##\s*Technologies?\s*([\s\S]*?)(?=##|$)/i);
        if (techMatch) {
            this.context.technologies = techMatch[1]
                .split('\n')
                .filter(line => line.trim() && line.startsWith('-'))
                .map(line => line.replace(/^-\s*/, '').trim());
        }

        // Extract deployment info
        if (content.includes('prod-vps') || content.includes('SSH')) {
            const deploymentPatterns = content.match(/SSH.*?prod-vps|\/var\/www\/html|root@\d+\.\d+\.\d+\.\d+/gi);
            if (deploymentPatterns) {
                this.context.deployment = [...new Set(deploymentPatterns)];
            }
        }

        // Extract database info
        if (content.includes('MySQL') || content.includes('PostgreSQL')) {
            const dbMatches = content.match(/(\w+_\w+)\s*(?:MySQL|PostgreSQL|database|DB)/gi);
            if (dbMatches) {
                this.context.databases = [...new Set(dbMatches)];
            }
        }
    }

    /**
     * Load coding patterns from memory-bank
     */
    async loadPatterns(memoryPath) {
        const patternsPath = path.join(memoryPath, 'patterns');
        
        if (!fs.existsSync(patternsPath)) {
            return;
        }

        const patternFiles = fs.readdirSync(patternsPath)
            .filter(file => file.endsWith('.md'));

        for (const file of patternFiles) {
            const content = fs.readFileSync(path.join(patternsPath, file), 'utf8');
            
            // Extract pattern name and description
            const lines = content.split('\n').filter(line => line.trim());
            if (lines.length > 0) {
                this.context.codingPatterns.push({
                    file: file,
                    pattern: lines[0].replace(/^#\s*/, ''),
                    description: lines.slice(1, 3).join(' ').substring(0, 200)
                });
            }
        }
    }

    /**
     * Load decision log (security, architecture decisions)
     */
    async loadDecisionLog(memoryPath) {
        const decisionLogPath = path.join(memoryPath, 'decisionLog.md');
        
        if (!fs.existsSync(decisionLogPath)) {
            return;
        }

        const content = fs.readFileSync(decisionLogPath, 'utf8');

        // Extract security-related decisions
        const securityMatches = content.match(/.*(?:security|CSRF|XSS|SQL injection|session|auth).*/gi);
        if (securityMatches) {
            this.context.security = securityMatches.slice(0, 10); // Top 10
        }
    }

    /**
     * Format context for display
     */
    formatContext() {
        let output = '# 📋 Project Context Loaded\n\n';

        if (this.context.architecture.length > 0) {
            output += '## 🏗️ Architecture\n';
            this.context.architecture.slice(0, 5).forEach(item => {
                output += `- ${item}\n`;
            });
            output += '\n';
        }

        if (this.context.technologies.length > 0) {
            output += '## 🔧 Tech Stack\n';
            this.context.technologies.slice(0, 10).forEach(tech => {
                output += `- ${tech}\n`;
            });
            output += '\n';
        }

        if (this.context.databases.length > 0) {
            output += '## 🗄️ Databases\n';
            this.context.databases.forEach(db => {
                output += `- ${db}\n`;
            });
            output += '\n';
        }

        if (this.context.deployment.length > 0) {
            output += '## 🚀 Deployment\n';
            this.context.deployment.slice(0, 5).forEach(dep => {
                output += `- ${dep}\n`;
            });
            output += '\n';
        }

        if (this.context.security.length > 0) {
            output += '## 🔒 Security Practices\n';
            this.context.security.slice(0, 5).forEach(sec => {
                output += `- ${sec}\n`;
            });
            output += '\n';
        }

        if (this.context.codingPatterns.length > 0) {
            output += `## 📐 Coding Patterns (${this.context.codingPatterns.length} found)\n`;
            this.context.codingPatterns.slice(0, 5).forEach(pattern => {
                output += `- **${pattern.pattern}**\n`;
            });
            output += '\n';
        }

        return output;
    }

    /**
     * Get context hints for scanners
     * Returns project-specific patterns to check
     */
    getContextHints() {
        return {
            // Security hints from project
            requireCSRF: this.context.security.some(s => s.toLowerCase().includes('csrf')),
            requireSecureSessions: this.context.security.some(s => s.toLowerCase().includes('session')),
            
            // Database hints
            usesMySQL: this.context.technologies.some(t => t.toLowerCase().includes('mysql')),
            usesPostgreSQL: this.context.technologies.some(t => t.toLowerCase().includes('postgresql')),
            
            // Architecture hints
            usesPDO: this.context.architecture.some(a => a.toLowerCase().includes('pdo')),
            usesClasses: this.context.codingPatterns.some(p => p.pattern.toLowerCase().includes('class')),
            
            // Deployment hints
            hasProductionVPS: this.context.deployment.length > 0,
            
            // Known databases
            knownDatabases: this.context.databases
        };
    }
}

module.exports = ContextLoader;
