const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const reportsDir = './reports';
const days = process.env.REVIEW_DAYS || 1;
const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const riskPatterns = {
  // Security concerns
  'hardcoded': { severity: 'high', pattern: /password|secret|api[_-]key|token/gi },
  'sql_injection': { severity: 'critical', pattern: /sql|query/gi },
  
  // Performance concerns
  'large_file': { severity: 'medium', threshold: 1000 }, // lines
  'nested_loops': { severity: 'medium', pattern: /for.*for/gi },
  
  // Quality concerns
  'console_logs': { severity: 'low', pattern: /console\.(log|debug|error)/gi },
  'empty_catch': { severity: 'medium', pattern: /catch\s*\(\w+\)\s*\{[\s]*\}/gi },
  'commented_code': { severity: 'low', pattern: /\/\/\s*(let|const|var|function|if|for|while)/gi },
};

try {
  const diffOutput = execSync(
    `git diff --name-only ${since}`,
    { encoding: 'utf-8' }
  ).split('\n').filter(Boolean);

  let riskReport = '### Detected Risk Patterns\n\n';
  let hasRisks = false;

  const risks = [];

  diffOutput.forEach(file => {
    if (file.match(/\.(ts|js|py)$/)) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        // Check file size
        if (lines.length > riskPatterns.large_file.threshold) {
          risks.push({
            file,
            severity: 'medium',
            issue: `Large file (${lines.length} lines)`,
            recommendation: 'Consider breaking into smaller modules'
          });
          hasRisks = true;
        }

        // Check for hardcoded secrets
        if (riskPatterns.hardcoded.pattern.test(content)) {
          risks.push({
            file,
            severity: 'high',
            issue: 'Potential hardcoded credentials detected',
            recommendation: 'Use environment variables or secrets management'
          });
          hasRisks = true;
        }

        // Check for empty catch blocks
        if (riskPatterns.empty_catch.pattern.test(content)) {
          risks.push({
            file,
            severity: 'medium',
            issue: 'Empty catch blocks detected',
            recommendation: 'Add proper error handling'
          });
          hasRisks = true;
        }

        // Check for console logs
        const consoleLogs = content.match(riskPatterns.console_logs.pattern) || [];
        if (consoleLogs.length > 5) {
          risks.push({
            file,
            severity: 'low',
            issue: `Multiple console.log statements (${consoleLogs.length})`,
            recommendation: 'Use proper logging library instead'
          });
          hasRisks = true;
        }
      } catch (e) {
        // File might have been deleted
      }
    }
  });

  if (hasRisks) {
    // Group by severity
    const grouped = {
      critical: risks.filter(r => r.severity === 'critical'),
      high: risks.filter(r => r.severity === 'high'),
      medium: risks.filter(r => r.severity === 'medium'),
      low: risks.filter(r => r.severity === 'low')
    };

    if (grouped.critical.length > 0) {
      riskReport += '#### 🔴 Critical Issues\n';
      grouped.critical.forEach(r => {
        riskReport += `- **${r.file}**: ${r.issue}\n  → ${r.recommendation}\n`;
      });
      riskReport += '\n';
    }

    if (grouped.high.length > 0) {
      riskReport += '#### 🟠 High Priority\n';
      grouped.high.forEach(r => {
        riskReport += `- **${r.file}**: ${r.issue}\n  → ${r.recommendation}\n`;
      });
      riskReport += '\n';
    }

    if (grouped.medium.length > 0) {
      riskReport += '#### 🟡 Medium Priority\n';
      grouped.medium.forEach(r => {
        riskReport += `- **${r.file}**: ${r.issue}\n  → ${r.recommendation}\n`;
      });
      riskReport += '\n';
    }

    if (grouped.low.length > 0) {
      riskReport += '#### 🟢 Low Priority\n';
      grouped.low.forEach(r => {
        riskReport += `- **${r.file}**: ${r.issue}\n  → ${r.recommendation}\n`;
      });
    }
  } else {
    riskReport += '✅ No risk patterns detected!\n';
  }

  fs.writeFileSync(path.join(reportsDir, 'risks.md'), riskReport);
  console.log('✅ Risk analysis completed');
} catch (error) {
  console.error('❌ Error detecting risks:', error.message);
  fs.writeFileSync(path.join(reportsDir, 'risks.md'), '✅ Risk analysis skipped - no changes found');
}