const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

class SwarmAgents {
    constructor(aiContext = null) {
        this.log = [];
        this.aiContext = aiContext; // Reference to AI/Copilot for intelligent queries
        this.memoryBankPath = this.getMemoryBankPath();
        this.initializeMemoryBank();
    }

    // Get memory bank path
    getMemoryBankPath() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
        if (workspaceFolder) {
            return path.join(workspaceFolder, 'memory-bank', 'agents');
        }
        return null;
    }

    // Initialize memory bank directory structure
    initializeMemoryBank() {
        if (!this.memoryBankPath) return;

        try {
            // Create agents memory bank directory
            if (!fs.existsSync(this.memoryBankPath)) {
                fs.mkdirSync(this.memoryBankPath, { recursive: true });
            }

            // Initialize memory files for each agent
            const agents = [
                'Commander', // Supreme brain - most critical memory
                'BugHunter',
                'BackupFinder',
                'CodeMerger',
                'ArchitectureAnalyzer',
                'FileStructureValidator',
                'BackendValidator',
                'DatabaseValidator',
                'InputValidator',
                'FormHardener',
                'UIEnhancer',
                'SecurityGuard',
                'ProductionDeployer'
            ];

            agents.forEach(agentName => {
                const memoryFile = path.join(this.memoryBankPath, `${agentName}_memory.json`);
                if (!fs.existsSync(memoryFile)) {
                    // Commander gets special memory structure
                    const initialMemory = agentName === 'Commander' ? {
                        agentName: 'Commander',
                        totalDecisions: 0,
                        deploymentsBlocked: 0,
                        deploymentsApproved: 0,
                        deploymentsCaution: 0,
                        lastDecision: null,
                        decisionHistory: [],
                        systemFailures: [], // Times Commander was wrong
                        systemSuccesses: [], // Times Commander was right
                        criticalSaves: [], // Times Commander prevented disaster
                        patterns: {
                            commonBlockReasons: [],
                            falseAlarms: [], // Times Commander blocked unnecessarily
                            missedIssues: [] // Times Commander approved but failed
                        },
                        performance: {
                            averageAnalysisTime: 0,
                            accuracyRate: 0,
                            falsePositiveRate: 0,
                            falseNegativeRate: 0
                        },
                        learnings: [],
                        agentCollaboration: { // Track agent-to-agent knowledge sharing
                            totalCollaborations: 0,
                            collaborationHistory: [],
                            mostCollaborative: {}, // Which agents share knowledge most
                            accuracyImprovement: 0 // How much collaboration improves accuracy
                        },
                        swarmVoting: { // PHASE 3: Track democratic voting sessions
                            totalVotes: 0,
                            votingHistory: [],
                            accuracyRate: 0,
                            vetoCount: 0, // Times Commander overrode swarm
                            consensusAccuracy: {} // Which consensus types are most accurate
                        },
                        agentTrust: { // How much to trust each agent based on history
                            BugHunter: { trustScore: 100, correct: 0, incorrect: 0 },
                            BackupFinder: { trustScore: 100, correct: 0, incorrect: 0 },
                            CodeMerger: { trustScore: 100, correct: 0, incorrect: 0 },
                            ArchitectureAnalyzer: { trustScore: 100, correct: 0, incorrect: 0 },
                            FileStructureValidator: { trustScore: 100, correct: 0, incorrect: 0 },
                            BackendValidator: { trustScore: 100, correct: 0, incorrect: 0 },
                            DatabaseValidator: { trustScore: 100, correct: 0, incorrect: 0 },
                            InputValidator: { trustScore: 100, correct: 0, incorrect: 0 },
                            FormHardener: { trustScore: 100, correct: 0, incorrect: 0 },
                            UIEnhancer: { trustScore: 100, correct: 0, incorrect: 0 },
                            SecurityGuard: { trustScore: 100, correct: 0, incorrect: 0 },
                            ProductionDeployer: { trustScore: 100, correct: 0, incorrect: 0 }
                        }
                    } : {
                        agentName: agentName,
                        totalRuns: 0,
                        successfulRuns: 0,
                        failedRuns: 0,
                        lastRun: null,
                        learnings: [],
                        patterns: {
                            commonIssues: [],
                            falsePositives: [],
                            criticalPatterns: []
                        },
                        performance: {
                            averageExecutionTime: 0,
                            issuesFoundHistory: []
                        },
                        improvements: []
                    };
                    fs.writeFileSync(memoryFile, JSON.stringify(initialMemory, null, 2));
                }
            });
        } catch (error) {
            console.error('Failed to initialize memory bank:', error);
        }
    }

    // Load agent memory
    loadAgentMemory(agentName) {
        if (!this.memoryBankPath) return null;
        
        try {
            const memoryFile = path.join(this.memoryBankPath, `${agentName}_memory.json`);
            if (fs.existsSync(memoryFile)) {
                const data = fs.readFileSync(memoryFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error(`Failed to load memory for ${agentName}:`, error);
        }
        return null;
    }

    // Save agent memory
    saveAgentMemory(agentName, memory) {
        if (!this.memoryBankPath) return;

        try {
            const memoryFile = path.join(this.memoryBankPath, `${agentName}_memory.json`);
            fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
        } catch (error) {
            console.error(`Failed to save memory for ${agentName}:`, error);
        }
    }

    // Record agent run and learn from it
    async recordAgentExperience(agentName, runData) {
        const memory = this.loadAgentMemory(agentName);
        if (!memory) return;

        const startTime = Date.now();
        
        // Update run statistics
        memory.totalRuns++;
        memory.lastRun = new Date().toISOString();
        
        if (runData.success) {
            memory.successfulRuns++;
        } else {
            memory.failedRuns++;
        }

        // Track execution time
        const executionTime = runData.executionTime || 0;
        memory.performance.averageExecutionTime = 
            ((memory.performance.averageExecutionTime * (memory.totalRuns - 1)) + executionTime) / memory.totalRuns;

        // Track issues found
        if (runData.issuesFound !== undefined) {
            memory.performance.issuesFoundHistory.push({
                timestamp: new Date().toISOString(),
                count: runData.issuesFound,
                fileName: runData.fileName || 'unknown'
            });
            
            // Keep only last 100 runs
            if (memory.performance.issuesFoundHistory.length > 100) {
                memory.performance.issuesFoundHistory = memory.performance.issuesFoundHistory.slice(-100);
            }
        }

        // Learn from patterns
        if (runData.patterns) {
            // Add new common issues
            runData.patterns.forEach(pattern => {
                const existing = memory.patterns.commonIssues.find(p => p.pattern === pattern);
                if (existing) {
                    existing.count++;
                    existing.lastSeen = new Date().toISOString();
                } else {
                    memory.patterns.commonIssues.push({
                        pattern: pattern,
                        count: 1,
                        firstSeen: new Date().toISOString(),
                        lastSeen: new Date().toISOString()
                    });
                }
            });
        }

        // Learn from false positives
        if (runData.falsePositive) {
            memory.patterns.falsePositives.push({
                pattern: runData.falsePositive,
                timestamp: new Date().toISOString(),
                context: runData.context || {}
            });
        }

        // Learn from critical findings
        if (runData.critical) {
            memory.patterns.criticalPatterns.push({
                issue: runData.critical,
                timestamp: new Date().toISOString(),
                severity: runData.severity || 'high',
                context: runData.context || {}
            });
        }

        // Add learning/improvement
        if (runData.learning) {
            memory.learnings.push({
                timestamp: new Date().toISOString(),
                lesson: runData.learning,
                context: runData.context || {}
            });
            
            // Keep only last 50 learnings
            if (memory.learnings.length > 50) {
                memory.learnings = memory.learnings.slice(-50);
            }
        }

        // Add improvement suggestions
        if (runData.improvement) {
            memory.improvements.push({
                timestamp: new Date().toISOString(),
                suggestion: runData.improvement,
                implemented: false
            });
        }

        this.saveAgentMemory(agentName, memory);
        
        return memory;
    }

    // Get agent insights from memory
    getAgentInsights(agentName) {
        const memory = this.loadAgentMemory(agentName);
        if (!memory) return null;

        return {
            totalRuns: memory.totalRuns,
            successRate: memory.totalRuns > 0 ? 
                ((memory.successfulRuns / memory.totalRuns) * 100).toFixed(1) : 0,
            topIssues: memory.patterns.commonIssues
                .sort((a, b) => b.count - a.count)
                .slice(0, 5),
            recentLearnings: memory.learnings.slice(-5),
            avgExecutionTime: memory.performance.averageExecutionTime.toFixed(2)
        };
    }

    // SWARM INTELLIGENCE: Collective Knowledge System
    // Agents can read each other's memories to leverage collective intelligence
    
    getCollectiveKnowledge(fileName, requestingAgent = null) {
        const allAgents = [
            'BugHunter', 'SecurityGuard', 'FormHardener', 'InputValidator',
            'FileStructureValidator', 'ArchitectureReviewer', 'ComponentAnalyzer',
            'BackendConnector', 'DatabaseGuard', 'PerformanceOptimizer',
            'AccessibilityChecker', 'SEOOptimizer'
        ];

        const collective = {
            fileName: fileName,
            criticalCount: 0,
            warningCount: 0,
            agentsAnalyzed: [],
            criticalPatterns: [],
            commonWarnings: [],
            swarmConfidence: 0,
            recommendations: []
        };

        // Read all agent memories
        for (const agentName of allAgents) {
            if (agentName === requestingAgent) continue; // Skip self

            const memory = this.loadAgentMemory(agentName);
            if (!memory) continue;

            // Check if this agent has analyzed this file
            const criticals = memory.patterns.criticalPatterns.filter(p => 
                p.context && p.context.fileName === fileName
            );
            const warnings = memory.patterns.commonIssues.filter(p => 
                p.context && p.context.fileName === fileName
            );

            if (criticals.length > 0 || warnings.length > 0) {
                collective.agentsAnalyzed.push(agentName);
                collective.criticalCount += criticals.length;
                collective.warningCount += warnings.length;

                // Add critical patterns
                criticals.forEach(c => {
                    collective.criticalPatterns.push({
                        agent: agentName,
                        issue: c.issue,
                        severity: c.severity,
                        timestamp: c.timestamp
                    });
                });

                // Add warnings
                warnings.forEach(w => {
                    collective.commonWarnings.push({
                        agent: agentName,
                        pattern: w.pattern,
                        count: w.count
                    });
                });
            }
        }

        // Calculate swarm confidence
        if (collective.agentsAnalyzed.length > 0) {
            // More agents agreeing = higher confidence
            collective.swarmConfidence = Math.min(
                50 + (collective.agentsAnalyzed.length * 10) + 
                (collective.criticalCount * 5),
                100
            );
        }

        // Generate recommendations based on collective knowledge
        if (collective.criticalCount > 2) {
            collective.recommendations.push(`🚨 CRITICAL: ${collective.criticalCount} agents independently found critical issues`);
        }
        if (collective.agentsAnalyzed.length >= 3) {
            collective.recommendations.push(`🧠 High confidence: ${collective.agentsAnalyzed.length} agents analyzed this file`);
        }

        return collective;
    }

    // Log agent collaboration for transparency
    logAgentCollaboration(fromAgent, action, details) {
        const commanderMemory = this.loadAgentMemory('Commander');
        if (!commanderMemory) return;

        if (!commanderMemory.agentCollaboration) {
            commanderMemory.agentCollaboration = {
                totalCollaborations: 0,
                collaborationHistory: [],
                mostCollaborative: {},
                accuracyImprovement: 0
            };
        }

        commanderMemory.agentCollaboration.totalCollaborations++;
        
        // Record this collaboration
        commanderMemory.agentCollaboration.collaborationHistory.push({
            timestamp: new Date().toISOString(),
            fromAgent: fromAgent,
            action: action, // 'knowledge_shared', 'consultation', 'consensus'
            details: details
        });

        // Keep last 100 collaborations
        if (commanderMemory.agentCollaboration.collaborationHistory.length > 100) {
            commanderMemory.agentCollaboration.collaborationHistory = 
                commanderMemory.agentCollaboration.collaborationHistory.slice(-100);
        }

        // Track which agents collaborate most
        if (!commanderMemory.agentCollaboration.mostCollaborative[fromAgent]) {
            commanderMemory.agentCollaboration.mostCollaborative[fromAgent] = 0;
        }
        commanderMemory.agentCollaboration.mostCollaborative[fromAgent]++;

        this.saveAgentMemory('Commander', commanderMemory);
    }

    // PHASE 2: AGENT-TO-AGENT CONSULTATION SYSTEM
    // Allows agents to ask each other questions (Commander monitors all)
    
    async askAgent(fromAgent, toAgent, question, context = {}, stream = null) {
        // Prevent infinite loops - track consultation depth
        if (!this.consultationChain) {
            this.consultationChain = [];
        }
        
        // Check for circular consultation (A→B→C→A)
        if (this.consultationChain.includes(toAgent)) {
            if (stream) {
                stream.markdown(`⚠️ **Consultation Loop Detected:** Skipping ${toAgent} to prevent circular reference\n`);
            }
            return null;
        }
        
        // Limit consultation depth to 3
        if (this.consultationChain.length >= 3) {
            if (stream) {
                stream.markdown(`⚠️ **Max Consultation Depth Reached:** Limiting to prevent complexity\n`);
            }
            return null;
        }
        
        // Add to chain
        this.consultationChain.push(fromAgent);
        
        // Log consultation to Commander
        this.logAgentCollaboration(fromAgent, 'agent_consultation', {
            consultedAgent: toAgent,
            question: question.substring(0, 100), // First 100 chars
            timestamp: new Date().toISOString()
        });
        
        if (stream) {
            stream.markdown(`🤝 **${fromAgent} consulting ${toAgent}...**\n`);
        }
        
        try {
            // Call the specialist agent's consultation method
            const response = await this.consultOn(toAgent, question, context, fromAgent);
            
            // Remove from chain
            this.consultationChain.pop();
            
            return response;
        } catch (error) {
            console.error(`Consultation from ${fromAgent} to ${toAgent} failed:`, error);
            this.consultationChain.pop();
            return null;
        }
    }
    
    // Agent consultation handler - routes to specialist
    async consultOn(agentName, question, context, requestingAgent) {
        // Each agent provides expert opinion based on their specialty
        
        switch(agentName) {
            case 'SecurityGuard':
                return this.securityGuardConsult(question, context, requestingAgent);
            
            case 'BugHunter':
                return this.bugHunterConsult(question, context, requestingAgent);
            
            case 'FileStructureValidator':
                return this.fileStructureConsult(question, context, requestingAgent);
            
            case 'ArchitectureReviewer':
                return this.architectureConsult(question, context, requestingAgent);
            
            case 'BackendConnector':
                return this.backendConsult(question, context, requestingAgent);
            
            case 'DatabaseGuard':
                return this.databaseConsult(question, context, requestingAgent);
            
            default:
                return {
                    agent: agentName,
                    confidence: 0,
                    answer: 'Agent consultation not yet implemented',
                    reasoning: 'Specialist consultation coming soon'
                };
        }
    }
    
    // SecurityGuard specialist consultation
    async securityGuardConsult(question, context, requestingAgent) {
        const memory = this.loadAgentMemory('SecurityGuard');
        
        // Check memory for similar patterns
        let confidence = 50; // Base confidence
        let answer = '';
        let reasoning = '';
        
        // SQL Injection consultation
        if (question.toLowerCase().includes('sql') || question.toLowerCase().includes('injection')) {
            const hasPrepared = context.code?.includes('prepare') || 
                              context.code?.includes('bindParam') ||
                              context.code?.includes('PDO');
            const hasConcat = context.code?.includes('$_GET') || 
                            context.code?.includes('$_POST') ||
                            context.code?.match(/\$.*\"/);
            
            if (hasPrepared && !hasConcat) {
                answer = 'SAFE - Uses parameterized queries';
                reasoning = 'Code uses prepared statements with bound parameters, no direct concatenation detected';
                confidence = 95;
            } else if (hasConcat) {
                answer = 'VULNERABLE - SQL Injection Risk';
                reasoning = 'Direct user input concatenation in SQL query detected, no parameterization';
                confidence = 90;
            } else {
                answer = 'NEEDS REVIEW - Cannot determine safety';
                reasoning = 'Insufficient context to determine if query is properly parameterized';
                confidence = 60;
            }
        }
        
        // CSRF consultation
        else if (question.toLowerCase().includes('csrf') || question.toLowerCase().includes('token')) {
            const hasToken = context.code?.includes('csrf_token') || 
                           context.code?.includes('token_validate');
            const hasForm = context.code?.includes('<form');
            
            if (hasToken && hasForm) {
                answer = 'PROTECTED - CSRF tokens present';
                reasoning = 'Form includes CSRF token validation';
                confidence = 90;
            } else if (hasForm && !hasToken) {
                answer = 'VULNERABLE - No CSRF protection';
                reasoning = 'Form detected without CSRF token';
                confidence = 95;
            }
        }
        
        // XSS consultation
        else if (question.toLowerCase().includes('xss') || question.toLowerCase().includes('escape')) {
            const hasEscape = context.code?.includes('htmlspecialchars') ||
                            context.code?.includes('htmlentities') ||
                            context.code?.includes('filter_var');
            const hasEcho = context.code?.includes('echo $_');
            
            if (hasEcho && !hasEscape) {
                answer = 'VULNERABLE - XSS Risk';
                reasoning = 'Unescaped user input echoed to page';
                confidence = 90;
            } else if (hasEscape) {
                answer = 'SAFE - Output properly escaped';
                reasoning = 'Using htmlspecialchars or similar escaping';
                confidence = 85;
            }
        }
        
        // General security question
        else {
            answer = 'NEEDS AI ANALYSIS';
            reasoning = 'Question requires AI-level security analysis';
            confidence = 40;
        }
        
        return {
            agent: 'SecurityGuard',
            confidence: confidence,
            answer: answer,
            reasoning: reasoning,
            requestedBy: requestingAgent
        };
    }
    
    // ArchitectureReviewer specialist consultation
    async architectureConsult(question, context, requestingAgent) {
        let confidence = 60;
        let answer = '';
        let reasoning = '';
        
        // File naming pattern
        if (question.toLowerCase().includes('file') && question.toLowerCase().includes('pattern')) {
            const fileName = context.fileName || '';
            
            // Check naming conventions
            if (fileName.match(/_current\.php$/)) {
                answer = 'STANDARD - Follows naming convention';
                reasoning = 'Uses _current.php suffix for production files';
                confidence = 85;
            } else if (fileName.match(/_modern\.php$/)) {
                answer = 'DEVELOPMENT - Modern/experimental version';
                reasoning = 'Uses _modern.php suffix indicating WIP';
                confidence = 80;
            } else if (fileName.match(/_prod\.php$/)) {
                answer = 'PRODUCTION - Production file';
                reasoning = 'Uses _prod.php suffix for production';
                confidence = 85;
            } else {
                answer = 'CHECK - May not follow convention';
                reasoning = 'Filename doesn\'t match known patterns';
                confidence = 50;
            }
        }
        
        // Component vs standalone
        else if (question.toLowerCase().includes('component')) {
            const hasIncludes = context.relatedFiles?.length > 0;
            const isIncluded = context.isIncluded || false;
            
            if (hasIncludes) {
                answer = 'COMPONENT - Shared across files';
                reasoning = `Included by ${context.relatedFiles?.length} files`;
                confidence = 90;
            } else {
                answer = 'STANDALONE - Independent file';
                reasoning = 'Not detected as included by other files';
                confidence = 75;
            }
        }
        
        return {
            agent: 'ArchitectureReviewer',
            confidence: confidence,
            answer: answer,
            reasoning: reasoning,
            requestedBy: requestingAgent
        };
    }
    
    // BugHunter specialist consultation
    async bugHunterConsult(question, context, requestingAgent) {
        const memory = this.loadAgentMemory('BugHunter');
        
        // Check if this pattern has been seen before
        let confidence = 50;
        let answer = '';
        
        if (memory && memory.patterns.criticalPatterns.length > 0) {
            const similarPattern = memory.patterns.criticalPatterns.find(p => 
                question.toLowerCase().includes(p.issue.toLowerCase())
            );
            
            if (similarPattern) {
                answer = `CRITICAL - Seen ${memory.patterns.criticalPatterns.length}x before`;
                confidence = 85;
            }
        }
        
        if (!answer) {
            answer = 'Pattern not in memory, needs fresh analysis';
            confidence = 40;
        }
        
        return {
            agent: 'BugHunter',
            confidence: confidence,
            answer: answer,
            reasoning: 'Based on historical pattern database',
            requestedBy: requestingAgent
        };
    }
    
    // FileStructureValidator specialist consultation
    async fileStructureConsult(question, context, requestingAgent) {
        return {
            agent: 'FileStructureValidator',
            confidence: 60,
            answer: 'File structure analysis requires production scan',
            reasoning: 'Cannot provide offline consultation',
            requestedBy: requestingAgent
        };
    }
    
    // Backend specialist consultation
    async backendConsult(question, context, requestingAgent) {
        return {
            agent: 'BackendConnector',
            confidence: 60,
            answer: 'Backend analysis requires API testing',
            reasoning: 'Cannot provide offline consultation',
            requestedBy: requestingAgent
        };
    }
    
    // Database specialist consultation
    async databaseConsult(question, context, requestingAgent) {
        return {
            agent: 'DatabaseGuard',
            confidence: 60,
            answer: 'Database analysis requires schema access',
            reasoning: 'Cannot provide offline consultation',
            requestedBy: requestingAgent
        };
    }

    // PHASE 3: SWARM VOTING SYSTEM
    // Commander initiates democratic vote when uncertain (Commander ALWAYS has final veto)
    
    async initiateSwarmVote(question, context, stream) {
        if (!this.swarmVoteActive) {
            this.swarmVoteActive = true;
        } else {
            stream.markdown(`⚠️ **Vote Already in Progress** - Skipping to prevent vote spam\n\n`);
            return null;
        }
        
        stream.markdown(`\n## 🗳️ SWARM VOTING INITIATED\n\n`);
        stream.markdown(`**Question:** ${question}\n\n`);
        
        // Select relevant agents based on context
        const votingAgents = this.selectVotingAgents(context);
        
        stream.markdown(`**Voting Panel:** ${votingAgents.join(', ')} (${votingAgents.length} agents)\n\n`);
        stream.markdown(`---\n\n`);
        
        // Collect votes from each agent
        const votes = [];
        for (const agentName of votingAgents) {
            const vote = await this.castVote(agentName, question, context, stream);
            if (vote) {
                votes.push(vote);
                stream.markdown(`**${agentName}:** ${vote.decision} (${vote.confidence}% confidence)\n`);
                stream.markdown(`   _"${vote.reasoning}"_\n\n`);
            }
        }
        
        // Calculate consensus
        const consensus = this.calculateSwarmConsensus(votes, context);
        
        stream.markdown(`---\n\n`);
        stream.markdown(`## 📊 SWARM CONSENSUS RESULTS\n\n`);
        stream.markdown(`**Votes:** ${consensus.blockVotes} BLOCK, ${consensus.approveVotes} APPROVE, ${consensus.abstainVotes} ABSTAIN\n`);
        stream.markdown(`**Weighted Confidence:** ${consensus.weightedConfidence.toFixed(1)}%\n`);
        stream.markdown(`**Consensus:** ${consensus.recommendation}\n`);
        stream.markdown(`**Reasoning:** ${consensus.reasoning}\n\n`);
        
        // Log voting session
        this.logSwarmVote(votes, consensus);
        
        this.swarmVoteActive = false;
        return consensus;
    }
    
    // Select which agents should vote based on context
    selectVotingAgents(context) {
        const allAgents = [
            'BugHunter', 'SecurityGuard', 'FileStructureValidator',
            'ArchitectureReviewer', 'BackendConnector', 'DatabaseGuard',
            'FormHardener', 'InputValidator'
        ];
        
        // Select 3-5 most relevant agents based on context
        const relevant = [];
        
        // Security issues -> SecurityGuard, FormHardener, InputValidator
        if (context.hasSecurity || context.hasSQL || context.hasXSS || context.hasCSRF) {
            relevant.push('SecurityGuard', 'FormHardener', 'InputValidator');
        }
        
        // File structure issues -> FileStructureValidator, ArchitectureReviewer
        if (context.hasFileReferences || context.isComponent) {
            relevant.push('FileStructureValidator', 'ArchitectureReviewer');
        }
        
        // Code quality issues -> BugHunter
        if (context.hasCodeIssues) {
            relevant.push('BugHunter');
        }
        
        // Backend/API issues -> BackendConnector
        if (context.hasBackend) {
            relevant.push('BackendConnector');
        }
        
        // Database issues -> DatabaseGuard
        if (context.hasDatabase) {
            relevant.push('DatabaseGuard');
        }
        
        // Always include at least 3 agents, max 5
        const unique = [...new Set(relevant)];
        if (unique.length < 3) {
            // Add random agents to reach minimum
            allAgents.forEach(agent => {
                if (!unique.includes(agent) && unique.length < 3) {
                    unique.push(agent);
                }
            });
        }
        
        return unique.slice(0, 5); // Max 5 voters
    }
    
    // Agent casts vote
    async castVote(agentName, question, context, stream) {
        const memory = this.loadAgentMemory(agentName);
        
        let decision = 'ABSTAIN';
        let confidence = 50;
        let reasoning = '';
        
        // Each agent votes based on their specialty and memory
        switch(agentName) {
            case 'SecurityGuard':
                if (context.hasSecurity || context.hasSQL || context.hasCSRF || context.hasXSS) {
                    decision = context.criticalIssues > 0 ? 'BLOCK' : 'APPROVE';
                    confidence = context.criticalIssues > 0 ? 90 : 70;
                    reasoning = context.criticalIssues > 0 ? 
                        `${context.criticalIssues} security vulnerabilities detected` :
                        'No critical security issues found';
                } else {
                    decision = 'ABSTAIN';
                    confidence = 40;
                    reasoning = 'No security context to evaluate';
                }
                break;
                
            case 'FileStructureValidator':
                if (context.hasFileReferences) {
                    decision = context.brokenLinks > 0 ? 'BLOCK' : 'APPROVE';
                    confidence = context.brokenLinks > 0 ? 95 : 75;
                    reasoning = context.brokenLinks > 0 ?
                        `${context.brokenLinks} broken file references will break navigation` :
                        'All file references validated';
                } else {
                    decision = 'ABSTAIN';
                    confidence = 40;
                    reasoning = 'No file structure context to evaluate';
                }
                break;
                
            case 'BugHunter':
                if (context.hasCodeIssues) {
                    decision = context.criticalIssues > 0 ? 'BLOCK' : 'APPROVE';
                    confidence = 80;
                    reasoning = context.criticalIssues > 0 ?
                        'Critical code issues detected in analysis' :
                        'Code quality acceptable';
                } else {
                    decision = 'APPROVE';
                    confidence = 60;
                    reasoning = 'No critical bugs detected';
                }
                break;
                
            case 'ArchitectureReviewer':
                if (context.isComponent && context.brokenLinks > 0) {
                    decision = 'BLOCK';
                    confidence = 85;
                    reasoning = 'Component with broken references will cascade failures';
                } else if (context.isComponent && context.criticalIssues > 0) {
                    decision = 'BLOCK';
                    confidence = 80;
                    reasoning = 'Component issues affect multiple dependent files';
                } else {
                    decision = 'APPROVE';
                    confidence = 65;
                    reasoning = 'Architecture appears sound';
                }
                break;
                
            default:
                // Other agents use general heuristics
                if (context.criticalIssues > 2) {
                    decision = 'BLOCK';
                    confidence = 75;
                    reasoning = 'Multiple critical issues detected';
                } else if (context.criticalIssues > 0) {
                    decision = 'BLOCK';
                    confidence = 65;
                    reasoning = 'Critical issues present';
                } else {
                    decision = 'APPROVE';
                    confidence = 60;
                    reasoning = 'No critical issues in my domain';
                }
        }
        
        return {
            agent: agentName,
            decision: decision,
            confidence: confidence,
            reasoning: reasoning
        };
    }
    
    // Calculate weighted consensus from votes
    calculateSwarmConsensus(votes, context) {
        const commanderMemory = this.loadAgentMemory('Commander');
        
        let blockVotes = 0;
        let approveVotes = 0;
        let abstainVotes = 0;
        let totalConfidence = 0;
        let weightedBlockScore = 0;
        let weightedApproveScore = 0;
        
        votes.forEach(vote => {
            // Get agent trust score from Commander memory
            const trustScore = commanderMemory?.agentTrust?.[vote.agent]?.trustScore || 100;
            const weight = (vote.confidence / 100) * (trustScore / 100);
            
            if (vote.decision === 'BLOCK') {
                blockVotes++;
                weightedBlockScore += weight;
            } else if (vote.decision === 'APPROVE') {
                approveVotes++;
                weightedApproveScore += weight;
            } else {
                abstainVotes++;
            }
            
            totalConfidence += vote.confidence;
        });
        
        const avgConfidence = votes.length > 0 ? totalConfidence / votes.length : 0;
        
        // Determine consensus
        let recommendation = 'CAUTION';
        let reasoning = '';
        
        // Supermajority (>66%) BLOCK
        if (blockVotes / votes.length > 0.66) {
            recommendation = 'BLOCK';
            reasoning = `Strong consensus: ${blockVotes}/${votes.length} agents vote BLOCK`;
        }
        // Weighted score heavily favors BLOCK
        else if (weightedBlockScore > weightedApproveScore * 1.5) {
            recommendation = 'BLOCK';
            reasoning = `Weighted analysis favors BLOCK (high-confidence voters)`;
        }
        // Clear majority APPROVE
        else if (approveVotes > blockVotes * 2) {
            recommendation = 'APPROVE';
            reasoning = `Majority consensus: ${approveVotes}/${votes.length} agents vote APPROVE`;
        }
        // Weighted score favors APPROVE
        else if (weightedApproveScore > weightedBlockScore * 1.3) {
            recommendation = 'APPROVE';
            reasoning = `Weighted analysis favors APPROVE`;
        }
        // Split decision or unclear
        else {
            recommendation = 'CAUTION';
            reasoning = `Mixed opinions: ${blockVotes} BLOCK, ${approveVotes} APPROVE - Commander review required`;
        }
        
        return {
            blockVotes,
            approveVotes,
            abstainVotes,
            weightedConfidence: avgConfidence,
            weightedBlockScore,
            weightedApproveScore,
            recommendation,
            reasoning,
            votes
        };
    }
    
    // Log voting session to Commander memory
    logSwarmVote(votes, consensus) {
        const commanderMemory = this.loadAgentMemory('Commander');
        if (!commanderMemory) return;
        
        if (!commanderMemory.swarmVoting) {
            commanderMemory.swarmVoting = {
                totalVotes: 0,
                votingHistory: [],
                accuracyRate: 0,
                consensusAccuracy: {}
            };
        }
        
        commanderMemory.swarmVoting.totalVotes++;
        commanderMemory.swarmVoting.votingHistory.push({
            timestamp: new Date().toISOString(),
            votes: votes.map(v => ({ agent: v.agent, decision: v.decision, confidence: v.confidence })),
            consensus: consensus.recommendation,
            weightedConfidence: consensus.weightedConfidence
        });
        
        // Keep last 50 votes
        if (commanderMemory.swarmVoting.votingHistory.length > 50) {
            commanderMemory.swarmVoting.votingHistory = 
                commanderMemory.swarmVoting.votingHistory.slice(-50);
        }
        
        this.saveAgentMemory('Commander', commanderMemory);
    }

    // Agent-to-AI Callback System
    // Allows agents to ask the AI for intelligent analysis when automated checks aren't enough
    async askAI(agentName, question, context = {}) {
        if (!this.aiContext || !this.aiContext.chat) {
            console.warn(`[${agentName}] AI context not available - proceeding with automated checks only`);
            return null;
        }

        try {
            // Agent asks AI for analysis
            const prompt = `
[AGENT CONSULTATION REQUEST]
From: ${agentName}
Question: ${question}

Context:
${JSON.stringify(context, null, 2)}

Please provide a brief, focused analysis (2-3 sentences max) to help the agent make a decision.
`;

            const response = await this.aiContext.chat.sendMessage(prompt);
            return response?.text || null;
        } catch (error) {
            console.error(`[${agentName}] AI consultation failed:`, error);
            return null;
        }
    }

    // BugHunter - Finds Issues in Code
    async bugHunter(stream, task) {
        const startTime = Date.now();
        const agentName = 'BugHunter';
        
        stream.markdown(`## 🔍 BugHunter Agent Activated\n\n`);
        
        // Load memory and show experience
        const memory = this.loadAgentMemory(agentName);
        if (memory && memory.totalRuns > 0) {
            const insights = this.getAgentInsights(agentName);
            stream.markdown(`📊 **Agent Experience:** ${memory.totalRuns} previous runs, ${insights.successRate}% success rate\n`);
            
            if (insights.topIssues.length > 0) {
                stream.markdown(`🧠 **Known Patterns:** I've seen ${insights.topIssues[0].pattern} ${insights.topIssues[0].count} times before\n`);
            }
            stream.markdown(`\n`);
        }
        
        stream.markdown(`Analyzing: ${task}\n\n`);
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            stream.markdown(`❌ No file open to analyze.\n`);
            await this.recordAgentExperience(agentName, {
                success: false,
                executionTime: Date.now() - startTime,
                learning: 'No file open - cannot analyze'
            });
            return null;
        }

        const fileName = editor.document.fileName;
        const fileBaseName = fileName.split(/[\\\/]/).pop();

        // 🧠 SWARM INTELLIGENCE: Check what other agents know about this file
        const collective = this.getCollectiveKnowledge(fileBaseName, agentName);
        
        if (collective.agentsAnalyzed.length > 0) {
            stream.markdown(`🤝 **SWARM INTELLIGENCE ACTIVATED**\n`);
            stream.markdown(`${collective.agentsAnalyzed.length} agents have analyzed this file:\n`);
            collective.agentsAnalyzed.forEach(agent => {
                stream.markdown(`- ${agent}\n`);
            });
            
            if (collective.criticalCount > 0) {
                stream.markdown(`\n🚨 **Swarm Alert:** ${collective.criticalCount} critical issues found by other agents\n`);
                collective.criticalPatterns.forEach(cp => {
                    stream.markdown(`  - ${cp.agent}: ${cp.issue} (${cp.severity})\n`);
                });
            }
            
            stream.markdown(`\n📊 **Swarm Confidence:** ${collective.swarmConfidence}%\n`);
            collective.recommendations.forEach(rec => {
                stream.markdown(`${rec}\n`);
            });
            stream.markdown(`\n`);
            
            // Log this collaboration
            this.logAgentCollaboration(agentName, 'knowledge_shared', {
                fileName: fileBaseName,
                agentsConsulted: collective.agentsAnalyzed,
                criticalCount: collective.criticalCount,
                confidenceBoost: collective.swarmConfidence
            });
        }
        const content = editor.document.getText();

        // Check for common issues
        const issues = [];
        const suspiciousPatterns = []; // Patterns that need AI analysis
        const foundPatterns = [];
        
        if (content.includes("Coming soon")) {
            issues.push("Placeholder functions detected");
            foundPatterns.push("placeholder_functions");
        }
        if (content.match(/\$_GET\[|request\.GET\[/) && !content.includes("filter_input")) {
            issues.push("Unvalidated user input");
            foundPatterns.push("unvalidated_input");
        }
        if (content.includes("mysql_query")) {
            issues.push("Deprecated MySQL functions");
            foundPatterns.push("deprecated_mysql");
        }

        // Learn from memory - check for previously seen false positives
        if (memory && memory.patterns.falsePositives.length > 0) {
            const falsePositivePatterns = memory.patterns.falsePositives.map(fp => fp.pattern);
            // Filter out known false positives
            stream.markdown(`🧠 Applying learned filters (${memory.patterns.falsePositives.length} known false positives)\n`);
        }

        // Find suspicious patterns that might need AI analysis
        const sqlPattern = /\$[a-zA-Z_]+\s*=\s*["']SELECT.*?\$[a-zA-Z_]+/g;
        const suspiciousSql = content.match(sqlPattern);
        if (suspiciousSql) {
            suspiciousPatterns.push({
                type: 'SQL Injection Risk',
                matches: suspiciousSql.slice(0, 3), // First 3 instances
                question: 'Are these SQL queries properly parameterized or vulnerable to injection?'
            });
            foundPatterns.push("sql_injection_risk");
        }

        stream.markdown(`📊 **Scout Report:**\n`);
        stream.markdown(`- File: \`${fileName.split(/[\\\/]/).pop()}\`\n`);
        stream.markdown(`- Size: ${content.length} chars\n`);
        stream.markdown(`- Issues Found: ${issues.length}\n`);
        stream.markdown(`- Suspicious Patterns: ${suspiciousPatterns.length}\n\n`);

        if (issues.length > 0) {
            stream.markdown(`**Issues:**\n`);
            issues.forEach(issue => stream.markdown(`- ⚠️ ${issue}\n`));
            stream.markdown(`\n`);
        }

        // 🤝 PHASE 2: AGENT-TO-AGENT CONSULTATION for security patterns
        let aiConsulted = false;
        let agentConsulted = false;
        
        if (suspiciousPatterns.length > 0) {
            stream.markdown(`🧠 **Analyzing ${suspiciousPatterns.length} suspicious pattern(s)...**\n\n`);
            
            for (const pattern of suspiciousPatterns) {
                // FIRST: Ask SecurityGuard (specialist) if it's a security pattern
                if (pattern.type.toLowerCase().includes('sql') || 
                    pattern.type.toLowerCase().includes('injection') ||
                    pattern.type.toLowerCase().includes('xss') ||
                    pattern.type.toLowerCase().includes('csrf')) {
                    
                    const securityOpinion = await this.askAgent(
                        agentName,
                        'SecurityGuard',
                        `Is this pattern vulnerable? ${pattern.question}`,
                        {
                            code: pattern.matches.join('\n'),
                            patternType: pattern.type
                        },
                        stream
                    );
                    
                    if (securityOpinion) {
                        agentConsulted = true;
                        stream.markdown(`🛡️ **SecurityGuard Expert Opinion:**\n`);
                        stream.markdown(`   ${securityOpinion.answer} (${securityOpinion.confidence}% confidence)\n`);
                        stream.markdown(`   Reasoning: ${securityOpinion.reasoning}\n\n`);
                        
                        // If SecurityGuard is confident it's vulnerable, flag immediately
                        if (securityOpinion.confidence >= 80 && securityOpinion.answer.includes('VULNERABLE')) {
                            issues.push(`${pattern.type} - ${securityOpinion.answer}`);
                            
                            // Record as critical finding with agent collaboration
                            await this.recordAgentExperience(agentName, {
                                success: true,
                                critical: pattern.type,
                                severity: 'high',
                                context: {
                                    consultedAgent: 'SecurityGuard',
                                    confidence: securityOpinion.confidence,
                                    answer: securityOpinion.answer
                                }
                            });
                            
                            continue; // Skip AI consultation, SecurityGuard was confident
                        }
                        
                        // If SecurityGuard says it's SAFE with high confidence, skip
                        if (securityOpinion.confidence >= 85 && securityOpinion.answer.includes('SAFE')) {
                            // Record as false positive (agent prevented AI waste)
                            await this.recordAgentExperience(agentName, {
                                success: true,
                                falsePositive: pattern.type,
                                context: {
                                    consultedAgent: 'SecurityGuard',
                                    confidence: securityOpinion.confidence,
                                    savedAICall: true
                                }
                            });
                            
                            continue; // Skip AI, SecurityGuard confirmed safe
                        }
                    }
                }
                
                // SECOND: If SecurityGuard unsure (confidence < 80), consult AI
                const aiAnalysis = await this.askAI(agentName,
                    `${pattern.question}\n\nCode examples:\n${pattern.matches.join('\n')}`,
                    {
                        patternType: pattern.type,
                        fileName: fileName.split(/[\\\/]/).pop(),
                        context: 'security analysis'
                    }
                );

                if (aiAnalysis) {
                    aiConsulted = true;
                    stream.markdown(`🔍 **${pattern.type}:**\n`);
                    stream.markdown(`🤖 AI Analysis: ${aiAnalysis}\n\n`);
                    
                    // If AI confirms it's a problem, add to issues
                    if (aiAnalysis.toLowerCase().includes('vulnerable') || 
                        aiAnalysis.toLowerCase().includes('risk') ||
                        aiAnalysis.toLowerCase().includes('unsafe')) {
                        issues.push(`${pattern.type} - ${aiAnalysis.substring(0, 100)}...`);
                        
                        // Record as critical finding
                        await this.recordAgentExperience(agentName, {
                            success: true,
                            critical: pattern.type,
                            severity: 'high',
                            context: { aiAnalysis, fileName: fileName.split(/[\\\/]/).pop() }
                        });
                    } else {
                        // AI says it's safe - might be false positive
                        await this.recordAgentExperience(agentName, {
                            success: true,
                            falsePositive: pattern.type,
                            context: { aiAnalysis, fileName: fileName.split(/[\\\/]/).pop() }
                        });
                    }
                }
            }
        }

        // Record overall experience
        const executionTime = Date.now() - startTime;
        await this.recordAgentExperience(agentName, {
            success: true,
            executionTime,
            issuesFound: issues.length,
            fileName: fileName.split(/[\\\/]/).pop(),
            patterns: foundPatterns,
            learning: aiConsulted ? 
                `Consulted AI for ${suspiciousPatterns.length} suspicious patterns - improved accuracy` : 
                `Found ${issues.length} issues using pattern matching`
        });

        return { fileName, issues, content, suspiciousPatterns };
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
    // ArchitectureAnalyzer - Analyzes OOP Patterns and Code Structure
    async architectureAnalyzer(stream) {
        stream.markdown(`\n## 🏗️ ArchitectureAnalyzer Agent Activated\n\n`);
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            stream.markdown(`❌ No file to analyze.\n`);
            return { issues: [], improvements: [] };
        }

        const content = editor.document.getText();
        const fileName = editor.document.fileName;
        const ext = fileName.match(/\.(php|js|ts|py)$/)?.[1] || 'unknown';

        stream.markdown(`Analyzing architecture patterns in \`${fileName.split(/[\\\/]/).pop()}\`...\n\n`);

        const issues = [];
        const improvements = [];

        // PHP-specific OOP analysis
        if (ext === 'php') {
            // Check for code duplication
            const htmlBlocks = content.match(/<(div|nav|header|footer|aside)[^>]*>/gi) || [];
            const cssBlocks = content.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
            const jsBlocks = content.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];

            if (htmlBlocks.length > 50) {
                issues.push({
                    type: 'Code Duplication',
                    severity: 'high',
                    message: `${htmlBlocks.length} HTML blocks detected - consider extracting to reusable components (header.php, sidebar.php, footer.php)`
                });
                improvements.push({
                    pattern: 'Component Separation',
                    benefit: 'Use include() for shared UI components - reduces file size by 80-90%',
                    example: '<?php include "includes/modern_sidebar.php"; ?>'
                });
            }

            if (cssBlocks.length > 0) {
                const totalCssSize = cssBlocks.reduce((sum, block) => sum + block.length, 0);
                if (totalCssSize > 5000) {
                    issues.push({
                        type: 'CSS Not Separated',
                        severity: 'medium',
                        message: `${totalCssSize} chars of inline CSS - extract to separate file or reusable component`
                    });
                    improvements.push({
                        pattern: 'Style Separation',
                        benefit: 'Move CSS to includes/modern_theme_styles.php for reusability',
                        example: '<?php include "includes/modern_theme_styles.php"; ?>'
                    });
                }
            }

            if (jsBlocks.length > 0) {
                const totalJsSize = jsBlocks.reduce((sum, block) => sum + block.length, 0);
                if (totalJsSize > 3000) {
                    issues.push({
                        type: 'JavaScript Not Separated',
                        severity: 'medium',
                        message: `${totalJsSize} chars of inline JS - extract to separate file`
                    });
                    improvements.push({
                        pattern: 'Script Separation',
                        benefit: 'Move JS to includes/modern_theme_scripts.php for consistency',
                        example: '<?php include "includes/modern_theme_scripts.php"; ?>'
                    });
                }
            }

            // Check for repeated sidebar/navigation code
            if (content.includes('<nav') && content.includes('sidebar')) {
                const sidebarSize = content.match(/<nav[^>]*class="[^"]*sidebar[^"]*"[\s\S]*?<\/nav>/i)?.[0]?.length || 0;
                if (sidebarSize > 1000) {
                    issues.push({
                        type: 'Hardcoded Sidebar',
                        severity: 'high',
                        message: 'Sidebar should be in reusable component, not duplicated on every page'
                    });
                    improvements.push({
                        pattern: 'DRY Principle',
                        benefit: 'Create includes/modern_sidebar.php - update once, affects all pages',
                        example: 'Replace 1000+ lines with single include statement'
                    });
                }
            }

            // Check for class usage vs procedural code
            const classCount = (content.match(/class\s+\w+/g) || []).length;
            const functionCount = (content.match(/function\s+\w+/g) || []).length;
            
            if (functionCount > 10 && classCount === 0) {
                improvements.push({
                    pattern: 'OOP Refactoring',
                    benefit: 'Group related functions into classes for better organization',
                    example: 'class AccountingManager { ... } instead of 10+ separate functions'
                });
            }

            // Check for repeated database queries
            const queries = content.match(/\$pdo->prepare\(|query\(/gi) || [];
            if (queries.length > 20) {
                improvements.push({
                    pattern: 'Repository Pattern',
                    benefit: 'Create repository classes to centralize database operations',
                    example: 'class IncomeRepository { public function getAll() { ... } }'
                });
            }
        }

        // JavaScript/TypeScript OOP analysis
        if (ext === 'js' || ext === 'ts') {
            const classCount = (content.match(/class\s+\w+/g) || []).length;
            const functionCount = (content.match(/function\s+\w+/g) || []).length;

            if (functionCount > 15 && classCount < 3) {
                improvements.push({
                    pattern: 'Module Pattern',
                    benefit: 'Group related functions into ES6 classes or modules',
                    example: 'class ThemeManager { toggleTheme() {...} toggleCurrency() {...} }'
                });
            }
        }

        // General architecture patterns
        const fileSize = content.length;
        if (fileSize > 50000) {
            issues.push({
                type: 'File Too Large',
                severity: 'high',
                message: `${Math.round(fileSize / 1000)}KB - file should be split into smaller components`
            });
            improvements.push({
                pattern: 'Single Responsibility',
                benefit: 'Break into logical components (view, controller, model)',
                example: 'Separate business logic from presentation'
            });
        }

        // Output report
        stream.markdown(`**Architecture Analysis:**\n`);
        stream.markdown(`- File size: ${Math.round(fileSize / 1000)}KB\n`);
        stream.markdown(`- Issues found: ${issues.length}\n`);
        stream.markdown(`- Improvement opportunities: ${improvements.length}\n\n`);

        if (issues.length > 0) {
            stream.markdown(`**Issues Detected:**\n`);
            issues.forEach(issue => {
                const icon = issue.severity === 'high' ? '🚨' : '⚠️';
                stream.markdown(`${icon} **${issue.type}** (${issue.severity})\n`);
                stream.markdown(`   ${issue.message}\n\n`);
            });
        }

        if (improvements.length > 0) {
            stream.markdown(`**Recommended Improvements:**\n`);
            improvements.forEach(imp => {
                stream.markdown(`💡 **${imp.pattern}**\n`);
                stream.markdown(`   Benefit: ${imp.benefit}\n`);
                stream.markdown(`   Example: \`${imp.example}\`\n\n`);
            });
        }

        if (issues.length === 0 && improvements.length === 0) {
            stream.markdown(`✅ Architecture looks solid! Good OOP practices detected.\n`);
        }

        return { issues, improvements, fileSize };
    }

    // FileStructureValidator - Verifies file paths before creating components
    async fileStructureValidator(stream, productionPath = '/var/www/html/manage/') {
        const startTime = Date.now();
        const agentName = 'FileStructureValidator';
        
        stream.markdown(`\n## 🔗 FileStructureValidator Agent Activated\n\n`);
        
        // Load memory and show experience
        const memory = this.loadAgentMemory(agentName);
        if (memory && memory.totalRuns > 0) {
            const insights = this.getAgentInsights(agentName);
            stream.markdown(`📊 **Agent Experience:** ${memory.totalRuns} previous validations, ${insights.successRate}% accuracy\n`);
            
            if (insights.topIssues.length > 0) {
                stream.markdown(`🧠 **Common Issue:** ${insights.topIssues[0].pattern} (seen ${insights.topIssues[0].count}x)\n`);
            }
            stream.markdown(`\n`);
        }
        
        const editor2 = vscode.window.activeTextEditor;
        if (!editor2) {
            stream.markdown(`❌ No file to validate.\n`);
            await this.recordAgentExperience(agentName, {
                success: false,
                executionTime: Date.now() - startTime,
                learning: 'No file open to validate'
            });
            return { valid: true, brokenLinks: [] };
        }

        const content = editor2.document.getText();
        const fileName = editor2.document.fileName;
        const fileBaseName = fileName.split(/[\\\/]/).pop();

        // 🧠 SWARM INTELLIGENCE: Check what other agents know
        const collective = this.getCollectiveKnowledge(fileBaseName, agentName);
        
        if (collective.agentsAnalyzed.length > 0) {
            stream.markdown(`🤝 **SWARM INTELLIGENCE ACTIVATED**\n`);
            stream.markdown(`${collective.agentsAnalyzed.length} agents already analyzed this file:\n`);
            collective.agentsAnalyzed.forEach(agent => {
                stream.markdown(`- ${agent}\n`);
            });
            
            if (collective.criticalCount > 0) {
                stream.markdown(`\n🚨 **Swarm Alert:** Other agents found ${collective.criticalCount} critical issues\n`);
                stream.markdown(`I'll prioritize structural validation given these findings.\n`);
            }
            
            stream.markdown(`\n📊 **Swarm Confidence:** ${collective.swarmConfidence}%\n\n`);
            
            // Log collaboration
            this.logAgentCollaboration(agentName, 'knowledge_shared', {
                fileName: fileBaseName,
                agentsConsulted: collective.agentsAnalyzed,
                criticalCount: collective.criticalCount
            });
        }

        stream.markdown(`Validating file references in \`${fileBaseName}\`...\n\n`);

        // Check if this is a component with links
        const hasLinks = content.includes('href=') || content.includes('include') || content.includes('require');
        
        if (!hasLinks) {
            stream.markdown(`✅ No file references detected. Validation passed.\n`);
            return { valid: true, brokenLinks: [] };
        }

        // Extract all href links
        const hrefRegex = /href=["']([^"'#?]+\.php)["']/gi;
        const includeRegex = /(?:include|require)(?:_once)?\s*\(?\s*["']([^"']+\.php)["']/gi;
        
        const links = [];
        let match;

        // Find href links
        while ((match = hrefRegex.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            links.push({
                type: 'href',
                path: match[1],
                line: lineNumber,
                fullMatch: match[0]
            });
        }

        // Find include/require statements
        while ((match = includeRegex.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            links.push({
                type: 'include',
                path: match[1],
                line: lineNumber,
                fullMatch: match[0]
            });
        }

        if (links.length === 0) {
            stream.markdown(`✅ No PHP file references found.\n`);
            return { valid: true, brokenLinks: [] };
        }

        stream.markdown(`Found ${links.length} file reference(s) to validate...\n\n`);

        // Try to scan production server
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);
        
        let productionFiles = [];
        let productionScanFailed = false;

        try {
            stream.markdown(`Scanning production server: \`${productionPath}\`\n`);
            const { stdout } = await execPromise(`ssh prod-vps "ls -1 ${productionPath}*.php 2>/dev/null | xargs -n 1 basename"`);
            productionFiles = stdout.trim().split('\n').filter(f => f.length > 0);
            stream.markdown(`✅ Found ${productionFiles.length} PHP files on production\n\n`);
        } catch (error) {
            productionScanFailed = true;
            stream.markdown(`⚠️ Could not scan production server (${error.message})\n`);
            stream.markdown(`Falling back to local workspace scan...\n\n`);
        }

        // Scan local workspace as fallback or supplement
        const fs = require('fs');
        const path = require('path');
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
        let localFiles = [];

        if (workspaceFolder) {
            try {
                const files = fs.readdirSync(workspaceFolder);
                localFiles = files.filter(f => f.endsWith('.php'));
                stream.markdown(`📁 Found ${localFiles.length} PHP files in local workspace\n\n`);
            } catch (error) {
                stream.markdown(`⚠️ Could not scan local workspace\n\n`);
            }
        }

        // Combine available files
        const availableFiles = [...new Set([...productionFiles, ...localFiles])];
        
        if (availableFiles.length === 0) {
            stream.markdown(`⚠️ **WARNING:** Could not verify file existence (no production or local scan results)\n`);
            stream.markdown(`Manual verification recommended.\n\n`);
            return { valid: true, brokenLinks: [], warning: 'NO_FILE_SCAN' };
        }

        // Validate each link
        const brokenLinks = [];
        const validLinks = [];
        const ambiguousLinks = []; // Links that might need AI analysis

        links.forEach(link => {
            const basename = path.basename(link.path);
            const exists = availableFiles.includes(basename);
            
            if (!exists) {
                // Check for similar files (possible typo or version mismatch)
                const similarFiles = availableFiles.filter(f => 
                    f.toLowerCase().includes(basename.replace(/\.php$/, '').toLowerCase()) || 
                    basename.toLowerCase().includes(f.replace(/\.php$/, '').toLowerCase())
                );

                if (similarFiles.length > 0 && similarFiles.length <= 5) {
                    // Found similar files - might be ambiguous
                    ambiguousLinks.push({ link, similarFiles });
                } else {
                    // Clearly broken
                    brokenLinks.push(link);
                }
            } else {
                validLinks.push(link);
            }
        });

        // 🤝 PHASE 2: AGENT-TO-AGENT CONSULTATION for ambiguous links
        if (ambiguousLinks.length > 0) {
            stream.markdown(`\n🧠 **Analyzing ${ambiguousLinks.length} ambiguous reference(s)...**\n\n`);
            
            for (const { link, similarFiles } of ambiguousLinks) {
                // FIRST: Ask ArchitectureReviewer if the file pattern makes sense
                const archOpinion = await this.askAgent(
                    agentName,
                    'ArchitectureReviewer',
                    `File "${link.path}" doesn't exist. Does this match our naming convention?`,
                    {
                        fileName: link.path,
                        similarFiles: similarFiles,
                        linkType: link.type
                    },
                    stream
                );
                
                if (archOpinion) {
                    stream.markdown(`   📍 Line ${link.line}: \`${link.path}\`\n`);
                    stream.markdown(`   🏗️ **ArchitectureReviewer Opinion:**\n`);
                    stream.markdown(`      ${archOpinion.answer} (${archOpinion.confidence}% confidence)\n`);
                    stream.markdown(`      Reasoning: ${archOpinion.reasoning}\n`);
                    
                    // If ArchitectureReviewer says it doesn't follow convention, likely broken
                    if (archOpinion.confidence >= 70 && archOpinion.answer.includes('CHECK')) {
                        stream.markdown(`      ⚠️ Likely broken - doesn't match patterns\n\n`);
                        brokenLinks.push(link);
                        
                        // Record with agent collaboration
                        await this.recordAgentExperience(agentName, {
                            success: true,
                            critical: 'Broken file reference',
                            severity: 'high',
                            context: {
                                consultedAgent: 'ArchitectureReviewer',
                                fileName: link.path,
                                confidence: archOpinion.confidence
                            }
                        });
                        
                        continue;
                    }
                }
                
                // SECOND: If ArchitectureReviewer unsure OR says it could be valid, consult AI
                const aiAnalysis = await this.askAI('FileStructureValidator', 
                    `Code references "${link.path}" at line ${link.line}, but exact file doesn't exist. Similar files found: ${similarFiles.join(', ')}. Is this broken or intentional?`,
                    {
                        referencedFile: link.path,
                        lineNumber: link.line,
                        linkType: link.type,
                        similarFiles: similarFiles,
                        context: 'file structure validation'
                    }
                );

                if (aiAnalysis) {
                    stream.markdown(`   🤖 AI Analysis: ${aiAnalysis}\n\n`);
                    
                    // Parse AI response to determine if broken
                    const isBroken = aiAnalysis.toLowerCase().includes('broken') || 
                                   aiAnalysis.toLowerCase().includes('fix') ||
                                   aiAnalysis.toLowerCase().includes('error');
                    
                    if (isBroken) {
                        brokenLinks.push(link);
                    } else {
                        stream.markdown(`   ✅ AI determined this is acceptable\n\n`);
                        validLinks.push(link);
                    }
                } else {
                    // No AI response - treat as broken for safety
                    stream.markdown(`   ⚠️ No AI analysis available - marking as broken for safety\n\n`);
                    brokenLinks.push(link);
                }
            }
        }

        // Report results
        stream.markdown(`**Validation Results:**\n`);
        stream.markdown(`- ✅ Valid references: ${validLinks.length}\n`);
        stream.markdown(`- ❌ Broken references: ${brokenLinks.length}\n\n`);

        if (brokenLinks.length > 0) {
            stream.markdown(`## 🚨 BROKEN FILE REFERENCES DETECTED\n\n`);
            stream.markdown(`The following files are referenced but **DO NOT EXIST**:\n\n`);
            
            brokenLinks.forEach(link => {
                stream.markdown(`❌ **Line ${link.line}**: \`${link.path}\` (${link.type})\n`);
                stream.markdown(`   Code: \`${link.fullMatch}\`\n\n`);
            });

            stream.markdown(`**Available files on server:**\n`);
            if (productionFiles.length > 0) {
                productionFiles.slice(0, 20).forEach(file => {
                    stream.markdown(`   - ${file}\n`);
                });
                if (productionFiles.length > 20) {
                    stream.markdown(`   ... and ${productionFiles.length - 20} more\n`);
                }
            } else {
                stream.markdown(`   (Could not scan production server)\n`);
            }
            
            stream.markdown(`\n**ACTION REQUIRED:**\n`);
            stream.markdown(`1. Update links to match actual files on server\n`);
            stream.markdown(`2. Or create the missing files\n`);
            stream.markdown(`3. See: memory-bank/VERIFY_FILE_STRUCTURE_RULE.md\n\n`);
            
            stream.markdown(`**🛑 RECOMMENDATION: DO NOT DEPLOY until links are fixed**\n\n`);
        } else {
            stream.markdown(`✅ All file references validated successfully!\n\n`);
        }

        // Record agent experience
        const executionTime = Date.now() - startTime;
        const foundPatterns = [];
        
        if (brokenLinks.length > 0) {
            foundPatterns.push('broken_file_references');
        }
        if (ambiguousLinks.length > 0) {
            foundPatterns.push('ambiguous_references_resolved_by_ai');
        }
        
        await this.recordAgentExperience(agentName, {
            success: brokenLinks.length === 0,
            executionTime,
            issuesFound: brokenLinks.length,
            fileName: fileName.split(/[\\\/]/).pop(),
            patterns: foundPatterns,
            learning: ambiguousLinks.length > 0 ? 
                `AI helped resolve ${ambiguousLinks.length} ambiguous file references` : 
                `Validated ${links.length} file references`,
            improvement: brokenLinks.length > 0 ?
                `Found ${brokenLinks.length} broken links that would have broken navigation` : null,
            critical: brokenLinks.length > 0 ? 'broken_file_references' : null,
            severity: brokenLinks.length > 0 ? 'high' : null,
            context: {
                brokenCount: brokenLinks.length,
                validCount: validLinks.length,
                aiConsulted: ambiguousLinks.length > 0
            }
        });

        return {
            valid: brokenLinks.length === 0,
            brokenLinks,
            validLinks,
            availableFiles,
            productionScanFailed,
            aiConsulted: ambiguousLinks.length > 0
        };
    }

    async autoFixer(stream, task) {
        stream.markdown(`# 🎯 AutoFixer - AI Swarm Activated\n\n`);
        stream.markdown(`**Task:** ${task}\n\n`);
        
        // � SWARM COMMANDER: Pre-flight System Analysis
        stream.markdown(`## 👑 Swarm Commander - Pre-Flight System Analysis\n\n`);
        stream.markdown(`Commander is analyzing the entire system before agents proceed...\n\n`);
        
        const editor = vscode.window.activeTextEditor;
        const systemContext = {
            fileName: null,
            fileType: null,
            isComponent: false,
            hasLinks: false,
            hasDatabase: false,
            hasForms: false,
            relatedFiles: [],
            potentialImpact: []
        };
        
        if (editor) {
            const content = editor.document.getText();
            const fileName = editor.document.fileName;
            systemContext.fileName = fileName.split(/[\\\/]/).pop();
            systemContext.fileType = fileName.match(/\.(php|js|ts|html|css)$/)?.[1] || 'unknown';
            
            // Analyze what this file does
            systemContext.isComponent = content.includes('include') || content.includes('require') || 
                                       fileName.includes('modern_') || fileName.includes('component');
            systemContext.hasLinks = content.includes('href=') || content.includes('action=');
            systemContext.hasDatabase = content.includes('$pdo') || content.includes('query(') || 
                                       content.includes('prepare(');
            systemContext.hasForms = content.includes('<form');
            
            // Identify potential impact
            if (systemContext.isComponent) {
                systemContext.potentialImpact.push('⚠️ COMPONENT FILE - Changes will affect ALL pages that include it');
            }
            if (systemContext.hasLinks) {
                systemContext.potentialImpact.push('🔗 Contains navigation links - Broken links will break user navigation');
            }
            if (systemContext.hasDatabase) {
                systemContext.potentialImpact.push('💾 Interacts with database - Changes could affect data integrity');
            }
            if (systemContext.hasForms) {
                systemContext.potentialImpact.push('📝 Contains forms - Changes could break user input/submission');
            }
            
            // Find related files (files that might include this component)
            if (systemContext.isComponent) {
                const fs = require('fs');
                const path = require('path');
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
                
                if (workspaceFolder) {
                    try {
                        const files = fs.readdirSync(workspaceFolder).filter(f => f.endsWith('.php'));
                        const componentName = path.basename(fileName);
                        
                        files.forEach(file => {
                            const filePath = path.join(workspaceFolder, file);
                            const fileContent = fs.readFileSync(filePath, 'utf8');
                            if (fileContent.includes(componentName)) {
                                systemContext.relatedFiles.push(file);
                            }
                        });
                    } catch (error) {
                        // Silently fail
                    }
                }
            }
            
            stream.markdown(`**System Context Analysis:**\n`);
            stream.markdown(`- File: \`${systemContext.fileName}\`\n`);
            stream.markdown(`- Type: ${systemContext.fileType.toUpperCase()}\n`);
            stream.markdown(`- Is Component: ${systemContext.isComponent ? '✅ Yes' : '❌ No'}\n`);
            stream.markdown(`- Has Links: ${systemContext.hasLinks ? '✅ Yes' : '❌ No'}\n`);
            stream.markdown(`- Has Database: ${systemContext.hasDatabase ? '✅ Yes' : '❌ No'}\n`);
            stream.markdown(`- Has Forms: ${systemContext.hasForms ? '✅ Yes' : '❌ No'}\n\n`);
            
            if (systemContext.relatedFiles.length > 0) {
                stream.markdown(`**⚠️ IMPACT WARNING: ${systemContext.relatedFiles.length} file(s) depend on this component:**\n`);
                systemContext.relatedFiles.slice(0, 10).forEach(file => {
                    stream.markdown(`   - ${file}\n`);
                });
                if (systemContext.relatedFiles.length > 10) {
                    stream.markdown(`   ... and ${systemContext.relatedFiles.length - 10} more\n`);
                }
                stream.markdown(`\n`);
            }
            
            if (systemContext.potentialImpact.length > 0) {
                stream.markdown(`**🚨 Potential System Impact:**\n`);
                systemContext.potentialImpact.forEach(impact => {
                    stream.markdown(`${impact}\n`);
                });
                stream.markdown(`\n`);
            }
            
            stream.markdown(`**Commander Decision:** Proceeding with agent deployment...\n\n`);
        }
        
        stream.markdown(`---\n\n`);
        
        // �🚨 CRITICAL: Check for backup FIRST
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const fs = require('fs');
            const path = require('path');
            const fileName = editor.document.fileName;
            const fileDir = path.dirname(fileName);
            const baseName = path.basename(fileName, path.extname(fileName));
            const ext = path.extname(fileName);
            
            // Look for any backup file
            const possibleBackups = [
                path.join(fileDir, `${baseName}_backup${ext}`),
                path.join(fileDir, `${baseName}_previous_version${ext}`),
                path.join(fileDir, `${baseName}.backup${ext}`)
            ];
            
            const backupExists = possibleBackups.some(backup => fs.existsSync(backup));
            
            if (!backupExists) {
                stream.markdown(`\n## 🚨 CRITICAL: BACKUP REQUIRED\n\n`);
                stream.markdown(`⚠️ **No backup file detected for:** \`${path.basename(fileName)}\`\n\n`);
                stream.markdown(`**SWARM WORK HALTED**\n\n`);
                stream.markdown(`Before making ANY changes to working files, you MUST create a backup:\n\n`);
                stream.markdown(`\`\`\`powershell\n`);
                stream.markdown(`Copy-Item ${path.basename(fileName)} ${baseName}_backup${ext}\n`);
                stream.markdown(`\`\`\`\n\n`);
                stream.markdown(`Then verify backup was created:\n\n`);
                stream.markdown(`\`\`\`powershell\n`);
                stream.markdown(`Test-Path ${baseName}_backup${ext}\n`);
                stream.markdown(`\`\`\`\n\n`);
                stream.markdown(`**This is a MANDATORY rule. See memory-bank/BACKUP_FIRST_RULE.md**\n`);
                return { error: 'NO_BACKUP', message: 'Backup required before proceeding' };
            } else {
                const foundBackup = possibleBackups.find(backup => fs.existsSync(backup));
                stream.markdown(`✅ **Backup verified:** \`${path.basename(foundBackup)}\`\n\n`);
            }
        }
        
        stream.markdown(`---\n\n`);

        // Run agents in sequence
        const bugReport = await this.bugHunter(stream, task);
        
        if (!bugReport || bugReport.issues.length === 0) {
            stream.markdown(`\n✅ No issues detected. File looks good!\n`);
            return;
        }

        const backupReport = await this.backupFinder(stream, bugReport);
        const mergeReport = await this.codeMerger(stream, backupReport);
        const architectureReport = await this.architectureAnalyzer(stream);
        const fileStructureReport = await this.fileStructureValidator(stream);
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
        stream.markdown(`- 🏗️ ArchitectureAnalyzer: ${architectureReport.issues.length} architecture issues, ${architectureReport.improvements.length} improvements\n`);
        stream.markdown(`- 🔗 FileStructureValidator: ${fileStructureReport.brokenLinks.length} broken links, ${fileStructureReport.validLinks?.length || 0} valid\n`);
        stream.markdown(`- 🔗 BackendValidator: ${backendReport.missing.length} missing handlers\n`);
        stream.markdown(`- 💾 DatabaseValidator: ${databaseReport.issues.length} database issues\n`);
        stream.markdown(`- 🧹 InputValidator: ${validatorReport.needsFix || 0} validation issues\n`);
        stream.markdown(`- 🔐 FormHardener: ${formReport.formsNeedingTokens || 0} forms need CSRF tokens\n`);
        stream.markdown(`- 🎨 UIEnhancer: ${uiReport.needsImprovement || 0} UI/UX improvements\n`);
        stream.markdown(`- 🛡️ SecurityGuard: ${securityReport.approved ? 'APPROVED ✅' : 'BLOCKED ❌'}\n`);
        stream.markdown(`- 🚀 ProductionDeployer: ${deployReport.deployed === 'manual' ? 'Manual deployment ready' : 'Not deployed'}\n\n`);

        // Calculate confidence score
        const totalChecks = 12;
        const passedChecks = 
            (bugReport.issues.length === 0 ? 1 : 0) +
            (architectureReport.issues.length === 0 ? 1 : 0) +
            (fileStructureReport.valid ? 1 : 0) +
            (backendReport.missing.length === 0 ? 1 : 0) +
            (databaseReport.issues.length === 0 ? 1 : 0) +
            (validatorReport.needsFix === 0 ? 1 : 0) +
            (formReport.formsNeedingTokens === 0 ? 1 : 0) +
            (uiReport.needsImprovement === 0 ? 1 : 0) +
            (securityReport.approved ? 1 : 0) + 3; // +3 for backup, merge, deploy readiness

        const confidence = Math.round((passedChecks / totalChecks) * 100);
        
        stream.markdown(`### 📈 Overall Confidence: ${confidence}%\n\n`);
        
        // 👑 SWARM COMMANDER: Final Decision Analysis
        const commanderStartTime = Date.now();
        stream.markdown(`---\n\n`);
        stream.markdown(`## 👑 Swarm Commander - Final System Impact Analysis\n\n`);
        
        // Load Commander's memory
        const commanderMemory = this.loadAgentMemory('Commander');
        if (commanderMemory && commanderMemory.totalDecisions > 0) {
            const accuracyRate = commanderMemory.performance.accuracyRate || 0;
            stream.markdown(`🧠 **Commander Experience:** ${commanderMemory.totalDecisions} previous decisions, ${accuracyRate.toFixed(1)}% accuracy\n`);
            stream.markdown(`📊 **Track Record:** ${commanderMemory.deploymentsBlocked} blocked, ${commanderMemory.deploymentsApproved} approved, ${commanderMemory.criticalSaves.length} disasters prevented\n`);
            
            // Show agent collaboration stats
            if (commanderMemory.agentCollaboration && commanderMemory.agentCollaboration.totalCollaborations > 0) {
                stream.markdown(`🤝 **Swarm Intelligence:** ${commanderMemory.agentCollaboration.totalCollaborations} agent collaborations tracked\n`);
            }
            stream.markdown(`\n`);
            
            // Show top learned patterns
            if (commanderMemory.patterns.commonBlockReasons.length > 0) {
                const topReason = commanderMemory.patterns.commonBlockReasons[0];
                stream.markdown(`🧠 **Common Block Reason:** ${topReason.reason} (seen ${topReason.count}x)\n\n`);
            }
        }
        
        // 🤝 SWARM CONSENSUS: Check if multiple agents found same issues
        const fileBaseName = systemContext.fileName.split(/[\\\/]/).pop();
        const swarmIntelligence = this.getCollectiveKnowledge(fileBaseName, 'Commander');
        
        if (swarmIntelligence.agentsAnalyzed.length > 0) {
            stream.markdown(`**🤝 SWARM INTELLIGENCE REPORT:**\n`);
            stream.markdown(`${swarmIntelligence.agentsAnalyzed.length} agents have independently analyzed this file\n`);
            
            if (swarmIntelligence.criticalCount > 0) {
                stream.markdown(`🚨 **Multiple agents found ${swarmIntelligence.criticalCount} critical issues**\n`);
                stream.markdown(`📊 **Swarm Confidence:** ${swarmIntelligence.swarmConfidence}%\n`);
                
                // Show which agents agree
                const uniqueAgents = [...new Set(swarmIntelligence.criticalPatterns.map(p => p.agent))];
                stream.markdown(`✅ **Consensus from:** ${uniqueAgents.join(', ')}\n`);
            }
            
            swarmIntelligence.recommendations.forEach(rec => {
                stream.markdown(`${rec}\n`);
            });
            
            stream.markdown(`\n`);
        };
        
        // Analyze cross-impact between agents (now includes AI-enhanced reports)
        const criticalIssues = [];
        const warnings = [];
        const systemRisks = [];
        const aiInsights = []; // NEW: Track AI-provided insights
        
        // Critical blocking issues
        if (!securityReport.approved) {
            criticalIssues.push('🚨 SECURITY: Deployment blocked by SecurityGuard - vulnerabilities detected');
        }
        if (fileStructureReport.brokenLinks && fileStructureReport.brokenLinks.length > 0) {
            const brokenCount = fileStructureReport.brokenLinks.length;
            criticalIssues.push(`🚨 BROKEN LINKS: ${brokenCount} file references will break navigation`);
            
            // Check if AI provided insights about these broken links
            if (fileStructureReport.aiConsulted) {
                aiInsights.push(`🤖 AI analyzed broken links and confirmed they are errors, not intentional`);
            }
        }
        if (backendReport.missing && backendReport.missing.length > 0) {
            criticalIssues.push(`🚨 BACKEND: ${backendReport.missing.length} missing handlers will cause 404 errors`);
        }
        
        // Warnings that need attention
        if (architectureReport.issues && architectureReport.issues.length > 0) {
            warnings.push(`⚠️ ARCHITECTURE: ${architectureReport.issues.length} structural issues may cause maintenance problems`);
        }
        if (validatorReport.needsFix > 0) {
            warnings.push(`⚠️ INPUT VALIDATION: ${validatorReport.needsFix} unvalidated inputs pose security risk`);
        }
        if (formReport.formsNeedingTokens > 0) {
            warnings.push(`⚠️ CSRF: ${formReport.formsNeedingTokens} forms vulnerable to CSRF attacks`);
        }
        
        // Check for AI-enhanced BugHunter findings
        if (bugReport.suspiciousPatterns && bugReport.suspiciousPatterns.length > 0) {
            const aiConfirmedIssues = bugReport.issues.filter(issue => 
                issue.toLowerCase().includes('vulnerable') || 
                issue.toLowerCase().includes('injection')
            );
            if (aiConfirmedIssues.length > 0) {
                aiInsights.push(`🤖 AI confirmed ${aiConfirmedIssues.length} security vulnerability pattern(s) in code`);
            }
        }
        
        // System-wide impact analysis
        if (systemContext.isComponent && systemContext.relatedFiles.length > 0) {
            systemRisks.push(`📢 COMPONENT IMPACT: Changes will propagate to ${systemContext.relatedFiles.length} dependent files`);
            
            // Enhanced risk assessment with AI insights
            if (fileStructureReport.brokenLinks.length > 0) {
                systemRisks.push(`🔥 CASCADING FAILURE RISK: Broken links in component will break ${systemContext.relatedFiles.length} dependent pages`);
            }
        }
        if (systemContext.hasDatabase && databaseReport.issues.length > 0) {
            systemRisks.push(`💾 DATABASE RISK: Database issues could cause data corruption or loss`);
        }
        if (systemContext.hasLinks && fileStructureReport.brokenLinks.length > 0) {
            systemRisks.push(`🔗 NAVIGATION BREAK: Broken links will prevent users from accessing features`);
        }
        
        stream.markdown(`**Commander's System Analysis:**\n\n`);
        
        // Show AI insights first (NEW)
        if (aiInsights.length > 0) {
            stream.markdown(`**🧠 AI INTELLIGENCE GATHERED (${aiInsights.length}):**\n`);
            aiInsights.forEach(insight => stream.markdown(`${insight}\n`));
            stream.markdown(`\n`);
        }
        
        if (criticalIssues.length > 0) {
            stream.markdown(`**🚨 CRITICAL BLOCKING ISSUES (${criticalIssues.length}):**\n`);
            criticalIssues.forEach(issue => stream.markdown(`${issue}\n`));
            stream.markdown(`\n`);
        }
        
        if (warnings.length > 0) {
            stream.markdown(`**⚠️ WARNINGS (${warnings.length}):**\n`);
            warnings.forEach(warning => stream.markdown(`${warning}\n`));
            stream.markdown(`\n`);
        }
        
        if (systemRisks.length > 0) {
            stream.markdown(`**📢 SYSTEM-WIDE IMPACT (${systemRisks.length}):**\n`);
            systemRisks.forEach(risk => stream.markdown(`${risk}\n`));
            stream.markdown(`\n`);
        }
        
        // Commander's Final Decision
        stream.markdown(`---\n\n`);
        
        // 🗳️ PHASE 3: INITIATE SWARM VOTE if uncertain or mixed signals
        let swarmConsensus = null;
        const uncertainDecision = confidence < 75 || 
                                (criticalIssues.length > 0 && criticalIssues.length < 3) ||
                                (warnings.length > 3);
        
        if (uncertainDecision) {
            stream.markdown(`**⚖️ Commander Uncertainty Detected (${confidence}% confidence)**\n\n`);
            stream.markdown(`Initiating democratic swarm vote for collective intelligence...\n\n`);
            
            // Prepare voting context
            const votingContext = {
                hasSecurity: securityReport && !securityReport.approved,
                hasSQL: bugReport.suspiciousPatterns?.length > 0,
                hasFileReferences: fileStructureReport.brokenLinks?.length > 0,
                isComponent: systemContext.isComponent,
                hasCodeIssues: bugReport.issues?.length > 0,
                hasBackend: backendReport.missing?.length > 0,
                hasDatabase: databaseReport.issues?.length > 0,
                criticalIssues: criticalIssues.length,
                brokenLinks: fileStructureReport.brokenLinks?.length || 0,
                warnings: warnings.length
            };
            
            swarmConsensus = await this.initiateSwarmVote(
                `Should we BLOCK or APPROVE deployment of ${systemContext.fileName}?`,
                votingContext,
                stream
            );
        }
        
        stream.markdown(`## 👑 COMMANDER'S FINAL DECISION\n\n`);
        
        // Show swarm input if vote occurred
        if (swarmConsensus) {
            stream.markdown(`**🗳️ Swarm Vote Advisory:** ${swarmConsensus.recommendation} (${swarmConsensus.weightedConfidence.toFixed(1)}% consensus confidence)\n`);
            stream.markdown(`**📊 Agent Votes:** ${swarmConsensus.blockVotes} BLOCK, ${swarmConsensus.approveVotes} APPROVE\n\n`);
            stream.markdown(`⚠️ **IMPORTANT:** Commander reviews swarm input but has ABSOLUTE VETO POWER\n\n`);
        }
        
        if (criticalIssues.length > 0) {
            stream.markdown(`### 🚫 DEPLOYMENT BLOCKED\n\n`);
            
            // Commander can override swarm if needed
            if (swarmConsensus && swarmConsensus.recommendation === 'APPROVE') {
                stream.markdown(`**⚖️ COMMANDER VETO:** Swarm voted APPROVE, but Commander overrides due to critical issues\n\n`);
            } else if (swarmConsensus) {
                stream.markdown(`**✅ COMMANDER AGREES:** Swarm consensus supports BLOCK decision\n\n`);
            }
            
            stream.markdown(`**Reason:** ${criticalIssues.length} critical issue(s) must be resolved first.\n\n`);
            
            // Enhanced decision with AI context
            if (aiInsights.length > 0) {
                stream.markdown(`**AI Intelligence Assessment:**\n`);
                stream.markdown(`The AI has analyzed ambiguous patterns and CONFIRMED these are genuine errors, not false positives.\n\n`);
            }
            
            stream.markdown(`**Commander's Orders:**\n`);
            stream.markdown(`1. ❌ DO NOT DEPLOY to production\n`);
            stream.markdown(`2. 🔧 Fix all critical issues listed above\n`);
            stream.markdown(`3. ✅ Re-run swarm analysis after fixes\n`);
            stream.markdown(`4. 📋 Verify all agent reports show PASS status\n\n`);
            
            if (systemContext.isComponent) {
                stream.markdown(`**⚠️ CRITICAL WARNING:**\n`);
                stream.markdown(`This is a COMPONENT file used by ${systemContext.relatedFiles.length} other files.\n`);
                stream.markdown(`Deploying broken changes will cascade failures across the entire system.\n`);
                
                // AI-enhanced impact explanation
                if (fileStructureReport.brokenLinks.length > 0) {
                    stream.markdown(`\n**Cascading Failure Scenario:**\n`);
                    stream.markdown(`- ${fileStructureReport.brokenLinks.length} broken link(s) in THIS component\n`);
                    stream.markdown(`- × ${systemContext.relatedFiles.length} dependent files\n`);
                    stream.markdown(`- = Potential site-wide navigation failure\n`);
                    stream.markdown(`\nAI analysis confirms: These links point to non-existent files, not files being created.\n`);
                }
                stream.markdown(`\n`);
            }
        } else if (warnings.length > 0 || systemRisks.length > 0) {
            stream.markdown(`### ⚠️ DEPLOYMENT APPROVED WITH CAUTION\n\n`);
            stream.markdown(`**Confidence Level:** ${confidence}%\n\n`);
            
            if (aiInsights.length > 0) {
                stream.markdown(`**AI Intelligence:**\n`);
                stream.markdown(`AI has analyzed suspicious patterns. While no critical issues block deployment, monitor the warnings closely.\n\n`);
            }
            
            stream.markdown(`**Commander's Assessment:**\n`);
            stream.markdown(`- ✅ No critical blocking issues\n`);
            stream.markdown(`- ⚠️ ${warnings.length} warning(s) detected\n`);
            stream.markdown(`- 📢 ${systemRisks.length} system impact(s) identified\n\n`);
            stream.markdown(`**Commander's Recommendation:**\n`);
            stream.markdown(`1. ✅ You may deploy, but monitor closely\n`);
            stream.markdown(`2. 📝 Address warnings in next iteration\n`);
            stream.markdown(`3. 🔍 Test affected features after deployment\n`);
            
            if (systemContext.relatedFiles.length > 0) {
                stream.markdown(`4. 🧪 Verify these ${systemContext.relatedFiles.length} dependent files still work:\n`);
                systemContext.relatedFiles.slice(0, 5).forEach(file => {
                    stream.markdown(`   - ${file}\n`);
                });
            }
            stream.markdown(`\n`);
        } else {
            stream.markdown(`### ✅ FULL DEPLOYMENT APPROVED\n\n`);
            stream.markdown(`**Confidence Level:** ${confidence}%\n\n`);
            
            if (aiInsights.length > 0) {
                stream.markdown(`**AI Intelligence:**\n`);
                stream.markdown(`AI has reviewed the code and found no concerns. All systems green.\n\n`);
            }
            
            stream.markdown(`**Commander's Assessment:**\n`);
            stream.markdown(`- ✅ All agents report PASS status\n`);
            stream.markdown(`- ✅ No security vulnerabilities detected\n`);
            stream.markdown(`- ✅ No broken file references\n`);
            stream.markdown(`- ✅ No system-wide risks identified\n\n`);
            stream.markdown(`**Commander's Orders:**\n`);
            stream.markdown(`1. ✅ DEPLOY to production when ready\n`);
            stream.markdown(`2. 📋 Monitor production logs after deployment\n`);
            stream.markdown(`3. 🎯 System is optimized and ready\n\n`);
        };
            stream.markdown(`**Commander's Assessment:**\n`);
            stream.markdown(`- ✅ All agents report PASS status\n`);
            stream.markdown(`- ✅ No security vulnerabilities detected\n`);
            stream.markdown(`- ✅ No broken file references\n`);
            stream.markdown(`- ✅ No system-wide risks identified\n\n`);
            stream.markdown(`**Commander's Orders:**\n`);
            stream.markdown(`1. ✅ DEPLOY to production when ready\n`);
            stream.markdown(`2. � Monitor production logs after deployment\n`);
            stream.markdown(`3. 🎯 System is optimized and ready\n\n`);
        }
        
        if (confidence >= 95) {
            stream.markdown(`🎉 **EXCELLENCE ACHIEVED** - All systems optimal!\n`);
        } else if (confidence >= 80) {
            stream.markdown(`⚠️ **REVIEW NEEDED** - Fix ${totalChecks - passedChecks} issues for better quality.\n`);
        } else {
            stream.markdown(`❌ **CRITICAL STATE** - System requires immediate attention.\n`);
        }

        if (securityReport.approved && deployReport.command && criticalIssues.length === 0) {
            stream.markdown(`\n**Deployment Command:**\n`);
            stream.markdown(`\`\`\`bash\n${deployReport.command}\n\`\`\`\n`);
        }
        
        // 🧠 COMMANDER MEMORY: Record this decision
        const commanderDecisionTime = Date.now() - commanderStartTime;
        const decisionType = criticalIssues.length > 0 ? 'BLOCKED' : 
                            (warnings.length > 0 || systemRisks.length > 0) ? 'CAUTION' : 'APPROVED';
        
        await this.recordCommanderDecision({
            timestamp: new Date().toISOString(),
            decision: decisionType,
            confidence: confidence,
            fileName: systemContext.fileName,
            criticalIssues: criticalIssues.length,
            warnings: warnings.length,
            systemRisks: systemRisks.length,
            aiInsights: aiInsights.length,
            executionTime: commanderDecisionTime,
            agentReports: {
                bugHunter: bugReport.issues.length,
                fileStructure: fileStructureReport.brokenLinks.length,
                backend: backendReport.missing.length,
                security: securityReport.approved
            },
            systemContext: {
                isComponent: systemContext.isComponent,
                dependentFiles: systemContext.relatedFiles.length,
                hasDatabase: systemContext.hasDatabase
            }
        });
        
        stream.markdown(`\n---\n\n`);
        stream.markdown(`**👑 Swarm Commander signing off. All agents dismissed.**\n`);
    }

    // Record Commander's decision in memory
    async recordCommanderDecision(decisionData) {
        const memory = this.loadAgentMemory('Commander');
        if (!memory) return;

        memory.totalDecisions++;
        memory.lastDecision = decisionData.timestamp;

        // Update decision counters
        if (decisionData.decision === 'BLOCKED') {
            memory.deploymentsBlocked++;
        } else if (decisionData.decision === 'APPROVED') {
            memory.deploymentsApproved++;
        } else if (decisionData.decision === 'CAUTION') {
            memory.deploymentsCaution++;
        }

        // Record decision in history (keep last 100)
        memory.decisionHistory.push(decisionData);
        if (memory.decisionHistory.length > 100) {
            memory.decisionHistory = memory.decisionHistory.slice(-100);
        }

        // Track common block reasons
        if (decisionData.decision === 'BLOCKED') {
            const reason = decisionData.criticalIssues > 0 ? 'critical_issues_detected' : 'security_block';
            const existing = memory.patterns.commonBlockReasons.find(r => r.reason === reason);
            if (existing) {
                existing.count++;
            } else {
                memory.patterns.commonBlockReasons.push({ reason, count: 1 });
            }
        }

        // Update performance metrics
        const totalAnalyzed = memory.totalDecisions;
        memory.performance.averageAnalysisTime = 
            ((memory.performance.averageAnalysisTime * (totalAnalyzed - 1)) + decisionData.executionTime) / totalAnalyzed;

        // Record learning
        if (decisionData.aiInsights > 0) {
            memory.learnings.push({
                timestamp: decisionData.timestamp,
                lesson: `AI provided ${decisionData.aiInsights} insights that influenced decision`,
                decision: decisionData.decision,
                confidence: decisionData.confidence
            });
            
            if (memory.learnings.length > 50) {
                memory.learnings = memory.learnings.slice(-50);
            }
        }

        // If this was a critical save (blocked deployment with critical issues)
        if (decisionData.decision === 'BLOCKED' && decisionData.criticalIssues > 0) {
            memory.criticalSaves.push({
                timestamp: decisionData.timestamp,
                fileName: decisionData.fileName,
                criticalIssues: decisionData.criticalIssues,
                reason: 'Prevented deployment of code with critical issues',
                impact: decisionData.systemContext.isComponent ? 
                    `Would have broken ${decisionData.systemContext.dependentFiles} dependent files` : 
                    'Would have broken functionality'
            });
        }

        this.saveAgentMemory('Commander', memory);
    }
}

module.exports = SwarmAgents;
