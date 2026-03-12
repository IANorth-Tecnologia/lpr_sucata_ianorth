const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create reports directory if it doesn't exist
const reportsDir = './reports';
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const days = process.env.REVIEW_DAYS || 1;
const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

try {
  // Get commits since date
  const commits = execSync(
    `git log --since="${since}" --pretty=format:"%H|%an|%ae|%s|%b"`,
    { encoding: 'utf-8' }
  ).split('\n').filter(Boolean);

  let changelog = '### Summary\n\n';
  const changes = {
    features: [],
    fixes: [],
    refactoring: [],
    docs: [],
    other: []
  };

  commits.forEach(commit => {
    const [hash, author, email, subject, body] = commit.split('|');
    
    if (subject.startsWith('feat:') || subject.startsWith('add:')) {
      changes.features.push({ hash: hash.slice(0, 7), author, subject, body });
    } else if (subject.startsWith('fix:')) {
      changes.fixes.push({ hash: hash.slice(0, 7), author, subject, body });
    } else if (subject.startsWith('refactor:')) {
      changes.refactoring.push({ hash: hash.slice(0, 7), author, subject, body });
    } else if (subject.startsWith('docs:')) {
      changes.docs.push({ hash: hash.slice(0, 7), author, subject, body });
    } else {
      changes.other.push({ hash: hash.slice(0, 7), author, subject, body });
    }
  });

  let report = `Total commits analyzed: ${commits.length}\n\n`;

  if (changes.features.length > 0) {
    report += `#### ✨ Features (${changes.features.length})\n`;
    changes.features.forEach(c => {
      report += `- \`${c.hash}\` **${c.author}**: ${c.subject}\n`;
      if (c.body) report += `  > ${c.body.slice(0, 100)}...\n`;
    });
    report += '\n';
  }

  if (changes.fixes.length > 0) {
    report += `#### 🐛 Bug Fixes (${changes.fixes.length})\n`;
    changes.fixes.forEach(c => {
      report += `- \`${c.hash}\` **${c.author}**: ${c.subject}\n`;
      if (c.body) report += `  > ${c.body.slice(0, 100)}...\n`;
    });
    report += '\n';
  }

  if (changes.refactoring.length > 0) {
    report += `#### ♻️ Refactoring (${changes.refactoring.length})\n`;
    changes.refactoring.forEach(c => {
      report += `- \`${c.hash}\` **${c.author}**: ${c.subject}\n`;
    });
    report += '\n';
  }

  if (changes.docs.length > 0) {
    report += `#### 📚 Documentation (${changes.docs.length})\n`;
    changes.docs.forEach(c => {
      report += `- \`${c.hash}\` **${c.author}**: ${c.subject}\n`;
    });
    report += '\n';
  }

  if (changes.other.length > 0) {
    report += `#### 📦 Other (${changes.other.length})\n`;
    changes.other.forEach(c => {
      report += `- \`${c.hash}\` **${c.author}**: ${c.subject}\n`;
    });
  }

  fs.writeFileSync(path.join(reportsDir, 'changelog.md'), report);
  console.log('✅ Changelog generated successfully');
} catch (error) {
  console.error('❌ Error analyzing commits:', error.message);
  fs.writeFileSync(path.join(reportsDir, 'changelog.md'), '### No commits found for the review period');
}