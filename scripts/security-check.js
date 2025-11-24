const fs = require("fs");
const path = require("path");

/**
 * Security audit script for PrivacyPreservingMarketplace
 * Checks for common vulnerabilities and best practices
 */

const CHECKS = {
    PASSED: 0,
    FAILED: 0,
    WARNINGS: 0
};

function logPass(message) {
    console.log(`✓ ${message}`);
    CHECKS.PASSED++;
}

function logFail(message) {
    console.log(`✗ ${message}`);
    CHECKS.FAILED++;
}

function logWarn(message) {
    console.log(`⚠ ${message}`);
    CHECKS.WARNINGS++;
}

console.log("=== Security Audit: Privacy-Preserving Marketplace ===\n");

// === CHECK 1: Environment Variables ===
console.log("[1] Environment Variable Security");

if (fs.existsSync(".env")) {
    logWarn(".env file exists - ensure it's in .gitignore");

    const envContent = fs.readFileSync(".env", "utf8");

    // Check for exposed private keys
    if (envContent.includes("PRIVATE_KEY=0x") && envContent.includes("PRIVATE_KEY=0x1") === false) {
        logFail("Potential real private key detected in .env");
    } else {
        logPass("No exposed private keys detected");
    }
} else {
    logPass(".env file not found (using .env.example only)");
}

// Check .gitignore
if (fs.existsSync(".gitignore")) {
    const gitignore = fs.readFileSync(".gitignore", "utf8");
    if (gitignore.includes(".env")) {
        logPass(".env is properly gitignored");
    } else {
        logFail(".env is NOT gitignored - security risk!");
    }
} else {
    logWarn(".gitignore file not found");
}

console.log();

// === CHECK 2: Contract Security Patterns ===
console.log("[2] Smart Contract Security Patterns");

const contractPath = path.join(__dirname, "..", "contracts", "PrivacyPreservingMarketplace.sol");

if (fs.existsSync(contractPath)) {
    const contractCode = fs.readFileSync(contractPath, "utf8");

    // Check for ReentrancyGuard
    if (contractCode.includes("ReentrancyGuard")) {
        logPass("ReentrancyGuard protection implemented");
    } else {
        logFail("Missing ReentrancyGuard - reentrancy vulnerability!");
    }

    // Check for AccessControl
    if (contractCode.includes("AccessControl")) {
        logPass("AccessControl role-based security implemented");
    } else {
        logWarn("No AccessControl - consider adding role-based permissions");
    }

    // Check for overflow protection (Solidity 0.8+)
    if (contractCode.includes("pragma solidity ^0.8")) {
        logPass("Using Solidity 0.8+ (built-in overflow protection)");
    } else {
        logFail("Not using Solidity 0.8+ - overflow vulnerability!");
    }

    // Check for timeout protection
    if (contractCode.includes("DECRYPTION_TIMEOUT")) {
        logPass("Timeout protection mechanism implemented");
    } else {
        logWarn("No timeout protection - funds could be locked");
    }

    // Check for refund mechanism
    if (contractCode.includes("processRefund")) {
        logPass("Refund mechanism implemented");
    } else {
        logWarn("No refund mechanism - user funds at risk");
    }

    // Check for input validation
    const validationCount = (contractCode.match(/require\(/g) || []).length;
    if (validationCount >= 10) {
        logPass(`Input validation present (${validationCount} require statements)`);
    } else {
        logWarn(`Limited input validation (${validationCount} require statements)`);
    }

    // Check for events
    const eventCount = (contractCode.match(/emit /g) || []).length;
    if (eventCount >= 5) {
        logPass(`Comprehensive event logging (${eventCount} emit statements)`);
    } else {
        logWarn(`Limited event logging (${eventCount} emit statements)`);
    }

} else {
    logFail("Contract file not found!");
}

console.log();

// === CHECK 3: Test Coverage ===
console.log("[3] Test Coverage");

const testPath = path.join(__dirname, "..", "test", "PrivacyPreservingMarketplace.test.js");

if (fs.existsSync(testPath)) {
    const testCode = fs.readFileSync(testPath, "utf8");

    const testCount = (testCode.match(/it\(/g) || []).length;
    const describeCount = (testCode.match(/describe\(/g) || []).length;

    console.log(`  Test suites: ${describeCount}`);
    console.log(`  Test cases: ${testCount}`);

    if (testCount >= 30) {
        logPass(`Comprehensive test coverage (${testCount} tests)`);
    } else if (testCount >= 15) {
        logWarn(`Moderate test coverage (${testCount} tests) - add more tests`);
    } else {
        logFail(`Insufficient test coverage (${testCount} tests)`);
    }

    // Check for critical test categories
    if (testCode.includes("Timeout Protection")) {
        logPass("Timeout protection tests included");
    } else {
        logFail("Missing timeout protection tests");
    }

    if (testCode.includes("Refund Mechanism")) {
        logPass("Refund mechanism tests included");
    } else {
        logFail("Missing refund mechanism tests");
    }

    if (testCode.includes("Gateway Callback")) {
        logPass("Gateway callback tests included");
    } else {
        logFail("Missing Gateway callback tests");
    }

} else {
    logFail("Test file not found!");
}

console.log();

// === CHECK 4: Dependency Security ===
console.log("[4] Dependency Security");

const packagePath = path.join(__dirname, "..", "package.json");

if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    // Check for OpenZeppelin
    if (packageJson.dependencies && packageJson.dependencies["@openzeppelin/contracts"]) {
        logPass("Using OpenZeppelin contracts (audited libraries)");
    } else {
        logWarn("Not using OpenZeppelin - consider using audited libraries");
    }

    // Check for hardhat-gas-reporter
    if (packageJson.devDependencies && packageJson.devDependencies["hardhat-gas-reporter"]) {
        logPass("Gas reporter configured for optimization monitoring");
    } else {
        logWarn("No gas reporter - add for gas optimization");
    }

    // Check for solidity-coverage
    if (packageJson.devDependencies && packageJson.devDependencies["solidity-coverage"]) {
        logPass("Coverage tool configured");
    } else {
        logWarn("No coverage tool - add solidity-coverage");
    }

} else {
    logFail("package.json not found!");
}

console.log();

// === CHECK 5: Hardhat Configuration ===
console.log("[5] Hardhat Configuration Security");

const configPath = path.join(__dirname, "..", "hardhat.config.js");

if (fs.existsSync(configPath)) {
    const configCode = fs.readFileSync(configPath, "utf8");

    // Check for optimizer
    if (configCode.includes("optimizer")) {
        logPass("Solidity optimizer configured");
    } else {
        logWarn("Optimizer not configured - gas costs may be high");
    }

    // Check for gas reporter
    if (configCode.includes("gasReporter")) {
        logPass("Gas reporter plugin configured");
    } else {
        logWarn("Gas reporter not configured");
    }

    // Check for proper network configuration
    if (configCode.includes("process.env.SEPOLIA_RPC_URL")) {
        logPass("Environment-based network configuration");
    } else {
        logWarn("Hardcoded network URLs - use environment variables");
    }

} else {
    logFail("hardhat.config.js not found!");
}

console.log();

// === CHECK 6: Documentation ===
console.log("[6] Documentation Quality");

const readmePath = path.join(__dirname, "..", "README.md");
const archPath = path.join(__dirname, "..", "docs", "ARCHITECTURE.md");
const apiPath = path.join(__dirname, "..", "docs", "API.md");

if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, "utf8");
    if (readme.length > 500) {
        logPass("README.md exists with substantial content");
    } else {
        logWarn("README.md exists but lacks detail");
    }
} else {
    logWarn("README.md not found");
}

if (fs.existsSync(archPath)) {
    logPass("ARCHITECTURE.md documentation exists");
} else {
    logWarn("ARCHITECTURE.md not found - document system design");
}

if (fs.existsSync(apiPath)) {
    logPass("API.md documentation exists");
} else {
    logWarn("API.md not found - document API interfaces");
}

console.log();

// === SUMMARY ===
console.log("=".repeat(60));
console.log("SECURITY AUDIT SUMMARY");
console.log("=".repeat(60));
console.log(`✓ Passed:   ${CHECKS.PASSED}`);
console.log(`⚠ Warnings: ${CHECKS.WARNINGS}`);
console.log(`✗ Failed:   ${CHECKS.FAILED}`);
console.log("=".repeat(60));

if (CHECKS.FAILED > 0) {
    console.log("\n❌ SECURITY AUDIT FAILED - Address critical issues before deployment!");
    process.exit(1);
} else if (CHECKS.WARNINGS > 3) {
    console.log("\n⚠️  SECURITY AUDIT PASSED WITH WARNINGS - Review warnings before deployment");
    process.exit(0);
} else {
    console.log("\n✅ SECURITY AUDIT PASSED - Project meets security standards");
    process.exit(0);
}
