/**
 * OOP Scanner - Detects Object-Oriented Programming violations and anti-patterns
 * Covers: SOLID principles, design patterns, encapsulation, inheritance, code quality
 */

class OOPScanner {
    constructor() {
        this.patterns = [
            // SOLID Principles
            {
                id: 'OPEN_CLOSED_VIOLATION',
                name: 'Open/Closed Principle Violation',
                severity: 'MEDIUM',
                detect: (code) => {
                    // Detect switch/if-else chains that should use polymorphism
                    const switchPattern = /switch\s*\([^)]+\)\s*{[\s\S]{100,}}/g;
                    const ifElseChain = /if\s*\([^)]+\)\s*{[\s\S]*?}\s*else\s*if[\s\S]{100,}/g;
                    return switchPattern.test(code) || ifElseChain.test(code);
                },
                message: 'Large switch/if-else chain should use polymorphism (Open/Closed Principle)',
                recommendation: 'Replace conditional logic with Strategy pattern or polymorphic classes. This makes code open for extension but closed for modification.',
                example: `// Instead of:
switch(type) {
    case 'admin': return new AdminDashboard();
    case 'user': return new UserDashboard();
}

// Use polymorphism:
const dashboards = {
    admin: AdminDashboard,
    user: UserDashboard
};
return new dashboards[type]();`,
                autoFix: false
            },
            {
                id: 'LISKOV_SUBSTITUTION_VIOLATION',
                name: 'Liskov Substitution Principle Violation',
                severity: 'HIGH',
                regex: /throw\s+new\s+Error\s*\(\s*['"]Not\s+implemented['"]|throw\s+new\s+Error\s*\(\s*['"]Not\s+supported['"]/gi,
                message: 'Subclass throwing "Not implemented" violates Liskov Substitution Principle',
                recommendation: 'Child classes must be substitutable for parent classes. If a method is not applicable, redesign the class hierarchy using interface segregation.',
                example: `// Bad - violates LSP:
class Bird { fly() { /* flies */ } }
class Penguin extends Bird { 
    fly() { throw new Error("Not supported"); } // LSP violation
}

// Good - proper hierarchy:
class Bird { }
class FlyingBird extends Bird { fly() { /* flies */ } }
class Penguin extends Bird { swim() { /* swims */ } }`,
                autoFix: false
            },
            {
                id: 'ENCAPSULATION_VIOLATION',
                name: 'Poor Encapsulation - Public Properties',
                severity: 'MEDIUM',
                detect: (code) => {
                    // Detect classes with many public properties (should use getters/setters)
                    const classMatch = code.match(/class\s+\w+\s*{([^}]+)}/g);
                    if (!classMatch) return false;
                    
                    for (const classCode of classMatch) {
                        const publicProps = (classCode.match(/this\.\w+\s*=/g) || []).length;
                        const gettersSetters = (classCode.match(/get\s+\w+|set\s+\w+/g) || []).length;
                        if (publicProps > 5 && gettersSetters === 0) return true;
                    }
                    return false;
                },
                message: 'Class has many public properties without getters/setters',
                recommendation: 'Use private properties with getter/setter methods to maintain encapsulation. This allows validation, computed properties, and future changes without breaking API.',
                example: `// Bad:
class User {
    constructor() { this.name = ''; this.email = ''; }
}

// Good:
class User {
    #name; #email;
    get name() { return this.#name; }
    set name(value) { 
        if (!value) throw new Error('Name required');
        this.#name = value; 
    }
}`,
                autoFix: false
            },

            // Design Pattern Anti-patterns
            {
                id: 'SINGLETON_ANTIPATTERN',
                name: 'Singleton Anti-pattern',
                severity: 'MEDIUM',
                regex: /class\s+\w+\s*{[\s\S]*?static\s+instance[\s\S]*?getInstance\s*\(/gi,
                message: 'Singleton pattern detected - consider dependency injection instead',
                recommendation: 'Singletons create hidden dependencies and make testing difficult. Use dependency injection to manage object lifecycle and improve testability.',
                example: `// Instead of Singleton:
class Database {
    static instance;
    static getInstance() { 
        if (!this.instance) this.instance = new Database();
        return this.instance;
    }
}

// Use DI:
class UserService {
    constructor(database) { this.db = database; }
}
const db = new Database();
const service = new UserService(db);`,
                autoFix: false
            },
            {
                id: 'DEEP_INHERITANCE',
                name: 'Deep Inheritance Hierarchy',
                severity: 'MEDIUM',
                detect: (code) => {
                    // Detect extends chains (favor composition over deep inheritance)
                    const extendsCount = (code.match(/extends\s+\w+/g) || []).length;
                    return extendsCount > 3;
                },
                message: 'Deep inheritance hierarchy detected - favor composition over inheritance',
                recommendation: 'Inheritance hierarchies deeper than 3 levels become rigid and hard to maintain. Use composition and interfaces instead.',
                example: `// Bad - deep inheritance:
class Entity extends Base {}
class User extends Entity {}
class Admin extends User {}
class SuperAdmin extends Admin {} // Too deep!

// Good - composition:
class User {
    constructor(permissions) {
        this.permissions = permissions;
    }
}
const admin = new User(new AdminPermissions());`,
                autoFix: false
            },

            // Code Quality Issues
            {
                id: 'HIGH_CYCLOMATIC_COMPLEXITY',
                name: 'High Cyclomatic Complexity',
                severity: 'HIGH',
                detect: (code) => {
                    const functionMatch = code.match(/function\s+\w+[^{]*{([^}]+)}/g);
                    if (!functionMatch) return false;
                    
                    for (const func of functionMatch) {
                        // Count decision points: if, else, case, &&, ||, ?
                        const complexity = 1 + 
                            (func.match(/\b(if|else|case|catch|while|for)\b/g) || []).length +
                            (func.match(/&&|\|\|/g) || []).length +
                            (func.match(/\?/g) || []).length;
                        
                        if (complexity > 10) return true;
                    }
                    return false;
                },
                message: 'Function has high cyclomatic complexity (>10)',
                recommendation: 'Break down complex functions into smaller, single-purpose functions. High complexity makes code hard to test and maintain.',
                example: `// Bad - complexity = 15:
function validateUser(user) {
    if (user && user.name && user.email) {
        if (user.age > 18 || user.hasParent) {
            if (user.verified && user.active) {
                // ... more conditions
            }
        }
    }
}

// Good - break it down:
function validateUser(user) {
    return hasRequiredFields(user) && 
           isEligible(user) && 
           isVerified(user);
}`,
                autoFix: false
            },
            {
                id: 'CODE_DUPLICATION',
                name: 'Code Duplication',
                severity: 'MEDIUM',
                detect: (code) => {
                    // Detect identical code blocks (>3 lines)
                    const lines = code.split('\n');
                    const blocks = new Map();
                    
                    for (let i = 0; i < lines.length - 3; i++) {
                        const block = lines.slice(i, i + 4).join('\n').trim();
                        if (block.length < 50) continue; // Skip small blocks
                        
                        blocks.set(block, (blocks.get(block) || 0) + 1);
                    }
                    
                    for (const [block, count] of blocks) {
                        if (count > 1) return true;
                    }
                    return false;
                },
                message: 'Duplicate code blocks detected',
                recommendation: 'Extract duplicated code into reusable functions or classes (DRY principle). Duplication leads to maintenance nightmares.',
                example: `// Bad:
function createUser() {
    const data = { name, email, timestamp: new Date() };
    validate(data);
    return db.save(data);
}
function createPost() {
    const data = { title, content, timestamp: new Date() };
    validate(data);
    return db.save(data);
}

// Good:
function create(entity, data) {
    const timestamped = { ...data, timestamp: new Date() };
    validate(timestamped);
    return db.save(timestamped);
}`,
                autoFix: false
            },
            {
                id: 'MAGIC_NUMBERS',
                name: 'Magic Numbers/Strings',
                severity: 'LOW',
                regex: /[^a-zA-Z_](100|200|404|500|1000|3600|86400|['"][a-z]{10,}['"])\b(?!\s*[:;])/g,
                message: 'Magic numbers or strings found - use named constants',
                recommendation: 'Replace magic values with named constants. This improves readability and makes changes easier.',
                example: `// Bad:
if (status === 200) { }
setTimeout(() => {}, 3600000);

// Good:
const HTTP_OK = 200;
const ONE_HOUR_MS = 3600000;
if (status === HTTP_OK) { }
setTimeout(() => {}, ONE_HOUR_MS);`,
                autoFix: true,
                fix: (code) => {
                    // Auto-fix common magic numbers
                    return code
                        .replace(/setTimeout\([^,]+,\s*3600000\)/g, 'setTimeout($1, ONE_HOUR_MS)')
                        .replace(/setTimeout\([^,]+,\s*86400000\)/g, 'setTimeout($1, ONE_DAY_MS)');
                }
            },
            {
                id: 'DEAD_CODE',
                name: 'Dead/Unreachable Code',
                severity: 'LOW',
                regex: /return\s+[^;]+;[\s\S]*?(?:const|let|var|if|for|while)/g,
                message: 'Code after return statement is unreachable',
                recommendation: 'Remove dead code to improve readability and reduce confusion.',
                example: `// Bad:
function process() {
    return true;
    console.log('This never runs'); // Dead code
}

// Good:
function process() {
    console.log('Processing...');
    return true;
}`,
                autoFix: false
            },
            {
                id: 'UNUSED_IMPORTS',
                name: 'Unused Imports/Variables',
                severity: 'LOW',
                detect: (code) => {
                    // Detect imported modules that are never used
                    const imports = code.match(/(?:import|require)\s*\(?\s*['"]([^'"]+)['"]\)?/g);
                    if (!imports) return false;
                    
                    for (const importStmt of imports) {
                        const match = importStmt.match(/['"]([^'"]+)['"]/);
                        if (!match) continue;
                        
                        const moduleName = match[1].split('/').pop().replace(/\.(js|ts)$/, '');
                        const usageRegex = new RegExp(`\\b${moduleName}\\b`, 'g');
                        const usages = (code.match(usageRegex) || []).length;
                        
                        if (usages <= 1) return true; // Only appears in import
                    }
                    return false;
                },
                message: 'Unused imports or variables detected',
                recommendation: 'Remove unused imports to reduce bundle size and improve clarity.',
                example: `// Bad:
import axios from 'axios'; // Never used
import lodash from 'lodash'; // Never used

// Good:
import axios from 'axios';
axios.get('/api/data');`,
                autoFix: false
            },

            // Additional OOP Patterns
            {
                id: 'MISSING_OBSERVER_PATTERN',
                name: 'Missing Observer/Event Pattern',
                severity: 'MEDIUM',
                detect: (code) => {
                    // Detect direct callbacks that should use event emitters
                    const callbackCount = (code.match(/\.on\w+\s*=\s*function|addEventListener/g) || []).length;
                    const directCallbacks = (code.match(/callback\s*\(/g) || []).length;
                    return directCallbacks > 3 && callbackCount === 0;
                },
                message: 'Multiple callbacks without event system - consider Observer pattern',
                recommendation: 'Use EventEmitter or Observer pattern for decoupled communication between objects.',
                example: `// Bad - tight coupling:
class Service {
    process(callback1, callback2, callback3) {
        callback1();
        callback2();
        callback3();
    }
}

// Good - Observer pattern:
class Service extends EventEmitter {
    process() {
        this.emit('started');
        this.emit('processing');
        this.emit('completed');
    }
}
service.on('completed', handleComplete);`,
                autoFix: false
            },
            {
                id: 'MISSING_BUILDER_PATTERN',
                name: 'Complex Constructor - Use Builder Pattern',
                severity: 'MEDIUM',
                detect: (code) => {
                    // Detect constructors with >5 parameters
                    const constructorMatch = code.match(/constructor\s*\(([^)]+)\)/g);
                    if (!constructorMatch) return false;
                    
                    for (const constructor of constructorMatch) {
                        const params = constructor.match(/\(([^)]+)\)/)[1].split(',').length;
                        if (params > 5) return true;
                    }
                    return false;
                },
                message: 'Constructor has too many parameters - use Builder pattern',
                recommendation: 'Constructors with >5 parameters are hard to use. Use Builder pattern for flexible object construction.',
                example: `// Bad:
class User {
    constructor(name, email, age, city, country, zip, phone) { }
}

// Good - Builder pattern:
class UserBuilder {
    setName(name) { this.name = name; return this; }
    setEmail(email) { this.email = email; return this; }
    build() { return new User(this); }
}
const user = new UserBuilder()
    .setName('John')
    .setEmail('john@example.com')
    .build();`,
                autoFix: false
            },
            {
                id: 'MISSING_ADAPTER_PATTERN',
                name: 'Direct Third-Party API Usage',
                severity: 'LOW',
                detect: (code) => {
                    // Detect direct usage of third-party libraries throughout code
                    const thirdPartyAPIs = ['axios', 'fetch', 'firebase', 'stripe', 'sendgrid'];
                    for (const api of thirdPartyAPIs) {
                        const usages = (code.match(new RegExp(`\\b${api}\\.[a-z]+`, 'g')) || []).length;
                        if (usages > 5) return true; // Used directly in many places
                    }
                    return false;
                },
                message: 'Third-party API used directly - wrap with Adapter pattern',
                recommendation: 'Wrap third-party libraries with your own adapter/facade. This isolates changes and makes testing easier.',
                example: `// Bad - axios used everywhere:
axios.get('/users');
axios.post('/users');
// ... 50 more axios calls

// Good - Adapter:
class ApiClient {
    getUsers() { return axios.get('/users'); }
    createUser(data) { return axios.post('/users', data); }
}
const api = new ApiClient();
api.getUsers();`,
                autoFix: false
            },
            {
                id: 'ANEMIC_DOMAIN_MODEL',
                name: 'Anemic Domain Model',
                severity: 'MEDIUM',
                detect: (code) => {
                    // Detect classes with only getters/setters and no business logic
                    const classMatch = code.match(/class\s+\w+\s*{([^}]+)}/g);
                    if (!classMatch) return false;
                    
                    for (const classCode of classMatch) {
                        const gettersSetters = (classCode.match(/get\s+\w+|set\s+\w+/g) || []).length;
                        const methods = (classCode.match(/\w+\s*\([^)]*\)\s*{/g) || []).length;
                        const businessLogic = methods - gettersSetters;
                        
                        if (gettersSetters > 3 && businessLogic === 0) return true;
                    }
                    return false;
                },
                message: 'Anemic domain model - class has only getters/setters with no business logic',
                recommendation: 'Add business logic to domain models. Objects should encapsulate both data AND behavior (rich domain model).',
                example: `// Bad - anemic:
class Order {
    get total() { return this.#total; }
    set total(value) { this.#total = value; }
}
// Business logic elsewhere
function calculateTotal(order) { }

// Good - rich domain:
class Order {
    calculateTotal() {
        return this.items.reduce((sum, item) => 
            sum + item.price * item.quantity, 0);
    }
    applyDiscount(code) { /* discount logic */ }
}`,
                autoFix: false
            },
            {
                id: 'MISSING_COMMAND_PATTERN',
                name: 'Missing Command Pattern for Operations',
                severity: 'LOW',
                detect: (code) => {
                    // Detect undo/redo logic without Command pattern
                    return /undo|redo/gi.test(code) && !/class\s+\w*Command/gi.test(code);
                },
                message: 'Undo/redo functionality without Command pattern',
                recommendation: 'Use Command pattern to encapsulate operations with undo/redo support.',
                example: `// Bad:
let lastAction;
function undo() { /* complex undo logic */ }

// Good - Command pattern:
class Command {
    execute() { }
    undo() { }
}
class AddItemCommand extends Command {
    execute() { this.list.add(this.item); }
    undo() { this.list.remove(this.item); }
}
const history = [];
history[history.length - 1].undo();`,
                autoFix: false
            }
        ];
    }

    scan(code, filePath) {
        const issues = [];
        const fileExtension = filePath.split('.').pop();

        // Only scan OOP-relevant files
        if (!['js', 'ts', 'jsx', 'tsx', 'php', 'java', 'cs', 'py'].includes(fileExtension)) {
            return issues;
        }

        for (const pattern of this.patterns) {
            let matches = [];

            if (pattern.regex) {
                // Regex-based detection
                matches = [...code.matchAll(pattern.regex)];
            } else if (pattern.detect) {
                // Custom detection function
                if (pattern.detect(code)) {
                    matches = [{ index: 0 }]; // Dummy match to trigger issue
                }
            }

            for (const match of matches) {
                const line = this.getLineNumber(code, match.index);
                const column = this.getColumnNumber(code, match.index);

                issues.push({
                    type: 'OOP',
                    severity: pattern.severity,
                    id: pattern.id,
                    name: pattern.name,
                    message: pattern.message,
                    recommendation: pattern.recommendation,
                    example: pattern.example,
                    file: filePath,
                    line: line,
                    column: column,
                    autoFix: pattern.autoFix || false,
                    fix: pattern.fix
                });
            }
        }

        return issues;
    }

    getLineNumber(code, index) {
        return code.substring(0, index).split('\n').length;
    }

    getColumnNumber(code, index) {
        const lastNewline = code.lastIndexOf('\n', index);
        return index - lastNewline;
    }
}

module.exports = OOPScanner;
