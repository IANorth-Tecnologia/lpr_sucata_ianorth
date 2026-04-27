const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const reportsDir = './reports';
const days = process.env.REVIEW_DAYS || 1;
const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

try {
  // Get changed files
  const changedFiles = execSync(
    `git diff --name-only ${since}`,
    { encoding: 'utf-8' }
  ).split('\n').filter(Boolean);

  // Get test files
  const testFiles = execSync(
    `git diff --name-only ${since}`,
    { encoding: 'utf-8' }
  ).split('\n').filter(f => f.match(/\.(test|spec)\.(ts|js)$/));

  let testReport = '### Test Coverage Analysis\n\n';

  const sourceFiles = changedFiles.filter(f => 
    f.match(/\.(ts|js)$/) && !f.match(/\.(test|spec)\.(ts|js)$/) && !f.match(/node_modules/)
  );

  const missingTests = sourceFiles.filter(file => {
    const testFile = file
      .replace(/\.(ts|js)$/, '.test.$1')
      .replace(/\.(ts|js)$/, '.spec.$1');
    return !testFiles.includes(testFile) && !testFiles.includes(testFile.replace(/src\//, 'tests/'));
  });

  testReport += `#### Summary\n`;
  testReport += `- Files changed: ${sourceFiles.length}\n`;
  testReport += `- Test files updated: ${testFiles.length}\n`;
  testReport += `- Test coverage ratio: ${testFiles.length > 0 ? ((testFiles.length / sourceFiles.length) * 100).toFixed(2) : 0}%\n\n`;

  if (missingTests.length > 0) {
    testReport += `#### ⚠️ Missing Test Coverage (${missingTests.length})\n`;
    testReport += `The following files were modified but don't have corresponding test files:\n\n`;
    missingTests.forEach(file => {
      testReport += `- \`${file}\`\n`;
    });
    testReport += `\n**Recommendation**: Add tests for these files to improve coverage\n`;
  } else {
    testReport += `#### ✅ Great! All modified files have test coverage\n`;
  }

  fs.writeFileSync(path.join(reportsDir, 'tests.md'), testReport);
  console.log('✅ Test coverage analysis completed');
} catch (error) {
  console.error('❌ Error checking tests:', error.message);
  fs.writeFileSync(path.join(reportsDir, 'tests.md'), '### Test analysis skipped - unable to determine coverage');
}